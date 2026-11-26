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
  getSpiderConfig,
  looksLikeUrl,
  isValidYouTubeUrl,
  normalizeYouTubeUrl,
  fetchYouTubeAudioByUrl,
  fetchYouTubeAudioByName,
} = require("./spiderx_api.js");
const axios = require("axios");

/**
 * Sistema completo do comando /stickeraudio (aliases: /audiosticker, /figaudio):
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
 *   -> converte em figurinha animada WebP + áudio original em Opus VOIP 16kHz + waveform.
 *
 * MODO 4 (Local — SEM créditos):
 *   Responder a uma mensagem de áudio enviando uma imagem (ou vídeo) com /stickeraudio na legenda
 *   -> combina o visual da imagem/vídeo com o áudio correspondente em 1 figurinha sonora nativa.
 *
 * Garantias operacionais:
 * - Limpeza determinística de diretórios temporários (try/finally).
 * - Encerramento forçado de processos FFmpeg/FFprobe em caso de timeout.
 * - Validação rigorosa de duração, formato e tamanho antes do processamento.
 * - 100% autocontido dentro do Aleatory (sem dependência de pastas externas).
 */

const MAX_VIDEO_SECONDS = 10;
const MAX_MUSIC_SECONDS = 30;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 64 * 1024 * 1024; // 64 MB (suporta vídeos longos; recorta só os primeiros 10s)
const MAX_STATIC_WEBP_BYTES = 100 * 1024; // 100 KB (limite WhatsApp final com EXIF)
const MAX_RAW_STATIC_WEBP_BYTES = 96 * 1024; // folga para chunk EXIF ficar <= 100 KB
const MAX_ANIMATED_WEBP_BYTES = 500 * 1024; // 500 KB (limite WhatsApp final com EXIF)
const MAX_RAW_ANIMATED_WEBP_BYTES = 488 * 1024; // folga para EXIF garantir < 500 KB no iOS/Android
const FFMPEG_TIMEOUT_MS = 60000;
const FFPROBE_TIMEOUT_MS = 12000;
const WAVEFORM_SAMPLE_RATE = 8000;
const WAVEFORM_BARS = 64;

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
function runBinary(bin, args, timeoutMs, binaryStdout = false) {
  return new Promise((resolve, reject) => {
    const stdoutChunks = [];
    let stdoutStr = "";
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
      if (binaryStdout) {
        stdoutChunks.push(chunk);
      } else if (stdoutStr.length < 256 * 1024) {
        stdoutStr += chunk.toString("utf8");
      }
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
        finish(null, {
          stdout: binaryStdout ? Buffer.concat(stdoutChunks) : stdoutStr,
          stderr,
        });
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
 * Detecta se um buffer WebP é animado (contém chunk ANIM ou ANMF).
 */
function isAnimatedWebpBuffer(buf) {
  if (!isWebpBuffer(buf)) return false;
  return buf.includes(Buffer.from("ANIM")) || buf.includes(Buffer.from("ANMF"));
}

/**
 * Injeta metadados EXIF de figurinha do WhatsApp em um arquivo WebP (estático ou animado).
 */
async function stampStickerExif(webpBuffer, metadata = {}) {
  if (!metadata.packname && !metadata.author) return webpBuffer;

  const packId =
    metadata.packId || `aleatory-${crypto.randomBytes(4).toString("hex")}`;
  const json = {
    "sticker-pack-id": packId,
    "sticker-pack-name": String(metadata.packname || "Aleatory-Bot"),
    "sticker-pack-publisher": String(metadata.author || "StickerAudio"),
    emojis:
      Array.isArray(metadata.categories) && metadata.categories.length
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
 * Converte imagem (JPG/PNG/WebP/etc.) para figurinha estática WebP 512x512 <= 100 KB.
 */
async function convertImageToStickerWebp(imageBuffer, metadata = {}) {
  return await withTempDir(async (dir) => {
    const inFile = path.join(dir, "input_img");
    const outFile = path.join(dir, "sticker.webp");
    await fsp.writeFile(inFile, imageBuffer);

    const qualities = [80, 65, 50, 35, 20];
    let finalBuffer = null;

    for (const q of qualities) {
      await runBinary(
        "ffmpeg",
        [
          "-y",
          "-v",
          "error",
          "-i",
          inFile,
          "-vcodec",
          "libwebp",
          "-vf",
          "scale=512:512:force_original_aspect_ratio=increase:flags=lanczos,crop=512:512",
          "-frames:v",
          "1",
          "-lossless",
          "0",
          "-compression_level",
          "4",
          "-q:v",
          String(q),
          "-preset",
          "default",
          "-an",
          outFile,
        ],
        FFMPEG_TIMEOUT_MS
      );

      const candidate = await fsp.readFile(outFile);
      finalBuffer = candidate;
      if (candidate.length <= MAX_RAW_STATIC_WEBP_BYTES) break;
    }

    if (!finalBuffer || !finalBuffer.length) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ Falha ao converter a imagem para figurinha WebP."
      );
    }

    return {
      buffer: await stampStickerExif(finalBuffer, metadata),
      width: 512,
      height: 512,
      isAnimated: false,
    };
  });
}

/**
 * Prepara figurinha já existente (estática ou animada), preservando animação, dimensões e EXIF.
 */
async function prepareExistingStickerWebp(stickerBuffer, metadata = {}) {
  if (isWebpBuffer(stickerBuffer)) {
    const animated = isAnimatedWebpBuffer(stickerBuffer);
    let finalBuf = stickerBuffer;
    try {
      finalBuf = await stampStickerExif(stickerBuffer, metadata);
    } catch {
      finalBuf = stickerBuffer;
    }
    return {
      buffer: finalBuf,
      width: 512,
      height: 512,
      isAnimated: animated,
    };
  }
  return await convertImageToStickerWebp(stickerBuffer, metadata);
}

/**
 * Seleciona a escada ideal de resolução/FPS/qualidade conforme a duração do clipe.
 *
 * Prioriza fluidez (14–20 FPS, nunca abaixo de 12 FPS) e nitidez (Lanczos + libwebp_anim
 * com -preset default -compression_level 4), evitando cair para 256px @ 8fps travado.
 */
function buildAnimatedWebpAttempts(durationSec) {
  if (durationSec <= 4.5) {
    return [
      { size: 512, fps: 20, quality: 58 },
      { size: 512, fps: 18, quality: 48 },
      { size: 512, fps: 15, quality: 42 },
      { size: 512, fps: 15, quality: 32 },
      { size: 448, fps: 15, quality: 38 },
      { size: 384, fps: 15, quality: 34 },
      { size: 352, fps: 14, quality: 28 },
    ];
  }

  if (durationSec <= 7.5) {
    return [
      { size: 512, fps: 16, quality: 46 },
      { size: 512, fps: 15, quality: 36 },
      { size: 448, fps: 15, quality: 40 },
      { size: 448, fps: 15, quality: 30 },
      { size: 384, fps: 15, quality: 36 },
      { size: 384, fps: 14, quality: 28 },
      { size: 352, fps: 14, quality: 28 },
      { size: 320, fps: 12, quality: 24 },
    ];
  }

  // Clipes de 7.5s a 10s: começa direto em 448/384 @ 15fps para máxima fluidez sem desperdiçar CPU
  return [
    { size: 448, fps: 15, quality: 36 },
    { size: 384, fps: 15, quality: 36 },
    { size: 384, fps: 15, quality: 28 },
    { size: 352, fps: 15, quality: 32 },
    { size: 352, fps: 14, quality: 24 },
    { size: 320, fps: 14, quality: 28 },
    { size: 320, fps: 12, quality: 22 },
    { size: 288, fps: 12, quality: 16 },
  ];
}

/**
 * Converte vídeo (até 10s) para figurinha animada WebP quadrada (padrão WhatsApp).
 *
 * - Center-crop quadrado 1:1 com filtro Lanczos (nítido, sem barras verticais).
 * - Encoder libwebp_anim + preset default + compression_level 4 (~33% menor que preset icon).
 * - Mantém FPS alto (14–20 fps, piso mínimo 12 fps) cabendo com folga de EXIF em <= 500 KB.
 */
async function convertVideoToAnimatedWebp(inputVideoPath, maxSeconds, metadata = {}) {
  return await withTempDir(async (dir) => {
    const outFile = path.join(dir, "anim_sticker.webp");
    const clippedSec = Math.min(Number(maxSeconds) || MAX_VIDEO_SECONDS, MAX_VIDEO_SECONDS);
    const durationLimit = clippedSec.toFixed(3);
    const attempts = buildAnimatedWebpAttempts(clippedSec);

    let finalBuffer = null;
    let finalSize = 512;
    let chosenAttempt = attempts[0];
    let encoderName = "libwebp_anim";

    for (const attempt of attempts) {
      const vf = `fps=${attempt.fps},scale=${attempt.size}:${attempt.size}:force_original_aspect_ratio=increase:flags=lanczos,crop=${attempt.size}:${attempt.size}`;
      const buildArgs = (codec) => [
        "-y",
        "-v",
        "error",
        "-ss",
        "0",
        "-t",
        durationLimit,
        "-i",
        inputVideoPath,
        "-an",
        "-vf",
        vf,
        "-c:v",
        codec,
        "-loop",
        "0",
        "-lossless",
        "0",
        "-preset",
        "default",
        "-compression_level",
        "4",
        "-q:v",
        String(attempt.quality),
        outFile,
      ];

      try {
        await runBinary("ffmpeg", buildArgs(encoderName), FFMPEG_TIMEOUT_MS);
      } catch (err) {
        if (encoderName === "libwebp_anim") {
          encoderName = "libwebp";
          await runBinary("ffmpeg", buildArgs(encoderName), FFMPEG_TIMEOUT_MS);
        } else {
          throw err;
        }
      }

      const candidate = await fsp.readFile(outFile);
      finalBuffer = candidate;
      finalSize = attempt.size;
      chosenAttempt = attempt;
      if (candidate.length <= MAX_RAW_ANIMATED_WEBP_BYTES) break;
    }

    if (!finalBuffer || !finalBuffer.length) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ Falha ao converter o vídeo em figurinha animada."
      );
    }

    const stamped = await stampStickerExif(finalBuffer, metadata);
    console.log(
      `[STICKERAUDIO] WebP animado: ${finalSize}x${finalSize} @ ${chosenAttempt.fps}fps q=${chosenAttempt.quality} (${encoderName}) -> ${Math.round(stamped.length / 1024)}KB (${clippedSec.toFixed(1)}s)`
    );

    return {
      buffer: stamped,
      width: finalSize,
      height: finalSize,
      fps: chosenAttempt.fps,
      quality: chosenAttempt.quality,
      isAnimated: true,
    };
  });
}

/**
 * Calcula waveform de 64 barras (0..100) a partir do PCM mono 8kHz (padrão WhatsApp PTT).
 */
function createWaveform(pcmBuffer) {
  const sampleCount = Math.floor(pcmBuffer.length / 2);
  if (sampleCount < WAVEFORM_BARS) {
    return Buffer.alloc(WAVEFORM_BARS, 10);
  }

  const blockSize = Math.floor(sampleCount / WAVEFORM_BARS);
  const averages = [];
  for (let bar = 0; bar < WAVEFORM_BARS; bar += 1) {
    let total = 0;
    const start = bar * blockSize;
    for (let sample = 0; sample < blockSize; sample += 1) {
      total += Math.abs(pcmBuffer.readInt16LE((start + sample) * 2));
    }
    averages.push(total / blockSize);
  }

  const maxAverage = Math.max(...averages);
  const scale = maxAverage > 0 ? 100 / maxAverage : 1;
  return Buffer.from(
    averages.map((value) => Math.min(100, Math.floor(value * scale)))
  );
}

/**
 * Converte áudio para OGG/Opus VOIP 16kHz 32k (perfil nativo PTT do WhatsApp)
 * e gera waveform real de 64 barras + duração exata.
 */
async function extractAndEncodeOpusAudio(inputPath, maxSeconds) {
  return await withTempDir(async (dir) => {
    const outFile = path.join(dir, "audio.ogg");
    const limit = Math.max(1, Math.min(Number(maxSeconds) || MAX_MUSIC_SECONDS, MAX_MUSIC_SECONDS));

    await runBinary(
      "ffmpeg",
      [
        "-y",
        "-v",
        "error",
        "-ss",
        "0",
        "-t",
        String(limit),
        "-i",
        inputPath,
        "-vn",
        "-map",
        "0:a:0",
        "-t",
        String(limit),
        "-ar",
        "16000",
        "-ac",
        "1",
        "-c:a",
        "libopus",
        "-b:a",
        "32k",
        "-vbr",
        "on",
        "-compression_level",
        "10",
        "-frame_duration",
        "20",
        "-application",
        "voip",
        "-avoid_negative_ts",
        "make_zero",
        "-map_metadata",
        "-1",
        "-f",
        "ogg",
        outFile,
      ],
      FFMPEG_TIMEOUT_MS
    );

    const buffer = await fsp.readFile(outFile);
    const { stdout: pcmBuffer } = await runBinary(
      "ffmpeg",
      [
        "-v",
        "error",
        "-i",
        outFile,
        "-ac",
        "1",
        "-ar",
        String(WAVEFORM_SAMPLE_RATE),
        "-f",
        "s16le",
        "pipe:1",
      ],
      30000,
      true
    );

    const durationSeconds = Math.ceil(pcmBuffer.length / 2 / WAVEFORM_SAMPLE_RATE);
    if (!buffer.length || durationSeconds < 1) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ O arquivo não contém áudio compatível com uma figurinha sonora."
      );
    }

    return {
      buffer,
      duration: Math.min(durationSeconds, MAX_MUSIC_SECONDS),
      waveform: createWaveform(pcmBuffer),
      mimetype: "audio/ogg; codecs=opus",
    };
  });
}

