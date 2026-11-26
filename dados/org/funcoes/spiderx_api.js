"use strict";

const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * Cliente dedicado para a Spider X API (modos que consomem créditos no /stickeraudio):
 * - MODO 1: Download de áudio via link do YouTube.
 * - MODO 2: Busca e download de música pelo nome.
 *
 * Modos 3 (vídeo até 10s) e 4 (imagem + áudio do WhatsApp) NÃO devem chamar este módulo.
 *
 * Segurança:
 * - O token é lido de process.env.SPIDER_API_TOKEN ou dados/settings.json ("spider_api_token").
 * - Nenhuma chave/token é exposta em logs ou mensagens de erro.
 */

const SETTINGS_PATH = path.resolve(__dirname, "..", "..", "settings.json");
const DEFAULT_BASE_URL = "https://api.spiderx.com.br/api";
const DEFAULT_YTMP3_PATH = "/downloads/yt-mp3";
const DEFAULT_PLAY_AUDIO_PATH = "/downloads/play-audio";
const DEFAULT_API_TIMEOUT_MS = 25000;
const DEFAULT_DOWNLOAD_TIMEOUT_MS = 35000;
const MAX_AUDIO_DOWNLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

class SpiderXError extends Error {
  constructor(code, userMessage, details = "") {
    super(sanitizeSecrets(details || userMessage));
    this.name = "SpiderXError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

/**
 * Remove qualquer token/apikey de strings antes de logar ou retornar erros.
 */
function sanitizeSecrets(input) {
  return String(input || "")
    .replace(/((?:[?&]|\b)(?:api_key|apikey|token|key)=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[REDACTED]");
}

/**
 * Lê configurações da Spider X API de forma compatível com settings.json da v8 e v9.
 */
function getSpiderConfig(settingsOverride = null) {
  let fileSettings = {};
  if (settingsOverride && typeof settingsOverride === "object") {
    fileSettings = settingsOverride;
  } else {
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        fileSettings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) || {};
      }
    } catch {
      fileSettings = {};
    }
  }

  const token = String(
    process.env.SPIDER_API_TOKEN ||
    fileSettings.spider_api_token ||
    fileSettings.SPIDER_API_TOKEN ||
    ""
  ).trim();

  const baseUrl = String(
    process.env.SPIDER_API_BASE_URL ||
    fileSettings.spider_api_base_url ||
    DEFAULT_BASE_URL
  )
    .trim()
    .replace(/\/+$/, "");

  const ytmp3Path = String(
    process.env.SPIDER_API_YTMP3_PATH ||
    fileSettings.spider_api_ytmp3_path ||
    DEFAULT_YTMP3_PATH
  ).trim();

  const playAudioPath = String(
    process.env.SPIDER_API_PLAY_AUDIO_PATH ||
    fileSettings.spider_api_play_audio_path ||
    DEFAULT_PLAY_AUDIO_PATH
  ).trim();

  return { token, baseUrl, ytmp3Path, playAudioPath };
}

/**
 * Verifica se o texto parece ser uma URL HTTP(S) ou domínio de link.
 */
function looksLikeUrl(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  return /^(https?:\/\/|www\.|youtu\.be\/|youtube\.com\/|m\.youtube\.com\/|music\.youtube\.com\/|(?:vm\.|vt\.|m\.)?tiktok\.com\/|(?:m\.)?instagram\.com\/|instagr\.am\/|ddinstagram\.com\/)/i.test(
    trimmed
  );
}

/**
 * Valida estritamente se uma string é um link válido do YouTube.
 */
function isValidYouTubeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  let candidate = rawUrl.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const allowedHosts = new Set([
      "youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtu.be",
    ]);
    if (!allowedHosts.has(host)) return false;

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id);
    }

    if (parsed.pathname === "/watch") {
      const v = parsed.searchParams.get("v") || "";
      return /^[A-Za-z0-9_-]{11}$/.test(v);
    }

    const shortsOrEmbed = parsed.pathname.match(/^\/(shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
    if (shortsOrEmbed) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Normaliza um link do YouTube (incluindo /shorts/ e parâmetros ?is=/?si=)
 * para o formato canônico https://www.youtube.com/watch?v=<id>.
 */
function normalizeYouTubeUrl(rawUrl) {
  let candidate = String(rawUrl || "").trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
        return `https://www.youtube.com/watch?v=${id}`;
      }
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v") || "";
        if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
          return `https://www.youtube.com/watch?v=${id}`;
        }
      }
      const match = parsed.pathname.match(/^\/(shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
      if (match) {
        return `https://www.youtube.com/watch?v=${match[2]}`;
      }
    }
  } catch {
    // manter candidate
  }

  return candidate;
}

