"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const protobuf = require("protobufjs/minimal");

const AUDIO_STICKER_INNER_TAG_BYTES = Buffer.from([0xd2, 0x01]);
const AUDIO_STICKER_OUTER_TAG_BYTES = Buffer.from([0xb2, 0x08]);

/**
 * Camada de compatibilidade e abstração WhatsApp (Aleatory v8/v9).
 *
 * - Detecta dinamicamente a biblioteca instalada (@whiskeysockets/baileys) e a versão
 *   do projeto, preservando 100% da sessão e conexão existentes.
 * - Implementa envio NATIVO de figurinhas com áudio no @whiskeysockets/baileys@7.x
 *   sem alterar arquivos em node_modules e sem depender de pastas externas:
 *     • Patch idempotente em WAProto (encode + fromObject):
 *         - StickerMessage campo #26 (tag 210 / 0xd2 0x01) -> audioMessage
 *         - Message campo #134 (tag 1074 / 0xb2 0x08) -> audioStickerMessage (FutureProofMessage)
 *     • Upload nativo via prepareWAMessageMedia + conn.waUploadToServer
 *     • Payload oficial: { messageContextInfo: { messageSecret }, audioStickerMessage: { message: { stickerMessage: { ..., audioMessage } } } }
 *     • Envio em 1 única mensagem via conn.relayMessage(jid, payload, { messageId })
 * - Normaliza extração de quotedMessage e containers viewOnce (imagem, vídeo, áudio e texto).
 */

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const DEFAULT_MAX_MEDIA_BYTES = 25 * 1024 * 1024; // 25 MB
const DEFAULT_DOWNLOAD_TIMEOUT_MS = 30000;

const AUDIO_STICKER_INNER_TAG = 210; // (26 << 3) | 2  -> 0xd2 0x01 (StickerMessage.audioMessage)
const AUDIO_STICKER_OUTER_TAG = 1074; // (134 << 3) | 2 -> 0xb2 0x08 (Message.audioStickerMessage)

let _cachedCapabilities = null;

function safeReadJson(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch {
    // ignorar erro de leitura
  }
  return null;
}

/**
 * Instala (de forma idempotente em memória) suporte aos campos protobuf oficiais
 * de figurinha com áudio no Baileys (encode e fromObject), preservando todas as
 * demais mensagens do WhatsApp intactas.
 */