/**
 * Processa MODO 3 (vídeo de QUALQUER duração -> recorta automaticamente os primeiros 10s
 * em figurinha animada WebP quadrada + áudio VOIP Opus sincronizado).
 * 100% local, sem consumo de créditos da Spider X API.
 *
 * Quando `options.allowSilentFallback === true` (usado no autofigu), vídeos sem faixa de
 * áudio ainda viram figurinha animada normal (sem som) em vez de lançar erro.
 */
async function processVideoMode(videoBuffer, metadata = {}, options = {}) {
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

    const detectedDuration = info.duration > 0 ? info.duration : MAX_VIDEO_SECONDS;
    const targetDuration = Math.min(detectedDuration, MAX_VIDEO_SECONDS);

    if (!info.hasAudio) {
      if (options.allowSilentFallback) {
        const webpResult = await convertVideoToAnimatedWebp(
          videoFile,
          targetDuration,
          metadata
        );
        return {
          webpBuffer: webpResult.buffer,
          width: webpResult.width,
          height: webpResult.height,
          isAnimated: webpResult.isAnimated,
          hasAudio: false,
          audioBuffer: null,
          audioDuration: 0,
          waveform: null,
          originalDuration: detectedDuration,
          trimmedToSeconds: targetDuration,
          mode: 3,
          usesApiCredits: false,
        };
      }
      throw new MediaValidationError(
        "NO_AUDIO_TRACK",
        "❌ Este vídeo *não possui áudio*. Envie um vídeo com som (o bot recorta automaticamente os primeiros 10 segundos)."
      );
    }

    const [webpResult, audioResult] = await Promise.all([
      convertVideoToAnimatedWebp(videoFile, targetDuration, metadata),
      extractAndEncodeOpusAudio(videoFile, targetDuration),
    ]);

    return {
      webpBuffer: webpResult.buffer,
      width: webpResult.width,
      height: webpResult.height,
      isAnimated: webpResult.isAnimated,
      hasAudio: true,
      audioBuffer: audioResult.buffer,
      audioDuration: audioResult.duration,
      waveform: audioResult.waveform,
      originalDuration: detectedDuration,
      trimmedToSeconds: targetDuration,
      mode: 3,
      usesApiCredits: false,
    };
  });
}