/**
 * Classifica erros HTTP/JSON retornados pela Spider X API.
 */
function classifyApiError(status, bodyText = "", rawErr = null) {
  const lowered = String(bodyText || rawErr?.message || "").toLowerCase();

  // Timeout
  if (
    rawErr?.code === "ECONNABORTED" ||
    rawErr?.code === "ETIMEDOUT" ||
    /timeout|timed out|aborted/i.test(lowered)
  ) {
    return new SpiderXError(
      "SPIDERX_TIMEOUT",
      "> ⏱️ *Não consegui baixar a tempo*\n> 💡 Tente outro nome ou mande o link/vídeo",
      rawErr?.message || "timeout"
    );
  }

  // Falta de créditos / limite atingido
  if (
    status === 402 ||
    status === 429 ||
    /cr[eé]dito|credit|saldo|insufficient|limit|quota|plano expirado|sem requisi/i.test(lowered)
  ) {
    return new SpiderXError(
      "SPIDERX_NO_CREDITS",
      "> ⚠️ *Limite da API atingido*\n> 💡 Envie um vídeo ou áudio direto",
      `HTTP ${status || "N/A"}: ${bodyText.slice(0, 160)}`
    );
  }

  // Autenticação / API Key inválida
  if (
    status === 401 ||
    status === 403 ||
    /unauthoriz|forbidden|api[_\s-]?key|token inv[aá]lid|invalid key|chave inv[aá]lid/i.test(lowered)
  ) {
    return new SpiderXError(
      "SPIDERX_AUTH_ERROR",
      "> 🔐 *Erro na chave da API*\n> 💡 Avise o dono do bot",
      `HTTP ${status || "N/A"} auth error`
    );
  }

  // Não encontrado
  if (
    status === 404 ||
    /not found|n[aã]o encontrad|nenhum resultado|no results|indispon[ií]vel|video unavailable/i.test(
      lowered
    )
  ) {
    return new SpiderXError(
      "SPIDERX_NOT_FOUND",
      "> 🔎 *Áudio não encontrado*\n> 💡 Tente outro nome ou mande o link/vídeo",
      `HTTP ${status || "N/A"} not found`
    );
  }

  // Rede / API fora do ar
  if (
    (status && status >= 500) ||
    rawErr?.code === "ENOTFOUND" ||
    rawErr?.code === "ECONNREFUSED" ||
    rawErr?.code === "EAI_AGAIN" ||
    rawErr?.code === "ECONNRESET"
  ) {
    return new SpiderXError(
      "SPIDERX_UNAVAILABLE",
      "> ⚠️ *Erro ao buscar o áudio*\n> 💡 Tente novamente em instantes",
      `HTTP ${status || rawErr?.code || "network"}`
    );
  }

  return new SpiderXError(
    "SPIDERX_UNAVAILABLE",
    "> ⚠️ *Erro ao buscar o áudio*\n> 💡 Tente novamente em instantes",
    `HTTP ${status || "N/A"}: ${bodyText.slice(0, 160)}`
  );
}

/**
 * Extrai URL de download e metadados de diferentes formatos JSON retornados pela Spider X API.
 */
function extractAudioMetadataFromJson(payload) {
  if (!payload || typeof payload !== "object") return null;

  const containers = [payload, payload.data, payload.result, payload.response].filter(
    (c) => c && typeof c === "object"
  );

  let audioUrl = null;
  let title = "";
  let duration = null;

  for (const obj of containers) {
    if (!audioUrl) {
      const urlCandidate =
        obj.url ||
        obj.download_link ||
        obj.downloadUrl ||
        obj.download ||
        obj.audio_url ||
        obj.audioUrl ||
        obj.audio ||
        obj.mp3 ||
        obj.link;
      if (typeof urlCandidate === "string" && /^https?:\/\//i.test(urlCandidate)) {
        audioUrl = urlCandidate;
      }
    }
    if (!title) {
      const t = obj.title || obj.titulo || obj.name || obj.nome;
      if (typeof t === "string" && t.trim()) title = t.trim();
    }
    if (duration === null) {
      const d = obj.duration || obj.seconds || obj.tempo || obj.total_duration_in_seconds;
      if (d !== undefined && d !== null) duration = d;
    }
  }

  return { audioUrl, title, duration };
}

