"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Camada de compatibilidade e abstração WhatsApp (Aleatory v8/v9).
 *
 * - Detecta dinamicamente a biblioteca instalada (@whiskeysockets/baileys ou zapo-js)
 *   e a versão do projeto, preservando 100% de compatibilidade com a sessão atual.
 * - Implementa extensão runtime não-invasiva para envio NATIVO de figurinhas com áudio
 *   no @whiskeysockets/baileys@7.0.0-rc14 (sem modificar node_modules!), injetando os
 *   campos oficiais do protocolo WhatsApp 2026:
 *     • StickerMessage campo #26 (AudioMessage embutido, tag 210 / wireType 2)
 *     • Message campo #134 (FutureProofMessage wrapper, tag 1074 / wireType 2)
 *   enviados em UMA única bolha via conn.relayMessage().
 * - Normaliza extração de mensagens citadas (quotedMessage) e containers de
 *   visualização única (viewOnceMessage, viewOnceMessageV2, viewOnceMessageV2Extension,
 *   ephemeralMessage e flags viewOnce diretas), sem mutar o objeto original.
 */

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const DEFAULT_MAX_MEDIA_BYTES = 25 * 1024 * 1024; // 25 MB
const DEFAULT_DOWNLOAD_TIMEOUT_MS = 30000;

const AUDIO_STICKER_INNER_TAG = (26 << 3) | 2; // 210 — StickerMessage.audioMessage
const AUDIO_STICKER_OUTER_TAG = (134 << 3) | 2; // 1074 — Message.audioStickerWrapper (FutureProofMessage)

let _cachedCapabilities = null;
let _protoPatched = false;

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
 * Instala (de forma idempotente e apenas em memória) o suporte aos campos #26 e #134
 * no encoder protobuf do Baileys, permitindo enviar figurinhas com áudio NATIVAS em
 * uma única mensagem sem alterar arquivos dentro de node_modules nem afetar nenhuma
 * outra mensagem do bot.
 */
function installNativeAudioStickerProtoExtension(baileysMod) {
  if (_protoPatched) return true;
  const proto = baileysMod?.proto || baileysMod?.WAProto;
  const Message = proto?.Message;
  const StickerMessage = Message?.StickerMessage;

  if (!Message || !StickerMessage || typeof Message.encode !== "function" || typeof StickerMessage.encode !== "function") {
    return false;
  }

  if (!StickerMessage.encode.__aleatoryAudioStickerWrapped) {
    const origStickerEncode = StickerMessage.encode;
    const wrappedStickerEncode = function encode(m, w) {
      const writer = origStickerEncode.call(this, m, w);
      if (m && m.__audioStickerAudioBytes instanceof Uint8Array && m.__audioStickerAudioBytes.length > 0) {
        writer.uint32(AUDIO_STICKER_INNER_TAG).bytes(m.__audioStickerAudioBytes);
      }
      return writer;
    };
    wrappedStickerEncode.__aleatoryAudioStickerWrapped = true;
    StickerMessage.encode = wrappedStickerEncode;
  }

  if (!Message.encode.__aleatoryAudioStickerWrapped) {
    const origMessageEncode = Message.encode;
    const wrappedMessageEncode = function encode(m, w) {
      const writer = origMessageEncode.call(this, m, w);
      if (m && m.__audioStickerWrapperBytes instanceof Uint8Array && m.__audioStickerWrapperBytes.length > 0) {
        writer.uint32(AUDIO_STICKER_OUTER_TAG).bytes(m.__audioStickerWrapperBytes);
      }
      return writer;
    };
    wrappedMessageEncode.__aleatoryAudioStickerWrapped = true;
    Message.encode = wrappedMessageEncode;
  }

  _protoPatched = true;
  return true;
}

/**
 * Constrói o payload Protobuf oficial de uma figurinha com áudio nativa do WhatsApp
 * (mesmo formato binário usado no protocolo 2026 / ZAPO 1.12.0):
 *  - StickerMessage com AudioMessage embutido no campo #26
 *  - FutureProofMessage({ message: { stickerMessage } }) no campo #134 da Message
 */