function installNativeAudioStickerProtoExtension(baileysOrProto) {
  const proto = baileysOrProto?.Message
    ? baileysOrProto
    : baileysOrProto?.proto || baileysOrProto?.WAProto;

  const Message = proto?.Message;
  const StickerMessage = Message?.StickerMessage;
  const AudioMessage = Message?.AudioMessage;
  const FutureProofMessage = Message?.FutureProofMessage;

  if (!Message || !StickerMessage || !AudioMessage || !FutureProofMessage) {
    return false;
  }

  if (Message.__aleatoryAudioStickerPatched) {
    return true;
  }

  const stickerEncode = StickerMessage.encode.bind(StickerMessage);
  StickerMessage.encode = function encode(message, writer) {
    writer = stickerEncode(message, writer);
    if (message?.audioMessage != null) {
      AudioMessage.encode(
        message.audioMessage,
        writer.uint32(AUDIO_STICKER_INNER_TAG).fork()
      ).ldelim();
    }
    return writer;
  };

  const stickerFromObject = StickerMessage.fromObject.bind(StickerMessage);
  StickerMessage.fromObject = function fromObject(object) {
    const message = stickerFromObject(object);
    if (object?.audioMessage != null) {
      message.audioMessage = AudioMessage.fromObject(object.audioMessage);
    }
    return message;
  };

  const messageEncode = Message.encode.bind(Message);
  Message.encode = function encode(message, writer) {
    writer = messageEncode(message, writer);
    if (message?.audioStickerMessage != null) {
      FutureProofMessage.encode(
        message.audioStickerMessage,
        writer.uint32(AUDIO_STICKER_OUTER_TAG).fork()
      ).ldelim();
    }
    return writer;
  };

  const messageFromObject = Message.fromObject.bind(Message);
  Message.fromObject = function fromObject(object) {
    const message = messageFromObject(object);
    if (object?.audioStickerMessage != null) {
      message.audioStickerMessage = FutureProofMessage.fromObject(
        object.audioStickerMessage
      );
    }
    return message;
  };

  const extractRawSlice = (readerOrBuf, length) => {
    if (readerOrBuf instanceof Uint8Array) {
      return length === undefined ? readerOrBuf : readerOrBuf.subarray(0, length);
    }
    if (readerOrBuf && readerOrBuf.buf instanceof Uint8Array) {
      const start = readerOrBuf.pos || 0;
      const end = length === undefined ? readerOrBuf.len : start + length;
      return readerOrBuf.buf.subarray(start, end);
    }
    return null;
  };

  const scanEmbeddedField = (rawSlice, targetTag, decodeFn) => {
    const reader = protobuf.Reader.create(rawSlice);
    while (reader.pos < reader.len) {
      const tag = reader.uint32();
      if (tag === targetTag) {
        return decodeFn(reader.bytes());
      }
      reader.skipType(tag & 7);
    }
    return null;
  };

  const stickerDecode = StickerMessage.decode.bind(StickerMessage);
  StickerMessage.decode = function decode(reader, length) {
    const rawSlice = extractRawSlice(reader, length);
    const message = stickerDecode(reader, length);
    if (
      rawSlice &&
      Buffer.from(rawSlice.buffer, rawSlice.byteOffset, rawSlice.byteLength).includes(
        AUDIO_STICKER_INNER_TAG_BYTES
      )
    ) {
      try {
        const audioMsg = scanEmbeddedField(
          rawSlice,
          AUDIO_STICKER_INNER_TAG,
          (bytes) => AudioMessage.decode(bytes)
        );
        if (audioMsg) message.audioMessage = audioMsg;
      } catch {
        // preservar decodificação padrão em caso de bytes inesperados
      }
    }
    return message;
  };

  const messageDecode = Message.decode.bind(Message);
  Message.decode = function decode(reader, length) {
    const rawSlice = extractRawSlice(reader, length);
    const message = messageDecode(reader, length);
    if (
      rawSlice &&
      Buffer.from(rawSlice.buffer, rawSlice.byteOffset, rawSlice.byteLength).includes(
        AUDIO_STICKER_OUTER_TAG_BYTES
      )
    ) {
      try {
        const fpMsg = scanEmbeddedField(
          rawSlice,
          AUDIO_STICKER_OUTER_TAG,
          (bytes) => FutureProofMessage.decode(bytes)
        );
        if (fpMsg) message.audioStickerMessage = fpMsg;
      } catch {
        // preservar decodificação padrão em caso de bytes inesperados
      }
    }
    return message;
  };

  Object.defineProperty(Message, "__aleatoryAudioStickerPatched", {
    value: true,
    enumerable: false,
  });

  return true;
}

/**
 * Constrói o payload Protobuf oficial de figurinha com áudio do WhatsApp para Baileys 7.x:
 *  {
 *    messageContextInfo: { messageSecret },
 *    audioStickerMessage: {
 *      message: {
 *        stickerMessage: { ...stickerMessage, audioMessage }
 *      }
 *    }
 *  }
 */
function buildNativeAudioStickerMessage(
  baileysOrProto,
  stickerMessage,
  audioMessage,
  messageSecret = crypto.randomBytes(32)
) {
  const ok = installNativeAudioStickerProtoExtension(baileysOrProto);
  if (!ok) {
    throw new Error(
      "A versão instalada do Baileys não contém os tipos protobuf necessários para figurinhas com áudio."
    );
  }

  return {
    messageContextInfo: { messageSecret },
    audioStickerMessage: {
      message: {
        stickerMessage: {
          ...stickerMessage,
          audioMessage,
        },
      },
    },
  };
}

/**
 * Retorna informações sobre a versão instalada do bot e da biblioteca WhatsApp.
 */
