"use strict";

const { unwrapMessageContainer } = require("./wa_adapter.js");

const DEFAULT_CONFIG = {
  // Flood de mensagens (texto/mídia comum)
  msgLimit: 6,
  msgWindowMs: 8000,
  // Flood de mensagens idênticas (copiar e colar)
  repeatLimit: 4,
  repeatMinLen: 3,
  // Flood de figurinhas (normais, animadas e com áudio)
  stickerLimit: 5,
  stickerWindowMs: 8000,
  // Flood misto (alternando msgs + figurinhas para tentar burlar)
  mixedLimit: 7,
  // Pausa anti-duplicação após aplicar ADV no mesmo rajada
  floodGraceMs: 4000,
  // Flood de comandos -> bloqueia e pede para aguardar 5s
  cmdLimit: 3,
  cmdWindowMs: 6000,
  cmdCooldownMs: 5000,
  // Controle de memória (container 1 GB)
  maxTrackedUsers: 500,
  staleEntryMs: 60000,
};

const _userStates = new Map();

function normalizeShortText(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
      msgs: [],
      stickers: [],
      cmds: [],
      cmdCooldownUntil: 0,
      cmdNotifiedInCooldown: false,
      floodGraceUntil: 0,
      lastSeen: now,
    };
    _userStates.set(stateKey, st);
  }
  st.lastSeen = now;
  return st;
}

/**
 * Avalia uma mensagem recebida de um membro não-ADM quando o anti-spam está ativo.
 *
 * Retornos possíveis:
 * - { action: "allow" }
 * - { action: "cmd_cooldown", remainingSec, shouldNotify, blockCommand: true }
 * - { action: "grace_skip", deleteKey }
 * - { action: "warn", kind, reason, keysToDelete }
 */
function evaluateAntiSpam({
  groupId,
  userKey,
  isCmd = false,
  isSticker = false,
  text = "",
  msgKey = null,
  now = Date.now(),
  config = DEFAULT_CONFIG,
}) {
  if (!groupId || !userKey) return { action: "allow" };
  const cfg = { ...DEFAULT_CONFIG, ...(config || {}) };
  const stateKey = `${groupId}_${userKey}`;
  const st = getOrCreateState(stateKey, now, cfg);

  // 1) Proteção contra flood de comandos -> pedir para aguardar 5s
  if (isCmd) {
    if (now < st.cmdCooldownUntil) {
      const remainingSec = Math.max(
        1,
        Math.ceil((st.cmdCooldownUntil - now) / 1000)
      );
      const shouldNotify = !st.cmdNotifiedInCooldown;
      st.cmdNotifiedInCooldown = true;
      return {
        action: "cmd_cooldown",
        remainingSec,
        shouldNotify,
        blockCommand: true,
      };
    }

    st.cmds.push(now);
    st.cmds = st.cmds.filter((ts) => now - ts < cfg.cmdWindowMs);

    if (st.cmds.length >= cfg.cmdLimit) {
      st.cmds = [];
      st.cmdCooldownUntil = now + cfg.cmdCooldownMs;
      st.cmdNotifiedInCooldown = true;
      return {
        action: "cmd_cooldown",
        remainingSec: Math.ceil(cfg.cmdCooldownMs / 1000),
        shouldNotify: true,
        blockCommand: true,
      };
    }

    st.cmdNotifiedInCooldown = false;
    return { action: "allow" };
  }

  // Janela de acomodação pós-ADV: evita aplicar 2 ADVs na mesma rajada de 1 segundo
  if (now < st.floodGraceUntil) {
    return { action: "grace_skip", deleteKey: msgKey || null };
  }

  // Limpar entradas antigas das janelas de mensagens e figurinhas
  st.stickers = st.stickers.filter((x) => now - x.ts < cfg.stickerWindowMs);
  st.msgs = st.msgs.filter((x) => now - x.ts < cfg.msgWindowMs);

  // 2) Flood de figurinhas (normais, animadas e figurinhas com áudio)
  if (isSticker) {
    st.stickers.push({ ts: now, key: msgKey || null });

    if (st.stickers.length >= cfg.stickerLimit) {
      const keysToDelete = st.stickers.map((x) => x.key).filter(Boolean);
      st.stickers = [];
      st.msgs = [];
      st.floodGraceUntil = now + cfg.floodGraceMs;
      return {
        action: "warn",
        kind: "sticker_flood",
        reason: "Flood de figurinhas",
        keysToDelete,
      };
    }

    if (st.stickers.length + st.msgs.length >= cfg.mixedLimit) {
      const keysToDelete = [
        ...st.stickers.map((x) => x.key),
        ...st.msgs.map((x) => x.key),
      ].filter(Boolean);
      st.stickers = [];
      st.msgs = [];
      st.floodGraceUntil = now + cfg.floodGraceMs;
      return {
        action: "warn",
        kind: "mixed_flood",
        reason: "Flood de mensagens/figurinhas",
        keysToDelete,
      };
    }

    return { action: "allow" };
  }

  // 3) Flood de mensagens (volume ou repetição idêntica)
  const normText = normalizeShortText(text);
  st.msgs.push({ ts: now, key: msgKey || null, normText });

  if (normText.length >= cfg.repeatMinLen) {
    const sameItems = st.msgs.filter((x) => x.normText === normText);
    if (sameItems.length >= cfg.repeatLimit) {
      const keysToDelete = sameItems.map((x) => x.key).filter(Boolean);
      st.msgs = [];
      st.stickers = [];
      st.floodGraceUntil = now + cfg.floodGraceMs;
      return {
        action: "warn",
        kind: "repeat_flood",
        reason: "Flood de mensagens repetidas",
        keysToDelete,
      };
    }
  }

  if (st.msgs.length >= cfg.msgLimit) {
    const keysToDelete = st.msgs.map((x) => x.key).filter(Boolean);
    st.msgs = [];
    st.stickers = [];
    st.floodGraceUntil = now + cfg.floodGraceMs;
    return {
      action: "warn",
      kind: "message_flood",
      reason: "Flood de mensagens",
      keysToDelete,
    };
  }

  if (st.stickers.length + st.msgs.length >= cfg.mixedLimit) {
    const keysToDelete = [
      ...st.stickers.map((x) => x.key),
      ...st.msgs.map((x) => x.key),
    ].filter(Boolean);
    st.stickers = [];
    st.msgs = [];
    st.floodGraceUntil = now + cfg.floodGraceMs;
    return {
      action: "warn",
      kind: "mixed_flood",
      reason: "Flood de mensagens/figurinhas",
      keysToDelete,
    };
  }

  return { action: "allow" };
}

function resetAntiSpamState(groupId, userKey) {
  if (!groupId) {
    _userStates.clear();
    return;
  }
  if (!userKey) {
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
  isIgnoredForAntiSpam,
  evaluateAntiSpam,
  resetAntiSpamState,
};