function buildNativeAudioStickerMessage(baileysMod, stickerMedia, audioMessage) {
  const ok = installNativeAudioStickerProtoExtension(baileysMod);
  if (!ok) {
    throw new Error("Não foi possível inicializar a extensão protobuf de figurinha com áudio.");
  }

  const proto = baileysMod.proto || baileysMod.WAProto;
  const { Message } = proto;

  const cleanAudio = {
    ...audioMessage,
    ptt: true,
    mimetype: audioMessage.mimetype || "audio/ogg; codecs=opus",
  };
  delete cleanAudio.contextInfo;

  const encodedAudio = Message.AudioMessage.encode(cleanAudio).finish();

  const stickerMessage = {
    ...stickerMedia,
    mimetype: stickerMedia.mimetype || "image/webp",
    stickerSentTs: stickerMedia.stickerSentTs || Date.now(),
    contextInfo: undefined,
    __audioStickerAudioBytes: encodedAudio,
  };

  const wrapperBytes = Message.FutureProofMessage.encode({
    message: { stickerMessage },
  }).finish();

  return {
    stickerMessage,
    __audioStickerWrapperBytes: wrapperBytes,
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
      // Com a extensão runtime dos campos #26 e #134, Baileys 7.x suporta envio nativo via relayMessage
      nativeAudioStickerSupport = installNativeAudioStickerProtoExtension(baileys);
    } catch {
      // fallback seguro caso import falhe em ambiente restrito
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
      ? "baileys_proto_fields_26_134"
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
    break;
  }

  return { unwrapped: current, isViewOnce, containerType };
}

/**
 * Extrai o payload de uma mensagem de visualização única (citada ou direta)
 * suportando imagem, vídeo, áudio e texto.
 *
 * Não muta info.message e verifica metadados legítimos entregues pelo WhatsApp.
 */