async function getRuntimeCapabilities(forceRefresh = false) {
  if (_cachedCapabilities && !forceRefresh) return _cachedCapabilities;

  const rootPkg = safeReadJson(path.join(PROJECT_ROOT, "package.json")) || {};
  const baileysPkg = safeReadJson(
    path.join(PROJECT_ROOT, "node_modules", "@whiskeysockets", "baileys", "package.json")
  );
  const zapoPkg = safeReadJson(
    path.join(PROJECT_ROOT, "node_modules", "zapo-js", "package.json")
  );

  let engine = "unknown";
  let engineVersion = null;
  let nativeAudioStickerSupport = false;
  let stickerProtoFields = [];

  if (zapoPkg) {
    engine = "zapo-js";
    engineVersion = zapoPkg.version || null;
    nativeAudioStickerSupport = true;
  } else if (baileysPkg) {
    engine = "@whiskeysockets/baileys";
    engineVersion = baileysPkg.version || null;
  }

  if (baileysPkg) {
    try {
      const baileys = await import("@whiskeysockets/baileys");
      const StickerProto = baileys?.proto?.Message?.StickerMessage;
      if (StickerProto && StickerProto.prototype) {
        stickerProtoFields = Object.keys(StickerProto.prototype).filter(
          (k) => !k.startsWith("_")
        );
      }
      nativeAudioStickerSupport = installNativeAudioStickerProtoExtension(baileys);
    } catch {
      // fallback seguro
    }
  }

  const rawVersion = String(rootPkg.version || "8.0.0");
  const majorMatch = rawVersion.match(/^(\d+)/);
  const botMajor = majorMatch ? Number(majorMatch[1]) : 8;

  _cachedCapabilities = {
    botName: rootPkg.name || "aleatory-bot",
    botVersion: rawVersion,
    botMajor,
    compatV8V9: botMajor === 8 || botMajor === 9,
    engine,
    engineVersion,
    zapoInstalled: Boolean(zapoPkg),
    zapoVersion: zapoPkg?.version || null,
    zapoTargetVersion: "1.12.0",
    nativeAudioStickerSupport,
    nativeAudioStickerMode: nativeAudioStickerSupport
      ? "baileys_audioStickerMessage_134_26"
      : "unavailable",
    stickerProtoFields,
    viewOnceSupport: {
      image: true,
      video: true,
      audio: true,
      text: true,
      containers: [
        "viewOnceMessage",
        "viewOnceMessageV2",
        "viewOnceMessageV2Extension",
        "ephemeralMessage",
      ],
    },
  };

  return _cachedCapabilities;
}

/**
 * Extrai contextInfo de qualquer tipo de mensagem do WhatsApp/Baileys.
 */
function getContextInfo(messageObj) {
  if (!messageObj || typeof messageObj !== "object") return null;

  const { unwrapped } = unwrapMessageContainer(messageObj);
  const target = unwrapped || messageObj;

  const candidates = [
    target.extendedTextMessage,
    target.imageMessage,
    target.videoMessage,
    target.audioMessage,
    target.stickerMessage,
    target.documentMessage,
    target.documentWithCaptionMessage?.message?.documentMessage,
    target.buttonsResponseMessage,
    target.listResponseMessage,
    target.templateButtonReplyMessage,
    target.ptvMessage,
  ];

  for (const item of candidates) {
    if (item && typeof item === "object" && item.contextInfo) {
      return item.contextInfo;
    }
  }
  return null;
}

/**
 * Extrai quotedMessage de qualquer tipo de mensagem (texto, imagem com legenda,
 * vídeo com legenda, áudio, figurinha, documento, efêmera ou viewOnce).
 */
function getQuotedMessage(info) {
  const ctx = getContextInfo(info?.message);
  return ctx?.quotedMessage || null;
}

/**
 * Desembrulha containers de mensagem (ephemeral, viewOnce, viewOnceV2,
 * viewOnceV2Extension, editedMessage, documentWithCaptionMessage) sem mutar
 * o objeto original.
 */
function unwrapMessageContainer(messageObj) {
  let current = messageObj;
  let isViewOnce = false;
  let containerType = null;
  let depth = 0;

  while (current && typeof current === "object" && depth < 6) {
    depth++;
    if (current.ephemeralMessage?.message) {
      current = current.ephemeralMessage.message;
      continue;
    }
    if (current.viewOnceMessage?.message) {
      isViewOnce = true;
      containerType = containerType || "viewOnceMessage";
      current = current.viewOnceMessage.message;
      continue;
    }
    if (current.viewOnceMessageV2?.message) {
      isViewOnce = true;
      containerType = containerType || "viewOnceMessageV2";
      current = current.viewOnceMessageV2.message;
      continue;
    }
    if (current.viewOnceMessageV2Extension?.message) {
      isViewOnce = true;
      containerType = containerType || "viewOnceMessageV2Extension";
      current = current.viewOnceMessageV2Extension.message;
      continue;
    }
    if (current.editedMessage?.message) {
      current = current.editedMessage.message;
      continue;
    }
    if (current.documentWithCaptionMessage?.message) {
      current = current.documentWithCaptionMessage.message;
      continue;
    }
    if (current.audioStickerMessage?.message) {
      current = current.audioStickerMessage.message;
      continue;
    }
    break;
  }

  return { unwrapped: current, isViewOnce, containerType };
}

