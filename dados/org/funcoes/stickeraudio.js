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
 * Detecta se um buffer é GIF (GIF87a / GIF89a).
 */
function isGifBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 6) return false;
  const sig = buf.slice(0, 6).toString("ascii");
  return sig === "GIF87a" || sig === "GIF89a";
}

/**
 * Converte qualquer buffer visual (figurinha, imagem, GIF ou vídeo) para WebP 1:1.
 * - Figurinha: preserva estática ou animada com EXIF atualizado.
 * - GIF / Vídeo: recorta até os primeiros 10s em WebP animado suave (15–20 FPS).
 * - Imagem: converte em WebP estático 512x512 <= 100 KB.
 */
async function convertVisualBufferToStickerWebp(visualBuffer, visualType, metadata = {}, tempDir = null) {
  if (visualType === "sticker" || (visualType !== "video" && visualType !== "gif" && isWebpBuffer(visualBuffer))) {
    return await prepareExistingStickerWebp(visualBuffer, metadata);
  }

  const treatAsAnimated =
    visualType === "video" ||
    visualType === "gif" ||
    isGifBuffer(visualBuffer);

  if (treatAsAnimated) {
    const runAnimated = async (dir) => {
      const ext = isGifBuffer(visualBuffer) ? ".gif" : ".mp4";
      const animPath = path.join(dir, `visual_anim${ext}`);
      await fsp.writeFile(animPath, visualBuffer);
      const vInfo = await probeMedia(animPath);
      if (!vInfo.hasVideo) {
        throw new MediaValidationError(
          "INVALID_MEDIA_FILE",
          "❌ O GIF/vídeo enviado é inválido ou incompatível."
        );
      }
      const targetDur = Math.min(vInfo.duration > 0 ? vInfo.duration : MAX_VIDEO_SECONDS, MAX_VIDEO_SECONDS);
      return await convertVideoToAnimatedWebp(animPath, targetDur, metadata);
    };
    return tempDir ? await runAnimated(tempDir) : await withTempDir(runAnimated);
  }

  return await convertImageToStickerWebp(visualBuffer, metadata);
}

/**
 * Processa MODO 4 (imagem/figurinha/GIF/vídeo + áudio recebido no WhatsApp -> figurinha WebP + áudio Opus)
 * 100% local, sem consumo de créditos da Spider X API.
 */
