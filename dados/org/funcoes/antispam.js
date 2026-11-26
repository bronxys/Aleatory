"use strict";

const { unwrapMessageContainer, isStickerMessage } = require("./wa_adapter.js");

const DEFAULT_CONFIG = {
  // ── 1) Limite RÍGIDO de comandos: 1 comando a cada 5s por pessoa ──
  cmdCooldownMs: 5000,
  // Se insistir e tentar enviar 4+ comandos bloqueados em 10s ignorando o aviso -> +1 ADV
  cmdFloodWarnLimit: 4,
  cmdFloodWindowMs: 10000,

  // ── 2) Flood por categoria -> apaga rajada + aplica ADV (3/3 = BAN) ──
  // Mensagens de texto comuns
  msgLimit: 5,
  msgWindowMs: 8000,
  // Mensagens repetidas (copiar e colar)
  repeatLimit: 3,
  repeatWindowMs: 10000,
  repeatMinLen: 2,
  // Figurinhas (normais, animadas, Lottie e figurinhas com áudio #134/#26)
  stickerLimit: 4,
  stickerWindowMs: 8000,
  // Vídeos e recados de vídeo (videoMessage / ptvMessage)
  videoLimit: 3,
  videoWindowMs: 10000,
  // Links / URLs (http, https, www, wa.me, chat.whatsapp.com, t.me, etc.)
  linkLimit: 3,
  linkWindowMs: 10000,
  // Outras mídias (imagens, áudios/PTT, documentos, contatos, localizações, enquetes)
  mediaLimit: 4,
  mediaWindowMs: 10000,
  // Flood misto (qualquer combinação de texto + figurinha + vídeo + link + mídia)
  mixedLimit: 5,
  mixedWindowMs: 8000,

  // ── 3) Proteção anti-ban para o número do bot ──
  // Pausa pós-ADV: impede aplicar 2 ADVs na mesma rajada e reduz respostas do bot
  floodGraceMs: 5000,
  // Limite de avisos de cooldown por grupo (mesmo se 10 pessoas spammarem juntas, o bot não floda respostas)
  groupNoticeCooldownMs: 2500,
  // Máximo de mensagens apagadas por rajada (com intervalo entre deletes no index.js)
  maxDeletePerBurst: 5,
  // Controle de memória (container 1 GB)
  maxTrackedUsers: 600,
  staleEntryMs: 60000,
};

const _userStates = new Map();
const _groupLastNoticeAt = new Map();

const URL_REGEX =
  /(?:https?:\/\/|www\.|(?:chat\.whatsapp\.com|wa\.me|t\.me|telegram\.me|discord\.gg|discord\.com\/invite|youtu\.be|youtube\.com|tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|instagram\.com|instagr\.am|bit\.ly|tinyurl\.com|kwai\.com|x\.com|twitter\.com)\/)/i;

const BARE_DOMAIN_PATH_REGEX =
  /(?:^|\s)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|br|io|gg|me|tv|co|xyz|app|site|online|shop|link|ly)\b(?:\/[^\s]*)?/i;