/**
 * Extrai o payload de uma mensagem de visualização única (citada ou direta)
 * suportando imagem, vídeo, áudio e texto.
 */
function extractViewOncePayload(info) {
  const ctx = getContextInfo(info?.message);
  const quoted = ctx?.quotedMessage || null;
  const stanzaId = ctx?.stanzaId || null;
  const sources = [];
  if (quoted) sources.push({ raw: quoted, fromQuoted: true, stanzaId });
  if (info?.message) {
    sources.push({
      raw: info.message,
      fromQuoted: false,
      stanzaId: info?.key?.id || null,
    });
  }

  if (sources.length === 0) {
    return { found: false, reason: "NO_MESSAGE", detectedType: null };
  }

  let sawNonViewOnce = false;
  let lastDetectedType = null;

  for (const src of sources) {
    const { unwrapped, isViewOnce: wrappedAsViewOnce, containerType } =
      unwrapMessageContainer(src.raw);

    if (!unwrapped || typeof unwrapped !== "object") continue;

    if (unwrapped.imageMessage) {
      const media = unwrapped.imageMessage;
      const isVO = wrappedAsViewOnce || Boolean(media.viewOnce);
      if (isVO) {
        return {
          found: true,
          kind: "image",
          media,
          caption: media.caption || "",
          mimetype: media.mimetype || "image/jpeg",
          containerType: containerType || "direct.viewOnce",
          fromQuoted: src.fromQuoted,
          stanzaId: src.stanzaId,
          hasMediaCredentials: Boolean(
            media.mediaKey && (media.url || media.directPath)
          ),
        };
      }
      sawNonViewOnce = true;
      lastDetectedType = "image";
      continue;
    }

    if (unwrapped.videoMessage || unwrapped.ptvMessage) {
      const media = unwrapped.videoMessage || unwrapped.ptvMessage;
      const isVO = wrappedAsViewOnce || Boolean(media.viewOnce);
      if (isVO) {
        return {
          found: true,
          kind: "video",
          media,
          caption: media.caption || "",
          mimetype: media.mimetype || "video/mp4",
          gifPlayback: Boolean(media.gifPlayback),
          ptv: Boolean(unwrapped.ptvMessage),
          containerType: containerType || "direct.viewOnce",
          fromQuoted: src.fromQuoted,
          stanzaId: src.stanzaId,
          hasMediaCredentials: Boolean(
            media.mediaKey && (media.url || media.directPath)
          ),
        };
      }
      sawNonViewOnce = true;
      lastDetectedType = "video";
      continue;
    }

    if (unwrapped.audioMessage) {
      const media = unwrapped.audioMessage;
      const isVO = wrappedAsViewOnce || Boolean(media.viewOnce);
      if (isVO) {
        return {
          found: true,
          kind: "audio",
          media,
          mimetype: media.mimetype || "audio/ogg; codecs=opus",
          ptt: Boolean(media.ptt),
          seconds: Number(media.seconds || 0),
          containerType: containerType || "direct.viewOnce",
          fromQuoted: src.fromQuoted,
          stanzaId: src.stanzaId,
          hasMediaCredentials: Boolean(
            media.mediaKey && (media.url || media.directPath)
          ),
        };
      }
      sawNonViewOnce = true;
      lastDetectedType = "audio";
      continue;
    }

    if (unwrapped.extendedTextMessage || typeof unwrapped.conversation === "string") {
      const ext = unwrapped.extendedTextMessage;
      const isVO = wrappedAsViewOnce || Boolean(ext?.viewOnce);
      if (isVO) {
        const text =
          (typeof ext?.text === "string" && ext.text) ||
          (typeof unwrapped.conversation === "string" && unwrapped.conversation) ||
          "";
        return {
          found: true,
          kind: "text",
          text: text.trim(),
          mentions: Array.isArray(ext?.contextInfo?.mentionedJid)
            ? ext.contextInfo.mentionedJid
            : [],
          containerType: containerType || "direct.viewOnce",
          fromQuoted: src.fromQuoted,
          stanzaId: src.stanzaId,
          hasTextContent: text.trim().length > 0,
        };
      }
      if (src.fromQuoted) {
        sawNonViewOnce = true;
        lastDetectedType = "text";
      }
      continue;
    }

    if (wrappedAsViewOnce) {
      const innerKeys = Object.keys(unwrapped).filter(
        (k) => k !== "messageContextInfo"
      );
      return {
        found: false,
        reason: "UNSUPPORTED_TYPE",
        detectedType: innerKeys[0] || "unknown",
        containerType,
      };
    }

    if (src.fromQuoted) {
      const innerKeys = Object.keys(unwrapped).filter(
        (k) => k !== "messageContextInfo"
      );
      sawNonViewOnce = true;
      lastDetectedType = innerKeys[0] || "unknown";
    }
  }

  return {
    found: false,
    reason: sawNonViewOnce ? "NOT_VIEW_ONCE" : "NO_MESSAGE",
    detectedType: lastDetectedType,
  };
}

