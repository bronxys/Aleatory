// ═══════════════════════════════════════════════════════════
//  ALEATORY v9.0 — SISTEMA DE VOZ DA IA ALEATORY
//  1) Banco de áudios pré-gravados (voz Orus) — funciona 100% offline/sem API key
//  2) Síntese dinâmica Gemini TTS (mesma voz Orus) — quando gemini_api_key está em settings.json
//  By Josival & M.Scheyot • bronxyshost.com
// ═══════════════════════════════════════════════════════════
const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");
const { execFile } = require("child_process");

const ROOT = path.join(__dirname, "..", "..", "..");
const VOZ_DIR = path.join(ROOT, "media", "voz_ia");
const INTRO_OGG = path.join(ROOT, "media", "duvida", "aleatory_intro.ogg");
const SETTINGS_PATH = path.join(ROOT, "dados", "settings.json");

function _pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _norm(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s?!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function _loadOgg(filePath) {
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      return { buffer: fs.readFileSync(filePath), mimetype: "audio/ogg; codecs=opus" };
    }
  } catch { }
  return null;
}

/**
 * Tenta casar a mensagem do usuário com um áudio pré-gravado da voz oficial do Aleatory.
 * Só dispara quando a mensagem é curta/direta daquela intenção, para nunca interceptar
 * perguntas complexas (ex.: "Aleatory oi, me explica física quântica").
 */