/**
 * Processa MODO 4 (imagem/figurinha + áudio recebido no WhatsApp -> figurinha WebP + áudio VOIP Opus)
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

    const [webpResult, opusAudio] = await Promise.all([
      visualPromise,
      extractAndEncodeOpusAudio(audioFile, Math.min(audioInfo.duration, MAX_MUSIC_SECONDS)),
    ]);

    return {
      webpBuffer: webpResult.buffer,
      width: webpResult.width,
      height: webpResult.height,
      isAnimated: webpResult.isAnimated,
      audioBuffer: opusAudio.buffer,
      audioDuration: opusAudio.duration,
      waveform: opusAudio.waveform,
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

    const [webpResult, opusAudio] = await Promise.all([
      visualIsSticker
        ? prepareExistingStickerWebp(visualBuffer, metadata)
        : convertImageToStickerWebp(visualBuffer, metadata),
      extractAndEncodeOpusAudio(musicFile, MAX_MUSIC_SECONDS),
    ]);

    return {
      webpBuffer: webpResult.buffer,
      width: webpResult.width,
      height: webpResult.height,
      isAnimated: webpResult.isAnimated,
      audioBuffer: opusAudio.buffer,
      audioDuration: opusAudio.duration,
      waveform: opusAudio.waveform,
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

  // MODO 4: Imagem/figurinha + Áudio (ex.: responder áudio enviando imagem com legenda)
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

  // MODO 3: Enviar ou responder a um vídeo de até 10 segundos (sem créditos)
  if (currentVideo || quotedVideo) {
    return {
      mode: 3,
      videoMsg: currentVideo || quotedVideo,
    };
  }

  // MODOS 1 e 2: Responder figurinha ou enviar/responder imagem + link YouTube ou nome da música
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

  if (!visualMsg && query) {
    return {
      mode: 0,
      reason: "MISSING_VISUAL_FOR_QUERY",
      query,
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
    `│ _Gatilhos: \`${prefix}stickeraudio\`, \`${prefix}figaudio\`, \`${prefix}figuaudio\`, \`${prefix}audiosticker\`, \`${prefix}sa\`, \`${prefix}fa\`_\n` +
    `│\n` +
    `│ *1️⃣ Link do YouTube* _(até 30s · Spider X)_\n` +
    `│ 么 Responda uma figurinha ou envie uma imagem:\n` +
    `│   \`${cmd} https://youtu.be/...\`\n` +
    `│\n` +
    `│ *2️⃣ Nome da música* _(até 30s · Spider X)_\n` +
    `│ 么 Responda uma figurinha ou envie uma imagem:\n` +
    `│   \`${cmd} nome da música\`\n` +
    `│\n` +
    `│ *3️⃣ Vídeo com áudio* _(qualquer duração → recorta 10s · gratuito)_\n` +
    `│ 么 Envie ou responda qualquer vídeo com:\n` +
    `│   \`${cmd}\`\n` +
    `│\n` +
    `│ *4️⃣ Imagem + Áudio* _(gratuito)_\n` +
    `│ 么 Responda um áudio enviando uma imagem com\n` +
    `│   \`${cmd}\` na legenda\n` +
    `│\n` +
    `│ 📖 Tutorial completo: \`${prefix}infofigaudio\`\n` +
    `╰─────────────────────────╯`
  );
}

/**
 * Tutorial completo e detalhado exibido pelo comando /infofigaudio.
 */
