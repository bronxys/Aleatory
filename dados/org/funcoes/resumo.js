/**
 * resumo.js — Sistema de Resumo Inteligente de Conversas
 * Captura mensagens recentes dos grupos e gera resumos temáticos
 * detectando brigas, ofensas, humor, temas e participantes ativos.
 * Integra com IA (Pollinations/Gemini) para resumos mais inteligentes.
 */

const axios = require("axios");

const MAX_MSGS_PER_GROUP = 200;
const groupBuffers = new Map();

// ═══ DICIONÁRIOS DE DETECÇÃO ═══

const OFENSAS = [
  "fdp","porra","caralho","merda","puta","vagabund","arrombad","cuzao","cuza","desgraça",
  "desgracad","viado","viad","bosta","buceta","piranha","otario","otária","lixo","nojent",
  "imbecil","idiota","retardad","burro","burra","animal","corno","cornud","safad","put",
  "foder","fode","filho da puta","vai se foder","vsf","vtnc","tnc","pqp","krl","crl",
  "babaca","trouxa","palhaço","palhaça","inutil","estupid","mongol","doente","maldito",
  "maldita","desgraca","lazarent","miseravel","cretino","cretina","peste","praga",
  "vagaba","rapariga","galinha","cachorra","cadela","puto","fela da puta","fela",
  "retardado","imbecil","ridículo","ridiculo","idiota","estúpido","estupido",
  "desgraçado","desgraçada","cuzão","pau no cu","pnc","kct","carai","pqp",
  "vadia","vagabunda","piranhuda","puta que pariu","vai tomar","morra",
  "lixo humano","verme","escória","escoria","bostinha","merdinha"
];

const TEMAS = {
  "⚽ Futebol": ["futebol","gol","jogo","time","flamengo","corinthians","palmeiras","sao paulo",
    "vasco","botafogo","fluminense","gremio","inter","atletico","santos","cruzeiro",
    "campeonato","copa","libertadores","brasileirao","escalação","tecnico","arbitro",
    "penalti","escanteio","falta","cartao","impedimento","seleção","jogador","artilheiro",
    "mengão","mengao","timão","timao","verdão","verdao","tricolor","rubro"],
  "🙏 Religião": ["deus","jesus","biblia","igreja","oração","pastor","fé","evangelho",
    "espirito santo","católico","evangélico","espirita","culto","missa","louvor","amém",
    "pecado","salvação","benção","cristão","profeta","salmo","versículo","satanás","diabo",
    "glória","gloria","aleluia","hallelujah","milagre","anjo","demônio","demonio"],
  "💕 Relacionamento": ["namoro","namorad","casamento","casad","traição","trair","amor",
    "saudade","paixão","beijo","abraço","carinho","término","separação","divórcio",
    "crush","ficante","ex","ciúme","romance","apaixonad","coração","pegação","pegacao"],
  "💰 Dinheiro": ["dinheiro","salário","pix","banco","conta","boleto","emprego","trabalho",
    "desemprego","investimento","bitcoin","cripto","preço","caro","barato","lucro","prejuízo",
    "salario","grana","bufunfa","trocado","pagamento","divida","dívida"],
  "🎮 Games": ["jogo","jogar","game","gamer","ps5","xbox","pc","mobile","free fire",
    "fortnite","minecraft","lol","valorant","cs","cod","rank","partida","gameplay","stream",
    "roblox","gta","elden ring","zelda","call of duty","pubg","among us"],
  "📱 Tecnologia": ["celular","iphone","samsung","android","app","internet","wifi",
    "computador","notebook","atualização","bug","sistema","software","ia","inteligência artificial",
    "whatsapp","telegram","tiktok","instagram"],
  "🎵 Música": ["musica","música","funk","sertanejo","rap","trap","pagode","rock","pop",
    "cantor","cantora","show","festival","clip","letra","álbum","playlist","mc","dj"],
  "📺 Entretenimento": ["filme","série","novela","netflix","anime","manga","youtube",
    "tiktok","instagram","twitter","meme","video","podcast","reality","bbb","disney"],
  "🍔 Comida": ["comida","almoço","jantar","café","pizza","hamburguer","churrasco",
    "cerveja","bebida","receita","cozinhar","restaurante","fome","lanche","açaí","acai"],
  "📚 Estudo": ["escola","faculdade","prova","trabalho","nota","professor","aula",
    "estudar","vestibular","enem","formatura","curso","matéria","dever"],
  "🏥 Saúde": ["médico","hospital","remédio","doença","dor","vacina","saúde","covid",
    "gripe","febre","exame","consulta","dieta","academia","treino"],
  "🔞 NSFW": ["nude","nudes","porno","pornô","sexo","sexual","gostosa","gostoso",
    "tesão","tesao","safadeza","putaria","sacanagem","suruba"],
  "🌍 Política": ["politica","política","governo","presidente","eleição","eleicao",
    "deputado","senador","voto","votação","lula","bolsonaro","congresso","stf"]
};

