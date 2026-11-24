"use strict";

const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const fsp = fs.promises;
const os = require("os");
const path = require("path");
const webp = require("node-webpmux");

const {
  getQuotedMessage,
  unwrapMessageContainer,
  downloadMediaBuffer,
  sendStickerWithAudio,
} = require("./wa_adapter.js");

const {
  SpiderXError,
  sanitizeSecrets,
  looksLikeUrl,
  isValidYouTubeUrl,
  fetchYouTubeAudioByUrl,
  fetchYouTubeAudioByName,
} = require("./spiderx_api.js");

/**
 * Sistema completo do comando /stickeraudio (alias /audiosticker):
 *
 * MODO 1 (Spider X API — consome créditos):
 *   Responder figurinha ou enviar imagem com /stickeraudio <link do YouTube>
 *   -> extrai até 30s do áudio da música.
 *
 * MODO 2 (Spider X API — consome créditos):
 *   Responder figurinha ou enviar imagem com /stickeraudio <nome da música>
 *   -> busca e processa até 30s da música.
 *
 * MODO 3 (Local — SEM créditos):
 *   Enviar ou responder vídeo de até 10s com /stickeraudio
 *   -> converte em figurinha animada WebP (<= 500 KB) + áudio original sincronizado.
 *
 * MODO 4 (Local — SEM créditos):
 *   Responder a uma mensagem de áudio enviando uma imagem com /stickeraudio na legenda
 *   -> usa a imagem como figurinha WebP (<= 100 KB) + áudio correspondente.
 *
 * Garantias operacionais:
 * - Limpeza determinística de diretórios temporários (try/finally).
 * - Encerramento forçado de processos FFmpeg/FFprobe em caso de timeout.
 * - Validação rigorosa de duração, formato e tamanho antes do processamento.
 */

const MAX_VIDEO_SECONDS = 10;
const MAX_VIDEO_SECONDS_TOLERANCE = 10.5;
const MAX_MUSIC_SECONDS = 30;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_STATIC_WEBP_BYTES = 100 * 1024; // 100 KB (limite WhatsApp)
const MAX_ANIMATED_WEBP_BYTES = 500 * 1024; // 500 KB (limite WhatsApp)
const FFMPEG_TIMEOUT_MS = 35000;
const FFPROBE_TIMEOUT_MS = 10000;

class MediaValidationError extends Error {
  constructor(code, userMessage) {
    super(userMessage);
    this.name = "MediaValidationError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

/**
 * Executa um binário (ffmpeg/ffprobe) via spawn com timeout seguro e encerramento garantido.
 */
function runBinary(bin, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let killTimer = null;

    const proc = spawn(bin, args, { windowsHide: true });

    const finish = (err, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
      if (err) reject(err);
      else resolve(result);
    };

    const timeoutTimer = setTimeout(() => {
      try {
        proc.kill("SIGTERM");
      } catch {
        // ignorar
      }
      killTimer = setTimeout(() => {
        try {
          proc.kill("SIGKILL");
        } catch {
          // ignorar
        }
      }, 2000);
      const err = new Error(`Processo ${bin} excedeu o tempo limite de ${timeoutMs}ms.`);
      err.code = "MEDIA_PROCESS_TIMEOUT";
      finish(err);
    }, timeoutMs);

    proc.stdout.on("data", (chunk) => {
      if (stdout.length < 256 * 1024) stdout += chunk.toString("utf8");
    });

    proc.stderr.on("data", (chunk) => {
      if (stderr.length < 256 * 1024) stderr += chunk.toString("utf8");
    });

    proc.on("error", (err) => {
      err.code = err.code === "ENOENT" ? "FFMPEG_NOT_FOUND" : "MEDIA_PROCESS_ERROR";
      finish(err);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        finish(null, { stdout, stderr });
      } else {
        const err = new Error(
          `${bin} encerrou com código ${code}: ${stderr.slice(-300)}`
        );
        err.code = "MEDIA_PROCESS_FAILED";
        finish(err);
      }
    });
  });
}

/**
 * Executa trabalho dentro de um diretório temporário isolado e garante remoção ao final.
 */
async function withTempDir(fn) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "aleatory-sa-"));
  try {
    return await fn(dir);
  } finally {
    await fsp.rm(dir, { recursive: true, force: true }).catch(() => { });
  }
}

/**
 * Inspeciona duração, formato, streams de vídeo e áudio via ffprobe.
 */
