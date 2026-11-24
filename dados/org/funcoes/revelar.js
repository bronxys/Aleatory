"use strict";

const {
  extractViewOncePayload,
  downloadMediaBuffer,
  unwrapMessageContainer,
} = require("./wa_adapter.js");

/**
 * Manipulador atualizado do comando /revelar (e aliases rvisu, open, revelarvisu).
 *
 * Suporta todos os tipos legítimos de visualização única entregues no payload do WhatsApp:
 * - Imagem de visualização única
 * - Vídeo de visualização única
 * - Áudio de visualização única (incluindo viewOnceMessageV2Extension)
 * - Mensagem de texto de visualização única (extendedTextMessage / conversation)
 *
 * Inclui cache em memória de curta duração (30 min, máx 500 entradas) exclusivo para
 * mensagens de texto de visualização única recebidas pelo bot, pois o cliente WhatsApp
 * omite o corpo `.text` dentro do stub `quotedMessage` quando o usuário responde a ela.
 *
 * Política de segurança e privacidade:
 * - Usa exclusivamente o conteúdo e as chaves presentes nos payloads legitimamente
 *   entregues ao bot pelo protocolo padrão do WhatsApp.
 * - Não tenta contornar restrições de privacidade ou proteções do WhatsApp.
 * - Trata mensagens expiradas, incompatíveis ou indisponíveis sem derrubar o bot.
 */

const VIEW_ONCE_TEXT_TTL_MS = 30 * 60 * 1000; // 30 minutos
const VIEW_ONCE_TEXT_MAX_ITEMS = 500;
const _viewOnceTextCache = new Map();

function _makeCacheKey(chatJid, msgId) {
  return `${String(chatJid || "")}::${String(msgId || "")}`;
}

function _pruneViewOnceCache() {
  const now = Date.now();
  for (const [k, v] of _viewOnceTextCache.entries()) {
    if (!v || v.expiresAt <= now) {
      _viewOnceTextCache.delete(k);
    }
  }
  while (_viewOnceTextCache.size > VIEW_ONCE_TEXT_MAX_ITEMS) {
    const oldestKey = _viewOnceTextCache.keys().next().value;
    if (oldestKey !== undefined) _viewOnceTextCache.delete(oldestKey);
    else break;
  }
}

/**
 * Registra em memória (TTL 30 min) mensagens de texto de visualização única
 * no momento em que chegam legitimamente ao bot.
 */
function rememberViewOnceText(info) {
  try {
    const chatJid = info?.key?.remoteJid;
    const msgId = info?.key?.id;
    if (!chatJid || !msgId || !info?.message) return false;

    const { unwrapped, isViewOnce } = unwrapMessageContainer(info.message);
    if (!unwrapped) return false;

    const ext = unwrapped.extendedTextMessage;
    const isViewOnceText =
      (isViewOnce && (typeof unwrapped.conversation === "string" || typeof ext?.text === "string")) ||
      Boolean(ext?.viewOnce);

    if (!isViewOnceText) return false;

    const text = (typeof ext?.text === "string" ? ext.text : unwrapped.conversation || "").trim();
    if (!text) return false;

    _pruneViewOnceCache();
    _viewOnceTextCache.set(_makeCacheKey(chatJid, msgId), {
      text,
      mentions: Array.isArray(ext?.contextInfo?.mentionedJid)
        ? ext.contextInfo.mentionedJid
        : [],
      expiresAt: Date.now() + VIEW_ONCE_TEXT_TTL_MS,
    });
    return true;
  } catch {
    return false;
  }
}

function getRememberedViewOnceText(chatJid, msgId) {
  if (!chatJid || !msgId) return null;
  const key = _makeCacheKey(chatJid, msgId);
  const entry = _viewOnceTextCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    _viewOnceTextCache.delete(key);
    return null;
  }
  return entry;
}