const HUMOR = ["kkkk","kkk","hahaha","haha","rsrs","kkkkk","😂","🤣","ksks",
  "huahua","auhaua","shaushua","akskaks","mkkkkk","eitta","eita","kkkkkk",
  "ahahah","huehuehue","hauahau","ksksks","kakaka","hehehe","ashuashu"];

const BRIGA = ["briga","brigando","calma","para com isso","respeita","respeite",
  "cala a boca","cala boca","ninguém te perguntou","sai fora","vaza","some",
  "vou te","te bato","porrada","bater","tapa","soco","matar","ameaça",
  "problema comigo","quer briga","vem aqui","covarde","frouxo","medroso","bloquear",
  "te pego","vou te pegar","toma cuidado","se liga","quer morrer","vai apanhar",
  "te arrebento","desgraçado","vou te ban","pau no seu","na tua cara"];

const SENTIMENTOS = {
  "😢 Tristeza": ["triste","tristeza","chorar","chorando","saudade","depressão","depressao",
    "solidão","solidao","sozinho","sozinha","angústia","angustia","sofrendo","sofrer","dor",
    "perdido","perdida","desanimado","desanimada","😢","😭","💔"],
  "😊 Felicidade": ["feliz","felicidade","alegria","contente","animado","animada","maravilhoso",
    "incrível","incrivel","perfeito","perfeita","top","show","demais","massa","daora",
    "amei","adorei","🥰","😍","🎉","❤️","💖"],
  "😡 Raiva": ["raiva","ódio","odio","nervoso","nervosa","irritado","irritada","puto","puta",
    "revoltado","revoltada","absurdo","inacreditável","inacreditavel","injusto","injustiça",
    "😡","🤬","😤","💢"],
  "😰 Ansiedade": ["ansioso","ansiosa","ansiedade","preocupado","preocupada","medo","receio",
    "tenso","tensa","nervoso","agonia","aflição","aflicao","pânico","panico","😰","😨","😱"]
};

