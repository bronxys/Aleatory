"use strict";

const { unwrapMessageContainer } = require("./wa_adapter.js");

/**
 * Normaliza texto para comparação de palavras proibidas:
 * minúsculas, sem acentos e espaços colapsados.
 */
function normalizeProfanityText(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Garante que a estrutura dataGp[0].antipalavrao exista e esteja íntegra.
 */
function ensureAntipalavraoConfig(groupData) {
  if (!groupData || typeof groupData !== "object") {
    return { active: false, palavras: [] };
  }
  if (!groupData.antipalavrao || typeof groupData.antipalavrao !== "object") {
    groupData.antipalavrao = { active: false, palavras: [] };
  }
  groupData.antipalavrao.active = Boolean(groupData.antipalavrao.active);
  if (!Array.isArray(groupData.antipalavrao.palavras)) {
    groupData.antipalavrao.palavras = [];
  }
  return groupData.antipalavrao;
}

/**
 * Extrai o texto/legenda de qualquer mensagem, incluindo containers
 * ephemeralMessage (mensagens temporárias), viewOnce e documentWithCaptionMessage.
 */
function extractMessageTextForFilter(info, fallbackBody = "") {
  const parts = [];
  if (typeof fallbackBody === "string" && fallbackBody.trim()) {
    parts.push(fallbackBody.trim());
  }

  const rawMsg = info?.message;
  if (rawMsg && typeof rawMsg === "object") {
    const { unwrapped } = unwrapMessageContainer(rawMsg);
    const target = unwrapped || rawMsg;
    const candidates = [
      target.conversation,
      target.extendedTextMessage?.text,
      target.imageMessage?.caption,
      target.videoMessage?.caption,
      target.documentMessage?.caption,
      target.buttonsResponseMessage?.selectedDisplayText,
      target.listResponseMessage?.title,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim() && !parts.includes(c.trim())) {
        parts.push(c.trim());
      }
    }
  }

  return parts.join(" ").trim();
}

/**
 * Verifica se o texto contém alguma palavra/frase proibida da lista.
 * - Usa limites de palavra (Unicode) para evitar falsos positivos
 *   (ex.: "puta" não dispara em "computador" ou "disputa"; "cu" não dispara em "cuidado").
 * - Detecta evasão simples com separadores internos (ex.: "p.u.t.a", "p*u*t*a", "p_u_t_a").
 * Retorna a palavra proibida encontrada ou null.
 */
function findBannedWord(rawText, bannedList) {
  if (!Array.isArray(bannedList) || bannedList.length === 0) return null;
  const normText = normalizeProfanityText(rawText);
  if (!normText) return null;

  // Tokens limpos para detectar evasão por separadores (p.u.t.a / p*u*t*a / p-u-t-a)
  const rawTokens = normText.split(/\s+/).filter(Boolean);
  const deobfuscatedTokens = new Set();
  for (const tok of rawTokens) {
    if (/[.\-_*]/.test(tok)) {
      const cleaned = tok.replace(/[^a-z0-9]/g, "");
      if (cleaned.length >= 2) deobfuscatedTokens.add(cleaned);
    }
  }

  const sortedEntries = [...bannedList].sort(
    (a, b) => String(b || "").length - String(a || "").length
  );

  for (const entry of sortedEntries) {
    const normWord = normalizeProfanityText(entry);
    if (!normWord) continue;

    // Passagem 1: correspondência por limite de palavra/frase
    const phrasePattern = normWord
      .split(/\s+/)
      .map(escapeRegex)
      .join("\\s+");
    const boundaryRe = new RegExp(
      `(?:^|[^\\p{L}\\p{N}_])${phrasePattern}(?=$|[^\\p{L}\\p{N}_])`,
      "u"
    );
    if (boundaryRe.test(normText)) {
      return entry;
    }

    // Passagem 2: palavra única ofuscada com pontos/traços/asteriscos (ex.: p.u.t.a)
    if (!normWord.includes(" ") && normWord.length >= 2) {
      const compactWord = normWord.replace(/[^a-z0-9]/g, "");
      if (compactWord.length >= 2 && deobfuscatedTokens.has(compactWord)) {
        return entry;
      }
    }
  }

  return null;
}

/**
 * Faz parse da entrada de /addpalavra ou /delpalavra.
 * Suporta 1 palavra/frase ou múltiplas separadas por vírgula.
 */
function parseWordsInput(rawInput) {
  if (typeof rawInput !== "string") return [];
  return rawInput
    .split(",")
    .map((item) => normalizeProfanityText(item))
    .filter((item) => item.length > 0);
}

module.exports = {
  normalizeProfanityText,
  ensureAntipalavraoConfig,
  extractMessageTextForFilter,
  findBannedWord,
  parseWordsInput,
};