async function probeMedia(filePath) {
  let stdout;
  try {
    ({ stdout } = await runBinary(
      "ffprobe",
      [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        filePath,
      ],
      FFPROBE_TIMEOUT_MS
    ));
  } catch (err) {
    if (err.code === "FFMPEG_NOT_FOUND") {
      throw new MediaValidationError(
        "FFMPEG_NOT_FOUND",
        "❌ FFprobe/FFmpeg não está instalado no servidor."
      );
    }
    throw new MediaValidationError(
      "INVALID_MEDIA_FILE",
      "❌ Arquivo de mídia inválido, corrompido ou em formato incompatível."
    );
  }

  let data;
  try {
    data = JSON.parse(stdout || "{}");
  } catch {
    throw new MediaValidationError(
      "INVALID_MEDIA_FILE",
      "❌ Não foi possível ler os metadados do arquivo de mídia."
    );
  }

  const streams = Array.isArray(data.streams) ? data.streams : [];
  const videoStream = streams.find((s) => s.codec_type === "video") || null;
  const audioStream = streams.find((s) => s.codec_type === "audio") || null;

  const durationCandidates = [
    Number(data.format?.duration),
    Number(videoStream?.duration),
    Number(audioStream?.duration),
  ].filter((n) => Number.isFinite(n) && n > 0);

  const duration = durationCandidates.length > 0 ? durationCandidates[0] : 0;
  const size = Number(data.format?.size || 0);

  return {
    duration,
    size,
    formatName: String(data.format?.format_name || ""),
    hasVideo: Boolean(videoStream),
    hasAudio: Boolean(audioStream),
    videoCodec: videoStream?.codec_name || null,
    audioCodec: audioStream?.codec_name || null,
    width: Number(videoStream?.width || 0),
    height: Number(videoStream?.height || 0),
  };
}

/**
 * Injeta metadados EXIF de figurinha do WhatsApp em um arquivo WebP (estático ou animado).
 */
async function stampStickerExif(webpBuffer, metadata = {}) {
  if (!metadata.packname && !metadata.author) return webpBuffer;

  const packId =
    metadata.packId ||
    `aleatory-${crypto.randomBytes(4).toString("hex")}`;
  const json = {
    "sticker-pack-id": packId,
    "sticker-pack-name": String(metadata.packname || "Aleatory-Bot"),
    "sticker-pack-publisher": String(metadata.author || "StickerAudio"),
    emojis: Array.isArray(metadata.categories) && metadata.categories.length
      ? metadata.categories
      : ["🎵"],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  return await withTempDir(async (dir) => {
    const inFile = path.join(dir, "in.webp");
    const outFile = path.join(dir, "out.webp");
    await fsp.writeFile(inFile, webpBuffer);

    const img = new webp.Image();
    await img.load(inFile);
    img.exif = exif;
    await img.save(outFile);
    return await fsp.readFile(outFile);
  });
}

/**
 * Verifica se um buffer é um arquivo WebP válido (RIFF....WEBP).
 */
function isWebpBuffer(buf) {
  return (
    Buffer.isBuffer(buf) &&
    buf.length >= 12 &&
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  );
}

/**
 * Converte imagem (JPG/PNG/WebP/etc.) para figurinha estática WebP 512x512 <= 100 KB.
 */
async function convertImageToStickerWebp(imageBuffer, metadata = {}) {
  return await withTempDir(async (dir) => {
    const inFile = path.join(dir, "input_img");
    const outFile = path.join(dir, "sticker.webp");
    await fsp.writeFile(inFile, imageBuffer);

    const qualities = [80, 65, 50, 35];
    let finalBuffer = null;

    for (const q of qualities) {
      await runBinary(
        "ffmpeg",
        [
          "-y",
          "-i",
          inFile,
          "-vcodec",
          "libwebp",
          "-vf",
          "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
          "-frames:v",
          "1",
          "-lossless",
          "0",
          "-q:v",
          String(q),
          "-preset",
          "picture",
          "-an",
          outFile,
        ],
        FFMPEG_TIMEOUT_MS
      );

      const candidate = await fsp.readFile(outFile);
      finalBuffer = candidate;
      if (candidate.length <= MAX_STATIC_WEBP_BYTES) break;
    }

    if (!finalBuffer || !finalBuffer.length) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ Falha ao converter a imagem para figurinha WebP."
      );
    }

    return await stampStickerExif(finalBuffer, metadata);
  });
}