function normalizeShortText(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function containsLink(text) {
  if (typeof text !== "string" || !text.trim()) return false;
  return URL_REGEX.test(text) || BARE_DOMAIN_PATH_REGEX.test(text);
}

/**
 * Ignora eventos de protocolo/reação que não representam mensagens enviadas pelo membro.
 */
function isIgnoredForAntiSpam(messageObj) {
  if (!messageObj || typeof messageObj !== "object") return true;
  const { unwrapped } = unwrapMessageContainer(messageObj);
  const target = unwrapped || messageObj;
  const keys = Object.keys(target).filter(
    (k) => k !== "messageContextInfo" && k !== "senderKeyDistributionMessage"
  );
  if (keys.length === 0) return true;
  const ignoredOnly = new Set([
    "reactionMessage",
    "encReactionMessage",
    "protocolMessage",
    "pollUpdateMessage",
    "keepInChatMessage",
    "pinInChatMessage",
  ]);
  return keys.every((k) => ignoredOnly.has(k));
}

/**
 * Classifica o tipo real da mensagem para o Anti-Spam rígido:
 * - "sticker" (normais, animadas, Lottie e figurinhas com áudio)
 * - "link"    (qualquer mensagem/legenda contendo URL/link)
 * - "video"   (vídeos, GIFs mp4 e recados de vídeo ptvMessage)
 * - "media"   (imagens, áudios/PTT, documentos, contatos, localizações, enquetes)
 * - "text"    (mensagens comuns de texto)
 */
function classifyAntiSpamMessage(messageObj, text = "", isStickerHint = false) {
  if (isStickerHint || isStickerMessage(messageObj)) {
    return "sticker";
  }

  const { unwrapped } = unwrapMessageContainer(messageObj || {});
  const target = unwrapped || messageObj || {};

  // Verificar link tanto no texto quanto em matchedText/canonicalUrl do extendedTextMessage
  const extended = target.extendedTextMessage || null;
  const linkProbeText = [
    text,
    extended?.matchedText || "",
    extended?.canonicalUrl || "",
  ]
    .filter(Boolean)
    .join(" ");

  if (containsLink(linkProbeText)) {
    return "link";
  }

  if (target.videoMessage || target.ptvMessage) {
    return "video";
  }

  if (
    target.imageMessage ||
    target.audioMessage ||
    target.documentMessage ||
    target.documentWithCaptionMessage ||
    target.contactMessage ||
    target.contactsArrayMessage ||
    target.locationMessage ||
    target.liveLocationMessage ||
    target.pollCreationMessage ||
    target.pollCreationMessageV2 ||
    target.pollCreationMessageV3
  ) {
    return "media";
  }

  return "text";
}

function pruneStaleStates(now, cfg = DEFAULT_CONFIG) {
  if (_userStates.size <= cfg.maxTrackedUsers) return;
  for (const [k, st] of _userStates.entries()) {
    if (now - (st.lastSeen || 0) > cfg.staleEntryMs) {
      _userStates.delete(k);
    }
  }
}

function getOrCreateState(stateKey, now, cfg = DEFAULT_CONFIG) {
  pruneStaleStates(now, cfg);
  let st = _userStates.get(stateKey);
  if (!st) {
    st = {
      events: [], // [{ ts, category, key, normText }]
      cmdCooldownUntil: 0,
      cmdNotifiedInCooldown: false,
      cmdBlockedTimestamps: [],
      floodGraceUntil: 0,
      lastSeen: now,
    };
    _userStates.set(stateKey, st);
  }
  st.lastSeen = now;
  return st;
}

function canSendGroupNotice(groupId, now, cfg) {
  const last = _groupLastNoticeAt.get(groupId) || 0;
  if (now - last < cfg.groupNoticeCooldownMs) return false;
  _groupLastNoticeAt.set(groupId, now);
  return true;
}

function triggerFloodWarn(st, now, cfg, kind, reason, items) {
  const keysToDelete = items
    .map((x) => x.key)
    .filter(Boolean)
    .slice(-cfg.maxDeletePerBurst);
  st.events = [];
  st.cmdBlockedTimestamps = [];
  st.floodGraceUntil = now + cfg.floodGraceMs;
  return {
    action: "warn",
    kind,
    reason,
    keysToDelete,
    blockProcessing: true,
  };
}

/**
 * Avalia uma mensagem recebida de um membro não-ADM quando o anti-spam está ativo.
 *
 * Retornos possíveis:
 * - { action: "allow" }
 * - { action: "cmd_cooldown", remainingSec, shouldNotify, blockCommand: true }
 * - { action: "grace_skip", deleteKey, blockProcessing: true }
 * - { action: "warn", kind, reason, keysToDelete, blockProcessing: true }
 */
function evaluateAntiSpam({
  groupId,
  userKey,
  isCmd = false,
  isSticker = false,
  messageObj = null,
  text = "",
  msgKey = null,
  now = Date.now(),
  config = DEFAULT_CONFIG,
}) {
  if (!groupId || !userKey) return { action: "allow" };
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const stateKey = `${groupId}_${userKey}`;
  const st = getOrCreateState(stateKey, now, cfg);

  // ── 1) Proteção RÍGIDA de comandos: 1 comando a cada 5 segundos por pessoa ──
  if (isCmd) {
    if (now < st.cmdCooldownUntil) {
      st.cmdBlockedTimestamps.push(now);
      st.cmdBlockedTimestamps = st.cmdBlockedTimestamps.filter(
        (ts) => now - ts < cfg.cmdFloodWindowMs
      );

      // Se insistir em spammar 4+ comandos bloqueados em 10s ignorando o cooldown -> ADV
      if (
        cfg.cmdFloodWarnLimit > 0 &&
        st.cmdBlockedTimestamps.length >= cfg.cmdFloodWarnLimit &&
        now >= st.floodGraceUntil
      ) {
        st.cmdCooldownUntil = now + cfg.cmdCooldownMs;
        st.cmdNotifiedInCooldown = true;
        return triggerFloodWarn(
          st,
          now,
          cfg,
          "cmd_flood",
          "Flood de comandos",
          msgKey ? [{ key: msgKey }] : []
        );
      }

      const remainingSec = Math.max(
        1,
        Math.ceil((st.cmdCooldownUntil - now) / 1000)
      );
      const shouldNotify =
        !st.cmdNotifiedInCooldown && canSendGroupNotice(groupId, now, cfg);
      if (shouldNotify) {
        st.cmdNotifiedInCooldown = true;
      }
      return {
        action: "cmd_cooldown",
        remainingSec,
        shouldNotify,
        blockCommand: true,
      };
    }

    // 1º comando liberado -> já inicia imediatamente o cooldown de 5s para o próximo comando!
    st.cmdCooldownUntil = now + cfg.cmdCooldownMs;
    st.cmdNotifiedInCooldown = false;
    return { action: "allow" };
  }

  // Janela de acomodação pós-ADV: evita aplicar 2 ADVs na mesma rajada e bloqueia reprocessamento
  if (now < st.floodGraceUntil) {
    return {
      action: "grace_skip",
      deleteKey: msgKey || null,
      blockProcessing: true,
    };
  }

  // Classificar mensagem (figurinha, link, vídeo, mídia ou texto)
  const category = classifyAntiSpamMessage(messageObj, text, isSticker);
  const normText = normalizeShortText(text);

  // Limpar entradas fora da maior janela configurada
  const maxWindowMs = Math.max(
    cfg.msgWindowMs,
    cfg.repeatWindowMs,
    cfg.stickerWindowMs,
    cfg.videoWindowMs,
    cfg.linkWindowMs,
    cfg.mediaWindowMs,
    cfg.mixedWindowMs
  );
  st.events = st.events.filter((x) => now - x.ts < maxWindowMs);
  st.events.push({
    ts: now,
    category,
    key: msgKey || null,
    normText,
  });

  // ── 2) Flood de LINKS (3 em 10s) ──
  if (category === "link") {
    const links = st.events.filter(
      (x) => x.category === "link" && now - x.ts < cfg.linkWindowMs
    );
    if (links.length >= cfg.linkLimit) {
      return triggerFloodWarn(st, now, cfg, "link_flood", "Flood de links", links);
    }
  }

  // ── 3) Flood de VÍDEOS (3 em 10s) ──
  if (category === "video") {
    const videos = st.events.filter(
      (x) => x.category === "video" && now - x.ts < cfg.videoWindowMs
    );
    if (videos.length >= cfg.videoLimit) {
      return triggerFloodWarn(st, now, cfg, "video_flood", "Flood de vídeos", videos);
    }
  }

  // ── 4) Flood de FIGURINHAS (4 em 8s — inclui animadas e com áudio) ──
  if (category === "sticker") {
    const stickers = st.events.filter(
      (x) => x.category === "sticker" && now - x.ts < cfg.stickerWindowMs
    );
    if (stickers.length >= cfg.stickerLimit) {
      return triggerFloodWarn(
        st,
        now,
        cfg,
        "sticker_flood",
        "Flood de figurinhas",
        stickers
      );
    }
  }

  // ── 5) Flood de MÍDIAS (fotos, áudios, docs, contatos, enquetes — 4 em 10s) ──
  if (category === "media") {
    const medias = st.events.filter(
      (x) => x.category === "media" && now - x.ts < cfg.mediaWindowMs
    );
    if (medias.length >= cfg.mediaLimit) {
      return triggerFloodWarn(
        st,
        now,
        cfg,
        "media_flood",
        "Flood de mídias",
        medias
      );
    }
  }

  // ── 6) Flood de MENSAGENS REPETIDAS (3 idênticas em 10s) ──
  if (normText.length >= cfg.repeatMinLen) {
    const repeated = st.events.filter(
      (x) => x.normText === normText && now - x.ts < cfg.repeatWindowMs
    );
    if (repeated.length >= cfg.repeatLimit) {
      return triggerFloodWarn(
        st,
        now,
        cfg,
        "repeat_flood",
        "Flood de mensagens repetidas",
        repeated
      );
    }
  }

  // ── 7) Flood de MENSAGENS DE TEXTO (5 em 8s) ──
  if (category === "text") {
    const texts = st.events.filter(
      (x) => x.category === "text" && now - x.ts < cfg.msgWindowMs
    );
    if (texts.length >= cfg.msgLimit) {
      return triggerFloodWarn(
        st,
        now,
        cfg,
        "message_flood",
        "Flood de mensagens",
        texts
      );
    }
  }

  // ── 8) Flood MISTO (qualquer combinação de texto/figurinha/vídeo/mídia/link — 5 em 8s) ──
  const mixed = st.events.filter((x) => now - x.ts < cfg.mixedWindowMs);
  if (mixed.length >= cfg.mixedLimit) {
    return triggerFloodWarn(
      st,
      now,
      cfg,
      "mixed_flood",
      "Flood (mensagens/mídias/figurinhas)",
      mixed
    );
  }

  return { action: "allow" };
}

function resetAntiSpamState(groupId, userKey) {
  if (!groupId) {
    _userStates.clear();
    _groupLastNoticeAt.clear();
    return;
  }
  if (!userKey) {
    _groupLastNoticeAt.delete(groupId);
    const prefix = `${groupId}_`;
    for (const k of _userStates.keys()) {
      if (k.startsWith(prefix)) _userStates.delete(k);
    }
    return;
  }
  _userStates.delete(`${groupId}_${userKey}`);
}

module.exports = {
  DEFAULT_CONFIG,
  containsLink,
  classifyAntiSpamMessage,
  isIgnoredForAntiSpam,
  evaluateAntiSpam,
  resetAntiSpamState,
};
