"use strict";

const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Camada de compatibilidade e abstração WhatsApp (Aleatory v8/v9).
 *
 * - Detecta dinamicamente a biblioteca instalada (@whiskeysockets/baileys ou zapo-js)
 *   e a versão do projeto, preservando 100% de compatibilidade com a sessão atual.
 * - Implementa envio NATIVO de figurinhas com áudio no @whiskeysockets/baileys@7.0.0-rc14
 *   com paridade total ao protocolo WhatsApp 2026 / ZAPO 1.12.0:
 *     • Upload criptografado de áudio PTT em /mms/ptt com streamingSidecar + waveform
 *     • Upload criptografado da figurinha WebP em /mms/sticker (512x512)
 *     • StickerMessage campo #26 (AudioMessage embutido, tag 210 / wireType 2)
 *     • Message campo #134 (FutureProofMessage wrapper, tag 1074 / wireType 2)
 *     • messageContextInfo.messageSecret (32 bytes) para geração do reporting token
 *     • Envio em UMA única bolha via conn.relayMessage()
 * - Normaliza extração de mensagens citadas (quotedMessage) e containers de
 *   visualização única (viewOnceMessage, viewOnceMessageV2, viewOnceMessageV2Extension,
 *   ephemeralMessage e flags viewOnce diretas), sem mutar o objeto original.
 */

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const DEFAULT_MAX_MEDIA_BYTES = 25 * 1024 * 1024; // 25 MB
const DEFAULT_DOWNLOAD_TIMEOUT_MS = 30000;
const DEFAULT_UPLOAD_TIMEOUT_MS = 45000;

const AUDIO_STICKER_INNER_TAG = (26 << 3) | 2; // 210 — StickerMessage.audioMessage
const AUDIO_STICKER_OUTER_TAG = (134 << 3) | 2; // 1074 — Message.audioStickerWrapper (FutureProofMessage)

const SIDECAR_CHUNK_SIZE = 65536;
const SIDECAR_HMAC_SIZE = 10;
const IV_SIZE = 16;

const HKDF_INFO_MAP = {
  ptt: "WhatsApp Audio Keys",
  audio: "WhatsApp Audio Keys",
  sticker: "WhatsApp Image Keys",
  image: "WhatsApp Image Keys",
};

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
 * Deriva IV (16B), encKey (32B) e macKey (32B) via HKDF-SHA256 (especificação WhatsApp).
 */
function deriveWhatsAppMediaKeys(mediaKey, hkdfType) {
  const infoStr = HKDF_INFO_MAP[hkdfType];
  if (!infoStr) throw new Error(`Tipo HKDF inválido: ${hkdfType}`);
  const expanded = Buffer.from(
    crypto.hkdfSync("sha256", mediaKey, Buffer.alloc(0), Buffer.from(infoStr, "utf8"), 80)
  );
  return {
    iv: expanded.subarray(0, 16),
    encKey: expanded.subarray(16, 48),
    macKey: expanded.subarray(48, 80),
  };
}

/**
 * Calcula streamingSidecar (10 bytes de HMAC-SHA256 por chunk de 64 KB com overlap de IV)
 * exatamente conforme WaMediaCrypto do WhatsApp / ZAPO 1.12.0.
 */
function computeStreamingSidecar(macKey, iv, ciphertextWithMac) {
  const full = Buffer.concat([iv, ciphertextWithMac]);
  const chunks = [];
  for (let offset = 0; offset < full.length; offset += SIDECAR_CHUNK_SIZE) {
    const end = Math.min(offset + SIDECAR_CHUNK_SIZE + IV_SIZE, full.length);
    const slice = full.subarray(offset, end);
    if (slice.length === 0) break;
    const digest = crypto.createHmac("sha256", macKey).update(slice).digest();
    chunks.push(digest.subarray(0, SIDECAR_HMAC_SIZE));
    if (end >= full.length) break;
  }
  return Buffer.concat(chunks);
}

/**
 * Criptografa mídia no padrão WhatsApp (AES-256-CBC + HMAC-SHA256 10B + SHA-256 + sidecar).
 */