async function handleRevelarCommand({
  conn,
  from,
  info,
  prefix,
  reply,
  downloadContentFromMessage,
}) {
  try {
    const payload = extractViewOncePayload(info);

    if (!payload.found) {
      if (payload.reason === "NOT_VIEW_ONCE") {
        return await reply(
          "👁️ A mensagem marcada *não é de visualização única*.\n" +
            `> Responda a uma *foto, vídeo, áudio ou texto de visualização única* usando \`${prefix}revelar\`.`
        );
      }

      if (payload.reason === "UNSUPPORTED_TYPE") {
        return await reply(
          `⚠️ Tipo de visualização única incompatível ou não suportado (\`${payload.detectedType || "desconhecido"}\`).`
        );
      }

      return await reply(
        "👁️ *Como usar o comando Revelar:*\n\n" +
          `Responda a uma mensagem de *visualização única* com \`${prefix}revelar\`.\n` +
          "> 📷 Imagem · 🎬 Vídeo · 🎧 Áudio · 📝 Texto"
      );
    }

    // ─── TEXTO DE VISUALIZAÇÃO ÚNICA ───
    if (payload.kind === "text") {
      let revealedText = payload.text || "";
      let revealedMentions = payload.mentions || [];

      // Quando respondido via reply, o WhatsApp pode omitir .text no stub quotedMessage:
      // consultar apenas o cache temporário (30 min) das mensagens recebidas nesta sessão.
      if (!revealedText && payload.stanzaId) {
        const cached = getRememberedViewOnceText(from, payload.stanzaId);
        if (cached?.text) {
          revealedText = cached.text;
          if (!revealedMentions.length && cached.mentions?.length) {
            revealedMentions = cached.mentions;
          }
        }
      }

      if (!revealedText) {
        return await reply(
          "⚠️ O texto de visualização única não está disponível (só é possível exibir textos recebidos nos últimos 30 minutos sem reiniciar o bot)."
        );
      }

      const sendPayload = {
        text: `👁️ *Texto de visualização única:*\n\n${revealedText}`,
      };
      if (revealedMentions.length > 0) {
        sendPayload.mentions = revealedMentions;
      }

      await conn.sendMessage(from, sendPayload, { quoted: info });
      return { ok: true, kind: "text" };
    }

    // ─── MÍDIAS DE VISUALIZAÇÃO ÚNICA (IMAGEM / VÍDEO / ÁUDIO) ───
    if (!payload.hasMediaCredentials) {
      return await reply(
        "🔒 Esta mídia de visualização única *não está mais disponível* ou teve acesso restringido pelo WhatsApp (expirada/sem chave de mídia)."
      );
    }

    const buffer = await downloadMediaBuffer(
      payload.media,
      payload.kind,
      downloadContentFromMessage,
      { maxBytes: 25 * 1024 * 1024, timeoutMs: 30000 }
    );

    if (payload.kind === "image") {
      await conn.sendMessage(
        from,
        {
          image: buffer,
          caption: payload.caption || undefined,
          mimetype: payload.mimetype || "image/jpeg",
        },
        { quoted: info }
      );
      return { ok: true, kind: "image", bytes: buffer.length };
    }

    if (payload.kind === "video") {
      await conn.sendMessage(
        from,
        {
          video: buffer,
          caption: payload.caption || undefined,
          mimetype: payload.mimetype || "video/mp4",
          gifPlayback: Boolean(payload.gifPlayback),
        },
        { quoted: info }
      );
      return { ok: true, kind: "video", bytes: buffer.length };
    }

    if (payload.kind === "audio") {
      await conn.sendMessage(
        from,
        {
          audio: buffer,
          mimetype: payload.mimetype || "audio/ogg; codecs=opus",
          ptt: Boolean(payload.ptt),
        },
        { quoted: info }
      );
      return { ok: true, kind: "audio", bytes: buffer.length };
    }

    return await reply("⚠️ Tipo de mídia de visualização única não suportado.");
  } catch (err) {
    const code = err?.code || "";
    console.error("[REVELAR] Erro:", code || err?.message || err);

    if (code === "MISSING_CREDENTIALS" || code === "MEDIA_UNAVAILABLE") {
      await reply(
        "🔒 Não foi possível revelar: o conteúdo de visualização única *expirou*, foi removido ou está restrito pelo WhatsApp."
      );
    } else if (code === "MEDIA_TOO_LARGE") {
      await reply("⚠️ A mídia excede o limite máximo suportado (25 MB).");
    } else if (code === "MEDIA_TIMEOUT") {
      await reply("⏱️ Tempo limite excedido ao baixar a mídia. Tente novamente.");
    } else if (code === "EMPTY_MEDIA" || code === "DECRYPT_ERROR") {
      await reply("⚠️ Mídia indisponível ou corrompida. Não foi possível revelá-la.");
    } else {
      await reply("⚠️ Ocorreu um erro ao tentar revelar esta mensagem.");
    }
    return { ok: false, code: code || "UNKNOWN_ERROR" };
  }
}

module.exports = {
  rememberViewOnceText,
  getRememberedViewOnceText,
  handleRevelarCommand,
};
