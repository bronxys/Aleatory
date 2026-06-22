/**
 * quiz.js — Sistema de Quiz DINÂMICO
 * Puxa perguntas, imagens e temas da Wikipedia em tempo real
 * Nunca repete — infinitas perguntas possíveis
 */

const axios = require("axios");
let sharp;
try { sharp = require("sharp"); } catch (e) { sharp = null; }

const UA = { "User-Agent": "AleatoryBot/1.0 (WhatsApp Quiz Bot)" };

// ═══ TEMAS DE BUSCA (usados para pesquisar na Wikipedia) ═══
const TEMAS = [
  { cat: "⚽ Jogadores", buscas: ["futebolista brasileiro", "futebolista argentino", "futebolista seleção brasileira", "artilheiro futebol", "jogador Copa do Mundo"], nivel: [1, 2, 3] },
  { cat: "🏆 Times", buscas: ["clube de futebol brasileiro", "clube de futebol europeu", "time futebol série A", "clube futebol Rio de Janeiro", "clube futebol São Paulo"], nivel: [1, 2, 3] },
  { cat: "🐾 Animais", buscas: ["mamífero", "animal doméstico", "animal selvagem", "ave brasileira", "felino", "animal marinho", "cachorro raça"], nivel: [1, 2, 3] },
  { cat: "🎤 Cantores", buscas: ["cantor brasileiro", "cantora brasileira", "cantor sertanejo", "cantor pop", "rapper brasileiro", "cantor funk", "dupla sertaneja"], nivel: [1, 2, 3] },
  { cat: "🚗 Carros", buscas: ["automóvel esportivo", "marca de automóvel", "carro luxo", "carro elétrico", "carro popular Brasil"], nivel: [1, 2, 3] },
  { cat: "🏢 Empresas", buscas: ["empresa tecnologia", "rede social", "empresa brasileira", "marca famosa", "empresa multinacional"], nivel: [1, 2, 3] },
  { cat: "📱 Eletrônicos", buscas: ["console de videogame", "smartphone", "dispositivo eletrônico", "computador portátil"], nivel: [2, 3] },
  { cat: "🎬 Famosos", buscas: ["ator brasileiro", "atriz brasileira", "apresentador televisão", "modelo brasileiro", "celebridade brasileira"], nivel: [1, 2, 3] },
  { cat: "📱 Influencers", buscas: ["youtuber brasileiro", "influenciador digital", "tiktoker brasileiro", "streamer brasileiro"], nivel: [2, 3] },
  { cat: "🔮 Objetos", buscas: ["instrumento musical", "ferramenta", "utensílio cozinha", "equipamento esportivo"], nivel: [1, 2] },
];

// ═══ ESTADO POR GRUPO ═══
const quizAtivo = new Map();
const grupoScore = new Map();
const grupoHistorico = new Map();