/**
 * Baixa e descriptografa mídia usando downloadContentFromMessage do Baileys
 * com limite de tamanho e timeout.
 */
async function downloadMediaBuffer(
  mediaObj,
  mediaType,
  downloadContentFromMessageFn,
  options = {}
) {
  const maxBytes = options.maxBytes || DEFAULT_MAX_MEDIA_BYTES;
  const timeoutMs = options.timeoutMs || DEFAULT_DOWNLOAD_TIMEOUT_MS;

  if (!mediaObj || typeof mediaObj !== "object") {
    const err = new Error("Objeto de mídia inválido.");
    err.code = "INVALID_MEDIA";
    throw err;
  }

  if (!mediaObj.mediaKey || (!mediaObj.url && !mediaObj.directPath)) {
    const err = new Error(
      "Mídia sem credenciais de descriptografia (pode ter expirado ou sido restringida pelo WhatsApp)."
    );
    err.code = "MISSING_CREDENTIALS";
    throw err;
  }

  let downloadFn = downloadContentFromMessageFn;
  if (typeof downloadFn !== "function") {
    const baileys = await import("@whiskeysockets/baileys");
    downloadFn = baileys.downloadContentFromMessage;
  }

  if (typeof downloadFn !== "function") {
    const err = new Error("Função downloadContentFromMessage indisponível.");
    err.code = "DOWNLOAD_UNAVAILABLE";
    throw err;
  }

  let timer = null;
  let stream = null;

  try {
    const downloadPromise = (async () => {
      stream = await downloadFn(mediaObj, mediaType);
      const chunks = [];
      let total = 0;

      for await (const chunk of stream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buf.length;
        if (total > maxBytes) {
          if (typeof stream.destroy === "function") stream.destroy();
          const err = new Error(
            `Mídia excede o limite permitido de ${Math.round(maxBytes / (1024 * 1024))} MB.`
          );
          err.code = "MEDIA_TOO_LARGE";
          throw err;
        }
        chunks.push(buf);
      }

      const fullBuffer = Buffer.concat(chunks);
      if (!fullBuffer.length) {
        const err = new Error("Mídia baixada está vazia.");
        err.code = "EMPTY_MEDIA";
        throw err;
      }
      return fullBuffer;
    })();

    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        if (stream && typeof stream.destroy === "function") {
          try {
            stream.destroy();
          } catch {
            // ignorar
          }
        }
        const err = new Error("Tempo limite excedido ao baixar a mídia do WhatsApp.");
        err.code = "MEDIA_TIMEOUT";
        reject(err);
      }, timeoutMs);
    });

    return await Promise.race([downloadPromise, timeoutPromise]);
  } catch (err) {
    if (err?.code) throw err;
    const msg = String(err?.message || err || "");
    const status = err?.output?.statusCode || err?.statusCode || err?.response?.status;
    if (
      status === 403 ||
      status === 404 ||
      status === 410 ||
      /403|404|410|expired|gone/i.test(msg)
    ) {
      const wrapped = new Error(
        "Mídia expirada ou indisponível nos servidores do WhatsApp."
      );
      wrapped.code = "MEDIA_UNAVAILABLE";
      throw wrapped;
    }
    const wrapped = new Error(`Falha ao baixar/descriptografar mídia: ${msg}`);
    wrapped.code = "DECRYPT_ERROR";
    throw wrapped;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function hasNativeAudioStickerSupport(conn) {
  if (conn && typeof conn.sendAudioSticker === "function") return true;
  if (
    conn &&
    typeof conn.relayMessage === "function" &&
    typeof conn.waUploadToServer === "function"
  ) {
    const caps = await getRuntimeCapabilities();
    return Boolean(caps.nativeAudioStickerSupport);
  }
  const caps = await getRuntimeCapabilities();
  return Boolean(caps.nativeAudioStickerSupport);
}

/**
 * Envia figurinha com áudio NATIVA do WhatsApp (1 única figurinha com som)
 * usando exatamente o fluxo validado para @whiskeysockets/baileys@7.x:
 *
 * 1. Faz upload paralelo do sticker WebP e do áudio OGG/Opus (ptt: true) via
 *    prepareWAMessageMedia + conn.waUploadToServer.
 * 2. Preenche width, height, isAnimated, isLottie=false, contextInfo (quote)
 *    no stickerMessage e mimetype, ptt=true, seconds, waveform no audioMessage.
 * 3. Monta { messageContextInfo: { messageSecret }, audioStickerMessage: { message: { stickerMessage: { ..., audioMessage } } } }
 *    com patch em StickerMessage/Message (encode + fromObject).
 * 4. Dispara via conn.relayMessage(jid, payload, { messageId }) com messageId hex 20 chars.
 */
async function sendStickerWithAudio(conn, jid, payload, sendOptions = {}) {
  if (!conn) throw new Error("Conexão WhatsApp indisponível.");

  const {
    webpBuffer,
    audioBuffer,
    width = 512,
    height = 512,
    isAnimated = false,
    audioDuration = 1,
    waveform = null,
  } = payload || {};

  if (!Buffer.isBuffer(webpBuffer) || !webpBuffer.length) {
    throw new Error("Buffer WebP da figurinha está vazio.");
  }
  if (!Buffer.isBuffer(audioBuffer) || !audioBuffer.length) {
    throw new Error("Buffer de áudio está vazio.");
  }

  // Caminho alternativo caso a conexão exponha sendAudioSticker nativo (ex.: ZAPO)
  if (typeof conn.sendAudioSticker === "function") {
    const sent = await conn.sendAudioSticker(jid, webpBuffer, audioBuffer, sendOptions);
    return {
      deliveryMode: "native_audio_sticker",
      nativeAudioSticker: true,
      messageId: sent?.key?.id || sent?.id || null,
      stickerMsg: sent,
    };
  }

  if (
    typeof conn.waUploadToServer !== "function" ||
    typeof conn.relayMessage !== "function"
  ) {
    throw new Error(
      "A conexão Baileys atual não disponibiliza waUploadToServer/relayMessage para figurinhas com áudio."
    );
  }

  const baileys = sendOptions._baileysMod || (await import("@whiskeysockets/baileys"));
  const prepareWAMessageMedia = baileys.prepareWAMessageMedia;
  if (typeof prepareWAMessageMedia !== "function") {
    throw new Error("prepareWAMessageMedia não está disponível nesta versão do Baileys.");
  }

  const normalizedSeconds = Math.max(
    1,
    Math.min(30, Math.ceil(Number(audioDuration) || 1))
  );
  const normalizedWaveform =
    Buffer.isBuffer(waveform) || waveform instanceof Uint8Array
      ? Buffer.from(waveform)
      : Buffer.alloc(64, 15);

  const [stickerMedia, audioMedia] = await Promise.all([
    prepareWAMessageMedia(
      { sticker: webpBuffer },
      { upload: conn.waUploadToServer }
    ),
    prepareWAMessageMedia(
      {
        audio: audioBuffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        seconds: normalizedSeconds,
        waveform: normalizedWaveform,
      },
      { upload: conn.waUploadToServer }
    ),
  ]);

  const stickerMessage = stickerMedia?.stickerMessage;
  const audioMessage = audioMedia?.audioMessage;
  if (!stickerMessage || !audioMessage) {
    throw new Error("O Baileys não preparou o stickerMessage ou audioMessage.");
  }

  stickerMessage.width = Number(width) || 512;
  stickerMessage.height = Number(height) || 512;
  stickerMessage.isAnimated = isAnimated === true;
  stickerMessage.isLottie = false;
  stickerMessage.stickerSentTs = Date.now();

  const quoted = sendOptions.quoted;
  if (quoted?.key?.id && quoted?.message) {
    stickerMessage.contextInfo = {
      stanzaId: quoted.key.id,
      ...(quoted.key.participant ? { participant: quoted.key.participant } : {}),
      quotedMessage: quoted.message,
    };
  }

  audioMessage.mimetype = "audio/ogg; codecs=opus";
  audioMessage.ptt = true;
  audioMessage.seconds = normalizedSeconds;
  audioMessage.waveform = normalizedWaveform;

  const protoPayload = buildNativeAudioStickerMessage(
    baileys.proto || baileys.WAProto,
    stickerMessage,
    audioMessage,
    crypto.randomBytes(32)
  );

  const messageId = crypto.randomBytes(10).toString("hex").toUpperCase();

  if (typeof global._storeOutgoingMessage === "function") {
    global._storeOutgoingMessage(messageId, protoPayload);
  }

  // Escuta de diagnóstico não-bloqueante para ACK do servidor (auto-limpa em 8s)
  if (conn.ws && typeof conn.ws.once === "function") {
    const ackEvent = `CB:ack,class:message,id:${messageId}`;
    const onAck = (node) => {
      clearTimeout(ackTimer);
      console.log(
        `[STICKERAUDIO] SERVER ACK id=${messageId} attrs=${JSON.stringify(node?.attrs || {})}`
      );
    };
    const ackTimer = setTimeout(() => {
      try {
        conn.ws.off?.(ackEvent, onAck);
      } catch {
        // ignorar
      }
    }, 8000);
    conn.ws.once(ackEvent, onAck);
  }

  // Relay exato conforme validado no protocolo Baileys 7.x (sem injetar mediatype inválido na tag <message>)
  await conn.relayMessage(jid, protoPayload, { messageId });

  console.log(
    `[STICKERAUDIO] Enviada via audioStickerMessage (#134/#26) -> jid=${jid} id=${messageId} sticker=${webpBuffer.length}B audio=${audioBuffer.length}B (${audioMessage.seconds}s, animated=${stickerMessage.isAnimated})`
  );

  return {
    deliveryMode: "native_audio_sticker_baileys",
    nativeAudioSticker: true,
    messageId,
    nativeMessage: protoPayload,
  };
}

/**
 * Registra no console metadados técnicos (sem chaves/segredos) quando qualquer
 * figurinha com áudio chega de um celular ou outro bot, facilitando diagnóstico.
 */
function logIncomingAudioSticker(info) {
  try {
    const msg = info?.message;
    if (!msg || typeof msg !== "object") return false;
    const fromWrapper = Boolean(msg.audioStickerMessage?.message?.stickerMessage);
    const sm =
      msg.audioStickerMessage?.message?.stickerMessage ||
      (msg.stickerMessage?.audioMessage ? msg.stickerMessage : null);
    if (!sm) return false;
    const am = sm.audioMessage || null;
    console.log(
      `[STICKERAUDIO-IN] id=${info?.key?.id || "?"} wrapper134=${fromWrapper} ` +
        `sticker={w:${sm.width},h:${sm.height},anim:${Boolean(sm.isAnimated)},lottie:${Boolean(sm.isLottie)},` +
        `sentTs:${Boolean(sm.stickerSentTs)},firstFrame:${sm.firstFrameLength || 0},` +
        `path:${String(sm.directPath || "").slice(0, 24)}} ` +
        `audio=${
          am
            ? `{mime:${am.mimetype},ptt:${Boolean(am.ptt)},sec:${am.seconds},` +
              `wfLen:${am.waveform?.length || 0},sidecar:${am.streamingSidecar?.length || 0},` +
              `path:${String(am.directPath || "").slice(0, 24)}}`
            : "null"
        }`
    );
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  AUDIO_STICKER_INNER_TAG,
  AUDIO_STICKER_OUTER_TAG,
  installNativeAudioStickerProtoExtension,
  buildNativeAudioStickerMessage,
  getRuntimeCapabilities,
  getContextInfo,
  getQuotedMessage,
  unwrapMessageContainer,
  extractViewOncePayload,
  downloadMediaBuffer,
  hasNativeAudioStickerSupport,
  sendStickerWithAudio,
  logIncomingAudioSticker,
};