function matchPresetAudio(rawText) {
  const clean = _norm(rawText);
  if (!clean) return null;

  // Remove vocativos ("aleatory", "hey", "ei") para avaliar a intenção real
  const intent = clean
    .replace(/\b(aleatory|aleatori|bot|hey|ei|eae|eai|oie+|oi+|ola)\b/g, "")
    .replace(/[?!]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // 1) Pedido explícito de áudio/voz sem pergunta complexa
  if (
    /\b(manda|envia|fala|solta|quero|ouvir)\b.*\b(audio|voz)\b/.test(clean) &&
    clean.length <= 60 &&
    !/\b(explica\w*|falando|dizendo|contando|sobre|como|qual|por que|porque|faz|cria|escreve|o que)\b/.test(clean)
  ) {
    return _loadOgg(path.join(VOZ_DIR, "manda_audio.ogg")) || _loadOgg(INTRO_OGG) || _loadOgg(path.join(VOZ_DIR, "salve_1.ogg"));
  }

  // 2) Sobre o bot / quem criou / BronxysHost (usa o áudio oficial de apresentação)
  if (
    /\b(quem te criou|quem criou voce|quem fez voce|quem e seu dono|quem e seu criador|fala sobre voce|se apresenta|apresente se|sobre a bronxys|quem e a bronxys)\b/.test(clean) &&
    clean.length <= 75
  ) {
    return _loadOgg(INTRO_OGG);
  }

  // 3) Natal / Ano Novo / Boas festas
  if (/\b(feliz ano novo|ano novo|reveillon|virada de ano)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "feliz_ano_novo.ogg"));
  }
  if (/\b(feliz natal|boas festas|papai noel)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "feliz_natal.ogg"));
  }

  // 3b) Enigma / Charada
  if (/\b(enigma|charada|adivinha|me desafia|faz um desafio|manda um desafio)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, _pick(["enigma_1.ogg", "enigma_2.ogg"])));
  }

  // 3c) História / Conto
  if (/\b(conta uma historia|me conta uma historia|conta historia|fala uma historia|uma historia|um conto)\b/.test(clean) && clean.length <= 70) {
    return _loadOgg(path.join(VOZ_DIR, _pick(["historia_1.ogg", "historia_2.ogg"])));
  }

  // 3d) Música / Cantar / Rap / Rima
  if (/\b(canta|cantar|manda uma musica|canta uma musica|faz um rap|manda um rap|faz uma rima|manda uma rima|solta uma rima)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "musica_1.ogg"));
  }

  // 3e) Curiosidade / Fato interessante
  if (/\b(curiosidade|fato curioso|me conta algo legal|fala algo interessante)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "curiosidade.ogg"));
  }

  // 3f) Conselho / Motivação
  if (/\b(conselho|me da um conselho|me motiva|frase motivacional|motivacao)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "conselho.ogg"));
  }

  // 3g) Tédio / O que fazer
  if (/\b(to entediado|to entediada|estou entediado|estou entediada|que tedio|to no tedio|o que fazer|me distrai)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "entediado.ogg"));
  }

  // 3h) Cantada
  if (/\b(cantada|me ensina uma cantada|manda uma cantada|fala uma cantada)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "cantada.ogg"));
  }

  // 3i) Fofoca
  if (/\b(fofoca|conta uma fofoca|tem fofoca|qual a fofoca|me conta uma fofoca)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "fofoca.ogg"));
  }

  // 3j) Futebol / Time
  if (/\b(qual seu time|que time voce torce|que time vc torce|torce pra qual time|gosta de futebol|fala de futebol)\b/.test(clean) && clean.length <= 70) {
    return _loadOgg(path.join(VOZ_DIR, "futebol.ogg"));
  }

  // 3k) Sono / Cansaço / Café
  if (/\b(to com sono|estou com sono|que sono|to cansado|to cansada|estou cansado|estou cansada|preciso de cafe|quero cafe)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, "sono.ogg"));
  }

  // 3l) Aniversário
  if (/\b(meu aniversario|faco aniversario|hoje e meu niver|meu niver|me da parabens|parabens pra mim)\b/.test(clean) && clean.length <= 70) {
    return _loadOgg(path.join(VOZ_DIR, "aniversario.ogg"));
  }

  // 4) Piada
  if (/\b(piada|me faz rir|conta uma|fala uma piada)\b/.test(clean) && clean.length <= 65) {
    return _loadOgg(path.join(VOZ_DIR, _pick(["piada_1.ogg", "piada_2.ogg"])));
  }

  // 5) Desabafo / triste / desanimado
  if (/\b(to triste|estou triste|to mal|estou mal|to desanimado|to desanimada|me anima|me da um animo)\b/.test(clean) && clean.length <= 75) {
    return _loadOgg(path.join(VOZ_DIR, "animo.ogg"));
  }

  // 6) Xingamento leve / zoeira
  if (/\b(cala a boca|bot burro|voce e chato|vc e chato|te odeio|vai dormir|sai fora)\b/.test(clean) && clean.length <= 55) {
    return _loadOgg(path.join(VOZ_DIR, "calma_ai.ogg"));
  }

  // 7) Agradecimento
  if (/^(muito )?(obrigado|obrigada|obg|vlw|valeu|tmj|tamo junto|agradeco|agradecido|thanks)(\s+demais|\s+meu\s+mano|\s+mano|\s+amigo)?$/.test(intent)) {
    return _loadOgg(path.join(VOZ_DIR, "valeu.ogg"));
  }

  // 8) Elogio / carinho
  if (/\b(te amo|voce e foda|vc e foda|melhor bot|voce e incrivel|vc e incrivel|voce e top|vc e top|parabens)\b/.test(clean) && clean.length <= 55) {
    return _loadOgg(path.join(VOZ_DIR, "elogio.ogg"));
  }

  // 9) Cumprimentos de horário
  if (/^bom dia(\s+pessoal|\s+galera|\s+grupo|\s+amigo|\s+mano)?$/.test(intent)) {
    return _loadOgg(path.join(VOZ_DIR, "bom_dia.ogg"));
  }
  if (/^boa tarde(\s+pessoal|\s+galera|\s+grupo|\s+amigo|\s+mano)?$/.test(intent)) {
    return _loadOgg(path.join(VOZ_DIR, "boa_tarde.ogg"));
  }
  if (/^boa noite(\s+pessoal|\s+galera|\s+grupo|\s+amigo|\s+mano)?$/.test(intent)) {
    return _loadOgg(path.join(VOZ_DIR, "boa_noite.ogg"));
  }

  // 10) "Tudo bem?" / "Como você tá?"
  if (/^(tudo bem|td bem|tudo bom|tudo certo|como voce ta|como vc ta|como voce esta|como vai|beleza|blz|suave|de boa)$/.test(intent)) {
    return _loadOgg(path.join(VOZ_DIR, "tudo_bem.ogg"));
  }

  // 11) Saudação pura ("Aleatory", "Oi Aleatory", "Fala Aleatory", "E aí Aleatory")
  if (intent === "" || /^(fala|fala ai|salve|salve salve|chega ai|opa|eae|e ai)$/.test(intent)) {
    return _loadOgg(path.join(VOZ_DIR, _pick(["salve_1.ogg", "salve_2.ogg"])));
  }

  return null;
}