// ═══ BUSCAR QUIZ DA WIKIPEDIA PT ═══
async function gerarQuizDinamico(groupId) {
  const historico = grupoHistorico.get(groupId) || [];
  const nivelGrupo = getNivelGrupo(groupId);

  for (let tentativa = 0; tentativa < 6; tentativa++) {
    try {
      let temasDisponiveis = TEMAS;
      if (nivelGrupo === 1) {
        temasDisponiveis = TEMAS.filter(t => t.nivel.includes(1));
      }
      const tema = temasDisponiveis[Math.floor(Math.random() * temasDisponiveis.length)];
      const busca = tema.buscas[Math.floor(Math.random() * tema.buscas.length)];
      // Fácil: top 5 resultados (mais famosos), Difícil: offset alto
      const offset = nivelGrupo === 1 ? 0 : nivelGrupo === 2 ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 100);

      // ═══ WIKIPEDIA PORTUGUÊS ═══
      const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(busca)}&srlimit=15&sroffset=${offset}&format=json`;
      const searchRes = await axios.get(searchUrl, { headers: UA, timeout: 10000 });
      const results = searchRes.data?.query?.search || [];

      if (results.length === 0) continue;

      const disponiveis = results.filter(r => !historico.includes(r.title.toLowerCase()));
      if (disponiveis.length === 0) continue;

      const shuffled = disponiveis.sort(() => Math.random() - 0.5);

      for (const artigo of shuffled.slice(0, 5)) {
        try {
          // ═══ SUMMARY EM PORTUGUÊS ═══
          const summaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artigo.title)}`;
          const summary = await axios.get(summaryUrl, { headers: UA, timeout: 8000 });
          const data = summary.data;

          if (!data?.thumbnail?.source) continue;
          if (!data?.extract) continue;

          // No modo fácil, pular artigos obscuros (nomes longos/complexos)
          if (nivelGrupo === 1 && artigo.title.length > 20) continue;

          // ═══ DICA SEMPRE EM PORTUGUÊS ═══
          // Usar extract (sempre em PT) em vez de description (muitas vezes em EN)
          let dica = "";
          const extractPT = (data.extract || "").split(".")[0];

          if (extractPT && extractPT.length >= 5) {
            // Remover o nome do próprio artigo da dica (para não entregar a resposta)
            dica = extractPT;
            const nomeSimples = artigo.title.replace(/\s*\(.*?\)\s*/g, "").trim();
            dica = dica.replace(new RegExp(nomeSimples, "gi"), "???");
            if (dica.length > 60) dica = dica.substring(0, 57) + "...";
          }

          // Fallback se dica ficou vazia ou muito curta
          if (!dica || dica.length < 5) {
            dica = data.description || "Descubra quem é!";
            // Se description veio em inglês, trocar
            if (/^[a-zA-Z\s,\-()]+$/.test(dica)) {
              dica = "Descubra quem é!";
            }
          }

          // Simplificar resposta
          let resposta = artigo.title
            .replace(/\s*\(.*?\)\s*/g, "")
            .trim()
            .toLowerCase();

          // Salvar no histórico
          historico.push(resposta);
          if (historico.length > 50) historico.shift();
          grupoHistorico.set(groupId, historico);

          let nivel = 1;
          if (resposta.length > 15) nivel = 3;
          else if (resposta.length > 8) nivel = 2;

          return {
            categoria: tema.cat,
            resposta,
            respostaNorm: norm(resposta),
            wiki: [artigo.title],
            dica,
            nivel,
            nivelGrupo,
            thumbnailUrl: data.thumbnail.source,
            dinamico: true,
          };
        } catch (e) { continue; }
      }
    } catch (e) { continue; }
  }
  return null;
}

// ═══ BUSCAR IMAGEM ═══
async function buscarImagem(wikiOrUrl, categoria) {
  try {
    let imgUrl;

    // Se recebeu URL direta (quiz dinâmico)
    if (typeof wikiOrUrl === "string" && wikiOrUrl.startsWith("http")) {
      imgUrl = wikiOrUrl;
    } else {
      // Wiki array — buscar via API
      const nomes = Array.isArray(wikiOrUrl) ? wikiOrUrl : [wikiOrUrl];
      for (const nome of nomes) {
        for (const lang of ["en", "pt"]) {
          try {
            const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nome)}`;
            const res = await axios.get(url, { timeout: 8000, headers: UA });
            imgUrl = res.data?.thumbnail?.source || res.data?.originalimage?.source;
            if (imgUrl) break;
          } catch (e) { continue; }
        }
        if (imgUrl) break;
      }
    }

    if (!imgUrl) return null;

    const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 10000, headers: UA });
    if (!imgRes.data) return null;
    let buf = Buffer.from(imgRes.data);

    // Efeito silhueta para times
    if (sharp && categoria === "🏆 Times") {
      try { buf = await aplicarSilhueta(buf); } catch (e) { /* usa original */ }
    }

    return buf;
  } catch (e) {
    console.log("[QUIZ-IMG]", e?.message);
    return null;
  }
}

// ═══ EFEITO SILHUETA ═══
async function aplicarSilhueta(imgBuffer) {
  if (!sharp) return imgBuffer;
  const meta = await sharp(imgBuffer).metadata();
  const w = meta.width || 400, h = meta.height || 400;
  const overlay = Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="black" opacity="0.55"/></svg>`
  );
  return await sharp(imgBuffer)
    .blur(3)
    .composite([{ input: overlay, blend: "over" }])
    .jpeg({ quality: 70 })
    .toBuffer();
}

// ═══ DIFICULDADE PROGRESSIVA ═══
function getNivelGrupo(groupId) {
  const score = grupoScore.get(groupId) || { acertos: 0 };
  if (score.acertos < 3) return 1;
  if (score.acertos < 7) return 2;
  return 3;
}

function addAcerto(groupId) {
  const score = grupoScore.get(groupId) || { acertos: 0 };
  score.acertos++;
  grupoScore.set(groupId, score);
  return score.acertos;
}

// ═══ NORMALIZAÇÃO ═══
function norm(text) {
  if (!text) return "";
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

// ═══ LEVENSHTEIN ═══
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));
  return dp[m][n];
}