function buildInfoFigAudioTutorial(prefix = "!", NomeDoBot = "Aleatory-Bot") {
  const p = prefix || "!";
  return (
    `╭─「 🎵 *ᴛᴜᴛᴏʀɪᴀʟ: ꜰɪɢᴜʀɪɴʜᴀꜱ ᴄᴏᴍ ᴀ́ᴜᴅɪᴏ* 🎵 」─╮\n` +
    `│ 🤖 *${NomeDoBot}* — Guia Completo de Uso\n` +
    `│\n` +
    `│ ⚡ *COMANDOS / GATILHOS:*\n` +
    `│ 么 \`${p}stickeraudio\`  •  \`${p}audiosticker\`\n` +
    `│ 么 \`${p}figaudio\`      •  \`${p}figuaudio\`\n` +
    `│ 么 \`${p}sa\`            •  \`${p}fa\`\n` +
    `│\n` +
    `│ ━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `│ 🎬 *MODO 1 — Vídeo com Áudio* _(100% gratuito)_\n` +
    `│ • Envie ou responda *qualquer vídeo* (pode ter vários\n` +
    `│   minutos!) com \`${p}figaudio\`, \`${p}sa\` ou \`${p}fa\`.\n` +
    `│ • O bot recorta automaticamente os *primeiros 10 segundos*,\n` +
    `│   ajusta em formato quadrado 1:1 e preserva o som original!\n` +
    `│\n` +
    `│ 🎙️ *MODO 2 — Imagem + Áudio* _(100% gratuito)_\n` +
    `│ • Responda uma mensagem de áudio (ou voz) enviando\n` +
    `│   uma imagem com \`${p}figaudio\` na legenda.\n` +
    `│ • Também funciona respondendo um áudio com uma figurinha!\n` +
    `│\n` +
    `│ 🔗 *MODO 3 — Link do YouTube* _(até 30s · Spider X)_\n` +
    `│ • Responda uma figurinha ou envie uma imagem com:\n` +
    `│   \`${p}figaudio https://youtu.be/...\`\n` +
    `│\n` +
    `│ 🔎 *MODO 4 — Nome da Música* _(até 30s · Spider X)_\n` +
    `│ • Responda uma figurinha ou envie uma imagem com:\n` +
    `│   \`${p}figaudio nome da música\`\n` +
    `│\n` +
    `│ ━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `│ 🤖 *MODO AUTOMÁTICO (${p}autofigu):*\n` +
    `│ • Quando um ADM ativa \`${p}autofigu\` no grupo:\n` +
    `│   📸 Fotos viram figurinhas automaticamente.\n` +
    `│   🎬 *Vídeos de qualquer duração* têm os *primeiros 10s*\n` +
    `│      convertidos automaticamente em *figurinha com áudio*!\n` +
    `│   🎞️ Vídeos sem som/GIFs viram figurinha animada normal.\n` +
    `│\n` +
    `│ ━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `│ 🔊 *COMO OUVIR A FIGURINHA:*\n` +
    `│ • As figurinhas sonoras chegam mutadas por padrão.\n` +
    `│ • Toque no ícone de som *(canto superior esquerdo no\n` +
    `│   Android ou superior direito no WhatsApp Web/Windows)*.\n` +
    `│ • *Aviso iOS (iPhone):* a Meta ainda está liberando o\n` +
    `│   recurso gradualmente no iOS (TestFlight Beta 26.46+).\n` +
    `│   Mantenha o WhatsApp atualizado na App Store!\n` +
    `╰──────────────────────────────────╯`
  );
}

/**
 * Fallback gratuito via API Bronxys (reqapi.play) caso spider_api_token não esteja configurado.
 */
async function fetchAudioViaBronxysFallback(queryOrUrl, reqapi, httpClient = axios) {
  if (!reqapi || typeof reqapi.play !== "function") return null;
  const mediaUrl = reqapi.play(queryOrUrl, true);
  let res;
  try {
    res = await httpClient.get(mediaUrl, {
      timeout: 35000,
      responseType: "arraybuffer",
      maxContentLength: 25 * 1024 * 1024,
      maxBodyLength: 25 * 1024 * 1024,
      validateStatus: () => true,
      headers: { "User-Agent": "Aleatory-Bot/9.0" },
    });
  } catch (err) {
    const isTimeout =
      err?.code === "ECONNABORTED" ||
      err?.code === "ETIMEDOUT" ||
      /timeout|timed out/i.test(String(err?.message || ""));
    throw new SpiderXError(
      isTimeout ? "SPIDERX_TIMEOUT" : "SPIDERX_UNAVAILABLE",
      isTimeout
        ? "⏱️ *Tempo limite excedido* ao baixar o áudio do YouTube. Tente novamente em instantes."
        : "🌐 *Não foi possível baixar o áudio do YouTube no momento.* Tente novamente em instantes.",
      sanitizeSecrets(err?.message || err?.code || "bronxys_network_error")
    );
  }
  if (!res || res.status < 200 || res.status >= 300) {
    throw new SpiderXError(
      "SPIDERX_UNAVAILABLE",
      "🌐 *Não foi possível baixar o áudio do YouTube no momento.* Tente novamente em instantes.",
      `Bronxys fallback HTTP ${res?.status || "N/A"}`
    );
  }
  const buf = Buffer.isBuffer(res.data) ? res.data : Buffer.from(res.data || "");
  const ct = String(res.headers?.["content-type"] || "").toLowerCase();
  const head = buf.slice(0, 64).toString("utf8").trim().toLowerCase();
  if (
    buf.length < 1024 ||
    ct.includes("text/html") ||
    ct.includes("application/json") ||
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("{")
  ) {
    throw new SpiderXError(
      "SPIDERX_NOT_FOUND",
      "🔎 *Não foi possível extrair o áudio desse link/música.* Tente outro termo ou envie o vídeo/áudio diretamente."
    );
  }
  return { buffer: buf, title: queryOrUrl, duration: null, source: "bronxys_fallback" };
}

/**
 * Orquestrador principal do comando /stickeraudio
 * (aliases: /audiosticker, /figaudio, /figuaudio, /sa, /fa).
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
  reqapi,
}) {
  // Sanitizar q caso o teclado do celular tenha capitalizado o comando (ex.: !Figaudio, !Sa)
  let cleanQ = String(q || "").trim();
  const cmdPattern = new RegExp(
    `^${String(prefix || "!").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:stickeraudio|audiosticker|figaudio|figuaudio|sa|fa)\\b`,
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
    if (detected.reason === "MISSING_VISUAL_FOR_QUERY") {
      const cmd = `${prefix}${command}`;
      return await reply(
        `🖼️ *Faltou a figurinha ou imagem* para colocar esse áudio!\n\n` +
        `• *Responda uma figurinha* com:\n  \`${cmd} ${detected.query}\`\n` +
        `• Ou *envie uma imagem* com \`${cmd} ${detected.query}\` na legenda.\n` +
        `• Para transformar um *vídeo direto* em figurinha com som, envie/responda o vídeo apenas com \`${cmd}\`.`
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
    conn.sendMessage(from, { react: { text: "⏳", key: info.key } }).catch(() => { });

    let processed;

    // ─── MODO 3: Vídeo de QUALQUER duração -> recorta os primeiros 10s (local, sem créditos) ───
    if (detected.mode === 3) {
      const preLength = Number(detected.videoMsg?.fileLength || 0);
      if (preLength > MAX_VIDEO_BYTES) {
        return await reply(
          `❌ O vídeo excede o tamanho máximo suportado (${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB).`
        );
      }

      const videoBuffer = await downloadMediaBuffer(
        detected.videoMsg,
        "video",
        downloadContentFromMessage,
        { maxBytes: MAX_VIDEO_BYTES, timeoutMs: 60000 }
      );
      processed = await processVideoMode(videoBuffer, metadata);
    }

    // ─── MODO 4: Imagem + Áudio respondido (local, sem créditos) ───
    else if (detected.mode === 4) {
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

    // ─── MODO 1: Link do YouTube (Spider X API ou fallback Bronxys API) ───
    else if (detected.mode === 1) {
      if (!isValidYouTubeUrl(detected.query)) {
        return await reply(
          "❌ *Link do YouTube inválido.*\n" +
          "> Envie um link válido como `https://youtu.be/...`, `https://www.youtube.com/watch?v=...` ou `https://youtube.com/shorts/...`."
        );
      }

      const normalizedYt = normalizeYouTubeUrl(detected.query);
      const hasSpiderToken = Boolean(getSpiderConfig(settings).token);
      const audioPromise =
        !hasSpiderToken && reqapi
          ? fetchAudioViaBronxysFallback(normalizedYt, reqapi, httpClient)
          : fetchYouTubeAudioByUrl(normalizedYt, { settings, httpClient });

      const [visualBuffer, musicData] = await Promise.all([
        downloadMediaBuffer(
          detected.visualMsg,
          detected.visualType,
          downloadContentFromMessage,
          { maxBytes: MAX_IMAGE_BYTES }
        ),
        audioPromise,
      ]);

      processed = await processMusicStickerMode(
        visualBuffer,
        detected.visualType === "sticker",
        musicData.buffer,
        1,
        metadata
      );
    }

    // ─── MODO 2: Nome da música (Spider X API ou fallback Bronxys API) ───
    else if (detected.mode === 2) {
      const hasSpiderToken = Boolean(getSpiderConfig(settings).token);
      const audioPromise =
        !hasSpiderToken && reqapi
          ? fetchAudioViaBronxysFallback(detected.query, reqapi, httpClient)
          : fetchYouTubeAudioByName(detected.query, { settings, httpClient });

      const [visualBuffer, musicData] = await Promise.all([
        downloadMediaBuffer(
          detected.visualMsg,
          detected.visualType,
          downloadContentFromMessage,
          { maxBytes: MAX_IMAGE_BYTES }
        ),
        audioPromise,
      ]);

      processed = await processMusicStickerMode(
        visualBuffer,
        detected.visualType === "sticker",
        musicData.buffer,
        2,
        metadata
      );
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
      webpBytes: processed.webpBuffer.length,
      audioBytes: processed.audioBuffer.length,
      deliveryMode: delivery.deliveryMode,
      nativeAudioSticker: delivery.nativeAudioSticker,
      messageId: delivery.messageId || null,
    };
  } catch (err) {
    conn.sendMessage(from, { react: { text: "❌", key: info.key } }).catch(() => { });

    if (err instanceof SpiderXError || err instanceof MediaValidationError) {
      console.error(
        `[STICKERAUDIO][MODO ${detected.mode}] ${err.code}: ${sanitizeSecrets(err.message)}`
      );
      await reply(err.userMessage);
      return { ok: false, mode: detected.mode, code: err.code };
    }

    const code = err?.code || "UNKNOWN_ERROR";
    console.error(
      `[STICKERAUDIO][MODO ${detected.mode}] ${code}:`,
      sanitizeSecrets(err?.message || err)
    );

    if (code === "MEDIA_TOO_LARGE") {
      await reply("❌ O arquivo enviado excede o tamanho máximo permitido.");
    } else if (code === "MEDIA_TIMEOUT" || code === "MEDIA_PROCESS_TIMEOUT") {
      await reply(
        "⏱️ Tempo limite excedido ao processar a mídia. Tente com um arquivo menor."
      );
    } else if (code === "MISSING_CREDENTIALS" || code === "MEDIA_UNAVAILABLE") {
      await reply(
        "⚠️ Mídia indisponível ou expirada no WhatsApp. Reenvie e tente novamente."
      );
    } else {
      await reply(
        "❌ Ocorreu um erro ao processar a figurinha com áudio. Verifique o arquivo e tente novamente."
      );
    }

    return { ok: false, mode: detected.mode, code };
  }
}

/**
 * Integração automática com !autofigu para vídeos em grupos:
 * - Aceita vídeos de QUALQUER duração (recorta automaticamente os primeiros 10s).
 * - Se o vídeo tiver áudio: envia figurinha animada quadrada COM ÁUDIO nativo (#134/#26).
 * - Se o vídeo for mudo/GIF (sem faixa de áudio): envia figurinha animada normal como fallback.
 * - Não envia spam de erro no grupo em caso de falha ou arquivo acima do limite.
 */
async function handleAutoFiguVideoAudioSticker({
  conn,
  from,
  info,
  groupName,
  pushname,
  NomeDoBot,
  NickDono,
  downloadContentFromMessage,
}) {
  const unwrapped = unwrapMessageContainer(info?.message)?.unwrapped || {};
  const videoMsg = unwrapped.videoMessage || unwrapped.ptvMessage || null;
  if (!videoMsg) return { ok: false, skipped: true, reason: "NO_VIDEO" };

  const preLength = Number(videoMsg.fileLength || 0);
  if (preLength > MAX_VIDEO_BYTES) {
    console.warn(
      `[AUTOFIGU] Vídeo ignorado por exceder ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB (${preLength}B) em ${from}`
    );
    return { ok: false, skipped: true, reason: "MEDIA_TOO_LARGE" };
  }

  const metadata = {
    packname: `⚝ ⇝ Grupo:\n${groupName || NomeDoBot || "Aleatory-Bot"}`,
    author: `⚒${pushname || "Usuário"}\n⚒${NomeDoBot || "Aleatory-Bot"}\n${NickDono || "Aleatory"}`,
    categories: ["🎵"],
  };

  try {
    const videoBuffer = await downloadMediaBuffer(
      videoMsg,
      "video",
      downloadContentFromMessage,
      { maxBytes: MAX_VIDEO_BYTES, timeoutMs: 60000 }
    );

    const processed = await processVideoMode(videoBuffer, metadata, {
      allowSilentFallback: true,
    });

    if (processed.hasAudio && processed.audioBuffer) {
      const delivery = await sendStickerWithAudio(conn, from, processed, {
        quoted: info,
      });
      console.log(
        `[AUTOFIGU][AUDIOSTICKER] from=${from} orig=${processed.originalDuration.toFixed(1)}s -> ${processed.audioDuration}s sticker=${processed.webpBuffer.length}B`
      );
      return {
        ok: true,
        mode: "autofigu_audio_sticker",
        hasAudio: true,
        audioDuration: processed.audioDuration,
        webpBytes: processed.webpBuffer.length,
        deliveryMode: delivery.deliveryMode,
        messageId: delivery.messageId || null,
      };
    }

    await conn.sendMessage(
      from,
      { sticker: processed.webpBuffer },
      { quoted: info }
    );
    console.log(
      `[AUTOFIGU][VIDEO-MUDO] from=${from} orig=${processed.originalDuration.toFixed(1)}s sticker=${processed.webpBuffer.length}B`
    );
    return {
      ok: true,
      mode: "autofigu_silent_sticker",
      hasAudio: false,
      audioDuration: 0,
      webpBytes: processed.webpBuffer.length,
      deliveryMode: "standard_sticker",
    };
  } catch (err) {
    console.error(
      `[AUTOFIGU][ERRO] from=${from}:`,
      sanitizeSecrets(err?.message || err)
    );
    return { ok: false, code: err?.code || "AUTOFIGU_ERROR" };
  }
}

module.exports = {
  MAX_VIDEO_SECONDS,
  MAX_MUSIC_SECONDS,
  MAX_VIDEO_BYTES,
  MAX_STATIC_WEBP_BYTES,
  MAX_ANIMATED_WEBP_BYTES,
  MediaValidationError,
  probeMedia,
  isWebpBuffer,
  isAnimatedWebpBuffer,
  createWaveform,
  convertImageToStickerWebp,
  prepareExistingStickerWebp,
  convertVideoToAnimatedWebp,
  extractAndEncodeOpusAudio,
  processVideoMode,
  processImageAudioMode,
  processMusicStickerMode,
  detectStickerAudioInput,
  buildUsageHelp,
  buildInfoFigAudioTutorial,
  handleStickerAudioCommand,
  handleAutoFiguVideoAudioSticker,
};