/**
 * Decide se uma resposta dinâmica da IA deve ser convertida em áudio (quando gemini_api_key está ativa).
 */
function shouldReplyWithDynamicAudio(userText, replyText) {
  if (!replyText || replyText.length < 4 || replyText.length > 420) return false;
  // Não transformar código, links ou listas enormes em áudio
  if (/```|https?:\/\//i.test(replyText)) return false;

  const cleanUser = _norm(userText);
  const askedAudio = /\b(em audio|por audio|manda audio|manda um audio|envia audio|responde em audio|responde falando|fala em audio|com voz|fala pra mim)\b/.test(cleanUser);
  if (askedAudio) return true;

  // ~20% de chance espontânea em respostas curtinhas (<= 260 chars) para surpreender naturalmente
  if (replyText.length <= 260 && Math.random() < 0.2) return true;
  return false;
}

function _getGeminiKey() {
  try {
    const cfg = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
    const k = String(cfg?.gemini_api_key || "").trim();
    return k.length > 10 ? k : "";
  } catch {
    return "";
  }
}

function _pcmToOpus(pcmPath, oggPath, rate) {
  return new Promise((resolve, reject) => {
    execFile(
      "ffmpeg",
      [
        "-y", "-f", "s16le", "-ar", String(rate), "-ac", "1", "-i", pcmPath,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-ar", "48000", "-ac", "1", "-c:a", "libopus", "-b:a", "48k", "-application", "voip",
        oggPath,
      ],
      { timeout: 30000 },
      (err) => (err ? reject(err) : resolve(oggPath)),
    );
  });
}

/**
 * Sintetiza um texto dinâmico usando a mesma voz realista do Aleatory (Gemini TTS — Orus).
 * Retorna { buffer, mimetype } ou null se sem chave / erro (fallback automático para texto).
 */
async function synthesizeGeminiVoice(replyText) {
  const apiKey = _getGeminiKey();
  if (!apiKey) return null;

  // Limpar markdown/emojis excessivos para leitura fluida
  const spoken = String(replyText)
    .replace(/[*_~`]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (spoken.length < 3) return null;

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aleatory-voice-"));
  const pcmPath = path.join(tmpDir, "out.pcm");
  const oggPath = path.join(tmpDir, "out.ogg");

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Fale em português do Brasil de forma natural, amigável e descontraída como um áudio de WhatsApp. Leia APENAS o texto abaixo:\n\n${spoken}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Orus" },
            },
          },
        },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 25000 },
    );

    const part = res?.data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) return null;

    const mime = part.inlineData.mimeType || "audio/L16;codec=pcm;rate=24000";
    const rateMatch = mime.match(/rate=(\d+)/);
    const rate = rateMatch ? rateMatch[1] : "24000";

    fs.writeFileSync(pcmPath, Buffer.from(part.inlineData.data, "base64"));
    await _pcmToOpus(pcmPath, oggPath, rate);

    return { buffer: fs.readFileSync(oggPath), mimetype: "audio/ogg; codecs=opus" };
  } catch {
    return null;
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
  }
}

module.exports = {
  matchPresetAudio,
  shouldReplyWithDynamicAudio,
  synthesizeGeminiVoice,
  VOZ_DIR,
};