// ═══ INICIAR QUIZ ═══
async function iniciarQuiz(groupId) {
  if (quizAtivo.has(groupId)) return null;

  const quizData = await gerarQuizDinamico(groupId);
  if (!quizData) return null;

  const quiz = {
    ...quizData,
    inicio: Date.now(),
    tentativas: 0,
    maxTentativas: 20,
    timeout: 300000, // 5 minutos
  };

  quizAtivo.set(groupId, quiz);
  return quiz;
}

// ═══ VERIFICAR RESPOSTA ═══
function verificarResposta(groupId, texto) {
  const quiz = quizAtivo.get(groupId);
  if (!quiz) return null;

  if (Date.now() - quiz.inicio > quiz.timeout) {
    const resp = quiz.resposta;
    quizAtivo.delete(groupId);
    return { status: "timeout", resposta: resp };
  }

  const textoNorm = norm(texto);
  const respostaNorm = quiz.respostaNorm;

  if (textoNorm.length < 2 || textoNorm.length > 50) return null;
  if (/^[!/.#]/.test(texto.trim())) return null;
  if (/https?:\/\//.test(texto)) return null;

  const ignorar = ["bom dia","boa tarde","boa noite","oi","ola","eae","fala","salve",
    "sim","nao","ok","blz","kk","kkk","kkkk","rs","haha","ata","hmm","hm",
    "obrigado","obrigada","vlw","tmj","td bem"];
  if (ignorar.includes(textoNorm)) return null;

  quiz.tentativas++;

  // ═══ ACERTOU (exato) ═══
  if (textoNorm === respostaNorm) {
    const totalAcertos = addAcerto(groupId);
    quizAtivo.delete(groupId);
    return { status: "acertou", resposta: quiz.resposta, tentativas: quiz.tentativas, totalAcertos, nivel: quiz.nivel };
  }

  // Acertou parte significativa (nome/sobrenome)
  const partes = respostaNorm.split(" ");
  if (partes.length > 1 && partes.some(p => p === textoNorm && p.length >= 4)) {
    const totalAcertos = addAcerto(groupId);
    quizAtivo.delete(groupId);
    return { status: "acertou", resposta: quiz.resposta, tentativas: quiz.tentativas, totalAcertos, nivel: quiz.nivel };
  }

  // ═══ QUASE LÁ ═══
  const dist = levenshtein(textoNorm, respostaNorm);
  let distParte = Infinity;
  for (const parte of partes) {
    if (parte.length >= 3) distParte = Math.min(distParte, levenshtein(textoNorm, parte));
  }
  const minDist = Math.min(dist, distParte);

  if (minDist <= 2 && minDist > 0) return { status: "quase", resposta: quiz.resposta };
  if (minDist <= Math.floor(respostaNorm.length * 0.5) && minDist > 2) return { status: "longe", resposta: quiz.resposta };

  if (quiz.tentativas >= quiz.maxTentativas) {
    const resp = quiz.resposta;
    quizAtivo.delete(groupId);
    return { status: "esgotou", resposta: resp };
  }

  return null;
}

// ═══ CANCELAR ═══
function cancelarQuiz(groupId) {
  if (quizAtivo.has(groupId)) {
    const resp = quizAtivo.get(groupId).resposta;
    quizAtivo.delete(groupId);
    return resp;
  }
  return null;
}

// ═══ TEM QUIZ? ═══
function temQuiz(groupId) {
  if (!quizAtivo.has(groupId)) return false;
  const quiz = quizAtivo.get(groupId);
  if (Date.now() - quiz.inicio > quiz.timeout) {
    quizAtivo.delete(groupId);
    return false;
  }
  return true;
}

// ═══ DICA ═══
function getDica(groupId) {
  const quiz = quizAtivo.get(groupId);
  if (!quiz) return null;
  let dica = quiz.dica;
  if (quiz.nivelGrupo >= 3 && dica.includes(",")) {
    dica = dica.split(",")[0] + "...";
  }
  return { dica, categoria: quiz.categoria, nivel: quiz.nivelGrupo };
}

module.exports = {
  iniciarQuiz,
  verificarResposta,
  cancelarQuiz,
  temQuiz,
  getDica,
  buscarImagem,
};