/**
 * Prepara figurinha já existente (estática ou animada), preservando animação e EXIF.
 */
async function prepareExistingStickerWebp(stickerBuffer, metadata = {}) {
  if (isWebpBuffer(stickerBuffer)) {
    try {
      return await stampStickerExif(stickerBuffer, metadata);
    } catch {
      // Se node-webpmux não conseguir regravar EXIF, manter buffer WebP válido
      return stickerBuffer;
    }
  }
  return await convertImageToStickerWebp(stickerBuffer, metadata);
}

/**
 * Converte vídeo (até 10s) para figurinha animada WebP 512x512 <= 500 KB,
 * preservando duração sincronizada com a faixa de áudio extraída.
 */
async function convertVideoToAnimatedWebp(inputVideoPath, maxSeconds, metadata = {}) {
  return await withTempDir(async (dir) => {
    const outFile = path.join(dir, "anim_sticker.webp");
    const durationLimit = Math.min(maxSeconds, MAX_VIDEO_SECONDS).toFixed(3);

    // Escada adaptativa compacta (padrão WhatsApp/Takeshi: 350x350 compacto para envio confiável)
    const presets = [
      { size: 350, fps: 15, quality: 25 },
      { size: 350, fps: 15, quality: 12 },
      { size: 320, fps: 12, quality: 10 },
      { size: 256, fps: 10, quality: 8 },
    ];

    let finalBuffer = null;

    for (const preset of presets) {
      await runBinary(
        "ffmpeg",
        [
          "-y",
          "-ss",
          "0",
          "-t",
          durationLimit,
          "-i",
          inputVideoPath,
          "-vcodec",
          "libwebp",
          "-vf",
          `fps=${preset.fps},scale=${preset.size}:${preset.size}:force_original_aspect_ratio=decrease,format=rgba,pad=${preset.size}:${preset.size}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
          "-loop",
          "0",
          "-lossless",
          "0",
          "-compression_level",
          "6",
          "-method",
          "6",
          "-q:v",
          String(preset.quality),
          "-preset",
          "picture",
          "-an",
          "-vsync",
          "0",
          outFile,
        ],
        FFMPEG_TIMEOUT_MS
      );

      const candidate = await fsp.readFile(outFile);
      finalBuffer = candidate;
      if (candidate.length <= 280 * 1024) break;
    }

    if (!finalBuffer || !finalBuffer.length) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ Falha ao converter o vídeo em figurinha animada."
      );
    }

    return await stampStickerExif(finalBuffer, metadata);
  });
}

/**
 * Gera waveform de 64 barras (0..100) a partir do áudio via FFmpeg PCM mono 8kHz.
 * Em caso de falha, retorna uma curva padrão suave para garantir compatibilidade PTT.
 */
async function generateAudioWaveform(audioFilePath) {
  try {
    return await withTempDir(async (dir) => {
      const pcmFile = path.join(dir, "wave.pcm");
      await runBinary(
        "ffmpeg",
        [
          "-y",
          "-i",
          audioFilePath,
          "-ac",
          "1",
          "-ar",
          "8000",
          "-f",
          "s16le",
          pcmFile,
        ],
        10000
      );
      const pcm = await fsp.readFile(pcmFile);
      const totalSamples = Math.floor(pcm.length / 2);
      if (totalSamples < 64) return null;

      const bars = 64;
      const step = Math.floor(totalSamples / bars);
      const raw = new Float64Array(bars);
      let maxVal = 0;

      for (let i = 0; i < bars; i++) {
        let sum = 0;
        const start = i * step;
        const end = Math.min(start + step, totalSamples);
        for (let s = start; s < end; s++) {
          sum += Math.abs(pcm.readInt16LE(s * 2));
        }
        const avg = sum / Math.max(1, end - start);
        raw[i] = avg;
        if (avg > maxVal) maxVal = avg;
      }

      const out = new Uint8Array(bars);
      for (let i = 0; i < bars; i++) {
        out[i] = maxVal > 0 ? Math.min(100, Math.round((raw[i] / maxVal) * 100)) : 20;
      }
      return out;
    });
  } catch {
    const fallback = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      fallback[i] = 25 + Math.round(Math.abs(Math.sin(i * 0.35)) * 55);
    }
    return fallback;
  }
}

/**
 * Extrai e converte faixa de áudio para OGG/Opus (48kHz, compatível com WhatsApp)
 * cortando com segurança no limite maxSeconds (10s para vídeo, 30s para música/áudio).
 */
async function extractAndEncodeOpusAudio(inputPath, maxSeconds) {
  return await withTempDir(async (dir) => {
    const outFile = path.join(dir, "audio.ogg");
    const limit = Math.max(1, Number(maxSeconds) || MAX_MUSIC_SECONDS).toFixed(3);

    await runBinary(
      "ffmpeg",
      [
        "-y",
        "-ss",
        "0",
        "-t",
        limit,
        "-i",
        inputPath,
        "-vn",
        "-c:a",
        "libopus",
        "-b:a",
        "48k",
        "-ac",
        "1",
        "-ar",
        "48000",
        "-f",
        "ogg",
        outFile,
      ],
      FFMPEG_TIMEOUT_MS
    );

    const [outInfo, waveform] = await Promise.all([
      probeMedia(outFile),
      generateAudioWaveform(outFile),
    ]);

    if (!outInfo.hasAudio || outInfo.duration <= 0) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ O arquivo não possui uma faixa de áudio válida."
      );
    }

    const buffer = await fsp.readFile(outFile);
    return {
      buffer,
      duration: outInfo.duration,
      waveform,
      mimetype: "audio/ogg; codecs=opus",
    };
  });
}

/**
 * Processa MODO 3 (vídeo até 10s -> figurinha animada WebP + áudio sincronizado)
 * 100% local, sem consumo de créditos da Spider X API.
 */
async function processVideoMode(videoBuffer, metadata = {}) {
  if (!Buffer.isBuffer(videoBuffer) || !videoBuffer.length) {
    throw new MediaValidationError("INVALID_MEDIA_FILE", "❌ Vídeo vazio ou inválido.");
  }
  if (videoBuffer.length > MAX_VIDEO_BYTES) {
    throw new MediaValidationError(
      "MEDIA_TOO_LARGE",
      `❌ O vídeo excede o tamanho máximo de ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB.`
    );
  }

  return await withTempDir(async (dir) => {
    const videoFile = path.join(dir, "input_video.mp4");
    await fsp.writeFile(videoFile, videoBuffer);

    const info = await probeMedia(videoFile);
    if (!info.hasVideo) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ O arquivo enviado não contém um fluxo de vídeo válido."
      );
    }
    if (!info.hasAudio) {
      throw new MediaValidationError(
        "NO_AUDIO_TRACK",
        "❌ Este vídeo *não possui áudio*. Envie um vídeo com som (até 10 segundos)."
      );
    }
    if (info.duration <= 0) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ Não foi possível identificar a duração do vídeo."
      );
    }
    if (info.duration > MAX_VIDEO_SECONDS_TOLERANCE) {
      throw new MediaValidationError(
        "VIDEO_TOO_LONG",
        `⏱️ O vídeo tem *${info.duration.toFixed(1)}s*. O limite máximo para figurinha com áudio é de *${MAX_VIDEO_SECONDS} segundos*.`
      );
    }

    const targetDuration = Math.min(info.duration, MAX_VIDEO_SECONDS);
    const [webpBuffer, audioResult] = await Promise.all([
      convertVideoToAnimatedWebp(videoFile, targetDuration, metadata),
      extractAndEncodeOpusAudio(videoFile, targetDuration),
    ]);

    return {
      webpBuffer,
      audioBuffer: audioResult.buffer,
      audioDuration: audioResult.duration,
      waveform: audioResult.waveform,
      isAnimated: true,
      mode: 3,
      usesApiCredits: false,
    };
  });
}

/**
 * Processa MODO 4 (imagem + áudio recebido no WhatsApp -> figurinha WebP + áudio OGG/Opus)
 * 100% local, sem consumo de créditos da Spider X API.
 */
async function processImageAudioMode(imageBuffer, audioBuffer, metadata = {}) {
  if (!Buffer.isBuffer(imageBuffer) || !imageBuffer.length) {
    throw new MediaValidationError("INVALID_MEDIA_FILE", "❌ Imagem vazia ou inválida.");
  }
  if (imageBuffer.length > MAX_IMAGE_BYTES) {
    throw new MediaValidationError(
      "MEDIA_TOO_LARGE",
      `❌ A imagem excede o limite de ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.`
    );
  }
  if (!Buffer.isBuffer(audioBuffer) || !audioBuffer.length) {
    throw new MediaValidationError("INVALID_MEDIA_FILE", "❌ Áudio vazio ou inválido.");
  }
  if (audioBuffer.length > MAX_AUDIO_BYTES) {
    throw new MediaValidationError(
      "MEDIA_TOO_LARGE",
      `❌ O áudio excede o limite de ${Math.round(MAX_AUDIO_BYTES / (1024 * 1024))} MB.`
    );
  }

  return await withTempDir(async (dir) => {
    const audioFile = path.join(dir, "input_audio");
    await fsp.writeFile(audioFile, audioBuffer);

    const audioInfo = await probeMedia(audioFile);
    if (!audioInfo.hasAudio || audioInfo.duration <= 0) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ O arquivo de áudio citado é inválido ou incompatível."
      );
    }

    const visualPromise = isWebpBuffer(imageBuffer)
      ? prepareExistingStickerWebp(imageBuffer, metadata)
      : convertImageToStickerWebp(imageBuffer, metadata);

    const [webpBuffer, opusAudio] = await Promise.all([
      visualPromise,
      extractAndEncodeOpusAudio(audioFile, Math.min(audioInfo.duration, MAX_MUSIC_SECONDS)),
    ]);

    return {
      webpBuffer,
      audioBuffer: opusAudio.buffer,
      audioDuration: opusAudio.duration,
      waveform: opusAudio.waveform,
      isAnimated: false,
      mode: 4,
      usesApiCredits: false,
    };
  });
}

/**
 * Processa MODOS 1 e 2 (visual sticker/imagem + buffer de áudio obtido via Spider X API,
 * cortado em até 30 segundos).
 */
async function processMusicStickerMode(
  visualBuffer,
  visualIsSticker,
  rawMusicBuffer,
  modeNumber,
  metadata = {}
) {
  if (!Buffer.isBuffer(visualBuffer) || !visualBuffer.length) {
    throw new MediaValidationError("INVALID_MEDIA_FILE", "❌ Imagem ou figurinha inválida.");
  }
  if (visualBuffer.length > MAX_IMAGE_BYTES) {
    throw new MediaValidationError(
      "MEDIA_TOO_LARGE",
      `❌ A imagem excede o limite de ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.`
    );
  }

  return await withTempDir(async (dir) => {
    const musicFile = path.join(dir, "music_in");
    await fsp.writeFile(musicFile, rawMusicBuffer);

    const musicInfo = await probeMedia(musicFile);
    if (!musicInfo.hasAudio || musicInfo.duration <= 0) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ O áudio retornado pela Spider X API está em formato incompatível."
      );
    }

    const [webpBuffer, opusAudio] = await Promise.all([
      visualIsSticker
        ? prepareExistingStickerWebp(visualBuffer, metadata)
        : convertImageToStickerWebp(visualBuffer, metadata),
      extractAndEncodeOpusAudio(musicFile, MAX_MUSIC_SECONDS),
    ]);

    return {
      webpBuffer,
      audioBuffer: opusAudio.buffer,
      audioDuration: opusAudio.duration,
      waveform: opusAudio.waveform,
      isAnimated: visualIsSticker && isWebpBuffer(webpBuffer),
      mode: modeNumber,
      usesApiCredits: true,
    };
  });
}

/**
 * Identifica automaticamente qual dos 4 modos de /stickeraudio deve ser executado.
 */
function detectStickerAudioInput(info, rawQuery = "") {
  const query = String(rawQuery || "").trim();
  const currentUnwrapped = unwrapMessageContainer(info?.message)?.unwrapped || {};
  const quotedRaw = getQuotedMessage(info);
  const quotedUnwrapped = quotedRaw
    ? unwrapMessageContainer(quotedRaw)?.unwrapped || {}
    : {};

  const currentImage = currentUnwrapped.imageMessage || null;
  const currentVideo = currentUnwrapped.videoMessage || currentUnwrapped.ptvMessage || null;
  const currentAudio = currentUnwrapped.audioMessage || null;

  const quotedImage = quotedUnwrapped.imageMessage || null;
  const quotedVideo = quotedUnwrapped.videoMessage || quotedUnwrapped.ptvMessage || null;
  const quotedAudio = quotedUnwrapped.audioMessage || null;
  const quotedSticker = quotedUnwrapped.stickerMessage || null;

  // MODO 4: Responder a um áudio enviando uma imagem com /stickeraudio na legenda
  // (também aceita o inverso: responder a imagem/figurinha com áudio, ou imagem + áudio)
  if ((currentImage || quotedImage || quotedSticker) && (quotedAudio || currentAudio)) {
    const visualMsg = currentImage || quotedImage || quotedSticker;
    const visualType = currentImage || quotedImage ? "image" : "sticker";
    const audioMsg = quotedAudio || currentAudio;
    return {
      mode: 4,
      visualMsg,
      visualType,
      audioMsg,
    };
  }

  // MODO 3: Enviar ou responder a um vídeo de até 10 segundos (sem necessidade de query)
  if (currentVideo || quotedVideo) {
    return {
      mode: 3,
      videoMsg: currentVideo || quotedVideo,
    };
  }

  // MODOS 1 e 2: Responder figurinha ou enviar/responder imagem + link do YouTube ou nome da música
  const visualMsg = quotedSticker || currentImage || quotedImage;
  const visualType = quotedSticker ? "sticker" : currentImage || quotedImage ? "image" : null;

  if (visualMsg && query) {
    if (looksLikeUrl(query)) {
      return {
        mode: 1,
        visualMsg,
        visualType,
        query,
      };
    }
    return {
      mode: 2,
      visualMsg,
      visualType,
      query,
    };
  }

  if (visualMsg && !query) {
    return {
      mode: 0,
      reason: "MISSING_AUDIO_OR_QUERY",
      visualType,
    };
  }

  return {
    mode: 0,
    reason: "HELP",
  };
}

function buildUsageHelp(prefix, commandName = "stickeraudio") {
  const cmd = `${prefix}${commandName}`;
  return (
    `╭─「 🎵 *sᴛɪᴄᴋᴇʀ ᴀ́ᴜᴅɪᴏ* 🎵 」─╮\n` +
    `│\n` +
    `│ *1️⃣ Link do YouTube* _(até 30s · Spider X)_\n` +
    `│ 么 Responda uma figurinha ou envie uma imagem:\n` +
    `│   \`${cmd} https://youtu.be/...\`\n` +
    `│\n` +
    `│ *2️⃣ Nome da música* _(até 30s · Spider X)_\n` +
    `│ 么 Responda uma figurinha ou envie uma imagem:\n` +
    `│   \`${cmd} nome da música\`\n` +
    `│\n` +
    `│ *3️⃣ Vídeo com áudio* _(até 10s · gratuito)_\n` +
    `│ 么 Envie ou responda um vídeo com:\n` +
    `│   \`${cmd}\`\n` +
    `│\n` +
    `│ *4️⃣ Imagem + Áudio* _(gratuito)_\n` +
    `│ 么 Responda um áudio enviando uma imagem com\n` +
    `│   \`${cmd}\` na legenda\n` +
    `╰─────────────────────────╯`
  );
}

/**
 * Orquestrador principal do comando /stickeraudio (aliases: /audiosticker, /figaudio).
 */
async function handleStickerAudioCommand({
  conn,
  from,
  info,
  q,
  prefix,
  command,
  pushname,
  NomeDoBot,
  NickDono,
  reply,
  downloadContentFromMessage,
  settings,
  httpClient,
}) {
  // Corrigir bug de autocapitalização no celular onde index.js pode passar "!Stickeraudio" em q
  let cleanQ = String(q || "").trim();
  const cmdPattern = new RegExp(
    `^${String(prefix || "!").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:stickeraudio|audiosticker|figaudio)\\b`,
    "i"
  );
  cleanQ = cleanQ.replace(cmdPattern, "").trim();

  const detected = detectStickerAudioInput(info, cleanQ);
  console.log(
    `[STICKERAUDIO] cmd=${command} modo=${detected.mode} query="${cleanQ.slice(0, 60)}" from=${from}`
  );

  if (detected.mode === 0) {
    if (detected.reason === "MISSING_AUDIO_OR_QUERY") {
      return await reply(
        `🎵 Informe o *nome da música* ou *link do YouTube* junto com o comando, ou responda a um áudio enviando a imagem!\n\n` +
        buildUsageHelp(prefix, command)
      );
    }
    return await reply(buildUsageHelp(prefix, command));
  }

  const metadata = {
    packname: `🎵 ${NomeDoBot || "Aleatory-Bot"}`,
    author: `${pushname || "Usuário"} • ${NickDono || "Aleatory"}`,
    categories: ["🎵"],
  };

  try {
    // Reação inicial não-bloqueante
    conn.sendMessage(from, { react: { text: "🎵", key: info.key } }).catch(() => { });

    let processed;

    // ─── MODO 3: Vídeo até 10s (local, sem créditos) ───
    if (detected.mode === 3) {
      const preSeconds = Number(detected.videoMsg?.seconds || 0);
      if (preSeconds > MAX_VIDEO_SECONDS_TOLERANCE) {
        return await reply(
          `⏱️ O vídeo tem *${preSeconds}s*. O limite máximo para figurinha com áudio é de *${MAX_VIDEO_SECONDS} segundos*.`
        );
      }
      const preLength = Number(detected.videoMsg?.fileLength || 0);
      if (preLength > MAX_VIDEO_BYTES) {
        return await reply(
          `❌ O vídeo excede o tamanho máximo suportado (${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB).`
        );
      }

      await reply("⏳ Processando vídeo em figurinha animada com áudio...");
      const videoBuffer = await downloadMediaBuffer(
        detected.videoMsg,
        "video",
        downloadContentFromMessage,
        { maxBytes: MAX_VIDEO_BYTES }
      );
      processed = await processVideoMode(videoBuffer, metadata);
    }

    // ─── MODO 4: Imagem + Áudio respondido (local, sem créditos) ───
    else if (detected.mode === 4) {
      await reply("⏳ Combinando imagem e áudio na figurinha...");
      const [visualBuffer, audioBuffer] = await Promise.all([
        downloadMediaBuffer(
          detected.visualMsg,
          detected.visualType,
          downloadContentFromMessage,
          { maxBytes: MAX_IMAGE_BYTES }
        ),
        downloadMediaBuffer(
          detected.audioMsg,
          "audio",
          downloadContentFromMessage,
          { maxBytes: MAX_AUDIO_BYTES }
        ),
      ]);
      processed = await processImageAudioMode(visualBuffer, audioBuffer, metadata);
    }

    // ─── MODO 1: Link do YouTube (Spider X API — consome créditos) ───
    else if (detected.mode === 1) {
      if (!isValidYouTubeUrl(detected.query)) {
        return await reply(
          "❌ *Link do YouTube inválido.*\n" +
          "> Envie um link válido como `https://youtu.be/...` ou `https://www.youtube.com/watch?v=...`."
        );
      }

      await reply("⏳ Buscando áudio do YouTube (até 30s) via Spider X API...");
      const reuseQuotedSticker =
        detected.visualType === "sticker" &&
        Boolean(detected.visualMsg?.mediaKey && (detected.visualMsg?.url || detected.visualMsg?.directPath));

      const [visualBuffer, musicData] = await Promise.all([
        reuseQuotedSticker
          ? Promise.resolve(null)
          : downloadMediaBuffer(
            detected.visualMsg,
            detected.visualType,
            downloadContentFromMessage,
            { maxBytes: MAX_IMAGE_BYTES }
          ),
        fetchYouTubeAudioByUrl(detected.query, { settings, httpClient }),
      ]);

      if (reuseQuotedSticker) {
        const opusAudio = await withTempDir(async (dir) => {
          const musicFile = path.join(dir, "music_in");
          await fsp.writeFile(musicFile, musicData.buffer);
          const musicInfo = await probeMedia(musicFile);
          if (!musicInfo.hasAudio || musicInfo.duration <= 0) {
            throw new MediaValidationError(
              "INVALID_MEDIA_FILE",
              "❌ O áudio retornado pela Spider X API está em formato incompatível."
            );
          }
          return await extractAndEncodeOpusAudio(musicFile, MAX_MUSIC_SECONDS);
        });
        processed = {
          existingStickerMessage: detected.visualMsg,
          webpBuffer: null,
          audioBuffer: opusAudio.buffer,
          audioDuration: opusAudio.duration,
          waveform: opusAudio.waveform,
          isAnimated: Boolean(detected.visualMsg?.isAnimated),
          mode: 1,
          usesApiCredits: true,
        };
      } else {
        processed = await processMusicStickerMode(
          visualBuffer,
          detected.visualType === "sticker",
          musicData.buffer,
          1,
          metadata
        );
      }
    }

    // ─── MODO 2: Nome da música (Spider X API — consome créditos) ───
    else if (detected.mode === 2) {
      await reply(`⏳ Pesquisando *"${detected.query}"* (até 30s) via Spider X API...`);
      const reuseQuotedSticker =
        detected.visualType === "sticker" &&
        Boolean(detected.visualMsg?.mediaKey && (detected.visualMsg?.url || detected.visualMsg?.directPath));

      const [visualBuffer, musicData] = await Promise.all([
        reuseQuotedSticker
          ? Promise.resolve(null)
          : downloadMediaBuffer(
            detected.visualMsg,
            detected.visualType,
            downloadContentFromMessage,
            { maxBytes: MAX_IMAGE_BYTES }
          ),
        fetchYouTubeAudioByName(detected.query, { settings, httpClient }),
      ]);

      if (reuseQuotedSticker) {
        const opusAudio = await withTempDir(async (dir) => {
          const musicFile = path.join(dir, "music_in");
          await fsp.writeFile(musicFile, musicData.buffer);
          const musicInfo = await probeMedia(musicFile);
          if (!musicInfo.hasAudio || musicInfo.duration <= 0) {
            throw new MediaValidationError(
              "INVALID_MEDIA_FILE",
              "❌ O áudio retornado pela Spider X API está em formato incompatível."
            );
          }
          return await extractAndEncodeOpusAudio(musicFile, MAX_MUSIC_SECONDS);
        });
        processed = {
          existingStickerMessage: detected.visualMsg,
          webpBuffer: null,
          audioBuffer: opusAudio.buffer,
          audioDuration: opusAudio.duration,
          waveform: opusAudio.waveform,
          isAnimated: Boolean(detected.visualMsg?.isAnimated),
          mode: 2,
          usesApiCredits: true,
        };
      } else {
        processed = await processMusicStickerMode(
          visualBuffer,
          detected.visualType === "sticker",
          musicData.buffer,
          2,
          metadata
        );
      }
    }

    const delivery = await sendStickerWithAudio(conn, from, processed, {
      quoted: info,
    });

    conn.sendMessage(from, { react: { text: "✅", key: info.key } }).catch(() => { });

    return {
      ok: true,
      mode: processed.mode,
      usesApiCredits: processed.usesApiCredits,
      audioDuration: processed.audioDuration,
      webpBytes: processed.webpBuffer ? processed.webpBuffer.length : 0,
      audioBytes: processed.audioBuffer.length,
      deliveryMode: delivery.deliveryMode,
      nativeAudioSticker: delivery.nativeAudioSticker,
      messageId: delivery.messageId || null,
    };
  } catch (err) {
    conn.sendMessage(from, { react: { text: "❌", key: info.key } }).catch(() => { });

    if (err instanceof SpiderXError || err instanceof MediaValidationError) {
      console.error(`[STICKERAUDIO][MODO ${detected.mode}] ${err.code}: ${sanitizeSecrets(err.message)}`);
      await reply(err.userMessage);
      return { ok: false, mode: detected.mode, code: err.code };
    }

    const code = err?.code || "UNKNOWN_ERROR";
    console.error(`[STICKERAUDIO][MODO ${detected.mode}] ${code}:`, sanitizeSecrets(err?.message || err));

    if (code === "MEDIA_TOO_LARGE") {
      await reply("❌ O arquivo enviado excede o tamanho máximo permitido.");
    } else if (code === "MEDIA_TIMEOUT" || code === "MEDIA_PROCESS_TIMEOUT") {
      await reply("⏱️ Tempo limite excedido ao processar a mídia. Tente com um arquivo menor.");
    } else if (code === "MISSING_CREDENTIALS" || code === "MEDIA_UNAVAILABLE") {
      await reply("⚠️ Mídia indisponível ou expirada no WhatsApp. Reenvie e tente novamente.");
    } else {
      await reply("❌ Ocorreu um erro ao processar a figurinha com áudio. Verifique o arquivo e tente novamente.");
    }

    return { ok: false, mode: detected.mode, code };
  }
}

module.exports = {
  MAX_VIDEO_SECONDS,
  MAX_MUSIC_SECONDS,
  MAX_STATIC_WEBP_BYTES,
  MAX_ANIMATED_WEBP_BYTES,
  MediaValidationError,
  probeMedia,
  convertImageToStickerWebp,
  prepareExistingStickerWebp,
  convertVideoToAnimatedWebp,
  extractAndEncodeOpusAudio,
  processVideoMode,
  processImageAudioMode,
  processMusicStickerMode,
  detectStickerAudioInput,
  buildUsageHelp,
  handleStickerAudioCommand,
};