/**
 * Valida se o buffer parece ser áudio binário válido (não página HTML/JSON de erro).
 */
function assertValidAudioBuffer(buffer, contentType = "") {
  if (!Buffer.isBuffer(buffer) || buffer.length < 512) {
    throw new SpiderXError(
      "INVALID_MEDIA_FILE",
      "❌ O arquivo de áudio retornado pela API está vazio ou corrompido."
    );
  }

  if (buffer.length > MAX_AUDIO_DOWNLOAD_BYTES) {
    throw new SpiderXError(
      "INVALID_MEDIA_FILE",
      "❌ O arquivo de áudio excede o tamanho máximo suportado (25 MB)."
    );
  }

  const ct = String(contentType || "").toLowerCase();
  const head = buffer.slice(0, 64).toString("utf8").trim().toLowerCase();

  if (
    ct.includes("text/html") ||
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("{")
  ) {
    throw new SpiderXError(
      "INVALID_MEDIA_FILE",
      "❌ A API retornou um conteúdo incompatível em vez de um arquivo de áudio."
    );
  }
}

/**
 * Executa a chamada à Spider X API e retorna o Buffer de áudio pronto para o FFmpeg.
 */
async function requestSpiderXAudio(endpointPath, params, options = {}) {
  const cfg = getSpiderConfig(options.settings);
  const httpClient = options.httpClient || axios;

  if (!cfg.token) {
    throw new SpiderXError(
      "SPIDERX_NO_TOKEN",
      "🔑 *Spider X API não configurada.*\n" +
      "> Defina `SPIDER_API_TOKEN` no ambiente ou `spider_api_token` em `dados/settings.json`.\n" +
      "> 💡 _Vídeos de até 10s e imagem + áudio do WhatsApp funcionam sem precisar de API!_"
    );
  }

  const normalizedPath = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`;
  const requestUrl = `${cfg.baseUrl}${normalizedPath}`;
  const queryParams = { ...params, api_key: cfg.token };

  let apiRes;
  try {
    apiRes = await httpClient.get(requestUrl, {
      params: queryParams,
      timeout: options.timeoutMs || DEFAULT_API_TIMEOUT_MS,
      responseType: "arraybuffer",
      maxContentLength: MAX_AUDIO_DOWNLOAD_BYTES,
      maxBodyLength: MAX_AUDIO_DOWNLOAD_BYTES,
      validateStatus: () => true,
      headers: {
        Accept: "application/json, audio/*, application/octet-stream",
        "User-Agent": "Aleatory-Bot/9.0",
      },
    });
  } catch (err) {
    throw classifyApiError(err?.response?.status, "", err);
  }

  const status = Number(apiRes?.status || 0);
  const contentType = String(
    apiRes?.headers?.["content-type"] || apiRes?.headers?.["Content-Type"] || ""
  ).toLowerCase();
  const rawBuffer = Buffer.isBuffer(apiRes?.data)
    ? apiRes.data
    : Buffer.from(apiRes?.data || "");

  // Tratar erros HTTP da API
  if (status < 200 || status >= 300) {
    const errBody = rawBuffer.slice(0, 500).toString("utf8");
    throw classifyApiError(status, errBody);
  }

  // Caso 1: API retornou o áudio binário diretamente
  if (
    contentType.includes("audio/") ||
    contentType.includes("application/octet-stream") ||
    contentType.includes("video/mp4")
  ) {
    assertValidAudioBuffer(rawBuffer, contentType);
    return {
      buffer: rawBuffer,
      title: params.search || "YouTube Audio",
      duration: null,
    };
  }

  // Caso 2: API retornou JSON contendo erro lógico ou URL do áudio
  let parsedJson;
  const textBody = rawBuffer.toString("utf8");
  try {
    parsedJson = JSON.parse(textBody);
  } catch {
    // Se não é JSON e parece binário de áudio (ex.: header ID3 / OggS / ftyp / fLaC)
    const sig = rawBuffer.slice(0, 4).toString("ascii");
    if (
      sig === "ID3" ||
      sig === "OggS" ||
      sig === "fLaC" ||
      sig === "RIFF" ||
      (rawBuffer.length > 1024 && rawBuffer[0] === 0xff && (rawBuffer[1] & 0xe0) === 0xe0)
    ) {
      assertValidAudioBuffer(rawBuffer, "audio/mpeg");
      return {
        buffer: rawBuffer,
        title: params.search || "YouTube Audio",
        duration: null,
      };
    }
    throw new SpiderXError(
      "INVALID_MEDIA_FILE",
      "❌ A Spider X API retornou uma resposta inválida ou incompatível."
    );
  }

  // Verificar erro explícito no JSON mesmo com HTTP 200
  if (
    parsedJson.error ||
    parsedJson.erro ||
    parsedJson.success === false ||
    parsedJson.status === false
  ) {
    const errMsg = String(
      parsedJson.message ||
      parsedJson.mensagem ||
      parsedJson.error ||
      parsedJson.erro ||
      ""
    );
    throw classifyApiError(status, errMsg);
  }

  const meta = extractAudioMetadataFromJson(parsedJson);
  if (!meta || !meta.audioUrl) {
    throw new SpiderXError(
      "SPIDERX_NOT_FOUND",
      "🔎 *Música não encontrada* ou a API não retornou um link de áudio válido."
    );
  }

  // Baixar o áudio real a partir da URL retornada pela Spider X API
  let mediaRes;
  try {
    mediaRes = await httpClient.get(meta.audioUrl, {
      timeout: options.downloadTimeoutMs || DEFAULT_DOWNLOAD_TIMEOUT_MS,
      responseType: "arraybuffer",
      maxContentLength: MAX_AUDIO_DOWNLOAD_BYTES,
      maxBodyLength: MAX_AUDIO_DOWNLOAD_BYTES,
      validateStatus: () => true,
      headers: {
        "User-Agent": "Aleatory-Bot/9.0",
      },
    });
  } catch (err) {
    throw classifyApiError(err?.response?.status, "", err);
  }

  if (!mediaRes || mediaRes.status < 200 || mediaRes.status >= 300) {
    throw new SpiderXError(
      "SPIDERX_UNAVAILABLE",
      "⚠️ Falha ao baixar o arquivo de áudio retornado pela Spider X API. Tente novamente.",
      `Download HTTP ${mediaRes?.status || "N/A"}`
    );
  }

  const audioBuffer = Buffer.isBuffer(mediaRes.data)
    ? mediaRes.data
    : Buffer.from(mediaRes.data || "");
  const audioContentType = String(
    mediaRes.headers?.["content-type"] || mediaRes.headers?.["Content-Type"] || ""
  );

  assertValidAudioBuffer(audioBuffer, audioContentType);

  return {
    buffer: audioBuffer,
    title: meta.title || params.search || "YouTube Audio",
    duration: meta.duration,
  };
}

/**
 * MODO 1 — Baixa áudio do YouTube por link usando a Spider X API (consome créditos).
 */
async function fetchYouTubeAudioByUrl(rawUrl, options = {}) {
  if (!isValidYouTubeUrl(rawUrl)) {
    throw new SpiderXError(
      "INVALID_YOUTUBE_URL",
      "❌ *Link do YouTube inválido.*\n> Envie um link válido como `https://youtu.be/...` ou `https://www.youtube.com/watch?v=...`."
    );
  }

  const cfg = getSpiderConfig(options.settings);
  const cleanUrl = normalizeYouTubeUrl(rawUrl);
  const result = await requestSpiderXAudio(cfg.ytmp3Path, { url: cleanUrl }, options);
  return { ...result, source: "spiderx_url" };
}

/**
 * MODO 2 — Pesquisa e baixa áudio pelo nome da música usando a Spider X API (consome créditos).
 */
async function fetchYouTubeAudioByName(songName, options = {}) {
  const cleanQuery = String(songName || "").trim();
  if (cleanQuery.length < 2) {
    throw new SpiderXError(
      "SPIDERX_NOT_FOUND",
      "❌ Informe o *nome da música* (mínimo 2 caracteres) ou um *link válido do YouTube*."
    );
  }
  if (cleanQuery.length > 150) {
    throw new SpiderXError(
      "SPIDERX_NOT_FOUND",
      "❌ O termo de busca é muito longo (máximo 150 caracteres)."
    );
  }

  const cfg = getSpiderConfig(options.settings);
  const result = await requestSpiderXAudio(
    cfg.playAudioPath,
    { search: cleanQuery },
    options
  );
  return { ...result, source: "spiderx_search" };
}

module.exports = {
  SpiderXError,
  sanitizeSecrets,
  getSpiderConfig,
  looksLikeUrl,
  isValidYouTubeUrl,
  normalizeYouTubeUrl,
  fetchYouTubeAudioByUrl,
  fetchYouTubeAudioByName,
};