function encryptWhatsAppMedia(plaintextBuffer, hkdfType, includeSidecar = false) {
  const mediaKey = crypto.randomBytes(32);
  const { iv, encKey, macKey } = deriveWhatsAppMediaKeys(mediaKey, hkdfType);

  const cipher = crypto.createCipheriv("aes-256-cbc", encKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);

  const macFull = crypto.createHmac("sha256", macKey).update(iv).update(ciphertext).digest();
  const mac = macFull.subarray(0, 10);
  const ciphertextHmac = Buffer.concat([ciphertext, mac]);

  const fileSha256 = crypto.createHash("sha256").update(plaintextBuffer).digest();
  const fileEncSha256 = crypto.createHash("sha256").update(ciphertextHmac).digest();

  const streamingSidecar = includeSidecar
    ? computeStreamingSidecar(macKey, iv, ciphertextHmac)
    : undefined;

  return {
    mediaKey,
    ciphertextHmac,
    fileSha256,
    fileEncSha256,
    fileLength: plaintextBuffer.length,
    streamingSidecar,
  };
}

function encodeBase64UrlToken(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Faz upload criptografado diretamente nos endpoints oficiais do CDN do WhatsApp
 * (/mms/ptt para áudio PTT e /mms/sticker para figurinhas), usando conn.refreshMediaConn()
 * do Baileys — garantindo paridade exata com ZAPO 1.12.0.
 */
async function uploadWhatsAppMediaDirect(
  conn,
  plaintextBuffer,
  { uploadPath, hkdfType, contentType, includeSidecar = false, timeoutMs = DEFAULT_UPLOAD_TIMEOUT_MS }
) {
  const enc = encryptWhatsAppMedia(plaintextBuffer, hkdfType, includeSidecar);
  const token = encodeBase64UrlToken(enc.fileEncSha256);

  let uploadInfo = await conn.refreshMediaConn(false);
  const hosts = Array.isArray(uploadInfo?.hosts) ? uploadInfo.hosts : [];
  if (!hosts.length || !uploadInfo?.auth) {
    throw new Error("media_conn sem hosts ou auth para upload de mídia.");
  }

  let lastErr = null;
  for (let i = 0; i < hosts.length; i++) {
    const hostname = hosts[i]?.hostname;
    if (!hostname) continue;
    const auth = encodeURIComponent(uploadInfo.auth);
    const url = `https://${hostname}${uploadPath}/${token}?auth=${auth}&token=${token}`;

    try {
      const res = await axios.post(url, enc.ciphertextHmac, {
        timeout: timeoutMs,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: {
          "Content-Type": "application/octet-stream",
          Origin: "https://web.whatsapp.com",
        },
        validateStatus: () => true,
      });

      const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      if (res.status >= 200 && res.status < 300 && (data?.url || data?.direct_path)) {
        const directPath = data.direct_path || "";
        const mediaUrl =
          data.url || (directPath ? `https://mmg.whatsapp.net${directPath}` : "");
        return {
          url: mediaUrl,
          directPath,
          mediaKey: enc.mediaKey,
          fileSha256: enc.fileSha256,
          fileEncSha256: enc.fileEncSha256,
          fileLength: enc.fileLength,
          mediaKeyTimestamp: Math.floor(Date.now() / 1000),
          mimetype: contentType,
          ...(enc.streamingSidecar ? { streamingSidecar: enc.streamingSidecar } : {}),
        };
      }

      lastErr = new Error(
        `Upload ${uploadPath} falhou em ${hostname} (HTTP ${res.status}): ${JSON.stringify(data).slice(0, 200)}`
      );
      if (i === 0) {
        try {
          uploadInfo = await conn.refreshMediaConn(true);
        } catch {
          // continuar com próximo host
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error(`Falha ao fazer upload de mídia em ${uploadPath}.`);
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

  if (
    !Message ||
    !StickerMessage ||
    typeof Message.encode !== "function" ||
    typeof StickerMessage.encode !== "function"
  ) {
    return false;
  }

  if (!StickerMessage.encode.__aleatoryAudioStickerWrapped) {
    const origStickerEncode = StickerMessage.encode;
    const wrappedStickerEncode = function encode(m, w) {
      const writer = origStickerEncode.call(this, m, w);
      if (
        m &&
        m.__audioStickerAudioBytes instanceof Uint8Array &&
        m.__audioStickerAudioBytes.length > 0
      ) {
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
      if (
        m &&
        m.__audioStickerWrapperBytes instanceof Uint8Array &&
        m.__audioStickerWrapperBytes.length > 0
      ) {
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
 * Constrói o payload Protobuf oficial de uma figurinha com áudio nativa do WhatsApp:
 *  - StickerMessage com AudioMessage embutido no campo #26
 *  - FutureProofMessage({ message: { stickerMessage } }) no campo #134 da Message
 *  - messageContextInfo.messageSecret (32 bytes) para reporting token e compatibilidade 2026
 */
function buildNativeAudioStickerMessage(baileysMod, stickerMedia, audioMessage) {
  const ok = installNativeAudioStickerProtoExtension(baileysMod);
  if (!ok) {
    throw new Error(
      "Não foi possível inicializar a extensão protobuf de figurinha com áudio."
    );
  }

  const proto = baileysMod.proto || baileysMod.WAProto;
  const { Message } = proto;

  // Manter exatamente os campos mínimos esperados pelo protocolo WhatsApp 2026 / ZAPO 1.12.0
  const cleanAudio = {
    url: audioMessage.url,
    directPath: audioMessage.directPath,
    mediaKey: audioMessage.mediaKey,
    fileSha256: audioMessage.fileSha256,
    fileEncSha256: audioMessage.fileEncSha256,
    fileLength: audioMessage.fileLength,
    mediaKeyTimestamp: audioMessage.mediaKeyTimestamp || Math.floor(Date.now() / 1000),
    mimetype: audioMessage.mimetype || "audio/ogg; codecs=opus",
    ptt: true,
    ...(audioMessage.seconds ? { seconds: audioMessage.seconds } : {}),
    ...(audioMessage.streamingSidecar ? { streamingSidecar: audioMessage.streamingSidecar } : {}),
  };

  const encodedAudio = Message.AudioMessage.encode(cleanAudio).finish();

  const stickerMessage = {
    url: stickerMedia.url,
    directPath: stickerMedia.directPath,
    mediaKey: stickerMedia.mediaKey,
    fileSha256: stickerMedia.fileSha256,
    fileEncSha256: stickerMedia.fileEncSha256,
    fileLength: stickerMedia.fileLength,
    mediaKeyTimestamp: stickerMedia.mediaKeyTimestamp || Math.floor(Date.now() / 1000),
    mimetype: stickerMedia.mimetype || "image/webp",
    ...(stickerMedia.isAnimated ? { isAnimated: true } : {}),
    contextInfo: undefined,
    __audioStickerAudioBytes: encodedAudio,
  };

  const wrapperBytes = Message.FutureProofMessage.encode({
    message: { stickerMessage },
  }).finish();

  return {
    stickerMessage,
    messageContextInfo: {
      messageSecret: crypto.randomBytes(32),
    },
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
  if (conn && typeof conn.relayMessage === "function") {
    const caps = await getRuntimeCapabilities();
    return Boolean(caps.nativeAudioStickerSupport);
  }
  const caps = await getRuntimeCapabilities();
  return Boolean(caps.nativeAudioStickerSupport);
}

/**
 * Envia figurinha com áudio NATIVA do WhatsApp (1 única figurinha com ícone de som):
 *
 * 1. Se `conn.sendAudioSticker` existir (ex.: ZAPO), usa diretamente.
 * 2. No Baileys 7.0.0-rc14:
 *    - Preferencialmente faz upload direto em /mms/ptt (com streamingSidecar + waveform)
 *      e /mms/sticker via conn.refreshMediaConn (paridade 100% com ZAPO 1.12.0).
 *    - Fallback automático para prepareWAMessageMedia + conn.waUploadToServer caso
 *      refreshMediaConn não exista no socket.
 *    - Monta o payload protobuf nativo (StickerMessage #26 + FutureProofMessage #134
 *      + messageContextInfo.messageSecret) e envia em 1 bolha via conn.relayMessage().
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
    waveform = null,
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

  // Caminho 2: Envio NATIVO no @whiskeysockets/baileys
  if (typeof conn.relayMessage === "function") {
    const baileys = sendOptions._baileysMod || (await import("@whiskeysockets/baileys"));
    const prepareWAMessageMedia = baileys.prepareWAMessageMedia;
    const canDirectUpload = typeof conn.refreshMediaConn === "function";

    // 2a. Preparar AudioMessage (PTT em /mms/ptt + streamingSidecar + waveform)
    let audioMessageObj = existingAudioMessage ? { ...existingAudioMessage } : null;
    if (!audioMessageObj) {
      if (canDirectUpload) {
        try {
          const uploadedPtt = await uploadWhatsAppMediaDirect(conn, audioBuffer, {
            uploadPath: "/mms/ptt",
            hkdfType: "ptt",
            contentType: "audio/ogg; codecs=opus",
            includeSidecar: true,
          });
          audioMessageObj = {
            ...uploadedPtt,
            ptt: true,
            seconds: audioDuration > 0 ? Math.max(1, Math.round(audioDuration)) : 1,
            ...(waveform instanceof Uint8Array && waveform.length > 0 ? { waveform } : {}),
          };
          console.log(
            `[STICKERAUDIO] Upload /mms/ptt OK (${audioBuffer.length}B, sidecar=${uploadedPtt.streamingSidecar?.length || 0}B)`
          );
        } catch (directAudioErr) {
          console.warn(
            "[STICKERAUDIO] Upload direto /mms/ptt falhou, tentando waUploadToServer:",
            directAudioErr?.message || directAudioErr
          );
        }
      }

      if (!audioMessageObj) {
        if (typeof conn.waUploadToServer !== "function") {
          throw new Error("Socket Baileys sem waUploadToServer/refreshMediaConn.");
        }
        const preparedAudio = await prepareWAMessageMedia(
          {
            audio: audioBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            seconds: audioDuration > 0 ? Math.max(1, Math.round(audioDuration)) : 1,
            ...(waveform instanceof Uint8Array && waveform.length > 0 ? { waveform } : {}),
          },
          {
            upload: conn.waUploadToServer,
            jid,
          }
        );
        audioMessageObj = preparedAudio.audioMessage;
      }
    }

    // 2b. Preparar StickerMessage (upload em /mms/sticker ou reutilizar figurinha citada válida)
    let stickerMediaObj = null;
    if (
      existingStickerMessage &&
      existingStickerMessage.mediaKey &&
      (existingStickerMessage.url || existingStickerMessage.directPath)
    ) {
      stickerMediaObj = { ...existingStickerMessage };
      delete stickerMediaObj.contextInfo;
    } else {
      if (canDirectUpload) {
        try {
          const uploadedSticker = await uploadWhatsAppMediaDirect(conn, webpBuffer, {
            uploadPath: "/mms/sticker",
            hkdfType: "sticker",
            contentType: "image/webp",
            includeSidecar: false,
          });
          stickerMediaObj = {
            ...uploadedSticker,
            width: 512,
            height: 512,
            isAnimated: Boolean(isAnimated),
            stickerSentTs: Date.now(),
          };
          console.log(
            `[STICKERAUDIO] Upload /mms/sticker OK (${webpBuffer.length}B, animated=${Boolean(isAnimated)})`
          );
        } catch (directStickerErr) {
          console.warn(
            "[STICKERAUDIO] Upload direto /mms/sticker falhou, tentando waUploadToServer:",
            directStickerErr?.message || directStickerErr
          );
        }
      }

      if (!stickerMediaObj) {
        if (typeof conn.waUploadToServer !== "function") {
          throw new Error("Socket Baileys sem waUploadToServer/refreshMediaConn.");
        }
        const preparedSticker = await prepareWAMessageMedia(
          {
            sticker: webpBuffer,
            mimetype: "image/webp",
            width: 512,
            height: 512,
            isAnimated: Boolean(isAnimated),
          },
          {
            upload: conn.waUploadToServer,
            jid,
          }
        );
        stickerMediaObj = preparedSticker.stickerMessage;
        stickerMediaObj.width = stickerMediaObj.width || 512;
        stickerMediaObj.height = stickerMediaObj.height || 512;
        if (isAnimated) stickerMediaObj.isAnimated = true;
      }
    }

    const nativeMessage = buildNativeAudioStickerMessage(
      baileys,
      stickerMediaObj,
      audioMessageObj
    );

    // Verificar em runtime os campos emitidos pelo encodeWAMessage real do Baileys
    let wireLen = 0;
    let has26 = false;
    let has134 = false;
    try {
      const rawEncoded = baileys.proto.Message.encode(nativeMessage).finish();
      wireLen = rawEncoded.length;
      const pb = require("protobufjs/minimal");
      const rd = pb.Reader.create(rawEncoded);
      while (rd.pos < rd.len) {
        const tag = rd.uint32();
        const fn = tag >>> 3;
        const wt = tag & 7;
        if (fn === 26) has26 = true;
        if (fn === 134) has134 = true;
        if (wt === 2) rd.bytes();
        else rd.skipType(wt);
      }
    } catch {
      // diagnóstico não-bloqueante
    }

    // Gerar messageId antes para registrar no retry store e capturar ACK do servidor
    const preMsgId =
      typeof baileys.generateMessageIDV2 === "function"
        ? baileys.generateMessageIDV2(conn.user?.id)
        : undefined;

    if (preMsgId && typeof global._storeOutgoingMessage === "function") {
      global._storeOutgoingMessage(preMsgId, nativeMessage);
    }

    // Escutar ACK do servidor WhatsApp para esse msgId (diagnóstico em tempo real, auto-limpa em 8s)
    if (preMsgId && conn.ws && typeof conn.ws.on === "function") {
      const ackEvent = `CB:ack,class:message,id:${preMsgId}`;
      const onAck = (node) => {
        clearTimeout(ackTimer);
        console.log(
          `[STICKERAUDIO] SERVER ACK id=${preMsgId} attrs=${JSON.stringify(node?.attrs || {})}`
        );
      };
      const ackTimer = setTimeout(() => {
        try {
          conn.ws.off(ackEvent, onAck);
        } catch {
          // ignorar
        }
      }, 8000);
      conn.ws.once(ackEvent, onAck);
    }

    const messageId = await conn.relayMessage(
      jid,
      nativeMessage,
      preMsgId ? { messageId: preMsgId } : {}
    );
    const finalId =
      (typeof messageId === "string" ? messageId : messageId?.key?.id) || preMsgId || null;

    if (finalId && finalId !== preMsgId && typeof global._storeOutgoingMessage === "function") {
      global._storeOutgoingMessage(finalId, nativeMessage);
    }

    console.log(
      `[STICKERAUDIO] relayMessage OK -> jid=${jid} id=${finalId || "?"} wire=${wireLen}B f26=${has26} f134=${has134} pttPath=${audioMessageObj.directPath?.slice(0, 28) || "?"} stkPath=${stickerMediaObj.directPath?.slice(0, 28) || "?"}`
    );

    return {
      deliveryMode: "native_audio_sticker_baileys",
      nativeAudioSticker: true,
      messageId: finalId,
      nativeMessage,
    };
  }

  throw new Error(
    "A conexão ativa do WhatsApp não expõe relayMessage para envio de figurinha com áudio."
  );
}

module.exports = {
  AUDIO_STICKER_INNER_TAG,
  AUDIO_STICKER_OUTER_TAG,
  deriveWhatsAppMediaKeys,
  computeStreamingSidecar,
  encryptWhatsAppMedia,
  uploadWhatsAppMediaDirect,
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