function extractViewOncePayload(info) {
  const ctx = getContextInfo(info?.message);
  const quoted = ctx?.quotedMessage || null;
  const stanzaId = ctx?.stanzaId || null;
  const sources = [];
  if (quoted) sources.push({ raw: quoted, fromQuoted: true, stanzaId });
  if (info?.message) sources.push({ raw: info.message, fromQuoted: false, stanzaId: info?.key?.id || null });

  if (sources.length === 0) {
    return { found: false, reason: "NO_MESSAGE", detectedType: null };
  }

  let sawNonViewOnce = false;
  let lastDetectedType = null;

  for (const src of sources) {
    const { unwrapped, isViewOnce: wrappedAsViewOnce, containerType } =
      unwrapMessageContainer(src.raw);

    if (!unwrapped || typeof unwrapped !== "object") continue;

    // 1. Imagem de visualização única
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

    // 2. Vídeo de visualização única (inclui PTV se marcado como viewOnce)
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

    // 3. Áudio de visualização única (geralmente encapsulado em viewOnceMessageV2Extension)
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

    // 4. Texto de visualização única (extendedTextMessage com viewOnce ou conversation em wrapper viewOnce)
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

    // Qualquer outro tipo dentro de wrapper viewOnce
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
 * com limite de tamanho e timeout para evitar vazamento de memória ou travamentos.
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
    if (status === 403 || status === 404 || status === 410 || /403|404|410|expired|gone/i.test(msg)) {
      const wrapped = new Error("Mídia expirada ou indisponível nos servidores do WhatsApp.");
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

/**
 * Verifica se a instância de conexão ativa suporta envio nativo de figurinha com áudio.
 */
async function hasNativeAudioStickerSupport(conn) {
  if (conn && typeof conn.sendAudioSticker === "function") return true;
  if (conn && typeof conn.relayMessage === "function" && typeof conn.waUploadToServer === "function") {
    const caps = await getRuntimeCapabilities();
    return Boolean(caps.nativeAudioStickerSupport);
  }
  const caps = await getRuntimeCapabilities();
  return Boolean(caps.nativeAudioStickerSupport);
}

/**
 * Envia figurinha com áudio NATIVA do WhatsApp (1 única figurinha com ícone de som!):
 *
 * 1. Se `conn.sendAudioSticker` existir (ex.: cliente ZAPO), usa diretamente.
 * 2. No Baileys 7.0.0-rc14 (padrão do Aleatory 9.0):
 *    - Faz upload criptografado do áudio OGG/Opus (PTT) via prepareWAMessageMedia + conn.waUploadToServer
 *    - Faz upload criptografado da figurinha WebP (ou reutiliza existingStickerMessage válido)
 *    - Monta o payload protobuf nativo (StickerMessage campo #26 = AudioMessage + Message campo #134 = FutureProofMessage)
 *    - Dispara em UMA única mensagem via conn.relayMessage(jid, nativeMessage, {})
 */
async function sendStickerWithAudio(conn, jid, payload, sendOptions = {}) {
  if (!conn) throw new Error("Conexão WhatsApp indisponível.");

  const {
    webpBuffer,
    audioBuffer,
    existingStickerMessage = null,
    existingAudioMessage = null,
    isAnimated = false,
    audioDuration = 0,
  } = payload || {};

  if (!existingStickerMessage && (!Buffer.isBuffer(webpBuffer) || !webpBuffer.length)) {
    throw new Error("Buffer WebP da figurinha está vazio.");
  }
  if (!existingAudioMessage && (!Buffer.isBuffer(audioBuffer) || !audioBuffer.length)) {
    throw new Error("Buffer de áudio está vazio.");
  }

  // Caminho 1: Cliente ZAPO / adaptador com sendAudioSticker nativo
  if (typeof conn.sendAudioSticker === "function") {
    const sent = await conn.sendAudioSticker(
      jid,
      existingStickerMessage || webpBuffer,
      existingAudioMessage || audioBuffer,
      sendOptions
    );
    return {
      deliveryMode: "native_audio_sticker",
      nativeAudioSticker: true,
      messageId: sent?.key?.id || sent?.id || null,
      stickerMsg: sent,
    };
  }

  // Caminho 2: Envio NATIVO no @whiskeysockets/baileys via WAProto campos #26 e #134 + relayMessage
  if (typeof conn.relayMessage === "function" && typeof conn.waUploadToServer === "function") {
    const baileys = sendOptions._baileysMod || (await import("@whiskeysockets/baileys"));
    const prepareWAMessageMedia = baileys.prepareWAMessageMedia;

    // 2a. Preparar AudioMessage (upload PTT OGG/Opus ou reutilizar PTT existente)
    let audioMessageObj = existingAudioMessage ? { ...existingAudioMessage } : null;
    if (!audioMessageObj) {
      const preparedAudio = await prepareWAMessageMedia(
        {
          audio: audioBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true,
          seconds: audioDuration > 0 ? Math.max(1, Math.round(audioDuration)) : undefined,
        },
        {
          upload: conn.waUploadToServer,
          jid,
        }
      );
      audioMessageObj = preparedAudio.audioMessage;
    }

    // 2b. Preparar StickerMessage (upload WebP ou reutilizar figurinha citada válida)
    let stickerMediaObj = null;
    if (
      existingStickerMessage &&
      existingStickerMessage.mediaKey &&
      (existingStickerMessage.url || existingStickerMessage.directPath)
    ) {
      stickerMediaObj = { ...existingStickerMessage };
      delete stickerMediaObj.contextInfo;
    } else {
      const preparedSticker = await prepareWAMessageMedia(
        {
          sticker: webpBuffer,
          mimetype: "image/webp",
          isAnimated: Boolean(isAnimated),
        },
        {
          upload: conn.waUploadToServer,
          jid,
        }
      );
      stickerMediaObj = preparedSticker.stickerMessage;
      if (isAnimated) stickerMediaObj.isAnimated = true;
    }

    const nativeMessage = buildNativeAudioStickerMessage(
      baileys,
      stickerMediaObj,
      audioMessageObj
    );

    const messageId = await conn.relayMessage(jid, nativeMessage, {});

    return {
      deliveryMode: "native_audio_sticker_baileys",
      nativeAudioSticker: true,
      messageId: typeof messageId === "string" ? messageId : messageId?.key?.id || null,
      nativeMessage,
    };
  }

  throw new Error(
    "A conexão ativa do WhatsApp não expõe relayMessage/waUploadToServer para envio de figurinha com áudio."
  );
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
};