async function processImageAudioMode(visualBuffer, audioBuffer, metadata = {}, visualType = "image") {
  const maxVisualBytes =
    visualType === "video" || visualType === "gif" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!Buffer.isBuffer(visualBuffer) || !visualBuffer.length) {
    throw new MediaValidationError("INVALID_MEDIA_FILE", "❌ Mídia visual vazia ou inválida.");
  }
  if (visualBuffer.length > maxVisualBytes) {
    throw new MediaValidationError(
      "MEDIA_TOO_LARGE",
      `❌ A mídia visual excede o limite de ${Math.round(maxVisualBytes / (1024 * 1024))} MB.`
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

    const [webpResult, opusAudio] = await Promise.all([
      convertVisualBufferToStickerWebp(visualBuffer, visualType, metadata, dir),
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
 * Processa MODOS 1 e 2 (visual sticker/imagem/GIF/vídeo + buffer de áudio do YouTube/música,
 * cortado em até 30 segundos).
 */
async function processMusicStickerMode(
  visualBuffer,
  visualTypeOrIsSticker,
  rawMusicBuffer,
  modeNumber,
  metadata = {}
) {
  const visualType =
    typeof visualTypeOrIsSticker === "string"
      ? visualTypeOrIsSticker
      : visualTypeOrIsSticker
        ? "sticker"
        : "image";
  const maxVisualBytes =
    visualType === "video" || visualType === "gif" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (!Buffer.isBuffer(visualBuffer) || !visualBuffer.length) {
    throw new MediaValidationError("INVALID_MEDIA_FILE", "❌ Imagem, GIF ou figurinha inválida.");
  }
  if (visualBuffer.length > maxVisualBytes) {
    throw new MediaValidationError(
      "MEDIA_TOO_LARGE",
      `❌ A mídia visual excede o limite de ${Math.round(maxVisualBytes / (1024 * 1024))} MB.`
    );
  }

  return await withTempDir(async (dir) => {
    const musicFile = path.join(dir, "music_in");
    await fsp.writeFile(musicFile, rawMusicBuffer);

    const musicInfo = await probeMedia(musicFile);
    if (!musicInfo.hasAudio || musicInfo.duration <= 0) {
      throw new MediaValidationError(
        "INVALID_MEDIA_FILE",
        "❌ O áudio retornado pela API está em formato incompatível."
      );
    }

    const [webpResult, opusAudio] = await Promise.all([
      convertVisualBufferToStickerWebp(visualBuffer, visualType, metadata, dir),
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
 * Suporta imagens, figurinhas, GIFs (videoMessage gifPlayback ou document image/gif) e vídeos.
 */
function detectStickerAudioInput(info, rawQuery = "") {
  const query = String(rawQuery || "").trim();
  const currentUnwrapped = unwrapMessageContainer(info?.message)?.unwrapped || {};
  const quotedRaw = getQuotedMessage(info);
  const quotedUnwrapped = quotedRaw
    ? unwrapMessageContainer(quotedRaw)?.unwrapped || {}
    : {};

  const isGifDocument = (doc) =>
    Boolean(
      doc &&
        (/gif/i.test(String(doc.mimetype || "")) ||
          /\.gif$/i.test(String(doc.fileName || "")))
    );

  const currentImage = currentUnwrapped.imageMessage || null;
  const currentVideo = currentUnwrapped.videoMessage || currentUnwrapped.ptvMessage || null;
  const currentAudio = currentUnwrapped.audioMessage || null;
  const currentGifDoc = isGifDocument(currentUnwrapped.documentMessage)
    ? currentUnwrapped.documentMessage
    : null;

  const quotedImage = quotedUnwrapped.imageMessage || null;
  const quotedVideo = quotedUnwrapped.videoMessage || quotedUnwrapped.ptvMessage || null;
  const quotedAudio = quotedUnwrapped.audioMessage || null;
  const quotedSticker = quotedUnwrapped.stickerMessage || null;
  const quotedGifDoc = isGifDocument(quotedUnwrapped.documentMessage)
    ? quotedUnwrapped.documentMessage
    : null;

  const pickVisual = () => {
    if (currentImage) return { visualMsg: currentImage, visualType: "image", downloadType: "image" };
    if (currentVideo) {
      return {
        visualMsg: currentVideo,
        visualType: currentVideo.gifPlayback ? "gif" : "video",
        downloadType: "video",
      };
    }
    if (currentGifDoc) return { visualMsg: currentGifDoc, visualType: "gif", downloadType: "document" };
    if (quotedSticker) return { visualMsg: quotedSticker, visualType: "sticker", downloadType: "sticker" };
    if (quotedImage) return { visualMsg: quotedImage, visualType: "image", downloadType: "image" };
    if (quotedVideo) {
      return {
        visualMsg: quotedVideo,
        visualType: quotedVideo.gifPlayback ? "gif" : "video",
        downloadType: "video",
      };
    }
    if (quotedGifDoc) return { visualMsg: quotedGifDoc, visualType: "gif", downloadType: "document" };
    return null;
  };

  const visual = pickVisual();

  // MODO 4: Imagem/figurinha/GIF/vídeo + Áudio (ex.: responder áudio enviando GIF ou imagem com legenda)
  if (visual && (quotedAudio || currentAudio)) {
    return {
      mode: 4,
      visualMsg: visual.visualMsg,
      visualType: visual.visualType,
      downloadType: visual.downloadType,
      audioMsg: quotedAudio || currentAudio,
    };
  }

  // MODOS 1 e 2: Qualquer mídia visual (figurinha, imagem, GIF ou vídeo) + link YouTube ou nome da música
  if (visual && query) {
    if (looksLikeUrl(query)) {
      return {
        mode: 1,
        visualMsg: visual.visualMsg,
        visualType: visual.visualType,
        downloadType: visual.downloadType,
        query,
      };
    }
    return {
      mode: 2,
      visualMsg: visual.visualMsg,
      visualType: visual.visualType,
      downloadType: visual.downloadType,
      query,
    };
  }

  // MODO 3: Enviar ou responder a um vídeo/GIF sem música externa (extrai áudio original dos primeiros 10s)
  if (currentVideo || quotedVideo) {
    const vid = currentVideo || quotedVideo;
    return {
      mode: 3,
      videoMsg: vid,
      isGif: Boolean(vid.gifPlayback),
    };
  }

  if (currentGifDoc || quotedGifDoc) {
    return {
      mode: 0,
      reason: "GIF_NEEDS_AUDIO",
      visualType: "gif",
    };
  }

  if (visual && !query) {
    return {
      mode: 0,
      reason: "MISSING_AUDIO_OR_QUERY",
      visualType: visual.visualType,
    };
  }

  if (!visual && query) {
    if (isValidTikTokUrl(query)) {
      return {
        mode: 5,
        platform: "tiktok",
        query,
      };
    }
    if (isValidInstagramUrl(query)) {
      return {
        mode: 5,
        platform: "instagram",
        query,
      };
    }
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

function normalizeHttpUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidTikTokUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const parsed = new URL(normalizeHttpUrl(rawUrl));
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com")
    ) && parsed.pathname.length > 1;
  } catch {
    return false;
  }
}

function isValidInstagramUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const parsed = new URL(normalizeHttpUrl(rawUrl));
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return (
      (host === "instagram.com" ||
        host === "m.instagram.com" ||
        host === "instagr.am" ||
        host === "ddinstagram.com") &&
      parsed.pathname.length > 1
    );
  } catch {
    return false;
  }
}

function buildUsageHelp(prefix, commandName = "stickeraudio") {
  const cmd = `${prefix}${commandName}`;
  return (
    `🎵 *Figurinha com Áudio*\n\n` +
    `• *Vídeo:* envie ou responda um vídeo com \`${cmd}\` _(recorta os 10 primeiros seg.)_\n` +
    `• *Áudio / Meme por nome:* responda figurinha, foto ou GIF com \`${cmd} nome\` _(busca no TikTok primeiro e usa YouTube de reserva)_\n` +
    `• *Links (YouTube · TikTok · Instagram):* responda figurinha, foto ou GIF com \`${cmd} link\`\n` +
    `• *TikTok / Reels direto:* envie \`${cmd} link\` para virar figurinha animada com som\n` +
    `• *Áudio:* responda um áudio enviando foto ou GIF com \`${cmd}\`\n\n` +
    `> Tutorial completo: \`${prefix}infofig\` ou \`${prefix}infofigaudio\``
  );
}

/**
 * Tutorial completo e limpo exibido pelos comandos /infofig e /infofigaudio.
 */
function buildInfoFigAudioTutorial(prefix = "!", NomeDoBot = "Aleatory-Bot") {
  const p = prefix || "!";
  return (
    `🎵 *Figurinha com Áudio — ${NomeDoBot}*\n\n` +
    `*Comandos:*\n` +
    `\`${p}figaudio\` · \`${p}figuaudio\` · \`${p}sa\` · \`${p}fa\` · \`${p}stickeraudio\` · \`${p}audiosticker\`\n` +
    `_Ajuda rápida:_ \`${p}infofig\` · \`${p}infofigaudio\`\n\n` +
    `*Como criar:*\n\n` +
    `1. *Vídeo com som*\n` +
    `Envie ou responda qualquer vídeo com \`${p}sa\` _(recorta automaticamente os primeiros 10 segundos)_.\n\n` +
    `2. *Foto, GIF ou vídeo + Áudio*\n` +
    `Responda um áudio enviando uma foto, GIF ou vídeo com \`${p}sa\` na legenda.\n\n` +
    `3. *Áudio de meme ou música por nome (TikTok → YouTube)*\n` +
    `Responda uma figurinha ou envie foto/GIF com:\n` +
    `\`${p}sa nome do meme ou música\`\n` +
    `_(Busca primeiro no *TikTok* — ideal para áudios de memes — e, se não achar, puxa automaticamente do *YouTube* · até 30s)._\n\n` +
    `4. *Links do YouTube, TikTok ou Instagram Reels*\n` +
    `• Responda figurinha, foto ou GIF com \`${p}sa link\` para aplicar o áudio _(até 30s)_.\n` +
    `• Ou envie *só* \`${p}sa link\` _(TikTok ou Reels)_ para virar figurinha animada com som dos primeiros 10s!\n\n` +
    `*Modo automático:*\n` +
    `ADMs podem ativar \`${p}autofigu\` (ou \`${p}autofigurinha\`) para converter fotos, GIFs e vídeos (com ou sem som) automaticamente no grupo.\n\n` +
    `> 🔊 Funciona no Android, iPhone (iOS) e Windows — toque no ícone de som da figurinha para ouvir.`
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
 * Baixa buffer binário de mídia (áudio ou vídeo) de uma URL externa com validação segura.
 */
async function downloadExternalMediaBuffer(
  mediaUrl,
  platformLabel,
  httpClient = axios,
  maxBytes = MAX_VIDEO_BYTES,
  timeoutMs = 35000
) {
  let res;
  try {
    res = await httpClient.get(mediaUrl, {
      timeout: timeoutMs,
      responseType: "arraybuffer",
      maxContentLength: maxBytes,
      maxBodyLength: maxBytes,
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
        ? `⏱️ *Tempo limite excedido* ao baixar a mídia do ${platformLabel}. Tente novamente em instantes.`
        : `🌐 *Não foi possível baixar a mídia do ${platformLabel} no momento.* Tente novamente em instantes.`,
      sanitizeSecrets(err?.message || err?.code || `${platformLabel}_network_error`)
    );
  }

  if (!res || res.status < 200 || res.status >= 300) {
    throw new SpiderXError(
      "SPIDERX_UNAVAILABLE",
      `🌐 *Não foi possível baixar a mídia do ${platformLabel} no momento.* Verifique se o perfil/vídeo é público.`,
      `${platformLabel} HTTP ${res?.status || "N/A"}`
    );
  }

  const buf = Buffer.isBuffer(res.data) ? res.data : Buffer.from(res.data || "");
  const ct = String(res.headers?.["content-type"] || "").toLowerCase();
  const head = buf.slice(0, 64).toString("utf8").trim().toLowerCase();

  // Caso a API retorne JSON com URL real de download, resolve automaticamente
  if (ct.includes("application/json") || head.startsWith("{")) {
    try {
      const parsed = JSON.parse(buf.toString("utf8"));
      const msgList = Array.isArray(parsed?.msg) ? parsed.msg : [];
      const firstMedia =
        msgList.find((m) => m && /mp4|mp3|m4a|ogg|audio|video/i.test(String(m.type || ""))) ||
        msgList[0] ||
        null;
      const directUrl =
        firstMedia?.url ||
        parsed?.audio ||
        parsed?.video ||
        parsed?.url ||
        parsed?.download ||
        parsed?.link ||
        parsed?.data?.url ||
        parsed?.result?.url ||
        null;
      if (typeof directUrl === "string" && /^https?:\/\//i.test(directUrl)) {
        return await downloadExternalMediaBuffer(directUrl, platformLabel, httpClient, maxBytes, timeoutMs);
      }
    } catch {
      // cairá na validação abaixo
    }
    throw new SpiderXError(
      "SPIDERX_NOT_FOUND",
      `🔎 *Não foi possível extrair o áudio desse link do ${platformLabel}.* Verifique se o vídeo é público.`
    );
  }

  if (buf.length < 1024 || ct.includes("text/html") || head.startsWith("<!doctype") || head.startsWith("<html")) {
    throw new SpiderXError(
      "SPIDERX_NOT_FOUND",
      `🔎 *Não foi possível baixar a mídia desse link do ${platformLabel}.* Verifique se o link está correto e público.`
    );
  }

  return buf;
}

const TIKWM_SEARCH_ENDPOINT = "https://www.tikwm.com/api/feed/search";

function resolveTikWmUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `https://www.tikwm.com${trimmed}`;
  return null;
}

/**
 * Pesquisa áudios/vídeos por nome no TikTok (via TikWM feed/search — gratuito,
 * excelente para áudios de memes e sons virais) e baixa o melhor áudio disponível.
 *
 * Em caso de falta de resultados, rate limit, timeout ou mídia inválida, lança erro
 * controlado para o orquestrador fazer fallback automático para o YouTube.
 */
async function searchAndFetchTikTokAudioByName(query, options = {}) {
  const httpClient = options.httpClient || axios;
  const reqapi = options.reqapi || null;
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    throw new Error("TIKTOK_EMPTY_QUERY");
  }

  const doSearch = async () => {
    const res = await httpClient.get(TIKWM_SEARCH_ENDPOINT, {
      params: { keywords: cleanQuery, count: 8, cursor: 0 },
      timeout: 12000,
      responseType: "arraybuffer",
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (!res || res.status < 200 || res.status >= 300) {
      throw new Error(`TIKTOK_SEARCH_HTTP_${res?.status || "ERR"}`);
    }

    const rawText = Buffer.isBuffer(res.data)
      ? res.data.toString("utf8")
      : typeof res.data === "string"
        ? res.data
        : JSON.stringify(res.data || {});

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error("TIKTOK_SEARCH_NON_JSON");
    }
    return parsed;
  };

  let parsed = await doSearch();

  // Retry único de 1.1s caso o limite gratuito de 1 req/s da TikWM seja atingido
  if (
    parsed &&
    parsed.code !== 0 &&
    /limit|rate|too many|1 request/i.test(String(parsed.msg || ""))
  ) {
    await new Promise((r) => setTimeout(r, 1100));
    parsed = await doSearch();
  }

  if (!parsed || parsed.code !== 0) {
    throw new Error(
      `TIKTOK_SEARCH_API_ERROR:${String(parsed?.msg || parsed?.code || "unknown").slice(0, 80)}`
    );
  }

  const rawVideos = Array.isArray(parsed?.data?.videos)
    ? parsed.data.videos
    : Array.isArray(parsed?.data)
      ? parsed.data
      : [];

  if (!rawVideos.length) {
    throw new Error("TIKTOK_NO_RESULTS");
  }

  // Filtrar vídeos com URL válida de áudio ou vídeo, preservando relevância
  const candidates = rawVideos
    .map((v) => {
      if (!v || typeof v !== "object") return null;
      const musicUrl = resolveTikWmUrl(v.music_info?.play) || resolveTikWmUrl(v.music);
      const videoUrl = resolveTikWmUrl(v.play) || resolveTikWmUrl(v.wmplay);
      const videoId = v.video_id || v.id || null;
      const authorId = v.author?.unique_id || null;
      const webUrl =
        videoId && authorId
          ? `https://www.tiktok.com/@${authorId}/video/${videoId}`
          : null;
      const duration = Number(v.music_info?.duration || v.duration || 0);
      if (!musicUrl && !videoUrl && !webUrl) return null;
      return {
        musicUrl,
        videoUrl,
        webUrl,
        duration,
        title: String(v.music_info?.title || v.title || cleanQuery).trim(),
      };
    })
    .filter(Boolean);

  if (!candidates.length) {
    throw new Error("TIKTOK_NO_PLAYABLE_CANDIDATES");
  }

  // Preferir entradas com duração > 0 primeiro, mantendo a ordem de relevância
  const ordered = [
    ...candidates.filter((c) => c.duration > 0),
    ...candidates.filter((c) => c.duration <= 0),
  ].slice(0, 3);

  let lastErr = null;
  for (const cand of ordered) {
    const urlsToTry = [];
    if (cand.musicUrl) urlsToTry.push(cand.musicUrl);
    if (cand.videoUrl && cand.videoUrl !== cand.musicUrl) urlsToTry.push(cand.videoUrl);
    if (cand.webUrl && reqapi && typeof reqapi.tiktok === "function") {
      urlsToTry.push(reqapi.tiktok(cand.webUrl));
    }

    for (const mediaUrl of urlsToTry) {
      try {
        const buffer = await downloadExternalMediaBuffer(
          mediaUrl,
          "TikTok",
          httpClient,
          MAX_VIDEO_BYTES,
          15000
        );
        return {
          buffer,
          title: cand.title,
          duration: cand.duration > 0 ? cand.duration : null,
          source: "tiktok_search",
        };
      } catch (err) {
        lastErr = err;
      }
    }
  }

  throw lastErr || new Error("TIKTOK_DOWNLOAD_FAILED");
}

/**
 * Baixa mídia (vídeo/áudio) de link do TikTok usando a API já existente no bot (reqapi.tiktok).
 */
async function fetchTikTokMediaBuffer(rawUrl, reqapi, httpClient = axios) {
  if (!reqapi || typeof reqapi.tiktok !== "function") {
    throw new SpiderXError(
      "SPIDERX_UNAVAILABLE",
      "⚠️ A API do TikTok não está disponível nesta instância do bot."
    );
  }
  const cleanUrl = normalizeHttpUrl(rawUrl);
  const endpointUrl = reqapi.tiktok(cleanUrl);
  const buffer = await downloadExternalMediaBuffer(endpointUrl, "TikTok", httpClient, MAX_VIDEO_BYTES);
  return { buffer, title: "TikTok Audio", duration: null, source: "bronxys_tiktok" };
}

/**
 * Baixa mídia (Reels/vídeo/áudio) de link do Instagram usando a API já existente no bot (reqapi.instagram).
 */
async function fetchInstagramMediaBuffer(rawUrl, reqapi, httpClient = axios) {
  if (!reqapi || typeof reqapi.instagram !== "function") {
    throw new SpiderXError(
      "SPIDERX_UNAVAILABLE",
      "⚠️ A API do Instagram não está disponível nesta instância do bot."
    );
  }
  const cleanUrl = normalizeHttpUrl(rawUrl);
  let igData;
  try {
    igData = await reqapi.instagram(cleanUrl);
  } catch (err) {
    throw new SpiderXError(
      "SPIDERX_UNAVAILABLE",
      "🌐 *Não foi possível consultar esse link do Instagram no momento.* Verifique se o post/Reels é público.",
      sanitizeSecrets(err?.message || err || "instagram_api_error")
    );
  }

  const msgList = Array.isArray(igData?.msg) ? igData.msg : [];
  const videoOrAudioItem = msgList.find(
    (item) =>
      item &&
      typeof item.url === "string" &&
      /mp4|mp3|m4a|ogg|video|audio/i.test(String(item.type || ""))
  );
  const anyItem = videoOrAudioItem || msgList.find((item) => item && typeof item.url === "string") || null;

  if (!videoOrAudioItem && anyItem && /jpg|jpeg|png|webp|image/i.test(String(anyItem.type || ""))) {
    throw new MediaValidationError(
      "NO_AUDIO_TRACK",
      "❌ Esse link do Instagram é apenas uma *foto* (sem áudio). Envie um link de *Reels* ou vídeo!"
    );
  }

  const targetUrl =
    anyItem?.url ||
    igData?.url ||
    igData?.download ||
    igData?.link ||
    igData?.data?.url ||
    igData?.result?.url ||
    null;

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    throw new SpiderXError(
      "SPIDERX_NOT_FOUND",
      "🔎 *Não foi possível extrair o vídeo/áudio desse link do Instagram.* Verifique se o Reels/post é público."
    );
  }

  const buffer = await downloadExternalMediaBuffer(targetUrl, "Instagram", httpClient, MAX_VIDEO_BYTES);
  return { buffer, title: "Instagram Audio", duration: null, source: "bronxys_instagram" };
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
    const cmd = `${prefix}${command}`;
    if (detected.reason === "GIF_NEEDS_AUDIO") {
      return await reply(
        `🎞️ *GIFs não possuem som próprio!*\n\n` +
        `Para transformar esse GIF em *figurinha animada com áudio*:\n` +
        `• *Responda o GIF* com o nome da música:\n  \`${cmd} nome da música\`\n` +
        `• *Responda o GIF* com um link do YouTube:\n  \`${cmd} https://youtu.be/...\`\n` +
        `• Ou *responda um áudio* enviando o GIF com \`${cmd}\` na legenda!`
      );
    }
    if (detected.reason === "MISSING_AUDIO_OR_QUERY") {
      return await reply(
        `🎵 Informe o *nome da música* ou *link do YouTube* junto com o comando, ou responda a um áudio enviando a imagem/GIF!\n\n` +
        buildUsageHelp(prefix, command)
      );
    }
    if (detected.reason === "MISSING_VISUAL_FOR_QUERY") {
      return await reply(
        `🖼️ *Faltou a figurinha, imagem ou GIF* para colocar esse áudio!\n\n` +
        `• *Responda uma figurinha ou GIF* com:\n  \`${cmd} ${detected.query}\`\n` +
        `• Ou *envie uma imagem/GIF* com \`${cmd} ${detected.query}\` na legenda.\n` +
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
      try {
        processed = await processVideoMode(videoBuffer, metadata);
      } catch (vidErr) {
        if (detected.isGif && vidErr?.code === "NO_AUDIO_TRACK") {
          const cmd = `${prefix}${command}`;
          throw new MediaValidationError(
            "NO_AUDIO_TRACK",
            `🎞️ *Este GIF não possui áudio próprio!*\n\n` +
              `Para transformar esse GIF em *figurinha animada com áudio*:\n` +
              `• *Responda o GIF* com: \`${cmd} nome da música\` ou \`${cmd} https://youtu.be/...\`\n` +
              `• Ou *responda um áudio* enviando o GIF com \`${cmd}\` na legenda!`
          );
        }
        throw vidErr;
      }
    }

    // ─── MODO 4: Imagem/Figurinha/GIF/Vídeo + Áudio respondido (local, sem créditos) ───
    else if (detected.mode === 4) {
      const isAnimVisual = detected.visualType === "video" || detected.visualType === "gif";
      const [visualBuffer, audioBuffer] = await Promise.all([
        downloadMediaBuffer(
          detected.visualMsg,
          detected.downloadType || detected.visualType,
          downloadContentFromMessage,
          { maxBytes: isAnimVisual ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES, timeoutMs: isAnimVisual ? 60000 : 30000 }
        ),
        downloadMediaBuffer(
          detected.audioMsg,
          "audio",
          downloadContentFromMessage,
          { maxBytes: MAX_AUDIO_BYTES }
        ),
      ]);
      processed = await processImageAudioMode(
        visualBuffer,
        audioBuffer,
        metadata,
        detected.visualType
      );
    }

    // ─── MODO 1: Link (YouTube, TikTok ou Instagram) + Imagem/Figurinha/GIF/Vídeo ───
    else if (detected.mode === 1) {
      const isYt = isValidYouTubeUrl(detected.query);
      const isTt = isValidTikTokUrl(detected.query);
      const isIg = isValidInstagramUrl(detected.query);

      if (!isYt && !isTt && !isIg) {
        return await reply(
          "❌ *Link não suportado.*\n" +
          "> Envie um link válido do *YouTube*, *TikTok* ou *Instagram* (Reels/vídeo)."
        );
      }

      const isAnimVisual = detected.visualType === "video" || detected.visualType === "gif";
      let audioPromise;
      if (isYt) {
        const normalizedYt = normalizeYouTubeUrl(detected.query);
        const hasSpiderToken = Boolean(getSpiderConfig(settings).token);
        audioPromise =
          !hasSpiderToken && reqapi
            ? fetchAudioViaBronxysFallback(normalizedYt, reqapi, httpClient)
            : fetchYouTubeAudioByUrl(normalizedYt, { settings, httpClient });
      } else if (isTt) {
        audioPromise = fetchTikTokMediaBuffer(detected.query, reqapi, httpClient);
      } else {
        audioPromise = fetchInstagramMediaBuffer(detected.query, reqapi, httpClient);
      }

      const [visualBuffer, musicData] = await Promise.all([
        downloadMediaBuffer(
          detected.visualMsg,
          detected.downloadType || detected.visualType,
          downloadContentFromMessage,
          { maxBytes: isAnimVisual ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES, timeoutMs: isAnimVisual ? 60000 : 30000 }
        ),
        audioPromise,
      ]);

      processed = await processMusicStickerMode(
        visualBuffer,
        detected.visualType,
        musicData.buffer,
        1,
        metadata
      );
      if (isTt || isIg) {
        processed.usesApiCredits = false;
      }
    }

    // ─── MODO 5: Link direto do TikTok ou Instagram Reels (sem visual citado -> vira figurinha animada com áudio dos primeiros 10s!) ───
    else if (detected.mode === 5) {
      const mediaData =
        detected.platform === "tiktok"
          ? await fetchTikTokMediaBuffer(detected.query, reqapi, httpClient)
          : await fetchInstagramMediaBuffer(detected.query, reqapi, httpClient);
      processed = await processVideoMode(mediaData.buffer, metadata);
      processed.mode = 5;
      processed.usesApiCredits = false;
    }

    // ─── MODO 2: Nome do áudio/meme/música + Imagem/Figurinha/GIF/Vídeo ───
    // Prioridade: TikTok (melhor catálogo de áudios de memes, 0 créditos) -> fallback automático p/ YouTube
    else if (detected.mode === 2) {
      const isAnimVisual = detected.visualType === "video" || detected.visualType === "gif";
      const hasSpiderToken = Boolean(getSpiderConfig(settings).token);

      const visualPromise = downloadMediaBuffer(
        detected.visualMsg,
        detected.downloadType || detected.visualType,
        downloadContentFromMessage,
        { maxBytes: isAnimVisual ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES, timeoutMs: isAnimVisual ? 60000 : 30000 }
      );
      const tiktokSearchPromise = searchAndFetchTikTokAudioByName(detected.query, {
        httpClient,
        reqapi,
      }).catch((ttErr) => ({ __tiktokError: ttErr }));

      const [visualBuffer, tiktokResult] = await Promise.all([
        visualPromise,
        tiktokSearchPromise,
      ]);

      let resolvedFromTikTok = false;
      if (!tiktokResult?.__tiktokError && Buffer.isBuffer(tiktokResult?.buffer)) {
        try {
          processed = await processMusicStickerMode(
            visualBuffer,
            detected.visualType,
            tiktokResult.buffer,
            2,
            metadata
          );
          processed.usesApiCredits = false;
          processed.audioSource = "tiktok_search";
          resolvedFromTikTok = true;
          console.log(
            `[STICKERAUDIO][MODO 2] Áudio obtido via TikTok: "${String(tiktokResult.title || detected.query).slice(0, 60)}" (${tiktokResult.buffer.length}B)`
          );
        } catch (ttProcErr) {
          console.warn(
            `[STICKERAUDIO][MODO 2] Áudio retornado pelo TikTok inválido (${sanitizeSecrets(ttProcErr?.message || ttProcErr)}); usando fallback YouTube...`
          );
        }
      } else {
        console.log(
          `[STICKERAUDIO][MODO 2] TikTok indisponível/sem resultado (${sanitizeSecrets(tiktokResult?.__tiktokError?.message || "empty")}); usando fallback YouTube para "${detected.query.slice(0, 60)}"`
        );
      }

      if (!resolvedFromTikTok) {
        let ytData;
        if (!hasSpiderToken && reqapi) {
          ytData = await fetchAudioViaBronxysFallback(detected.query, reqapi, httpClient);
        } else {
          try {
            ytData = await fetchYouTubeAudioByName(detected.query, { settings, httpClient });
          } catch (spiderErr) {
            if (
              reqapi &&
              typeof reqapi.play === "function" &&
              (spiderErr?.code === "SPIDERX_NO_CREDITS" ||
                spiderErr?.code === "SPIDERX_UNAVAILABLE" ||
                spiderErr?.code === "SPIDERX_TIMEOUT")
            ) {
              console.warn(
                `[STICKERAUDIO][MODO 2] Spider X falhou (${spiderErr.code}); tentando fallback YouTube Bronxys...`
              );
              ytData = await fetchAudioViaBronxysFallback(detected.query, reqapi, httpClient);
            } else {
              throw spiderErr;
            }
          }
        }

        processed = await processMusicStickerMode(
          visualBuffer,
          detected.visualType,
          ytData.buffer,
          2,
          metadata
        );
        processed.audioSource = ytData.source || "youtube";
        processed.usesApiCredits = ytData.source !== "bronxys_fallback";
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
      audioSource: processed.audioSource || null,
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
      try {
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
      } catch (audioSendErr) {
        console.warn(
          `[AUTOFIGU] Falha ao enviar figurinha com áudio (${sanitizeSecrets(audioSendErr?.message || audioSendErr)}); enviando figurinha animada sem áudio como fallback.`
        );
      }
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

/**
 * Manipulador completo do !autofigu / !autofigurinha / !autosticker em grupos:
 * - Funciona normalmente mesmo em grupos com Mensagens Temporárias (ephemeralMessage).
 * - Fotos (imageMessage) -> figurinha quadrada 512x512 automática.
 * - Vídeos (videoMessage / ptvMessage) -> detecta se há áudio:
 *     • COM áudio: recorta primeiros 10s e envia figurinha animada COM ÁUDIO (#134/#24/#25/#26).
 *     • SEM áudio / GIF: recorta primeiros 10s e envia figurinha animada normal.
 * - Documentos GIF (image/gif) -> envia figurinha animada normal.
 * - Ignora mensagens enviadas pelo próprio bot, visualização única e legendas que sejam comandos.
 */
async function handleAutoFiguMedia({
  conn,
  from,
  info,
  groupName,
  pushname,
  NomeDoBot,
  NickDono,
  prefix,
  isCmd,
  downloadContentFromMessage,
}) {
  if (!info?.message || info?.key?.fromMe) {
    return { ok: false, skipped: true, reason: "FROM_ME_OR_EMPTY" };
  }

  const { unwrapped, isViewOnce } = unwrapMessageContainer(info.message);
  if (!unwrapped || isViewOnce) {
    return { ok: false, skipped: true, reason: "VIEW_ONCE_OR_EMPTY" };
  }

  const imgMsg = unwrapped.imageMessage || null;
  const vidMsg = unwrapped.videoMessage || unwrapped.ptvMessage || null;
  const docMsg = unwrapped.documentMessage || null;
  const isGifDoc = Boolean(
    docMsg &&
      (/gif/i.test(String(docMsg.mimetype || "")) ||
        /\.gif$/i.test(String(docMsg.fileName || "")))
  );

  if (!imgMsg && !vidMsg && !isGifDoc) {
    return { ok: false, skipped: true, reason: "NOT_MEDIA" };
  }

  // Evitar duplicação quando a legenda da mídia é um comando explícito (ex.: !s, /sa, !figaudio, .f)
  const rawCaption = String(
    imgMsg?.caption || vidMsg?.caption || docMsg?.caption || ""
  ).trim();
  if (rawCaption) {
    const cleanPref = String(prefix || "").trim();
    const startsWithActivePrefix =
      cleanPref.length > 0 && rawCaption.toLowerCase().startsWith(cleanPref.toLowerCase());
    const looksLikeExplicitCmd = /^[!/.#?]\s*[a-zA-Z0-9]/.test(rawCaption);
    if (isCmd || startsWithActivePrefix || looksLikeExplicitCmd) {
      return { ok: false, skipped: true, reason: "COMMAND_CAPTION" };
    }
  }

  const metadata = {
    packname: `⚝ ⇝ Grupo:\n${groupName || NomeDoBot || "Aleatory-Bot"}`,
    author: `⚒${pushname || "Usuário"}\n⚒${NomeDoBot || "Aleatory-Bot"}\n${NickDono || "Aleatory"}`,
    categories: ["🎵"],
  };

  // 1) Vídeo, vídeo circular (ptv) ou GIF (videoMessage gifPlayback) -> com áudio ou sem áudio
  if (vidMsg) {
    return await handleAutoFiguVideoAudioSticker({
      conn,
      from,
      info,
      groupName,
      pushname,
      NomeDoBot,
      NickDono,
      downloadContentFromMessage,
    });
  }

  // 2) Foto (imageMessage) -> figurinha estática 512x512
  if (imgMsg) {
    try {
      const imgBuffer = await downloadMediaBuffer(
        imgMsg,
        "image",
        downloadContentFromMessage,
        { maxBytes: MAX_IMAGE_BYTES, timeoutMs: 30000 }
      );
      const webpRes = await convertVisualBufferToStickerWebp(imgBuffer, "image", metadata);
      await conn.sendMessage(from, { sticker: webpRes.buffer }, { quoted: info });
      console.log(`[AUTOFIGU][IMAGEM] from=${from} sticker=${webpRes.buffer.length}B`);
      return {
        ok: true,
        mode: "autofigu_image_sticker",
        hasAudio: false,
        webpBytes: webpRes.buffer.length,
        deliveryMode: "standard_sticker",
      };
    } catch (err) {
      console.error(
        `[AUTOFIGU][IMAGEM][ERRO] from=${from}:`,
        sanitizeSecrets(err?.message || err)
      );
      return { ok: false, code: err?.code || "AUTOFIGU_IMAGE_ERROR" };
    }
  }

  // 3) Arquivo GIF enviado como documento (image/gif)
  if (isGifDoc) {
    try {
      const gifBuffer = await downloadMediaBuffer(
        docMsg,
        "document",
        downloadContentFromMessage,
        { maxBytes: MAX_VIDEO_BYTES, timeoutMs: 60000 }
      );
      const webpRes = await convertVisualBufferToStickerWebp(gifBuffer, "gif", metadata);
      await conn.sendMessage(from, { sticker: webpRes.buffer }, { quoted: info });
      console.log(`[AUTOFIGU][GIF-DOC] from=${from} sticker=${webpRes.buffer.length}B`);
      return {
        ok: true,
        mode: "autofigu_gif_sticker",
        hasAudio: false,
        webpBytes: webpRes.buffer.length,
        deliveryMode: "standard_sticker",
      };
    } catch (err) {
      console.error(
        `[AUTOFIGU][GIF-DOC][ERRO] from=${from}:`,
        sanitizeSecrets(err?.message || err)
      );
      return { ok: false, code: err?.code || "AUTOFIGU_GIF_ERROR" };
    }
  }

  return { ok: false, skipped: true, reason: "UNHANDLED" };
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
  isValidTikTokUrl,
  isValidInstagramUrl,
  searchAndFetchTikTokAudioByName,
  fetchTikTokMediaBuffer,
  fetchInstagramMediaBuffer,
  buildUsageHelp,
  buildInfoFigAudioTutorial,
  handleStickerAudioCommand,
  handleAutoFiguVideoAudioSticker,
  handleAutoFiguMedia,
};