// ═══ NORMALIZAÇÃO ═══
function norm(text) {
  if (!text) return "";
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

// ═══ BUFFER DE MENSAGENS ═══
function addMessage(groupId, senderJid, senderName, text) {
  if (!text || text.trim().length < 2) return;
  if (/^[!/.#]/.test(text.trim())) return; // ignorar comandos
  if (!groupBuffers.has(groupId)) groupBuffers.set(groupId, []);
  const buf = groupBuffers.get(groupId);
  buf.push({
    sender: senderJid,
    name: senderName || "Desconhecido",
    text: text.trim(),
    time: Date.now()
  });
  if (buf.length > MAX_MSGS_PER_GROUP) buf.splice(0, buf.length - MAX_MSGS_PER_GROUP);
}

function getMessageCount(groupId) {
  return groupBuffers.has(groupId) ? groupBuffers.get(groupId).length : 0;
}

// ═══ ANÁLISE ═══
function analyzeGroup(groupId, groupMembers) {
  const buf = groupBuffers.get(groupId);
  if (!buf || buf.length === 0) return null;

  // Dados da análise
  const participantes = new Map(); // sender -> { name, msgs, ofensas[], temas[] }
  const temasDetectados = new Map(); // tema -> count
  const sentimentosDetectados = new Map(); // sentimento -> count
  let totalOfensas = 0;
  let totalHumor = 0;
  let totalBriga = 0;
  const ofensasDetalhadas = []; // { sender, name, text, time }
  const brigasDetalhadas = [];
  const momentosHumor = [];

  for (const msg of buf) {
    const n = norm(msg.text);
    const sKey = msg.sender;

    // Inicializar participante
    if (!participantes.has(sKey)) {
      participantes.set(sKey, { name: msg.name, msgs: 0, ofensas: 0, temas: new Set() });
    }
    const p = participantes.get(sKey);
    p.msgs++;
    if (msg.name && msg.name !== "Desconhecido") p.name = msg.name;

    // Detectar ofensas
    const ofensaFound = OFENSAS.some(o => n.includes(norm(o)));
    if (ofensaFound) {
      totalOfensas++;
      p.ofensas++;
      ofensasDetalhadas.push({ sender: sKey, name: p.name, text: msg.text, time: msg.time });
    }

    // Detectar humor
    if (HUMOR.some(h => n.includes(h))) {
      totalHumor++;
      if (momentosHumor.length < 5) momentosHumor.push({ name: p.name, text: msg.text });
    }

    // Detectar briga
    if (BRIGA.some(b => n.includes(norm(b)))) {
      totalBriga++;
      brigasDetalhadas.push({ sender: sKey, name: p.name, text: msg.text, time: msg.time });
    }

    // Detectar temas
    for (const [tema, keywords] of Object.entries(TEMAS)) {
      if (keywords.some(k => n.includes(norm(k)))) {
        temasDetectados.set(tema, (temasDetectados.get(tema) || 0) + 1);
        p.temas.add(tema);
      }
    }

    // Detectar sentimentos
    for (const [sent, keywords] of Object.entries(SENTIMENTOS)) {
      if (keywords.some(k => n.includes(norm(k)))) {
        sentimentosDetectados.set(sent, (sentimentosDetectados.get(sent) || 0) + 1);
      }
    }
  }

  // Resolver LID dos participantes
  const resolvedParticipants = [];
  for (const [jid, data] of participantes.entries()) {
    let num = jid.split("@")[0];
    let resolvedJid = jid;
    if (num.length > 15 && groupMembers && groupMembers.length > 0) {
      const found = groupMembers.find(p => {
        const pLid = (p.lid || "").split("@")[0];
        const pId = (p.id || "").split("@")[0];
        return pLid === num || pId === num;
      });
      if (found && found.id) {
        const real = found.id.split("@")[0];
        if (real.length <= 15) { num = real; resolvedJid = real + "@s.whatsapp.net"; }
      }
    }
    resolvedParticipants.push({ ...data, num, jid: resolvedJid });
  }

  // Resolver LID nas ofensas e brigas
  const resolveJid = (jid) => {
    let num = jid.split("@")[0];
    if (num.length > 15 && groupMembers && groupMembers.length > 0) {
      const f = groupMembers.find(p => {
        const pLid = (p.lid || "").split("@")[0];
        const pId = (p.id || "").split("@")[0];
        return pLid === num || pId === num;
      });
      if (f && f.id) {
        const r = f.id.split("@")[0];
        if (r.length <= 15) return { num: r, jid: r + "@s.whatsapp.net" };
      }
    }
    return { num, jid };
  };

  // Ordenar temas, sentimentos e participantes
  const temasOrdenados = [...temasDetectados.entries()].sort((a, b) => b[1] - a[1]);
  const sentimentosOrdenados = [...sentimentosDetectados.entries()].sort((a, b) => b[1] - a[1]);
  resolvedParticipants.sort((a, b) => b.msgs - a.msgs);

  // Período
  const oldest = buf[0]?.time || Date.now();
  const newest = buf[buf.length - 1]?.time || Date.now();
  const diffMin = Math.round((newest - oldest) / 60000);

  // Humor do grupo
  let humor = "😐 Neutro";
  if (totalBriga > 3) humor = "🔥 Esquentado";
  else if (totalOfensas > 5) humor = "😤 Tenso";
  else if (totalHumor > buf.length * 0.3) humor = "😂 Divertido";
  else if (totalHumor > 5) humor = "😄 Descontraído";
  else if (temasDetectados.size > 3) humor = "💬 Dinâmico";

  // Preparar texto bruto para IA (últimas 60 msgs)
  const msgsParaIA = buf.slice(-60).map(m => {
    const rr = resolveJid(m.sender);
    return `[${m.name || rr.num}]: ${m.text}`;
  });

  return {
    totalMsgs: buf.length,
    periodo: diffMin,
    humor,
    participantes: resolvedParticipants,
    temas: temasOrdenados,
    sentimentos: sentimentosOrdenados,
    totalOfensas,
    totalHumor,
    totalBriga,
    ofensas: ofensasDetalhadas.slice(-10).map(o => {
      const r = resolveJid(o.sender);
      return { ...o, num: r.num, jid: r.jid };
    }),
    brigas: brigasDetalhadas.slice(-5).map(b => {
      const r = resolveJid(b.sender);
      return { ...b, num: r.num, jid: r.jid };
    }),
    textoParaIA: msgsParaIA.join("\n")
  };
}

// ═══ GERAR RESUMO COM IA ═══
async function gerarResumoIA(analysis, groupName, settingsJson) {
  if (!analysis || !analysis.textoParaIA) return null;

  const prompt = `Você é um assistente de análise de conversas de grupo de WhatsApp. Analise a conversa abaixo e gere um RESUMO INTELIGENTE seguindo estas regras:

1. Identifique os TEMAS principais discutidos (futebol, religião, relacionamento, etc)
2. Identifique BRIGAS, CONFLITOS e TENSÕES entre membros (com os nomes dos envolvidos)
3. Identifique OFENSAS e PALAVRÕES (com os nomes de quem ofendeu)
4. Identifique BRINCADEIRAS e momentos de HUMOR
5. Identifique o SENTIMENTO GERAL do grupo (tenso, alegre, neutro, etc)
6. Seja objetivo e direto, máximo 200 palavras
7. Use emojis para categorizar cada seção
8. NÃO invente informações, use APENAS o que está na conversa
9. Destaque os nomes dos envolvidos em situações importantes

Nome do grupo: ${groupName}
Total de mensagens: ${analysis.totalMsgs}

=== CONVERSA ===
${analysis.textoParaIA}
=== FIM ===

Gere o resumo agora:`;

  // Tentativa 1: Pollinations
  try {
    const polRes = await axios.post("https://text.pollinations.ai/v1/chat/completions", {
      messages: [
        { role: "system", content: "Você analisa conversas de grupo de WhatsApp e gera resumos inteligentes em pt-BR. Seja direto, identifique conflitos, ofensas, temas e humor." },
        { role: "user", content: prompt }
      ],
      model: "openai",
      jsonMode: false,
      seed: Math.floor(Math.random() * 99999),
    }, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
    const txt = polRes?.data?.choices?.[0]?.message?.content;
    if (txt && txt.length > 10) {
      console.log("[RESUMO-IA] ✅ Pollinations respondeu");
      return txt.trim();
    }
  } catch (e) {
    console.log("[RESUMO-IA] Pollinations falhou:", e?.response?.status || e?.message);
  }

  // Tentativa 2: Gemini
  try {
    const gemKey = settingsJson?.gemini_api_key || "";
    if (gemKey && gemKey.length > 10) {
      const gemRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gemKey}`,
        {
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ]
        },
        { headers: { "Content-Type": "application/json" }, timeout: 20000 }
      );
      const gemText = gemRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (gemText && gemText.length > 10) {
        console.log("[RESUMO-IA] ✅ Gemini respondeu");
        return gemText.trim();
      }
    }
  } catch (e) {
    console.log("[RESUMO-IA] Gemini falhou:", e?.response?.status || e?.message);
  }

  return null;
}

// ═══ GERAR TEXTO DO RESUMO (COMPACTO + IA) ═══
async function gerarResumo(analysis, groupName, settingsJson) {
  if (!analysis) return { text: "❌ Sem mensagens para analisar.\n\n> 💡 O bot precisa capturar mensagens.\n> Aguarde mais conversas e tente depois.", mentions: [] };

  const a = analysis;
  const mentions = [];
  const periodo = a.periodo > 60 ? Math.round(a.periodo/60) + "h" : a.periodo + "min";
  let txt = "";

  // ═══ HEADER ═══
  txt += `┏━━━━━━━━━━━━━━━┓\n`;
  txt += `┃ 📊 *RESUMO DO GRUPO*\n`;
  txt += `┃ ${groupName}\n`;
  txt += `┗━━━━━━━━━━━━━━━┛\n\n`;

  // ═══ STATS GERAIS ═══
  txt += `╔══〘 📈 〙════════╗\n`;
  txt += `║ 💬 *${a.totalMsgs}* msgs ─ ⏱ *${periodo}*\n`;
  txt += `║ 👥 *${a.participantes.length}* membros ─ ${a.humor}\n`;
  if (a.totalHumor > 0) txt += `║ 😂 *${a.totalHumor}* risadas detectadas\n`;
  txt += `╚══════════════╝\n\n`;

  // ═══ TOP 3 ATIVOS ═══
  txt += `╔══〘 👑 〙════════╗\n`;
  const medals = ["🥇","🥈","🥉"];
  for (let i = 0; i < Math.min(3, a.participantes.length); i++) {
    const p = a.participantes[i];
    mentions.push(p.jid);
    txt += `║ ${medals[i]} @${p.num} *${p.msgs}*`;
    if (p.ofensas > 0) txt += ` ⚠${p.ofensas}`;
    txt += `\n`;
  }
  txt += `╚══════════════╝\n\n`;

  // ═══ TEMAS (máx 4, compacto) ═══
  if (a.temas.length > 0) {
    txt += `╔══〘 🏷 〙════════╗\n`;
    for (const [tema, count] of a.temas.slice(0, 4)) {
      txt += `║ ${tema} *${count}x*\n`;
    }
    txt += `╚══════════════╝\n\n`;
  }

  // ═══ SENTIMENTOS (máx 3, inline) ═══
  if (a.sentimentos && a.sentimentos.length > 0) {
    const sentTxt = a.sentimentos.slice(0, 3).map(([s, c]) => `${s} *${c}x*`).join(" ─ ");
    txt += `> 💭 ${sentTxt}\n\n`;
  }

  // ═══ ALERTAS (compacto) ═══
  if (a.totalOfensas > 0 || a.totalBriga > 0) {
    txt += `╔══〘 🚨 〙════════╗\n`;
    txt += `║ ⚠ *${a.totalOfensas}* ofensas ─ 🔥 *${a.totalBriga}* conflitos\n`;

    const ofensores = a.participantes.filter(p => p.ofensas > 0).sort((x,y) => y.ofensas - x.ofensas);
    for (const o of ofensores.slice(0, 3)) {
      if (!mentions.includes(o.jid)) mentions.push(o.jid);
      txt += `║ • @${o.num} *${o.ofensas}x*\n`;
    }
    txt += `╚══════════════╝\n\n`;
  } else {
    txt += `> ✅ *Grupo tranquilo, sem conflitos!*\n\n`;
  }

  // ═══ RESUMO POR IA (compacto) ═══
  try {
    const iaResumo = await gerarResumoIA(analysis, groupName, settingsJson);
    if (iaResumo) {
      txt += `╔══〘 🧠 〙════════╗\n`;
      txt += `║ *ANÁLISE DA IA*\n`;
      const iaLines = iaResumo.split("\n").filter(l => l.trim());
      for (const line of iaLines.slice(0, 8)) {
        const trimmed = line.length > 40 ? line.substring(0, 40) + "…" : line;
        txt += `║ ${trimmed}\n`;
      }
      txt += `╚══════════════╝\n`;
    }
  } catch (e) {
    console.log("[RESUMO] IA falhou:", e?.message);
  }

  txt += `\n> 📊 _${a.totalMsgs} msgs analisadas_`;

  return { text: txt, mentions };
}

module.exports = { addMessage, getMessageCount, analyzeGroup, gerarResumo };
