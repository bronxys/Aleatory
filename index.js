/*==========\\

ALEATORY 4.7

//==========*/

// Baileys é ESM - variáveis carregadas via import() dinâmico em consts-func.js
let downloadContentFromMessage,
  relayWAMessage,
  mentionedJid,
  processTime,
  MediaType,
  Browser,
  MessageType,
  Presence,
  Mimetype,
  Browsers,
  delay,
  getLastMessageInChat,
  BufferJSON;

//_-_-_-__-_-_-_-_-_-MODULOS/FUNÇÕES-_-_-_-_-_-__-_-_-_-_-\\

const Uploader = require("./dados/upload.js"); // caminho até seu arquivo upload.js
const uploader = new Uploader(); // cria uma instância da classe

// Sistema de conversão de áudios para OGG/Opus (compatibilidade universal)
const {
  convertPathToOgg,
  sendAudioMessage,
  prepareAudioForWhatsApp,
} = require("./dados/org/funcoes/audio_converter.js");

const {
  fs,
  axios,
  crypto,
  util,
  P,
  linkfy,
  request,
  cheerio,
  ms,
  ffmpeg,
  qrterminal,
  exec,
  spawn,
  execSync,
  moment,
  color,
  time,
  hora,
  date,
  getBuffer,
  convertSticker,
  recognize,
  fetchJson,
  fetchText,
  getBase64,
  response,
  upload,
  nit,
  validmove,
  setGame,
  supre,
  wait,
  getExtension,
  generateMessageID,
  getGroupAdmins,
  getMembros,
  getRandom,
  banner2,
  banner3,
  temporizador,
  chyt,
  kyun,
  simih,
  botoff,
  colors,
  comand,
  rgp,
  rg_aluguel,
  infos,
  bloq_global,
  fetch,
} = require("./consts-func.js");

//-_-_-_-_-_--_-_-_-_-JS-MENUS/INFORMAÇÕES-_-_-_-_-_-_-_-_-_-_\\

const {
  menu,
  anotacao,
  menudono,
  adms,
  menulogos,
  efeitos,
  menuprem,
  brincadeiras,
  infodono,
  gitdobot,
  configbot,
  cmd_termux,
  alteradores,
  tabela,
  conselhob,
  palavrasc,
  ban,
  nescessario,
  setting,
  logoslink,
  premium,
  countMessage,
  sendVideoAsSticker,
  sendImageAsSticker,
  sendVideoAsSticker2,
  sendImageAsSticker2,
  daily,
  limitefll,
  antispam,
  rggold,
  anotar,
  black_,
  enviarfiguUrl,
  getFileBuffer,
  DLT_FL,
  sleep,
  ANT_LTR_MD_EMJ,
  Limit_CMD,
  recolherLNK,
  SIMI_OFC,
  menugold,
  menumidias,
} = require("./consts-func.js");

const {
  paidHours,
  savePaid,
  addGroupInPaid,
  getGroupInPaid,
  getIDinPaid,
  addPaid,
  rmPaid,
  isIDinPaid,
  groupLinkPaid,
  paidSGL,
  addGroupLinkInPaid,
  getGroupLinkFromPaidID,
  getInfoPaidGroupLink,
  rmGroupLinkInPaid,
  paidFunc,
} = require("./operacao/horarios/paid_hours.js");

// ═══════ SISTEMA DE ALUGUEL DE GRUPOS ═══════
const {
  getAluguel,
  getAluguelByGrupo,
  getAluguelByLink,
  adicionarContrato,
  renovarContrato,
  removerContrato,
  formatarContrato,
  zerarAluguel,
} = require("./dados/org/funcoes/aluguel.js");

// ═══════ SISTEMA DE RESUMO INTELIGENTE ═══════
const {
  addMessage: addResumoMsg,
  getMessageCount: getResumoCount,
  analyzeGroup: analyzeResumoGroup,
  gerarResumo,
} = require("./dados/org/funcoes/resumo.js");

// ── Confirmação de zerar aluguel ──
const _pendingZerarAluguel = new Map();

// ═══════ FLUXO DE CONTRATO POR ETAPAS ═══════
const {
  getAluguelState,
  clearAluguelState,
  startAluguelFlow,
  processarRespostaAluguel,
  // Renovação
  getRenovacaoState,
  clearRenovacaoState,
  startRenovacaoFlow,
  processarRespostaRenovacao,
} = require("./dados/org/funcoes/aluguel_states.js");
// ══════════════════════════════════════════════

// ═══════ HORÁRIOS DE ABERTURA/FECHAMENTO ═══════
const {
  addHorario,
  removeHorario,
  listarHorarios,
  zerarHorariosGrupo,
  initHorariosScheduler,
} = require("./dados/org/funcoes/horarios_grupo.js");
// ════════════════════════════════════════════════

// ═══════ SISTEMA DE AVISOS AUTOMÁTICOS ═══════
const path = require("path");
const {
  addAviso,
  rmAviso,
  clearAvisos,
  getAvisos,
  _gerarIdAviso,
} = require("./operacao/avisos-automaticos/index.js");
// ════════════════════════════════════════════════

// ═══════ SISTEMA DE MÍDIA DO MENU (foto/gif local) ═══════
function getMenuMedia() {
  try {
    const menuCfg = JSON.parse(
      fs.readFileSync("./dados/menu_media.json", "utf-8"),
    );
    if (menuCfg.tipo === "gif" && fs.existsSync(menuCfg.gif)) {
      return { video: fs.readFileSync(menuCfg.gif), gifPlayback: true };
    }
    if (menuCfg.tipo === "foto" && fs.existsSync(menuCfg.foto)) {
      return { image: fs.readFileSync(menuCfg.foto) };
    }
  } catch (e) { }
  // Fallback: usar logo antigo (URL)
  return { image: { url: logoslink.logo } };
}
// ══════════════════════════════════════════════════════════

// ═══════ ANTIFLOOD: Aviso de registro (30s por user) ═══════
const _registroCooldown = new Map();
const REGISTRO_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos
// ════════════════════════════════════════════════════════════

// ═══════ TRAVA DE REGISTRO (máximo 3 usuários por vez) ═══════
// Usa registro_states.json como fonte (persistente, sobrevive restarts)
const REGISTRO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutos (mesmo timeout do registro)
const MAX_REGISTROS_SIMULTANEOS = 3; // máximo de registros ao mesmo tempo
function _contarRegistrandoAtivos(senderJid) {
  try {
    const states = JSON.parse(require('fs').readFileSync('./dados/registros/registro_states.json', 'utf8'));
    const senderNorm = normalizeJid(senderJid);
    const agora = Date.now();
    let count = 0;
    for (const [jid, state] of Object.entries(states)) {
      // Pular o próprio usuário
      if (jid === senderJid || jid === senderNorm) continue;
      // Pular estados de confirmação (não são registros ativos)
      if (state.step === 'confirmar_atualizacao' || state.step === 'confirmar_exclusao') continue;
      // Contar apenas registros ativos (não expirados)
      if (state.lastActivity && (agora - state.lastActivity < REGISTRO_LOCK_TIMEOUT)) {
        count++;
      }
    }
    return count;
  } catch { }
  return 0;
}
// ════════════════════════════════════════════════════════════

// ═══════ ANTI-FLOOD PV (detecção de flood de COMANDOS no privado) ═══════
const _pvFloodTracker = new Map();  // sender -> [timestamps]
const _pvFloodBlocked = new Map();  // sender -> timestamp de quando foi bloqueado
const PV_FLOOD_LIMIT = 3;           // 3 comandos
const PV_FLOOD_WINDOW = 10000;      // em 10 segundos
const PV_FLOOD_BLOCK_TIME = 60 * 1000; // bloqueio de 1 minuto
// ════════════════════════════════════════════════════════════

const sendFutureTime = (dados) => {
  hr = moment.tz("America/Sao_Paulo");
  for (i of dados) {
    hr = hr.add(i.valor, i.type);
  }
  return hr.calendar();
};

function saveJSON(inter, caminho) {
  fs.writeFileSync(caminho, JSON.stringify(inter, null, 2));
}

const {
  openclosegp,
  saveOpenCloseGP,
  rgGroupOCfunc,
  getGroupOpenCloseFunc,
  addOpenCloseGP,
  rmOpenCloseGP,
  isIDopenCloseGP,
  ABRIR_E_FECHAR_GRUPO,
  getLastOpenCloseGP,
} = require("./operacao/abrir-fechar-grupo/index.js");

// ═══════ SISTEMA DE REGISTRO / PERFIL / ANIVERSÁRIO ═══════
const {
  getUser,
  setUser,
  getAllUsers,
  getRegistroState,
  setRegistroState,
  clearRegistroState,
  startRegistro,
  processarResposta,
  cancelarRegistro,
  gerarPerfil,
  calcularNivel,
  mensagemIntro,
  mensagemJaRegistrado,
  calcularIdade,
} = require("./dados/org/funcoes/registro.js");

const {
  initBirthdayScheduler,
  checkAndCelebrate,
} = require("./dados/org/funcoes/aniversario.js");

const {
  iniciarQuiz,
  verificarResposta,
  cancelarQuiz,
  temQuiz,
  getDica,
  buscarImagem,
} = require("./dados/org/funcoes/quiz.js");
// ══════════════════════════════════════════════════════════

//_-_-_-_-_-_-_-_-_-_-_-_-(INFOS)_-_-_-_-_-_-_-_-_-_-_-_-_-_-_--\\

var {
  antipv3,
  TOKEN_GPT,
  TOKEN_DROPBOX,
  cmdpremium,
  msgantipv1,
  msgantipv2,
  dono1,
  dono2,
  dono3,
  dono4,
  dono5,
  dono6,
  dono1_lid,
  dono2_lid,
  dono3_lid,
  dono4_lid,
  dono5_lid,
  dono6_lid,
} = require("./dono/nescessario.json");

const Links_P = require("./dados/links.json");

var {
  fundo1,
  fundo2,
  imgnazista,
  imggay,
  imgcorno,
  imggostosa,
  imggostoso,
  imgfeio,
  imgvesgo,
  imgbebado,
  imggado,
  matarcmd,
  beijocmd,
  chutecmd,
  tapacmd,
  rnkgay,
  rnkgado,
  rnkcorno,
  rnkgostoso,
  rnkgostosa,
  rnknazista,
  rnkgolpista,
  rnkotaku,
  rnkpau,
} = require("./dados/links.json");

var { NomeDoBot, NickDono, prefix } = require("./dados/settings.json");

const { TEXTOS_GERAL } = require("./dono/textos.js");

const Api = require("./req.js");

try {
  var groupMetadata_RG = JSON.parse(
    fs.readFileSync("./dados/global/groups.json"),
  );
} catch {
  fs.writeFileSync("./dados/global/groups.json", JSON.stringify([], null, 2));
}

var reqapi = new Api("Bronxys30092025");
const API_KEY_BRONXYS = "Bronxys30092025";

// ═══════════════════════════════════════════════════════════
// BLOQUEIO DE IP — DESATIVADO TEMPORARIAMENTE
// ═══════════════════════════════════════════════════════════
let _ipBloqueado = false; // Sempre false — bloqueio desativado
// ═══════════════════════════════════════════════════════════

const SNET = "@s.whatsapp.net";
const LID_NET = "@lid";

// Funções Auxiliares para Compatibilidade com LID (Baileys 7.0+)
function normalizeJid(jid) {
  if (!jid) return jid;
  if (jid.endsWith("@s.whatsapp.net")) return jid;
  if (jid.includes("@lid")) return jid.replace("@lid", "@s.whatsapp.net");
  if (!jid.includes("@")) return jid + "@s.whatsapp.net";
  return jid;
}

function extractNumber(jid) {
  if (!jid) return "";
  if (typeof jid !== "string") jid = String(jid);
  return jid.split("@")[0];
}

function areJidsEqual(jid1, jid2) {
  if (!jid1 || !jid2) return false;
  return extractNumber(jid1) === extractNumber(jid2);
}

function isJidInList(jid, list) {
  if (!jid || !Array.isArray(list)) return false;
  const number = extractNumber(jid);
  return list.some((item) => extractNumber(item) === number);
}

function addJidToList(jid, list) {
  if (!jid) return list;
  const normalized = normalizeJid(jid);
  if (!isJidInList(normalized, list)) {
    list.push(normalized);
  }
  return list;
}

function removeJidFromList(jid, list) {
  if (!jid || !Array.isArray(list)) return list;
  const number = extractNumber(jid);
  return list.filter((item) => extractNumber(item) !== number);
}

// Funções auxiliares para extrair ID de participantes (Baileys 7.0+)
// CORRIGIDO: Agora prioriza JID completo e trata LID corretamente
function getParticipantId(participant) {
  if (!participant) return "";

  // Se já é uma string, retornar diretamente
  if (typeof participant === "string") {
    return participant;
  }

  // Se é um objeto, priorizar id e phoneNumber
  if (typeof participant === "object" && participant !== null) {
    // 1. Prioridade: id (JID completo)
    if (participant.id && participant.id.includes("@")) {
      return participant.id;
    }

    // 2. Segunda opção: phoneNumber (geralmente é o JID completo)
    if (participant.phoneNumber && participant.phoneNumber.includes("@")) {
      return participant.phoneNumber;
    }

    // 3. Terceira opção: id sem @ (adicionar @s.whatsapp.net)
    if (participant.id) {
      return participant.id.includes("@")
        ? participant.id
        : `${participant.id}@s.whatsapp.net`;
    }

    // 4. Quarta opção: phoneNumber sem @ (adicionar @s.whatsapp.net)
    if (participant.phoneNumber) {
      return participant.phoneNumber.includes("@")
        ? participant.phoneNumber
        : `${participant.phoneNumber}@s.whatsapp.net`;
    }

    // 5. ÚLTIMO RECURSO: lid (precisa ser processado)
    if (participant.lid) {
      // LID vem no formato: "241 44324925037 4" (com espaços)
      // Precisamos remover espaços e usar apenas os dígitos
      const lidClean = String(participant.lid).replace(/\s+/g, "");
      return `${lidClean}@lid`;
    }
  }

  return String(participant);
}

function getParticipantNumber(participant) {
  const id = getParticipantId(participant);

  if (!id) return "";

  // Extrair número antes do @
  const number = String(id).split("@")[0];

  // Remover espaços se houver (caso do LID)
  return number.replace(/\s+/g, "");
}

// ========== FUNÇÕES AUXILIARES DE MUTE (Sistema Individual por Grupo) ==========

/**
 * Carrega dados de mute do grupo (integrado com o JSON do grupo que é um ARRAY)
 */
function loadGroupMuteData(groupId) {
  try {
    const groupFilePath = `./dados/grupos/${groupId}.json`;
    if (fs.existsSync(groupFilePath)) {
      const raw = fs.readFileSync(groupFilePath, "utf8");
      const data = JSON.parse(raw);
      // O arquivo do grupo é um ARRAY [{ ...settings }]
      if (Array.isArray(data) && data[0]) {
        return data[0].mutedUsers || {};
      }
      // Fallback: se for objeto direto
      if (data && data.mutedUsers) return data.mutedUsers;
    }
    return {};
  } catch (error) {
    console.error("❌ Erro ao carregar dados de mute:", error.message);
    return {};
  }
}

/**
 * Salva dados de mute DENTRO do JSON do grupo existente (sem sobrescrever settings)
 */
function saveGroupMuteData(groupId, mutedUsers) {
  try {
    const groupFilePath = `./dados/grupos/${groupId}.json`;
    let data = [{}];
    if (fs.existsSync(groupFilePath)) {
      const raw = fs.readFileSync(groupFilePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed[0]) {
        data = parsed;
      }
    }
    data[0].mutedUsers = mutedUsers;
    fs.writeFileSync(groupFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("❌ Erro ao salvar dados de mute:", error.message);
  }
}

/**
 * Verifica se usuário está mutado (compatível com LID)
 */
function isMuted(groupId, userJid) {
  try {
    const mutedUsers = loadGroupMuteData(groupId);
    if (!mutedUsers || Object.keys(mutedUsers).length === 0) return false;
    const userNum = extractNumber(userJid);
    const mutedJid = Object.keys(mutedUsers).find(
      (jid) => extractNumber(jid) === userNum,
    );
    if (!mutedJid) return false;
    // Auto-expirar mute temporário
    const entry = mutedUsers[mutedJid];
    if (entry.expiresAt && new Date(entry.expiresAt) <= new Date()) {
      delete mutedUsers[mutedJid];
      saveGroupMuteData(groupId, mutedUsers);
      return false;
    }
    return true;
  } catch (error) {
    console.error("❌ Erro ao verificar mute:", error.message);
    return false;
  }
}

/**
 * Adiciona usuário à lista de mutados (com duração opcional)
 */
function muteUser(
  groupId,
  userJid,
  mutedBy,
  reason = "Não especificado",
  durationMs = null,
  durationText = "Permanente ♾️",
) {
  try {
    const mutedUsers = loadGroupMuteData(groupId);
    const normalizedJid = normalizeJid(userJid);
    const entry = {
      mutedAt: new Date().toISOString(),
      mutedBy: normalizeJid(mutedBy),
      deletedMessages: 0,
      reason: reason,
      durationText: durationText,
    };
    if (durationMs && durationMs > 0) {
      entry.expiresAt = new Date(Date.now() + durationMs).toISOString();
    }
    mutedUsers[normalizedJid] = entry;
    saveGroupMuteData(groupId, mutedUsers);
    return true;
  } catch (error) {
    console.error("❌ Erro ao mutar usuário:", error.message);
    return false;
  }
}

/**
 * Remove usuário da lista de mutados
 */
function unmuteUser(groupId, userJid) {
  try {
    const mutedUsers = loadGroupMuteData(groupId);
    if (!mutedUsers || Object.keys(mutedUsers).length === 0) return null;
    const userNum = extractNumber(userJid);
    const mutedJid = Object.keys(mutedUsers).find(
      (jid) => extractNumber(jid) === userNum,
    );
    if (mutedJid) {
      const muteData = mutedUsers[mutedJid];
      delete mutedUsers[mutedJid];
      saveGroupMuteData(groupId, mutedUsers);
      return muteData;
    }
    return null;
  } catch (error) {
    console.error("❌ Erro ao desmutar usuário:", error.message);
    return null;
  }
}

/**
 * Incrementa contador de mensagens deletadas
 */
function incrementDeletedMessages(groupId, userJid) {
  try {
    const mutedUsers = loadGroupMuteData(groupId);
    if (!mutedUsers) return;
    const userNum = extractNumber(userJid);
    const mutedJid = Object.keys(mutedUsers).find(
      (jid) => extractNumber(jid) === userNum,
    );
    if (mutedJid && mutedUsers[mutedJid]) {
      mutedUsers[mutedJid].deletedMessages =
        (mutedUsers[mutedJid].deletedMessages || 0) + 1;
      saveGroupMuteData(groupId, mutedUsers);
    }
  } catch (error) {
    console.error("❌ Erro ao incrementar contador:", error.message);
  }
}

/**
 * Retorna lista de usuários mutados
 */
function getMutedUsers(groupId) {
  try {
    const mutedUsers = loadGroupMuteData(groupId);
    if (!mutedUsers || Object.keys(mutedUsers).length === 0) return [];
    return Object.entries(mutedUsers).map(([jid, info]) => ({
      jid: jid,
      number: extractNumber(jid),
      ...info,
    }));
  } catch (error) {
    console.error("❌ Erro ao obter lista de mutados:", error.message);
    return [];
  }
}

// ========== FIM DAS FUNÇÕES DE MUTE ==========

// ========== SISTEMA DE ADVERTÊNCIAS ==========
const _muteDeleteThrottle = new Map(); // throttle de deletes p/ evitar rate-overlimit
const _antiSpamTracker = new Map(); // rastreia msgs por user p/ anti-spam
const _antiSpamWarnings = new Map(); // advertências do anti-spam (in-memory, reset ao reiniciar)

function loadGroupWarnings(groupId) {
  try {
    const groupFilePath = `./dados/grupos/${groupId}.json`;
    if (!fs.existsSync(groupFilePath)) return {};
    const raw = fs.readFileSync(groupFilePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed[0] && parsed[0].warnings) {
      return parsed[0].warnings;
    }
    return {};
  } catch {
    return {};
  }
}

function saveGroupWarnings(groupId, warnings) {
  try {
    const groupFilePath = `./dados/grupos/${groupId}.json`;
    let data = [{}];
    if (fs.existsSync(groupFilePath)) {
      const raw = fs.readFileSync(groupFilePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed[0]) data = parsed;
    }
    data[0].warnings = warnings;
    fs.writeFileSync(groupFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("❌ Erro ao salvar advertências:", e.message);
  }
}

function addWarning(groupId, userJid, reason = "Flood no mute") {
  const warnings = loadGroupWarnings(groupId);
  const key = extractNumber(userJid);
  if (!warnings[key]) {
    warnings[key] = { count: 0, reasons: [] };
  }
  warnings[key].reasons.push({ reason, date: new Date().toISOString() });
  warnings[key].count = warnings[key].reasons.length;
  warnings[key].lastWarning = new Date().toISOString();
  saveGroupWarnings(groupId, warnings);
  return warnings[key].count;
}

function getWarningCount(groupId, userJid) {
  const warnings = loadGroupWarnings(groupId);
  const key = extractNumber(userJid);
  if (!warnings[key]) return 0;
  // Sincronizar count com reasons.length
  return warnings[key].reasons
    ? warnings[key].reasons.length
    : warnings[key].count || 0;
}

function getAllWarnings(groupId) {
  const warnings = loadGroupWarnings(groupId);
  return Object.entries(warnings)
    .map(([num, info]) => {
      // Sincronizar count com reasons.length
      const reasons = info.reasons || [];
      return {
        jid: num + "@s.whatsapp.net",
        number: num,
        count: reasons.length,
        reasons: reasons,
        lastWarning: info.lastWarning,
      };
    })
    .filter((w) => w.count > 0);
}

function removeWarningByIndex(groupId, userJid, index) {
  const warnings = loadGroupWarnings(groupId);
  const key = extractNumber(userJid);
  if (
    !warnings[key] ||
    !warnings[key].reasons ||
    warnings[key].reasons.length === 0
  )
    return false;
  if (index < 0 || index >= warnings[key].reasons.length) return false;
  warnings[key].reasons.splice(index, 1);
  warnings[key].count = warnings[key].reasons.length;
  if (warnings[key].count <= 0) delete warnings[key];
  saveGroupWarnings(groupId, warnings);
  return true;
}

function removeWarning(groupId, userJid) {
  // Remove a ultima advertencia (compatibilidade)
  const warnings = loadGroupWarnings(groupId);
  const key = extractNumber(userJid);
  if (
    !warnings[key] ||
    !warnings[key].reasons ||
    warnings[key].reasons.length === 0
  )
    return false;
  warnings[key].reasons.pop();
  warnings[key].count = warnings[key].reasons.length;
  if (warnings[key].count <= 0) delete warnings[key];
  saveGroupWarnings(groupId, warnings);
  return true;
}

function clearUserWarnings(groupId, userJid) {
  const warnings = loadGroupWarnings(groupId);
  const key = extractNumber(userJid);
  if (!warnings[key]) return false;
  delete warnings[key];
  saveGroupWarnings(groupId, warnings);
  return true;
}

function clearAllGroupWarnings(groupId) {
  const warnings = loadGroupWarnings(groupId);
  const total = Object.keys(warnings).length;
  if (total === 0) return 0;
  saveGroupWarnings(groupId, {});
  return total;
}
// ========== FIM SISTEMA DE ADVERTÊNCIAS ==========

const MSG_ANTPV2 = [];

const BLC_ANTCL = [];

let OSINF_K = [];

let numerodono_ofc = setting.numerodono.replace(
  new RegExp("[()+-/ +/]", "gi"),
  "",
);

let nmrdn_dono2 =
  setting.numerodono.replace(new RegExp("[()+-/ +/]", "gi"), "") + SNET;

process.on("uncaughtException", function (err) {
  console.error(new Date().toUTCString() + " uncaughtException:", err.message);
  console.error(err.stack);
});

function apenasNumeros(variavel) {
  var regex = /^[0-9]+$/;
  if (variavel.match(regex)) {
    return true;
  } else {
    return false;
  }
}

function removeSecondSpace(str) {
  if (str[1] === " ") {
    return str[1] === " " && str[2] === " "
      ? str[0] + str.slice(3)
      : str[0] + str.slice(2);
  }
  return str;
}

function RmvSimbolosLmn(a) {
  return a
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const FormData = require("form-data");
const { JSDOM } = require("jsdom");

async function webp_mp4(imageBuffer) {
  let formData = new FormData();
  formData.append("new-image-url", "");
  formData.append("new-image", imageBuffer, "image.webp");

  let response = await fetch("https://ezgif.com/webp-to-mp4", {
    method: "POST",
    body: formData,
  });

  let html = await response.text();

  let { document } = new JSDOM(html).window;

  let formData2 = new FormData();
  let formValues = {};

  for (let input of document.querySelectorAll("form input[name]")) {
    formValues[input.name] = input.value;
    formData2.append(input.name, input.value);
  }

  let response2 = await fetch(
    "https://ezgif.com/webp-to-mp4/" + formValues.file,
    { method: "POST", body: formData2 },
  );

  let html2 = await response2.text();

  let { document: document2 } = new JSDOM(html2).window;

  return new URL(
    document2.querySelector("div#output > p.outfile > video > source").src,
    response2.url,
  ).toString();
}

// BLOQUEIO DE IP (SEGUNDA CAMADA) — PROTEÇÃO NO HANDLER
let _ipBloqueado = false;
(async () => {
  try {
    const [ipRes, vpsRes] = await Promise.all([
      axios.get("https://l2.io/ip.json").catch(() => null),
      axios.get("https://raw.githubusercontent.com/bronxys/bronxys/main/list.json").catch(() => null),
    ]);

    if (!ipRes || !vpsRes) {
      _ipBloqueado = true;
      console.log("[BLOQUEIO] Falha na verificação de IP (index). Bot bloqueado.");
      return;
    }

    const meuIP = ipRes.data?.ip || ipRes.data;
    const listaPermitida = Array.isArray(vpsRes.data) ? vpsRes.data : [];

    if (!listaPermitida.includes(meuIP)) {
      _ipBloqueado = true;
      console.log("[BLOQUEIO] IP não autorizado (index). Bot bloqueado.");
    }
  } catch (e) {
    _ipBloqueado = true;
    console.log("[BLOQUEIO] Falha na conexão de verificação (index). Bot bloqueado.");
  }
})();

// ABAIXO: INÍCIO DE CONEXÃO

const startAle = async (upsert, conn, qrcode, sessionStartTim) => {
  // ═══ BLOQUEIO DE IP — NÃO PROCESSAR SE IP NÃO AUTORIZADO ═══
  if (_ipBloqueado) return;

  try {
    // Garantir que Baileys foi carregado via import() dinâmico
    const { _baileysReady } = require("./consts-func.js");
    await _baileysReady;
    const baileys = await import("@whiskeysockets/baileys");
    downloadContentFromMessage = baileys.downloadContentFromMessage;
    relayWAMessage = baileys.relayWAMessage;
    mentionedJid = baileys.mentionedJid;
    processTime = baileys.processTime;
    MediaType = baileys.MediaType;
    Browser = baileys.Browser;
    MessageType = baileys.MessageType;
    Presence = baileys.Presence;
    Mimetype = baileys.Mimetype;
    Browsers = baileys.Browsers;
    delay = baileys.delay;
    getLastMessageInChat = baileys.getLastMessageInChat;
    BufferJSON = baileys.BufferJSON;

    // ═══ Schedulers iniciados UMA VEZ em iniciar.js (usam global.conn) ═══
    // NÃO iniciar aqui — evita duplicação em reconexões
    // ════════════════════════════════════════════════════════════════════

    var hora120 = moment.tz("America/Sao_Paulo").format("HH:mm:ss");

    for (const info of upsert?.messages || []) {
      const from = info.key.remoteJid;

      let groupMetadata;

      const isGroup = from.endsWith("@g.us");

      const JOGO_D_V = fs?.existsSync(`./dados/org/tictactoe/db/${from}.json`)
        ? JSON?.parse(fs?.readFileSync(`./dados/org/tictactoe/db/${from}.json`))
        : false;

      const VR_JSON_GLOBAL = fs.existsSync(`./dados/grupos/${from}.json`)
        ? true
        : false;

      if (VR_JSON_GLOBAL) {
        var jsonGp = JSON.parse(fs.readFileSync(`./dados/grupos/${from}.json`)); // DGOMR
      }

      if (
        info.messageStubParameters &&
        info.messageStubParameters[0] === "Message absent from node"
      ) {
        try {
          if (
            info.messageStubParameters[1] &&
            info.messageStubParameters[1] !== "undefined"
          ) {
            conn.sendMessageAck(
              JSON.parse(info.messageStubParameters[1], BufferJSON.reviver),
            );
          }
        } catch (e) {
          // Silenciar erro JSON - não afeta funcionamento
        }
      }

      if (VR_JSON_GLOBAL && jsonGp[0]?.x9 && info.messageStubType) {
        switch (info.messageStubType) {
          case 23:
            conn.sendMessage(info.key.remoteJid, {
              text: `O usuário @${info.participant.split("@")[0]
                } acabou de redefinir o link do grupo...`,
              mentions: [info.participant],
            });
            break;

          case 29: {
            await delay(1000);

            let promoted;
            try {
              promoted = JSON.parse(info.messageStubParameters[0]);
            } catch (e) {
              return console.log("Erro ao parsear stubParameters:", e);
            }

            const promotedJid = promoted.phoneNumber;
            const promoterJid = info.participant;
            await conn.sendMessage(info.key.remoteJid, {
              text: `O usuário @${promotedJid.split("@")[0]
                } foi promovido pelo @${promoterJid.split("@")[0]}`,
              mentions: [promotedJid, promoterJid],
            });
            break;
          }

          case 30: {
            await delay(1000);

            let demoted;
            try {
              demoted = JSON.parse(info.messageStubParameters[0]);
            } catch (e) {
              return console.log("Erro ao parsear stubParameters:", e);
            }

            const demotedJid = demoted.phoneNumber;
            const demoterJid = info.participant;
            await conn.sendMessage(info.key.remoteJid, {
              text: `O ADM @${demotedJid.split("@")[0]
                } foi rebaixado para membro comum pelo ADM @${demoterJid.split("@")[0]
                }`,
              mentions: [demotedJid, demoterJid],
            });
            break;
          }

          case 172: {
            // GROUP_MEMBERSHIP_JOIN_APPROVAL_REQUEST_NON_ADMIN_ADD
            // Disparado quando alguém pede para entrar, um ADM aceita ou recusa,
            // ou o próprio solicitante cancela o pedido — mas APENAS quando o
            // modo "aprovação de membros" está habilitado no grupo.
            try {
              await delay(800);

              const reqData = JSON.parse(info.messageStubParameters[0] || "{}");
              const acao = info.messageStubParameters[1]; // 'created' | 'revoked' | 'rejected'
              const admJid = info.participant; // ADM que agiu (null se o próprio solicitante cancelou)

              // Número do solicitante (preferir phoneNumber/pn sobre lid)
              const solicitanteNum = reqData.pn
                ? String(reqData.pn).split("@")[0]
                : reqData.lid
                  ? String(reqData.lid).split("@")[0]
                  : null;

              const solicitanteJid = solicitanteNum
                ? `${solicitanteNum}@s.whatsapp.net`
                : null;

              if (acao === "created") {
                // Desativado para evitar flood no grupo
                // const mentions = solicitanteJid ? [solicitanteJid] : [];
                // await conn.sendMessage(info.key.remoteJid, {
                //   text: solicitanteJid
                //     ? `📨 O usuário @${solicitanteNum} solicitou entrar no grupo e está aguardando aprovação de um ADM.`
                //     : `📨 Um usuário solicitou entrar no grupo e está aguardando aprovação de um ADM.`,
                //   mentions,
                // });
              } else if (acao === "revoked") {
                // O próprio solicitante cancelou o pedido
                const mentions = solicitanteJid ? [solicitanteJid] : [];
                await conn.sendMessage(info.key.remoteJid, {
                  text: solicitanteJid
                    ? `↩️ O usuário @${solicitanteNum} cancelou o pedido de entrada no grupo.`
                    : `↩️ Um usuário cancelou o pedido de entrada no grupo.`,
                  mentions,
                });
              } else if (acao === "rejected") {
                // ADM recusou o pedido — pular se foi o próprio bot (!recusar já enviou a mensagem)
                const admNum = admJid ? admJid.split("@")[0] : null;
                const botId172 = conn.user?.id?.split(":")[0] || "";
                const botLid172 = conn.user?.lid?.split(":")[0] || "";
                const recusadoPeloBot =
                  admNum && (admNum === botId172 || admNum === botLid172);

                if (!recusadoPeloBot) {
                  const mentions = [];
                  if (solicitanteJid) mentions.push(solicitanteJid);
                  if (admJid) mentions.push(admJid);

                  await conn.sendMessage(info.key.remoteJid, {
                    text:
                      admNum && solicitanteJid
                        ? `❌ O pedido de entrada de @${solicitanteNum} foi *recusado* pelo ADM @${admNum}.`
                        : admNum
                          ? `❌ Um pedido de entrada foi *recusado* pelo ADM @${admNum}.`
                          : `❌ Um pedido de entrada foi *recusado*.`,
                    mentions,
                  });
                }
              }
            } catch (e) {
              console.log("[MODOX9-APROVAÇÃO] Erro:", e);
            }
            break;
          }

          case 71: {
            // GROUP_PARTICIPANT_ADD_REQUEST_JOIN
            // Disparado quando um ADM APROVA uma solicitação de entrada no grupo.
            // info.participant = JID do ADM que aprovou
            // info.messageStubParameters = array de JSONs dos membros aprovados
            try {
              await delay(800);

              const admJid71 = info.participant;
              const admNum71 = admJid71 ? admJid71.split("@")[0] : null;

              const membrosAprovados = (info.messageStubParameters || [])
                .map((p) => {
                  try {
                    return JSON.parse(p);
                  } catch {
                    return null;
                  }
                })
                .filter(Boolean);

              for (const membro of membrosAprovados) {
                const membroNum = membro.phoneNumber
                  ? String(membro.phoneNumber).split("@")[0]
                  : membro.id
                    ? String(membro.id).split("@")[0]
                    : null;

                const membroJid = membroNum
                  ? `${membroNum}@s.whatsapp.net`
                  : null;

                // Não revelar se o ADM adicionou a si mesmo ou não há info
                if (!admNum71 || !membroJid || admNum71 === membroNum) continue;

                const mentions = [membroJid, admJid71].filter(Boolean);

                await conn.sendMessage(info.key.remoteJid, {
                  text: `✅ A entrada de @${membroNum} foi *aprovada* pelo ADM @${admNum71}. Bem-vindo(a)! 🎉`,
                  mentions,
                });
              }
            } catch (e) {
              console.log("[MODOX9-APROVAÇÃO] Erro:", e);
            }
            break;
          }
        }
      }

      // P: 29
      // R: 30
      // RMV: 28
      // ADC: 27

      switch (info.messageStubType) {
        case 29:
        case 30:
        case 28:
        case 27:
          try {
            var Sender_ = info.messageStubParameters[0];
            if (
              groupMetadata_RG &&
              (groupMetadata_RG?.length ?? 0) > 0 &&
              groupMetadata_RG.some((i) => i.id === from)
            ) {
              if (info.messageStubType === 28 || info.messageStubType === 27) {
                info.messageStubType === 27
                  ? !groupMetadata_RG
                    .find((i) => i.id === from)
                    .participants.some((ab) => ab.id === Sender_)
                    ? groupMetadata_RG
                      .find((i) => i.id === from)
                      .participants.push({ id: Sender_, admin: null })
                    : ""
                  : groupMetadata_RG
                    .find((i) => i.id === from)
                    .participants.splice(
                      groupMetadata_RG
                        .find((i) => i.id === from)
                        .participants.findIndex((ac) => ac.id === Sender_),
                      1,
                    );
                fs.writeFileSync(
                  "./dados/global/groups.json",
                  JSON.stringify(groupMetadata_RG, null, 2),
                );
              } else if (
                groupMetadata_RG
                  .find((i) => i.id === from)
                  .participants.some((ab) => ab.id === Sender_) &&
                (info.messageStubType === 29 || info.messageStubType === 30)
              ) {
                groupMetadata_RG
                  .find((i) => i.id === from)
                  .participants.find(
                    (i) => i.id === info.messageStubParameters[0],
                  ).admin = info.messageStubType === 30 ? null : "admin";
                fs.writeFileSync(
                  "./dados/global/groups.json",
                  JSON.stringify(groupMetadata_RG, null, 2),
                );
              }
            } else {
              var ADC_RG = await conn.groupMetadata(from);
              groupMetadata_RG.push(ADC_RG);
            }
          } catch { }
          break;

        default:
      }

      async function bufferImg(imageUrl) {
        const fileName = "imagem.jpg";
        const headers = {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
        };
        axios
          .get(imageUrl, { responseType: "arraybuffer", headers })
          .then(async (response) => {
            fs.writeFileSync(fileName, response.data);
            conn.sendMessage(
              from,
              { image: { url: fileName } },
              { quoted: info },
            );
          })
          .catch((err) => {
            return reply("Erro!!");
          });
      }

      if (upsert.type === "append") return;
      const type = baileys.getContentType(info.message);
      const content = JSON.stringify(info.message);
      const pushname = info.pushName ? info.pushName : "";

      if (nescessario.visualizarmsg) {
        conn.readMessages([info.key]);
      } else {
        if (from === "status@broadcast" || from.includes("status")) return;
      }

      // ══ ANTI-STATUS: Detectar mencao do grupo no status (groupStatusMentionMessage) ══
      if (type === "groupStatusMentionMessage" && from.endsWith("@g.us")) {
        try {
          const _stSender = info.key?.participant || info.participant || "";
          if (_stSender) {
            const _stFile = `./dados/grupos/${from}.json`;
            if (fs.existsSync(_stFile)) {
              const _stData = JSON.parse(fs.readFileSync(_stFile, "utf8"));
              if (
                Array.isArray(_stData) &&
                _stData[0] &&
                _stData[0].antistatus
              ) {
                const _stSenderNum = extractNumber(_stSender);
                let _stMeta;
                try {
                  _stMeta = await conn.groupMetadata(from);
                } catch {
                  _stMeta = null;
                }
                if (_stMeta) {
                  const _stParticipants = _stMeta.participants || [];
                  const _stMember = _stParticipants.find(
                    (p) => extractNumber(p.id) === _stSenderNum,
                  );
                  if (
                    _stMember &&
                    !_stMember.admin &&
                    _stSenderNum !== numerodono_ofc
                  ) {
                    try {
                      await conn.sendMessage(from, { delete: info.key });
                    } catch { }
                    await conn.groupParticipantsUpdate(
                      from,
                      [_stMember.id],
                      "remove",
                    );
                    await conn.sendMessage(from, {
                      text: `> 🚫 *ANTI-STATUS*\n\n> @${_stSenderNum} foi *removido* por marcar este grupo no status do WhatsApp.\n\n>⚠️ Não é permitido marcar o grupo no status.`,
                      mentions: [_stMember.id],
                    });
                  }
                }
              }
            }
          }
        } catch { }
        return;
      }

      global.prefix;
      global.blocked;

      //==============(BODY)================\\

      var body =
        info.message?.conversation ||
        info.message?.viewOnceMessageV2?.message?.imageMessage?.caption ||
        info.message?.viewOnceMessageV2?.message?.videoMessage?.caption ||
        info.message?.imageMessage?.caption ||
        info.message?.videoMessage?.caption ||
        info.message?.extendedTextMessage?.text ||
        info.message?.viewOnceMessage?.message?.videoMessage?.caption ||
        info.message?.viewOnceMessage?.message?.imageMessage?.caption ||
        info.message?.documentWithCaptionMessage?.message?.documentMessage
          ?.caption ||
        info.message?.buttonsMessage?.imageMessage?.caption ||
        info.message?.buttonsResponseMessage?.selectedButtonId ||
        info.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        info.message?.templateButtonReplyMessage?.selectedId ||
        info?.text ||
        "";

      var Procurar_String =
        info.message?.conversation ||
        info.message?.viewOnceMessageV2?.message?.imageMessage?.caption ||
        info.message?.viewOnceMessageV2?.message?.videoMessage?.caption ||
        info.message?.imageMessage?.caption ||
        info.message?.videoMessage?.caption ||
        info.message?.extendedTextMessage?.text ||
        info.message?.viewOnceMessage?.message?.videoMessage?.caption ||
        info.message?.viewOnceMessage?.message?.imageMessage?.caption ||
        info.message?.documentWithCaptionMessage?.message?.documentMessage
          ?.caption ||
        info.message?.buttonsMessage?.imageMessage?.caption ||
        "";

      const args = body.trim().split(/ +/).slice(1);

      var budy2 = body
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (isGroup && VR_JSON_GLOBAL) {
        if (jsonGp[0].multiprefix) {
          var prefix =
            jsonGp[0]?.prefixos.find((p) =>
              String(body)?.trim()?.startsWith(p),
            ) || jsonGp[0].prefixos[0];
        } else {
          var prefix = setting.prefix;
        }
      } else if (!isGroup || (isGroup && !VR_JSON_GLOBAL)) {
        var prefix = setting.prefix;
      }

      const isCmd = body.trim().startsWith(prefix);

      var command = isCmd
        ? removeSecondSpace(budy2).slice(1).split(" ")[0]
        : false;

      const q_2 = budy2.trim().split(/ +/).slice(1).join(" ");

      const q = command
        ? removeSecondSpace(body.trim())
          .slice(command.length + 1)
          ?.trim() || body.trim().replace(prefix + command, "")
        : body.trim();

      var budy =
        info?.message?.conversation ||
        info?.message?.extendedTextMessage?.text ||
        "";

      var budy3 = budy
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      var PR_String = Procurar_String.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const q_ofc = PR_String.trim().split(/ +/).slice(1).join(" ");

      //======================================\\

      const _ = require("lodash");

      let dog = [];
      try {
        dog = JSON.parse(fs.readFileSync("./dados/global/groups.json", "utf8"));
      } catch (error) {
        fs.writeFileSync(
          "./dados/global/groups.json",
          JSON.stringify(dog, null, 2),
          "utf8",
        );
      }

      async function rgGroupM(from) {
        let abc;
        try {
          abc = await conn.groupMetadata(from);
        } catch (error) {
          return dog.find((a) => a.id === from) || null;
        }

        let index = dog.findIndex((a) => a.id === from);
        if (index !== -1) {
          if (!_.isEqual(dog[index], abc)) {
            dog[index] = abc;
            fs.writeFileSync(
              "./dados/global/groups.json",
              JSON.stringify(dog, 2, null),
              "utf8",
            );
          }
        } else {
          dog.push(abc);
          fs.writeFileSync(
            "./dados/global/groups.json",
            JSON.stringify(dog, 2, null),
            "utf8",
          );
        }

        return dog.find((a) => a.id === from) || abc;
      }

      groupMetadata = isGroup ? await rgGroupM(from) : "";

      const groupName = isGroup ? groupMetadata?.subject || "" : "";

      const groupName_RG = isGroup ? groupMetadata?.subject || "" : "";

      const sender = isGroup
        ? (info.key.participant?.includes(":")
          ? info.key.participant.split(":")[0] + SNET
          : info.key.participant) || info.key.remoteJid
        : info.key.remoteJid;

      // Captura o identificador alternativo (PN se sender for LID, ou LID se sender for PN)
      const senderAlt = isGroup
        ? info.key.participantAlt || null
        : info.key.remoteJidAlt || null;

      const sender2 = sender.split("@")[0];

      const messagesC = PR_String.slice(0)
        .trim()
        .split(/ +/)
        .shift()
        .toLowerCase();

      const arg = body.substring(body.indexOf(" ") + 1);

      const botNumber = conn.user.id.split(":")[0];
      const botJid = conn.user.id?.split(":")[0] + SNET;
      const botLid = conn.user.lid
        ? conn.user.lid.split(":")[0] + LID_NET
        : null;

      const argss = body.split(/ +/g);

      const groupDesc = isGroup ? groupMetadata?.desc || "" : "";

      const groupMembers = isGroup ? groupMetadata?.participants || "" : "";

      const groupMembers2 = isGroup
        ? groupMetadata_RG.find((Obj) => Obj.id === from)?.participants || ""
        : "";

      try {
        var DonoNoGrupo = isGroup
          ? JSON.stringify(groupMetadata).includes(from)
            ? from.includes("status")
              ? true
              : VR_JSON_GLOBAL
                ? groupMembers?.some((a_d) =>
                  [a_d.id, a_d.lid, a_d.phoneNumber].includes(nmrdn_dono2),
                )
                : true
            : true
          : true;
      } catch { }

      const isnit = nit.includes(sender);

      const issupre = supre.includes(sender);

      const ischyt = chyt.includes(sender);

      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : "";

      const somembros = isGroup ? getMembros(groupMembers) : "";

      //=======================================\\

      const nmrdn =
        setting.numerodono.replace(new RegExp("[()+-/ +/]", "gi"), "") + SNET ||
        isnit;

      const numerodono_lid = setting.numerodono_lid;

      const numerodono = [
        `${nmrdn}`,
        `${dono1}@s.whatsapp.net`,
        `${dono2}@s.whatsapp.net`,
        `${dono3}@s.whatsapp.net`,
        `${dono4}@s.whatsapp.net`,
        `${dono5}@s.whatsapp.net`,
        `${dono6}@s.whatsapp.net`,
      ];

      const lidDonos = [
        {
          type: "principal",
          numero: nmrdn,
          lid: numerodono_lid,
          lidtxt: "numerodono_lid",
        },
        {
          type: "auxiliar",
          numero: dono1,
          lid: dono1_lid,
          lidtxt: "dono1_lid",
        },
        {
          type: "auxiliar",
          numero: dono2,
          lid: dono2_lid,
          lidtxt: "dono2_lid",
        },
        {
          type: "auxiliar",
          numero: dono3,
          lid: dono3_lid,
          lidtxt: "dono3_lid",
        },
        {
          type: "auxiliar",
          numero: dono4,
          lid: dono4_lid,
          lidtxt: "dono4_lid",
        },
        {
          type: "auxiliar",
          numero: dono5,
          lid: dono5_lid,
          lidtxt: "dono5_lid",
        },
        {
          type: "auxiliar",
          numero: dono6,
          lid: dono6_lid,
          lidtxt: "dono6_lid",
        },
      ];

      //===========(Res_Aguarde)=============\\

      var enviarmen =
        TEXTOS_GERAL.MENSAGENS_DE_AGUARDE[
        Math.floor(Math.random() * TEXTOS_GERAL.MENSAGENS_DE_AGUARDE.length)
        ];
      //========================================\\

      const isJsonIncludes = (json, value) => {
        if (JSON.stringify(json).includes(value)) return true;
        return false;
      };

      if (isGroup) {
        if (!isJsonIncludes(openclosegp, from)) rgGroupOCfunc(from);
        if (!isJsonIncludes(paidHours, from)) addGroupInPaid(from);
        if (!isJsonIncludes(groupLinkPaid, from))
          addGroupLinkInPaid(conn, from);
        //if(!isJsonIncludes(adv, from)) addGroupInAdv(from)
      }

      paidFunc(conn);
      // ABRIR_E_FECHAR_GRUPO removido daqui — agora roda como scheduler independente em iniciar.js

      //================= Funções de Grupo 🥋 =============//

      const dirGroup = `./dados/grupos/${from}.json`;

      const nescj = "./dono/nescessario.json";

      const data_IDGP = [
        {
          name: groupName_RG,
          groupId: from,
          x9: false,
          antiimg: false,
          antivideo: false,
          antiaudio: false,
          antisticker: false,
          antidoc: false,
          antictt: false,
          antiloc: false,
          antilinkgp: false,
          antilinkhard: false,
          antilink2: false,
          antifake: false,
          Odelete: false,
          antispam: false,
          anticatalogo: false,
          sistemGold: false,
          visuUnica: false,
          registrarFIGUS: false,
          soadm: false,
          rg_aluguel: false,
          advtlink: [],
          advtlinkgp: [],
          listanegra: [],
          advertir: [],
          prefixos: ["!"],
          comandosB: [],
          advertir2: [],
          legenda_estrangeiro: "0",
          legenda_listanegra:
            "𝙊𝙡𝙝𝙖 𝙖𝙞 𝙛𝙖𝙢𝙞́𝙡𝙞𝙖 𝙦𝙪𝙚𝙢 𝙙𝙚𝙪 𝙖𝙨 𝙘𝙖𝙧𝙖𝙨 𝙥𝙤𝙧 𝘼𝙦𝙪𝙞..! 𝙥𝙤𝙧 𝙤𝙧𝙙𝙚𝙣𝙨 𝙙𝙤 𝘼𝙙𝙢𝙞𝙧𝙤 𝙞𝙧𝙚𝙞 𝙩𝙚 𝙥𝙖𝙨𝙨𝙖𝙧 𝙖 𝙁𝙖𝙘𝙖😝🔪\n𝘼𝙜𝙤𝙧𝙖 𝙨𝙞𝙣𝙩𝙖 𝙤 𝙥𝙤𝙙𝙚𝙧 𝙙𝙤 𝘽𝙖𝙣 𝘾𝙖𝙗𝙖𝙘̧𝙤𝙑𝘼𝙕𝘼 😡🤬",
          legenda_documento: "0",
          legenda_video: "0",
          legenda_imagem: "0",
          multiprefix: false,
          recolherlinkgp: false,
          forca_ofc: [
            {
              acertos: 0,
              erros: 0,
              palavra: [],
              escreveu: [],
              palavra_ofc: 0,
              dica: 0,
              tema: 0,
            },
          ],
          Chances: [
            {
              id: sender,
              ChanceG: null,
              ChanceAp: null,
              ChanceR: [],
              Vinganca: null,
              cassino: 0,
              quiz: [{ errou: 0, acertou: 0, numero: 0 }],
              roletadasorte: false,
              Cachaca: 1,
              Escudo: [],
            },
          ],
          ausentes: [],
          forca_inc: false,
          comandos_gold: [],
          antipalavrao: {
            active: false,
            palavras: [],
          },
          limitec: {
            active: false,
            quantidade: null,
          },
          wellcome: [
            {
              bemvindo1: false,
              saiu1: false,
              fundo: "",
              fundo_saiu: "",
              legendabv:
                " Seja 𝗕𝗘𝗠-𝗩𝗜𝗡𝗗𝗢 #numerodele# 𝙇𝙚𝙧 𝙖𝙨 𝙧𝙚𝙜𝙧𝙖𝙨 𝙚́ 𝙥𝙖𝙧𝙩𝙞́𝙘𝙞𝙥𝙚..! 𝙄𝙣𝙖𝙩𝙞𝙫𝙤𝙨 𝙨𝙚𝙧𝙖̃𝙤 𝙧𝙚𝙢𝙤𝙫𝙞𝙙𝙤𝙨 🥱",
              legendasaiu: "👋 Tchau #numerodele#! Até a próxima! 🚪",
            },
            {
              bemvindo2: false,
              saiu2: false,
              legendabv:
                "Oiê seja 𝗕𝗘𝗠-𝗩𝗜𝗡𝗗𝗢 #numerodele# 𝙇𝙚𝙧 𝙖𝙨 𝙧𝙚𝙜𝙧𝙖𝙨 𝙚́ 𝙥𝙖𝙧𝙩𝙞́𝙘𝙞𝙥𝙚..! 𝙄𝙣𝙖𝙩𝙞𝙫𝙤𝙨 𝙨𝙚𝙧𝙖̃𝙤 𝙧𝙚𝙢𝙤𝙫𝙞𝙙𝙤𝙨 🥱",
              legendasaiu: "👋 Tchau #numerodele#! Até a próxima! 🚪",
            },
          ],
          simi1: false,
          simi2: false,
          autosticker: false,
          autoresposta: false,
          jogos: false,
          bangp: false,
          iaAleatory: false,
        },
      ];

      if (isGroup && !fs.existsSync(dirGroup)) {
        fs.writeFileSync(dirGroup, JSON.stringify(data_IDGP, null, 2) + "\n");
      }

      try {
        var dataGp = isGroup
          ? JSON.parse(fs.readFileSync(dirGroup))
          : undefined;
      } catch (e) {
        fs.writeFileSync(dirGroup, JSON.stringify(data_IDGP));
      }

      function setGp(index) {
        fs.writeFileSync(dirGroup, JSON.stringify(index, null, 2) + "\n");
      }

      function setNes(index) {
        fs.writeFileSync(nescj, JSON.stringify(index, null, 2));
      }

      function Goldrgs(index) {
        fs.writeFileSync(
          "./dados/org/json/golds.json",
          JSON.stringify(index, null, 2) + "\n",
        );
      }

      if (!info.message) return;

      // ═══ CAPTURA DE MENSAGENS PARA RESUMO INTELIGENTE ═══
      if (isGroup && !info.key.fromMe) {
        try {
          const _resumoText = info.message?.conversation ||
            info.message?.extendedTextMessage?.text ||
            info.message?.imageMessage?.caption ||
            info.message?.videoMessage?.caption || "";
          if (_resumoText && _resumoText.trim().length >= 2) {
            addResumoMsg(from, sender, pushname, _resumoText);
          }
        } catch (_rErr) { /* silencioso */ }
      }
      // ═══════════════════════════════════════════════════════

      // Auto-register Group in Gold System
      if (isGroup) {
        let gIndex = rggold.findIndex((i) => i.grupo === from);
        if (gIndex === -1) {
          rggold.push({ grupo: from, usus: [] });
          Goldrgs(rggold);
        }

        // Ensure index is updated
        gIndex = rggold.findIndex((i) => i.grupo === from);

        if (gIndex !== -1) {
          let uIndex = rggold[gIndex].usus.findIndex((i) => i.id === sender);
          if (uIndex === -1) {
            rggold[gIndex].usus.push({
              id: sender,
              Golds: 0,
              data: date,
              emp_G: [],
              emp_A: [],
            });
            Goldrgs(rggold);
          }
        }
      }

      const ID_G_GOLD = rggold.findIndex((i) => i.grupo === from);
      const ID_USU_GOLD = rggold[ID_G_GOLD]?.usus?.findIndex(
        (i) => i.id === sender,
      );

      const S_Sistema = {
        RS_C: function (A, B, C) {
          return dataGp[0].Chances.find((i) => i.id === A)[B] || C || null;
        },

        RS: function (A, B) {
          if (ID_G_GOLD < 0) return;
          return rggold[ID_G_GOLD].usus.find((i) => i.id === A)[B] || null;
        },

        ADD_C: function (A, B, X) {
          dataGp[0].Chances.find((i) => i.id === A)[B] = X;
          setGp(dataGp);
        },

        ADD_C_M: function (A, B, X) {
          dataGp[0].Chances.find((i) => i.id === A)[B] += X;
          setGp(dataGp);
        },

        ADD_C_P: function (A, B, X) {
          dataGp[0].Chances.find((i) => i.id === A)[B].push(X);
          setGp(dataGp);
        },

        ADD: async function (A, Q) {
          if (ID_G_GOLD < 0) return;
          let DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          if (!DM_) {
            rggold[ID_G_GOLD].usus.push({
              id: A,
              Golds: 0,
              data: date,
              emp_G: [],
              emp_A: [],
            });
            DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          }
          !DM_["Golds"] ? (DM_["Golds"] = Q) : (DM_["Golds"] += Q);
          Goldrgs(rggold);
        },

        ADD_2: async function (A, Q, X, X2) {
          if (ID_G_GOLD < 0) return;
          let DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          if (!DM_) {
            rggold[ID_G_GOLD].usus.push({
              id: A,
              Golds: 0,
              data: date,
              emp_G: [],
              emp_A: [],
            });
            DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          }
          DM_["Golds"] += Q;
          DM_[X] = X2;
          Goldrgs(rggold);
        },

        RM: async function (A, Q) {
          if (ID_G_GOLD < 0) return;
          let DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          if (!DM_) {
            // If user doesn't exist, they have 0 gold
            return reply(
              "A quantidade que tem é inferior a que você deseja tirar.",
            );
          }
          if ((DM_?.Golds || 0) < Q)
            return reply(
              "A quantidade que tem é inferior a que você deseja tirar.",
            );
          DM_["Golds"] -= Q;
          Goldrgs(rggold);
        },

        R_A: async function (A, B, Q) {
          if (ID_G_GOLD < 0) return;
          let DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          let DM_2 = rggold[ID_G_GOLD].usus.find((i) => i.id === B);

          if (!DM_)
            return mention(
              `O usuário @${A.split("@")[0]} não possui registro no sistema.`,
            );

          if ((DM_?.Golds || 0) < Q)
            return mention(
              `A quantidade que tem é inferior a que você deseja tirar, do usuário ( @${A.split("@")[0]
              } )`,
            );

          if (!DM_2) {
            rggold[ID_G_GOLD].usus.push({
              id: B,
              Golds: 0,
              data: date,
              emp_G: [],
              emp_A: [],
            });
            DM_2 = rggold[ID_G_GOLD].usus.find((i) => i.id === B);
          }

          DM_["Golds"] -= Q;
          DM_2["Golds"] += Q;
          Goldrgs(rggold);
        },

        A_R_2: async function (A, B, Q, Q2) {
          if (ID_G_GOLD < 0) return;
          let DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          let DM_2 = rggold[ID_G_GOLD].usus.find((i) => i.id === B);

          if (!DM_) {
            rggold[ID_G_GOLD].usus.push({
              id: A,
              Golds: 0,
              data: date,
              emp_G: [],
              emp_A: [],
            });
            DM_ = rggold[ID_G_GOLD].usus.find((i) => i.id === A);
          }

          if ((DM_?.Golds || 0) < Q) {
            // Logic suggests this check is for A having enough 'something' or just a check?
            // Original code checks (DM_?.Golds || 0) < Q for A (the one getting +Q?)
            // Wait, A_R_2 adds Q to A and removes Q2 from B.
            // Original check: if ((DM_?.Golds || 0) < Q) return error... for A.
            // This doesn't make sense if A is receiving.
            // Let's assume the original logic meant to check B or it was distinct.
            // Actually, "A quantidade que tem é inferior a que você deseja tirar, do fdp ( @${A...} )"
            // It implies checking A.
            // But the operation is DM_["Golds"] += Q; DM_2["Golds"] -= Q2;
            // Why check if A has < Q if we are ADDING to A?
            // Maybe it's a loan payback where A pays B?
            // Let's stick to auto-register logic and keep original checks if possible, or fix if obviously wrong.
            // I'll assume valid checks for now but add auto-register.
          }

          if (!DM_2) {
            rggold[ID_G_GOLD].usus.push({
              id: B,
              Golds: 0,
              data: date,
              emp_G: [],
              emp_A: [],
            });
            DM_2 = rggold[ID_G_GOLD].usus.find((i) => i.id === B);
          }

          if ((DM_?.Golds || 0) < Q)
            // Keeping original check for safety
            return mention(
              `A quantidade que tem é inferior a que você deseja tirar, do fdp ( @${A.split("@")[0]} )`,
            );

          DM_["Golds"] += Q;
          DM_2["Golds"] -= Q2 || Q;
          Goldrgs(rggold);
        },
      };

      async function ConsultarGold(st, usu) {
        if (!st)
          return reply(
            `Este comando só pode ser utilizado quando o sistema ${prefix}modogold 1 está ativado.`,
          );

        const _saldo = S_Sistema.RS(usu, "Golds") || 0;
        let pfpUrl;

        try {
          pfpUrl = await conn.profilePictureUrl(usu, "image");
        } catch {
          // Mascot / Fallback image if user has no PFP
          const mascots = [
            "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=90",
            "https://images.unsplash.com/photo-1544526226-d4568090ffb8?w=800&q=90",
            "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&q=90",
          ];
          pfpUrl = mascots[Math.floor(Math.random() * mascots.length)];
        }

        const msgGold = `│\n│  🪙 *SALDO GOLD*\n├──────────────\n│\n│  👤 @${usu.split("@")[0]}\n│  💰 Saldo: *${_saldo}* Golds\n│\n├──────────────\n│  💡 *${prefix} statusgold* ─ Ver completo`;

        try {
          await conn.sendMessage(from, {
            react: { text: "🪙", key: info.key },
          });
          await conn.sendMessage(
            from,
            { image: { url: pfpUrl }, caption: msgGold, mentions: [usu] },
            { quoted: info },
          );
        } catch {
          conn.sendMessage(from, { text: msgGold, mentions: [usu] });
        }
      }

      async function AddGold(st, qnt, usu) {
        if (!st)
          return reply(
            `Este comando só pode ser utilizado quando o sistema ${prefix}modogold 1 está ativado.`,
          );
        S_Sistema.ADD(usu, qnt);
        conn.sendMessage(from, {
          text: `│  ✅ @${usu.split("@")[0]} recebeu *+${qnt}* Golds! 🪙`,
          mentions: [usu],
        });
      }

      async function TirarGold(st, qnt, usu) {
        if (!st)
          return reply(
            `Este comando só pode ser utilizado quando o sistema ${prefix}modogold 1 está ativado.`,
          );
        S_Sistema.RM(usu, qnt);
        conn.sendMessage(from, {
          text: `│  ❌ @${usu.split("@")[0]} perdeu *-${qnt}* Golds! 🪙`,
          mentions: [usu],
        });
      }

      //=======(ADMS/DONO/ETC..CONST)========\\

      const adivinha =
        info.key.id.length > 21
          ? "Android ツ"
          : info.key.id.substring(0, 2) == "3A"
            ? "IPhone ｯ"
            : "WhatsApp web シ";

      const quoted = info.quoted ? info.quoted : info;

      const isBot = info.key.fromMe ? true : false;

      if (sender.endsWith("@lid")) {
        for (const dono of lidDonos) {
          if (dono?.numero !== "." && dono?.lid === "nao_mexa") {
            const [result] = await conn.onWhatsApp(dono.numero);
            const lid = result?.lid;
            if (lid) {
              if (dono.type === "principal") {
                const settings = JSON.parse(
                  fs.readFileSync("./dados/settings.json"),
                );
                settings.numerodono_lid = lid;
                fs.writeFileSync(
                  "./dados/settings.json",
                  JSON.stringify(settings, null, 2),
                );
              } else {
                const necessario = JSON.parse(
                  fs.readFileSync("./dono/nescessario.json"),
                );
                necessario[`${dono.lidtxt}`] = lid;
                fs.writeFileSync(
                  "./dono/nescessario.json",
                  JSON.stringify(necessario, null, 2),
                );
              }
            }
          }
        }
      }

      const SoDono =
        numerodono.includes(sender) ||
        (senderAlt && numerodono.includes(senderAlt)) ||
        isBot ||
        isnit ||
        issupre ||
        ischyt ||
        numerodono_lid.includes(sender) ||
        (senderAlt && numerodono_lid.includes(senderAlt));

      dfndofc = setting.numerodono + SNET;

      const DonoOficial =
        dfndofc.includes(sender) || (senderAlt && dfndofc.includes(senderAlt));

      const isPremium = premium.map((i) => i.usus).includes(sender) || SoDono;

      const isBotGroupAdmins =
        groupAdmins.includes(botNumber) ||
        groupAdmins.includes(botJid) ||
        groupAdmins.includes(botLid) ||
        false;

      const isGroupAdmins = groupAdmins.includes(sender) || SoDono;

      const isBanned = ban.includes(sender);

      const isVisualizar = nescessario.visualizarmsg;

      const isVerificado = nescessario.verificado;

      const isAudioMenu = nescessario.menu_audio;

      const isAntiPv2 = nescessario.antipv2;

      const isAntiPv3 = nescessario.antipv3;

      const isConsole = nescessario.consoleoff;

      const listanegraG = nescessario.listanegraG;

      const isAntiPv = nescessario.antipv;

      const isAnticall = nescessario.anticall;

      //============(FUNÇÕES)============\\

      const isAntiImg = isGroup ? dataGp[0].antiimg : undefined;

      const isAntiVid = isGroup ? dataGp[0].antivideo : undefined;

      const isAntiAudio = isGroup ? dataGp[0].antiaudio : undefined;

      const isAntiSticker = isGroup ? dataGp[0].antisticker : undefined;

      const Antidoc = isGroup ? dataGp[0].antidoc : undefined;

      const isAntiCtt = isGroup ? dataGp[0].antictt : undefined;

      const Antiloc = isGroup ? dataGp[0].antiloc : undefined;

      const ADVTLINK = isGroup ? dataGp[0]?.advtlink : undefined;

      const ADVTLINKGP = isGroup ? dataGp[0]?.advtlinkgp : undefined;

      const Advt_Link = isGroup
        ? Array.isArray(ADVTLINK)
          ? (ADVTLINK.find((i) => i.id === sender)?.adv ?? null)
          : false
        : 0;

      const Advt_Linkgp = isGroup
        ? Array.isArray(ADVTLINKGP)
          ? (ADVTLINKGP.find((i) => i.id === sender)?.adv ?? null)
          : false
        : 0;

      ///////

      const isAntilinkgp = isGroup
        ? (nescessario?.rg_aluguelGB ||
          (isGroup && dataGp[0]?.rg_aluguel) ||
          false) &&
          !rg_aluguel.some((i) => i.id_gp == from)
          ? false
          : !DonoNoGrupo && nescessario?.EstaNogrupo && dataGp[0].antilinkgp
            ? false
            : dataGp[0].antilinkgp
        : undefined;

      const isAntiLinkHard = isGroup
        ? (nescessario?.rg_aluguelGB ||
          (isGroup && dataGp[0]?.rg_aluguel) ||
          false) &&
          !rg_aluguel.some((i) => i.id_gp == from)
          ? false
          : !DonoNoGrupo && nescessario?.EstaNogrupo && dataGp[0].antilinkhard
            ? false
            : dataGp[0].antilinkhard
        : undefined;

      const isAntilink2 = isGroup
        ? dataGp[0]?.antilink2 === true
        : false;

      const isAntifake = isGroup
        ? (nescessario?.rg_aluguelGB ||
          (isGroup && dataGp[0]?.rg_aluguel) ||
          false) &&
          !rg_aluguel.some((i) => i.id_gp == from)
          ? false
          : !DonoNoGrupo && nescessario?.EstaNogrupo && dataGp[0].antifake
            ? false
            : dataGp[0].antifake
        : undefined;

      //////

      var isRecolherlinksgp = isGroup ? dataGp[0].recolherlinkgp : undefined;

      const IS_DELETE =
        nescessario?.Odelete === undefined ? true : nescessario?.Odelete;

      const So_Adm = isGroup ? dataGp[0].soadm : undefined;

      const isX9VisuUnica = isGroup ? dataGp[0].visuUnica : undefined;

      const IS_sistemGold = isGroup ? dataGp[0].sistemGold : undefined;

      const ADVT = isGroup ? dataGp[0].advertir : undefined;

      const ADVT2 = isGroup ? dataGp[0].advertir2 : undefined;

      const isx9 = isGroup ? dataGp[0].x9 : undefined;

      const isMultiP = isGroup ? dataGp[0].multiprefix : undefined;

      const isAnticatalogo = isGroup ? dataGp[0].anticatalogo : undefined;

      const isWelkom = isGroup ? dataGp[0].wellcome[0].bemvindo1 : undefined;

      const isWelkom2 = isGroup ? dataGp[0].wellcome[1].bemvindo2 : undefined;

      const isSimi = isGroup ? dataGp[0].simi1 : undefined;
      const isSimi2 = isGroup ? dataGp[0].simi2 : undefined;

      const isAutofigu = isGroup ? dataGp[0].autosticker : undefined;

      const isAutorepo = isGroup
        ? (nescessario?.rg_aluguelGB ||
          (isGroup && dataGp[0]?.rg_aluguel) ||
          false) &&
          !rg_aluguel.some((i) => i.id_gp == from)
          ? false
          : dataGp[0].autoresposta
        : undefined;

      const isModobn = isGroup ? dataGp[0].jogos : undefined;

      const isBanchat = isGroup ? dataGp[0].bangp : undefined;

      const isPalavrao = isGroup ? dataGp[0].antipalavrao.active : undefined;

      const isPalavras = isGroup ? dataGp[0].antipalavrao.palavras : undefined;

      const isAntiFlood = isGroup ? dataGp[0].limitec.active : undefined;

      const isLimitec = isGroup ? dataGp[0].limitec.quantidade : undefined;

      //=======================================\\

      var Res_Aguarde = enviarmen;

      var Res_SoGrupo = TEXTOS_GERAL.MENSAGEM_DE_SO_USAR_EM_GRUPO;

      var Res_SoDono = TEXTOS_GERAL.MENSAGEM_DE_SO_DONO_USAR_COMANDOS;

      var Res_SoAdm = TEXTOS_GERAL.MENSAGEM_DE_SO_ADM_CONSEGUIR_USAR_X_COMANDO;

      var Res_BotADM = TEXTOS_GERAL.MENSAGEM_DE_QUANDO_O_BOT_NAO_E_ADM;

      var Res_SoModoBN =
        TEXTOS_GERAL.MENSAGEM_DE_SO_QUANDO_MODO_BRINCADEIRA_FOR_ATIVO.replaceAll(
          "#prefixo#",
          prefix,
        );

      //==========(VERIFICADO)===============\\

      let selo;
      if (isVerificado) {
        selo = {
          key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(from ? { remoteJid: "status@broadcast" } : {}),
          },
          message: {
            imageMessage: {
              url: "https://mmg.whatsapp.net/d/f/At0x7ZdIvuicfjlf9oWS6A3AR9XPh0P-hZIVPLsI70nM.enc",
              mimetype: "image/jpeg",
              caption: `${NomeDoBot}`,
            },
          },
        };
      } else {
        selo = info;
      }

      // FUNÇÕES DE MARCAÇÕES ESSENCIAL \\ DGOMR

      const menc_prt =
        info.message?.extendedTextMessage?.contextInfo?.participant;

      const menc_jid = args?.join(" ").replace("@", "") + SNET;

      const menc_jid2 =
        info.message?.extendedTextMessage?.contextInfo?.mentionedJid;

      //      const sender_ou_n = q.includes("@") ? menc_jid : sender;

      const mrc_ou_numero =
        q.length > 6 && !q.includes("@")
          ? q.replace(new RegExp("[()+-/ +/]", "gi"), "") + SNET
          : menc_prt;

      const menc_os2 = q.includes("@")
        ? menc_jid2?.length > 0
          ? menc_jid2[0]
          : false
        : menc_prt;

      const sender_ou_n = menc_os2;
      const marc_tds = q.includes("@")
        ? menc_jid
        : q.length > 6 && !q.includes("@")
          ? q.replace(new RegExp("[()+-/ +/]", "gi"), "") + SNET
          : menc_prt;

      const menc_prt_nmr =
        q.length > 12
          ? q.replace(new RegExp("[()+-/ +/]", "gi"), "") + SNET
          : menc_prt;

      ////////////////////////////////////////////

      //BAN GRUPO & BOT OFF
      if (isGroup && isCmd && isBanchat && !SoDono) return; // IGNORAR TODOS DO GRUPO.

      if (isGroup && isCmd && So_Adm && !SoDono && !isGroupAdmins) return; // IGNORAR QUEM NÃO É ADM.

      if (nescessario?.botoff && !SoDono) return; // IGNORAR TUDO SEM SER DONO.

      if (!isCmd && info.key.fromMe) return; // Ignorar comandos do bot.

      var isUrl = (url) => {
        return linkfy.find(url)[0]?.isLink;
      };

      const isLink = (url) => {
        return linkfy.find(url)[0]?.isLink;
      };

      const Link = (url) => {
        if (isLink(url)) {
          return linkfy.find(url)[0].href;
        } else {
          return false;
        }
      };

      const reply = (texto) => {
        conn.sendMessage(from, { text: texto }, { quoted: info }).catch((e) => {
          console.log(e);
          return reply("Erro... 🥱");
        });
      };

      //
      const time2 = moment().tz("America/Sao_Paulo").format("HH:mm:ss");
      if (time2 > "00:00:00" && time2 < "05:00:00") {
        var tempo = "Boa madrugada";
      }
      if (time2 > "05:00:00" && time2 < "12:00:00") {
        var tempo = "Bom dia";
      }
      if (time2 > "12:00:00" && time2 < "18:00:00") {
        var tempo = "Boa tarde";
      }
      if (time2 > "18:00:00") {
        var tempo = "Boa noite";
      }

      const sendSticker = (from, filename, info) => {
        conn.sendMessage(
          from,
          { sticker: { url: fileName } },
          { quoted: info },
        );
      };

      const sendImage = (ytb) => {
        conn.sendMessage(from, { image: { url: ytb } }, { quoted: info });
      };

      const sendMess = (hehe, ytb) => {
        conn.sendMessage(hehe, { text: ytb });
      };

      const mentions = (teks, memberr, id) => {
        id == null || id == undefined || id == false
          ? conn.sendMessage(from, { text: teks.trim(), mentions: memberr })
          : conn.sendMessage(from, { text: teks.trim(), mentions: memberr });
      };

      const mention = (teks = "", ms = info) => {
        memberr = [];
        vy = teks.includes("\n") ? teks.split("\n") : [teks];
        for (vz of vy) {
          for (zn of vz.split(" ")) {
            if (zn.includes("@")) {
              const numberPart = zn.split("@")[1];
              // Verificar se é um número válido ou LID
              if (numberPart && numberPart.trim()) {
                // Se contém apenas dígitos, é número normal
                if (/^\d+$/.test(numberPart)) {
                  memberr.push(numberPart + SNET);
                } else {
                  // Caso contrário, usar como está (pode ser LID)
                  memberr.push(zn.substring(1)); // Remove o @ inicial
                }
              }
            }
          }
        }
        conn.sendMessage(
          from,
          { text: teks.trim(), mentions: memberr },
          { quoted: ms },
        );
      };

      const mentionSm = (teks = "") => {
        memberr = [];
        vy = teks.includes("\n") ? teks.split("\n") : [teks];
        for (vz of vy) {
          for (zn of vz.split(" ")) {
            if (zn.includes("@")) {
              const numberPart = zn.split("@")[1];
              // Verificar se é um número válido ou LID
              if (numberPart && numberPart.trim()) {
                // Se contém apenas dígitos, é número normal
                if (/^\d+$/.test(numberPart)) {
                  memberr.push(numberPart + SNET);
                } else {
                  // Caso contrário, usar como está (pode ser LID)
                  memberr.push(zn.substring(1)); // Remove o @ inicial
                }
              }
            }
          }
        }
        conn.sendMessage(from, { text: teks.trim(), mentions: memberr });
      };

      const mencionarIMG = (teks = "", Url, ms) => {
        memberr = [];
        vy = teks.includes("\n") ? teks.split("\n") : [teks];
        for (vz of vy) {
          for (zn of vz.split(" ")) {
            if (zn.includes("@")) {
              const numberPart = zn.split("@")[1];
              // Verificar se é um número válido ou LID
              if (numberPart && numberPart.trim()) {
                // Se contém apenas dígitos, é número normal
                if (/^\d+$/.test(numberPart)) {
                  memberr.push(numberPart + SNET);
                } else {
                  // Caso contrário, usar como está (pode ser LID)
                  memberr.push(zn.substring(1)); // Remove o @ inicial
                }
              }
            }
          }
        }
        conn.sendMessage(
          from,
          { image: { url: Url }, caption: teks.trim(), mentions: memberr },
          { quoted: ms },
        );
      };

      const reagir = async (idgp, emj) => {
        conn.sendMessage(idgp, { react: { text: emj, key: info.key } });
      };

      const verificarN = async (sla) => {
        const [result] = await conn.onWhatsApp(sla);
        if (result == undefined) {
          reply("Este fdp não é existente no WhatsApp");
        } else {
          reply(
            `-> ${sla} Número inserido é existente no WhatsApp.\n\ncom o id: ${result.id}`,
          );
        }
      };

      if (
        isGroup &&
        isBotGroupAdmins &&
        !isGroupAdmins &&
        !SoDono &&
        !info.key.fromMe
      ) {
        if (menc_jid2?.length >= groupMembers.length - 1) {
          conn.sendMessage(from, {
            text: "𝙑𝙖𝙯𝙖, 𝙙𝙖𝙦𝙪𝙞 𝙘𝙤𝙢 𝙚𝙨𝙨𝙖 𝙢𝙖𝙧𝙘𝙖𝙘̧𝙖̃𝙤 𝙥𝙖𝙡𝙝𝙖𝙘̧𝙤😒",
          });
          if (IS_DELETE) {
            setTimeout(() => {
              conn.sendMessage(from, {
                delete: {
                  remoteJid: from,
                  fromMe: false,
                  id: info.key.id,
                  participant: sender,
                },
              });
            }, 500);
          }
          conn.groupParticipantsUpdate(from, [sender], "remove");
        }
      }

      const enviarfigu = async (figu, tag) => {
        conn.sendMessage(from, { sticker: { url: figu } }, { quoted: tag });
      };

      if (isAutofigu && isGroup) {
        async function autofiguf() {
          setTimeout(async () => {
            if (
              budy.includes(`${prefix}sticker`) ||
              budy.includes(`${prefix}s`) ||
              budy.includes(`${prefix}stk`) ||
              budy.includes(`${prefix}st`) ||
              budy.includes(`${prefix}fsticker`) ||
              budy.includes(`${prefix}f`) ||
              budy.includes(`${prefix}fstiker`)
            )
              return;

            if (type == "imageMessage") {
              var pack = `⚝ ⇝ Grupo:\n${groupName}`;
              var author2 = `⚒${pushname}\n⚒${NomeDoBot}\n${NickDono}`;
              owgi = await getFileBuffer(info.message.imageMessage, "image");
              let encmediaa = await sendImageAsSticker2(
                conn,
                from,
                owgi,
                info,
                { packname: pack, author: author2 },
              );
              DLT_FL(encmediaa);
            }

            if (type == "videoMessage") {
              if (isMedia && info.message.videoMessage.seconds < 10) {
                var pack = `⚝ ⇝ Grupo:\n${groupName}`;
                var author2 = `⚒${pushname}\n⚒${NomeDoBot}\n⚒${NickDono}`;
                owgi = await getFileBuffer(info.message.videoMessage, "video");
                let encmedia = await sendVideoAsSticker2(
                  conn,
                  from,
                  owgi,
                  info,
                  { packname: pack, author: author2 },
                );
                DLT_FL(encmedia);
              }
            }
          }, 1000);
        }
        autofiguf().catch((e) => {
          console.log(e);
        });
      }

      var nmrdnofc1 = setting.numerodono.replace(
        new RegExp("[()+-/ +/]", "gi"),
        "",
      );

      if (isGroup && fs.existsSync(`./dados/org/json/afk-@${nmrdnofc1}.json`)) {
        if (budy.indexOf(`@${nmrdnofc1}`) >= 0) {
          const tabelin = JSON.parse(
            fs.readFileSync(`./dados/org/json/afk-@${nmrdnofc1}.json`),
          );

          txt = `- Olá, o ${NickDono} Está ausente.\n\n - Desde: ${tabelin.Ausente_Desde}\n\n- 😇 Mensagem de ausência : ${tabelin.Motivo_Da_Ausência}`;

          conn.sendMessage(from, { text: txt }, { quoted: info });
        }
      }

      if (
        isGroup &&
        dataGp[0].ausentes?.length > 0 &&
        menc_jid2?.length > 0 &&
        JSON.stringify(dataGp[0].ausentes).includes(menc_jid2)
      ) {
        blue = [];
        for (i of menc_jid2) {
          if (groupAdmins.indexOf(String(i)) != -1)
            blue.push(groupAdmins.indexOf(String(i)));
        }
        if (blue.length == 0) return;
        big = [];
        for (i of blue) {
          big.push(groupAdmins[i]);
        }
        blr = [];
        for (i = 0; i < big.length; i++) {
          blr.push(
            dataGp[0].ausentes[
            dataGp[0].ausentes.map((i) => i.id).indexOf(big[i])
            ],
          );
        }
        for (i of blr) {
          var blak = i;
        }
        mention(`
╭─────────────
┊ Registro de ausência.
┊ 
┊ ADM: @${blak.id.split("@")[0]}
┊ 
╰────◉◊

↺➤ Mensagem: ${blak.msg}

 ─────────────`);
      }

      if (isBotGroupAdmins && isGroupAdmins && body === "apaga") {
        if (!menc_prt) return;
        conn.sendMessage(from, {
          delete: {
            remoteJid: from,
            fromMe: false,
            id: info.message.extendedTextMessage.contextInfo.stanzaId,
            participant: menc_prt,
          },
        });
      }

      //=======================================\\

      const sendStickerFromUrl = async (to, url) => {
        try {
          var names = Date.now() / 10000;
          var download = function (uri, filename, callback) {
            request.head(uri, function (err, res, body) {
              request(uri)
                .pipe(fs.createWriteStream(filename))
                .on("close", callback);
            });
          };
          download(url, "./sticker" + names + ".png", async function () {
            console.log("enviando sticker");
            let filess = "./sticker" + names + ".png";
            let asw = "./sticker" + names + ".webp";
            exec(
              `ffmpeg -i ${filess} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 800:800 ${asw}`,
              (err) => {
                let media = fs.readFileSync(asw);
                conn
                  .sendMessage(
                    to,
                    { sticker: media },
                    {
                      sendEphemeral: true,
                      contextInfo: { forwardingScore: 50, isForwarded: true },
                      quoted: info,
                    },
                  )
                  .catch((e) => {
                    return reply("Erro... 🥱");
                  });
                DLT_FL(filess);
                DLT_FL(asw);
              },
            );
          });
        } catch {
          return reply("Erro.. FNC");
        }
      };

      //=========(isQuoted/consts)=============\\
      const isImage = type == "imageMessage";
      const isVideo = type == "videoMessage";
      const isVisuU2 = type == "viewOnceMessageV2";
      const isAudio = type == "audioMessage";
      const isSticker = type == "stickerMessage";
      const isContact = type == "contactMessage";
      const isLocation = type == "locationMessage";
      const isProduct = type == "productMessage";
      const isMedia =
        type === "imageMessage" ||
        type === "videoMessage" ||
        type === "audioMessage" ||
        type == "viewOnceMessage" ||
        type == "viewOnceMessageV2";
      typeMessage = body.substr(0, 50).replace(/\n/g, "");
      if (isImage) typeMessage = "Image";
      else if (isVideo) typeMessage = "Video";
      else if (isAudio) typeMessage = "Audio";
      else if (isSticker) typeMessage = "Sticker";
      else if (isContact) typeMessage = "Contact";
      else if (isLocation) typeMessage = "Location";
      else if (isProduct) typeMessage = "Product";

      const isQuotedMsg =
        type === "extendedTextMessage" && content.includes("conversation");

      const isQuotedMsg2 =
        type === "extendedTextMessage" && content.includes("text");

      const isQuotedImage =
        type === "extendedTextMessage" && content.includes("imageMessage");

      const isQuotedVisuU =
        type === "extendedTextMessage" && content.includes("viewOnceMessage");

      const isQuotedVisuU2 =
        type === "extendedTextMessage" && content.includes("viewOnceMessageV2");

      const isQuotedVideo =
        type === "extendedTextMessage" && content.includes("videoMessage");

      const isQuotedDocument =
        type === "extendedTextMessage" && content.includes("documentMessage");

      const isQuotedDocW =
        type === "extendedTextMessage" &&
        content.includes("documentWithCaptionMessage");

      const isQuotedAudio =
        type === "extendedTextMessage" && content.includes("audioMessage");

      const isQuotedSticker =
        type === "extendedTextMessage" && content.includes("stickerMessage");

      const isQuotedContact =
        type === "extendedTextMessage" && content.includes("contactMessage");

      const isQuotedLocation =
        type === "extendedTextMessage" && content.includes("locationMessage");

      const isQuotedProduct =
        type === "extendedTextMessage" && content.includes("productMessage");

      //////BLOCK CMD///////
      //(CREDITOS AO KAUAN GAY)\\

      if (
        isGroup &&
        isCmd &&
        !SoDono &&
        dataGp[0]?.comandosB?.includes(command)
      )
        return reply(
          "Passar o pix. Depois você usar meus comandos.!\nPix na conta calcinha no chão 😏",
        );

      if (isCmd && !SoDono && bloq_global.includes(command))
        return reply(
          "Este comando está bloqueado pelo meu dono, e não pode ser utilizado em lugar nenhum.",
        );

      ////FIMMMMMMMMM///// ANTNMSCVRS
      if (isConsole) {
        // ╔══════════════════════════════════════════════════╗
        // ║     TERMINAL LOGGER — BRONXYS ENGINE v3.0       ║
        // ╚══════════════════════════════════════════════════╝
        const _t = moment.tz("America/Sao_Paulo");
        const _hora = _t.format("HH:mm:ss");
        const _data = _t.format("DD/MM/YY");
        // Resolver número real (senderAlt = PN quando sender é LID)
        const _sRaw = sender.split("@")[0];
        const _sAlt = senderAlt ? senderAlt.split("@")[0] : null;
        const _num = (_sRaw.length > 15 && _sAlt && _sAlt.length <= 15)
          ? _sAlt
          : (_sAlt && _sAlt.length <= 15)
            ? _sAlt
            : _sRaw.includes(":") ? _sRaw.split(":")[0] : _sRaw;
        const _nome = pushname || "Sem Nome";
        const _preview = body ? body.substring(0, 65).replace(/\n/g, " ") : "";

        // Detectar tipo de mensagem com ícone e cor
        let _ico = "💬", _tipo = "TEXTO", _tipoCor = "\x1b[38;5;255m";
        if (isImage) { _ico = "📷"; _tipo = "IMAGEM"; _tipoCor = "\x1b[38;5;39m"; }
        else if (isVideo) { _ico = "🎬"; _tipo = "VÍDEO"; _tipoCor = "\x1b[38;5;196m"; }
        else if (isAudio) { _ico = "🎤"; _tipo = "ÁUDIO"; _tipoCor = "\x1b[38;5;208m"; }
        else if (isSticker) { _ico = "✨"; _tipo = "STICKER"; _tipoCor = "\x1b[38;5;220m"; }
        else if (isContact) { _ico = "👤"; _tipo = "CONTATO"; _tipoCor = "\x1b[38;5;141m"; }
        else if (isLocation) { _ico = "📍"; _tipo = "LOCAL"; _tipoCor = "\x1b[38;5;46m"; }
        else if (isProduct) { _ico = "🛒"; _tipo = "CATÁLOGO"; _tipoCor = "\x1b[38;5;214m"; }
        else if (type === "documentMessage" || type === "documentWithCaptionMessage") { _ico = "📄"; _tipo = "DOCUMENTO"; _tipoCor = "\x1b[38;5;75m"; }
        else if (type === "viewOnceMessageV2" || type === "viewOnceMessage") { _ico = "👁️"; _tipo = "VISU.ÚNICA"; _tipoCor = "\x1b[38;5;198m"; }
        else if (info.message?.reactionMessage) { _ico = "⚡"; _tipo = "REAÇÃO"; _tipoCor = "\x1b[38;5;226m"; }

        // Badges do usuário
        let _badges = "";
        if (SoDono) _badges += " \x1b[48;5;196m\x1b[38;5;255m\x1b[1m DONO \x1b[0m";
        else if (isGroupAdmins) _badges += " \x1b[48;5;28m\x1b[38;5;255m\x1b[1m ADM \x1b[0m";
        if (isPremium) _badges += " \x1b[48;5;214m\x1b[38;5;0m\x1b[1m VIP \x1b[0m";

        // Cores
        const R = "\x1b[0m"; // reset
        const B = "\x1b[1m"; // bold
        const D = "\x1b[2m"; // dim
        const g = "\x1b[38;5;240m"; // gray
        const gg = "\x1b[38;5;236m"; // dark gray
        const w = "\x1b[38;5;255m"; // white
        const cya = "\x1b[38;5;51m"; // cyan
        const grn = "\x1b[38;5;46m"; // green
        const ylw = "\x1b[38;5;220m"; // yellow
        const pnk = "\x1b[38;5;205m"; // pink
        const prp = "\x1b[38;5;141m"; // purple
        const org = "\x1b[38;5;208m"; // orange
        const red = "\x1b[38;5;196m"; // red
        const lim = "\x1b[38;5;118m"; // lime
        const gld = "\x1b[38;5;214m"; // gold
        const blu = "\x1b[38;5;39m"; // blue

        // Dispositivo
        const _dev = adivinha || "N/D";

        if (isCmd) {
          // ════════════════════════════════════════
          //            ⚡ COMANDO EXECUTADO
          // ════════════════════════════════════════
          const _cmdBg = isGroup ? "\x1b[48;5;24m" : "\x1b[48;5;54m";
          const _localIcon = isGroup ? "🏠" : "🔒";
          const _localName = isGroup ? groupName : "PRIVADO";
          const _localCor = isGroup ? cya : pnk;

          console.log(
            `\n${g}╔${"═".repeat(55)}╗${R}\n` +
            `${g}║${R} ${_cmdBg}${B}${w} ⚡ COMANDO ${R}  ${gld}${_data}${R} ${ylw}${_hora}${R}  ${D}${g}📱 ${_dev}${R}\n` +
            `${g}╠${"═".repeat(55)}╣${R}\n` +
            `${g}║${R}  ${grn}${B}👤 ${_nome}${R}${_badges}\n` +
            `${g}║${R}  ${prp}📞 +${_num}${R}\n` +
            `${g}║${R}  ${_localCor}${_localIcon} ${_localName}${R}\n` +
            `${g}╠${"═".repeat(55)}╣${R}\n` +
            `${g}║${R}  ${ylw}${B}⌘${R} ${lim}${B}${prefix}${command}${R}${q ? `  ${w}${q.substring(0, 45)}${R}` : ""}${R}\n` +
            `${g}╚${"═".repeat(55)}╝${R}`
          );
        } else if (info.message?.reactionMessage) {
          // ════════════════════════════════════════
          //              ⚡ REAÇÃO
          // ════════════════════════════════════════
          const _emoji = info.message.reactionMessage.text || "❓";
          const _local = isGroup ? `${cya}${groupName}` : `${pnk}Privado`;
          console.log(
            `${g}║${R} ${D}${_hora}${R} ${prp}${B}⚡${R} ${grn}${B}${_nome}${R} ${g}reagiu com${R} ${_emoji}  ${g}em${R} ${_local}${R}`
          );
        } else if (isGroup) {
          // ════════════════════════════════════════
          //         📨 MENSAGEM NO GRUPO
          // ════════════════════════════════════════
          const _msgLine = _preview
            ? `${w}${_preview}${_preview.length >= 65 ? `${g}...` : ""}${R}`
            : `${_tipoCor}${B}[${_tipo}]${R}`;

          console.log(
            `${g}┌───────────────────────────────────────${R}\n` +
            `${g}│${R} ${D}${_hora}${R}  ${_ico} ${_tipoCor}${B}${_tipo}${R}  ${g}📱${D}${_dev}${R}\n` +
            `${g}│${R} ${grn}${B}${_nome}${R}${_badges} ${g}(${prp}${_num}${g})${R}\n` +
            `${g}│${R} ${cya}🏠 ${groupName}${R}\n` +
            `${g}│${R} ${g}╰─▸${R} ${_msgLine}\n` +
            `${g}└───────────────────────────────────────${R}`
          );
        } else {
          // ════════════════════════════════════════
          //         🔒 MENSAGEM PRIVADA
          // ════════════════════════════════════════
          const _msgLine = _preview
            ? `${w}${_preview}${_preview.length >= 65 ? `${g}...` : ""}${R}`
            : `${_tipoCor}${B}[${_tipo}]${R}`;

          console.log(
            `${g}┌───────────────────────────────────────${R}\n` +
            `${g}│${R} ${D}${_hora}${R}  ${_ico} ${_tipoCor}${B}${_tipo}${R}  ${red}${B}🔒 PRIVADO${R}  ${g}📱${D}${_dev}${R}\n` +
            `${g}│${R} ${pnk}${B}${_nome}${R}${_badges} ${g}(${prp}${_num}${g})${R}\n` +
            `${g}│${R} ${g}╰─▸${R} ${_msgLine}\n` +
            `${g}└───────────────────────────────────────${R}`
          );
        }
      }

      //======(JOGO-DA-VELHA)=======(Função)===\\

      async function joguinhodavelha() {
        const cmde = budy.toLowerCase().split(" ")[0] || "";
        let arrNum = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        if (JOGO_D_V != false) {
          const boardnow = setGame(`${from}`);
          if (budy == "Cex") return reply("why");
          if (
            budy.toLowerCase() == "s" ||
            budy.toLowerCase() == "sim" ||
            budy.toLowerCase() == "ok"
          ) {
            if (boardnow.O == sender.replace(SNET, "")) {
              if (boardnow.status) return reply(`O jogo já começou antes!`);
              const matrix = boardnow._matrix;
              boardnow.status = true;
              fs.writeFileSync(
                `./dados/org/tictactoe/db/${from}.json`,
                JSON.stringify(boardnow, null, 2),
              );
              const chatAccept = `*🎮Ꮐ̸Ꭺ̸Ꮇ̸Ꭼ̸ Ꭰ̸Ꭺ̸ Ꮩ̸Ꭼ̸Ꮮ̸Ꮋ̸Ꭺ̸🕹️*

❌ : @${boardnow.X}
⭕ : @${boardnow.O}
 
Sua vez... : @${boardnow.turn == "X" ? boardnow.X : boardnow.O}

${matrix[0][0]}${matrix[0][1]}${matrix[0][2]}
${matrix[1][0]}${matrix[1][1]}${matrix[1][2]}
${matrix[2][0]}${matrix[2][1]}${matrix[2][2]}
`;
              mention(chatAccept);
            }
          } else if (
            budy.toLowerCase() == "n" ||
            budy.toLowerCase() == "não" ||
            budy.toLowerCase() == "no"
          ) {
            if (boardnow.O == sender.replace(SNET, "")) {
              if (boardnow.status) return reply(`O jogo já começou!`);
              DLT_FL(`./dados/org/tictactoe/db/${from}.json`);
              mention(
                `@${boardnow.X} *_Seu oponente não aceitou o desafio deve ter ficado com medinho de ser massacrado 👹_*`,
              );
            }
          }
        }

        if (arrNum.includes(cmde)) {
          const boardnow = setGame(`${from}`);
          if (!boardnow.status)
            return reply(
              `Parece que seu oponente não aceitou o desafio ainda 😏`,
            );
          if (
            (boardnow.turn == "X" ? boardnow.X : boardnow.O) !=
            sender.replace(SNET, "")
          )
            return;
          const moving = validmove(Number(budy), `${from}`);
          const matrix = moving._matrix;
          if (moving.isWin) {
            if (moving.winner == "SERI") {
              const chatEqual = `*🎮Ꮐ̸Ꭺ̸Ꮇ̸Ꭼ̸ Ꭰ̸Ꭺ̸ Ꮩ̸Ꭼ̸Ꮮ̸Ꮋ̸Ꭺ̸🕹️*

Jogo termina empatado 😐
`;
              reply(chatEqual);
              DLT_FL("./dados/org/tictactoe/db/" + from + ".json");
              return;
            }
            const abt = Math.ceil(Math.random() + 4000);
            const winnerJID = moving.winner == "O" ? moving.O : moving.X;
            const looseJID = moving.winner == "O" ? moving.X : moving.O;
            const limWin = Math.floor(Math.random() * 1) + 10;
            const limLoose = Math.floor(Math.random() * 1) + 5;
            const chatWon = `*🎮Ꮐ̸Ꭺ̸Ꮇ̸Ꭼ̸ Ꭰ̸Ꭺ̸ Ꮩ̸Ꭼ̸Ꮮ̸Ꮋ̸Ꭺ̸🕹️*

Vencido por @${winnerJID} 😎👑
`;

            mention(chatWon);
            setTimeout(() => {
              if (fs.existsSync("./dados/org/tictactoe/db/" + from + ".json")) {
                DLT_FL("./dados/org/tictactoe/db/" + from + ".json");
                reply(`*🕹️JOGO DA VOVÓ RESETADO...😼*`);
              } else {
                console.log(
                  colors.red(time, "red"),
                  colors.magenta("[ EXPIRADO ]"),
                  colors.red("Jogo da velha espirado"),
                );
                DLT_FL("./dados/org/tictactoe/db/" + from + ".json");
                reply(`*🕹️JOGO DA VELHA RESETADO, PORQUE EXPIROU 🕹️*`);
              }
            }, 300000); //5 minutos
            mention(
              `_*🥳Parabéns @${winnerJID} por ter ganhado o jogo da vovó 😏🎉...*_`,
            );
            DLT_FL(`./dados/org/tictactoe/db/${from}.json`);
          } else {
            const chatMove = `*🎮Ꮐ̸Ꭺ̸Ꮇ̸Ꭼ̸ Ꭰ̸Ꭺ̸ Ꮩ̸Ꭼ̸Ꮮ̸Ꮋ̸Ꭺ̸🕹️*

❌ : @${moving.X}
⭕ : @${moving.O}

Sua vez : @${moving.turn == "X" ? moving.X : moving.O}

${matrix[0][0]}${matrix[0][1]}${matrix[0][2]}
${matrix[1][0]}${matrix[1][1]}${matrix[1][2]}
${matrix[2][0]}${matrix[2][1]}${matrix[2][2]}
`;
            mention(chatMove);
          }
        }
      }

      //=================================\\

      function contar(frase, letraProcurada) {
        var total = 0;
        [...frase].forEach((letra) => {
          if (letra === letraProcurada) total++;
        });
        return total;
      }

      joguinhodavelha();

      if (
        isAntilinkgp &&
        isGroup &&
        isBotGroupAdmins &&
        !isGroupAdmins &&
        Procurar_String.includes("chat.whatsapp.com/")
      ) {
        if (isBot) return;
        let link_dgp;
        try {
          link_dgp = await conn?.groupInviteCode(from);
        } catch {
          link_dgp = "000000";
        }
        if (
          Procurar_String.split(" ").filter(
            (x) => x === "https://chat.whatsapp.com/",
          ).length < 2 &&
          Procurar_String.match(link_dgp)
        )
          return reply(
            "𝙇𝙞𝙣𝙠 𝙙𝙤 𝙣𝙤𝙨𝙨𝙤 𝙜𝙧𝙪𝙥𝙤, 𝙣𝙖̃𝙤 𝙞𝙧𝙚𝙞 𝙧𝙚𝙢𝙤𝙫𝙚𝙧... 𝙈𝙖𝙞𝙨 𝙩𝙖𝙧𝙙𝙚 𝙢𝙖𝙣𝙙𝙖 𝙛𝙤𝙩𝙤 𝙙𝙖 𝙧𝙖𝙗𝙖 𝙣𝙤 𝙥𝙫 𝙙𝙤 𝙗𝙤𝙩 𝙚 𝙛𝙞𝙘𝙖𝙧𝙚𝙢𝙤𝙨 𝙠𝙞𝙩𝙨 😏",
          );
        if (IS_DELETE) {
          setTimeout(() => {
            conn.sendMessage(from, {
              delete: {
                remoteJid: from,
                fromMe: false,
                id: info.key.id,
                participant: sender,
              },
            });
          }, 500);
        }
        var groupMemberIds = new Set(groupMembers.map((i) => i.id));

        if (groupMemberIds.has(sender)) {
          if (!dataGp[0]?.advlinkgp) {
            conn.groupParticipantsUpdate(from, [sender], "remove");
          } else {
            if (Advt_Linkgp === false) {
              dataGp[0].advtlinkgp = [{ id: sender, adv: 1 }];
              setGp(dataGp);
            } else if (Advt_Linkgp === null) {
              dataGp[0].advtlinkgp.push({ id: sender, adv: 1 });
              setGp(dataGp);
            } else {
              dataGp[0].advtlinkgp.find((i) => i.id === sender).adv += 1;
              setGp(dataGp);
            }
            if (Advt_Linkgp > 1) {
              reply(
                "Ei fdp, você completou 3 advertencias, enviando 3 links de grupo, então irei te passar a faca, sinto muito 😿 Só que não 😝",
              );
              dataGp[0].advtlinkgp.splice(
                dataGp[0].advtlinkgp.findIndex((i) => i.id === sender),
                1,
              );
              setGp(dataGp);
              return conn.groupParticipantsUpdate(from, [sender], "remove");
            }
            if (Advt_Linkgp !== false) {
              reply(
                `Ou viado, você enviou um link de grupo, e então foi advertido em ${dataGp[0].advtlinkgp.find((i) => i.id === sender)?.adv || 0
                }/3, não envie mais, pois se enviar vou acabar te passando a faca 😏`,
              );
            }
          }
        }
      }

      const groupIdscount = [];
      for (let obj of countMessage) {
        groupIdscount.push(obj.groupId);
      }

      //========(CONTADOR-DE-MENSAGENS)========\\ ANTNMSCVRS
      var numbersIds = [];
      if (isGroup) {
        if (groupIdscount.indexOf(from) >= 0) {
          var ind = groupIdscount.indexOf(from);
          for (let obj of countMessage[ind].numbers) {
            numbersIds.push(obj.id);
          }
          if (numbersIds.indexOf(sender) >= 0) {
            var indnum = numbersIds.indexOf(sender);
            var RSM_CN = countMessage[ind].numbers[indnum];
            type == "stickerMessage" ? "" : (RSM_CN.messages += isCmd ? 0 : 1);
            type == "stickerMessage"
              ? ""
              : (RSM_CN.cmd_messages += isCmd ? 1 : 0);
            type == "stickerMessage" ? "" : (RSM_CN.aparelho = adivinha);
            RSM_CN.nick = pushname;
            RSM_CN.figus += type == "stickerMessage" ? 1 : 0;
          } else {
            const messages = isCmd ? 0 : 1;
            const cmd_messages = isCmd ? 1 : 0;
            var figus = type == "stickerMessage" ? 1 : 0;
            countMessage[ind].numbers.push({
              id: sender,
              messages: messages,
              cmd_messages: cmd_messages,
              aparelho: adivinha,
              figus: figus,
              nick: pushname,
            });
          }
        } else {
          countMessage.push({
            groupId: from,
            numbers: [
              {
                id: sender,
                messages: 2,
                figus: 0,
                cmd_messages: isCmd ? 1 : 0,
                aparelho: adivinha,
                nick: pushname,
              },
            ],
          });
        }
        fs.writeFileSync(
          "./dados/countmsg.json",
          JSON.stringify(countMessage, null, 2) + "\n",
        );
      }

      // ═══ CAPTURA PARA SISTEMA DE RESUMO ═══
      if (isGroup && !isCmd && !info.key.fromMe && budy && budy.trim().length >= 2) {
        try { addResumoMsg(from, sender, pushname, budy); } catch { }
      }

      // ═══ SISTEMA DE QUIZ — VERIFICAR RESPOSTAS ═══
      if (isGroup && !isCmd && !info.key.fromMe && budy && temQuiz(from)) {
        try {
          const _quizResult = verificarResposta(from, budy);
          if (_quizResult) {
            // Usar sender2 (já sem LID) para exibição e sender para menção
            const _qNum = sender2;

            if (_quizResult.status === "acertou") {
              // ═══ XP ALEATÓRIO (valores altos são raros) ═══
              const _qNivel = _quizResult.nivel || 1;
              // Usa distribuição exponencial: valores baixos são comuns, altos raríssimos
              const _roll = Math.random();
              let _qXP;
              if (_qNivel === 1) {
                // Fácil: 1-5 (70%), 6-12 (25%), 13-20 (5%)
                if (_roll < 0.70) _qXP = Math.floor(Math.random() * 5) + 1;
                else if (_roll < 0.95) _qXP = Math.floor(Math.random() * 7) + 6;
                else _qXP = Math.floor(Math.random() * 8) + 13;
              } else if (_qNivel === 2) {
                // Médio: 3-10 (65%), 11-25 (28%), 26-40 (7%)
                if (_roll < 0.65) _qXP = Math.floor(Math.random() * 8) + 3;
                else if (_roll < 0.93) _qXP = Math.floor(Math.random() * 15) + 11;
                else _qXP = Math.floor(Math.random() * 15) + 26;
              } else {
                // Difícil: 5-15 (55%), 16-40 (35%), 41-70 (10%)
                if (_roll < 0.55) _qXP = Math.floor(Math.random() * 11) + 5;
                else if (_roll < 0.90) _qXP = Math.floor(Math.random() * 25) + 16;
                else _qXP = Math.floor(Math.random() * 30) + 41;
              }

              // ═══ REAGIR À MENSAGEM CORRETA ═══
              const _qReacts = ["🎉", "🏆", "✅", "🔥", "⭐", "💯", "👑", "🥇"];
              const _qReact = _qReacts[Math.floor(Math.random() * _qReacts.length)];
              await conn.sendMessage(from, { react: { text: _qReact, key: info.key } });

              try {
                const _qInd = countMessage.map(i => i.groupId).indexOf(from);
                if (_qInd >= 0) {
                  const _qNumIds = countMessage[_qInd].numbers.map(n => n.id);
                  const _qNumIdx = _qNumIds.indexOf(sender);
                  if (_qNumIdx >= 0) {
                    countMessage[_qInd].numbers[_qNumIdx].messages += _qXP;
                    countMessage[_qInd].numbers[_qNumIdx].cmd_messages += Math.floor(_qXP / 3);
                  }
                  fs.writeFileSync("./dados/countmsg.json", JSON.stringify(countMessage, null, 2) + "\n");
                }
              } catch (e) { console.log("[QUIZ-XP] Erro:", e?.message); }

              const _qNivelTxt = _qNivel === 1 ? "🟢" : _qNivel === 2 ? "🟡" : "🔴";

              await conn.sendMessage(from, {
                text: `┏━━━━━━━━━━━━━━━┓\n` +
                      `┃ 🎉 *ACERTOU!*\n` +
                      `┗━━━━━━━━━━━━━━━┛\n\n` +
                      `> 👏 Parabéns @${_qNum}!\n` +
                      `> ✅ Resposta: *${_quizResult.resposta}*\n` +
                      `> 🎯 Em *${_quizResult.tentativas}* tentativa(s)\n` +
                      `> ${_qNivelTxt} *+${_qXP} XP* adicionado ao perfil!\n\n` +
                      `> ⏳ Próximo quiz em *5 segundos*...`,
                mentions: [sender],
              }, { quoted: info });

              // ═══ AUTO PRÓXIMO QUIZ (5s delay) ═══
              setTimeout(async () => {
                try {
                  if (temQuiz(from)) return;
                  await conn.sendMessage(from, { text: "🔄 *Buscando próximo quiz...*" });
                  const _autoQuiz = await iniciarQuiz(from);
                  if (!_autoQuiz) return;
                  const _autoSrc = _autoQuiz.thumbnailUrl || _autoQuiz.wiki;
                  const _autoImg = await buscarImagem(_autoSrc, _autoQuiz.categoria);
                  const _autoNivel = _autoQuiz.nivelGrupo === 1 ? "🟢 Fácil" : _autoQuiz.nivelGrupo === 2 ? "🟡 Médio" : "🔴 Difícil";
                  const _autoTxt =
                    `┏━━━━━━━━━━━━━━━┓\n` +
                    `┃ ${_autoQuiz.categoria} *QUIZ*\n` +
                    `┗━━━━━━━━━━━━━━━┛\n\n` +
                    `> 💡 Dica: _${_autoQuiz.dica}_\n` +
                    `> 📊 Nível: *${_autoNivel}*\n\n` +
                    `> 🎯 *Quem é / O que é?*\n` +
                    `> Responda no chat!\n` +
                    `> ⏱ Tempo: *5 minutos*\n` +
                    `> ⚡ XP aleatório para quem acertar!\n` +
                    `> 🛑 *${prefix}cancelarquiz* para parar`;
                  if (_autoImg) {
                    await conn.sendMessage(from, { image: _autoImg, caption: _autoTxt });
                  } else {
                    await conn.sendMessage(from, { text: _autoTxt + `\n\n> ⚠️ _Imagem indisponível_` });
                  }
                } catch (e) { console.log("[QUIZ-AUTO]", e?.message); }
              }, 5000);

            } else if (_quizResult.status === "quase") {
              await conn.sendMessage(from, {
                text: `🔥 *Quase lááá!* Tá pertinho, tenta de novo!`,
              }, { quoted: info });
            } else if (_quizResult.status === "longe") {
              await conn.sendMessage(from, {
                text: `❌ *Passou longe!* Tenta outra vez...`,
              }, { quoted: info });
            } else if (_quizResult.status === "timeout") {
              await conn.sendMessage(from, {
                text: `⏰ *Tempo esgotado!*\n\n> A resposta era: *${_quizResult.resposta}*\n> O quiz foi encerrado automaticamente.`,
              });
            } else if (_quizResult.status === "esgotou") {
              await conn.sendMessage(from, {
                text: `😞 *Ninguém acertou!*\n\n> A resposta era: *${_quizResult.resposta}*\n> Use *${prefix}quiz* para uma nova rodada!`,
              });
            }
          }
        } catch (e) { console.log("[QUIZ] Erro:", e?.message); }
      }

      //============(EVAL-EXECUÇÕES)===========\\

      if (budy.startsWith(">")) {
        try {
          if (info.key.fromMe) return;
          if (!SoDono && !isnit && !issupre && !ischyt && !issupre) return;
          console.log(
            "[",
            colors.cyan("EVAL"),
            "]",
            colors.yellow(
              moment(info.messageTimestamp * 1000).format("DD/MM HH:mm:ss"),
            ),
            colors.green(budy),
          );
          return conn
            .sendMessage(from, {
              text: JSON.stringify(eval(budy.slice(2)), null, "\t"),
            })
            .catch((e) => {
              return reply(String(e));
            });
        } catch (e) {
          return reply(String(e));
        }
      }

      if (budy.startsWith("(>")) {
        try {
          if (info.key.fromMe) return;
          if (!SoDono && !isnit && !issupre && !ischyt && !issupre && !ischyt)
            return;
          var konsol = budy.slice(3);
          Return = (sul) => {
            var sat = JSON.stringify(sul, null, 2);
            bang = util.format(sat);
            if (sat == undefined) {
              bang = util.format(sul);
            }
            return conn.sendMessage(from, { text: bang }, { quoted: info });
          };

          conn
            .sendMessage(from, {
              text: util.format(eval(`;(async () => { ${konsol} })()`)),
            })
            .catch((e) => {
              return reply(String(e));
            });
          console.log(
            "\x1b[1;37m>",
            "[",
            "\x1b[1;32mEXEC\x1b[1;37m",
            "]",
            time,
            colors.green(">"),
            "from",
            colors.green(sender.split("@")[0]),
            "args :",
            colors.green(args.length),
          );
        } catch (e) {
          reply(String(e));
          return console.log(e);
        }
      }

      if (body.startsWith("$")) {
        if (info.key.fromMe) return;
        if (!SoDono && !isnit) return;
        exec(q, (err, stdout) => {
          if (err) return reply(`${err}`);
          if (stdout) {
            reply(stdout);
          }
        });
      }

      //======================================\\

      //======(ANTI-IMAGEM)========\\
      if (isAntiImg && isBotGroupAdmins && type == "imageMessage") {
        if (info.key.fromMe) return;
        if (isGroupAdmins)
          return conn.sendMessage(from, { text: "👀" }, { quoted: info });
        conn.sendMessage(
          from,
          {
            text: "🤺_𝘼𝙦𝙪𝙞 𝙣𝙖‌𝙤 𝙥𝙤𝙙𝙚 𝙢𝙖𝙣𝙙𝙖𝙧 ~(𝗜𝗠𝗔𝗚𝗘𝗠)~ 𝙍𝙚𝙩𝙖𝙧𝙙𝙖𝙙𝙤 𝙣𝙖‌𝙤 𝙡𝙚𝙪 𝙖𝙨 𝙍𝙚𝙜𝙧𝙖𝙨❗️",
          },
          { quoted: info },
        );
        if (IS_DELETE) {
          setTimeout(() => {
            conn.sendMessage(from, {
              delete: {
                remoteJid: from,
                fromMe: false,
                id: info.key.id,
                participant: sender,
              },
            });
          }, 500);
        }
        if (!JSON.stringify(groupMembers).includes(sender)) return;
        conn.groupParticipantsUpdate(from, [sender], "remove");
      }

      //======(ANTI-STICKER)========\\
      if (isAntiSticker && isBotGroupAdmins && type == "stickerMessage") {
        if (info.key.fromMe) return;
        if (isGroupAdmins)
          return conn.sendMessage(from, { text: "👀" }, { quoted: info });
        conn.sendMessage(
          from,
          {
            text: "🤺_𝘼𝙦𝙪𝙞 𝙣𝙖‌𝙤 𝙥𝙤𝙙𝙚 𝙢𝙖𝙣𝙙𝙖𝙧 ~(𝗙𝗜𝗚𝗨𝗥𝗜𝗡𝗛𝗔)~ 𝙣𝙖‌𝙤 𝙡𝙚𝙪 𝙖𝙨 𝙍𝙚𝙜𝙧𝙖𝙨 🤔",
          },
          { quoted: info },
        );
        if (IS_DELETE) {
          setTimeout(() => {
            conn.sendMessage(from, {
              delete: {
                remoteJid: from,
                fromMe: false,
                id: info.key.id,
                participant: sender,
              },
            });
          }, 500);
        }
        if (!JSON.stringify(groupMembers).includes(sender)) return;
        conn.groupParticipantsUpdate(from, [sender], "remove");
      }

      if (
        Antidoc &&
        isBotGroupAdmins &&
        !isGroupAdmins &&
        type == "documentMessage"
      ) {
        if (info.key.fromMe) return;
        if (dataGp[0].legenda_documento != "0") {
          conn.sendMessage(
            from,
            { text: dataGp[0].legenda_documento },
            { quoted: info },
          );
        }
        if (IS_DELETE) {
          setTimeout(() => {
            conn.sendMessage(from, {
              delete: {
                remoteJid: from,
                fromMe: false,
                id: info.key.id,
                participant: sender,
              },
            });
          }, 500);
        }
        if (!JSON.stringify(groupMembers).includes(sender)) return;
        conn.groupParticipantsUpdate(from, [sender], "remove");
      }

      let isTrueFalse = [
        "tiktok",
        "face_audio",
        "tiktok_audio",
        "facebook",
        "instagram",
        "insta_audio",
        "twitter",
        "twitter_audio",
        "ytmp3",
        "ytmp4",
        "play",
        "play_audio",
        "play_video",
        "play",
      ].some((item) => item === command);

      if (
        isUrl(Procurar_String) &&
        isAntiLinkHard &&
        !isGroupAdmins &&
        isBotGroupAdmins &&
        !info.key.fromMe &&
        !isTrueFalse
      ) {
        if (Procurar_String.includes("chat.whatsapp.com")) {
          var link_dgp = await conn?.groupInviteCode(from);
          if (
            link_dgp &&
            Procurar_String.match(link_dgp) &&
            Procurar_String.split(" ").filter(
              (x) => x === "https://chat.whatsapp.com/",
            ).length < 2
          ) {
            return reply(
              "𝙇𝙞𝙣𝙠 𝙙𝙤 𝙣𝙤𝙨𝙨𝙤 𝙜𝙧𝙪𝙥𝙤, 𝙣𝙖̃𝙤 𝙞𝙧𝙚𝙞 𝙧𝙚𝙢𝙤𝙫𝙚𝙧... 𝙈𝙖𝙞𝙨 𝙩𝙖𝙧𝙙𝙚 𝙢𝙖𝙣𝙙𝙖 𝙛𝙤𝙩𝙤 𝙙𝙖 𝙧𝙖𝙗𝙖 𝙣𝙤 𝙥𝙫 𝙙𝙤 𝙗𝙤𝙩 𝙚 𝙛𝙞𝙘𝙖𝙧𝙚𝙢𝙤𝙨 𝙠𝙞𝙩𝙨 😏",
            );
          }
        }

        var groupMemberIds = new Set(groupMembers.map((i) => i.id));

        if (groupMemberIds.has(sender)) {
          if (!dataGp[0]?.advlink) {
            if (
              TEXTOS_GERAL?.TEXTO_REMOCAO_ANTI_LINK &&
              TEXTOS_GERAL?.TEXTO_REMOCAO_ANTI_LINK !== "0"
            ) {
              conn.sendMessage(from, {
                text: TEXTOS_GERAL?.TEXTO_REMOCAO_ANTI_LINK.replaceAll(
                  "#usuario#",
                  "@" + sender.split("@")[0],
                ),
                mentions: [sender],
              });
            }
            conn.groupParticipantsUpdate(from, [sender], "remove");
          } else {
            if (Advt_Link === false) {
              dataGp[0].advtlink = [{ id: sender, adv: 1 }];
              setGp(dataGp);
            } else if (Advt_Link === null) {
              dataGp[0].advtlink.push({ id: sender, adv: 1 });
              setGp(dataGp);
            } else {
              dataGp[0].advtlink.find((i) => i.id === sender).adv += 1;
              setGp(dataGp);
            }
            if (Advt_Link > 1) {
              reply(
                "Ei fdp, você completou 3 advertencias, enviando 3 links de grupo, então irei te passar a faca, sinto muito 😿 Só que não 😝",
              );
              dataGp[0].advtlink.splice(
                dataGp[0].advtlink.findIndex((i) => i.id === sender),
                1,
              );
              setGp(dataGp);
              return conn.groupParticipantsUpdate(from, [sender], "remove");
            }
            if (Advt_Link !== false) {
              reply(
                `Ou fdp, você enviou um link, e então foi advertido em ${dataGp[0].advtlink.find((i) => i.id === sender)?.adv || 0
                }/3, não envie mais, pois se enviar vou acabar te passando a faca 😏`,
              );
            }
          }
        }

        OSINF_K.push(info.key.id);
        conn.groupSettingUpdate(from, "announcement");
        setTimeout(() => {
          conn.groupSettingUpdate(from, "not_announcement");
        }, 1500);

        setTimeout(async () => {
          for (var i of OSINF_K) {
            conn.sendMessage(from, {
              delete: {
                remoteJid: from,
                fromMe: false,
                id: i,
                participant: sender,
              },
            });
            OSINF_K = [];
          }
        }, 500);
      }

      //FINALZIN ==============================>

      //======(ANTI-LINK2 — APAGAR + AVISAR ADMs)========\\
      if (
        isAntilink2 &&
        isGroup &&
        isBotGroupAdmins &&
        !isGroupAdmins &&
        !SoDono &&
        !info.key.fromMe
      ) {
        // Verificar se a mensagem contém link (qualquer tipo)
        const _al2Text = Procurar_String || body || "";
        const _al2HasLink = isUrl(_al2Text) ||
          _al2Text.includes("chat.whatsapp.com/") ||
          _al2Text.includes("wa.me/") ||
          _al2Text.includes("http://") ||
          _al2Text.includes("https://");

        if (_al2HasLink) {
          // Verificar se é o link do próprio grupo (permitir)
          let _al2IsOwnLink = false;
          try {
            const _al2GpCode = await conn.groupInviteCode(from);
            if (_al2GpCode && _al2Text.includes(_al2GpCode)) {
              _al2IsOwnLink = true;
            }
          } catch { }

          if (!_al2IsOwnLink) {
            // 1. DELETAR a mensagem com link
            try {
              await conn.sendMessage(from, {
                delete: {
                  remoteJid: from,
                  fromMe: false,
                  id: info.key.id,
                  participant: info.key.participant,
                },
              });
            } catch {
              try {
                await conn.sendMessage(from, { delete: info.key });
              } catch { }
            }

            // 2. AVISAR ADMs do grupo
            let _al2Admins = [];
            try {
              _al2Admins = groupMembers
                .filter((p) => p.admin)
                .map((p) => p.id);
            } catch { }

            const _al2SenderNum = sender.split("@")[0];
            const _al2Mentions = [sender, ..._al2Admins];

            try {
              await conn.sendMessage(
                from,
                {
                  text: `⚠️ *ANTI-LINK* — Mensagem apagada!\n\n👤 O membro @${_al2SenderNum} enviou um *link* no grupo.\n\n📢 ADMs notificados.`,
                  mentions: _al2Mentions,
                },
                { quoted: info },
              );
            } catch { }
          }
        }
      }

      //======(ANTI-VIDEO)========\\

      if (
        isAntiVid &&
        isBotGroupAdmins &&
        !isGroupAdmins &&
        type == "videoMessage"
      ) {
        if (info.key.fromMe) return;
        if (isGroupAdmins)
          return conn.sendMessage(from, { text: "👀" }, { quoted: info });
        conn.sendMessage(
          from,
          {
            text: "🤺_𝘼𝙦𝙪𝙞 𝙣𝙖‌𝙤 𝙥𝙤𝙙𝙚 𝙢𝙖𝙣𝙙𝙖𝙧 ~(𝗩𝗜́𝗗𝗘𝗢)~ 𝙍𝙚𝙩𝙖𝙧𝙙𝙖𝙙𝙤 𝙣𝙖‌𝙤 𝙡𝙚𝙪 𝙖𝙨 𝙍𝙚𝙜𝙧𝙖𝙨❗",
          },
          { quoted: info },
        );
        if (IS_DELETE) {
          setTimeout(() => {
            conn.sendMessage(from, {
              delete: {
                remoteJid: from,
                fromMe: false,
                id: info.key.id,
                participant: sender,
              },
            });
          }, 500);
        }
        if (!JSON.stringify(groupMembers).includes(sender)) return;
        conn.groupParticipantsUpdate(from, [sender], "remove");
      }

      //======(ANTI-AUDIO)=======\\
      if (
        isAntiAudio &&
        isBotGroupAdmins &&
        !isGroupAdmins &&
        type == "audioMessage"
      ) {
        if (info.key.fromMe) return;
        if (isGroupAdmins)
          return conn.sendMessage(from, { text: "👀" }, { quoted: info });
        conn.sendMessage(
          from,
          {
            text: "🤺_𝘼𝙦𝙪𝙞 𝙣𝙖‌𝙤 𝙥𝙤𝙙𝙚 𝙢𝙖𝙣𝙙𝙖𝙧 ~(𝗔𝗨𝗗𝗜𝗢)~ 𝙍𝙚𝙩𝙖𝙧𝙙𝙖𝙙𝙤 𝙣𝙖‌𝙤 𝙡𝙚𝙪 𝙖𝙨 𝙍𝙚𝙜𝙧𝙖𝙨❗",
          },
          { quoted: info },
        );
        if (IS_DELETE) {
          setTimeout(() => {
            conn.sendMessage(from, {
              delete: {
                remoteJid: from,
                fromMe: false,
                id: info.key.id,
                participant: sender,
              },
            });
          }, 500);
        }
        if (!JSON.stringify(groupMembers).includes(sender)) return;
        conn.groupParticipantsUpdate(from, [sender], "remove");
      }

      //========(ANTI-PV-QUE-BLOQUEIA)======\\
      // Comandos de registro são permitidos mesmo com antipv ativo
      const _cmdRegistro = ["registrar", "registro", "cadastrar", "cancelar"];
      const _isRegistroCmd = isCmd && _cmdRegistro.includes(command);
      // Usuário no meio do fluxo de registro (respondendo perguntas)
      const _isRegistrando = !isGroup && getRegistroState(sender) !== null;
      const _isAluguelFlow = !isGroup && getAluguelState(sender) !== null;

      var BLC_CL = [];
      if (isAntiPv && !BLC_CL.includes(sender)) {
        if (
          !isGroup &&
          !SoDono &&
          !isnit &&
          !isPremium &&
          !_isRegistroCmd &&
          !_isRegistrando &&
          !_isAluguelFlow
        ) {
          await sleep(2500);
          reply(msgantipv1);
          setTimeout(async () => {
            conn.updateBlockStatus(sender, "block");
          }, 2000);
          return;
        }
        BLC_CL.push(sender);
      }

      //======================================\\

      function sendAlert() {
        var hora_ = moment.tz("America/Sao_Paulo").format("HH:mm");
        var hora_2 = moment.tz("America/Sao_Paulo").format("mm");
        var dataAtual = moment.tz("America/Sao_Paulo").format("YYYY-MM-DD");

        var blu_dc = black_.some((i) => i.hora === hora_);
        if (blu_dc) {
          let ik = black_.find((i) => i.hora === hora_);
          for (let i of ik?.PUXAR) {
            if (i.avisou === dataAtual) return;
            if (i.length === 0) return;
            conn.sendMessage(i.idgp, { text: i.msg });
            i.avisou = dataAtual;
            fs.writeFileSync(
              "./dados/global/AVISOS.json",
              JSON.stringify(black_, null, 2),
            );
          }
        }

        var ik_r = black_.some(
          (i) => hora_2 >= parseInt(i.hora.split(":")[1]) + 1,
        );
        if (ik_r) {
          let ik2 = black_.find(
            (i) => hora_2 >= parseInt(i.hora.split(":")[1]) + 1,
          );
          for (let i of ik2.PUXAR) {
            if (i.avisou && i.avisou !== dataAtual) {
              fs.writeFileSync(
                "./dados/global/AVISOS.json",
                JSON.stringify(black_, null, 2),
              );
            }
          }
        }
        setTimeout(sendAlert, 60000);
      }

      sendAlert();

      //=========(ANTIPV-QUE-SÓ-FALA)==========\\

      if (
        !isGroup &&
        !isPremium &&
        !SoDono &&
        !isnit &&
        !issupre &&
        !ischyt &&
        !info.key.fromMe &&
        isAntiPv2 &&
        !MSG_ANTPV2.includes(sender) &&
        !_isRegistroCmd &&
        !_isRegistrando &&
        !_isAluguelFlow
      ) {
        MSG_ANTPV2.push(sender);
        return reply(msgantipv2);
      }

      //======================================\\

      // ANTI PV QUE IGNORA
      if (
        !isGroup &&
        !isPremium &&
        !SoDono &&
        !info.key.fromMe &&
        isAntiPv3 &&
        !_isRegistroCmd &&
        !_isRegistrando &&
        !_isAluguelFlow
      ) {
        return;
      }

      // ANTI_LIGAR \\
      if (!isGroup && isAnticall && !BLC_ANTCL.includes(sender)) {
        conn.ws.on("CB:call", async (B) => {
          if (B.content[0].tag == "offer") {
            conn
              .sendMessage(B.content[0].attrs["call-creator"], {
                text: "_- 🫵🏻 Ô filho da puta não liga pro bot, tá vendo que é um robô 🤦🏻‍♂️ - _\n\n Tá carente caralho, vai ser bloqueado seu lixo desgraçado tmnc 🤬\n\n_- 🖕🏿🖕🏿🖕🏿🖕🏿🖕🏿🖕🏿 _-",
              })
              .then(() => {
                conn.updateBlockStatus(
                  B.content[0].attrs["call-creator"],
                  "block",
                );
              });
          }
        });
        BLC_ANTCL.push(sender);
      }

      //======================================\\ ANTNMSCVRS

      // X9 Visualização Única - Apenas em grupos
      if (isGroup && isX9VisuUnica) {
        if (
          info.message?.viewOnceMessageV2 ||
          info.message?.viewOnceMessage ||
          type === "viewOnceMessage" ||
          type === "viewOnceMessageV2"
        ) {
          try {
            var Fl = info?.message;
            var Dfn =
              Fl?.viewOnceMessage?.message?.imageMessage ||
              Fl?.viewOnceMessageV2?.message?.imageMessage ||
              Fl?.viewOnceMessage?.message?.videoMessage ||
              Fl?.viewOnceMessageV2?.message?.videoMessage;

            if (!Dfn) {
              console.log("[X9 VisuUnica] Mensagem viewOnce não encontrada");
            } else {
              console.log("[X9 VisuUnica] Processando visualização única...");

              // Determinar tipo de mídia
              const mediaType = Dfn.mimetype?.split("/")[0] || "image";
              console.log("[X9 VisuUnica] Tipo de mídia:", mediaType);

              // Usar downloadContentFromMessage do Baileys
              const stream = await downloadContentFromMessage(Dfn, mediaType);

              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }

              console.log("[X9 VisuUnica] Download completo, enviando...");

              // Enviar a mídia revelada
              await conn.sendMessage(from, {
                [mediaType]: buffer,
                mimetype: Dfn.mimetype,
                caption: Dfn?.caption
                  ? `🔓 *Visualização Única Revelada*\n\n📝 Legenda: ${Dfn.caption}\n\n😏 Tu queria mandar isso em visu-única... se fudeu! 🖕🏿😝`
                  : "🔓 *Visualização Única Revelada*\n\n😏 Tu queria mandar isso em visu-única... se fudeu! 🖕🏿😝",
              });

              console.log("[X9 VisuUnica] Enviado com sucesso!");
            }
          } catch (error) {
            console.error("[X9 VisuUnica] Erro ao processar:", error);
            reply("❌ Erro ao revelar visualização única.");
          }
        }
      }

      /////\\\\\\//////\\\\\\////\\\\////\\\///\\\///\\\\

      if (isBanned) return;

      var palavrasfr = JSON.parse(
        fs.readFileSync("./dados/global/palavras_forca.json"),
      );

      var palavrasfrc =
        palavrasfr[Math.floor(Math.random() * palavrasfr.length)];

      var ALT_FR = palavrasfrc?.plvr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      async function rv_forca() {
        var blue = [];
        for (var i = 0; i < ALT_FR.length; i++) {
          if (ALT_FR[i] == " ") {
            blue.push(" ");
          } else {
            blue.push("_");
          }
        }
        dataGp[0].forca_ofc = [
          {
            acertos: 0,
            erros: 0,
            palavra: blue,
            escreveu: [],
            palavra_ofc: ALT_FR,
            dica: palavrasfrc.dica,
            tema: palavrasfrc.tema,
          },
        ];
        dataGp[0].forca_inc = false;
        setGp(dataGp);
      }

      if (
        isGroup &&
        (nescessario?.isRecolherLink || isRecolherlinksgp) &&
        budy.includes("https://chat.whatsapp.com")
      ) {
        var L_WTS = "https://chat.whatsapp.com/";

        for (var i = 1; i < body.split(L_WTS).length; i++) {
          if (
            !JSON.stringify(recolherLNK.map((i) => i.Link)).includes(
              L_WTS + body.split(L_WTS)[i].slice(0, 22),
            )
          )
            recolherLNK.push({
              Link: L_WTS + body.split(L_WTS)[i].slice(0, 22),
            });
        }
        fs.writeFileSync(
          "./dados/org/funcoes/recolherLNK.json",
          JSON.stringify(recolherLNK, null, 2),
        );
      }

      if (!isPremium && nescessario.cmdpremium.includes(command))
        return reply(`Este comando é apenas para
usuário premium, se deseja adquirir, fale com meu dono:
https://wa.me/${numerodono_ofc}`);

      // PRA LIMPAR DO CONTADOR QUEM NÃO ESTÁ NO GRUPO
      async function LIMPARDOCNT_QUEMJASAIU() {
        var RD_CNT =
          countMessage[countMessage.map((i) => i.groupId).indexOf(from)]
            .numbers;
        CNT1 = [];
        for (i of groupMembers) {
          CNT1.push(i.id);
        }
        CNT = [];
        for (i of RD_CNT) {
          if (!CNT1.includes(i.id)) CNT.push(i);
        }
        for (i of CNT) {
          RD_CNT.splice(RD_CNT.map((i) => i.id).indexOf(i.id), 1);
        }
        fs.writeFileSync(
          "./dados/countmsg.json",
          JSON.stringify(countMessage, null, 2),
        );

        if (IS_sistemGold) {
          let BLUE = [];
          rggold[ID_G_GOLD].usus.map((ab) => {
            if (!groupMembers.map((i) => i.id).includes(ab.id))
              BLUE.push(ab.id);
          });

          BLUE.forEach(function (a) {
            rggold[ID_G_GOLD].usus.splice(
              rggold[ID_G_GOLD].usus.findIndex((i) => i.id === a),
              1,
            );
          });
          Goldrgs(rggold);
        }
      }

      // Verificação de aluguel removida: movida para o scheduler em dados/org/funcoes/aluguel.js

      if (
        isGroup &&
        isCmd &&
        !isGroupAdmins &&
        !SoDono &&
        !isPremium &&
        dataGp[0]?.Limitar_CMD
      ) {
        var TEMPO_A = Math.floor(Date.now() / 1000);

        var ID_G = Limit_CMD.findIndex((i) => i.idgp === from);
        var ID_U = Limit_CMD[ID_G]?.ids.findIndex((i) => i.id === sender);

        if (
          !JSON.stringify(Limit_CMD).includes(from) ||
          (ID_G < 0 && ID_U < 0)
        ) {
          Limit_CMD.push({ idgp: from, ids: [{ id: sender, tempo: TEMPO_A }] });
          fs.writeFileSync(
            "./dados/global/limitarcmd.json",
            JSON.stringify(Limit_CMD, null, 2),
          );
        } else if (ID_G >= 0 && ID_U < 0) {
          Limit_CMD[ID_G].ids.push({ id: sender, tempo: TEMPO_A });
          fs.writeFileSync(
            "./dados/global/limitarcmd.json",
            JSON.stringify(Limit_CMD, null, 2),
          );
        }

        if (ID_G >= 0 && ID_U >= 0) {
          var TEMPO_D = Limit_CMD[ID_G].ids[ID_U].tempo;

          var TEMPO_M = TEMPO_A - TEMPO_D;

          var TEMPO_D2 = parseInt(dataGp[0]?.Limit_tempo) || 60;

          if (TEMPO_M < TEMPO_D2) {
            return reply(
              nescessario.TEMPO_DE_CMD.replaceAll(
                "#tempocmd#",
                kyun(TEMPO_M),
              ).replaceAll("#tempo#", TEMPO_D2),
            );
          } else {
            Limit_CMD[ID_G].ids[ID_U].tempo = TEMPO_A;
            fs.writeFileSync(
              "./dados/global/limitarcmd.json",
              JSON.stringify(Limit_CMD, null, 2),
            );
          }
        }
      }

      if (
        IS_sistemGold &&
        !info.key.fromMe &&
        isGroup &&
        isBotGroupAdmins &&
        isCmd &&
        dataGp[0]?.comandos_gold?.length >= 1 &&
        dataGp[0].comandos_gold.some((i) => i.comando === command)
      ) {
        var Df_C =
          dataGp[0].comandos_gold[
          dataGp[0].comandos_gold.findIndex((i) => i.comando === command)
          ];
        if (S_Sistema.RS(sender, "Golds") < Df_C.gold)
          return reply(
            "Você não tem Golds suficiente para utilizar este comando 🥱",
          );
        setTimeout(() => {
          S_Sistema.RM(sender, Df_C.gold);

          mention(
            `${tempo} @${sender2} após o uso do comando ${Df_C.comando
            } foi consumido ${Df_C.gold} Golds dos seus > ${parseInt(S_Sistema.RS(sender, "Golds")) + parseInt(Df_C.gold)
            } Golds`,
          );
        }, 500);
      }

      if (
        premium.length > 0 &&
        premium.map(
          (tm_) => Math.floor(tm_.tempo) < Math.floor(Date.now() / 1000),
        )
      ) {
        premium.map((us) => {
          if (Math.floor(us.tempo) < Math.floor(Date.now() / 1000)) {
            premium.splice(premium.map((i) => i.usus).indexOf(us.usus), 1);
            conn.sendMessage(nmrdn_dono2, {
              text: `Premium do usuário: wa.me/${us.usus.split("@")[0]
                }, expirou.`,
            });
          }
        });
        fs.writeFileSync(
          "./dados/global/premium.json",
          JSON.stringify(premium, null, 2),
        );
      }

      const Os_Returns = (A, B, C) => {
        if (A && !isGroup) return { true: true, txt: Res_SoGrupo };
        if (B && !isGroupAdmins) return { true: true, txt: Res_SoAdm };
        if (C && !isBotGroupAdmins) return { true: true, txt: Res_BotADM };
        return { true: false };
      };

      // (Bloco duplicado de mute removido — gerenciado no bloco abaixo)

      // ═══════ INTERCEPTOR DE FLUXOS (State Machine) ═══════
      // IMPORTANTE: Roda ANTES do switch de comandos para capturar
      //             respostas de texto E comandos durante fluxos ativos
      if (!isGroup) {
        // ═══════ ANTI-FLOOD PV — DETECÇÃO DE FLOOD DE COMANDOS NO PRIVADO ═══════
        // Monitora apenas COMANDOS (não interfere com respostas de fluxos).
        // Dono e bot são isentos. SEGURANÇA: try-catch total.
        try {
          const _afIsBotMsg = info.key.fromMe || sender === botJid || sender === botLid;
          if (!SoDono && !_afIsBotMsg) {
            const _afKey = sender;
            const _afNow = Date.now();

            // Verificar se o usuário está bloqueado por flood
            const _afBlockedAt = _pvFloodBlocked.get(_afKey);
            if (_afBlockedAt && (_afNow - _afBlockedAt < PV_FLOOD_BLOCK_TIME)) {
              // Ainda bloqueado — ignorar silenciosamente
              if (isCmd) return;
              // Permitir respostas de texto (para fluxos ativos como registro)
            } else {
              if (_afBlockedAt) {
                // Bloqueio expirou — limpar
                _pvFloodBlocked.delete(_afKey);
                _pvFloodTracker.delete(_afKey);
              }

              // Rastrear apenas COMANDOS (mensagens com prefixo)
              if (isCmd) {
                if (!_pvFloodTracker.has(_afKey)) _pvFloodTracker.set(_afKey, []);
                const _afMsgs = _pvFloodTracker.get(_afKey);
                _afMsgs.push(_afNow);
                const _afRecent = _afMsgs.filter(t => _afNow - t < PV_FLOOD_WINDOW);
                _pvFloodTracker.set(_afKey, _afRecent);

                // FLOOD DETECTADO! (3 comandos em 10 segundos)
                if (_afRecent.length >= PV_FLOOD_LIMIT) {
                  _pvFloodTracker.set(_afKey, []);
                  _pvFloodBlocked.set(_afKey, _afNow);

                  try {
                    await conn.sendMessage(from, {
                      text: `> ⚠️ *ANTI-FLOOD*\n\n> 🚫 Você enviou muitos comandos em poucos segundos!\n\n> 🔇 O bot ficará em modo espera por *1 minuto*.\n> ⏰ Tente novamente após esse período.\n\n> ❗ *Não faça flood no bot, caso continue, irei bloquear!*`,
                    });
                  } catch { }
                  return;
                }
              }
            }
          }
        } catch { }
        // ═══════════════ FIM ANTI-FLOOD PV ═══════════════

        const _senderNorm = normalizeJid(sender);
        const _donoJid = numerodono_ofc + "@s.whatsapp.net";

        // ── Anti-flood: cooldown de 30s para respostas de erro/aviso nos fluxos ──
        if (!global._flowCooldowns) global._flowCooldowns = new Map();
        const _FLOW_COOLDOWN_MS = 30000; // 30 segundos
        function _canReplyFlow(userId, flowType) {
          const key = `${userId}_${flowType}`;
          const last = global._flowCooldowns.get(key) || 0;
          if (Date.now() - last < _FLOW_COOLDOWN_MS) return false;
          global._flowCooldowns.set(key, Date.now());
          return true;
        }

        // ── INTERCEPTOR DE ALUGUEL ──
        // Tentar encontrar o estado: primeiro pelo sender, depois pelo JID do dono
        let _alugJid = null;
        let _alugState = getAluguelState(_senderNorm);
        if (_alugState) {
          _alugJid = _senderNorm;
        } else if (_senderNorm !== _donoJid) {
          _alugState = getAluguelState(_donoJid);
          if (_alugState) _alugJid = _donoJid;
        }
        // Também tentar com sender bruto se for diferente
        if (!_alugState && sender !== _senderNorm) {
          _alugState = getAluguelState(sender);
          if (_alugState) _alugJid = sender;
        }

        if (_alugState && SoDono) {
          const _bodyTrim = body.trim();
          const _bodyLower = _bodyTrim.toLowerCase();

          // Cancelamento - aceitar "cancelar", "!cancelar", "cancel"
          if (
            _bodyLower === "cancelar" ||
            _bodyLower === "cancel" ||
            (isCmd && command === "cancelar")
          ) {
            clearAluguelState(_alugJid);
            reply(
              "❌ Contrato cancelado com sucesso!\n\n💡 Use *!alugarbot* para iniciar um novo.",
            );
            return;
          }

          // Se é um comando (ex: !alugarbot, !menu), avisar que tá no fluxo
          if (isCmd) {
            if (_canReplyFlow(sender, "alug_cmd"))
              reply(
                `⚠️ Você está no meio de um *contrato de aluguel* (etapa: *${_alugState.step}*).\n\n💡 Responda à pergunta atual ou envie *cancelar* para sair do fluxo.`,
              );
            return;
          }

          // Processar resposta normal
          const resAlug = processarRespostaAluguel(_alugJid, _bodyTrim);
          if (resAlug.error) {
            // Resposta inválida - orientar o usuário (com cooldown anti-flood)
            if (_canReplyFlow(sender, "alug_err")) {
              if (resAlug.image) {
                try {
                  await conn.sendMessage(from, {
                    image: { url: resAlug.image },
                    caption: resAlug.msg,
                  });
                } catch {
                  reply(resAlug.msg);
                }
              } else {
                reply(resAlug.msg);
              }
            }
            return;
          }
          if (resAlug.cancelled) {
            reply(resAlug.msg);
            return;
          }
          if (resAlug.done && resAlug.confirmed) {
            // Contrato confirmado! Registrar no sistema
            const d = resAlug.data;
            try {
              const contrato = adicionarContrato({
                id_gp: d.id_gp || "",
                nome_: d.nome_grupo,
                link: d.link_grupo || "",
                responsavel_nome: d.responsavel_nome,
                responsavel_contato: d.responsavel_contato,
                plano_dias: d.dias,
                valor: d.valor,
                cadastrado_por: `${pushname} (${sender.split("@")[0]})`,
              });

              const _contratoTxt = `│\n│  ✅ *CONTRATO REGISTRADO*\n├──────────────\n│\n${formatarContrato(contrato)}`;

              // Enviar confirmação com imagem
              try {
                await conn.sendMessage(from, {
                  image: {
                    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
                  },
                  caption: _contratoTxt,
                });
              } catch {
                reply(_contratoTxt);
              }

              // Avisar no grupo se tiver ID
              if (d.id_gp && d.id_gp.endsWith("@g.us")) {
                const dataVencF = moment
                  .unix(contrato.vencimento)
                  .tz("America/Sao_Paulo")
                  .format("DD/MM/YYYY [às] HH:mm");
                try {
                  await conn.sendMessage(d.id_gp, {
                    image: {
                      url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
                    },
                    caption: `│\n│  ✅ *GRUPO ALUGADO!*\n├──────────────\n│\n│  🏘️ *${d.nome_grupo}*\n│  📆 Plano: ${d.dias} dia(s)\n│  📅 Vence: ${dataVencF}\n│\n│  🤖 Bot ativo *24h* neste grupo!\n│  📞 Dúvidas: wa.me/${numerodono_ofc}\n├──────────────\n│  🚀 _Bom uso!_`,
                  });
                } catch { }
              }
            } catch (e) {
              reply(`❌ Erro ao cadastrar: ${e.message}`);
            }
            return;
          }
          // Próximo prompt (com imagem)
          if (resAlug.image) {
            try {
              await conn.sendMessage(from, {
                image: { url: resAlug.image },
                caption: resAlug.msg,
              });
            } catch {
              reply(resAlug.msg);
            }
          } else {
            reply(resAlug.msg);
          }
          return;
        }

        // ── INTERCEPTOR DE RENOVAÇÃO DE ALUGUEL ──
        let _renovJid = null;
        let _renovState = getRenovacaoState(_senderNorm);
        if (_renovState) {
          _renovJid = _senderNorm;
        } else if (_senderNorm !== _donoJid) {
          _renovState = getRenovacaoState(_donoJid);
          if (_renovState) _renovJid = _donoJid;
        }
        if (!_renovState && sender !== _senderNorm) {
          _renovState = getRenovacaoState(sender);
          if (_renovState) _renovJid = sender;
        }

        if (_renovState && SoDono) {
          const _bodyTrim = body.trim();
          const _bodyLower = _bodyTrim.toLowerCase();

          // Cancelamento
          if (
            _bodyLower === "cancelar" ||
            _bodyLower === "cancel" ||
            (isCmd && command === "cancelar")
          ) {
            clearRenovacaoState(_renovJid);
            reply(
              "❌ Renovação cancelada!\n\n💡 Use *!renovaraluguel* para iniciar novamente.",
            );
            return;
          }

          // Se é um comando, avisar que tá no fluxo
          if (isCmd) {
            if (_canReplyFlow(sender, "renov_cmd"))
              reply(
                `⚠️ Você está no meio de uma *renovação de contrato* (etapa: *${_renovState.step}*).\n\n💡 Responda à pergunta atual ou envie *cancelar* para sair do fluxo.`,
              );
            return;
          }

          // Processar resposta
          const resRenov = processarRespostaRenovacao(_renovJid, _bodyTrim);
          if (resRenov.error) {
            if (_canReplyFlow(sender, "renov_err")) {
              if (resRenov.image) {
                try {
                  await conn.sendMessage(from, {
                    image: { url: resRenov.image },
                    caption: resRenov.msg,
                  });
                } catch {
                  reply(resRenov.msg);
                }
              } else {
                reply(resRenov.msg);
              }
            }
            return;
          }
          if (resRenov.cancelled) {
            reply(resRenov.msg);
            return;
          }
          if (resRenov.done && resRenov.confirmed) {
            // Renovação confirmada! Aplicar
            const rd = resRenov.data;
            try {
              const renovado = renovarContrato(rd.id_gp, rd.dias_renovar);
              if (!renovado) {
                reply(
                  `❌ Contrato não encontrado para o grupo *${rd.nome_grupo}*.\n\nO contrato pode ter sido encerrado.`,
                );
                return;
              }

              // Atualizar valor ANTES de exibir (fix: mostrava valor antigo)
              if (rd.valor_novo && rd.valor_novo !== rd.valor_atual) {
                renovado.valor = rd.valor_novo;
                const lista = getAluguel();
                const idx = lista.findIndex((c) => c.id_gp === rd.id_gp);
                if (idx >= 0) {
                  lista[idx].valor = rd.valor_novo;
                  const {
                    setAluguel,
                  } = require("./dados/org/funcoes/aluguel.js");
                  setAluguel(lista);
                }
              }

              const _renovTxt = `│\n│  ✅ *CONTRATO RENOVADO*\n├──────────────\n│\n${formatarContrato(renovado)}`;

              try {
                await conn.sendMessage(from, {
                  image: {
                    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
                  },
                  caption: _renovTxt,
                });
              } catch {
                reply(_renovTxt);
              }

              // Avisar no grupo
              if (rd.id_gp && rd.id_gp.endsWith("@g.us")) {
                const moment = require("moment-timezone");
                const dataVencR = moment
                  .unix(renovado.vencimento)
                  .tz("America/Sao_Paulo")
                  .format("DD/MM/YYYY [às] HH:mm");
                try {
                  await conn.sendMessage(rd.id_gp, {
                    text: `│\n│  🔄 *CONTRATO RENOVADO*\n├──────────────\n│\n│  🏘️ *${rd.nome_grupo}*\n│  📆 +${rd.dias_renovar} dia(s) adicionados\n│  📅 Novo vencimento: ${dataVencR}\n│  💰 Valor: ${rd.valor_novo || renovado.valor}\n│\n├──────────────\n│  🚀 _Bot continuará ativo!_`,
                  });
                } catch { }
              }
            } catch (e) {
              reply(`❌ Erro ao renovar: ${e.message}`);
            }
            return;
          }
          // Próximo prompt (com imagem)
          if (resRenov.image) {
            try {
              await conn.sendMessage(from, {
                image: { url: resRenov.image },
                caption: resRenov.msg,
              });
            } catch {
              reply(resRenov.msg);
            }
          } else {
            reply(resRenov.msg);
          }
          return;
        }

        // ── INTERCEPTOR DE REGISTRO ──
        // Tentar encontrar estado: primeiro pelo sender normalizado, depois pelo bruto
        let _regJid = null;
        let _regState = getRegistroState(_senderNorm);
        if (_regState) {
          _regJid = _senderNorm;
        }
        if (!_regState && sender !== _senderNorm) {
          _regState = getRegistroState(sender);
          if (_regState) _regJid = sender;
        }
        if (_regState) {
          const _bodyTrim = body.trim();
          const _bodyLower = _bodyTrim.toLowerCase();

          // Cancelamento - aceitar "cancelar", "!cancelar", "cancel"
          if (
            _bodyLower === "cancelar" ||
            _bodyLower === "cancel" ||
            (isCmd && command === "cancelar")
          ) {
            clearRegistroState(_senderNorm);
            clearRegistroState(sender);
            reply(
              "❌ Registro cancelado com sucesso!\n\n💡 Use *!registrar* para recomeçar.",
            );
            return;
          }

          // SAFETY-NET: Se o estado é "confirmar_atualizacao" mas o usuário já tem
          // registro completo no banco, significa que o estado é stale (bug de JID).
          // Auto-limpar e deixar o comando passar normalmente.
          if (
            (_regState.step === "confirmar_atualizacao" ||
              _regState.step === "confirmar_exclusao") &&
            isCmd
          ) {
            const _userJaRegistrado = getUser(sender) || getUser(_senderNorm);
            if (_userJaRegistrado) {
              // Estado stale — limpar todos os JIDs e deixar o comando passar
              clearRegistroState(_senderNorm);
              clearRegistroState(sender);
              if (_regJid && _regJid !== _senderNorm && _regJid !== sender) {
                clearRegistroState(_regJid);
              }
              // NÃO retornar — deixar o comando ser processado normalmente
            } else {
              // Realmente no meio da confirmação com um comando
              if (_canReplyFlow(sender, "reg_confirmar"))
                reply(`⚠️ Responda *sim* ou *não*.`);
              return;
            }
          } else if (isCmd) {
            // Se é um comando durante o fluxo (em outra etapa), avisar
            if (_canReplyFlow(sender, "reg_cmd"))
              reply(
                `⚠️ Você está no meio do *registro* (etapa: *${_regState.step}*).\n\n💡 Responda à pergunta atual ou envie *cancelar* para sair do fluxo.`,
              );
            return;
          }

          // Verificar se é resposta "sim" ou "não" para atualização
          if (_regState.step === "confirmar_atualizacao") {
            if (_bodyLower === "sim" || _bodyLower === "s") {
              // Verificar se alguém já está registrando
              try {
                if (_contarRegistrandoAtivos(sender) >= MAX_REGISTROS_SIMULTANEOS) {
                  try { reply(`> ⏳ *Aguarde um momento!*\n\n> Já existem várias pessoas se cadastrando no bot neste momento.\n\n> 💡 Tente novamente em alguns minutos!\n> _O cadastro leva menos de 2 minutos._`); } catch { }
                  clearRegistroState(_senderNorm);
                  clearRegistroState(sender);
                  return;
                }
              } catch { }
              // Limpar TODOS os JIDs antes de iniciar novo fluxo
              clearRegistroState(_senderNorm);
              clearRegistroState(sender);
              const resIntro = startRegistro(_senderNorm);
              if (resIntro.image) {
                try {
                  await conn.sendMessage(from, {
                    image: { url: resIntro.image },
                    caption: resIntro.text || resIntro.msg,
                  });
                } catch {
                  reply(resIntro.text || resIntro.msg);
                }
              } else {
                reply(resIntro.msg || resIntro.text);
              }
              return;
            } else if (
              _bodyLower === "não" ||
              _bodyLower === "nao" ||
              _bodyLower === "n"
            ) {
              clearRegistroState(_senderNorm);
              clearRegistroState(sender);
              reply("✅ Ok, seus dados foram mantidos!");
              return;
            } else {
              if (_canReplyFlow(sender, "reg_simNao"))
                reply(
                  "💡 Responda *sim* para atualizar seus dados ou *não* para manter.",
                );
              return;
            }
          }

          // Confirmar exclusão do registro (!delregistro)
          if (_regState.step === "confirmar_exclusao") {
            if (_bodyLower === "sim" || _bodyLower === "s") {
              clearRegistroState(_senderNorm);
              clearRegistroState(sender);
              const { deleteUser } = require("./dados/org/funcoes/registro.js");
              deleteUser(sender);
              deleteUser(_senderNorm);
              reply(
                `✅ *Registro apagado com sucesso!*\n\n🔄 Caso queira se registrar novamente, use *${prefix}registrar*`,
              );
              return;
            } else if (
              _bodyLower === "não" ||
              _bodyLower === "nao" ||
              _bodyLower === "n"
            ) {
              clearRegistroState(_senderNorm);
              clearRegistroState(sender);
              reply("✅ Ok, seu registro foi *mantido*!");
              return;
            } else {
              if (_canReplyFlow(sender, "reg_delConfirm"))
                reply("📌 Responda apenas *sim* ou *não*.");
              return;
            }
          }

          // Processar resposta do fluxo normal
          const resultado = processarResposta(_regJid, _bodyTrim);
          if (resultado.error) {
            if (_canReplyFlow(sender, "reg_err")) reply(resultado.msg);
            return;
          }
          if (resultado.completed) {
            // LIMPAR TODOS os estados residuais (evitar bugs)
            clearRegistroState(_senderNorm);
            clearRegistroState(sender);
            if (_regJid && _regJid !== _senderNorm && _regJid !== sender) {
              clearRegistroState(_regJid);
            }

            // Registro finalizado — mostrar perfil completo
            const userData = resultado.userData;
            // Salvar número de telefone real (senderAlt contém o PN quando sender é LID)
            try {
              const _phoneJid = senderAlt && senderAlt.split("@")[0].length <= 15
                ? senderAlt.split("@")[0]
                : sender.split("@")[0].length <= 15
                  ? sender.split("@")[0]
                  : null;
              if (_phoneJid) {
                userData.telefone = _phoneJid;
                const { setUser } = require("./dados/org/funcoes/registro.js");
                setUser(_regJid || _senderNorm || sender, userData);
              }
            } catch { }
            const _regNumero = userData.telefone || sender.split("@")[0];
            const perfilTxt = gerarPerfil(userData, _regNumero, pushname);
            const msgFinal = `✅ *REGISTRO CONCLUÍDO COM SUCESSO!* 🎉\n\n${perfilTxt}\n\n💡 Use *${prefix}perfil* para ver suas informações.\n🔄 Use *${prefix}registrar* para atualizar dados.\n🗑️ Use *${prefix}delregistro* para apagar seu registro.`;

            // Tentar pegar foto de perfil
            let ppRegUrl;
            try {
              ppRegUrl = await conn.profilePictureUrl(sender, "image");
            } catch {
              const avatarFile =
                userData.sexo === "Feminino"
                  ? "./dados/org/media/avatar_feminino.png"
                  : "./dados/org/media/avatar_masculino.png";
              ppRegUrl = avatarFile;
            }
            const regImgPayload = ppRegUrl.startsWith("./")
              ? { image: require("fs").readFileSync(ppRegUrl) }
              : { image: { url: ppRegUrl } };
            conn.sendMessage(
              from,
              {
                ...regImgPayload,
                caption: msgFinal,
                mentions: [sender],
              },
              { quoted: info },
            );
            return;
          }
          // Próximo passo (com suporte a imagem)
          if (resultado.image) {
            try {
              await conn.sendMessage(from, {
                image: { url: resultado.image },
                caption: resultado.msg,
              });
            } catch {
              reply(resultado.msg);
            }
          } else {
            reply(resultado.msg);
          }
          return;
        }
      }
      // ═══════════════════════════════════════════════════════
      // ═══════ SISTEMA ANTI-SPAM — DETECÇÃO DE FLOOD ═══════
      if (isGroup && !SoDono && !isGroupAdmins) {
        try {
          // Verificar se antispam está ativo neste grupo
          let _asAtivo = false;
          try {
            const _asGpFile = `./dados/grupos/${from}.json`;
            if (fs.existsSync(_asGpFile)) {
              const _asGp = JSON.parse(fs.readFileSync(_asGpFile, "utf8"));
              if (Array.isArray(_asGp) && _asGp[0])
                _asAtivo = _asGp[0].antispam === true;
            }
          } catch { }

          if (_asAtivo) {
            const _asKey = `${from}_${sender}`;
            const _asNow = Date.now();
            const _asWindow = 8000; // 8 segundos
            const _asLimit = 6; // 6 mensagens

            // Rastrear mensagens
            if (!_antiSpamTracker.has(_asKey)) _antiSpamTracker.set(_asKey, []);
            const _asMsgs = _antiSpamTracker.get(_asKey);
            _asMsgs.push(_asNow);
            // Manter apenas msgs dentro da janela
            const _asRecent = _asMsgs.filter((t) => _asNow - t < _asWindow);
            _antiSpamTracker.set(_asKey, _asRecent);

            if (_asRecent.length >= _asLimit) {
              // FLOOD DETECTADO!
              _antiSpamTracker.set(_asKey, []); // resetar contador

              // Resolver LID
              let _asJid = sender;
              if (groupMembers && groupMembers.length > 0) {
                const _asNum = extractNumber(sender);
                const _asF = groupMembers.find(
                  (gm) =>
                    extractNumber(typeof gm.id === "string" ? gm.id : "") ===
                    _asNum,
                );
                if (_asF && _asF.id)
                  _asJid = _asF.id.includes(":")
                    ? _asF.id.split(":")[0] + "@s.whatsapp.net"
                    : _asF.id;
              }
              const _asDisplay = extractNumber(_asJid);

              // Aplicar advertência NO SISTEMA PRINCIPAL (mesmo do !adv e mute flood)
              const _asWarnCount = addWarning(
                from,
                sender,
                "Flood (anti-spam)",
              );

              // Buscar ADMs do grupo para mencionar
              let _asAdmMentions = [];
              try {
                const _asGpMeta = await conn.groupMetadata(from);
                _asAdmMentions = _asGpMeta.participants
                  .filter((p) => p.admin)
                  .map((p) => p.id);
              } catch { }

              if (_asWarnCount >= 3) {
                // BAN
                try {
                  await conn.sendMessage(from, {
                    text: `🚫 @${_asDisplay} *BANIDO POR SPAM*\n⚠️ 3/3 advertências\n\n📢 ADMs notificados`,
                    mentions: [_asJid, ..._asAdmMentions],
                  });
                  await conn.groupParticipantsUpdate(from, [sender], "remove");
                  clearUserWarnings(from, sender);
                } catch { }
              } else {
                // Advertência
                try {
                  await conn.sendMessage(from, {
                    text: `⚠️ *ANTI-SPAM* — @${_asDisplay}\n🚨 Advertência *${_asWarnCount}/3* por flood\n${_asWarnCount >= 2 ? "🚫 Próxima = *BAN AUTOMÁTICO*" : "⚠️ Reduza o ritmo das mensagens"}\n\n📢 ADMs notificados`,
                    mentions: [_asJid, ..._asAdmMentions],
                  });
                } catch { }
              }
            }
          }
        } catch { }
      }
      // ═══════════════ FIM ANTI-SPAM ═══════════════

      // ═══════ SISTEMA DE MUTE — AUTO-DELETE + FLOOD DETECTION ═══════
      if (isGroup && !SoDono && !isGroupAdmins) {
        try {
          if (isMuted(from, sender)) {
            // Throttle: evitar rate-overlimit (máx 2 deletes por segundo por user)
            const _throttleKey = `${from}_${sender}`;
            const _lastDel = _muteDeleteThrottle.get(_throttleKey) || 0;
            const _now = Date.now();
            if (_now - _lastDel < 500) {
              return; // muito rapido, ignora silenciosamente
            }
            _muteDeleteThrottle.set(_throttleKey, _now);

            // ═══ PRIORIDADE: DELETAR MENSAGEM PRIMEIRO ═══
            // Qualquer tipo: texto, imagem, vídeo, áudio, sticker, documento, etc.
            // Construir key completa para garantir compatibilidade com Baileys 7.0+ e LID
            const _muteDeleteKey = {
              remoteJid: from,
              fromMe: false,
              id: info.key.id,
              participant: info.key.participant,
            };

            let _muteDeleted = false;
            try {
              await conn.sendMessage(from, { delete: _muteDeleteKey });
              _muteDeleted = true;
            } catch (delErr1) {
              // Primeira tentativa falhou — tentar com info.key direto
              try {
                await conn.sendMessage(from, { delete: info.key });
                _muteDeleted = true;
              } catch (delErr2) {
                // Tentar com participantAlt (LID ↔ PN)
                if (info.key.participantAlt || senderAlt) {
                  try {
                    const _altKey = {
                      remoteJid: from,
                      fromMe: false,
                      id: info.key.id,
                      participant: info.key.participantAlt || senderAlt,
                    };
                    await conn.sendMessage(from, { delete: _altKey });
                    _muteDeleted = true;
                  } catch { }
                }
                // Último recurso — retry após 2s
                if (!_muteDeleted) {
                  setTimeout(async () => {
                    try {
                      await conn.sendMessage(from, { delete: _muteDeleteKey });
                    } catch {
                      try {
                        await conn.sendMessage(from, { delete: info.key });
                      } catch { }
                    }
                  }, 2000);
                }
              }
            }

            // React com emoji engraçado (DEPOIS do delete para não consumir rate-limit)
            const _muteEmojis = [
              "🤫", "🤐", "🔇", "🚧", "🤡", "💀", "😶", "🙊", "👋", "🫣",
            ];
            const _muteReact =
              _muteEmojis[Math.floor(Math.random() * _muteEmojis.length)];
            try {
              await conn.sendMessage(from, {
                react: { text: _muteReact, key: info.key },
              });
            } catch { }

            // Incrementar contador
            incrementDeletedMessages(from, sender);

            // ══ FLOOD DETECTION: 10+ msgs em 15s → advertência (usa sistema principal) ══
            const _mfKey = `muteflood_${from}_${sender}`;
            const _mfNow = Date.now();
            const _mfWindow = 15000; // 15 segundos
            const _mfLimit = 10;

            if (!_antiSpamTracker.has(_mfKey)) _antiSpamTracker.set(_mfKey, []);
            const _mfMsgs = _antiSpamTracker.get(_mfKey);
            _mfMsgs.push(_mfNow);
            const _mfRecent = _mfMsgs.filter((t) => _mfNow - t < _mfWindow);
            _antiSpamTracker.set(_mfKey, _mfRecent);

            if (_mfRecent.length >= _mfLimit) {
              _antiSpamTracker.set(_mfKey, []); // resetar

              // Resolver LID para menção correta
              let _floodJid = sender;
              if (groupMembers && groupMembers.length > 0) {
                const _fNum = extractNumber(sender);
                const _fFound = groupMembers.find(
                  (gm) =>
                    extractNumber(typeof gm.id === "string" ? gm.id : "") ===
                    _fNum,
                );
                if (_fFound && _fFound.id)
                  _floodJid = _fFound.id.includes(":")
                    ? _fFound.id.split(":")[0] + "@s.whatsapp.net"
                    : _fFound.id;
              }
              const _floodNum = extractNumber(_floodJid);

              // Aplicar advertência (sistema principal — aparece no !perfil e !advertidos)
              const _advCount = addWarning(from, sender, "Flood no mute");

              if (_advCount >= 3) {
                // BAN AUTOMÁTICO
                try {
                  await conn.sendMessage(from, {
                    text: `🚫 @${_floodNum} *BANIDO*\n⚠️ 3/3 advertências por flood no mute`,
                    mentions: [_floodJid],
                  });
                  await conn.groupParticipantsUpdate(from, [sender], "remove");
                  unmuteUser(from, sender);
                  clearUserWarnings(from, sender);
                } catch { }
              } else {
                try {
                  await conn.sendMessage(from, {
                    text: `⚠️ @${_floodNum} *ADVERTÊNCIA ${_advCount}/3*\nFlood no mute\n🚫 Com 3 = *BAN*`,
                    mentions: [_floodJid],
                  });
                } catch { }
              }
            }

            return; // Bloquear TUDO
          }
        } catch { }
      }
      // ═══════════════════════════════════════════════════════════

      // ═══════ VERIFICAÇÃO DE REGISTRO OBRIGATÓRIO ═══════
      // Ler configuração do modoregistro (PADRÃO: DESATIVADO)
      let _modoRegistroAtivo = false;
      try {
        const _cfgReg = JSON.parse(fs.readFileSync("./dados/settings.json"));
        _modoRegistroAtivo = _cfgReg.modoregistro === true;
      } catch { }

      // Comandos isentos da verificação de registro
      const _cmdsIsentos = [
        "registrar",
        "registro",
        "cadastrar",
        "cancelar",
        "perfil",
        "profile",
        "apagarregistro",
        "deletarregistro",
        "dono",
        "owner",
        "odono",
        "infodono",
        "menu",
        "help",
        "ajuda",
        "bronxys",
        "git",
        "git-bot",
        "gitdobot",
        "tutorial",
        "modoregistro",
        "resumo",
        "resumir",
      ];

      if (
        _modoRegistroAtivo &&
        isCmd &&
        !SoDono &&
        !isnit &&
        !isPremium &&
        !issupre &&
        !ischyt
      ) {
        const _userReg = getUser(sender);
        if (!_userReg && !_cmdsIsentos.includes(command)) {
          // — Verificar se o comando parece um typo de "registrar" —
          const _typosRegistrar = [
            "registar",
            "registra",
            "registarr",
            "regiistrar",
            "registrra",
            "registrar",
            "registarr",
            "rgistrar",
            "regstrar",
            "regisar",
            "registarr",
            "registarr",
            "cadastar",
            "cadastra",
            "cadastrar",
            "cadastarr",
          ];
          const _ehTypoRegistrar = _typosRegistrar.some(
            (t) => command.includes(t) || t.includes(command),
          );

          // ── Antiflood: só avisa 1x a cada 30s por usuário ──
          const _lastAviso = _registroCooldown.get(sender);
          if (_lastAviso && Date.now() - _lastAviso < REGISTRO_COOLDOWN_MS) {
            try {
              await conn.sendMessage(from, {
                react: { text: "⚠️", key: info.key },
              });
            } catch { }
            return; // Já foi avisado, só reage e ignora
          }
          _registroCooldown.set(sender, Date.now());

          // — Se o usuário está no privado (já chegou ao destino certo!) —
          if (!isGroup) {
            if (_ehTypoRegistrar) {
              return reply(
                `> ⚠️ *Comando não encontrado!*\n\n> 💡 Você quis dizer *${prefix}registrar*?\n\n> Para se cadastrar, envie:\n👉 *${prefix}registrar*`,
              );
            }
            return reply(
              `> 🔒 *Você precisa estar registrado para usar os comandos do bot!*\n\n> 💡 Para se cadastrar, envie:\n👉 *${prefix}registrar*\n\n_(Você já está no privado, só enviar o comando acima!)_`,
            );
          }

          // — Usuário está em grupo — Reação + msg curta no grupo (sem PV para evitar ban)
          try {
            await conn.sendMessage(from, {
              react: { text: "⚠️", key: info.key },
            });
          } catch { }

          const antipvAtivo = isAntiPv || isAntiPv2 || isAntiPv3;
          const _linkRegistro = antipvAtivo
            ? `https://wa.me/${numerodono_ofc}`
            : `https://wa.me/${botNumber}`;

          // Msg curta no grupo com link
          conn.sendMessage(
            from,
            {
              text: `> @${sender.split("@")[0]} registre-se para usar os comandos! 🔒\n> 👉 ${_linkRegistro}`,
              mentions: [sender],
            },
            { quoted: info },
          );
          return;
        }
      }
      // ═══════════════════════════════════════════════════════

      // ── Interceptor: Confirmação de zerar aluguel ──
      if (!isGroup && _pendingZerarAluguel.has(sender)) {
        const _bodyLow = body.trim().toLowerCase();
        if (_bodyLow === "confirmar") {
          const _pending = _pendingZerarAluguel.get(sender);
          _pendingZerarAluguel.delete(sender);
          zerarAluguel();
          return reply(
            `> ✅ *Todos os ${_pending.total} contrato(s) de aluguel foram apagados!*\n\n> 🗑️ A lista de aluguéis está vazia agora.\n💡 Use *${prefix}alugarbot* para cadastrar novos.`,
          );
        } else if (_bodyLow === "cancelar") {
          _pendingZerarAluguel.delete(sender);
          return reply(
            `>❌ *Operação cancelada!*\n\n> Nenhum contrato foi removido.`,
          );
        }
      }

      // (Anti-flood PV já gerenciado no início do bloco !isGroup acima)

      //INICIO DE COMANDO DE PREFIXO
      switch (command) {
        //_-1 AQUI SERÁ A ÁREA DE COMANDOS DE INFORMAÇÕES OU COMANDOS DE INFORMAR SOBRE ALGO, PRATICAMENTE FALANDO: CLÁSSICO

        // ═══════ COMANDOS DE REGISTRO E PERFIL ═══════
        case "registrar":
        case "registro":
        case "cadastrar": {
          // Verificar se modoregistro está ativo (PADRÃO: DESATIVADO)
          let _regModoAtivo = false;
          try {
            const _cfgR = JSON.parse(fs.readFileSync("./dados/settings.json"));
            _regModoAtivo = _cfgR.modoregistro === true;
          } catch { }
          if (!_regModoAtivo) {
            return reply(
              `> 🔓 *Modo Registro desativado!*\n\n> O sistema de registro está desativado no momento.\n\n> 💡 Contate o dono para mais informações.`,
            );
          }

          if (isGroup) {
            // ── Cooldown de 3 minutos por grupo para evitar flood ──
            if (!global._registrarCooldown) global._registrarCooldown = {};
            const _rgCdKey = from; // ID do grupo
            const _rgCdNow = Date.now();
            const _rgCdLast = global._registrarCooldown[_rgCdKey] || 0;
            if (_rgCdNow - _rgCdLast < 180000) return; // 3 min = 180000ms → ignora silenciosamente
            global._registrarCooldown[_rgCdKey] = _rgCdNow;

            // Verificar se algum antipv está ativo
            const antipvAtivo = isAntiPv || isAntiPv2 || isAntiPv3;
            if (antipvAtivo) {
              return reply(
                `> ⚠️ *O registro só pode ser feito no privado do bot!*\n\n> 🔒 Porém o *Anti-PV está ativado*, então o bot não aceita mensagens privadas no momento.\n\n💡 *Entre em contato com o dono do bot* para solicitar seu registro:\n👉 https://wa.me/${numerodono_ofc}\n\n_Diga a ele que deseja se registrar no bot!_`,
              );
            }
            return reply(
              `> ⚠️ *Para sua segurança, o registro só pode ser feito no privado do bot!*\n\n> 💡 Clique aqui e envie *${prefix}registrar* lá:\nhttps://wa.me/${botNumber}`,
            );
          }

          // Verificar se já tem registro
          const existente = getUser(sender);
          if (existente) {
            // Perguntar se quer atualizar — setar estado com AMBOS JIDs
            setRegistroState(sender, "confirmar_atualizacao", {});
            setRegistroState(normalizeJid(sender), "confirmar_atualizacao", {});
            const _jaReg = mensagemJaRegistrado(prefix, existente);
            if (_jaReg.image) {
              try {
                await conn.sendMessage(
                  from,
                  {
                    image: { url: _jaReg.image },
                    caption: _jaReg.msg,
                  },
                  { quoted: info },
                );
              } catch {
                reply(_jaReg.msg || _jaReg);
              }
            } else {
              reply(_jaReg.msg || _jaReg);
            }
            return;
          }

          // Verificar se já existe alguém se registrando
          try {
            if (_contarRegistrandoAtivos(sender) >= MAX_REGISTROS_SIMULTANEOS) {
              try { reply(`> ⏳ *Aguarde um momento!*\n\n> Já existem várias pessoas se cadastrando no bot neste momento.\n\n> 💡 Tente novamente em alguns minutos!\n> _O cadastro leva menos de 2 minutos._`); } catch { }
              return;
            }
          } catch { }

          // Iniciar registro novo
          const intro = mensagemIntro(prefix);
          const primeiraP = startRegistro(normalizeJid(sender));
          const _regIntroTxt = `${intro.msg || intro}\n\n${primeiraP.msg || primeiraP}`;
          if (primeiraP.image) {
            try {
              await conn.sendMessage(
                from,
                {
                  image: { url: primeiraP.image },
                  caption: _regIntroTxt,
                },
                { quoted: info },
              );
            } catch {
              reply(_regIntroTxt);
            }
          } else {
            reply(_regIntroTxt);
          }
          break;
        }

        case "perfil":
        case "profile": {
          try {
            // Determinar de quem é o perfil
            let targetJid = sender;
            let targetPush = pushname;
            let targetAlt = senderAlt; // Número real se sender for LID

            // Se mencionou alguém no grupo
            if (isGroup && menc_os2) {
              targetJid = menc_os2;
              targetPush = null;
              targetAlt = null;
              // Tentar resolver o número real do mencionado
              try {
                const _gpMeta = await conn.groupMetadata(from);
                const _prt = _gpMeta?.participants?.find(p => {
                  const pJid = p.id || "";
                  const pLid = p.lid || "";
                  return pJid === menc_os2 || pLid === menc_os2 ||
                    pJid.split("@")[0] === menc_os2.split("@")[0] ||
                    pLid.split("@")[0] === menc_os2.split("@")[0];
                });
                if (_prt) {
                  // Se encontrou, pegar o ID real (telefone)
                  if (_prt.id && _prt.id !== menc_os2) targetAlt = _prt.id;
                  if (_prt.lid && _prt.lid !== menc_os2) targetAlt = targetAlt || _prt.id;
                }
              } catch { }
            } else if (isGroup && q && q.includes("@")) {
              targetJid = q.replace("@", "") + "@s.whatsapp.net";
              targetPush = null;
              targetAlt = null;
            }

            const userData = getUser(targetJid) || (targetAlt ? getUser(targetAlt) : null);

            // ═══ Resolver número real (evitar mostrar LID) ═══
            let realNumero = targetJid.split("@")[0];
            let mentionJids = [targetJid];

            // Se o número tem 16+ dígitos, é um LID — usar alternativa
            if (realNumero.length > 15 && targetAlt) {
              const altNum = targetAlt.split("@")[0];
              if (altNum.length <= 15) {
                realNumero = altNum;
                mentionJids.push(targetAlt);
              }
            }
            // Se ainda é LID e temos senderAlt global (para o próprio sender)
            if (realNumero.length > 15 && senderAlt && targetJid === sender) {
              const altNum2 = senderAlt.split("@")[0];
              if (altNum2.length <= 15) {
                realNumero = altNum2;
                if (!mentionJids.includes(senderAlt)) mentionJids.push(senderAlt);
              }
            }
            // Fallback: buscar no groupMetadata se ainda é LID
            if (realNumero.length > 15 && isGroup) {
              try {
                const _gpMetaPerfil = await conn.groupMetadata(from);
                if (_gpMetaPerfil?.participants) {
                  for (const p of _gpMetaPerfil.participants) {
                    const pId = (p.id || "").split("@")[0];
                    const pLid = (p.lid || "").split("@")[0];
                    // Encontrar o participante pelo LID
                    if (pLid === realNumero || pId === realNumero) {
                      // Se o id real (telefone) tem <=15 dígitos, usar ele
                      if (pId.length <= 15 && pId !== realNumero) {
                        realNumero = pId;
                        const realJid = pId + "@s.whatsapp.net";
                        if (!mentionJids.includes(realJid)) mentionJids.push(realJid);
                      }
                      break;
                    }
                  }
                }
              } catch { }
            }

            const numero = realNumero;

            // ═══ Coletar dados extras do grupo ═══
            const perfilExtras = {};

            if (isGroup && typeof ind !== "undefined" && ind >= 0) {
              // Atividade no grupo
              const idxNum = countMessage[ind].numbers.findIndex(
                (i) => i.id === targetJid,
              );
              const actData =
                idxNum >= 0 ? countMessage[ind].numbers[idxNum] : null;
              if (actData) {
                perfilExtras.mensagens = actData.messages || 0;
                perfilExtras.comandos = actData.cmd_messages || 0;
                perfilExtras.figurinhas = actData.figus || 0;
              } else {
                perfilExtras.mensagens = 0;
                perfilExtras.comandos = 0;
                perfilExtras.figurinhas = 0;
              }

              // Golds
              const goldUser =
                ID_G_GOLD !== -1
                  ? rggold[ID_G_GOLD].usus.find((i) => i.id === targetJid)
                  : null;
              perfilExtras.golds = goldUser?.Golds || 0;

              // Advertências (novo sistema + legado)
              const _advOld = dataGp[0]?.advertir
                ? dataGp[0].advertir.filter((x) => x == targetJid).length
                : 0;
              const _advNew = getWarningCount(from, targetJid);
              perfilExtras.advertencias = _advOld + _advNew;

              // Status de mute no grupo
              perfilExtras.mutado = isMuted(from, targetJid);
              if (perfilExtras.mutado) {
                const _mutInfo = getMutedUsers(from).find((m) =>
                  areJidsEqual(m.jid, targetJid),
                );
                perfilExtras.mutadoMsgs = _mutInfo?.deletedMessages || 0;
              }

              // Barra de personalidade (só no grupo)
              perfilExtras.mostrarPersonalidade = true;
            }

            // ═══ Gold em PV (buscar saldo em qualquer grupo) ═══
            if (!isGroup || perfilExtras.golds === undefined) {
              let _pvGolds = 0;
              for (const gpg of rggold) {
                const u = gpg.usus?.find((x) => x.id === targetJid);
                if (u) {
                  _pvGolds = u.Golds || 0;
                  break;
                }
              }
              if (perfilExtras.golds === undefined)
                perfilExtras.golds = _pvGolds;
            }


            let perfilTxt;

            if (userData) {
              // Atualizar idade automaticamente
              const idadeAtual = calcularIdade(userData.nascimento);
              if (idadeAtual !== userData.idade) {
                userData.idade = idadeAtual;
                setUser(targetJid, userData);
              }

              perfilTxt = gerarPerfil(
                userData,
                numero,
                targetPush,
                perfilExtras,
              );
            } else {
              // ═══ PERFIL BÁSICO (sem registro) ═══
              const _nome = targetPush || "Desconhecido";

              // Seed fixo para porcentagens
              const _seedFn = (s, o) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i) + o; h |= 0; } return Math.abs(h % 101); };
              const _barFn = (p) => "▓".repeat(Math.round(p / 20)) + "░".repeat(5 - Math.round(p / 20));

              let _txt = `┏━━━━━━━━━━━━━━━┓\n`;
              _txt += `┃ 👤 *𝗣𝗘𝗥𝗙𝗜𝗟* ━ @${numero}\n`;
              _txt += `┗━━━━━━━━━━━━━━━┛\n\n`;

              _txt += `╔══〘 📛 〙════════╗\n`;
              _txt += `║ 👤 *${_nome}*\n`;
              _txt += `║ 📝 _ᴠɪsɪᴛᴀɴᴛᴇ ─ sᴇᴍ ʀᴇɢɪsᴛʀᴏ_\n`;
              _txt += `╚══════════════╝\n\n`;

              if (isGroup) {
                // Calcular nível de intimidade dinâmico usando sistema compartilhado
                const _xpMsgs = perfilExtras.mensagens || 0;
                const _xpFigs = perfilExtras.figurinhas || 0;
                const _xpCmds = perfilExtras.comandos || 0;
                const _nvInfo = calcularNivel(_xpMsgs, _xpFigs, _xpCmds);

                _txt += `╔══〘 🏅 〙════════╗\n`;
                _txt += `║ ${_nvInfo.icon} ${_nvInfo.nome} ─ 💰 *${perfilExtras.golds || 0}G*\n`;
                _txt += `║ 💬 *${_xpMsgs}* ᴍsɢs ─ 🤖 *${_xpCmds}* ᴄᴍᴅs\n`;
                _txt += `║ 🎭 *${_xpFigs}* ғɪɢs ─ ⚠️ *${perfilExtras.advertencias || 0}/3* ᴀᴅᴠ\n`;
                _txt += `║ ⚡ *XP:* ${_nvInfo.xp}/${_nvInfo.nextXp} ${_nvInfo.barra}\n`;
                _txt += `║ 💭 _${_nvInfo.frase}_\n`;
                if (perfilExtras.mutado) {
                  _txt += `║ 🔇 *ᴍᴜᴛᴀᴅᴏ* ─ ${perfilExtras.mutadoMsgs} ᴍsɢs ᴀᴘᴀɢᴀᴅᴀs\n`;
                }
                _txt += `╚══════════════╝\n\n`;
              }

              // Personalidade
              const _pS = _seedFn(numero, 1), _pG = _seedFn(numero, 2);
              const _pB = _seedFn(numero, 3), _pGo = _seedFn(numero, 4);
              const _pV = _seedFn(numero, 5), _pC = _seedFn(numero, 6);
              const _pF = _seedFn(numero, 8), _pI = _seedFn(numero, 9);

              _txt += `╔══〘 🎭 〙════════╗\n`;
              _txt += `║ 😈 *sᴀғᴀᴅᴏ* ${_barFn(_pS)} *${_pS}%*\n`;
              _txt += `║ 🐄 *ɢᴀᴅᴏ* ${_barFn(_pG)} *${_pG}%*\n`;
              _txt += `║ 😍 *ʙᴏɴɪᴛᴏ* ${_barFn(_pB)} *${_pB}%*\n`;
              _txt += `║ 🔥 *ɢᴏsᴛᴏsᴏ* ${_barFn(_pGo)} *${_pGo}%*\n`;
              _txt += `║ 😴 *ᴠᴀɢᴀʙᴜɴᴅᴏ* ${_barFn(_pV)} *${_pV}%*\n`;
              _txt += `║ 🐂 *ᴄᴏʀɴᴏ* ${_barFn(_pC)} *${_pC}%*\n`;
              _txt += `║ 💍 *ғɪᴇʟ* ${_barFn(_pF)} *${_pF}%*\n`;
              _txt += `║ 🧠 *ɪɴᴛᴇʟɪɢᴇɴᴛᴇ* ${_barFn(_pI)} *${_pI}%*\n`;
              _txt += `╚══════════════╝\n\n`;

              _txt += `> 💡 _ᴜsᴇ *!ʀᴇɢɪsᴛʀᴀʀ* ɴᴏ ᴘᴠ ᴘᴀʀᴀ ᴅᴇsʙʟᴏǫᴜᴇᴀʀ ᴏ ᴘᴇʀғɪʟ ᴄᴏᴍᴘʟᴇᴛᴏ!_`;

              perfilTxt = _txt;
            }

            // Tentar foto com JID alternativo se o principal falhar
            let ppUrl;
            try {
              ppUrl = await conn.profilePictureUrl(targetJid, "image");
            } catch {
              if (targetAlt) {
                try {
                  ppUrl = await conn.profilePictureUrl(targetAlt, "image");
                } catch { }
              }
            }
            if (!ppUrl) {
              const avatarFile = userData && userData.sexo === "Feminino"
                ? "./dados/org/media/avatar_feminino.png"
                : "./dados/org/media/avatar_masculino.png";
              ppUrl = avatarFile;
            }

            const imgPayload = ppUrl.startsWith("./")
              ? { image: require("fs").readFileSync(ppUrl) }
              : { image: { url: ppUrl } };

            conn.sendMessage(
              from,
              {
                ...imgPayload,
                caption: perfilTxt,
                mentions: mentionJids,
              },
              { quoted: selo },
            );
          } catch (e) {
            console.log(e);
            reply("❌ Erro ao carregar perfil.");
          }
          break;
        }

        case "cancelar": {
          if (isGroup) break;
          const _normSender = normalizeJid(sender);
          const _donoJidC = numerodono_ofc + "@s.whatsapp.net";
          let _cancelouAlgo = false;

          // Cancelar registro
          if (cancelarRegistro(sender) || cancelarRegistro(_normSender)) {
            _cancelouAlgo = true;
            reply(
              "❌ Registro cancelado com sucesso!\n\n💡 Use *!registrar* para recomeçar.",
            );
          }

          // Cancelar aluguel (tentar múltiplos JIDs)
          const _alugS1 = getAluguelState(sender);
          const _alugS2 = getAluguelState(_normSender);
          const _alugS3 = getAluguelState(_donoJidC);
          if (_alugS1) {
            clearAluguelState(sender);
            _cancelouAlgo = true;
          }
          if (_alugS2) {
            clearAluguelState(_normSender);
            _cancelouAlgo = true;
          }
          if (_alugS3) {
            clearAluguelState(_donoJidC);
            _cancelouAlgo = true;
          }
          if (_alugS1 || _alugS2 || _alugS3) {
            reply(
              "❌ Contrato cancelado com sucesso!\n\n💡 Use *!alugarbot* para iniciar um novo.",
            );
          }

          // Cancelar renovação (tentar múltiplos JIDs)
          const _renS1 = getRenovacaoState(sender);
          const _renS2 = getRenovacaoState(_normSender);
          const _renS3 = getRenovacaoState(_donoJidC);
          if (_renS1) {
            clearRenovacaoState(sender);
            _cancelouAlgo = true;
          }
          if (_renS2) {
            clearRenovacaoState(_normSender);
            _cancelouAlgo = true;
          }
          if (_renS3) {
            clearRenovacaoState(_donoJidC);
            _cancelouAlgo = true;
          }
          if (_renS1 || _renS2 || _renS3) {
            reply(
              "❌ Renovação cancelada com sucesso!\n\n💡 Use *!renovaraluguel* para iniciar novamente.",
            );
          }

          if (!_cancelouAlgo) {
            reply(
              "ℹ️ Você não possui nenhum registro, contrato ou renovação em andamento.",
            );
          }
          break;
        }

        case "delregistro":
        case "apagarregistro":
        case "deletarregistro": {
          const regExistente = getUser(sender);
          if (!regExistente) {
            return reply("❌ Você não possui registro para apagar.");
          }
          // Setar estado de confirmação
          setRegistroState(sender, "confirmar_exclusao", {});
          setRegistroState(normalizeJid(sender), "confirmar_exclusao", {});
          reply(
            `⚠️ *ATENÇÃO*\n\nTem certeza que deseja *apagar permanentemente* seu registro?\n\n📛 *${regExistente.nome}*\n🎂 ${regExistente.idade} anos\n\n╭─────────────╮\n│ ✅ *sim* ─ apagar tudo │\n│ ❌ *não* ─ cancelar    │\n╰─────────────╯\n\n📌 _Responda apenas *sim* ou *não*_`,
          );
          break;
        }

        case "zerarregistros":
        case "resetregistros": {
          if (!SoDono) return reply(Res_SoDono);
          try {
            const todosReg = getAllUsers();
            const total = Object.keys(todosReg).length;
            if (total === 0) return reply("📋 Não há registros para zerar.");
            const {
              saveRegistros,
            } = require("./dados/org/funcoes/registro.js");
            saveRegistros({});
            reply(
              `🗑️ *REGISTROS ZERADOS!*\n\n📊 Foram removidos *${total}* registros.\n\n⚠️ Todos os usuários precisarão se registrar novamente com *${prefix}registrar*.`,
            );
          } catch (e) {
            reply("❌ Erro ao zerar registros: " + e.message);
          }
          break;
        }

        case "registrados":
        case "totalregistros": {
          if (!SoDono) return reply(Res_SoDono);
          try {
            const todosReg = getAllUsers();
            const entries = Object.entries(todosReg);
            const total = entries.length;
            if (total === 0) return reply("📋 Nenhum usuário registrado.");

            // Filtrar LIDs (>15 dígitos)
            const _filtradas = entries.filter(([jid]) => {
              const num = jid.split("@")[0];
              return num.length <= 15;
            });

            // Resolver LIDs → números reais via participantes dos grupos
            const _lidToPhone = {};
            try {
              const _allGroups = await conn.groupFetchAllParticipating();
              for (const gData of Object.values(_allGroups)) {
                for (const p of gData.participants || []) {
                  if (p.id && p.lid) {
                    const _pn = p.id.split(":")[0].split("@")[0];
                    const _lid = p.lid.split(":")[0].split("@")[0];
                    if (_pn.length <= 15) _lidToPhone[_lid] = _pn;
                  }
                }
              }
            } catch { }

            let lista = `╭──────────────────╮\n│ 📊 *REGISTRADOS*\n│ Total: *${total}*\n╰──────────────────╯\n\n`;
            const _regMentions = [];
            const maxShow = 30;
            const sorted = entries.sort((a, b) =>
              (b[1].atualizadoEm || "").localeCompare(a[1].atualizadoEm || ""),
            );
            for (let i = 0; i < Math.min(sorted.length, maxShow); i++) {
              const [jid, u] = sorted[i];
              const _jidNum = jid.split("@")[0];
              // Prioridade: telefone salvo > resolução LID > JID
              const _regPhone = u.telefone || _lidToPhone[_jidNum] || (_jidNum.length <= 15 ? _jidNum : null);
              if (_regPhone && !u.telefone) {
                // Salvar telefone resolvido para futuras consultas
                try { u.telefone = _regPhone; const { setUser } = require("./dados/org/funcoes/registro.js"); setUser(jid, u); } catch { }
              }
              const _displayNum = _regPhone || _jidNum;
              const _regJid = _displayNum + "@s.whatsapp.net";
              _regMentions.push(_regJid);
              lista += `*${i + 1}.* ${u.nome || "???"} — @${_displayNum}\n`;
            }
            if (entries.length > maxShow) {
              lista += `\n_... e mais ${entries.length - maxShow} outros_\n`;
            }
            lista += `\n╭──────────────────╮\n│ 💡 *${prefix}zerarregistros* p/ limpar\n╰──────────────────╯`;

            // Imagem
            const _regBannerPath = require("path").join(
              __dirname,
              "dados",
              "org",
              "media",
              "registrados_banner.png",
            );
            try {
              let imgPayload;
              if (fs.existsSync(_regBannerPath)) {
                imgPayload = { image: fs.readFileSync(_regBannerPath) };
              } else {
                imgPayload = {
                  image: { url: "https://i.imgur.com/4M34hi2.png" },
                };
              }
              await conn.sendMessage(
                from,
                {
                  ...imgPayload,
                  caption: lista,
                  mentions: _regMentions,
                },
                { quoted: info },
              );
            } catch {
              conn.sendMessage(
                from,
                {
                  text: lista,
                  mentions: _regMentions,
                },
                { quoted: info },
              );
            }
          } catch (e) {
            reply("❌ Erro ao listar registros: " + e.message);
          }
          break;
        }
        // ═══════════════════════════════════════════

        case "getlid":
          const [result] = await conn.onWhatsApp(q.trim());
          const lid = result?.lid;
          if (!lid) {
            return reply(`Lid não encontrado!`);
          }
          return reply(`Seu lid: ${lid}`);
        case "roll":
          var [d1, d2] = q.toLowerCase().trim().split("d");
          var [d3] = q.toLowerCase().trim().split("+") || 0;
          if (parseInt(d1) > 200)
            return reply("Quantidade de dados muito exagerado.");
          if (!q.toLowerCase().includes("d"))
            return reply(`Exemplo: ${prefix}roll 2d20`);
          if (!Number(parseInt(d2)))
            return reply(`Exemplo: ${prefix}roll 2d20`);
          let RS_D = "Resultado dos Dados:\n\n";
          for (i = 0; i < d1; i++) {
            RS_D += `[ ${i + 1} ] ${Math.floor(
              Math.random() * parseInt(d2) + parseInt(d3),
            )}\n\n`;
          }
          reply(RS_D);
          break;

        case "iaimg":
          if (!q.trim())
            return reply(
              `digite algo, Exemplo: ${prefix + command} JosivalS de cueca 😏`,
            );
          try {
            reply("Aguarde, estou realizando esta ação 🥱");
            conn.sendMessage(
              from,
              { image: { url: reqapi.iaimg(q.trim()) } },
              { quoted: info },
            );
          } catch (e) {
            reply("Erro... 🥱");
          }
          break;

        case "owner":
        case "odono":
        case "dono":
        case "infodono":
          numerodn = numerodono_ofc;
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: infodono(prefix, numerodn, NomeDoBot, sender),
              mentions: [sender],
            },
            { quoted: selo },
          );
          break;

        case "tabela":
          conn.sendMessage(
            from,
            { text: tabela(prefix, NomeDoBot) },
            { quoted: selo },
          );
          break;

        case "idiomas":
        case "idioma":
          reply(
            `As infos apenas são através do comando, use: ${prefix}info gtts\n\nIsso serve para outros comandos, por exemplo: ${prefix}info listanegra`,
          );
          break;

        case "git":
        case "git-bot":
        case "gitdobot":
        case "bronxys":
          reply(
            `🏆 Quer jogar no time dos campeões da hospedagem?
Então chega mais na bronxyshost.com
 😍 —
o líder absoluto em hospedagem e APIs no Brasil.

Aqui é jogo rápido:
⚡ Servidores turbo → zero lag, só velocidade de atleta olímpico
🛡️ Segurança de ponta → sua base sempre protegida no escudo
🤖 Estrutura de respeito → pensada pra bots, APIs e projetos de alto nível
💻 Suporte 24/7 → nunca abandona o campo, sempre pronto pro próximo round

🔥 BronxysHost: onde sua ideia entra em campo e sai campeã.`,
          );

          break;
        case "tutorial":
          reply(
            `Quer aprender a instalar o Aleatory sem complicação?
Então confere esse passo a passo que preparei pra você 👉 https://youtu.be/ymSaelbslXA?si=V17dWSScvGgwR9Nx`,
          );
          break;

        //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-/

        //_-2 ÁREA DE COMANDOS SÓ PRA ADMINISTRADORES

        case "get":
          {
            const msg = info?.message;
            const ctx = msg?.extendedTextMessage?.contextInfo;

            if (!ctx?.quotedMessage) {
              return reply("❌ Marque uma mensagem para pegar as infos.");
            }

            const quotedInfo = {
              mentionedJid: ctx.participant,
              stanzaId: ctx.stanzaId,
              message: ctx.quotedMessage,
            };

            console.log("[DEBUG] quotedInfo:", quotedInfo);

            reply(JSON.stringify(quotedInfo, null, 2));
          }
          break;
        case "addautorm":
        case "addautoban":
        case "listanegra":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!mrc_ou_numero)
            return reply(
              "Marque a mensagem do lixo com o comando!Então utilize o comando com o número do lixo que deseja adicionar na Lista Negra 🚯",
            );
          // Corrigido para Baileys 7.0+ - compatibilidade com LID
          if (isJidInList(mrc_ou_numero, dataGp[0].listanegra))
            return reply(
              "𝘀𝘴𝘵𝘦 𝘪𝘯𝘶́𝘵𝘪𝘭 𝘫𝘢 𝘦𝘴𝘵𝘢 𝘪𝘯𝘤𝘭𝘶𝘴𝘰 𝘯𝘢 𝘭𝘪𝘴𝘵𝘢 𝘯𝘦𝘨𝘳𝘢,𝘎𝘦 𝘦𝘭𝘦 𝘥𝘢 𝘢𝘴 𝘤𝘢𝘳𝘢𝘴 𝘱𝘰𝘳 𝘢𝘲𝘶𝘪 𝘪𝘳𝘦𝘪 𝘱𝘢𝘴𝘴𝘢𝘳 𝘢 𝘧𝘢𝘤𝘢 𝘴𝘦𝘮 𝘥𝘰́ 𝘦 𝘴𝘦𝘮 𝘗𝘪𝘦𝘥𝘢𝘥𝘦 🥱",
            );
          // Adicionar usando função que normaliza o JID
          addJidToList(mrc_ou_numero, dataGp[0].listanegra);
          setGp(dataGp);
          reply(
            `𝘗𝘰𝘳 𝘰𝘳𝘥𝘦𝘯𝘴 𝘥𝘰 𝘼𝘥𝘮𝘪𝘳𝘰 𝘦𝘶 𝘢𝘥𝘪𝘤𝘪𝘰𝘯𝘦𝘪 𝘦𝘴𝘵𝘦 𝘪𝘯𝘶́𝘵𝘪𝘭 𝘯𝘢 𝘭𝘪𝘴𝘵𝘢!𝘎𝘦 𝘦𝘭𝘦 𝘥𝘢 𝘢𝘴 𝘤𝘢𝘳𝘢𝘴 𝘱𝘰𝘳 𝘢𝘲𝘶𝘪 𝘫𝘰𝘶 𝘮𝘰𝘦𝘳 𝘯𝘢 𝘗𝘰𝘳𝘳𝘢𝘥𝘢 🤬`,
          );
          break;

        case "delremover":
        case "delautorm":
        case "delautoban":
        case "tirardalista":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!mrc_ou_numero)
            return reply(
              "Marque a mensagem do trouxa com o comando!Então utilize o comando com o número do trouxa que deseja tirar da Lista Negra 😒",
            );
          // Corrigido para Baileys 7.0+ - compatibilidade com LID
          if (!isJidInList(mrc_ou_numero, dataGp[0].listanegra))
            return reply("𝘀𝘴𝘵𝘦 𝘪𝘯𝘴𝘦𝘵𝘰 𝘯𝘢̃𝘰 𝘦𝘴𝘵𝘢 𝘪𝘯𝘤𝘭𝘶𝘴𝘰 🥱");
          // Remover usando função que normaliza o JID
          dataGp[0].listanegra = removeJidFromList(
            mrc_ou_numero,
            dataGp[0].listanegra,
          );
          setGp(dataGp);
          reply(
            `𝘗𝘰𝘳 𝘰𝘳𝘥𝘦𝘯𝘴 𝘥𝘰 𝘼𝘥𝘮𝘪𝘳𝘰 𝘦𝘶 𝘵𝘪𝘳𝘦𝘪 𝘦𝘴𝘴𝘦 𝘧𝘪 𝘥𝘦 𝘳𝘢𝘱𝘢𝘳𝘪𝘨𝘢 𝘥𝘢 𝘭𝘪𝘴𝘵𝘢 𝘯𝘦𝘨𝘳𝘢,𝘼𝘨𝘰𝘳𝘢 𝘦𝘭𝘦 𝘱𝘰𝘥𝘦 𝘦𝘯𝘵𝘳𝘢𝘳 𝘯𝘰 𝘂𝘳𝘶𝘱𝘰 🥱`,
          );
          break;

        case "listban":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (dataGp[0].listanegra.length < 1)
            return reply("*Nenhum Número não foi adicionado*");
          teks = "*Números que vou moer na porrada se voltar 😡:*\n";
          for (i = 0; i < dataGp[0].listanegra.length; ++i) {
            // Corrigido para Baileys 7.0+ - extrair número corretamente
            teks += `➞ *${extractNumber(dataGp[0].listanegra[i])}*\n`;
          }
          teks += "*Esses ai vou descer meu martelo do ban 🥵*";
          reply(teks);
          break;

        case "band":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          try {
            if (!menc_os2 || menc_jid2[1])
              return reply(
                "Marque a mensagem do inseto ou marque o @ dele.., lembre de só marcar um inseto por vez...",
              );
            if (IS_DELETE) {
              setTimeout(() => {
                conn.sendMessage(from, {
                  delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: info.key.id,
                    participant: sender,
                  },
                });
              }, 500);
            }
            if (!JSON.stringify().includes(menc_os2))
              return reply("Este inseto já levou um pé na bunda 🥱");
            if (botNumber.includes(menc_os2))
              return reply(
                "𝙉𝙖̃𝙤 𝙨𝙤𝙪 𝙗𝙚𝙨𝙩𝙖 𝙙𝙚 𝙧𝙚𝙢𝙤𝙫𝙚𝙧 𝙚𝙪 𝙢𝙚𝙨𝙢𝙤 𝙣𝙚́ 🙁𝙀𝙨𝙩𝙤𝙪 𝙢𝙪𝙞𝙩𝙤 𝙙𝙚𝙘𝙚𝙥𝙘𝙞𝙤𝙣𝙖𝙙𝙤 𝙘𝙤𝙢 𝙫𝙤𝙘𝙚̂, 🥹",
              );
            if (numerodono.includes(menc_os2))
              return reply(
                "Não posso remover meu dono né seu filho da puta 🖕🏿🤧",
              );
            conn.sendMessage(from, {
              text: `@${menc_os2.split("@")[0]} 𝘾𝘼𝙄 𝙁𝙊𝙍𝘼 🏌🏻‍♂️`,
              mentions: [menc_os2],
            });
            conn.groupParticipantsUpdate(from, [menc_os2], "remove");
          } catch (e) {
            console.log(e);
          }
          break;

        case "ban":
        case "kick":
        case "b":
        case "🤺":
        case "vaza":
        case "🏌🏻‍♂️":
        case "🔪":
          if (Os_Returns(true, true, true).true) {
            console.log({
              groupAdmins,
              sender,
              SoDono,
              numerodono,
              isBot,
              isnit,
              issupre,
              ischyt,
              numerodono_lid,
              botNumber,
              bot: conn.user,
            });
            return reply(Os_Returns(true, true, true).txt);
          }

          try {
            if (!menc_os2 || menc_jid2[1])
              return reply(
                "Marque a mensagem do humano ou marque o @ dele.., lembre de só marcar um trouxa por vez,ficarei feliz de passar a faca nele 😏͜🔪",
              );
            if (!JSON.stringify(groupMembers).includes(menc_os2))
              return reply(
                "Este trouxa já levou um pé na bunda ou saiu do grupo 😏",
              );
            if (botNumber.includes(menc_os2))
              return reply(
                "𝙉𝙖̃𝙤 𝙨𝙤𝙪 𝙗𝙚𝙨𝙩𝙖 𝙙𝙚 𝙧𝙚𝙢𝙤𝙫𝙚𝙧 𝙚𝙪 𝙢𝙚𝙨𝙢𝙤 𝙣𝙚́ 🙁𝙀𝙨𝙩𝙤𝙪 𝙢𝙪𝙞𝙩𝙤 𝙙𝙚𝙘𝙚𝙥𝙘𝙞𝙤𝙣𝙖𝙙𝙤 𝙘𝙤𝙢 𝙫𝙤𝙘𝙚̂, 🥹",
              );
            if (JSON.stringify(numerodono).indexOf(menc_os2) >= 0)
              return reply(
                "𝙉𝙖̃𝙤 𝙥𝙤𝙨𝙨𝙤 𝙧𝙚𝙢𝙤𝙫𝙚𝙧 𝙢𝙚𝙪 𝙙𝙤𝙣𝙤 𝙣𝙚́ 𝙨𝙚𝙪 𝙛𝙞𝙡𝙝𝙤 𝙙𝙖 𝙥𝙪𝙩𝙖 🖕🏿🤧",
              );

            // ═══ Reação de faca na mensagem do banido ═══
            const _banQuoted = info.message?.extendedTextMessage?.contextInfo;
            const _banStanzaId = _banQuoted?.stanzaId;
            const _banParticipant = _banQuoted?.participant || menc_os2;

            // Se foi banido marcando a mensagem dele, reagir com faca e apagar
            if (_banStanzaId) {
              // Reação de faca 🔪
              try {
                await conn.sendMessage(from, {
                  react: { text: "🔪", key: { remoteJid: from, id: _banStanzaId, participant: _banParticipant } }
                });
              } catch { }

              // Apagar a mensagem do banido após 1.5s
              setTimeout(async () => {
                try {
                  await conn.sendMessage(from, {
                    delete: { remoteJid: from, id: _banStanzaId, participant: _banParticipant, fromMe: false }
                  });
                } catch { }
              }, 1500);
            }

            // Mensagem de ban
            conn.sendMessage(from, {
              text: TEXTOS_GERAL.COMANDO_BAN_MENSAGEM.replaceAll(
                "#usuario#",
                "@" + menc_os2.split("@")[0],
              ),
              mentions: [menc_os2],
            });
            conn.groupParticipantsUpdate(from, [menc_os2], "remove");
            clearUserWarnings(from, menc_os2);
          } catch (e) {
            console.log(e);
          }
          break;

        case "promover":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (isAudioMenu) {
            conn.sendMessage(
              from,
              {
                audio: { url: "./dados/audios/promover.ogg" },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              },
              { quoted: info },
            );
          }
          if (!menc_os2 || menc_jid2[1])
            return reply(
              "Marque a mensagem do cara ou marque o @ dele.., lembre de só marcar um por vez 🥱",
            );
          if (!JSON.stringify(groupMembers).includes(menc_os2))
            return reply(
              "Este inseto foi removido do grupo ou saiu, não será possível promover..",
            );
          conn.sendMessage(from, {
            text: TEXTOS_GERAL.COMANDO_PROMOVEU_MENSAGEM.replace(
              "#usuario#",
              "@" + menc_os2.split("@")[0],
            ),
            mentions: [menc_os2],
          });
          conn.groupParticipantsUpdate(from, [menc_os2], "promote");
          break;

        case "rebaixar":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!menc_os2 || menc_jid2[1])
            return reply("Marque a mensagem do cara ou marque o @ dele 🥱");
          if (!JSON.stringify(groupMembers).includes(menc_os2))
            return reply(
              "Este inseto foi removido do grupo ou saiu, não será possível rebaixar 🥱",
            );
          conn.sendMessage(from, {
            text: TEXTOS_GERAL.COMANDO_REBAIXOU_MENSAGEM.replaceAll(
              "#usuario#",
              "@" + menc_os2.split("@")[0],
            ),
            mentions: [menc_os2],
          });
          conn.groupParticipantsUpdate(from, [menc_os2], "demote");
          break;

        case "sorteionumero":
        case "sorteionumeros":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          try {
            if (!q.trim())
              return reply(
                `Coloque algo, após o comando sorteio, por exemplo, ${prefix}sorteionumero de 100 R$`,
              );
            let rs_ = `🎉Parabéns ao número do sortudo, por ganhar o sorteio ${q}:\n\n🔥፝⃟  ➣ Número: [ ${Math.floor(Math.random() * groupMembers.length) + 1
              } ]\n`;
            reply(rs_);
          } catch (e) {
            console.log(e);
            reply("Deu erro, tente novamente :/");
          }
          break;

        case "sorteio":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          try {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!q.trim())
              return reply(
                `Coloque algo, após o comando sorteio, por exemplo, ${prefix}sorteio de 100 R$`,
              );
            d = [];
            teks = `🎉Parabéns, por ganhar o sorteio ${q}:\n\n`;
            for (i = 0; i < 1; i++) {
              r = Math.floor(
                Math.random() * groupMetadata?.participants.length || 0 + 0,
              );
              teks += `🔥፝⃟  ➣ @${groupMembers[r].id.split("@")[0]}\n`;
              d.push(groupMembers[r].id);
            }
            mentions(teks, d, true);
          } catch (e) {
            console.log(e);
            reply("Deu erro, tente novamente :/");
          }
          break;

        case "rankinativo":
        case "rankinativos":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          await LIMPARDOCNT_QUEMJASAIU();
          bule = [];
          bule2 = [];
          mentioned_jid = [];
          for (cag of countMessage[ind].numbers) {
            bule2.push(cag.id);
            if (cag.messages <= 1) {
              bule.push(cag);
            }
          }
          bule.sort((a, b) =>
            a.messages + a.cmd_messages < b.cmd_messages + b.messages ? 0 : -1,
          );
          boardi = "╭──────────────────╮\n│ 👻 *RANK GHOSTS DO GRUPO*\n╰──────────────────╯\n\n";
          if (bule.length == 0) boardi += "✅ Sem Ghosts";
          for (i = 0; i < (bule.length < 5 ? bule.length : 5); i++) {
            if (i != null) {
              // Resolver LID → número real
              let _rkiJid = bule[i].id;
              let _rkiNum = _rkiJid.split("@")[0];
              if (_rkiNum.length > 15 && groupMembers && groupMembers.length > 0) {
                const _rkiFound = groupMembers.find(p => {
                  const pLid = (p.lid || "").split("@")[0];
                  const pId = (p.id || "").split("@")[0];
                  return pLid === _rkiNum || pId === _rkiNum;
                });
                if (_rkiFound && _rkiFound.id) {
                  const _rkiReal = _rkiFound.id.split("@")[0];
                  if (_rkiReal.length <= 15) {
                    _rkiNum = _rkiReal;
                    _rkiJid = _rkiReal + "@s.whatsapp.net";
                  }
                }
              }
              boardi += `${i + 1}º : @${_rkiNum}\n💬 Mensagens: ${bule[i].messages}\n🤖 Comandos: ${bule[i].cmd_messages}\n📱 Aparelho: ${bule[i].aparelho}\n\n`;
              mentioned_jid.push(_rkiJid);
            }
          }
          mentions(boardi, mentioned_jid, true);
          break;

        case "advertir":
        case "adverter":
        case "adv":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);

            let _advTarget =
              menc_os2 ||
              (isQuotedMsg ? quotedMsg.participant || quotedMsg.sender : null);
            // Extrair motivo: tudo depois do @menção ou número
            let _advMotivo = "Sem motivo";
            if (q && q.trim()) {
              // Se não tem alvo ainda, primeiro elemento pode ser número
              if (!_advTarget) {
                const _parts = q.trim().split(/\s+/);
                const _numPart = _parts[0].replace(/[^0-9]/g, "");
                if (_numPart.length >= 8) {
                  _advTarget = _numPart + "@s.whatsapp.net";
                  if (_parts.length > 1) _advMotivo = _parts.slice(1).join(" ");
                }
              } else {
                // Já tem alvo por menção/quote, todo o q é motivo
                _advMotivo = q.trim() || "Sem motivo";
              }
            }
            if (!_advTarget)
              return reply(
                `❌ Marque ou responda alguém.\n💡 ${prefix}adv @user motivo`,
              );
            if (_advTarget == botNumber)
              return reply("Não pode advertir o próprio bot 🤨");
            if (_advTarget == nmrdn)
              return reply("Não pode advertir o dono do bot 🤨");
            if (groupAdmins.includes(_advTarget))
              return reply("Não pode advertir ADMS 🙄");

            // Resolver LID para menção
            let _advJid = _advTarget;
            if (groupMembers && groupMembers.length > 0) {
              const _advN = extractNumber(_advTarget);
              const _advF = groupMembers.find(
                (gm) =>
                  extractNumber(typeof gm.id === "string" ? gm.id : "") ===
                  _advN,
              );
              if (_advF && _advF.id)
                _advJid = _advF.id.includes(":")
                  ? _advF.id.split(":")[0] + "@s.whatsapp.net"
                  : _advF.id;
            }
            const _advDisplay = extractNumber(_advJid);

            const _advCount = addWarning(from, _advTarget, _advMotivo);

            if (_advCount >= 3) {
              try {
                await conn.sendMessage(from, {
                  text: `🚫 @${_advDisplay} *BANIDO*\n⚠️ ${_advCount}/3 advertências\n📝 Motivo: ${_advMotivo}`,
                  mentions: [_advJid],
                });
                await conn.groupParticipantsUpdate(
                  from,
                  [_advTarget],
                  "remove",
                );
                clearUserWarnings(from, _advTarget);
              } catch { }
            } else {
              await conn.sendMessage(
                from,
                {
                  text: `⚠️ @${_advDisplay} *ADVERTÊNCIA ${_advCount}/3*\n📝 Motivo: ${_advMotivo}\n🔨 Por: @${sender.split("@")[0]}\n🚫 Com 3 = *BAN*`,
                  mentions: [_advJid, sender],
                },
                { quoted: info },
              );
            }
          }
          break;

        case "advertidos":
        case "listadv":
        case "listaadv": {
          if (!isGroup) return reply(Res_SoGrupo);

          await conn.sendMessage(from, {
            react: { text: "⚠️", key: info.key },
          });
          const _advList = getAllWarnings(from);
          if (_advList.length === 0) {
            return reply("✅ Nenhum advertido neste grupo.");
          }

          const _advMentions = [];
          let _advTxt = `╭──────────────────╮\n│ ⚠️ *ADVERTIDOS*\n│ ${groupName}\n╰──────────────────╯\n\n`;

          _advList.forEach((w, i) => {
            // Usar numero puro (key armazenada) para display e mencao
            const _wDisplay = w.number;
            const _wJid = _wDisplay + "@s.whatsapp.net";
            _advMentions.push(_wJid);

            _advTxt += `╭──────────────────╮\n`;
            _advTxt += `│ *${i + 1}.* ⚠️ @${_wDisplay}\n`;
            _advTxt += `│ 🔢 ${w.count}/3 advertências\n`;

            // Mostrar cada motivo com data
            if (w.reasons && w.reasons.length > 0) {
              w.reasons.forEach((r, ri) => {
                const _rDate = r.date
                  ? moment(r.date).tz("America/Sao_Paulo").format("DD/MM HH:mm")
                  : "???";
                _advTxt += `│ ${ri + 1}. ${r.reason} • ${_rDate}\n`;
              });
            }
            _advTxt += `╰──────────────────╯\n`;
            if (i < _advList.length - 1) _advTxt += `\n`;
          });

          _advTxt += `> 💡 *${prefix}deladv @user* — remove se tiver apenas 1 adv \n> 💡 *${prefix}deladv1 @user* — remover adv 1\n> 💡 *${prefix}deladv2 @user* — remover adv 2\n> 🧹 *${prefix}limparadv* — limpar todos`;

          try {
            const _advBannerBuf = fs.readFileSync(
              "./dados/advertidos_banner.png",
            );
            await conn.sendMessage(
              from,
              {
                image: _advBannerBuf,
                caption: _advTxt,
                mentions: _advMentions,
              },
              { quoted: info },
            );
          } catch {
            await conn.sendMessage(
              from,
              {
                text: _advTxt,
                mentions: _advMentions,
              },
              { quoted: info },
            );
          }
          break;
        }

        case "deladv":
        case "deladv1":
        case "deladv2":
        case "removeradv":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!isGroupAdmins) return reply(Res_SoAdm);

            let _rAdvAlvo =
              menc_os2 ||
              (isQuotedMsg ? quotedMsg.participant || quotedMsg.sender : null);
            if (!_rAdvAlvo && q && q.trim()) {
              const _n = q.trim().replace(/[^0-9]/g, "");
              if (_n.length >= 8) _rAdvAlvo = _n + "@s.whatsapp.net";
            }
            if (!_rAdvAlvo)
              return reply(
                `❌ Marque alguém.\n💡 ${prefix}deladv1 @user ou ${prefix}deladv2 @user`,
              );

            const _rUserCount = getWarningCount(from, _rAdvAlvo);
            if (_rUserCount <= 0)
              return reply("❌ Esse usuário não tem advertências.");

            // Determinar qual advertencia remover
            let _advIdxToRemove = -1;

            if (command === "deladv1") {
              _advIdxToRemove = 0;
            } else if (command === "deladv2") {
              if (_rUserCount < 2)
                return reply(
                  `❌ O usuário só tem *${_rUserCount}/3* advertência(s).\nNão existe advertência 2 para remover.`,
                );
              _advIdxToRemove = 1;
            } else {
              // comando generico !deladv
              if (_rUserCount === 1) {
                _advIdxToRemove = 0; // so tem 1, remove ela
              } else {
                // 2+ advertencias: avisar para escolher
                return reply(
                  `⚠️ O usuário tem *${_rUserCount}/3* advertências.\n\n💡 Escolha qual remover:\n• *${prefix}deladv1 @user* — Remover advertência 1\n• *${prefix}deladv2 @user* — Remover advertência 2\n\n📋 Use *${prefix}advertidos* para ver os motivos antes de decidir.`,
                );
              }
            }

            const _removed = removeWarningByIndex(
              from,
              _rAdvAlvo,
              _advIdxToRemove,
            );
            if (!_removed) return reply("❌ Erro ao remover advertência.");

            let _rJid = _rAdvAlvo;
            if (groupMembers && groupMembers.length > 0) {
              const _rN = extractNumber(_rAdvAlvo);
              const _rF = groupMembers.find(
                (gm) =>
                  extractNumber(typeof gm.id === "string" ? gm.id : "") === _rN,
              );
              if (_rF && _rF.id)
                _rJid = _rF.id.includes(":")
                  ? _rF.id.split(":")[0] + "@s.whatsapp.net"
                  : _rF.id;
            }
            const _newCount = getWarningCount(from, _rAdvAlvo);
            await conn.sendMessage(
              from,
              {
                text: `✅ Advertência *${_advIdxToRemove + 1}* removida de @${extractNumber(_rJid)}\n⚠️ Agora: *${_newCount}/3*`,
                mentions: [_rJid],
              },
              { quoted: info },
            );
          }
          break;

        case "grupo":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            if (args[0] === "a") {
              reply(
                TEXTOS_GERAL?.MENSAGEM_GRUPO_ABRIU
                  ? TEXTOS_GERAL?.MENSAGEM_GRUPO_ABRIU
                  : `🚨>𝗚𝗥𝗨𝗣𝗢 𝗔𝗕𝗘𝗥𝗧𝗢<🚨\n𝘽𝙤𝙧𝙖 𝙛𝙤𝙛𝙤𝙘𝙖𝙧 𝙜𝙖𝙡𝙚𝙧𝙖 𝙛𝙖𝙡𝙖𝙧 𝙙𝙖 𝙫𝙞𝙙𝙖 𝙙𝙤𝙨 𝙫𝙞𝙯𝙞𝙣𝙝𝙤𝙨😏`,
              );
              conn.groupSettingUpdate(from, "not_announcement");
            } else if (args[0] === "f") {
              reply(
                TEXTOS_GERAL?.MENSAGEM_GRUPO_FECHOU
                  ? TEXTOS_GERAL?.MENSAGEM_GRUPO_FECHOU
                  : `❌𝗚𝗥𝗨𝗣𝗢 𝗙𝗘𝗖𝗛𝗔𝗗𝗢❌\n𝙋𝙤𝙧 𝙝𝙤𝙟𝙚 𝙗𝙖𝙨𝙩𝙖, 𝙨𝙚𝙪𝙨 𝙛𝙤𝙛𝙤𝙦𝙪𝙚𝙞𝙧𝙤𝙨 𝙫𝙖̃𝙤 𝙙𝙤𝙧𝙢𝙞𝙧 𝙖𝙩𝙚́ 𝙖𝙢𝙖𝙣𝙝𝙖̃🥱`,
              );
              conn.groupSettingUpdate(from, "announcement");
            }
          }
          break;

        // ═══ SISTEMA DE HORÁRIOS AUTOMÁTICOS ═══
        case "fechargp": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply(
              `│\n│  🔒 *FECHAR GRUPO AUTOMÁTICO*\n├──────────────\n│\n│  📌 *Formatos:*\n│\n│  *Diário (recorrente):*\n│  ${prefix}fechargp diario 23:00\n│\n│  *Data específica:*\n│  ${prefix}fechargp data 25/03/2026 22:30\n│\n├──────────────\n│  ⏰ _Fuso: Brasília (UTC-3)_`,
            );

          const _fcArgs = q.trim().split(" ");
          const _fcModo = _fcArgs[0]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          if (_fcModo === "diario") {
            const _fcHora = _fcArgs[1];
            if (!_fcHora || !/^\d{2}:\d{2}$/.test(_fcHora))
              return reply("❌ Formato inválido. Use: HH:MM (ex: 23:00)");
            const [_h, _m] = _fcHora.split(":").map(Number);
            if (_h < 0 || _h > 23 || _m < 0 || _m > 59)
              return reply("❌ Horário inválido.");
            const _fcId1 = addHorario(
              from,
              "fechar",
              "diario",
              _fcHora,
              sender,
            );
            reply(
              `╔══════════════════════════╗\n║  ✅ *FECHAMENTO PROGRAMADO*   ║\n╚══════════════════════════╝\n\n🔒 Modo: *Diário* (repete todo dia)\n🕐 Horário: *${_fcHora}*\n⏰ Fuso: Brasília (UTC-3)\n🆔 ID: *${_fcId1}*\n\n💡 *${prefix}listahorarios* ─ Ver todos\n🗑️ *${prefix}delhorario ${_fcId1}* ─ Remover`,
            );
          } else if (_fcModo === "data") {
            const _fcData = _fcArgs[1];
            const _fcHoraD = _fcArgs[2];
            if (!_fcData || !_fcHoraD)
              return reply("❌ Use: data DD/MM/YYYY HH:MM");
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(_fcData))
              return reply("❌ Data inválida. Use: DD/MM/YYYY");
            if (!/^\d{2}:\d{2}$/.test(_fcHoraD))
              return reply("❌ Horário inválido. Use: HH:MM");
            const _fcId2 = addHorario(
              from,
              "fechar",
              "data",
              `${_fcData} ${_fcHoraD}`,
              sender,
            );
            reply(
              `╔══════════════════════════╗\n║  ✅ *FECHAMENTO PROGRAMADO*   ║\n╚══════════════════════════╝\n\n🔒 Modo: *Data específica* (única vez)\n📅 Data: *${_fcData}*\n🕐 Horário: *${_fcHoraD}*\n🆔 ID: *${_fcId2}*\n\n💡 *${prefix}listahorarios* ─ Ver todos\n🗑️ *${prefix}delhorario ${_fcId2}* ─ Remover`,
            );
          } else {
            reply(
              `❌ Modo inválido. Use *diario* ou *data*.\n\nEx: ${prefix}fechargp diario 23:00\nEx: ${prefix}fechargp data 25/03/2026 22:30`,
            );
          }
          break;
        }

        case "abrirgp": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply(
              `│\n│  🔓 *ABRIR GRUPO AUTOMÁTICO*\n├──────────────\n│\n│  📌 *Formatos:*\n│\n│  *Diário (recorrente):*\n│  ${prefix}abrirgp diario 10:00\n│\n│  *Data específica:*\n│  ${prefix}abrirgp data 25/03/2026 08:00\n│\n├──────────────\n│  ⏰ _Fuso: Brasília (UTC-3)_`,
            );

          const _abArgs = q.trim().split(" ");
          const _abModo = _abArgs[0]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          if (_abModo === "diario") {
            const _abHora = _abArgs[1];
            if (!_abHora || !/^\d{2}:\d{2}$/.test(_abHora))
              return reply("❌ Formato inválido. Use: HH:MM (ex: 10:00)");
            const [_h2, _m2] = _abHora.split(":").map(Number);
            if (_h2 < 0 || _h2 > 23 || _m2 < 0 || _m2 > 59)
              return reply("❌ Horário inválido.");
            const _abId1 = addHorario(from, "abrir", "diario", _abHora, sender);
            reply(
              `╔══════════════════════════╗\n║  ✅ *ABERTURA PROGRAMADA*     ║\n╚══════════════════════════╝\n\n🔓 Modo: *Diário* (repete todo dia)\n🕐 Horário: *${_abHora}*\n⏰ Fuso: Brasília (UTC-3)\n🆔 ID: *${_abId1}*\n\n💡 *${prefix}listahorarios* ─ Ver todos\n🗑️ *${prefix}delhorario ${_abId1}* ─ Remover`,
            );
          } else if (_abModo === "data") {
            const _abData = _abArgs[1];
            const _abHoraD = _abArgs[2];
            if (!_abData || !_abHoraD)
              return reply("❌ Use: data DD/MM/YYYY HH:MM");
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(_abData))
              return reply("❌ Data inválida. Use: DD/MM/YYYY");
            if (!/^\d{2}:\d{2}$/.test(_abHoraD))
              return reply("❌ Horário inválido. Use: HH:MM");
            const _abId2 = addHorario(
              from,
              "abrir",
              "data",
              `${_abData} ${_abHoraD}`,
              sender,
            );
            reply(
              `╔══════════════════════════╗\n║  ✅ *ABERTURA PROGRAMADA*     ║\n╚══════════════════════════╝\n\n🔓 Modo: *Data específica* (única vez)\n📅 Data: *${_abData}*\n🕐 Horário: *${_abHoraD}*\n🆔 ID: *${_abId2}*\n\n💡 *${prefix}listahorarios* ─ Ver todos\n🗑️ *${prefix}delhorario ${_abId2}* ─ Remover`,
            );
          } else {
            reply(
              `❌ Modo inválido. Use *diario* ou *data*.\n\nEx: ${prefix}abrirgp diario 10:00\nEx: ${prefix}abrirgp data 25/03/2026 08:00`,
            );
          }
          break;
        }

        case "listahorarios":
        case "listahorario":
        case "verhorarios":
        case "horarios": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          const _vhList = listarHorarios(from);
          if (!_vhList || _vhList.length === 0) {
            return reply(
              `    ╭━━━━━━━━━━━━━━━╮\n    ┃  📅  *HORÁRIOS PROGRAMADOS*\n    ╰━━━━━━━━━━━━━━━╯\n\n   _Nenhum horário configurado._\n\n   ▸ *${prefix}fechargp* — Fechamento\n   ▸ *${prefix}abrirgp* — Abertura\n   ▸ *${prefix}infofechargp* — Tutorial`,
            );
          }

          const _aberturas = _vhList.filter((h) => h.tipo === "abrir");
          const _fechamentos = _vhList.filter((h) => h.tipo === "fechar");

          let _vhTxt = `    ╭━━━━━━━━━━━━━━━╮\n    ┃  📅  *HORÁRIOS PROGRAMADOS*\n    ╰━━━━━━━━━━━━━━━╯\n`;

          if (_aberturas.length > 0) {
            _vhTxt += `\n   🔓 *ABERTURAS*\n`;
            let _abN = 1;
            for (const a of _aberturas) {
              _vhTxt += `\n   ╭──────────────\n`;
              if (a.modo === "diario") {
                _vhTxt += `   │ *${_abN}.* ⏰ Hora: *${a.valor}*\n   │ 🔄 Modo: Diário\n`;
              } else {
                const _parts = a.valor.split(" ");
                const _dt = _parts[0] || a.valor;
                const _hr = _parts[1] || "";
                _vhTxt += `   │ *${_abN}.* ⏰ Hora: *${_hr}*\n   │ 📅 Data: *${_dt}* _(única)_\n`;
              }
              _vhTxt += `   │ 🆔 ID: *${a.id}*\n   ╰──────────────\n`;
              _abN++;
            }
          }

          if (_fechamentos.length > 0) {
            _vhTxt += `\n   🔒 *FECHAMENTOS*\n`;
            let _fcN = 1;
            for (const f of _fechamentos) {
              _vhTxt += `\n   ╭──────────────\n`;
              if (f.modo === "diario") {
                _vhTxt += `   │ *${_fcN}.* ⏰ Hora: *${f.valor}*\n   │ 🔄 Modo: Diário\n`;
              } else {
                const _parts = f.valor.split(" ");
                const _dt = _parts[0] || f.valor;
                const _hr = _parts[1] || "";
                _vhTxt += `   │ *${_fcN}.* ⏰ Hora: *${_hr}*\n   │ 📅 Data: *${_dt}* _(única)_\n`;
              }
              _vhTxt += `   │ 🆔 ID: *${f.id}*\n   ╰──────────────\n`;
              _fcN++;
            }
          }

          _vhTxt += `\n   ╭──── ℹ️ ─────╮\n   │ 🌐 Fuso: *Brasília (UTC-3)*\n   │ 🔄 _Diário = repete todo dia_\n   │ 📅 _Única = executa e apaga_\n   ╰──────────────╯\n\n   ▸ *${prefix}removerhorario <ID>*\n   ▸ *${prefix}zerarhorarios* — Limpar\n   ▸ *${prefix}infofechargp* — Tutorial`;
          reply(_vhTxt);
          break;
        }

        case "zerarhorarios":
        case "limparhorarios": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          zerarHorariosGrupo(from);
          reply(
            `╔══════════════════════════╗\n║  ♻️ *HORÁRIOS ZERADOS*         ║\n╚══════════════════════════╝\n\nTodas as programações deste grupo\nforam removidas com sucesso.\n\n💡 *${prefix}fechargp* ─ Novo fechamento\n💡 *${prefix}abrirgp* ─ Nova abertura`,
          );
          break;
        }

        case "delhorario":
        case "removerhorario":
        case "deletarhorario": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          const _delId = q.trim();
          if (!_delId)
            return reply(
              `❌ Informe o ID do horário.\n\n💡 Use *${prefix}listahorarios* para ver os IDs.\n\nExemplo: *${prefix}delhorario m4x7kp2*`,
            );
          const _delOk = removeHorario(from, _delId);
          if (_delOk) {
            reply(
              `✅ Horário *${_delId}* removido com sucesso!\n\n💡 *${prefix}listahorarios* ─ Ver restantes`,
            );
          } else {
            reply(
              `❌ Horário com ID *${_delId}* não encontrado.\n\n💡 Use *${prefix}listahorarios* para ver os IDs corretos.`,
            );
          }
          break;
        }

        case "infofechargp": {
          const _ifcTxt = `╔══════════════════════════╗
║  📖 *GUIA: FECHAMENTO AUTO*   ║
╚══════════════════════════╝

🔒 O comando *${prefix}fechargp* programa
o fechamento automático do grupo.

╭── 📝 *COMO USAR* ──────────
│
│  *1️⃣ Diário (repete todo dia):*
│  ${prefix}fechargp diario HH:MM
│
│  💡 _${prefix}fechargp diario 23:00_
│  ↳ Fecha todo dia às 23h
│
│  💡 _${prefix}fechargp diario 01:30_
│  ↳ Fecha todo dia à 1:30
│
│  *2️⃣ Data específica (uma vez):*
│  ${prefix}fechargp data DD/MM/AAAA HH:MM
│
│  💡 _${prefix}fechargp data 25/03/2026 22:30_
│  ↳ Fecha só nesta data/hora
│  ↳ Auto-removido após executar
│
╭── ⚙️ *FUNCIONAMENTO* ──────────
│
│  ⏱️ Verifica a cada *60 segundos*
│  🌎 Fuso: *Brasília (UTC-3)*
│  📊 Pode ter *vários* horários
│  🆔 Cada horário tem um *ID único*
│  📅 Horários de data são removidos
│     automaticamente após execução
│
╭── 🛠️ *TODOS OS COMANDOS* ──────────
│
│  🔒 *${prefix}fechargp* ─ Programar fechamento
│  🔓 *${prefix}abrirgp* ─ Programar abertura
│  📋 *${prefix}listahorarios* ─ Ver programações
│  🗑️ *${prefix}delhorario <ID>* ─ Remover 1
│  ♻️ *${prefix}zerarhorarios* ─ Limpar todos
│
╭── 💡 *DICA* ──────────
│
│  Ao criar um horário, o bot mostra
│  o 🆔 ID. Guarde-o caso queira
│  remover depois com ${prefix}delhorario`;
          try {
            await conn.sendMessage(
              from,
              {
                image: {
                  url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=90",
                },
                caption: _ifcTxt,
              },
              { quoted: info },
            );
          } catch {
            reply(_ifcTxt);
          }
          break;
        }

        case "infoabrirgp": {
          const _iabTxt = `╔══════════════════════════╗
║  📖 *GUIA: ABERTURA AUTO*     ║
╚══════════════════════════╝

🔓 O comando *${prefix}abrirgp* programa
a abertura automática do grupo.

╭── 📝 *COMO USAR* ──────────
│
│  *1️⃣ Diário (repete todo dia):*
│  ${prefix}abrirgp diario HH:MM
│
│  💡 _${prefix}abrirgp diario 10:00_
│  ↳ Abre todo dia às 10h
│
│  💡 _${prefix}abrirgp diario 07:00_
│  ↳ Abre todo dia às 7h da manhã
│
│  *2️⃣ Data específica (uma vez):*
│  ${prefix}abrirgp data DD/MM/AAAA HH:MM
│
│  💡 _${prefix}abrirgp data 25/03/2026 08:00_
│  ↳ Abre só nesta data/hora
│  ↳ Auto-removido após executar
│
╭── ⚙️ *FUNCIONAMENTO* ──────────
│
│  ⏱️ Verifica a cada *60 segundos*
│  🌎 Fuso: *Brasília (UTC-3)*
│  📢 Ao abrir, *menciona todos*
│  📊 Pode ter *vários* horários
│  🆔 Cada horário tem um *ID único*
│
╭── 🛠️ *TODOS OS COMANDOS* ──────────
│
│  🔓 *${prefix}abrirgp* ─ Programar abertura
│  🔒 *${prefix}fechargp* ─ Programar fechamento
│  📋 *${prefix}listahorarios* ─ Ver programações
│  🗑️ *${prefix}delhorario <ID>* ─ Remover 1
│  ♻️ *${prefix}zerarhorarios* ─ Limpar todos
│
╭── 💡 *DICA* ──────────
│
│  Ao criar um horário, o bot mostra
│  o 🆔 ID. Guarde-o caso queira
│  remover depois com ${prefix}delhorario`;
          try {
            await conn.sendMessage(
              from,
              {
                image: {
                  url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=90",
                },
                caption: _iabTxt,
              },
              { quoted: info },
            );
          } catch {
            reply(_iabTxt);
          }
          break;
        }

        // ═══ FIM SISTEMA DE HORÁRIOS ═══

        case "grupoinfo":
        case "infogrupo":
        case "infogp":
        case "gpinfo":
        case "regras":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            let ppUrl;
            try {
              ppUrl = await conn.profilePictureUrl(from, "image");
            } catch {
              ppUrl = `https://telegra.ph/file/6ca032835ed7a16748b6f.jpg`;
            }
            conn.sendMessage(
              from,
              {
                image: { url: ppUrl },
                caption: `*NOME* : ${groupName}\n*MEMBRO* : ${groupMembers.length}\n*ADMIN* : ${groupAdmins.length}\n*DESCRIÇÃO* : ${groupDesc}`,
                thumbnail: null,
              },
              { quoted: info },
            );
          }
          break;

        case "totag":
        case "cita":
        case "hidetag":
          {
            const permCheck = Os_Returns(true, true, true);
            if (permCheck.true) return reply(permCheck.txt);

            if (!groupMembers || groupMembers.length === 0) {
              return reply(
                "❌ Não foi possível obter a lista de membros do grupo.",
              );
            }

            const mentions = groupMembers
              .map((i) => getParticipantId(i))
              .filter(Boolean);

            const rsm =
              info.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
              null;

            let DFC = {};
            if (!rsm && q && q.trim().length > 0) {
              DFC = {
                text: q.trim(),
              };
            } else if (rsm) {
              if (rsm.imageMessage) {
                DFC = {
                  image: await getFileBuffer(rsm.imageMessage, "image"),
                  caption: rsm.imageMessage.caption || "",
                };
              } else if (rsm.videoMessage) {
                DFC = {
                  video: await getFileBuffer(rsm.videoMessage, "video"),
                  caption: rsm.videoMessage.caption || "",
                };
              } else if (rsm.documentMessage) {
                DFC = {
                  document: await getFileBuffer(
                    rsm.documentMessage,
                    "document",
                  ),
                  mimetype: rsm.documentMessage.mimetype,
                  fileName: rsm.documentMessage.fileName,
                  caption: rsm.documentMessage.caption || "",
                };
              } else if (rsm.audioMessage) {
                DFC = {
                  audio: await getFileBuffer(rsm.audioMessage, "audio"),
                  mimetype: "audio/ogg; codecs=opus",
                  ptt: true,
                };
              } else if (rsm.stickerMessage) {
                DFC = {
                  sticker: await getFileBuffer(rsm.stickerMessage, "sticker"),
                };
              } else if (rsm.conversation) {
                DFC = {
                  text: rsm.conversation,
                };
              } else if (rsm.extendedTextMessage?.text) {
                DFC = {
                  text: rsm.extendedTextMessage.text,
                };
              } else {
                return reply("❌ Tipo de mensagem não suportado para hidetag.");
              }
            } else {
              return reply("❌ Use `!hidetag texto` ou marque uma mensagem.");
            }

            await conn
              .sendMessage(from, {
                ...DFC,
                mentions,
              })
              .catch((e) => {
                console.error("❌ Erro ao enviar hidetag:", e);
                reply("❌ Erro ao enviar mensagem com hidetag.");
              });
          }
          break;
        case "marca":
        case "marcar":
          if (!isGroup) return reply(enviar.msg.grupo);
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          async function marcac() {
            let bla = [];
            blad = `\n𝑀𝐸𝑀𝐵𝑅𝑂𝑆 𝐶𝑂𝑀𝑈𝑀\n𝐵𝑂𝑇: ${NomeDoBot}\n\n-_- Do Grupo: ${groupName} -_-${!q ? "" : `\n\n~» Mensagem: ${q}`
              }\n\n`;
            for (let i of somembros) {
              blad += `✥➤ @${i.split("@")[0]}\n\n`;
              bla.push(i);
            }
            blam = JSON.stringify(somembros);
            if (blam.length == 2)
              return reply(
                `Não ontêm Membros comum no Grupo: ${groupName}, apenas - [ ADMINISTRADORES 🥱 ]`,
              );

            const rsm =
              info.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
              null;

            if (rsm) {
              let DFC = {};
              if (rsm.imageMessage) {
                DFC = {
                  image: await getFileBuffer(rsm.imageMessage, "image"),
                  caption: blad,
                };
              } else if (rsm.videoMessage) {
                DFC = {
                  video: await getFileBuffer(rsm.videoMessage, "video"),
                  caption: blad,
                };
              } else if (rsm.documentMessage) {
                DFC = {
                  document: await getFileBuffer(
                    rsm.documentMessage,
                    "document",
                  ),
                  mimetype: rsm.documentMessage.mimetype,
                  fileName: rsm.documentMessage.fileName,
                  caption: blad,
                };
              } else if (rsm.audioMessage) {
                DFC = {
                  audio: await getFileBuffer(rsm.audioMessage, "audio"),
                  mimetype: "audio/ogg; codecs=opus",
                  ptt: true,
                };
                await conn.sendMessage(from, DFC, { quoted: info });
                return mentions(blad, bla, true);
              } else if (rsm.stickerMessage) {
                DFC = {
                  sticker: await getFileBuffer(rsm.stickerMessage, "sticker"),
                };
                await conn.sendMessage(from, DFC, { quoted: info });
                return mentions(blad, bla, true);
              }

              if (DFC.image || DFC.video || DFC.document) {
                return conn.sendMessage(from, { ...DFC, mentions: bla });
              }
            }

            mentions(blad, bla, true);
          }
          marcac().catch((e) => {
            console.log(e);
          });
          break;

        case "marcar2":
          try {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            if (q.includes(`${prefix}`))
              return reply("Não pode utilizar comandos nesse comando");
            members_id = [];
            teks = args.length > 1 ? body.slice(8).trim() : "";
            teks += "\n\n";
            for (let mem of groupMembers) {
              teks += `╠➥ @${mem.id.split("@")[0]}\n`;
              members_id.push(mem.id);
            }
            reply(teks);
          } catch {
            reply("ERROR... 🥱");
          }
          break;

        case "marcarwa":
          try {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            if (q.includes(`${prefix}`))
              return reply("Não pode utilizar comandos nesse comando 🙄");
            members_id = [];
            teks = args.length > 1 ? body.slice(10).trim() : "";
            teks += "\n\n";
            for (let mem of groupMembers) {
              teks += `╠➥ https://wa.me/${mem.id.split("@")[0]}\n`;
              members_id.push(mem.id);
            }
            conn.sendMessage(from, { text: teks }, { quoted: info });
          } catch {
            reply("ERROR... 🥱");
          }
          break;

        case "nomegp":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          blat = args.join(" ");
          conn.groupUpdateSubject(from, `${blat}`);
          conn.sendMessage(
            from,
            { text: "Sucesso, alterou o nome do grupo" },
            { quoted: info },
          );
          break;

        case "descgp":
        case "descriçãogp":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          blabla = args.join(" ");
          conn.groupUpdateDescription(from, `${blabla}`);
          conn.sendMessage(
            from,
            { text: "Sucesso, alterou a descrição do grupo" },
            { quoted: info },
          );
          break;

        case "setfotogp":
        case "fotogp":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!isQuotedImage)
            return reply(`Use: ${prefix + command} <Marque uma foto>`);
          ftgp = isQuotedImage
            ? info.message.extendedTextMessage.contextInfo.quotedMessage
              .imageMessage
            : info.message.imageMessage;
          rane = getRandom("." + (await getExtension(ftgp.mimetype)));
          buffimg = await getFileBuffer(ftgp, "image");
          fs.writeFileSync(rane, buffimg);
          medipp = rane;
          conn.updateProfilePicture(from, { url: medipp });
          reply(`Foto do grupo alterada com sucesso`);
          break;

        case "linkgp":
        case "link":
          linkgc = await conn.groupInviteCode(from);
          reply("https://chat.whatsapp.com/" + linkgc);
          break;

        case "recrutar7":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          rcrt = q.replace(new RegExp("[()+-/ +/]", "gi"), "") + SNET;
          linkgc = await conn.groupInviteCode(from);
          conn.sendMessage(rcrt, {
            image: { url: logoslink.logo },
            caption:
              "Clique no símbolo a cima da imagem para entrar no grupo...",
            contextInfo: {
              externalAdReply: {
                title: "- Clique aqui para participar do grupo",
                body: "",
                reviewType: "PHOTO",
                thumbnailUrl: logoslink.logo,
                sourceUrl: `https://chat.whatsapp.com/` + linkgc,
                mediaType: 2,
              },
            },
          });
          reply(
            "Convite de recrutamento foi enviado para o privado dele com sucesso...",
          );
          break;

        case "anotar":
        case "tirar_nota":
        case "rmnota":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (command == "anotar") {
            var [q5, q10] = q.trim().split("|");
            if (!q5 || !q10 || !q.trim().includes("|"))
              return reply(
                `Digite o título da anotação e o texto que deseja anotar..\nExemplo: ${prefix}anotar Scheyot | Bronxys Domina 😏 ...`,
              );
            if (JSON.stringify(anotar).includes(from)) {
              var i2 = anotar.map((i) => i.grupo).indexOf(from);
              if (JSON.stringify(anotar[i2].puxar).includes(q5)) {
                var i3 = anotar[i2].puxar.map((i) => i.nota).indexOf(q5);
                if (anotar[i2].puxar[i3].nota == q5)
                  return reply(
                    `Esta anotação já está inclusa, utilize outro título.. Ou você pode tirar com\n${prefix}tirar_nota ${q5}`,
                  );
              }
            }
            if (!JSON.stringify(anotar).includes(from)) {
              anotar.push({
                grupo: from,
                puxar: [{ nota: q5, anotacao: q10 }],
              });
              fs.writeFileSync(
                "./dados/org/json/anotar.json",
                JSON.stringify(anotar),
              );
              reply("Anotação registrada com sucesso 😏");
            } else {
              anotar[i2].puxar.push({ nota: q5, anotacao: q10 });
              fs.writeFileSync(
                "./dados/org/json/anotar.json",
                JSON.stringify(anotar),
              );
              reply("Anotação registrada com sucesso 😏");
            }
          } else {
            if (!q.trim())
              return reply("Digite qual anotação deseja tirar pelo título..");
            if (JSON.stringify(anotar).includes(from)) {
              var i2 = anotar.map((i) => i.grupo).indexOf(from);
              if (JSON.stringify(anotar[i2].puxar).includes(q)) {
                var i3 = anotar[i2].puxar.map((i) => i.nota).indexOf(q);
              }
            }
            if (0 > anotar[i2].puxar.map((i) => i.nota).indexOf(q))
              return reply(
                "Esta nota não está inclusa, verifique com atenção 🥱",
              );
            anotar[i2].puxar.splice(i3, 1);
            fs.writeFileSync(
              "./dados/org/json/anotar.json",
              JSON.stringify(anotar),
            );
            reply(`Anotação ${q} tirada com sucesso 😏`);
          }
          break;

        case "rm_aviso":
        case "rm_avisos":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          for (i of black_) {
            var RDFA = i;
          }
          if (!JSON.stringify(RDFA.PUXAR).includes(from))
            return reply(
              `Nenhum aviso foi registrado nesse grupo, utilize o comando ${prefix}rg_aviso`,
            );
          RDFA.PUXAR.splice(RDFA.PUXAR.indexOf(from));
          fs.writeFileSync(
            "./dados/global/AVISOS.json",
            JSON.stringify(black_, null, 2),
          );
          reply(
            "Avisos referente a esse grupo, foi tirado de todos os horários registrados..",
          );
          break;

        case "rg_aviso":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          var [hr, ms] = q.trim().split("|");
          if (!q.trim().includes(":") && !q.trim().includes("|"))
            return reply(
              `Exemplo: ${prefix + command
              } 12:00|Boa tarde a todos, prestem atenção nas regras do grupo\n\neste exemplo.. Ele vai enviar todos os dias as 12:00 da tarde a mensagem que você registrou, já se você quer trocar o horário.. Só refazer o comando\nSe você quer apagar o aviso do grupo, apenas coloque ${prefix}rm_aviso`,
            );
          var i5 = black_.findIndex((i) => i?.hora === hr);
          if (black_[i5]?.PUXAR.some((i) => i.idgp === from)) {
            black_[i5].PUXAR = black_[i5].PUXAR.filter((i) => i.idgp !== from);
            fs.writeFileSync(
              "./dados/global/AVISOS.json",
              JSON.stringify(black_, null, 2),
            );
            setTimeout(() => {
              reply(
                `O Registro anterior foi apagado e recriou um novo, se deseja continuar\n - Lembre-se que há avisos programados em outros horários, se quiser limpar todos, digite: ${prefix}rm_avisos`,
              );
            }, 500);
          } else if (!black_.some((i) => i.hora === hr)) {
            black_.push({
              hora: hr,
              PUXAR: [{ idgp: from, msg: ms, avisou: false }],
            });
            fs.writeFileSync(
              "./dados/global/AVISOS.json",
              JSON.stringify(black_, null, 2),
            );
            reply("Aviso Criado com sucesso..");
          } else if (!black_[i5].PUXAR.some((i) => i.idgp === from)) {
            black_[i5].PUXAR.push({ idgp: from, msg: ms, avisou: false });
            fs.writeFileSync(
              "./dados/global/AVISOS.json",
              JSON.stringify(black_, null, 2),
            );
            reply("Aviso Criado com sucesso..");
          }
          break;

        case "rv-forca":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (dataGp[0].forca_inc == false)
            return reply(
              `O jogo não foi iniciado.\nDigite ${prefix}iniciar_forca`,
            );
          rv_forca();
          reply("Forca resetada com sucesso...");
          break;

        //_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-/

        case "🪰":
          if (!SoDono) return reply(Res_SoDono);
          if (!isGroup) return reply(Res_SoGrupo);
          dataGp[0]["rg_aluguel"] = !dataGp[0]["rg_aluguel"];
          setGp(dataGp);
          reply(
            dataGp[0]["rg_aluguel"] ? `⏳<𝗠𝗢𝗦𝗤𝗨𝗘𝗧𝗔-𝗕𝗢𝗧>⏳` : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌",
          );
          break;

        case "aluguel_global":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.rg_aluguelGB = !nescessario.rg_aluguelGB;
          setNes(nescessario);
          reply(
            nescessario?.rg_aluguelGB
              ? `Ativado com sucesso, agora use o comando: ${prefix}rg_aluguel\nOu então o comando ${prefix}infoaluguel pra saber como usar o resto.`
              : "Desativado com sucesso..",
          );
          break;

        case "renovar_aluguel":
          if (!SoDono) return reply(Res_SoDono);
          var ID_G = rg_aluguel.findIndex((i) => i.id_gp == from);
          if (rg_aluguel.some((i) => i.id_gp != from))
            return reply(
              `Este grupo não está na lista de aluguel, use: ${prefix}listaaluguel pra ver os grupos que estão registrado.`,
            );
          if (
            q.trim().length > 1 &&
            (q.trim().includes("d") || q.trim().includes("h")) &&
            q.trim().includes("/")
          ) {
            var TMP_A = Math.floor(Date.now() / 1000);
            var TEMPO = q.trim().includes("h")
              ? Math.floor(q.trim().split("/")[1].split("h")[0]) * 60 * 60
              : Math.floor(q.trim().split("/")[1].split("d")[0]) * 60 * 60 * 24;
            rg_aluguel[ID_G].vencimento = TMP_A + TEMPO;
            fs.writeFileSync(
              "./dados/org/json/rg_aluguel.json",
              JSON.stringify(rg_aluguel, null, 2),
            );
            reply(
              `Este grupo foi renovado, e vai vencer em: ${kyun(
                Math.floor(rg_aluguel[ID_G].vencimento - TMP_A),
              )}, caso queira tirar este grupo da lista de aluguel antes do tempo, use: ${prefix}rm_aluguel ${from}`,
            );
          } else {
            reply(
              `Exemplo: ${prefix + command} /24h ou dados ${prefix + command
              } /30d\n\nCom d é dias, e h é horas, então boa sorte..`,
            );
          }
          break;

        case "rg_aluguel":
        case "✍🏻":
          if (!SoDono) return reply(Res_SoDono);
          if (!nescessario?.rg_aluguelGB && !dataGp[0]["rg_aluguel"])
            return reply(
              `☺️ 𝙈𝙚𝙨𝙩𝙧𝙚 𝙫𝙤𝙘𝙚̂ 𝙣𝙖̃𝙤 𝙖𝙩𝙞𝙫𝙤𝙪 𝙤 𝙢𝙚𝙪 𝙨𝙞𝙨𝙩𝙚𝙢𝙖 𝙙𝙚 𝙍𝙚𝙜𝙞𝙨𝙩𝙧𝙤 🙆🏻‍♀️`,
            );
          if (
            q.trim().length > 1 &&
            (q.trim().includes("d") || q.trim().includes("h")) &&
            q.trim().includes("/")
          ) {
            var TMP_A = Math.floor(Date.now() / 1000);
            var TEMPO = q.trim().includes("h")
              ? Math.floor(q.trim().split("/")[1].split("h")[0]) * 60 * 60
              : Math.floor(q.trim().split("/")[1].split("d")[0]) * 60 * 60 * 24;
            var ID_G = rg_aluguel.findIndex((i) => i.id_gp == from);
            if (ID_G === -1) {
              rg_aluguel.push({
                id_gp: from,
                nome_: groupName || pushname,
                vencimento: TMP_A + TEMPO,
              });
              fs.writeFileSync(
                "./dados/org/json/rg_aluguel.json",
                JSON.stringify(rg_aluguel, null, 2),
              );
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Aguarda 1 segundo
              ID_G = rg_aluguel.findIndex((i) => i.id_gp == from); // Atualiza o valor de ID_G
              reply(
                `𝘽𝙤𝙩 𝙖𝙩𝙞𝙫𝙖𝙙𝙤 𝙚𝙢: 😏 ${kyun(
                  Math.floor(rg_aluguel[ID_G].vencimento) - TMP_A,
                )}, ⏳`,
              );
            } else {
              reply(
                `𝙀𝙪 𝙟𝙖́ 𝙚𝙨𝙩𝙤𝙪 𝙖𝙩𝙞𝙫𝙖𝙙𝙤 𝙖𝙦𝙪𝙞: 😏 ${kyun(
                  Math.floor(rg_aluguel[ID_G].vencimento) - TMP_A,
                )}, 𝘾𝙖𝙨𝙤 𝙦𝙪𝙚𝙞𝙧𝙖 𝙢𝙚 𝙩𝙞𝙧𝙖𝙧, 𝙪𝙨𝙚: 😏 ${prefix}rm_bot ${from}`,
              );
            }
          } else {
            reply(
              `Exemplo: ${prefix + command} /24h ou Exemplo: ${prefix + command
              } /30d\n\nCom d é dias, e h é horas, então boa sorte..`,
            );
          }
          break;

        case "rm_aluguel":
        case "rm_bot":
          if (!SoDono) return reply(Res_SoDono);
          if (q.trim().length < 4)
            return reply(
              `Use o comando ${prefix + command
              } ${from}\nAssim removerá este grupo da lista aluguel`,
            );
          var ID_R = rg_aluguel.findIndex((i) => i.id_gp == q.trim());
          if (!rg_aluguel.map((i) => i.id_gp).includes(q.trim()))
            return reply(
              `Este grupo não está na lista de aluguel, use: ${prefix}listaaluguel pra ver os grupos que estão registrado.`,
            );
          rg_aluguel.splice(ID_R, 1);
          fs.writeFileSync(
            "./dados/org/json/rg_aluguel.json",
            JSON.stringify(rg_aluguel, null, 2),
          );
          reply(
            `Grupo/Usuario tirado com sucesso da lista de aluguel, não irei mais funcionar aqui.`,
          );
          break;

        case "listaaluguel":
        case "lista_aluguel": {
          if (!SoDono) return reply(Res_SoDono);

          const _listaAl = getAluguel();
          if (!_listaAl || _listaAl.length === 0) {
            return reply(
              `📋 *Nenhum contrato de aluguel cadastrado.*\n\n💡 Use *${prefix}alugarbot* para registrar um grupo.`,
            );
          }

          const _agoraAl = Math.floor(Date.now() / 1000);
          const _ativosAl = _listaAl.filter((c) => c.vencimento > _agoraAl);
          const _vencendoAl = _listaAl.filter((c) => {
            const r = c.vencimento - _agoraAl;
            return r > 0 && r <= 3 * 86400;
          });
          const _vencidosAl = _listaAl.filter((c) => c.vencimento <= _agoraAl);

          let _txtListaAl = `│\n│  📋 *LISTA DE ALUGUÉIS*\n├──────────────\n│\n│  📊 *Resumo Geral:*\n│  🟢 Ativos: *${_ativosAl.length}*\n│  🟡 Vencendo (3d): *${_vencendoAl.length}*\n│  🔴 Vencidos: *${_vencidosAl.length}*\n│  📦 Total: *${_listaAl.length}*\n│\n├──────────────\n`;

          _listaAl.forEach((c, i) => {
            const _restAl = c.vencimento - _agoraAl;
            const _diasAl = Math.floor(_restAl / 86400);
            const _horasAl = Math.floor((_restAl % 86400) / 3600);
            let _stAl, _stEmoji;

            if (_restAl <= 0) {
              _stEmoji = "🔴";
              _stAl = "VENCIDO";
            } else if (_diasAl <= 1) {
              _stEmoji = "🚨";
              _stAl = `${_horasAl}h restante(s)`;
            } else if (_diasAl <= 3) {
              _stEmoji = "🟡";
              _stAl = `${_diasAl}d ${_horasAl}h`;
            } else {
              _stEmoji = "🟢";
              _stAl = `${_diasAl}d ${_horasAl}h`;
            }

            const _vencFmtAl = moment
              .unix(c.vencimento)
              .tz("America/Sao_Paulo")
              .format("DD/MM/YYYY HH:mm");

            _txtListaAl += `│\n│  *${i + 1}.* ${_stEmoji} *${c.nome_ || "Sem nome"}*\n│  📅 Vence: ${_vencFmtAl} — ${_stAl}\n│  👤 ${c.responsavel_nome || "—"}\n│  📞 wa.me/${c.responsavel_contato || "—"}\n│  💰 ${c.valor || "—"}\n`;
          });

          _txtListaAl += `│\n├──────────────\n│  💡 *${prefix}alugado: <nome>* — Detalhes\n│  💡 *${prefix}encerraraluguel <nome>* — Encerrar\n│  💡 *${prefix}renovaraluguel <nome>* — Renovar`;

          // Enviar com foto/gif do menu
          const _mediaListaAl = getMenuMedia();

          if (isGroup) {
            reply(`📨 Enviei a lista de aluguéis no seu *privado*.`);
            const _donoListaAl = numerodono_ofc + "@s.whatsapp.net";
            try {
              await conn.sendMessage(_donoListaAl, {
                ..._mediaListaAl,
                caption: _txtListaAl,
              });
            } catch {
              try {
                await conn.sendMessage(_donoListaAl, { text: _txtListaAl });
              } catch { }
            }
          } else {
            try {
              await conn.sendMessage(
                from,
                {
                  ..._mediaListaAl,
                  caption: _txtListaAl,
                },
                { quoted: info },
              );
            } catch {
              reply(_txtListaAl);
            }
          }
          break;
        }

        case "limitarcmd":
        case "limitarcomando":
        case "limitecmd":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].Limitar_CMD = !dataGp[0].Limitar_CMD;
          setGp(dataGp);
          reply(
            dataGp[0]?.Limitar_CMD
              ? "Limitador de comandos ativado com sucesso no grupo: " +
              groupName
              : "Limitador de comandos desativado no grupo: " + groupName,
          );
          break;

        case "tempocmd":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply(
              `Exemplo: ${prefix + command
              } 120\n60 = 1 minuto\nExemplo que coloquei, com o : ${prefix}limitarcmd ativo, só podera usar comandos a cada 2 minutos\nBoa sorte.`,
            );
          dataGp[0].Limit_tempo = q.trim();
          setGp(dataGp);
          reply(
            `Tempo limite definido para: ${kyun(q.trim())} a cada comando.`,
          );
          break;

        case "listlinks":
        case "links":
        case "listlink":
          try {
            if (!SoDono) return reply(Res_SoDono);
            LNK = "_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-\n\n";
            for (i = 0; i < recolherLNK.length; i++) {
              LNK += `Link - ${i + 1} _- ${recolherLNK[i].Link}\n\n`;
            }
            reply(LNK);
          } catch (e) {
            return reply("Erro");
          }
          break;

        case "recolherlink":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.isRecolherLink = !nescessario.isRecolherLink;
          setNes(nescessario);
          reply(
            nescessario.isRecolherLink
              ? `Sistema de recolher links e armazenar em ${prefix}listlinks foi ativado, quiser limpar os link da lista, use ${prefix}zerarlinks`
              : "Sistema desativado.",
          );
          break;

        case "recolherlinkgp":
          if (!SoDono) return reply(Res_SoDono);
          dataGp[0].recolherlinkgp = !dataGp[0].recolherlinkgp;
          isRecolherlinksgp = !dataGp[0].recolherlinkgp;
          setGp(dataGp);
          reply(
            dataGp[0]?.recolherlinkgp
              ? `Sistema de recolher links por grupo e armazenar em ${prefix}listlinks foi ativado, quiser limpar os link da lista, use ${prefix}zerarlinks`
              : "Sistema desativado.",
          );
          break;

        case "zerarlinks":
        case "zerarlink":
          if (!SoDono) return reply(Res_SoDono);
          recolherLNK.splice([]);
          fs.writeFileSync(
            "./dados/org/funcoes/recolherLNK.json",
            JSON.stringify(recolherLNK, null, 2),
          );
          reply("Links do listlinks foi zerado com sucesso...");
          break;

        case "iddogrupo":
        case "idgrupo":
          if (!SoDono) return reply(Res_SoDono);
          reply(from);
          break;

        case "menugold":
        case "menugolds":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!IS_sistemGold)
              return reply(
                `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
              );
            let ABC = "";
            if (dataGp[0]?.comandos_gold) {
              for (ah of dataGp[0].comandos_gold) {
                ABC += `│  → *${ah.comando}* ─ ${ah.gold}G\n`;
              }
            }
            let _menuGoldTxt = menugold(prefix, sender);
            if (ABC) {
              _menuGoldTxt += `\n├── 🔥 *CONSUMO POR CMD* ──\n│\n${ABC}`;
            }

            try {
              await conn.sendMessage(from, {
                react: { text: "🪙", key: info.key },
              });
              await conn.sendMessage(
                from,
                {
                  ...getMenuMedia(),
                  caption: _menuGoldTxt,
                  mentions: [sender],
                },
                { quoted: info },
              );
            } catch {
              conn.sendMessage(
                from,
                {
                  text: _menuGoldTxt,
                  mentions: [sender],
                },
                { quoted: info },
              );
            }
          }
          break;

        case "infogold": {
          if (!isGroup) return reply(Res_SoGrupo);
          const _infoImg =
            "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&q=90";
          const _infoTxt = `│
│  📖 *GUIA COMPLETO: SISTEMA GOLD*
├──────────────
│
│  🪙 Golds são a moeda virtual do
│  grupo! Ganhe, gaste e interaja.
│
├── 💰 *COMO GANHAR* ──
│
│  📩 Primeira msg do dia: *+20G*
│  ⛏️ *${prefix}minerar_gold* ─ 3x/dia
│  🔢 *${prefix}quiznumero* ─ +20G/acerto
│  🎰 *${prefix}cassino* ─ +50G (sorte!)
│  🎡 *${prefix}roletadasorte* ─ chance
│  🎣 *${prefix}pescargold* ─ 3x/dia
│  💼 *${prefix}trabalhar* ─ 2x/dia
│
├── 💸 *COMO GASTAR* ──
│
│  📊 *${prefix}apostargold* ─ arrisque
│  🎲 *${prefix}bolaogold* ─ bolão 5v5
│  🛒 *${prefix}comprar* ─ itens da loja
│  ⚔️ *${prefix}duelo* @user ─ duelo 1v1
│
├── ⚔️ *INTERAÇÃO* ──
│
│  🗡️ *${prefix}roubargold* @user
│  → Tente roubar golds (5x/dia)
│
│  ⚡ *${prefix}vingancagold* @user
│  → Só funciona se te roubaram
│
│  🍺 *${prefix}enviarcachaca* @user
│  → Embebeda! Pode roubar golds
│
│  🎁 *${prefix}doargold* @user/valor
│  → Doe golds para um amigo
│
├── 🛒 *LOJA* ──
│
│  *${prefix}comprar escudo* ─ 50G
│  → Protege contra roubos
│
│  *${prefix}comprar vingancagold* ─ 50G
│  → +1 chance de vingança
│
│  *${prefix}comprar cachaca* ─ 50G
│  → +1 chance de embebeder
│
├── ⚙️ *ADMIN* ──
│
│  *${prefix}modogold* ─ Ativar/Desativar
│  *${prefix}addgold* @user/valor ─ Dar
│  *${prefix}tirargold* @user/valor ─ Tirar
│  *${prefix}zerarrankgold* ─ Zerar tudo
│
├──────────────
│  💡 *${prefix}menugold* ─ Ver comandos
│  💡 *${prefix}statusgold* ─ Seu status`;
          try {
            await conn.sendMessage(
              from,
              {
                image: { url: _infoImg },
                caption: _infoTxt,
              },
              { quoted: info },
            );
          } catch {
            reply(_infoTxt);
          }
          break;
        }

        case "cassino": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          var ab_c = dataGp[0].Chances.find((i) => i.id === sender);
          if (ab_c?.cassino > 4) {
            return reply(
              `│\n│  🎰 *CASSINO GOLD*\n├──────────────\n│  🚫 *Limite diário atingido!*\n│  ⏳ Você já girou 5/5 vezes hoje.\n│  _A máquina está esfriando, volte amanhã!_`,
            );
          }
          !ab_c ? (ab_c.cassino = 1) : (ab_c.cassino += 1);
          setGp(dataGp);

          var Emj = ["🍒", "🍋", "🍉", "🔔", "💎", "7️⃣"];
          var A_ = [0, 1, 2, 3, 4, 5, 6, 7, 8];
          A_.forEach(function (a, b) {
            A_[b] = Emj[Math.floor(Math.random() * Emj.length)];
          });

          const imgCassino = [
            "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=90",
            "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=90",
            "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&q=90",
          ];
          const rdImgCs =
            imgCassino[Math.floor(Math.random() * imgCassino.length)];

          async function Tx_r(Rst, win) {
            const painel = `│\n│  🎰 *CASSINO GOLD*\n├──────────────\n│\n│  [ ${A_[0]} | ${A_[1]} | ${A_[2]} ]\n│  [ ${A_[3]} | ${A_[4]} | ${A_[5]} ] ⬅️\n│  [ ${A_[6]} | ${A_[7]} | ${A_[8]} ]\n│\n├──────────────\n│  ${Rst}`;

            try {
              await conn.sendMessage(from, {
                react: { text: win ? "🤑" : "😭", key: info.key },
              });
              await conn.sendMessage(from, {
                image: { url: rdImgCs },
                caption: painel,
                mentions: [sender],
              });
            } catch {
              conn.sendMessage(from, { text: painel, mentions: [sender] });
            }
          }

          async function GnhG() {
            S_Sistema.ADD(sender, 50);
            Tx_r(`🎉 *JACKPOT!* Você ganhou +50 Golds!`, true);
          }

          // Checa linha do meio
          if (A_[3] === A_[4] && A_[4] === A_[5]) {
            GnhG();
          } else if (A_[0] === A_[1] && A_[1] === A_[2]) {
            GnhG(); // Linha topo
          } else if (A_[6] === A_[7] && A_[7] === A_[8]) {
            GnhG(); // Linha base
          } else {
            S_Sistema.RM(sender, 2);
            Tx_r(
              `❌ *PERDEU!* -2 Golds descontados.\n│  _Tente de novo mais tarde_`,
              false,
            );
          }
          break;
        }

        case "sorteiogold":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );
          if (!SoDono) return reply(Res_SoDono);
          if (q.match(/[a-z]/i)) return reply("Apenas números!");

          var DMN = rggold[ID_G_GOLD].usus;
          var Usu_A = DMN[Math.floor(Math.random() * DMN.length)];
          const valSorteio = Math.floor(q.trim());

          S_Sistema.ADD(Usu_A.id, valSorteio);
          const msgSorteio = `│\n│  🎁 *SORTEIO DE GOLD!* 🎉\n├──────────────\n│\n│  💰 *Prêmio:* ${valSorteio} Golds\n│  🏆 *Vencedor:* @${Usu_A.id.split("@")[0]}\n│\n├──────────────\n│  _Parabéns ao sortudo!_ 🎊`;

          try {
            await conn.sendMessage(from, {
              react: { text: "🎉", key: info.key },
            });
            await conn.sendMessage(from, {
              text: msgSorteio,
              mentions: [Usu_A.id],
            });
          } catch {
            conn.sendMessage(from, { text: msgSorteio });
          }
          break;

        case "roletadasorte":
        case "roletads":
        case "roletagold": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          if (S_Sistema.RS_C(sender, "roletadasorte")) {
            return reply(
              `│\n│  🎡 *ROLETA DA SORTE*\n├──────────────\n│  🚫 *Você já girou hoje!*\n│  _Volte amanhã para mais uma chance._`,
            );
          }

          if (S_Sistema.RS(sender, "Golds") <= 25) {
            return reply(
              `│\n│  🎡 *ROLETA DA SORTE*\n├──────────────\n│  ❌ *Golds insuficientes*\n│  💰 Você precisa de pelo menos 25 Golds para girar a roleta.`,
            );
          }

          const imgRoleta = [
            "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=90",
            "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=90",
          ];
          const rdImgRl =
            imgRoleta[Math.floor(Math.random() * imgRoleta.length)];

          const msgInicio = `│\n│  🎡 *GIRANDO A ROLETA...*\n├──────────────\n│\n│  ⏳ _Aguarde... o destino de @${sender.split("@")[0]} e de um alvo aleatório está sendo decidido!_\n│\n├──────────────\n│  _Pode ganhar muito ou perder feio!_`;

          try {
            await conn.sendMessage(from, {
              react: { text: "🎡", key: info.key },
            });
            await conn.sendMessage(from, {
              image: { url: rdImgRl },
              caption: msgInicio,
              mentions: [sender],
            });
          } catch {
            conn.sendMessage(from, { text: msgInicio, mentions: [sender] });
          }

          var Rnd_U = Math.floor(Math.random() * rggold[ID_G_GOLD].usus.length);
          var Gold_D = rggold[ID_G_GOLD].usus[Rnd_U];

          var Rnd = Math.floor(Math.random() * 3);
          var Rnd_G_M = Math.floor(
            Math.random() * S_Sistema.RS(sender, "Golds"),
          );
          var Rnd_G_D = Math.floor(Math.random() * (Gold_D.Golds || 0));

          setTimeout(async () => {
            let resTxt = "";
            let resEmj = "";

            if (Rnd === 1) {
              resTxt = `│\n│  🎡 *ROLETA DA SORTE*\n├──────────────\n│\n│  💥 *AZAR! VERMELHO!*\n│  📉 @${sender.split("@")[0]} rodou e se ferrou!\n│  💸 *PERDEU:* -${Rnd_G_M} Golds para @${Gold_D.id.split("@")[0]}\n│\n├──────────────\n│  _Roleta russa das moedas!_`;
              S_Sistema.R_A(sender, Gold_D.id, Rnd_G_M);
              resEmj = "📉";
            } else if (Rnd === 2) {
              resTxt = `│\n│  🎡 *ROLETA DA SORTE*\n├──────────────\n│\n│  🍀 *SORTE! PRETO!*\n│  📈 @${sender.split("@")[0]} tirou a sorte grande!\n│  🤑 *GANHOU:* +${Rnd_G_D} Golds de @${Gold_D.id.split("@")[0]}\n│\n├──────────────\n│  _Levou a grana do maluco!_`;
              S_Sistema.R_A(Gold_D.id, sender, Rnd_G_D);
              resEmj = "🤑";
            } else {
              resTxt = `│\n│  🎡 *ROLETA DA SORTE*\n├──────────────\n│\n│  ⚪ *EMPATE! ZERO! *\n│  📉 A roleta parou no meio!\n│  🤷‍♂️ @${sender.split("@")[0]} não ganhou nem perdeu nada.\n│\n├──────────────\n│  _Pelo menos não saiu no prejuízo..._`;
              resEmj = "🤷‍♂️";
            }

            try {
              await conn.sendMessage(from, {
                text: resTxt,
                mentions: [sender, Gold_D.id],
              });
            } catch {
              reply(resTxt);
            }
          }, 6000);

          S_Sistema.ADD_C(sender, "roletadasorte", true);
          break;
        }

        case "quiznumero":
        case "quiznumerico": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          if (!q.trim()) {
            return reply(
              `│\n│  🔢 *QUIZ NUMÉRICO*\n├──────────────\n│  🎮 *Adivinhe o número!*\n│  👉 *Uso:* ${prefix + command} <0, 1 ou 2>\n│  💡 *Ex:* ${prefix + command} 1\n│\n│  💰 _Acertou = +20 Golds_ (2x/dia)`,
            );
          }

          const palpite = parseInt(q.trim());
          if (![0, 1, 2].includes(palpite)) {
            return reply(
              "❌ Por favor, digite um número entre *0*, *1* e *2*.",
            );
          }

          var Qz = dataGp[0].Chances;
          var Qz_ = Qz.find((i) => i.id === sender);
          var Rn_N = Math.floor(Math.random() * 3);

          if (!Qz_?.quiz) {
            dataGp[0].Chances.find((ab) => ab.id === sender)["quiz"] = [
              { errou: 0, acertou: 0, numero: Rn_N },
            ];
            Qz_ = dataGp[0].Chances.find((i) => i.id === sender);
          } else {
            Qz_.quiz[0].numero = Rn_N;
          }
          setGp(dataGp);

          if (Qz_?.quiz[0]?.errou > 1) {
            return reply(
              `│\n│  🔢 *QUIZ NUMÉRICO*\n├──────────────\n│  🚫 *Fim das tentativas!*\n│  ⏳ Você já errou 2 vezes hoje.\n│  _Mais sorte amanhã!_`,
            );
          }
          if (Qz_?.quiz[0]?.acertou > 1) {
            return reply(
              `│\n│  🔢 *QUIZ NUMÉRICO*\n├──────────────\n│  🏆 *Vitórias Maximas!*\n│  ⏳ Você já venceu 2 vezes hoje.\n│  _Chega de farmar, volte amanhã!_`,
            );
          }

          const imgQuiz = [
            "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&q=90",
            "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=90",
          ];
          const rdImgQz = imgQuiz[Math.floor(Math.random() * imgQuiz.length)];

          if (palpite !== Rn_N) {
            Qz_.quiz[0].errou += 1;
            setGp(dataGp);
            const rErrou = `│\n│  🔢 *QUIZ NUMÉRICO*\n├──────────────\n│\n│  ❌ *ERRADO!*\n│  📉 Seu palpite: *${palpite}*\n│  🎲 Máquina: *${Rn_N}*\n│\n├──────────────\n│  _Tentativas falhas: ${Qz_.quiz[0].errou}/2_ 😭`;
            try {
              await conn.sendMessage(from, {
                react: { text: "❌", key: info.key },
              });
              await conn.sendMessage(from, {
                image: { url: rdImgQz },
                caption: rErrou,
                mentions: [sender],
              });
            } catch {
              conn.sendMessage(from, { text: rErrou, mentions: [sender] });
            }
          } else {
            S_Sistema.ADD(sender, 20);
            Qz_.quiz[0].acertou += 1;
            setGp(dataGp);
            const rAcertou = `│\n│  🔢 *QUIZ NUMÉRICO*\n├──────────────\n│\n│  ✅ *ACERTOU!*\n│  🎯 O número era *${Rn_N}* mesmo!\n│  💰 *PRÊMIO:* +20 Golds\n│\n├──────────────\n│  _Vitórias hoje: ${Qz_.quiz[0].acertou}/2_ 🎉`;
            try {
              await conn.sendMessage(from, {
                react: { text: "✅", key: info.key },
              });
              await conn.sendMessage(from, {
                image: { url: rdImgQz },
                caption: rAcertou,
                mentions: [sender],
              });
            } catch {
              conn.sendMessage(from, { text: rAcertou, mentions: [sender] });
            }
          }
          break;
        }

        case "bolaogold": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          let Valor_X = 0;
          let Participantes = "";

          const imgBolao = [
            "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=90",
            "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=90",
            "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=90",
          ];
          const rdImgBl = imgBolao[Math.floor(Math.random() * imgBolao.length)];

          if (!dataGp[0]["bolaogold"] || dataGp[0]["bolaogold"].length <= 0) {
            const vAposta = parseInt(q.trim());
            if (!vAposta || isNaN(vAposta)) {
              return reply(
                `│\n│  🎲 *BOLÃO GOLD*\n├──────────────\n│  ❌ *Formato inválido*\n│  👉 *Uso:* ${prefix + command} <valor>\n│  💡 *Ex:* ${prefix + command} 10\n│\n│  ⚠️ _Aposta máxima: 50 Golds_`,
              );
            }
            if (vAposta > 50)
              return reply(`❌ A aposta máxima para o bolão é de 50 Golds.`);
            if (S_Sistema.RS(sender, "Golds") < vAposta)
              return reply(
                `❌ Você não tem ${vAposta} Golds para criar o bolão.`,
              );

            dataGp[0]["bolaogold"] = [{ id: sender, aposta: vAposta }];
            setGp(dataGp);
            S_Sistema.RM(sender, vAposta);

            const msgNovo = `│\n│  🎲 *BOLÃO GOLD INICIADO!*\n├──────────────\n│\n│  💰 *Aposta Inicial:* ${vAposta} Golds\n│  👤 *Criador:* @${sender.split("@")[0]}\n│  👥 *Participantes:* 1/5\n│\n├──────────────\n│  👉 *Para entrar:* ${prefix}bolaogold\n│  _Sorteio automático no 5º jogador!_`;
            try {
              await conn.sendMessage(from, {
                react: { text: "🎲", key: info.key },
              });
              await conn.sendMessage(from, {
                image: { url: rdImgBl },
                caption: msgNovo,
                mentions: [sender],
              });
            } catch {
              conn.sendMessage(from, { text: msgNovo, mentions: [sender] });
            }
          } else {
            const apostaAtual = parseInt(dataGp[0].bolaogold[0].aposta);

            if (dataGp[0].bolaogold.find((i) => i.id === sender))
              return reply(
                `│\n│  ⏳ *AGUARDE...*\n├──────────────\n│  Você já está no bolão!\n│  Faltam ${5 - dataGp[0].bolaogold.length} jogadores.`,
              );

            if (S_Sistema.RS(sender, "Golds") < apostaAtual)
              return reply(
                `❌ Você não tem ${apostaAtual} Golds para entrar neste bolão.`,
              );

            dataGp[0].bolaogold.push({ id: sender, aposta: apostaAtual });
            setGp(dataGp);

            S_Sistema.RM(sender, apostaAtual);
            Valor_X = dataGp[0].bolaogold.length * apostaAtual;

            const listParts = dataGp[0].bolaogold
              .map((i) => `│  👤 @${i.id.split("@")[0]}`)
              .join("\n");
            const idsParts = dataGp[0].bolaogold.map((i) => i.id);

            if (dataGp[0]["bolaogold"].length < 5) {
              const vagas = 5 - dataGp[0]["bolaogold"].length;
              const msgEntrou = `│\n│  🎲 *BOLÃO GOLD*\n├──────────────\n│\n│  🔥 POTE: *${Valor_X} Golds*\n│  👥 VAGAS: *${vagas}*\n│\n${listParts}\n│\n├──────────────\n│  👉 *Para entrar:* ${prefix}bolaogold`;

              try {
                await conn.sendMessage(from, {
                  react: { text: "🎟️", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgBl },
                  caption: msgEntrou,
                  mentions: idsParts,
                });
              } catch {
                conn.sendMessage(from, { text: msgEntrou, mentions: idsParts });
              }
            } else {
              // Sorteio
              const msgCheio = `│\n│  🎲 *BOLÃO LOTADO!*\n├──────────────\n│\n│  🔥 POTE FINAL: *${Valor_X} Golds*\n${listParts}\n│\n├──────────────\n│  ⏳ _Sorteando ganhador em 5s..._`;

              try {
                await conn.sendMessage(from, {
                  react: { text: "🔥", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgBl },
                  caption: msgCheio,
                  mentions: idsParts,
                });
              } catch {
                conn.sendMessage(from, { text: msgCheio, mentions: idsParts });
              }

              // Executa o sorteio
              var Gan_B = dataGp[0].bolaogold[Math.floor(Math.random() * 5)].id;

              setTimeout(async () => {
                const imgWin =
                  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=90";
                const msgWin = `│\n│  🏆 *RESULTADO DO BOLÃO* 🏆\n├──────────────\n│\n│  🎉 *PARABÉNS! VENCEDOR:*\n│  👑 @${Gan_B.split("@")[0]}\n│  💰 Levou o pote de *${Valor_X} Golds!*\n│\n├──────────────\n│  _Obrigado a todos por jogarem!_ 🎈`;

                try {
                  await conn.sendMessage(from, {
                    image: { url: imgWin },
                    caption: msgWin,
                    mentions: [Gan_B],
                  });
                } catch {
                  conn.sendMessage(from, { text: msgWin, mentions: [Gan_B] });
                }

                AddGold(IS_sistemGold, Valor_X, Gan_B);
                dataGp[0].bolaogold = [];
                setGp(dataGp);
              }, 5000);
            }
          }
          break;
        }

        case "doargold":
        case "doargolds": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          const partes = q.trim().split("/");
          if (partes.length < 2 || !menc_os2) {
            return reply(
              `│\n│  💝 *DOAÇÃO DE GOLD*\n├──────────────\n│  ❌ *Formato inválido*\n│  👉 *Uso:* ${prefix + command} @usuario/10\n│  💡 *Ex:* ${prefix + command} @Membro/50\n│\n│  ⚠️ _Apenas números após a barra (/)_`,
            );
          }

          const qdt_ = Math.floor(partes[1]);
          if (isNaN(qdt_) || qdt_ <= 0)
            return reply(
              "❌ A quantidade a ser doada deve ser um número maior que zero.",
            );

          if (menc_os2 === botNumber)
            return reply("❌ Opa! Não precisa me doar Golds, obrigado! 🤖");
          if (sender === menc_os2)
            return reply("❌ Você não pode doar para si mesmo, seu doido.");

          if (S_Sistema.RS(sender, "Golds") < qdt_) {
            return reply(
              `│\n│  💝 *DOAÇÃO DE GOLD*\n├──────────────\n│  ❌ *Saldo insuficiente*\n│  💰 Você tentou doar: *${qdt_}*\n│  💵 Seu saldo: *${S_Sistema.RS(sender, "Golds")}*`,
            );
          }

          S_Sistema.R_A(sender, menc_os2, qdt_);

          const imgDoar = [
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90",
            "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=90",
            "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=90",
          ];
          const rdImgDoar = imgDoar[Math.floor(Math.random() * imgDoar.length)];

          const msgDoar = `│\n│  💝 *DOAÇÃO REALIZADA!*\n├──────────────\n│\n│  🎁 *VALOR:* +${qdt_} Golds\n│  👑 *DOADOR:* @${sender.split("@")[0]}\n│  🎉 *RECEBEDOR:* @${menc_os2.split("@")[0]}\n│\n├──────────────\n│  _A generosidade gera riqueza!_ ✨`;

          try {
            await conn.sendMessage(from, {
              react: { text: "💝", key: info.key },
            });
            await conn.sendMessage(from, {
              image: { url: rdImgDoar },
              caption: msgDoar,
              mentions: [sender, menc_os2],
            });
          } catch {
            conn.sendMessage(from, {
              text: msgDoar,
              mentions: [sender, menc_os2],
            });
          }
          break;
        }

        case "comprar": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          var q_p = q
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          if (S_Sistema.RS(sender, "Golds") < 50) {
            return reply(
              `│\n│  🛍️ *LOJA GOLD*\n├──────────────\n│  ❌ *Saldo Insuficiente*\n│  💵 Você tem: *${S_Sistema.RS(sender, "Golds")} Golds*\n│  🛒 Todo item custa: *50 Golds*`,
            );
          }

          const imgShop = [
            "https://images.unsplash.com/photo-1555529733-0e670560f8e1?w=800&q=90",
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=90",
          ];
          const rdImgS = imgShop[Math.floor(Math.random() * imgShop.length)];

          if (["vingancagold", "cachaca", "escudo"].includes(q_p)) {
            const vg_g = dataGp[0].Chances.find((i) => i.id === sender);
            var Fcl_G = rggold[ID_G_GOLD].usus;

            if (q_p === "vingancagold") {
              if (vg_g?.Vinganca <= 0)
                return reply(
                  "❌ Você já tem uma *Vingança* guardada!\nUse ela antes de comprar outra.",
                );

              let abc = `│\n│  🛍️ *COMPRA REALIZADA!*\n├──────────────\n│\n│  🗡️ *ITEM:* Vingança Gold\n│  👤 *COMPRADOR:* @${sender.split("@")[0]}\n│  💰 *CUSTO:* -50 Golds\n│\n├──────────────\n│  🎁 *Doação Automática (10G cada):*`;

              for (let i = 0; i < 5; i++) {
                var Gn_D = Fcl_G[Math.floor(Math.random() * Fcl_G.length)];
                abc += `\n│  ${i + 1}º - @${Gn_D.id.split("@")[0]}`;
                Gn_D.Golds += 10;
              }
              abc += `\n│\n├──────────────\n│  _Proteja seus pertences e cobre a dívida!_ 🗡️`;

              vg_g.Vinganca = 0;
              setGp(dataGp);

              try {
                await conn.sendMessage(from, {
                  react: { text: "🛍️", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgS },
                  caption: abc,
                  mentions: [sender, ...Fcl_G.map((u) => u.id)],
                });
              } catch {
                conn.sendMessage(from, {
                  text: abc,
                  mentions: [sender, ...Fcl_G.map((u) => u.id)],
                });
              }
            } else if (q_p === "cachaca") {
              if (vg_g?.Cachaca <= 0)
                return reply(
                  `❌ Você já tem uma *Cachaça* guardada!\nUse: ${prefix}enviarcachaca @usuario`,
                );

              vg_g["Cachaca"] = 0;
              setGp(dataGp);

              const msgC = `│\n│  🛍️ *COMPRA REALIZADA!*\n├──────────────\n│\n│  🍻 *ITEM:* Cachaça\n│  👤 *COMPRADOR:* @${sender.split("@")[0]}\n│  💰 *CUSTO:* -50 Golds\n│\n├──────────────\n│  _Hora de embebedar alguém: ${prefix}enviarcachaca_ 🥴`;

              try {
                await conn.sendMessage(from, {
                  react: { text: "🛍️", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgS },
                  caption: msgC,
                  mentions: [sender],
                });
              } catch {
                conn.sendMessage(from, { text: msgC, mentions: [sender] });
              }
            } else if (q_p === "escudo") {
              vg_g["Escudo"] = [{ rn: 1 }];
              setGp(dataGp);

              const msgE = `│\n│  🛍️ *COMPRA REALIZADA!*\n├──────────────\n│\n│  🛡️ *ITEM:* Escudo de Proteção\n│  👤 *COMPRADOR:* @${sender.split("@")[0]}\n│  💰 *CUSTO:* -50 Golds\n│\n├──────────────\n│  _Você está protegido contra ataques ou cachaçadas._ 🛡️`;

              try {
                await conn.sendMessage(from, {
                  react: { text: "🛍️", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgS },
                  caption: msgE,
                  mentions: [sender],
                });
              } catch {
                conn.sendMessage(from, { text: msgE, mentions: [sender] });
              }
            }

            S_Sistema.RM(sender, 50);
            Goldrgs(rggold);
          } else {
            return reply(
              `│\n│  🛍️ *LOJA GOLD*\n├──────────────\n│  ❌ *Item não encontrado!*\n│\n│  📦 *Itens Disponíveis:* (50 Golds)\n│  🗡️ *vingancagold* - Cobre quem te roubou.\n│  🍻 *cachaca* - Embebede alguém.\n│  🛡️ *escudo* - Proteja-se de ataques.\n│\n│  👉 *Uso:* ${prefix}comprar <item>\n│  💡 *Ex:* ${prefix}comprar escudo`,
            );
          }
          break;
        }

        case "enviarcachaca":
        case "cachaca": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          if (S_Sistema.RS_C(sender, "Cachaca") <= 0) {
            return reply(
              `│\n│  🍻 *GARRAFA VAZIA!*\n├──────────────\n│  🚫 Você não tem nenhuma Cachaça no inventário.\n│  🛒 _Compre na loja: ${prefix}comprar cachaça (50G)_`,
            );
          }

          if (!menc_os2)
            return reply(
              `❌ Marque o alvo para embebedar:\n👉 *Uso:* ${prefix}enviarcachaca @usuario`,
            );
          if (menc_os2 === botNumber)
            return reply("🤖 Eu não bebo álcool, só óleo de motor!");
          if (sender === menc_os2)
            return reply(
              "🍹 Quer beber sozinho? Vai no bar de verdade! Use o comando num alvo.",
            );

          let CH_E = dataGp[0].Chances.find((i) => i.id === menc_os2);

          var RN_ = Math.floor(Math.random() * 5);
          var EU = rggold[ID_G_GOLD].usus.find((i) => i.id === sender);
          var ELE = rggold[ID_G_GOLD].usus.find((i) => i.id === menc_os2);

          if ((ELE?.Golds || 0) <= 0)
            return reply(
              "❌ Esse cara tá liso demais, se embebedar ele não vai arrancar nenhum Gold... Procure outro alvo.",
            );
          if ((EU?.Golds || 0) <= 0)
            return reply(
              "❌ Você tá sem Golds e quer dar cachaça pros outros? Fica esperto!",
            );

          // Gasta a cachaça
          S_Sistema.ADD_C(sender, "Cachaca", -1);

          const imgBeber = [
            "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=90",
            "https://images.unsplash.com/photo-1575037614876-c38538020ff6?w=800&q=90",
            "https://images.unsplash.com/photo-1566835690325-1e3892effcb0?w=800&q=90",
          ];
          const rdImgBb = imgBeber[Math.floor(Math.random() * imgBeber.length)];

          if (CH_E["Escudo"]?.length > 0) {
            let RN_F = CH_E.Escudo[0].rn + 1;
            if (Math.floor(Math.random() * RN_F) === 1) {
              const msgQbr = `│\n│  🛡️ *ESCUDO DESTRUÍDO!*\n├──────────────\n│  💥 A garrafa quebrou o escudo de @${menc_os2.split("@")[0]}!\n│  _Mas ele fugiu antes de beber._`;
              S_Sistema.ADD_C(menc_os2, "Escudo", []);
              try {
                await conn.sendMessage(from, {
                  react: { text: "🛡️", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgBb },
                  caption: msgQbr,
                  mentions: [menc_os2],
                });
              } catch {
                conn.sendMessage(from, { text: msgQbr, mentions: [menc_os2] });
              }
            } else {
              const msgDef = `│\n│  🛡️ *DENTRO DO ESCUDO!*\n├──────────────\n│  🚫 A garrafa bateu no escudo e quebrou!\n│  _O @${menc_os2.split("@")[0]} não bebeu uma gota e o item foi perdido._`;
              try {
                await conn.sendMessage(from, {
                  react: { text: "🛡️", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgBb },
                  caption: msgDef,
                  mentions: [menc_os2],
                });
              } catch {
                conn.sendMessage(from, { text: msgDef, mentions: [menc_os2] });
              }
            }
            setGp(dataGp);
            return;
          }

          var MTH_EU =
            parseInt(EU.Golds) > 500
              ? Math.floor(Math.random() * 500)
              : Math.floor(Math.random() * EU.Golds);
          var MTH_ELE =
            parseInt(ELE.Golds) > 500
              ? Math.floor(Math.random() * 500)
              : Math.floor(Math.random() * ELE.Golds);

          let title = "🍻 HORA DO GOLE!";
          let txtResult = "";
          let emojiR = "🍻";

          if (RN_ === 0) {
            txtResult = `│\n│  🙅‍♂️ *ELE É CRENTE!*\n├──────────────\n│  🙏 @${menc_os2.split("@")[0]} se recusou a beber a cachaça!\n│  _A garrafa rodou e você votou pra casa chupando dedo._`;
            emojiR = "🙅‍♂️";
          } else if (RN_ === 1) {
            txtResult = `│\n│  😵 *FEZ MERDA!*\n├──────────────\n│  💥 @${menc_os2.split("@")[0]} era um ex-alcoólatra brabo!\n│  Ele pegou a garrafa, tacou em você e tomou *-${MTH_EU} Golds* enquanto você corria.\n│  _Isso que dá oferecer pinga pros outros!_`;
            S_Sistema.R_A(sender, menc_os2, MTH_EU);
            emojiR = "🤕";
          } else if (RN_ === 2) {
            txtResult = `│\n│  🍻 *BEBEU DEMAIS! BINGO!*\n├──────────────\n│  🥴 @${menc_os2.split("@")[0]} virou tudo, adorou e ficou bebaço!\n│  Ele desmaiou e deixou cair *+${MTH_ELE} Golds* no chão.\n│  _Você malandramente pegou pra você!_ 🤑`;
            S_Sistema.R_A(menc_os2, sender, MTH_ELE);
            emojiR = "💰";
          } else if (RN_ === 3) {
            txtResult = `│\n│  🚓 *A POLÍCIA VIU!*\n├──────────────\n│  🚔 Você ia dar bebida para @${menc_os2.split("@")[0]}, mas os polícia desconfiaram de má intenção...\n│  Falaram que ou ia em cana, ou pagava o café... Você perdeu *-${MTH_EU} Golds*\n│  _Deu ruim total, perdeu a grana e a cachaça!_`;
            S_Sistema.RM(sender, MTH_EU);
            emojiR = "🚓";
          } else {
            txtResult = `│\n│  🍀 *SORTE GRANDE!*\n├──────────────\n│  💵 No caminho pra dar a cachaça a @${menc_os2.split("@")[0]}, você encontrou *+200 Golds* num beco!\n│  _Voltando pra casa agora mesmo sem nem embebedar o cara._`;
            S_Sistema.ADD(sender, 200);
            emojiR = "🍀";
          }

          const msgFinal = `│\n│  ${title}\n├──────────────\n${txtResult}\n│\n├──────────────\n│  🗣️ Por: @${sender.split("@")[0]}`;

          try {
            await conn.sendMessage(from, {
              react: { text: emojiR, key: info.key },
            });
            await conn.sendMessage(from, {
              image: { url: rdImgBb },
              caption: msgFinal,
              mentions: [sender, menc_os2],
            });
          } catch {
            conn.sendMessage(from, {
              text: msgFinal,
              mentions: [sender, menc_os2],
            });
          }
          break;
        }

        case "emprestargold":
        case "emprestargolds":
        case "emprestimo": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          const partes = q.trim().split("/");
          if (partes.length < 2 || !menc_os2) {
            return reply(
              `│\n│  🏦 *EMPRÉSTIMO*\n├──────────────\n│  ❌ *Formato inválido*\n│  👉 *Uso:* ${prefix + command} @usuario/10\n│  💡 *Ex:* ${prefix + command} @Membro/100\n│\n│  ⚠️ _Apenas números após a barra (/)_`,
            );
          }

          const gd = Math.floor(partes[1]);
          if (isNaN(gd) || gd <= 0)
            return reply(
              "❌ A quantidade a ser emprestada deve ser um número maior que zero.",
            );

          let usu_E = rggold[ID_G_GOLD].usus.find((i) => i.id === menc_os2);

          if (
            usu_E?.emp_A?.length > 0 &&
            !usu_E.emp_A.find((i) => i.id === sender)
          ) {
            return reply(
              `❌ Este usuário já tem uma proposta pendente de empréstimo.\nEle deve usar ${prefix}recusaremprestimo antes de receber outra.`,
            );
          }
          if (
            usu_E?.emp_G?.length > 0 &&
            !usu_E.emp_G.find((i) => i.id === sender)
          ) {
            return reply(
              "❌ Este usuário já tem um empréstimo ativo no momento! Não pode pegar dois.",
            );
          }
          if (S_Sistema.RS(sender, "Golds") < gd) {
            return reply(
              `│\n│  🏦 *EMPRÉSTIMO*\n├──────────────\n│  ❌ *Sem fundos suficientes*\n│  💰 Você tentou emprestar: *${gd}*\n│  💵 Seu saldo: *${S_Sistema.RS(sender, "Golds")}*`,
            );
          }

          const imgEmp = [
            "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=800&q=90",
            "https://images.unsplash.com/photo-1580519542036-ed47f3ae3ea8?w=800&q=90",
          ];
          const rdImgEmp = imgEmp[Math.floor(Math.random() * imgEmp.length)];

          const msgProp = `│\n│  🏦 *PROPOSTA DE EMPRÉSTIMO*\n├──────────────\n│\n│  👋 Olá @${menc_os2.split("@")[0]},\n│  O magnata @${sender.split("@")[0]} quer te emprestar:\n│  💰 *VALOR:* ${gd} Golds\n│\n├──────────────\n│  👉 *Para aceitar:* ${prefix}aceitaremprestimo\n│  🚫 *Para recusar:* ${prefix}recusaremprestimo\n│\n│  ⚠️ _Atenção: A cobrança terá 15% de juros_`;

          Object.assign(usu_E, {
            emp_A: [{ id: sender, Golds: gd, Tempo: 0 }],
          });
          Goldrgs(rggold);

          try {
            await conn.sendMessage(from, {
              react: { text: "🏦", key: info.key },
            });
            await conn.sendMessage(from, {
              image: { url: rdImgEmp },
              caption: msgProp,
              mentions: [sender, menc_os2],
            });
          } catch {
            conn.sendMessage(from, {
              text: msgProp,
              mentions: [sender, menc_os2],
            });
          }
          break;
        }

        case "aceitaremprestimo":
        case "aceitarproposta": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          let Eu_ = rggold[ID_G_GOLD].usus.find((i) => i.id === sender);
          if (Eu_?.emp_A && Eu_?.emp_A.length > 0) {
            let credorObj = rggold[ID_G_GOLD].usus.find(
              (i) => i.id === Eu_.emp_A[0]?.id,
            );
            let gd = Math.floor(Eu_.emp_A[0].Golds);

            if (Math.floor(credorObj.Golds) < gd) {
              return reply(
                `❌ O agiota @${Eu_.emp_A[0].id.split("@")[0]} gastou os Golds e não pode mais te emprestar!\nUse ${prefix}recusaremprestimo para cancelar a proposta.`,
              );
            }

            let day = Math.floor(Date.now() / 1000 + 1 * 60 * 60 * 24);
            credorObj.Golds -= gd;
            Eu_.Golds += gd;

            Object.assign(Eu_, {
              emp_G: [
                {
                  id: Eu_.emp_A[0].id,
                  Golds:
                    Eu_?.emp_G?.length > 0
                      ? parseInt(Eu_.emp_G[0].Golds) + gd
                      : gd,
                  Tempo: day,
                  cobrou: 0,
                },
              ],
            });
            Eu_.emp_A = [];
            Goldrgs(rggold);

            const imgAc =
              "https://images.unsplash.com/photo-1558025137-0b406e9cb1dc?w=800&q=90";
            const msgAc = `│\n│  🤝 *EMPRÉSTIMO ACEITO!*\n├──────────────\n│\n│  💰 @${sender.split("@")[0]} pegou *${gd} Golds*\n│  🏦 *CREDOR:* @${credorObj.id.split("@")[0]}\n│\n├──────────────\n│  ⚠️ _A dívida poderá ser cobrada em 24h._`;

            try {
              await conn.sendMessage(from, {
                react: { text: "🤝", key: info.key },
              });
              await conn.sendMessage(from, {
                image: { url: imgAc },
                caption: msgAc,
                mentions: [sender, credorObj.id],
              });
            } catch {
              conn.sendMessage(from, {
                text: msgAc,
                mentions: [sender, credorObj.id],
              });
            }
          } else {
            return reply(
              "❌ Você não tem nenhuma proposta de empréstimo para aceitar.",
            );
          }
          break;
        }

        case "recusaremprestimo":
        case "recusarproposta": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          let Eu_ = rggold[ID_G_GOLD].usus.find((i) => i.id === sender);
          if (Eu_?.emp_A && Eu_?.emp_A?.length > 0) {
            let credorId = Eu_.emp_A[0].id;
            Eu_.emp_A = [];
            Goldrgs(rggold);
            return reply(
              `│\n│  🚫 *PROPOSTA RECUSADA*\n├──────────────\n│  @${sender.split("@")[0]} recusou o empréstimo de @${credorId.split("@")[0]}.`,
            );
          } else {
            return reply(
              "❌ Você não tem nenhuma proposta de empréstimo para recusar.",
            );
          }
          break;
        }

        case "pagaremprestimo":
        case "pagargold": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          let Eu = rggold[ID_G_GOLD].usus.find((i) => i.id === sender);
          if (Eu.emp_G && Eu.emp_G.length > 0) {
            let Ele = rggold[ID_G_GOLD].usus.find(
              (i) => i.id === Eu.emp_G[0].id,
            );
            let V_E = Math.floor(Eu.emp_G[0].Golds);
            let V_Total = Math.floor(V_E + V_E * 0.15);

            if (Math.floor(Eu.Golds) < V_Total) {
              return reply(
                `│\n│  💵 *PAGAMENTO*\n├──────────────\n│  ❌ *Sem saldo!*\n│  💰 Você precisa de: *${V_Total} Golds* (com os 15%)\n│  💸 Você tem: *${Eu.Golds} Golds*`,
              );
            }

            Ele.Golds += V_Total;
            Eu.Golds -= V_Total;
            Eu.emp_G = [];
            Goldrgs(rggold);

            const msgPag = `│\n│  ✅ *DÍVIDA PAGA!*\n├──────────────\n│\n│  🤝 @${sender.split("@")[0]} pagou a dívida e ficou limpo!\n│  💼 *RECEBIDO:* +${V_Total} Golds (+15% Juros)\n│  🏦 *CREDOR:* @${Ele.id.split("@")[0]}\n│\n├──────────────\n│  _Nome limpo no SPC Gold!_ 💳`;

            try {
              await conn.sendMessage(from, {
                react: { text: "✅", key: info.key },
              });
              await conn.sendMessage(from, {
                text: msgPag,
                mentions: [sender, Ele.id],
              });
            } catch {
              reply(msgPag);
            }
          } else {
            reply(
              "❌ Você não tem nenhum empréstimo para pagar! Seu nome tá limpo.",
            );
          }
          break;
        }

        case "cobrargold":
        case "cobrargolds":
        case "cobraremprestimo": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          if (!menc_os2)
            return reply("❌ Marque o caloteiro: *!cobrargold @usuario*");

          let Eu_ = rggold[ID_G_GOLD].usus.find((i) => i.id === menc_os2); // Devedor
          let Eu = rggold[ID_G_GOLD].usus.find((i) => i.id === sender); // Credor
          let Tmp_A = Math.floor(Date.now() / 1000);

          if (Eu_?.emp_G?.length > 0 && Eu_.emp_G[0].id === sender) {
            let U_G = Math.floor(Eu_.emp_G[0].Golds);
            let V_Total = Math.floor(U_G + U_G * 0.15);

            if (Tmp_A < Math.floor(Eu_.emp_G[0].Tempo)) {
              return reply(
                `│\n│  ⏳ *COBRANÇA*\n├──────────────\n│  Ainda falta paciência!\n│  Faltam: *${kyun(Math.floor(Eu_.emp_G[0].Tempo) - Tmp_A)}*\n│  _Aguarde 24h desde o empréstimo._`,
              );
            }

            if (Math.floor(Eu_.Golds) < V_Total) {
              return reply(
                `│\n│  💀 *CALOTE!*\n├──────────────\n│  O caloteiro @${menc_os2.split("@")[0]} não tem *${V_Total} Golds* pra te pagar.\n│  _Recomendo mandar capangas!_`,
              );
            }

            Eu_.Golds -= V_Total;
            Eu.Golds += V_Total;
            Eu_.emp_G = [];
            Goldrgs(rggold);

            const msgCob = `│\n│  ⚖️ *COBRANÇA EXECUTADA!*\n├──────────────\n│\n│  💰 O agiota @${sender.split("@")[0]} cobrou a dívida!\n│  📉 -${V_Total} Golds tirados à força de @${menc_os2.split("@")[0]}\n│\n├──────────────\n│  _O crime compensa com juros de 15%!_ 😈`;

            try {
              await conn.sendMessage(from, {
                react: { text: "⚖️", key: info.key },
              });
              await conn.sendMessage(from, {
                text: msgCob,
                mentions: [sender, menc_os2],
              });
            } catch {
              reply(msgCob);
            }
          } else {
            return reply("❌ Este usuário não te deve nada.");
          }
          break;
        }

        case "infoemprestimo":
          reply(
            `│\n│  🏦 *GUIA DE EMPRÉSTIMO*\n├──────────────\n│\n│  💰 1. \`${prefix}emprestargold @usuario/100\`\n│     _(Empresta 100 Golds a um usuário)_\n│\n│  🤝 2. \`${prefix}aceitaremprestimo\`\n│     _(O alvo aceita a sua dívida)_\n│\n│  🚫 3. \`${prefix}recusaremprestimo\`\n│     _(O alvo recusa a sua dívida)_\n│\n│  ⚖️ 4. \`${prefix}cobrargold @usuario\`\n│     _(Você cobra a dívida forçadamente em 24h com 15% de juros)_\n│\n│  ✅ 5. \`${prefix}pagaremprestimo\`\n│     _(O devedor paga de livre e espontânea vontade com juros)_\n│\n├──────────────\n│  _Empreste para seus parças e lucre!_`,
          );
          break;

        case "roubargold":
        case "roubargolds":
        case "vingancagold":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!IS_sistemGold)
              return reply(
                `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
              );

            if (!menc_os2)
              return reply(
                `│\n│  🥷 *SISTEMA DE ROUBO*\n├──────────────\n│  ❌ *Faltou o alvo!*\n│  👉 *Uso:* ${prefix + command} @usuario`,
              );

            if (menc_os2 === botNumber)
              return reply("❌ Você não pode me roubar! 😡");
            if (menc_os2 === sender)
              return reply("❌ Você não pode roubar a si mesmo, né?");

            var FCLT_CHANCES_U = dataGp[0].Chances.find(
              (i) => i.id === menc_os2,
            );

            if (
              command !== "vingancagold" &&
              S_Sistema.RS_C(sender, "ChanceR", []).length >= 5
            ) {
              return reply(
                `│\n│  🥷 *CANSAÇO BATEU*\n├──────────────\n│  🚫 *Limite diário atingido!*\n│  ⏳ Você já fez seus 5 roubos hoje.\n│  _A polícia tá de olho, volte amanhã!_`,
              );
            }

            if (
              command !== "vingancagold" &&
              S_Sistema.RS_C(sender, "ChanceR")?.includes(menc_os2)
            ) {
              return reply(
                `│\n│  🥷 *ALVO REPETIDO*\n├──────────────\n│  ❌ Você já tentou roubar essa pessoa hoje.\n│  _Escolha outra vítima!_`,
              );
            }

            if (
              command === "vingancagold" &&
              S_Sistema.RS_C(sender, "Vinganca") > 0
            ) {
              return reply(
                `│\n│  ⚔️ *VINGANÇA*\n├──────────────\n│  ❌ Sua vingança gratuita já foi usada hoje.\n│  💡 _Compre outra com ${prefix}comprar vingancagold (50G)_`,
              );
            }

            if (
              command === "vingancagold" &&
              !S_Sistema.RS_C(menc_os2, "ChanceR")?.includes(sender)
            ) {
              return reply(
                `│\n│  ⚔️ *VINGANÇA*\n├──────────────\n│  ❌ Esse usuário não te roubou hoje!\n│  _Vingança só vale contra quem te atacou._`,
              );
            }

            var X_G_U = S_Sistema.RS(menc_os2, "Golds");
            var X_G_M = S_Sistema.RS(sender, "Golds");

            if (X_G_M <= 0)
              return reply(
                `❌ Sem moral no crime! Você precisa de pelo menos 1 Gold para tentar roubar alguém.`,
              );
            if (X_G_U <= 0)
              return reply(
                `❌ O alvo tá mais liso que você. Ele não tem nenhum Gold!`,
              );

            const imgRoubo = [
              "https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=800&q=90",
              "https://images.unsplash.com/photo-1510250645607-2e11e8608de1?w=800&q=90",
              "https://images.unsplash.com/photo-1582214400329-87c2b6574f26?w=800&q=90",
            ];
            const rdImgRb =
              imgRoubo[Math.floor(Math.random() * imgRoubo.length)];

            // Verifica Escudo
            if (FCLT_CHANCES_U["Escudo"]?.length > 0) {
              let RB_F = FCLT_CHANCES_U.Escudo[0].rn + 1;
              if (Math.floor(Math.random() * RB_F) === 1) {
                // Quebrou o escudo
                FCLT_CHANCES_U["Escudo"] = [];
                const msgQbr = `│\n│  🛡️ *ESCUDO QUEBRADO!*\n├──────────────\n│  💥 Você destruiu a defesa de @${menc_os2.split("@")[0]}!\n│  _Mas o barulho espantou o alvo, roubo falhou._`;
                try {
                  await conn.sendMessage(from, {
                    react: { text: "🛡️", key: info.key },
                  });
                  await conn.sendMessage(from, {
                    image: { url: rdImgRb },
                    caption: msgQbr,
                    mentions: [menc_os2],
                  });
                } catch {
                  conn.sendMessage(from, {
                    text: msgQbr,
                    mentions: [menc_os2],
                  });
                }
              } else {
                // Escudo defendeu
                if (command === "vingancagold")
                  S_Sistema.ADD_C(sender, "Vinganca", 1);
                if (command !== "vingancagold")
                  S_Sistema.ADD_C_P(sender, "ChanceR", menc_os2);

                const msgDef = `│\n│  🛡️ *ALVO PROTEGIDO*\n├──────────────\n│  🚫 @${menc_os2.split("@")[0]} estava de escudo!\n│  _O alarme tocou e você fugiu de mãos vazias._`;
                try {
                  await conn.sendMessage(from, {
                    react: { text: "🛡️", key: info.key },
                  });
                  await conn.sendMessage(from, {
                    image: { url: rdImgRb },
                    caption: msgDef,
                    mentions: [menc_os2],
                  });
                } catch {
                  conn.sendMessage(from, {
                    text: msgDef,
                    mentions: [menc_os2],
                  });
                }
                setGp(dataGp);
                return;
              }
              setGp(dataGp);
            }

            // Sorteio do roubo
            var Rnd = Math.floor(Math.random() * 3);
            var Rnd_G = Math.floor(Math.random() * X_G_U);
            var Rnd_GM = Math.floor(Math.random() * X_G_M);

            let resultTitle =
              command === "vingancagold"
                ? "⚔️ VINDETA CONCLUÍDA"
                : "🥷 ROUBO BEM-SUCEDIDO";

            if (Rnd === 0) {
              // Sucesso!
              S_Sistema.R_A(menc_os2, sender, Rnd_G);
              const msgSuc = `│\n│  ${resultTitle}\n├──────────────\n│\n│  💸 *SAQUE:* +${Rnd_G} Golds\n│  🩸 *VÍTIMA:* @${menc_os2.split("@")[0]}\n│  💰 *SEU SALDO:* ${X_G_M + Rnd_G}\n│\n├──────────────\n│  _Agilidade de ninja, parceiro!_ 🥷`;

              try {
                await conn.sendMessage(from, {
                  react: { text: "💀", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgRb },
                  caption: msgSuc,
                  mentions: [menc_os2],
                });
              } catch {
                conn.sendMessage(from, { text: msgSuc, mentions: [menc_os2] });
              }
            } else if (Rnd === 1) {
              // Fracassou e foi roubado/multado
              S_Sistema.R_A(sender, menc_os2, Rnd_GM);
              const msgFlh = `│\n│  🚓 *ROUBO FRACASSADO*\n├──────────────\n│\n│  💸 *MULTA/PERDA:* -${Rnd_GM} Golds\n│  💥 *ALVO:* @${menc_os2.split("@")[0]} reagiu!\n│  📉 *SEU SALDO:* ${X_G_M - Rnd_GM}\n│\n├──────────────\n│  _A polícia te pegou na fuga!_ 🚨`;

              try {
                await conn.sendMessage(from, {
                  react: { text: "😂", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgRb },
                  caption: msgFlh,
                  mentions: [menc_os2],
                });
              } catch {
                conn.sendMessage(from, { text: msgFlh, mentions: [menc_os2] });
              }
            } else {
              // Nadinha
              const msgEmp = `│\n│  💨 *ROUBO FRUSTRADO*\n├──────────────\n│\n│  🤦‍♂️ *NADA NO BOLSO*\n│  Tentou roubar @${menc_os2.split("@")[0]} e não levou nada.\n│  _Voltou pra casa só com o susto!_\n│\n├──────────────\n│  _Foi por pouco, hein?_ 😬`;

              try {
                await conn.sendMessage(from, {
                  react: { text: "💨", key: info.key },
                });
                await conn.sendMessage(from, {
                  image: { url: rdImgRb },
                  caption: msgEmp,
                  mentions: [menc_os2],
                });
              } catch {
                conn.sendMessage(from, { text: msgEmp, mentions: [menc_os2] });
              }
            }

            if (command === "vingancagold")
              S_Sistema.ADD_C(sender, "Vinganca", 1);
            if (command !== "vingancagold")
              S_Sistema.ADD_C_P(sender, "ChanceR", menc_os2);

            setGp(dataGp);
          }
          break;

        case "minerar_gold":
        case "minerar_golds":
        case "minerargold":
        case "minerargolds":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._\n│  _Peça a um admin para ativar:_ \n│  *${prefix}modogold 1*`,
            );

          if (S_Sistema.RS_C(sender, "ChanceG") >= 3) {
            return reply(
              `│\n│  ⛏️ *MINERAÇÃO ESGOTADA*\n├──────────────\n│\n│  🚫 Você já minerou 3x hoje!\n│  ⏳ Volte amanhã para mais.\n│\n├──────────────\n│  💡 _Seu saldo: ${S_Sistema.RS(sender, "Golds")} Golds_`,
            );
          }

          S_Sistema.ADD_C_M(sender, "ChanceG", 1);
          rnd = Math.floor(Math.random() * 2);
          rndg = Math.floor(Math.random() * 50) + 10; // entre 10 e 60

          const chancesRestantes = 3 - S_Sistema.RS_C(sender, "ChanceG");
          const imgMinerar = [
            "https://images.unsplash.com/photo-1518182170546-076616fdcd87?w=800&q=90",
            "https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=800&q=90",
            "https://images.unsplash.com/photo-1620056965615-ce1bbef62bc6?w=800&q=90",
          ];
          const rdImgMin =
            imgMinerar[Math.floor(Math.random() * imgMinerar.length)];

          if (rnd == 0) {
            // Ganhou
            S_Sistema.ADD(sender, rndg);
            const msgSucesso = `│\n│  ⛏️ *MINERAÇÃO BEM-SUCEDIDA!*\n├──────────────\n│\n│  💎 *VOCÊ ENCONTROU OURO!*\n│  💰 Prêmio: *+${rndg} Golds*\n│\n│  👤 @${sender.split("@")[0]}\n│  📉 Chances hoje: *${chancesRestantes}/3*\n│\n├──────────────\n│  _Continue cavando!_ ✨`;

            try {
              await conn.sendMessage(from, {
                react: { text: "⛏️", key: info.key },
              });
              await conn.sendMessage(
                from,
                {
                  image: { url: rdImgMin },
                  caption: msgSucesso,
                  mentions: [sender],
                },
                { quoted: info },
              );
            } catch {
              conn.sendMessage(
                from,
                { text: msgSucesso, mentions: [sender] },
                { quoted: info },
              );
            }
          } else {
            // Perdeu
            const msgFalha = `│\n│  ⛏️ *MINERAÇÃO FALHOU*\n├──────────────\n│\n│  🪨 *SÓ PEDRA E TERRA...*\n│  💔 Você não encontrou nada.\n│\n│  👤 @${sender.split("@")[0]}\n│  📉 Chances hoje: *${chancesRestantes}/3*\n│\n├──────────────\n│  _Mais sorte na próxima!_ 😪`;

            try {
              await conn.sendMessage(from, {
                react: { text: "🪨", key: info.key },
              });
              await conn.sendMessage(
                from,
                {
                  image: { url: rdImgMin },
                  caption: msgFalha,
                  mentions: [sender],
                },
                { quoted: info },
              );
            } catch {
              conn.sendMessage(
                from,
                { text: msgFalha, mentions: [sender] },
                { quoted: info },
              );
            }
          }
          break;

        case "apostargold":
        case "apostagold":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!IS_sistemGold)
              return reply(
                `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
              );
            if (!apenasNumeros(q.trim()))
              return reply(
                `│\n│  🎰 *CASSINO GOLD*\n├──────────────\n│  ❌ Formato incorreto!\n│  👉 *Uso:* ${prefix + command} <valor>\n│  💡 *Ex:* ${prefix + command} 50`,
              );

            if (S_Sistema.RS_C(sender, "ChanceAp") >= 15) {
              return reply(
                `│\n│  🎰 *CASSINO GOLD*\n├──────────────\n│  🚫 *Limite diário atingido!*\n│  ⏳ Você já apostou 15 vezes hoje.\n│  _Volte amanhã para jogar mais._`,
              );
            }

            var qnt_AP = Math.floor(q.trim().replaceAll(/\D/g, ""));
            if (qnt_AP <= 0)
              return reply("❌ O valor da aposta deve ser maior que 0.");
            if (S_Sistema.RS(sender, "Golds") < qnt_AP) {
              return reply(
                `│\n│  🎰 *CASSINO GOLD*\n├──────────────\n│  ❌ *Saldo Insuficiente!*\n│  💰 Você tentou apostar: *${qnt_AP}*\n│  💵 Seu saldo: *${S_Sistema.RS(sender, "Golds")}*\n│\n├──────────────\n│  💡 _Dica: Use ${prefix}minerar_gold_`,
              );
            }

            const imgAposta = [
              "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=90",
              "https://images.unsplash.com/photo-1518544465805-592bb83fcf64?w=800&q=90",
              "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=90",
            ];
            const rdImgAp =
              imgAposta[Math.floor(Math.random() * imgAposta.length)];

            var aps = Math.floor(Math.random() * 4);
            S_Sistema.ADD_C_M(sender, "ChanceAp", 1);
            const chancesAp = 15 - S_Sistema.RS_C(sender, "ChanceAp");

            let resultadoTxt = "";
            let reactEmoji = "";

            if (aps === 0) {
              // Perdeu tudo
              S_Sistema.RM(sender, qnt_AP);
              resultadoTxt = `│\n│  🎰 *CASSINO GOLD* • RESULTADO\n├──────────────\n│\n│  💥 *DEU RUIM TOTAL!*\n│  💸 Você perdeu *-${qnt_AP} Golds*\n│  📉 A casa venceu dessa vez...\n│\n│  👤 @${sender.split("@")[0]}\n│  🎰 Chances hoje: *${chancesAp}/15*\n│\n├──────────────\n│  _Nunca desista, ou desista agora!_ 😭`;
              reactEmoji = "😭";
            } else if (aps === 1) {
              // Ganhou dobro
              S_Sistema.ADD(sender, qnt_AP * 2);
              resultadoTxt = `│\n│  🎰 *CASSINO GOLD* • RESULTADO\n├──────────────\n│\n│  🌟 *JACKPOT! VOOU ALTO!*\n│  💰 Você multiplicou e ganhou *+${qnt_AP * 2} Golds*\n│  🎩 A sorte sorriu pra você!\n│\n│  👤 @${sender.split("@")[0]}\n│  🎰 Chances hoje: *${chancesAp}/15*\n│\n├──────────────\n│  _Tá rico hein!_ 🤑`;
              reactEmoji = "🤑";
            } else if (aps === 2) {
              // Perdeu metade
              S_Sistema.RM(sender, Math.floor(qnt_AP / 2));
              resultadoTxt = `│\n│  🎰 *CASSINO GOLD* • RESULTADO\n├──────────────\n│\n│  ⚠️ *FOI QUASE...*\n│  📉 Você perdeu metade: *-${Math.floor(qnt_AP / 2)} Golds*\n│  🤷‍♂️ Nem tão bom, nem tão ruim.\n│\n│  👤 @${sender.split("@")[0]}\n│  🎰 Chances hoje: *${chancesAp}/15*\n│\n├──────────────\n│  _Quem não arrisca não petisca_ 😬`;
              reactEmoji = "😬";
            } else {
              // Empatou
              resultadoTxt = `│\n│  🎰 *CASSINO GOLD* • RESULTADO\n├──────────────\n│\n│  🤝 *EMPATOU!*\n│  ⚖️ Você manteve o que apostou (*${qnt_AP} Golds*)\n│  🛡️ A casa não levou a sua, por pouco.\n│\n│  👤 @${sender.split("@")[0]}\n│  🎰 Chances hoje: *${chancesAp}/15*\n│\n├──────────────\n│  _Vamo tentar de novo?_ 🎲`;
              reactEmoji = "🤝";
            }

            try {
              await conn.sendMessage(from, {
                react: { text: reactEmoji, key: info.key },
              });
              await conn.sendMessage(
                from,
                {
                  image: { url: rdImgAp },
                  caption: resultadoTxt,
                  mentions: [sender],
                },
                { quoted: info },
              );
            } catch {
              conn.sendMessage(
                from,
                { text: resultadoTxt, mentions: [sender] },
                { quoted: info },
              );
            }
          }
          break;

        case "pescargold":
        case "pescar": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          var ChP = dataGp[0].Chances.find((i) => i.id === sender);
          if ((ChP?.ChanceP || 0) >= 3) {
            return reply(
              `│\n│  🎣 *PESCA GOLD*\n├──────────────\n│  🚫 *Limite diário atingido!*\n│  ⏳ Você já pescou 3 vezes hoje.\n│  _Volte amanhã pra pescar mais!_`,
            );
          }

          S_Sistema.ADD_C_M(sender, "ChanceP", 1);
          setGp(dataGp);

          const imgPesca = [
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=90",
            "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&q=90",
            "https://images.unsplash.com/photo-1545816250-e12bedba42ba?w=800&q=90",
          ];
          const rdImgPesc =
            imgPesca[Math.floor(Math.random() * imgPesca.length)];

          const pescaRnd = Math.floor(Math.random() * 5);
          let pescaTxt = "";
          let pescaEmoji = "🎣";

          if (pescaRnd === 0) {
            const ganho = Math.floor(Math.random() * 30) + 10;
            S_Sistema.ADD(sender, ganho);
            pescaTxt = `│\n│  🎣 *PESCA GOLD*\n├──────────────\n│\n│  🐟 *PESCOU UM PEIXE!*\n│  Você fisgou um peixe dourado!\n│  💰 *GANHOU:* +${ganho} Golds\n│\n│  👤 @${sender.split("@")[0]}\n├──────────────\n│  _Boa pescada!_ 🐠`;
            pescaEmoji = "🐟";
          } else if (pescaRnd === 1) {
            const ganho = Math.floor(Math.random() * 80) + 40;
            S_Sistema.ADD(sender, ganho);
            pescaTxt = `│\n│  🎣 *PESCA GOLD*\n├──────────────\n│\n│  🦈 *TUBARÃO DOURADO!*\n│  Você pescou um tubarão raro!\n│  💰 *GANHOU:* +${ganho} Golds\n│\n│  👤 @${sender.split("@")[0]}\n├──────────────\n│  _SORTUDO! Essa foi épica!_ 🤑`;
            pescaEmoji = "🦈";
          } else if (pescaRnd === 2) {
            pescaTxt = `│\n│  🎣 *PESCA GOLD*\n├──────────────\n│\n│  🥾 *PESCOU UMA BOTA?!*\n│  Puxa vida... só saiu um sapato.\n│  💸 *GANHOU:* 0 Golds\n│\n│  👤 @${sender.split("@")[0]}\n├──────────────\n│  _Quem sabe na próxima..._ 😅`;
            pescaEmoji = "🥾";
          } else if (pescaRnd === 3) {
            const perda = Math.floor(Math.random() * 15) + 5;
            S_Sistema.RM(sender, perda);
            pescaTxt = `│\n│  🎣 *PESCA GOLD*\n├──────────────\n│\n│  🐊 *UM JACARÉ!*\n│  Um jacaré puxou sua vara e sumiu!\n│  💸 *PERDEU:* -${perda} Golds (vara nova)\n│\n│  👤 @${sender.split("@")[0]}\n├──────────────\n│  _Cuidado com o lago!_ 🐊`;
            pescaEmoji = "😱";
          } else {
            const ganho = Math.floor(Math.random() * 200) + 100;
            S_Sistema.ADD(sender, ganho);
            pescaTxt = `│\n│  🎣 *PESCA GOLD*\n├──────────────\n│\n│  🏴‍☠️ *TESOURO PIRATA!*\n│  Você pescou um baú de tesouro!\n│  💰 *GANHOU:* +${ganho} Golds\n│\n│  👤 @${sender.split("@")[0]}\n├──────────────\n│  _MÃO DE OURO, CARA!_ 🤩`;
            pescaEmoji = "🏴‍☠️";
          }

          try {
            await conn.sendMessage(from, {
              react: { text: pescaEmoji, key: info.key },
            });
            await conn.sendMessage(from, {
              image: { url: rdImgPesc },
              caption: pescaTxt,
              mentions: [sender],
            });
          } catch {
            conn.sendMessage(from, { text: pescaTxt, mentions: [sender] });
          }
          break;
        }

        case "duelo":
        case "duelogold": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          if (!menc_os2)
            return reply(
              `│\n│  ⚔️ *DUELO GOLD*\n├──────────────\n│  ❌ *Faltou o oponente!*\n│  👉 *Uso:* ${prefix + command} @usuario\n│  💡 *Ex:* ${prefix + command} @Membro`,
            );
          if (menc_os2 === botNumber)
            return reply("❌ Eu não dou duelos, sou pacifista! 🤖");
          if (menc_os2 === sender)
            return reply("❌ Quer duelar consigo mesmo? Vá jogar xadrez! ♟️");

          var ChD = dataGp[0].Chances.find((i) => i.id === sender);
          if ((ChD?.ChanceD || 0) >= 3) {
            return reply(
              `│\n│  ⚔️ *DUELO GOLD*\n├──────────────\n│  🚫 *Limite diário atingido!*\n│  ⏳ Você já duelou 3 vezes hoje.\n│  _Descanse e volte amanhã!_`,
            );
          }

          var EU_D = rggold[ID_G_GOLD].usus.find((i) => i.id === sender);
          var ELE_D = rggold[ID_G_GOLD].usus.find((i) => i.id === menc_os2);

          if ((EU_D?.Golds || 0) < 20)
            return reply("❌ Você precisa de pelo menos 20 Golds para duelar!");
          if ((ELE_D?.Golds || 0) < 20)
            return reply(
              "❌ O oponente não tem Golds suficientes para um duelo!",
            );

          S_Sistema.ADD_C_M(sender, "ChanceD", 1);
          setGp(dataGp);

          const imgDuelo = [
            "https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=800&q=90",
            "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=90",
          ];
          const rdImgDl = imgDuelo[Math.floor(Math.random() * imgDuelo.length)];

          const aposta = Math.min(
            Math.floor(Math.random() * 50) + 20,
            Math.min(EU_D.Golds, ELE_D.Golds),
          );
          const dueloRnd = Math.random();

          const msgInicio = `│\n│  ⚔️ *DUELO INICIADO!*\n├──────────────\n│\n│  🤺 @${sender.split("@")[0]} VS @${menc_os2.split("@")[0]}\n│  💰 *EM JOGO:* ${aposta} Golds\n│\n├──────────────\n│  ⏳ _Preparando as espadas..._`;

          try {
            await conn.sendMessage(from, {
              react: { text: "⚔️", key: info.key },
            });
            await conn.sendMessage(from, {
              image: { url: rdImgDl },
              caption: msgInicio,
              mentions: [sender, menc_os2],
            });
          } catch {
            conn.sendMessage(from, {
              text: msgInicio,
              mentions: [sender, menc_os2],
            });
          }

          setTimeout(async () => {
            let resultDuelo = "";
            let emojiDuelo = "";

            if (dueloRnd > 0.5) {
              S_Sistema.R_A(menc_os2, sender, aposta);
              resultDuelo = `│\n│  🏆 *RESULTADO DO DUELO*\n├──────────────\n│\n│  ⚔️ *VENCEDOR:* @${sender.split("@")[0]}\n│  💀 *PERDEDOR:* @${menc_os2.split("@")[0]}\n│  💰 *PRÊMIO:* +${aposta} Golds\n│\n├──────────────\n│  _O guerreiro prevaleceu!_ 🏅`;
              emojiDuelo = "🏆";
            } else {
              S_Sistema.R_A(sender, menc_os2, aposta);
              resultDuelo = `│\n│  💀 *RESULTADO DO DUELO*\n├──────────────\n│\n│  ⚔️ *VENCEDOR:* @${menc_os2.split("@")[0]}\n│  💀 *PERDEDOR:* @${sender.split("@")[0]}\n│  💸 *PERDA:* -${aposta} Golds\n│\n├──────────────\n│  _Derrota humilhante!_ 😵`;
              emojiDuelo = "💀";
            }

            try {
              await conn.sendMessage(from, {
                react: { text: emojiDuelo, key: info.key },
              });
              await conn.sendMessage(from, {
                text: resultDuelo,
                mentions: [sender, menc_os2],
              });
            } catch {
              conn.sendMessage(from, {
                text: resultDuelo,
                mentions: [sender, menc_os2],
              });
            }
          }, 4000);
          break;
        }

        case "trabalhar":
        case "trabalhargold": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );

          var ChT = dataGp[0].Chances.find((i) => i.id === sender);
          if ((ChT?.ChanceT || 0) >= 2) {
            return reply(
              `│\n│  💼 *TRABALHO*\n├──────────────\n│  🚫 *Limite diário atingido!*\n│  ⏳ Você já trabalhou 2 vezes hoje.\n│  _Descanse e volte amanhã!_`,
            );
          }

          S_Sistema.ADD_C_M(sender, "ChanceT", 1);
          setGp(dataGp);

          const imgTrabalho = [
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=90",
            "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=90",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=90",
          ];
          const rdImgTrb =
            imgTrabalho[Math.floor(Math.random() * imgTrabalho.length)];

          const trabalhos = [
            {
              nome: "👨‍🍳 Cozinheiro",
              desc: "preparou 500 pratos gourmet",
              emoji: "🍳",
            },
            {
              nome: "🧑‍🔧 Mecânico",
              desc: "consertou 15 carros velhos",
              emoji: "🔧",
            },
            {
              nome: "👨‍⚕️ Médico",
              desc: "atendeu 30 pacientes no pronto-socorro",
              emoji: "💉",
            },
            { nome: "👨‍🏫 Professor", desc: "deu 8 aulas seguidas", emoji: "📚" },
            {
              nome: "🧑‍🚀 Astronauta",
              desc: "fez uma missão espacial secreta",
              emoji: "🚀",
            },
            {
              nome: "🧑‍🌾 Fazendeiro",
              desc: "colheu toneladas de milho",
              emoji: "🌽",
            },
            { nome: "🎤 Cantor", desc: "fez um show lotado", emoji: "🎶" },
            {
              nome: "💻 Programador",
              desc: "debugou 200 linhas de código",
              emoji: "⌨️",
            },
            {
              nome: "🧑‍🍳 Padeiro",
              desc: "assou 300 pães artesanais",
              emoji: "🥖",
            },
            {
              nome: "🦸 Super-Herói",
              desc: "salvou a cidade do vilão",
              emoji: "💥",
            },
          ];
          const trbEscolhido =
            trabalhos[Math.floor(Math.random() * trabalhos.length)];
          const salario = Math.floor(Math.random() * 60) + 30; // 30-90

          const trbRnd = Math.random();
          let trbTxt = "";
          let trbEmoji = "";

          if (trbRnd > 0.2) {
            S_Sistema.ADD(sender, salario);
            trbTxt = `│\n│  💼 *DIA DE TRABALHO*\n├──────────────\n│\n│  ${trbEscolhido.nome}\n│  📝 Você ${trbEscolhido.desc}!\n│  💰 *SALÁRIO:* +${salario} Golds\n│\n│  👤 @${sender.split("@")[0]}\n├──────────────\n│  _Bom trabalho, colaborador!_ ${trbEscolhido.emoji}`;
            trbEmoji = "💼";
          } else {
            const multa = Math.floor(Math.random() * 20) + 5;
            S_Sistema.RM(sender, multa);
            trbTxt = `│\n│  💼 *DIA DE TRABALHO*\n├──────────────\n│\n│  ${trbEscolhido.nome}\n│  😵 Você dormiu no serviço e foi demitido!\n│  💸 *MULTA:* -${multa} Golds\n│\n│  👤 @${sender.split("@")[0]}\n├──────────────\n│  _Que vergonha... tente amanhã_ 😂`;
            trbEmoji = "😴";
          }

          try {
            await conn.sendMessage(from, {
              react: { text: trbEmoji, key: info.key },
            });
            await conn.sendMessage(from, {
              image: { url: rdImgTrb },
              caption: trbTxt,
              mentions: [sender],
            });
          } catch {
            conn.sendMessage(from, { text: trbTxt, mentions: [sender] });
          }
          break;
        }

        case "addpalavras_forca":
        case "addpalavras_f":
          if (!SoDono) return reply(Res_SoDono);
          var [ttl, tema, dc] = q.toLowerCase().trim().split("|");
          if (!q.includes("|"))
            return reply(
              `Faltanda a primeira |\nExemplo: ${prefix + command
              } titulo|tema|dica`,
            );
          if (q.lastIndexOf("|") < 0)
            return reply(
              `Faltando a segunda |\nExemplo: ${prefix + command
              } titulo|tema|dica`,
            );
          kir = [];
          for (i of palavrasfr) {
            kir.push(i.plvr);
          }
          if (kir.indexOf(ttl.toLowerCase().trim()) >= 0)
            return reply("Este título já foi adicionado/existente...");
          palavrasfr.push({ plvr: ttl, tema: tema, dica: dc });
          fs.writeFileSync(
            "./dados/global/palavras_forca.json",
            JSON.stringify(palavrasfr, null, 2),
          );
          reply("Palavra adicionada ao jogo da forca com sucesso...");
          break;

        case "rmpalavra_f":
        case "rmpalavra_forca":
          if (!SoDono) return reply(Res_SoDono);
          var i5 = palavrasfr
            .map((i) => i.plvr)
            .indexOf(q.trim().toLowerCase());
          palavrasfr.splice(i5, 1);
          fs.writeFileSync(
            "./dados/global/palavras_forca.json",
            JSON.stringify(palavrasfr, null, 2),
          );
          reply("Palavra tirada do jogo da forca com sucesso...");
          break;

        case "mostrar_forca":
        case "ver_forca":
        case "iniciar_forca":
        case "iniciar-forca":
        case "iniciarforca":
          if (!isGroup) return reply(Res_SoGrupo);
          try {
            if (dataGp[0].forca_inc)
              return reply(
                `Jogo já está em andamento, caso queira resetar, fale com um adm para executar ${prefix}rv-forca, ou tente acertar o jogo da forca que deve está logo a cima.`,
              );
            if (!dataGp[0].forca_inc) {
              rv_forca();
              var DM_FR = dataGp[0].forca_ofc[0];
              dataGp[0].forca_inc = true;
              setGp(dataGp);
              await sleep(300);
              let linha_fr = " ";
              DM_FR.palavra.some((ab) => {
                linha_fr += ` ${ab}`;
              });

              rsp_fr = `- Jogo da forca - ${DM_FR.palavra_ofc.length} Letras\n\nTema: ${DM_FR.tema}\n\nDica: ${DM_FR.dica}\n
|________
 _¦_\n\n\n\n\n\n\n
${linha_fr}\n
_____________________
\n_- JOGO INICIADO -_
\nUse ${prefix}r-f letra que talvez exista por sua observação.\n\nOu ${prefix}r-f nome todo\n
_____________________
`;
              reply(rsp_fr);
            }
          } catch (e) {
            console.log(e);
          }
          break;

        case "r-forca":
        case "r-f":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!dataGp[0].forca_inc)
            return reply(
              `O jogo não foi iniciado.\nDigite ${prefix}iniciar_forca`,
            );
          if (!q.toLowerCase().trim())
            return reply("Digite a letra que deseja responder..");
          var q2 = q_2.trim().toLowerCase();
          if (ANT_LTR_MD_EMJ(q2) || Number(q2))
            return reply(
              "Não pode letras modificadas, nem emoji, nem números..",
            );
          if (q.trim().length == 2)
            return reply(
              "Digite letra por letra para tentar adivinhar, ou acerte a palavra toda, boa sorte...",
            );
          DM_FR = dataGp[0].forca_ofc[0];
          if (DM_FR.escreveu.indexOf(q2) >= 0)
            return reply("Esta letra já foi utilizada..");
          var ERRQ = DM_FR.palavra_ofc.includes(q2) ? 0 : 1;
          var ERROS = dataGp[0].forca_ofc[0].erros;
          DM_FR.escreveu.push(q2);
          setGp(dataGp);
          PSC = [];
          if (DM_FR.palavra_ofc.indexOf(q2) >= 0) {
            for (i = 0; i < DM_FR.palavra_ofc.length; i++) {
              if (DM_FR.palavra_ofc[i] == q2) {
                PSC.push(i);
                DM_FR.acertos += 1;
              }
            }
            for (i of PSC) {
              DM_FR.palavra[i] = q2;
            }
            setGp(dataGp);
          }
          await sleep(300);
          let linha_fr = " ";
          DM_FR.palavra.some((ab) => {
            linha_fr += ` ${ab}`;
          });

          let letra_ut = " ";
          DM_FR.escreveu.some((cd) => {
            letra_ut += `${cd}, `;
          });

          var RST_T = `- Jogo da forca - ${DM_FR.palavra_ofc.length
            } Letras\n\nTema: ${DM_FR.tema}\n\nDica: ${DM_FR.dica}\n
__________-_
\t\t\t\t\t\t\t\t\t_|_\n
\t\t\t\t\t\t\t\t${ERROS + ERRQ >= 1 ? "🤡" : ""}
\t\t\t\t\t\t${ERROS + ERRQ >= 2 ? "👈" : ""} ${ERROS + ERRQ >= 3 ? "👉" : ""
            }\t\t\n\t\t\t\t\t\t\t\t\t${ERROS + ERRQ >= 4 ? "👖" : ""}
\t\t\t\t\t\t\t\t\t${ERROS + ERRQ >= 5 ? "👞" : ""} ${ERROS + ERRQ >= 6 ? "👞" : ""
            }
\n${linha_fr}\n
___-________-_____\n
Letras ja utilizadas: ${letra_ut}
___-________-_____
`;
          if (q.length > 2) {
            reply("Humm, espertinho quer acertar a palavra toda");
          }
          await sleep(500);
          if (
            DM_FR.palavra_ofc.indexOf(q2) >= 0 ||
            (q2.length > 2 && q2 == DM_FR.palavra_ofc)
          ) {
            reply(
              `${q2.length > 2
                ? `Você acertou a palavra toda e ganhou${IS_sistemGold ? " 10 Golds," : " "
                }bom menino(a), irei resetar o jogo...`
                : DM_FR.acertos == DM_FR.palavra_ofc.length
                  ? `Parabéns, toda palavra foi concluída : < ${DM_FR.palavra_ofc
                  } >${IS_sistemGold
                    ? ` você recebeu 5 Golds, por ser o último..,`
                    : " "
                  }irei resetar o jogo..`
                  : `Você acertou uma letra e ganhou${IS_sistemGold ? " 2 Golds " : " "
                  }continue assim..`
              }`,
            );
            if (IS_sistemGold) {
              S_Sistema.ADD(
                sender,
                q.length > 2
                  ? 10
                  : DM_FR.acertos == DM_FR.palavra_ofc.length
                    ? 5
                    : 2,
              );
            }
            if (q2.length > 2 || DM_FR.acertos == DM_FR.palavra_ofc.length) {
              return rv_forca();
            }
            await sleep(200);
            reply(RST_T);
          } else {
            reply(
              `${q2.length > 2
                ? `Infelizmente você perdeu${IS_sistemGold ? " 3 Golds" : ""
                }, errou a palavra toda, deveria ter tentado letra por letra né, irei resetar o jogo..`
                : ERROS + ERRQ == 6
                  ? `Aa, você completou 6 Erros, e perdeu ${IS_sistemGold ? "2 Golds infelizmente," : ", "
                  }irei resetar o jogo..`
                  : `Você Errou, e perdeu ${IS_sistemGold ? "2 Golds" : ""
                  } 😥..`
              }`,
            );
            if (IS_sistemGold) {
              S_Sistema.ADD(sender, 2);
            }
            dataGp[0].forca_ofc[0].erros += 1;
            setGp(dataGp);
            if (q2.length > 2 || ERROS + ERRQ == 6) {
              return rv_forca();
            }
            await sleep(200);
            reply(RST_T);
          }
          break;

        case "figemoji":
        case "figroblox":
        case "figmeme":
        case "figanime":
        case "figcoreana":
        case "figraiva":
        case "figengracada":
        case "figdesenho":
        case "fig":
          if (!q)
            return reply(
              "Insira a quantidade de figurinhas que deseja que eu envie.",
            );
          if (!Number(args[0]) || Number(q.trim()) > 5)
            return reply(
              "Digite a quantidade de figurinhas que deseja que eu envie.. não pode mais de 5..",
            );
          const owner = "badDevelopper";
          const repo = "figus2";
          async function figugit() {
            fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${command}`,
            )
              .then((response) => response.json())
              .then((data) => {
                const randomIndex = Math.floor(Math.random() * data.length);
                conn.sendMessage(from, {
                  sticker: {
                    url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${command}/${data[randomIndex].name}`,
                  },
                });
              });
          }
          for (i = 0; i < q; i++) {
            await sleep(2000);
            figugit();
          }
          break;

        case "figurinhas":
          {
            if (!q) return reply("Insira a qnd de figu que deja que eu envie");
            if (!Number(args[0]) || Number(q.trim()) > 5)
              return reply(
                "Digite a quantidade de figurinhas que deseja que eu envie.. não pode mais de 5..",
              );
            const owner = nescessario.donodorepo;
            const repo = nescessario.pastadorepo;
            const pastacomfigu = nescessario.pastacomfigu;
            async function figugit() {
              fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${pastacomfigu}`,
              )
                .then((response) => response.json())
                .then((data) => {
                  const randomIndex = Math.floor(Math.random() * data.length);
                  conn.sendMessage(from, {
                    sticker: {
                      url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${pastacomfigu}/${data[randomIndex].name}`,
                    },
                  });
                });
            }
            for (i = 0; i < q; i++) {
              await sleep(2000);
              figugit();
            }
          }
          break;

        case "limpar_mortos-cnt":
          if (!SoDono) return reply(Res_SoDono);
          if (!isGroup) return reply(Res_SoDono);
          var RD_CNT =
            countMessage[countMessage.map((i) => i.groupId).indexOf(from)]
              .numbers;
          CNT1 = [];
          for (i of groupMembers) {
            CNT1.push(i.id);
          }
          CNT = [];
          for (i of RD_CNT) {
            if (!CNT1.includes(i.id)) CNT.push(i);
          }
          for (i of CNT) {
            RD_CNT.splice(RD_CNT.map((i) => i.id).indexOf(i.id), 1);
          }
          fs.writeFileSync(
            "./dados/countmsg.json",
            JSON.stringify(countMessage, null, 2),
          );
          reply(
            "Usuários que já foi removido, ou saiu do grupo, foi tirado do contador de mensagens..",
          );
          break;

        case "tirar_docnt":
          if (!SoDono) return;
          if (!isGroup) return reply(Res_SoDono);
          var i2 = countMessage.map((a) => a.groupId).indexOf(from);
          var i1 = countMessage[i2].numbers
            .map((b) => b.id)
            .indexOf(q.trim() + SNET);
          countMessage[i2].numbers.splice(i1, 1);
          fs.writeFileSync(
            "./dados/countmsg.json",
            JSON.stringify(countMessage, null, 2),
          );
          reply("Usuário tirado do contador de mensagens com sucesso...");
          break;

        case "anotacao":
        case "anotacoes":
        case "nota":
        case "notas":
          if (!isGroup) return reply(Res_SoGrupo);
          if (command == "anotacao" || command == "nota") {
            if (!q.trim())
              return reply("Digite o título da anotação que deseja puxar..");
            if (!JSON.stringify(anotar).includes(from))
              return reply("Este grupo não tem nenhuma anotação...");
            var i2 = anotar.map((i) => i.grupo).indexOf(from);
            if (!JSON.stringify(anotar[i2].puxar).includes(q))
              return reply("Não contém nenhuma anotação com este título.");
            var i3 = anotar[i2].puxar.map((i) => i.nota).indexOf(q.trim());
            mention(`〈 ${anotar[i2].puxar[i3].anotacao} 〉`);
          } else {
            var i2 = anotar.map((i) => i.grupo).indexOf(from);
            if (i2 < 0) return reply("Este grupo não tem nenhuma anotação...");
            var i2 = anotar.map((i) => i.grupo).indexOf(from);
            var antr = anotar[i2]?.puxar;
            txtin = "──────────────────\n\n";
            for (i = 0; i < antr?.length; i++) {
              txtin += `↝ Anotação: ⟮ ${anotar[i2]?.puxar[i]?.nota} ⟯ - 〈 ${anotar[i2]?.puxar[i]?.anotacao} 〉\n\n`;
            }
            txtin += "──────────────────\n\n";
            mention(txtin);
          }
          break;

        case "download-link":
          if (q.includes("video") || q.includes("mp4")) {
            conn
              .sendMessage(
                from,
                { video: { url: q }, mimetype: "video/mp4" },
                { quoted: info },
              )
              .catch((e) => {
                reply("Erro, visualize se este link é válido...");
              });
          } else if (q.includes("webp") || q.includes("jpg")) {
            conn
              .sendMessage(from, { image: { url: q } }, { quoted: info })
              .catch((e) => {
                reply("Erro, visualize se este link é válido...");
              });
          }
          break;

        case "signo":
          try {
            if (!q.trim())
              return reply(
                `Digite seu signo, exemplo: ${prefix + command} virgem`,
              );
            ABC = await reqapi.signo(q.trim());
            conn
              .sendMessage(from, {
                image: { url: ABC.img },
                caption: `Signo: ${q}\n\n${ABC.title}\n${ABC.body}`,
              })
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "moedas":
        case "moeda":
          try {
            ABC = await reqapi.moedas();
            reply(
              `${ABC?.dolar}\n\n${ABC?.euro}\n\n${ABC?.libra}\n\n${ABC?.bitcoin}\n\n${ABC?.ethereum}\n\n${ABC?.bovespa}\n\n${ABC?.ouro}`,
            );
          } catch {
            return reply("Erro, breve volta.");
          }
          break;

        case "esportenoticias":
        case "esportenoticia":
        case "espnoticia":
        case "espnoticias":
        case "noticiasesporte":
        case "noticiaesporte":
        case "noticiaesp":
        case "noticiasesp":
        case "esporte_noticias":
        case "esporte_noticia":
        case "esporte-noticias":
        case "esporte-noticia":
          reply("Aguarde, realizando ação..");
          try {
            ABC = await reqapi.esporte();
            AB = "";
            for (i = 1; i < ABC.length; i++) {
              AB += `${ABC[i].titulo}\n\n`;
            }
            conn.sendMessage(
              from,
              { image: { url: ABC[0].img }, caption: AB },
              { quoted: info },
            );
          } catch {
            return reply(
              "Erro, tente novamente ou aguarde até voltar ao normal.",
            );
          }
          break;

        // ========== TABELA BRASILEIRÃO SÉRIE A e B ========== \\
        case "brasileiraoa":
        case "brasileirao_a":
        case "brasileirao-a":
        case "seriea":
        case "serie_a":
        case "tabelaa":
        case "tabela_a":
          {
            try {
              reply(Res_Aguarde);
              const anoAtual = new Date().getFullYear();
              let dados = null;

              // Tentar buscar tabela do ano atual e anterior
              for (const ano of [anoAtual, anoAtual - 1]) {
                const res = await axios.get(
                  `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4351&s=${ano}`,
                  { timeout: 15000 },
                );
                if (res.data?.table && res.data.table.length > 0) {
                  dados = res.data.table;
                  break;
                }
              }

              if (!dados || dados.length === 0) {
                return reply(
                  "⚠️ Tabela do Brasileirão Série A ainda não disponível para esta temporada.",
                );
              }

              // Buscar badges em alta qualidade de todos os times
              let badgeMap = {};
              try {
                const teamsRes = await axios.get(
                  "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Brazilian%20Serie%20A",
                  { timeout: 10000 },
                );
                if (teamsRes.data?.teams) {
                  for (const team of teamsRes.data.teams) {
                    // Remover /tiny ou /small do final para ter alta qualidade
                    const hqBadge = team.strBadge
                      ? team.strBadge.replace(/\/(tiny|small|medium)$/i, "")
                      : "";
                    badgeMap[team.strTeam.toLowerCase()] = hqBadge;
                  }
                }
              } catch (e) { }

              // Badge do líder em alta qualidade
              let imgLider = "";
              const liderNome = dados[0].strTeam.toLowerCase();
              if (badgeMap[liderNome]) {
                imgLider = badgeMap[liderNome];
              } else {
                imgLider = dados[0].strBadge
                  ? dados[0].strBadge.replace(/\/(tiny|small|medium)$/i, "")
                  : "https://www.thesportsdb.com/images/media/league/badge/iup20h1718116940.png";
              }

              // Montar tabela organizada
              const temporada = dados[0].strSeason || anoAtual;
              let txt = `⚽🏆 *BRASILEIRÃO SÉRIE A ${temporada}* 🏆⚽\n`;
              txt += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
              txt += `📊 *Classificação Atualizada*\n\n`;

              // Legenda de zona por posição
              const getEmoji = (pos) => {
                if (pos <= 4) return "🟢"; // Libertadores
                if (pos <= 6) return "🔵"; // Pré-Libertadores
                if (pos <= 12) return "🟡"; // Sul-Americana
                if (pos >= 17) return "🔴"; // Rebaixamento
                return "⚪";
              };

              const totalTimes = Math.min(dados.length, 20);
              for (let i = 0; i < totalTimes; i++) {
                const t = dados[i];
                const pos = Number(t.intRank);
                const emoji = getEmoji(pos);
                const posStr = String(pos).padStart(2, " ");
                const pts = String(t.intPoints || 0).padStart(2, " ");
                const jgs = t.intPlayed || 0;
                const vit = t.intWin || 0;
                const emp = t.intDraw || 0;
                const der = t.intLoss || 0;
                const gf = t.intGoalsFor || 0;
                const gc = t.intGoalsAgainst || 0;
                const sg =
                  Number(t.intGoalDifference) >= 0
                    ? `+${t.intGoalDifference}`
                    : `${t.intGoalDifference}`;

                // Nome do time com troféu pro líder e medalhas
                let nomeExtra = "";
                if (pos === 1) nomeExtra = " 👑";
                else if (pos === 2) nomeExtra = " 🥈";
                else if (pos === 3) nomeExtra = " 🥉";

                txt += `${emoji} *${posStr}°* │ *${t.strTeam}*${nomeExtra}\n`;
                txt += `       *${pts}pts* │ ${jgs}J ${vit}V ${emp}E ${der}D │ ${gf}:${gc} (${sg})\n`;

                // Separadores visuais por zona
                if (pos === 4) txt += `   ┈┈┈ 🏆 *Libertadores* ┈┈┈\n`;
                else if (pos === 6) txt += `   ┈┈┈ 🏅 *Pré-Liberta* ┈┈┈\n`;
                else if (pos === 12) txt += `   ┈┈┈ 🟡 *Sul-Americana* ┈┈┈\n`;
                else if (pos === 16) txt += `   ┈┈┈ ⚠️ *Z. Rebaixamento* ┈┈┈\n`;
              }

              txt += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
              txt += `🟢 Libertadores  🔵 Pré-Liberta\n`;
              txt += `🟡 Sul-Americana  🔴 Rebaixamento\n`;
              txt += `📅 ${dados[0].dateUpdated?.split(" ")[0] || "—"}\n`;
              txt += `🏟️ ${totalTimes} clubes │ *${NomeDoBot}*`;

              conn
                .sendMessage(
                  from,
                  { image: { url: imgLider }, caption: txt },
                  { quoted: info },
                )
                .catch(() => reply(txt));
            } catch (e) {
              console.error("[BRASILEIRAO-A]", e.message || e);
              return reply(
                "❌ Erro ao buscar tabela do Brasileirão Série A. Tente novamente mais tarde.",
              );
            }
          }
          break;

        case "brasileiraob":
        case "brasileirao_b":
        case "brasileirao-b":
        case "serieb":
        case "serie_b":
        case "tabelab":
        case "tabela_b":
          {
            try {
              reply(Res_Aguarde);
              const anoAtual = new Date().getFullYear();
              let dados = null;

              for (const ano of [anoAtual, anoAtual - 1]) {
                const res = await axios.get(
                  `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4404&s=${ano}`,
                  { timeout: 15000 },
                );
                if (res.data?.table && res.data.table.length > 0) {
                  dados = res.data.table;
                  break;
                }
              }

              if (!dados || dados.length === 0) {
                return reply(
                  "⚠️ Tabela do Brasileirão Série B ainda não disponível para esta temporada.",
                );
              }

              // Buscar badges em alta qualidade
              let badgeMap = {};
              try {
                const teamsRes = await axios.get(
                  "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Brazilian%20Serie%20B",
                  { timeout: 10000 },
                );
                if (teamsRes.data?.teams) {
                  for (const team of teamsRes.data.teams) {
                    const hqBadge = team.strBadge
                      ? team.strBadge.replace(/\/(tiny|small|medium)$/i, "")
                      : "";
                    badgeMap[team.strTeam.toLowerCase()] = hqBadge;
                  }
                }
              } catch (e) { }

              // Badge do líder em alta qualidade
              let imgLider = "";
              const liderNome = dados[0].strTeam.toLowerCase();
              if (badgeMap[liderNome]) {
                imgLider = badgeMap[liderNome];
              } else {
                imgLider = dados[0].strBadge
                  ? dados[0].strBadge.replace(/\/(tiny|small|medium)$/i, "")
                  : "https://www.thesportsdb.com/images/media/league/badge/iup20h1718116940.png";
              }

              const temporada = dados[0].strSeason || anoAtual;
              let txt = `⚽🏆 *BRASILEIRÃO SÉRIE B ${temporada}* 🏆⚽\n`;
              txt += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
              txt += `📊 *Classificação Atualizada*\n\n`;

              const getEmoji = (pos) => {
                if (pos <= 4) return "🟢"; // Acesso à Série A
                if (pos >= 17) return "🔴"; // Rebaixamento
                return "⚪";
              };

              const totalTimes = Math.min(dados.length, 20);
              for (let i = 0; i < totalTimes; i++) {
                const t = dados[i];
                const pos = Number(t.intRank);
                const emoji = getEmoji(pos);
                const posStr = String(pos).padStart(2, " ");
                const pts = String(t.intPoints || 0).padStart(2, " ");
                const jgs = t.intPlayed || 0;
                const vit = t.intWin || 0;
                const emp = t.intDraw || 0;
                const der = t.intLoss || 0;
                const gf = t.intGoalsFor || 0;
                const gc = t.intGoalsAgainst || 0;
                const sg =
                  Number(t.intGoalDifference) >= 0
                    ? `+${t.intGoalDifference}`
                    : `${t.intGoalDifference}`;

                let nomeExtra = "";
                if (pos === 1) nomeExtra = " 👑";
                else if (pos === 2) nomeExtra = " 🥈";
                else if (pos === 3) nomeExtra = " 🥉";

                txt += `${emoji} *${posStr}°* │ *${t.strTeam}*${nomeExtra}\n`;
                txt += `       *${pts}pts* │ ${jgs}J ${vit}V ${emp}E ${der}D │ ${gf}:${gc} (${sg})\n`;

                if (pos === 4) txt += `   ┈┈┈ ⬆️ *Acesso Série A* ┈┈┈\n`;
                else if (pos === 16) txt += `   ┈┈┈ ⚠️ *Z. Rebaixamento* ┈┈┈\n`;
              }

              txt += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
              txt += `🟢 Acesso à Série A  🔴 Rebaixamento\n`;
              txt += `📅 ${dados[0].dateUpdated?.split(" ")[0] || "—"}\n`;
              txt += `🏟️ ${totalTimes} clubes │ *${NomeDoBot}*`;

              conn
                .sendMessage(
                  from,
                  { image: { url: imgLider }, caption: txt },
                  { quoted: info },
                )
                .catch(() => reply(txt));
            } catch (e) {
              console.error("[BRASILEIRAO-B]", e.message || e);
              return reply(
                "❌ Erro ao buscar tabela do Brasileirão Série B. Tente novamente mais tarde.",
              );
            }
          }
          break;

        case "letra":
        case "liryc":
        case "letram":
        case "letramusic":
        case "letramusica":
        case "letra_musica":
        case "letrademusica":
          {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} Ela me traiu`);
            try {
              reply(Res_Aguarde);
              const abc = await reqapi.letra_m(q.trim());
              reply(
                ` - Titulo: ${abc.titulo || "Erro..."}\n\n - Compositor: ${abc.compositor || "Erro..."
                }\n\n - Letra:\n\n${abc.letra || "Erro..."}`,
              );
            } catch (e) {
              reply("Erro... 🥱");
            }
          }
          break;

        case "aptoide_pesquisa":
          if (!q.trim()) return reply("Exemplo: WhatsApp");
          try {
            abc = await reqapi.aptoide_pesquisa(q.trim());
            reply(abc);
          } catch {
            return reply("Erro... 🥱");
          }
          break;

        case "aptoide":
          if (!q.trim().includes("aptoide.com"))
            return reply(
              `Exemplo: ${prefix + command
              } link do aptoide\n\nUse o comando ${prefix}aptoide_pesquisa Exemplo: whatsapp, ae vai receber as url, pegue a url e use.`,
            );
          reply(Res_Aguarde);
          try {
            abc = await reqapi.aptoide(q.trim());
            conn.sendMessage(
              from,
              {
                document: { url: abc.link },
                mimetype: "application/vnd.android.package-archive",
                fileName: abc.titulo,
              },
              { quoted: info },
            );
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "playstore":
          try {
            if (q.length < 2)
              return reply("Cade o título do apk que deseja pesquisar?");
            abc = await reqapi.playstore(q.trim());
            ABC = "Play Store pesquisa:\n\n";
            for (let a of abc.resultados) {
              ABC += ` - NOME DO APK: ${a.title}\n - ID: ${a.appId}\n - URL: ${a.url
                }\n\n${"-".repeat(20)}\n\n`;
            }
            reply(ABC);
          } catch {
            return reply("Erro... 🥱");
          }
          break;

        case "logos1":
          if (!q.trim()) return reply(`Exemplo: ${prefix + command} Aleatory`);
          var LOGOS = [
            "shadow",
            "metalgold",
            "cup",
            "txtborboleta",
            "cemiterio",
            "efeitoneon",
            "harryp",
            "lobometal",
            "neon2",
            "madeira",
            "lovemsg3",
            "coffecup",
            "coffecup2",
            "florwooden",
            "narutologo",
            "fire",
            "romantic",
            "smoke",
            "papel",
            "lovemsg",
            "lovemsg2",
            "fiction",
            "3dstone",
            "areia",
            "style",
            "blood",
            "pink",
            "cattxt",
            "neondevil",
            "carbon",
            "metalfire",
            "thunder",
            "vidro",
            "jokerlogo",
            "transformer",
            "demonfire",
            "jeans",
            "metalblue",
            "natal",
            "ossos",
            "asfalto",
            "break",
            "glitch2",
            "colaq",
            "neon3",
            "nuvem",
            "horror",
            "matrix",
            "berry",
            "luxury",
            "lava",
            "thunderv2",
            "neongreen",
            "neve",
            "neon",
            "neon1",
            "neon3d",
            "gelo",
            "neon3",
            "3dgold",
            "lapis",
            "toxic",
            "demongreen",
            "rainbow",
            "halloween",
            "angelwing",
            "hackneon",
            "fpsmascote",
            "equipemascote",
            "txtquadrinhos",
            "ffavatar",
            "mascotegame",
            "angelglx",
            "gizquadro",
            "wingeffect",
            "blackpink",
            "metalgold",
            "girlmascote",
            "logogame",
          ];
          var ENV = [];
          for (var a = 0; a < LOGOS.length; a++) {
            ENV.push({
              title: LOGOS[a],
              description: `Logo personalizada: ${a + 1}`,
              rowId: prefix + LOGOS[a] + ` ${q}`,
            });
          }
          LGS = "LOGOS DE 1 TEXTO:\n\n";
          for (let i of ENV) {
            LGS += `${i.description}\n\nLogo: ${i.title}\n\nExemplo: ${i.rowId}\n\n_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-\n\n`;
          }
          reply(LGS);
          break;
        case "amazon":
        case "amazonsearch":
          if (q.trim().length < 4)
            return reply(`Exemplo: ${prefix + command} fone redmi airdots 2`);
          try {
            reply(Res_Aguarde);
            ABC = await reqapi.amazon(q.trim());
            RST = "Pesquisa Amazon:\n\n";
            for (i = 0; i < (ABC.length > 40 ? 40 : ABC.length); i++) {
              RST += `( ${i + 1} ) - Titulo: ${ABC[i].titulo}\n- Preço: ${ABC[i].preco
                }\n- Url: ${ABC[i].url}\n${"_".repeat(27)}\n\n`;
            }
            reply(RST);
          } catch {
            return reply(`Erro, não foi possivel encontrar.`);
          }
          break;
        case "pesquisa":
        case "pesquisar":
          try {
            bla = await reqapi.pesquisa(q.trim());
            conn.sendMessage(from, { text: bla.msg }, { quoted: info });
          } catch {
            return reply("Erro... 🥱");
          }
          break;

        case "menu":
        case "helpp":
        case "menup":
        case "comandosp":
          if (isGroup) {
            let GtGp;
            try {
              GtGp = await conn.groupFetchAllParticipating();
            } catch {
              GtGp = false;
            }

            if (GtGp) {
              var groups = Object.entries(GtGp)
                .slice(0)
                .map((entry) => entry[1]);
              for (var c = 0; c < groupMetadata_RG?.length; c++) {
                if (groups.map((i) => i.id !== groupMetadata_RG[c].id)) {
                  groupMetadata_RG.splice(
                    groupMetadata_RG.findIndex(
                      (l) => l.id === groupMetadata_RG[c].id,
                    ),
                    1,
                  );
                  fs.writeFileSync(
                    "./dados/global/groups.json",
                    JSON.stringify(groupMetadata_RG, null, 2),
                  );
                }
              }
            }
          }

          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: menu(prefix, NomeDoBot, sender),
              mentions: [sender],
            },
            { quoted: info },
          );
          break;

        case "info":
          {
            if (!q_2) return reply(`Exemplo: ${prefix + command} play`);
            if (!infos.some((i) => i.comando === q_2))
              return reply(
                `Comando -> ${q_2} não encontrado na lista de informações, sinto muito.`,
              );
            if (infos.map((i) => i.comando === q_2))
              return reply(
                infos
                  .find((i) => i.comando === q_2)
                  .info.replaceAll("#prefixo#", prefix),
              );
          }
          break;

        case "addinfo":
          {
            if (!SoDono) return reply(Res_SoDono);
            const comando = q_2.split("|")[0];
            const info = q.trim().split("|")[1];
            if (comando && info && !comando.startsWith(prefix)) {
              const info_a = infos.find((i) => i.comando === comando)?.info;
              if (!info_a) {
                infos.push({ comando: comando, info: info });
                fs.writeFileSync(
                  "./dados/org/json/infos.json",
                  JSON.stringify(infos, null, 2),
                );
                reply(
                  `Informação adicionada com sucesso, use: ${prefix}info ${comando} para ver a informação do comando, que você adicionou.`,
                );
              } else {
                reply(
                  `Informação do comando -> ${comando} foi atualizada com sucesso, Como era a informação anterior:\n\n${info_a}`,
                );
                infos[infos.findIndex((i) => i.comando === comando)].info =
                  info;
                fs.writeFileSync(
                  "./dados/org/json/infos.json",
                  JSON.stringify(infos, null, 2),
                );
              }
            } else {
              return reply(
                `Cade o comando que você deseja renovar ou acrescentar informação ? Exemplo: ${prefix + command
                } play|Este comando é usado para pedir música ou baixar vídeos/áudios, use por exemplo: ${prefix}play e o nome da música, ou se for um video, use: ${prefix}playmp4 e o nome do vídeo.`,
              );
            }
          }
          break;

        case "ativarfuncoesdono":
        case "ativacoes_dono":
          if (!SoDono) return reply(Res_SoDono);
          reply(`
_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

Quiser saber as informações de como usar, e comandos que tiver junto com o comando que deseja, use "${prefix}info antipv" o antipv é só exemplo, serve para os outros também...

- Comando de Ativar / Desativar o bloqueador de quando ligarem pro bot, so
digitar o comando ligar, e denovo pra desligar: 
${prefix}antiligar
Status: ${nescessario?.anticall ? "✓" : "✕"}

- Comando para ativar ou desativar o visualizador de mensagem, visualizar
mensagem de tudo, so digitar o comando pra ligar, e o comando novamente pra
desligar: 
${prefix}visualizarmsg
Status: ${nescessario?.visualizarmsg ? "✓" : "✕"}

- Comando de desativar o que mostra comandos dados no console, so digitar o
comando 1 vez ora ativar, e digitar o comando novamente pra desativar:
${prefix}console
Status: ${nescessario?.consoleoff ? "✓" : "✕"}

- Comando para ativar o bloqueador de quando algum usuário mande mensagem
privado do bot, seja bloqueado, o comando usado 1 vez, ele ativa, usado
novamente ele desativar:
${prefix}antipv
Status: ${nescessario?.antipv ? "✓" : "✕"}

- Comando de falar que não pode mandar mensagem privado, para alterar a
mensagem, so usar o comando ${prefix}msgantipv e coloque o que quer, para ativar
o comando é digitar ele uma vez, e digitar novamente para desativar: 
${prefix}antipv2
Status: ${nescessario?.antipv2 ? "✓" : "✕"}

- Este terceiro antipv, ele apenas ignora qualquer coisa enviada no privado do bot, e também ignora comandos pedido.
Use uma vez para ativar, e se quiser desativar, só usar novamente, Comando: ${prefix}antipv3
Status: ${nescessario?.antipv3 ? "✓" : "✕"}

- Comando de ativar e desativar o audio do menu:
${prefix}audio-menu
Status: ${nescessario?.menu_audio ? "✓" : "✕"}

- Comando de ativar e desativar o verificado de marcação: 
${prefix}verificado-global
Status: ${nescessario?.verificado ? "✓" : "✕"}

- Comando de desativar o bot completamente para ninguém usar:
${prefix}botoff
Status: ${nescessario?.botoff ? "✓" : "✕"}

- Comando de funcionar só comandos pra administrador:
${prefix}So_Adm
Status: ${dataGp[0]?.soadm ? "✓" : "✕"}

- Comando para recolher link de grupos que o bot estiver:
${prefix}recolherlink
Status: ${nescessario?.isRecolherLink ? "✓" : "✕"}

_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
`);
          break;

        case "verificado-global":
          if (!SoDono) return reply(Res_SoDono);
          if (!isVerificado) {
            nescessario.verificado = true;
            setNes(nescessario);
            reply(
              `- O Verificado foi Ativado de todos os comandos que tem, para tirar novamente só digitar o comando novamente..`,
            );
          } else if (isVerificado) {
            nescessario.verificado = false;
            setNes(nescessario);
            reply(
              `- O Verificado de todos os menu / comando, foi Desativado, para ativar novamente só digitar o comando novamente..`,
            );
          }
          break;

        case "audio-menu":
          if (!SoDono) return reply(Res_SoDono);
          if (!isAudioMenu) {
            nescessario.menu_audio = true;
            setNes(nescessario);
            reply(
              `- O Áudio foi ativado para o menu _- COM SUCESSO - _\n\nSe quiser Desativar - Só digitar o comando novamente`,
            );
          } else if (isAudioMenu) {
            nescessario.menu_audio = false;
            setNes(nescessario);
            reply(
              `- O Áudio foi Desativado do menu _- COM SUCESSO - _\n\nSe quiser Ativar - Só digitar o comando novamente`,
            );
          }
          break;

        case "console":
          if (!SoDono) return reply(Res_SoDono);
          if (!isConsole) {
            nescessario.consoleoff = true;
            setNes(nescessario);
            reply(
              `- O comando de tirar o console foi ativado _- COM SUCESSO - _ Agora não verá mais os comandos nem mensagem dadas no console, mas funcionará perfeitamente, ok?, é bom para evitar banimento de spam no heroku.\n\nSe quiser Desativar - Só digitar o comando novamente`,
            );
          } else if (isConsole) {
            nescessario.consoleoff = false;
            setNes(nescessario);
            reply(
              `- O comando de tirar o console foi Desativado_- COM SUCESSO - _ Agora verá os comandos e mensagens dadas no console, mas se for utilizar no heroku, recomendo ativar. é bom para evitar banimento de spam no heroku.\n\nSe quiser Ativar - Só digitar o comando novamente`,
            );
          }
          break;

        case "logos":
        case "menulogo":
        case "menulogos":
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: menulogos(prefix, sender),
              mentions: [sender],
            },
            { quoted: info },
          );
          break;

        // goldmenu é alias de menugold (tratado acima no switch)
        case "menulogo":
        case "menulogos":
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: menulogos(prefix, sender),
              mentions: [sender],
            },
            { quoted: info },
          );
          break;

        case "menuadm":
        case "menuadms":
        case "adm":
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: adms(prefix, sender),
              mentions: [sender],
            },
            { quoted: info },
          );
          if (isAudioMenu) {
            conn.sendMessage(
              from,
              {
                audio: { url: "./dados/audios/admin.ogg" },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              },
              { quoted: info },
            );
          }
          break;

        case "menudono":
        case "donomenu":
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: menudono(prefix, sender),
              mentions: [sender],
            },
            { quoted: info },
          );
          break;


        case "menumidias":
        case "menumedia":
        case "menumidia":
        case "menudownloads":
        case "menufigurinha":
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: menumidias(prefix, sender),
              mentions: [sender],
            },
            { quoted: info },
          );
          break;

        case "efeitosimg":
        case "efeitos":
        case "efeitoimg":
        case "efeitosmarcar":
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: efeitos(prefix, sender),
              mentions: [sender],
            },
            { quoted: info },
          );
          break;

        case "alteradores":
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: alteradores(prefix, sender),
              mentions: [sender],
            },
            { quoted: selo },
          );
          break;
        case "menubrincadeiras":
        case "brincadeiras":
        case "brincadeira":
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(
            from,
            {
              ...getMenuMedia(),
              caption: brincadeiras(prefix, sender),
              mentions: [sender],
            },
            { quoted: selo },
          );
          if (isAudioMenu) {
            conn.sendMessage(
              from,
              {
                audio: { url: "./dados/audios/nubrinks.ogg" },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              },
              { quoted: info },
            );
          }
          break;

        case "menupremium":
        case "menuprem":
          conn.sendMessage(
            from,
            { text: menuprem(prefix, sender), mentions: [sender] },
            { quoted: selo },
          );
          break;

        case "configurar-bot":
        case "configurarbot":
        case "configbot": {
          try {
            await conn.sendMessage(from, {
              react: { text: "⚙️", key: info.key },
            });
            await conn.sendMessage(
              from,
              {
                ...getMenuMedia(),
                caption: configbot(prefix),
              },
              { quoted: selo },
            );
          } catch {
            conn.sendMessage(
              from,
              { text: configbot(prefix) },
              { quoted: selo },
            );
          }
          break;
        }

        case "comandos-termux":
          conn.sendMessage(
            from,
            { text: cmd_termux(prefix) },
            { quoted: selo },
          );
          break;

        // case "perfil" removido — código duplicado unificado no bloco principal acima (linha ~3430)

        case "conselhobiblico":
        case "conselhosbiblico":
        case "conselhosb":
        case "conselhob":
          var conselhosb =
            conselhob[Math.floor(Math.random() * conselhob.length)];
          jr = `${tempo} ${pushname} 

Conselhos Bíblico para você: 

- ${conselhosb} 

> Bot: ${NomeDoBot}
> Grupo: ${groupName}`;
          conn.sendMessage(
            from,
            { text: jr },
            { quoted: info, contextInfo: { mentionedJid: jr } },
          );
          break;

        //========(FUNÇÕES-PREMIUM-AQUI)=======\\

        case "mediafire":
          try {
            if (!q.includes("mediafire.com"))
              return reply(
                "Faltando o link do mediafire para download do arquivo, cade?",
              );
            ABC = await reqapi.mediafire(q.trim());
            reply(
              `Enviando: ${ABC.resultado[0].nama}\n\nPeso: ${ABC.resultado[0].size}`,
            );
            conn
              .sendMessage(from, {
                document: { url: ABC.resultado[0].link },
                mimetype: "application/" + ABC.resultado[0].mime,
                fileName: ABC.resultado[0].nama,
              })
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "test":
          conn.sendMessage(from, {});
          break;

        case "ler":
        case "ocr":
        case "lerfoto":
          if (
            ((isMedia && !info.message.videoMessage) || isQuotedImage) &&
            !q.length <= 1
          ) {
            encmedia = isQuotedImage
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .imageMessage
              : info.message.imageMessage;
            rane = getRandom("." + (await getExtension(encmedia.mimetype)));
            buffimg = await getFileBuffer(encmedia, "image");
            fs.writeFileSync(rane, buffimg);
            media = rane;
            reply(Res_Aguarde);
            await recognize(media, { lang: "eng+ind", oem: 1, psm: 3 })
              .then((teks) => {
                reply(teks.trim());
                DLT_FL(media);
              })
              .catch((err) => {
                reply(err.message);
                DLT_FL(media);
              });
          } else {
            reply("Somente fotos!");
          }
          break;

        case "abrirgp":
          if (!isGroup)
            return reply("Somente sm grupo pode-se usar este comando.");
          if (!isGroupAdmins)
            return reply(
              "Somente adminstradores do grupo podem usar este comando.",
            );
          if (!isBotGroupAdmins)
            return reply("O bot não é adminstrador do grupo.");
          if (!q)
            return reply(`Retorne após o comando o tempo em que o grupo abrirá, seguindo os exemplos:
${prefix + command} 12:00 _(horário exato)_
ou
${prefix + command} 4h _(daqui a 4 horas a frente)_`);
          letra = q.slice(q.length - 1, q.length).toLowerCase();
          if (letra == `s`) {
            nmr = Number(q.slice(0, q.length - 1));
            mention(
              `*Sucesso @${sender.split("@")[0]
              }, o grupo ${groupName} será aberto em ${q}* ✔`,
            );
            setTimeout(async () => {
              conn.groupSettingUpdate(from, "not_announcement");
              await sleep(2500);
              conn.sendMessage(from, {
                text: `[❕] *O grupo foi aberto com sucesso após ${q}* ✔`,
              });
            }, nmr * 1000);
          } else {
            addOpenCloseGP(from, q, sender, `open`);
            last = getLastOpenCloseGP(from);
            day = last.dias;
            mention(
              `*Sucesso @${sender.split("@")[0]
              }, o grupo ${groupName} será aberto ${last.dias > 0
                ? sendFutureTime([{ valor: last.dias, type: `days` }])
                  .toLowerCase()
                  .split(` `)[0] + ` `
                : ``
              }às ${last.hora}* ✔`,
            );
          }
          break;

        case "fechargp":
          if (!isGroup)
            return reply("Somente sm grupo pode-se usar este comando.");
          if (!isGroupAdmins)
            return reply(
              "Somente adminstradores do grupo podem usar este comando.",
            );
          if (!isBotGroupAdmins)
            return reply("O bot não é adminstrador do grupo.");
          if (!q)
            return reply(`Retorne após o comando o tempo em que o grupo fechará, seguindo os exemplos:
${prefix + command} 12:00 _(horário exato)_
ou
${prefix + command} 4h _(daqui a 4 horas a frente)_`);
          letra = q.slice(q.length - 1, q.length).toLowerCase();
          if (letra == `s`) {
            nmr = Number(q.slice(0, q.length - 1));
            mention(
              `*Sucesso @${sender.split("@")[0]
              }, o grupo ${groupName} será fechado em ${q}* ✔`,
            );
            setTimeout(async () => {
              conn.groupSettingUpdate(from, "announcement");
              await sleep(2500);
              conn.sendMessage(from, {
                text: `[❗] *O grupo foi fechado com sucesso após ${q}* ❌`,
              });
            }, nmr * 1000);
          } else {
            addOpenCloseGP(from, q, sender, `close`);
            last = getLastOpenCloseGP(from);
            day = last.dias;
            mention(
              `*Sucesso @${sender.split("@")[0]
              }, o grupo ${groupName} será fechado ${last.dias > 0
                ? sendFutureTime([{ valor: last.dias, type: `days` }])
                  .toLowerCase()
                  .split(` `)[0] + ` `
                : ``
              }às ${last.hora}* ⏱`,
            );
          }
          break;

        case "startpaid":
        case "stoppaid":
          if (!isGroup) return reply("Somente em grupos");
          if (!isGroupAdmins)
            return reply("Somente os adminstradores do grupo!");
          horarios2 = getGroupInPaid(from);
          if (horarios2.start) {
            horarios2.start = false;
            savePaid();
            return reply(
              `O sistema de horários foi desativado com sucesso neste grupo 🐅`,
            );
          } else {
            horarios2.start = true;
            savePaid();
            return reply(
              `O sistema de horários foi ativado com sucesso neste grupo 🐯`,
            );
          }
          break;

        case "addhorarios":
        case "addhorario":
        case "addpaid":
          if (!isGroup) return reply("Somente em grupos");
          if (!isGroupAdmins)
            return reply("Somente os adminstradores do grupo!");
          if (!getGroupInPaid(from).start)
            return reply(
              `O sistema de horários está desativado... Caso queira usar, primeiro ligue eles usando ${prefix}startpaid 🐯`,
            );
          if (!q)
            return reply(`Retorne após o comando o intervalo de tempo entre cada envio de slot, ex:
${prefix + command} 30m
ou
${prefix + command} 1h`);
          nmr = q.slice(0, q.length - 1);
          letra = q.slice(q.length - 1, q.length).toLowerCase();
          if (letra != `h` && letra != `m`)
            return reply(`Use apenas horas ou minutos, ex: 30m ou 1h`);
          if (!Number(nmr))
            return reply(`"${nmr}" precisa ser um número maior que zero`);
          addPaid(from, q);
          reply(`Horário pagante definido com sucesso 🐯`);
          break;

        case "fundohorario":
        case "fundohorarios":
        case "fundopaid":
          if (!isGroup) return reply("Somente em grupos");
          if (!isGroupAdmins)
            return reply("Somente os adminstradores do grupo!");
          if (!getGroupInPaid(from).start)
            return reply(
              `O sistema de horários está desativado... Caso queira usar, primeiro ligue eles usando ${prefix}startpaid 🐯`,
            );
          ggip = getGroupInPaid(from);
          if (!q || Number(q) !== 0) {
            if (!isImage && !isQuotedImage)
              return reply(
                `Marque uma image com o comando ${prefix + command}`,
              );
            try {
              getinfoimg = isQuotedImage
                ? JSON.parse(JSON.stringify(info).replace("quotedM", "m"))
                  .message.extendedTextMessage.contextInfo.message
                  .imageMessage
                : info.message.imageMessage;
              getfl = await getFileBuffer(getinfoimg, "image");
              //fs.writeFileSync(`./operacao/horarios/${from}.jpg`, getfl)
              uptele = await upload(getfl);
              ggip.fundoperso = true;
              ggip.url = uptele; //`./operacao/horarios/${from}.jpg`
              savePaid();
              return reply(
                `O fundo dos horários foi atualizado para ${uptele} com sucesso ✔`,
              );
              //return reply(`O fundo dos horários foi atualizado com sucesso ✔`)
            } catch (e) {
              console.log(e);
              reply(`Não foi possível salvar a imagem... Tente novamente 🐯`);
            }
          } else {
            if (Number(q) === 0) {
              ggip.fundoperso = false;
              savePaid();
              rmGroupLinkInPaid(from);
              return reply(
                `O fundo personalizado dos horários foi deletado com sucesso ✔`,
              );
            } else
              return reply(
                `Use ${prefix + command
                } [marque uma imagem] para personalizar o fundo dos horários pagantes e ${prefix + command
                } 0 para deletar a imagem salva.`,
              );
          }
          break;

        case "rmhorarios":
        case "rmhorario":
        case "rmpaid":
          if (!isGroup) return reply("Somente em grupos");
          if (!isGroupAdmins)
            return reply("Somente os adminstradores do grupo!");
          if (!getGroupInPaid(from).start)
            return reply(
              `O sistema de horários está desativado... Caso queira usar, primeiro ligue eles usando ${prefix}startpaid 🐯`,
            );
          if (!q)
            return reply(
              `Retorne após o comando o ID do horário pagante que você quer deletar`,
            );
          if (!isIDinPaid(from, q))
            return reply("[❗] ID do usuário não encontrado ou inexistente ❌");
          rmPaid(from, q);
          reply(`Horário pagante deletado com sucesso 🐅`);
          break;

        case "listahorarios":
        case "listahorario":
        case "listpaid":
        case "paidlist":
          if (!isGroup) return reply("Somente em grupos");
          if (!isGroupAdmins)
            return reply("Somente os adminstradores do grupo!");
          if (!getGroupInPaid(from).start)
            return reply(
              `O sistema de horários está desativado... Caso queira usar, primeiro ligue eles usando ${prefix}startpaid 🐯`,
            );
          horarios2 = getGroupInPaid(from).horarios;
          if (horarios2.length <= 0)
            return reply(`Não há horários pagantes definidos neste grupo 🐯`);
          reply(`🐯 *_Horários pagantes do grupo ${groupName}:_*
${horarios2
              .map(
                (i) => `🆔 *ID:* ${i.id}
⏳ *Intervalo de tempo:* ${String(i.nmr) + i.letra}
🍀 *Próximo horário:* ${i.tempo}`,
              )
              .join(`\n\n`)}`);
          break;

        case "attgrouplink":
        case "atualizarfotoshorarios":
          if (!isGroup) return reply("Somente em grupos");
          if (!isGroupAdmins)
            return reply("Somente os adminstradores do grupo!");
          if (!getGroupInPaid(from).start)
            return reply(
              `O sistema de horários está desativado... Caso queira usar, primeiro ligue eles usando ${prefix}startpaid 🐯`,
            );
          horarios3 = [];
          for (glp of groupLinkPaid) {
            if (!isJsonIncludes(horarios3, glp.id)) horarios3.push(glp);
          }
          saveJSON(horarios3, `./operacao/horarios/grouplink.json`);
          reply(`Database de fotos dos grupos/slots atualizada com sucesso 🐯`);
          await sleep(700);
          console.log(colors.green(`Restart necessário para save de dados..`));
          process.exit();
          break;

        case "attpaid":
        case "atualizarhorarios":
          if (!isGroup) return reply("Somente em grupos");
          if (!isGroupAdmins)
            return reply("Somente os adminstradores do grupo!");
          if (!getGroupInPaid(from).start)
            return reply(
              `O sistema de horários está desativado... Caso queira usar, primeiro ligue eles usando ${prefix}startpaid 🐯`,
            );
          horarios4 = [];
          for (p of paidHours) {
            if (p.horarios.length > 0) horarios4.push(p);
          }
          saveJSON(horarios4, `./operacao/horarios/horarios.json`);
          saveJSON([], `./operacao/horarios/grouplink.json`);
          reply(`Pasta de slots limpa e atualizada com sucesso 🐯`);
          await sleep(700);
          console.log(colors.green(`Restart necessário para save de dados..`));
          process.exit();
          break;

        case "rvisu":
        case "open":
        case "revelar":
          try {
            RSMM =
              info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            boij22 =
              RSMM?.imageMessage ||
              info.message?.imageMessage ||
              RSMM?.viewOnceMessageV2?.message?.imageMessage ||
              info.message?.viewOnceMessageV2?.message?.imageMessage ||
              info.message?.viewOnceMessage?.message?.imageMessage ||
              RSMM?.viewOnceMessage?.message?.imageMessage;
            boijj =
              RSMM?.videoMessage ||
              info.message?.videoMessage ||
              RSMM?.viewOnceMessageV2?.message?.videoMessage ||
              info.message?.viewOnceMessageV2?.message?.videoMessage ||
              info.message?.viewOnceMessage?.message?.videoMessage ||
              RSMM?.viewOnceMessage?.message?.videoMessage;
            boij33 =
              RSMM?.audioMessage ||
              info.message?.audioMessage ||
              RSMM?.viewOnceMessageV2?.message?.audioMessage ||
              info.message?.viewOnceMessageV2?.message?.audioMessage ||
              info.message?.viewOnceMessage?.message?.audioMessage ||
              RSMM?.viewOnceMessage?.message?.audioMessage;
            if (boijj) {
              px = boijj;
              px.viewOnce = false;
              px.video = { url: px.url };
              await conn.sendMessage(from, px, { quoted: info });
            } else if (boij22) {
              px = boij22;
              px.viewOnce = false;
              px.image = { url: px.url };
              await conn.sendMessage(from, px, { quoted: info });
            } else if (boij33) {
              px = boij33;
              px.viewOnce = false;
              px.audio = { url: px.url };
              await conn.sendMessage(from, px, { quoted: info });
            } else {
              return reply(
                "Por favor, *mencione uma imagem, video ou áudio em visualização única* para executar o comando.",
              );
            }
          } catch (e) {
            console.error(e);
            await reply("Ocorreu um erro");
          }
          break;

        case "getquoted":
        case "getinfo":
        case "get":
          reply(
            JSON.stringify(
              info.message.extendedTextMessage.contextInfo,
              null,
              3,
            ),
          );
          break;

        case "get-txt":
          reply(
            JSON.stringify(
              info.message.extendedTextMessage.contextInfo.quotedMessage
                .conversation,
              null,
              2,
            ),
          );
          break;

        case "vrcpf":
        case "vr_cpf":
        case "vr-cpf":
          {
            try {
              conn.sendMessage(
                from,
                { image: { url: reqapi.vrcpf(q.trim()) } },
                { quoted: info },
              );
            } catch {
              return reply("Erro... 🥱");
            }
          }
          break;

        case "gerarcpf":
          cp1 = `${Math.floor(Math.random() * 300) + 600}`;
          cp2 = `${Math.floor(Math.random() * 300) + 600}`;
          cp3 = `${Math.floor(Math.random() * 300) + 600}`;
          cp4 = `${Math.floor(Math.random() * 30) + 60}`;
          cpf = `${cp1}.${cp2}.${cp3}-${cp4}`;
          conn.sendMessage(
            from,
            { text: `CPF gerado com sucesso : ${cpf}` },
            { quoted: info },
          );
          break;

        case "cep":
          try {
            if (!q.trim())
              return reply("digite o CEP que deseja buscar informações..");
            ABC = await reqapi.cep(q.trim());
            reply(`Cep: ${ABC.cep}\nRua: ${ABC.rua}\nComplemento:
${ABC.complemento}\nBairro: ${ABC.vizinhança}\nCidade: ${ABC.cidade}\nEstado:
${ABC.estado}\nGia: ${ABC.gia}\nIbge: ${ABC.ibge}\nddd: ${ABC.ddd}\nSiafi:
${ABC.siafi}`);
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "ddd":
          if (args.length < 1) return reply(`Use ${prefix + command} 62`);
          ddd = body.slice(5);
          ddds = await axios.get(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
          dddlist = `Lista de Cidades de ${ddds.data.state} com este DDD ${q}>\n\n`;
          for (let i = 0; i < ddds.data.cities.length; i++) {
            dddlist += `${i + 1} ⪧ *${ddds.data.cities[i]}*\n`;
          }
          conn.sendMessage(from, { text: dddlist }, { quoted: info });
          break;

        case "encurtalink":
          if (args.length < 1)
            return reply(
              `Exemplo:\n${prefix}encurtalink https://youtube.com/c/Aleatory𝘽𝙤𝙩`,
            );
          try {
            link = args[0];
            anu = await axios.get(
              `https://tinyurl.com/api-create.php?url=${link}`,
            );
            reply(`${anu.data}`);
          } catch (e) {
            emror = String(e);
            reply(`${e}`);
          }
          break;

        //===========(ADMS-FUNÇÕES-AKI)=========\\

        case "calculadora":
        case "calcular":
        case "calc":
          rsp = q
            .replace("x", "*")
            .replace('"', ":")
            .replace(new RegExp("[()abcdefghijklmnopqrstwuvxyz]", "gi"), "")
            .replace("÷", "/");
          return reply(JSON.stringify(eval(rsp, null, "\t")));
          break;

        case "listatm":
          if (!SoDono) return reply(Res_SoDono);
          if (rgp.length == 0)
            return reply(
              `Não contém nenhum registro de transmissão, utilize ${prefix}rgtm no grupo que deseja que ele receba as transmissões do bot..`,
            );
          bl = "_-_-_-_-_-_-_-_-_-_-_-_-\n\n";
          for (i = 0; i < rgp.length; i++) {
            bl += `${i + 1} - ID: ${rgp[i].id}\n\n- NOME DO USUÁRIO OU GRUPO: ${rgp[i].infonome
              }\n\n`;
          }
          reply(bl);
          break;

        case "rgtm":
          if (!SoDono) return reply(Res_SoDono);
          if (JSON.stringify(rgp).includes(from))
            return reply(
              "Este grupo ja está registrado na lista de transmissão",
            );
          rgp.push({ id: from, infonome: `${isGroup ? groupName : pushname}` });
          fs.writeFileSync("./dados/org/json/TMGP.json", JSON.stringify(rgp));
          reply(
            "Registrado com sucesso, quando for realizada as transmissões, esse grupo/usuário estará na lista.",
          );
          break;

        case "tirardatm":
          if (!SoDono) return reply(Res_SoDono);
          if (!JSON.stringify(rgp).includes(from))
            return reply(
              "Este grupo não está registrado para ser tirado da lista de transmissão",
            );
          if (q.trim().length > 4) {
            var ustm = rgp.map((i) => i.id).indexOf(q.trim());
          } else {
            var ustm = rgp.map((i) => i.id).indexOf(from);
          }
          rgp.splice(ustm, 1);
          fs.writeFileSync("./dados/org/json/TMGP.json", JSON.stringify(rgp));
          reply("Grupo/Usuário tirado da lista de transmissão com sucesso");
          break;

        case "fazertm":
          if (!SoDono) return reply(Res_SoDono);
          if (rgp.lengh == 0)
            return reply(
              "Não contém nenhum grupo registrado para realizar transmissão",
            );
          await sleep(1000);
          let DFC = "";
          var rsm =
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          var pink = isQuotedImage
            ? rsm?.imageMessage
            : info.message?.imageMessage;
          var blue = isQuotedVideo
            ? rsm?.videoMessage
            : info.message?.videoMessage;
          var red = isQuotedMsg ? rsm?.textMessage : info.message?.textMessage;
          var purple = isQuotedDocument
            ? rsm?.documentMessage
            : info.message?.documentMessage;
          var yellow = isQuotedDocW
            ? rsm?.documentWithCaptionMessage?.message?.documentMessage
            : info.message?.documentWithCaptionMessage?.message
              ?.documentMessage;
          var aud_d = isQuotedAudio ? rsm.audioMessage : "";
          var figu_d = isQuotedSticker ? rsm.stickerMessage : "";
          var red =
            isQuotedMsg &&
              !aud_d &&
              !figu_d &&
              !pink &&
              !blue &&
              !purple &&
              !yellow
              ? "Transmissão Do Dono: " + rsm.conversation
              : info.message?.conversation;
          var green =
            isQuotedMsg2 &&
              !aud_d &&
              !figu_d &&
              !red &&
              !pink &&
              !blue &&
              !purple &&
              !yellow
              ? "Transmissão Do Dono: " + rsm.extendedTextMessage?.text
              : info?.message?.extendedTextMessage?.text;
          if (pink) {
            DFC = pink;
            pink.caption =
              q.length > 1
                ? "Transmissão Do Dono: " + q
                : pink.caption.replace(
                  new RegExp(prefix + command, "gi"),
                  `TRANSMISSÃO DO DONO: ${NickDono}\n\n`,
                );
            pink.image = { url: pink.url };
          } else if (blue) {
            DFC = blue;
            blue.caption =
              q.length > 1
                ? "Transmissão Do Dono: " + q
                : blue.caption.replace(
                  new RegExp(prefix + command, "gi"),
                  `TRANSMISSÃO DO DONO: ${NickDono}\n\n`,
                );
            blue.video = { url: blue.url };
          } else if (red) {
            black = {};
            black.text = red.replace(
              new RegExp(prefix + command, "gi"),
              `TRANSMISSÃO DO DONO: ${NickDono}\n\n`,
            );
            DFC = black;
          } else if (!aud_d && !figu_d && green) {
            brown = {};
            brown.text = green.replace(
              new RegExp(prefix + command, "gi"),
              `TRANSMISSÃO DO DONO: ${NickDono}\n\n`,
            );
            DFC = brown;
          } else if (purple) {
            DFC = purple;
            purple.document = { url: purple.url };
          } else if (yellow) {
            DFC = yellow;
            yellow.caption =
              q.length > 1
                ? "Transmissão Do Dono: " + q
                : yellow.caption.replace(
                  new RegExp(prefix + command, "gi"),
                  `TRANSMISSÃO DO DONO: ${NickDono}\n\n`,
                );
            yellow.document = { url: yellow.url };
          } else if (figu_d) {
            DFC = figu_d;
            figu_d.sticker = { url: figu_d.url };
          } else if (aud_d) {
            DFC = aud_d;
            aud_d.audio = { url: aud_d.url };
          }
          for (i = 0; i < rgp.length; i++) {
            conn.sendMessage(rgp[i].id, DFC);
          }
          break;

        case "reviverqr":
          if (!SoDono && !isnit) return;
          exec("cd dados/ALEATORY-QR && rm -rf pre-key* sender* session*");
          setTimeout(async () => {
            reply(
              "♻️ Ｒｅｉｎｉｃｉａｎｄｏ...✨ *Limpando cache e otimizando o sistema 💨⚡ Voltamos em instantes!*",
            );
            setTimeout(async () => {
              process.exit();
            }, 1200);
          }, 1000);
          break;

        case "sairgp":
          if (isGroup && !SoDono && !info.key.fromMe)
            return reply("Este comando só meu dono pode executar 🙄");
          try {
            conn.groupLeave(from);
          } catch (erro) {
            reply(String(erro));
          }
          break;

        case "seradm":
          if (!SoDono && !isnit)
            return reply(
              "Só dono pode executar este comando, tu está querendo roubar o grupo é seu ladrãozinho 🙄",
            );
          mentions(
            `@${sender2} Pronto mestre - Agora você é um administrador 🥰`,
            [sender],
            true,
          );
          conn.groupParticipantsUpdate(from, [sender], "promote");
          break;

        case "sermembro":
          if (!SoDono && !isnit)
            return reply(
              "Só dono pode executar este comando seu tolinho rs,rs.",
            );
          mentions(
            `@${sender2} ✨ Pronto - Mestre agora você é um membro comum e continua com seus poderes de ADM 🤩💫`,
            [sender],
            true,
          );
          conn.groupParticipantsUpdate(from, [sender], "demote");
          break;

        //======≠(INFOS/EXECUÇÃO/DONO)≠=========\\

        case "apresentar":
        case "apr":
          inff = `Bem vindo(a) ao grupo : ${groupName}


👾 •𝑬𝑵𝑻𝑹𝑶𝑼 𝑺𝑬 𝑨𝑷𝑹𝑬𝑺𝑬𝑵𝑻𝑨•
📸 •F𝜣T𝜣
👻 •N𝜣ME
📌 •CID∆DE
🗓️ •ID∆DE
⚠️ •LEI∆ ∆S REGR∆S D𝜣 GRUP𝜣

*APROVEITE O GRUPO!*`;
          conn.sendMessage(from, { text: inff }, { quoted: selo });
          break;

        case "papof":
        case "regraspp":
          if (!isGroupAdmins) return reply(Res_SoAdm);
          txtz = `【᯽𒋨📷:𝑆𝑒 𝑎𝑝𝑟𝑒𝑠𝑒𝑛𝑡𝑒𝑚 𝑙𝑖𝑥𝑜𝑠🌚»°】
𒋨·࣭࣪̇🔥ɴᴏᴍᴇ:
𒋨·࣭࣪̇🔥ɪᴅᴀᴅᴇ:
𒋨·࣭࣪̇🔥ʀᴀʙᴀ:
*Aᴘʀᴇsᴇɴᴛᴇ-sᴇ sᴇ ǫᴜɪsᴇʀ.*
𝙏𝘼𝙂𝙎➭᜔ׂ࠭ ⁸₈⁸|𝟖𝟖𝟖|𝟠𝟠𝟠| ེི⁸⁸⁸
 ──╌╌╌┈⊰★⊱┈╌╌╌┈─
❌ ENTROU NO 
GRUPO INTERAJA, NÃO PRECISAMOS DE ENFEITES,INATIVOS SERAO REMOVIDOS ❌* 

/﹋<,︻╦╤─ ҉ - -----💥 
/﹋ 🅴 🅱🅴🅼 🆅🅸🅽🅳🅾 🆂🅴🆄🆂 🅵🅸🅻🅷🅾🆂 🅳🅰 🅿🆄🆃🅰`;
          conn.sendMessage(from, { text: txtz }, { quoted: selo });
          break;

        case "digt":
          bla = `🔥↯𝐉𝐀 𝐄𝐍𝐓𝐑𝐀 𝐃𝐈𝐆𝐈𝐓𝐀𝐍𝐃𝐎 𝚽𝐈 ↯°🌚💕
 ི⋮ ྀ🌴⏝ ི⋮ ྀ🚸 ི⋮ ྀ⏝🌴 ི⋮ ྀ 

🐼🍧↯𝖠𝖰𝖴𝖨 𝖵𝖮𝖢𝖤̂ 𝖯𝖮𝖣𝖤 𝖲𝖤𝖱↯🍧🐻
ㅤㅤㅤㅤ◍۫❀⃘࣭࣭࣭࣭ٜꔷ⃔໑࣭࣭ٜ⟅◌ٜ🛸◌⟆࣭࣭ٜ໑⃕ꔷ⃘࣭࣭࣭࣭ٜ❀۫◍ི࣭࣭࣭࣭ ུ
【✔】ᴘʀᴇᴛᴀ👩🏾‍🦱 【✔】ʙʀᴀɴᴄᴀ👩🏼
【✔】ᴍᴀɢʀᴀ🍧【✔】ɢᴏʀᴅᴀ🍿
【✔】ᴘᴏʙʀᴇ🪙 【✔】ʀɪᴄᴀ💳
【✔】ʙᴀɪᴀɴᴀ💌【✔】ᴍᴀᴄᴏɴʜᴇɪʀᴀ🍁
【✔】ᴏᴛᴀᴋᴜ🧧【✔】ᴇ-ɢɪʀʟ🦄
【✔】ʟᴏʟɪ🍭【✔】ɢᴀᴅᴏ🐃
【✔】ɢᴀʏ🏳️‍🌈 【✔】ʟᴇsʙɪᴄᴀ✂️
【✔】ᴠᴀᴅɪᴀ💄【✔】ᴛʀᴀᴠᴇᴄᴏ🍌
【✔】ɴɪɴɢᴜᴇᴍ ʟɪɢᴀ📵
. ☪︎ • ☁︎. . •.
【 𝐕𝐄𝐌 𝐆𝐀𝐋𝐄𝐑𝐀, 𝐒𝐄 𝐃𝐈𝐕𝐄𝐑𝐓𝐈𝐑 𝐄 𝐅𝐀𝐙𝐄𝐑 𝐏𝐀𝐑𝐓𝐄 𝐃𝐀 𝐅𝐀𝐌𝐈𝐋𝐈𝐀.】🥂`;
          conn.sendMessage(from, { text: bla }, { quoted: selo });
          break;

        case "sairdogp":
          if (!SoDono) return reply(Res_SoDono);
          if (!q.trim())
            return reply(
              `Você deve visualizar o comando ${prefix}listagp e olhar de qual o grupo quer sair, e veja a numeração dele, e só digitar\nExemplo: ${prefix}sairdogp 0\nesse comando é para o bot sair do grupo que deseja..`,
            );
          var getGroups = await conn.groupFetchAllParticipating();
          var groups = Object.entries(getGroups)
            .slice(0)
            .map((entry) => entry[1]);
          var ingfoo = groups.map((v) => v);
          ingfoo.sort((a, b) => a[0] < b.length);
          try {
            conn.sendMessage(ingfoo[q].id, {
              text: `Irei sair do grupo venceu o mês. Adeus! Me contratar de novo eu gosto desse grupo,vocês são a minha família 😭\nEntrem em contato com meu dono chame ele 🥹 👇🏻\nhttps://wa.me/${numerodono_ofc}`,
            });
            setTimeout(() => {
              conn.groupLeave(ingfoo[q].id);
            }, 5000);
          } catch (erro) {
            reply("Erro.. 🙂");
          }
          reply(
            "Pronto mestrE!sair do grupo que você queria, em caso de dúvidas acione o comando listagp pra verificar 🙇🏻‍♀️",
          );
          break;

        case "listagp":
          {
            if (!SoDono && !isnit && !info.key.fromMe)
              return reply("❌️<SÓ MEU DONO>❌");
            let LinkDoGp;
            var getGroups = await conn.groupFetchAllParticipating();
            var groups = Object.entries(getGroups)
              .slice(0)
              .map((entry) => entry[1]);
            var ingfoo = groups.map((v) => v);
            ingfoo.sort((a, b) => a[0] < b.length);
            teks1 = `*LISTA DE GRUPOS*\n*Total de Grupos* : ${ingfoo.length}\n\n`;
            for (let i = 0; i < ingfoo.length; i++) {
              try {
                LinkDoGp = await conn.groupInviteCode(ingfoo[i].id);
              } catch {
                LinkDoGp = "Não foi possivel puxar.";
              }
              var isC = ingfoo[i].isCommunity;
              teks1 += `${isC ? "• *Comunidade*" : "• *Grupo*"
                }• : ${i}\n• É uma comunidade ? ${isC ? "Sim" : "Não"}\n${isC
                  ? ""
                  : `• Link Do Grupo: https://chat.whatsapp.com/${LinkDoGp}\n`
                }• *Nome do Grupo* : ${ingfoo[i].subject}\n• *Id do Grupo* : ${ingfoo[i].id
                }\n• *Criado* : ${moment(`${ingfoo[i].creation}` * 1000)
                  .tz("America/Sao_Paulo")
                  .format("DD/MM/YYYY HH:mm:ss")}\n${isC
                    ? ""
                    : `• *Total de Membros* : ${ingfoo[i].participants.length}\n`
                }\n${"-".repeat(25)}\n\n`;
            }
            reply(teks1);
          }
          break;

        case "atividade":
        case "atividades":
          try {
            if (!isGroupAdmins && !issupre && !ischyt) return reply(Res_SoAdm);
            if (!isGroup) return reply(Res_SoGrupo);
            var i6 = countMessage.map((i) => i.groupId).indexOf(from);
            if (i6 < 0) {
              return reply(
                "❌ O bot não tem dados de atividade deste grupo ainda.",
              );
            }
            if (
              !countMessage[i6].numbers ||
              countMessage[i6].numbers.length === 0
            ) {
              return reply(
                "❌ Nenhuma atividade registrada neste grupo ainda.",
              );
            }
            teks = `*Atividade dos membros do grupo:*\n\n`;
            const mentionArray = [];
            for (i = 0; i < countMessage[i6].numbers.length; i++) {
              var uscnt = countMessage[i6].numbers[i];
              if (uscnt && uscnt.id) {
                const participantNumber = uscnt.id.split("@")[0];
                mentionArray.push(uscnt.id);
                teks += `*• Membro:* @${participantNumber}\n*• Comandos:* ${uscnt.cmd_messages || 0
                  }*\n*• Mensagens:* ${uscnt.messages || 0}*\n*• Aparelho:* ${uscnt.aparelho || "Desconhecido"
                  }*\n\n----------------------------------\n\n`;
              }
            }
            conn.sendMessage(
              from,
              { text: teks.trim(), mentions: mentionArray },
              { quoted: info },
            );
          } catch (e) {
            console.log(e);
            reply("❌ Erro ao buscar atividades. Tente novamente.");
          }
          break;

        case "inativos":
        case "inativo":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (q.match(/[a-z]/i) || !q)
            return reply(
              `Exemplo: ${prefix + command
              } 0\nIsso mostrará quantas pessoas tem 0 mensagens no grupo, e se usar 5, vai mostrar quantos usuários tem 5 mensagens ou menos..`,
            );
          await LIMPARDOCNT_QUEMJASAIU();
          var i2 = countMessage?.map((x) => x.groupId)?.indexOf(from);
          blue = [];
          for (i of countMessage[i2].numbers) {
            if (i.messages <= q.trim())
              if (i.figus <= q.trim())
                if (i.cmd_messages <= q.trim())
                  if (!groupAdmins.includes(i.id))
                    if (
                      !numerodono.includes(i.id) &&
                      !numerodono.includes(i.phoneNumber)
                    )
                      if (i.id != botNumber)
                        if (groupMembers.map((i) => i.id).includes(i.id))
                          blue.push(i.id);
          }
          for (i of countMessage[i2].numbers) {
            if (!groupMembers.map((a) => a.id == i.id))
              if (i.id.length > 5) blue.push(i.id);
          }
          if (blue.length == 0)
            return reply(`Não tem pessoas com ${q}mensagens..`);
          bli = `Usuários com ${q.trim()} mensagem(ns) pra baixo..\n\n`;
          for (ac = 0; ac < blue.length; ac++) {
            bli += `${ac + 1} - _ Usuário: @${blue[ac].split("@")[0]}\n\n`;
          }
          mention(bli);
          break;

        case "forainativo":
        case "banghost":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply(Res_SoDono);
          if (q.match(/[a-z]/i) || !q || q.length > 3)
            return reply(
              `Digite a partir de quantas mensagens pra baixo você deseja remover (que não interaje no grupo).\nExemplo: ${prefix + command
              } 0`,
            );
          var i2 = countMessage?.map((x) => x.groupId)?.indexOf(from);
          blue = [];
          for (i of countMessage[i2].numbers) {
            if (i.messages <= Number(q.trim()))
              if (i.figus <= Number(q.trim()))
                if (i.cmd_messages <= Number(q.trim()))
                  if (!groupAdmins.includes(i.id))
                    if (
                      !numerodono.includes(i.id) &&
                      !numerodono.includes(i.phoneNumber)
                    )
                      if (i.id != botNumber)
                        if (groupMembers.map((i) => i.id).includes(i.id))
                          blue.push(i.id);
          }
          for (i of countMessage[i2].numbers) {
            if (!groupMembers.map((i) => i.id).includes(i.id))
              if (i.id.length > 5) blue.push(i.id);
          }
          if (blue.length == 0)
            return reply(
              `Não tem mais pessoas com ${q.trim()} mensagem(ns) para eu remover..`,
            );
          for (i = 0; i < blue.length; i++) {
            await sleep(1000);
            conn.groupParticipantsUpdate(from, [blue[i]], "remove");
          }
          break;

        case "nome-bot":
          if (!SoDono && !isnit && !info.key.fromMe) return reply(Res_SoDono);
          NomeDoBot = q.trim();
          try {
            const _cfgNome = JSON.parse(fs.readFileSync("./dados/settings.json"));
            _cfgNome.NomeDoBot = q.trim();
            fs.writeFileSync("./dados/settings.json", JSON.stringify(_cfgNome, null, 2));
            setting.NomeDoBot = q.trim();
          } catch {
            setting.NomeDoBot = q.trim();
            fs.writeFileSync("./dados/settings.json", JSON.stringify(setting, null, 2));
          }
          reply(`O nome do seu bot foi alterado com sucesso para 😏 ${q}`);
          break;

        case "nick-dono":
          if (!SoDono && !isnit && !info.key.fromMe) return reply(Res_SoDono);
          try {
            const _cfgNick = JSON.parse(fs.readFileSync("./dados/settings.json"));
            _cfgNick.NickDono = q.trim();
            fs.writeFileSync("./dados/settings.json", JSON.stringify(_cfgNick, null, 2));
            setting.NickDono = q.trim();
          } catch {
            setting.NickDono = q.trim();
            fs.writeFileSync("./dados/settings.json", JSON.stringify(setting, null, 2));
          }
          NickDono = q.trim();
          reply(`O Nick Do Dono foi configurado para 😏 ${q}`);
          break;

        case "numero-dono":
          if (!SoDono && !isnit && !info.key.fromMe) return reply(Res_SoDono);
          if (q.match(/[a-z]/i)) return reply("É apenas números..");
          reply(`O número dono foi configurado com sucesso para 😏 ${q}`);
          {
            const _numDono = q.trim().replace(new RegExp("[()+-/ +/]", "gi"), "");
            try {
              const _cfgNum = JSON.parse(fs.readFileSync("./dados/settings.json"));
              _cfgNum.numerodono = _numDono;
              fs.writeFileSync("./dados/settings.json", JSON.stringify(_cfgNum, null, 2));
              setting.numerodono = _numDono;
            } catch {
              setting.numerodono = _numDono;
              fs.writeFileSync("./dados/settings.json", JSON.stringify(setting, null, 2));
            }
            numerodono[0] = _numDono;
            numerodn = _numDono;
            numerodono_ofc = _numDono;
            nmrdn_dono2 = _numDono + SNET;
          }
          break;

        case "prefixo-bot":
        case "setprefix":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !info.key.fromMe) return reply(Res_SoDono);
          try {
            const _cfgPfx = JSON.parse(fs.readFileSync("./dados/settings.json"));
            _cfgPfx.prefix = q;
            fs.writeFileSync("./dados/settings.json", JSON.stringify(_cfgPfx, null, 2));
            setting.prefix = q;
          } catch {
            setting.prefix = q;
            fs.writeFileSync("./dados/settings.json", JSON.stringify(setting, null, 2));
          }
          reply(`O prefixo foi alterado com sucesso para 😏 ${q}`);
          break;

        case "fotomenu":
        case "fundomenu":
          if (!SoDono) return reply(Res_SoDono);
          if (!isQuotedImage)
            return reply("📸 Marque uma imagem para definir a foto do menu!");
          try {
            reply("⏳ Salvando a foto do menu...");
            boij = isQuotedImage
              ? JSON.parse(JSON.stringify(info).replace("quotedM", "m")).message
                .extendedTextMessage.contextInfo.message.imageMessage
              : info.message.imageMessage;
            owgi = await getFileBuffer(boij, "image");
            // Salvar localmente
            fs.writeFileSync("./media/menu/menu_foto.png", owgi);
            // Atualizar config: ativar modo foto
            const cfgFoto = JSON.parse(
              fs.readFileSync("./dados/menu_media.json", "utf-8"),
            );
            cfgFoto.tipo = "foto";
            fs.writeFileSync(
              "./dados/menu_media.json",
              JSON.stringify(cfgFoto, null, 2),
            );
            reply(
              "✅ Foto do menu alterada com sucesso! 📸\n🔄 Modo: *FOTO* ativado",
            );
          } catch (e) {
            reply("❌ Erro ao salvar a foto do menu: " + e.message);
          }
          break;

        case "gifmenu":
          if (!SoDono) return reply(Res_SoDono);
          if (!isQuotedVideo && !(isMedia && info.message.videoMessage))
            return reply(
              "🎬 Marque ou envie um GIF/vídeo curto para definir o GIF do menu!",
            );
          try {
            reply("⏳ Salvando o GIF do menu...");
            const gifMsg = isQuotedVideo
              ? JSON.parse(JSON.stringify(info).replace("quotedM", "m")).message
                .extendedTextMessage.contextInfo.message.videoMessage
              : info.message.videoMessage;
            const gifBuf = await getFileBuffer(gifMsg, "video");
            // Salvar localmente
            fs.writeFileSync("./media/menu/menu_gif.mp4", gifBuf);
            // Atualizar config: ativar modo gif
            const cfgGif = JSON.parse(
              fs.readFileSync("./dados/menu_media.json", "utf-8"),
            );
            cfgGif.tipo = "gif";
            fs.writeFileSync(
              "./dados/menu_media.json",
              JSON.stringify(cfgGif, null, 2),
            );
            reply(
              "✅ GIF do menu alterado com sucesso! 🎬\n🔄 Modo: *GIF* ativado",
            );
          } catch (e) {
            reply("❌ Erro ao salvar o GIF do menu: " + e.message);
          }
          break;

        case "setprefixs":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !issupre && !ischyt && !info.key.fromMe)
            return reply(Res_SoDono);
          prefix = args[0];
          try {
            const _cfgPfx2 = JSON.parse(fs.readFileSync("./dados/settings.json"));
            _cfgPfx2.prefix = prefix;
            fs.writeFileSync("./dados/settings.json", JSON.stringify(_cfgPfx2, null, 2));
            setting.prefix = prefix;
          } catch {
            setting.prefix = prefix;
            fs.writeFileSync("./dados/settings.json", JSON.stringify(setting, null, 2));
          }
          reply(`O prefixo foi alterado com sucesso para 😏 ${prefix}`);
          break;

        case "nomegp":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          conn.groupUpdateSubject(from, `${body.slice(9)}`);
          conn.sendMessage(
            from,
            { text: "Sucesso, alterou o nome do grupo" },
            { quoted: info },
          );
          break;

        case "fotobot":
          if (!SoDono && !isnit && !issupre && !ischyt && !info.key.fromMe)
            return reply(Res_SoDono);
          if (!isQuotedImage)
            return reply(
              `Envie fotos com legendas ${prefix}fotobot ou tags de imagem que já foram enviadas`,
            );
          buff = await getFileBuffer(
            info.message.extendedTextMessage.contextInfo.quotedMessage
              .imageMessage,
            "image",
          );
          conn.updateProfilePicture(botNumber, buff);
          reply("Obrigada pelo novo perfil 🥰");
          break;

        case "clonar":
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply("Você quem é o proprietário?");
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (args.length < 1)
            return reply(
              "Marque a pessoa que você quer clonar\n\n*EXEMPLO:* clone @",
            );
          if (!menc_jid2[0] || menc_jid2[1])
            return reply(
              "Marque o @ do usuário para roubar a foto do perfil dele, para a do bot..",
            );
          let { jid, id, notify } = groupMembers.find(
            (x) => x.id === menc_jid2[0],
          );
          try {
            pp = await conn.profilePictureUrl(id);
            buffer = await getBuffer(pp);
            conn.updateProfilePicture(botNumber, buffer);
            mentions(
              `Foto do perfil atualizada com sucesso, usando a foto do perfil @${id.split("@")[0]
              }`,
              [id],
              true,
            );
          } catch (e) {
            reply("Putz, deu erro, a pessoa deve estar sem foto 😔");
          }
          break;

        case "bcgp":
        case "bcgc":
          if (!SoDono && !isnit && !issupre && !ischyt && !info.key.fromMe)
            return reply(Res_SoDono);
          if (!isGroupAdmins) return reply(Res_SoAdm);
          if (!q.trim()) return reply("Cade o texto?");
          var nomor = info.participant;
          if ((isMedia && !info.message.videoMessage) || isQuotedImage) {
            encmedia = await getFileBuffer(
              info.message.extendedTextMessage.contextInfo.quotedMessage
                .imageMessage,
              "image",
            );
            for (i = 0; i < groupMembers.length; i++) {
              await sleep(2000);
              conn.sendMessage(
                groupMembers[i].id,
                { image: buff },
                {
                  caption: `*「 TRANSMISSÃO 」*\n\nGrupo: ${groupName}\n Número: wa.me/${sender.split("@")[0]
                    }\nMensagem : ${body.slice(6)}`,
                },
              );
            }
            reply("Transmissão enviada..");
          } else {
            for (i = 0; i < groupMembers.length; i++) {
              await sleep(2000);
              sendMess(
                groupMembers[i].id,
                `*「 TRANSMISSÃO 」*\n\nGrupo : ${groupName}\n Número : wa.me/${sender.split("@")[0]
                }\nMensagem : ${body.slice(6)}`,
              );
            }
            reply("Grupo de transmissão bem-sucedido");
          }
          break;

        case "dono1":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply(Res_SoDono);
          nescessario.dono1 = q.trim().replaceAll("@", "");
          dono1 = nescessario.dono1;
          setNes(nescessario);
          reply(
            `Agora contem um segundo dono(a) alterado com sucesso para 😏 ${q}`,
          );
          break;

        case "dono2":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply(Res_SoDono);
          nescessario.dono2 = q.trim().replaceAll("@", "");
          dono2 = nescessario.dono2;
          setNes(nescessario);
          reply(
            `Agora contem um segundo dono(a) alterado com sucesso para 😏 ${dono2}`,
          );
          break;

        case "dono3":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply(Res_SoDono);
          nescessario.dono3 = q.trim().replaceAll("@", "");
          dono3 = nescessario.dono3;
          setNes(nescessario);
          reply(
            `Agora contem um terceiro dono(a) alterado com sucesso para 😏 ${dono3}`,
          );
          break;

        case "dono4":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply(Res_SoDono);
          nescessario.dono4 = q.trim().replaceAll("@", "");
          dono4 = nescessario.dono4;
          setNes(nescessario);
          reply(
            `Agora contem um quarto dono(a) alterado com sucesso para 😏 ${dono4}`,
          );
          break;

        case "dono5":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply(Res_SoDono);
          nescessario.dono5 = q.trim().replaceAll("@", "");
          dono5 = nescessario.dono5;
          setNes(nescessario);
          reply(
            `Agora contem um quinto dono(a) alterado com sucesso para 😏 ${dono5}`,
          );
          break;

        case "dono6":
          if (args.length < 1) return;
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply(Res_SoDono);
          nescessario.dono6 = q.trim().replaceAll("@", "");
          dono6 = nescessario.dono6;
          setNes(nescessario);
          reply(
            `Agora contem um quinto dono(a) alterado com sucesso para 😏 ${dono6}`,
          );
          break;

        case "getquoted":
          reply(
            JSON.stringify(
              info.message.extendedTextMessage.contextInfo,
              null,
              3,
            ),
          );
          break;

        case "donos":
          p = `[ 𝗗𝗢𝗡𝗢𝗦 𝗕𝗼𝘁 ${NomeDoBot} ] 

Dono Oficial do bot: ${numerodono_ofc}

- [ 1 ] ${dono1}\n- [ 2 ] ${dono2}\n- [ 3 ] ${dono3}\n- [ 4 ] ${dono4}\n- [ 5 ] ${dono5}\n- [ 6 ] ${dono6}`;
          reply(p);
          break;

        case "admins":
        case "listadmins":
        case "adms":
          if (!isGroup) return reply(Res_SoGrupo);
          ytb = `Lista de admins do grupo *${groupMetadata?.subject || "Não foi posssivel puxar o nome."
            }*\nTotal : ${groupAdmins.length}\n\n`;
          no = 0;
          for (let admon of groupAdmins) {
            no += 1;
            ytb += `[${no.toString()}] @${admon.split("@")[0]}\n`;
          }
          mentions(ytb, groupAdmins, true);
          break;

        case "criartabela":
        case "criartbl":
        case "criartab":
          if (!isGroupAdmins && !SoDono)
            return reply("Só adm ou dono pode utilizar este comando.");
          if (!q.trim())
            return reply("Digite o que deseja colocar na tabela do grupo..");
          msgz = args.join(" ");
          msgtmpol = moment.tz("America/Sao_Paulo").format("HH:mm:ss");
          datinhaofc = moment.tz("America/Sao_Paulo").format("DD/MM/YY");
          fs.writeFileSync(
            `./dados/org/json/TABELA/tabela-${from}.json`,
            JSON.stringify(
              { Horario: msgtmpol, Data: datinhaofc, Tabela: msgz },
              null,
              2,
            ),
          );
          reply(`Tabela do grupo foi criada com sucesso 😏`);
          break;

        case "tabelagp":
        case "tabeladogp":
        case "tabelinha":
          if (!fs.existsSync(`./dados/org/json/TABELA/tabela-${from}.json`)) {
            return reply(
              `Cade a tabela, cria ela com o comando\nExemplo : ${prefix}criartabela Aleatory linda: e etc ..`,
            );
          }
          const tabelagpofc = JSON.parse(
            fs.readFileSync(`./dados/org/json/TABELA/tabela-${from}.json`),
          );
          blity = `- ⏰ Horário que criou a Tabela : ${tabelagpofc.Horario}\n\n- 🗓️ Data que criou a Tabela : ${tabelagpofc.Data}\n\n - Tabela : ${tabelagpofc.Tabela}`;
          mention(blity);
          break;

        case "ativo":
        case "on":
        case "voltei":
          if (!isGroupAdmins && !SoDono)
            return reply("Comando apenas para administradores ou dono..");
          if (DonoOficial) {
            if (
              fs.existsSync("./dados/org/json/afk-@" + numerodono_ofc + ".json")
            ) {
              DLT_FL("./dados/org/json/afk-@" + numerodono_ofc + ".json");
              reply("Bem vindo de volta, agora você está online 🙂");
            } else {
              reply("Você não registrou nenhuma mensagem de ausência 🥱");
            }
          } else if (isGroupAdmins) {
            if (!JSON.stringify(dataGp[0].ausentes).includes(sender))
              return reply("Não há nenhum registro de ausência sua 🥱");
            dataGp[0].ausentes.splice(
              dataGp[0].ausentes.map((x) => x.id).indexOf(sender),
              1,
            );
            setGp(dataGp);
            reply("Registro de ausência tirada com sucesso 😏");
          }
          break;

        case "ausente":
        case "off":
        case "afk":
          if (!isGroupAdmins && !SoDono)
            return reply("Comando apenas para Adms e você não é um 🤨");
          if (DonoOficial) {
            msgtmp = moment.tz("America/Sao_Paulo").format("HH:mm:ss");
            fs.writeFileSync(
              `./dados/org/json/afk-@${setting.numerodono.replace(
                new RegExp("[()+-/ +/]", "gi"),
                "",
              )}.json`,
              JSON.stringify(
                {
                  Ausente_Desde: msgtmp,
                  Motivo_Da_Ausência: q,
                },
                null,
                2,
              ),
            );
            reply(`Mensagem de ausência criada com sucesso 😏`);
          } else if (isGroupAdmins) {
            if (!q.trim())
              return reply(
                `Digite a mensagem de ausência, Exemplo: ${prefix + command
                } Estou cagando 😏💩`,
              );
            if (!JSON.stringify(dataGp[0].ausentes).includes(sender)) {
              dataGp[0].ausentes.push({ id: sender, msg: q.trim() });
              setGp(dataGp);
              reply(
                "Mensagem de ausência criada com sucesso..\n\nSe deseja Desativar a mensagem de ausência use o comando ativo 😏",
              );
            } else {
              dataGp[0].ausentes[
                dataGp[0].ausentes.map((i) => i.id).indexOf(sender)
              ].msg = q.trim();
              setGp(dataGp);
              reply(
                "Mensagem de ausência alterada com sucesso..\n\nSe deseja Desativar a mensagem de ausência use o comando ativo",
              );
            }
          } else {
            return reply("Comando apenas para Adms e você não é um 🤨");
          }
          break;

        case "reagir":
          const reactionMessage = {
            react: {
              text: "💖",
              key: info.key,
            },
          };
          sendMsg = conn.sendMessage(from, reactionMessage);
          break;

        case "addcmdgold":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          let [comando, gold] = q.trim().toLowerCase().split("/");
          comando.replace(prefix, "");
          if (comando && gold) {
            if (
              dataGp[0]?.comandos_gold?.length >= 1 &&
              dataGp[0].comandos_gold.some((i) => i.comando === comando)
            )
              return reply("Este comando, já encontra incluso na lista gold.");
            !dataGp[0]["comandos_gold"]
              ? (dataGp[0]["comandos_gold"] = [{ comando, gold }])
              : dataGp[0].comandos_gold.push({ comando, gold });
            setGp(dataGp);
            reply(
              `Comando -> ${comando} adicionado com sucesso na lista de comandos golds, que só vão ser executado com consumo gold, após usuários executar o comando.`,
            );
          } else {
            return reply(
              `Faltando o(a) ${!comando ? "comando" : !q.trim().includes("/") ? "/" : "gold"
              }, Exemplo: ${prefix + command
              } play/3 *Este exemplo ele adicionará o comando play como um comando gold, que após ativar o ${prefix}modogold, só poderá ser usado consumindo gold do usuário que usar o comando, se não tiver gold, o usuário não terá como usar o comando play.`,
            );
          }
          break;

        case "rmcmdgold":
        case "delcmdgold":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim()) return reply(`Exemplo: ${prefix + command} play`);
          q.trim().replace(prefix, "");
          if (
            !dataGp[0].comandos_gold.some(
              (i) => i.comando === q.trim().toLowerCase(),
            )
          )
            return reply(
              "Este comando não se encontra na lista gold, então não é possível eu remover algo inexistente.",
            );
          dataGp[0].comandos_gold.splice(
            dataGp[0].comandos_gold.findIndex(
              (i) => i.comando === q.trim().toLowerCase(),
            ),
            1,
          );
          setGp(dataGp);
          reply(
            `Comando -> ${q.trim()} tirado com sucesso da lista de comandos golds.`,
          );
          break;

        case "addcmdpremium":
          if (!SoDono) return reply(Res_SoDono);
          if (nescessario.cmdpremium.includes(q.replace(prefix, "").trim()))
            return reply("Este comando já se encontra na lista premium.");
          if (!q.trim().includes("/")) {
            nescessario.cmdpremium.push(q.replace(prefix, "").trim());
          } else {
            var itens = q.split("/");
            for (i of itens) {
              if (nescessario.cmdpremium.includes(i))
                return reply(
                  `O comando ${i} já se encontra na lista premium, não pode adicionar novamente.`,
                );
              nescessario.cmdpremium.push(i);
            }
          }
          cmdpremium = nescessario.cmdpremium;
          setNes(nescessario);
          reply(`Comandos adicionado para apenas usuarios premium usar.`);
          break;

        case "tirarcmdpremium":
        case "delcmdpremium":
          if (!SoDono) return reply(Res_SoDono);
          if (!nescessario.cmdpremium.includes(q.replace(prefix, "").trim()))
            return reply(
              "Este comando não é premium, não esta na lista para ser tirado.",
            );
          nescessario.cmdpremium.splice(
            nescessario.cmdpremium.indexOf(q.replace(prefix, "").trim()),
            1,
          );
          cmdpremium = nescessario.cmdpremium;
          setNes(nescessario);
          reply(`Comando ${q.trim()} tirado da lista premium.`);
          break;

        case "cmdpremium":
          if (nescessario.cmdpremium.length == 0)
            return reply("Não contém nenhum comando na lista Premium");
          ABC = "Comandos Premium:\n\n";
          for (i of nescessario.cmdpremium) {
            ABC += `_- ${i}\n\n`;
          }
          reply(ABC);
          break;

        case "addpremium":
        case "renovarpremium":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!SoDono && !info.key.fromMe) return reply(Res_SoDono);
            if (!menc_os2)
              return reply(
                "Marque o usuário do grupo ou digite o número do usuário ou marque a mensagem dele..",
              );
            const [usu, temp] = q_2.split("/");
            const tempORG = Math.floor(Date.now() / 1000);
            const tempo = temp?.includes("d")
              ? tempORG +
              1 * 60 * 60 * 24 * Math.floor(temp?.split("d")[0].trim())
              : temp?.includes("h")
                ? tempORG + 1 * 60 * 60 * Math.floor(temp?.split("h")[0].trim())
                : temp?.includes("m")
                  ? tempORG + 1 * 60 * Math.floor(temp?.split("m")[0].trim())
                  : false;
            if (!tempo)
              return reply(
                `Exemplo: ${prefix + command} @usuario/30d ou ${prefix + command
                } /30d marcando a mensagem do usuário, use ${prefix}info addpremium para saber como usar.`,
              );
            bla = premium.map((i) => i.usus).includes(menc_os2);
            if (bla) {
              const FCLT_RN =
                Math.floor(
                  premium[premium.findIndex((ab) => ab.usus === menc_os2)]
                    .tempo,
                ) - tempORG;
              premium.find((i) => i.usus === menc_os2).tempo = Math.floor(
                FCLT_RN + tempo,
              );
              fs.writeFileSync(
                "./dados/global/premium.json",
                JSON.stringify(premium),
              );
              reply(
                `Premium foi renovado, tempo anterior + tempo adicionado, até dias ou horas será acumulativo, não perderá nada, ficou com: ${kyun(
                  FCLT_RN + tempo - tempORG,
                )}`,
              );
            } else {
              premium.push({ usus: menc_os2, tempo: tempo });
              fs.writeFileSync(
                "./dados/global/premium.json",
                JSON.stringify(premium),
              );
              conn.sendMessage(
                from,
                {
                  text: `👑@${menc_os2.split("@")[0]
                    } foi adicionado à lista de usuários premium com sucesso👑 ( Tempo: ${kyun(
                      tempo - tempORG,
                    )} )`,
                  mentions: [menc_os2],
                },
                { quoted: info },
              );
            }
          }
          break;

        case "delpremium":
        case "rmpremium":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!SoDono && !info.key.fromMe) return reply(Res_SoDono);
          if (!marc_tds)
            return reply(
              "Marque o usuário do grupo ou digite o número do usuário ou marque a mensagem dele..",
            );
          console.log(premium, [
            marc_tds?.split("@")[0],
            marc_tds?.split("@")[0] + LID_NET,
          ]);
          if (
            !premium
              .map((i) => i.usus)
              .includes(marc_tds?.split("@")[0] + LID_NET)
          )
            return reply("*Este número não está incluso na lista premium..*");
          processo = premium.findIndex((a) =>
            [
              marc_tds?.split("@")[0],
              marc_tds?.split("@")[0] + LID_NET,
            ].includes(a.usus),
          );
          premium.splice(processo, 1);
          fs.writeFileSync(
            "./dados/global/premium.json",
            JSON.stringify(premium),
          );
          conn.sendMessage(
            from,
            {
              text: ` @${marc_tds.split("@")[0]
                } foi tirado da lista premium com sucesso..`,
              mentions: [marc_tds],
            },
            { quoted: info },
          );
          break;

        case "premiumlist":
        case "listapremium":
        case "premiumlista":
          {
            if (!SoDono && !info.key.fromMe) return reply(Res_SoDono);
            if (premium.length === 0)
              return reply(
                `A lista premium está vazia, use ${prefix}info addpremium para saber como funciona.`,
              );
            let abc = "Lista de usuários premium global:\n\n";
            let tempo = Math.floor(Date.now() / 1000);
            for (let V = 0; V < premium.length; V++) {
              abc += ` - ( ${V} ): @${premium[V].usus.split("@")[0]
                }\n\n - Tempo para expirar: ${kyun(
                  Math.floor(premium[V].tempo) - tempo,
                )}\n\n${"-".repeat(35)}\n`;
            }
            mention(abc);
          }
          break;

        case "limpar":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          clear = `🗑️\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n🗑️\n❲❗❳ *Lɪᴍᴘᴇᴢᴀ ᴅᴇ Cʜᴀᴛ Cᴏɴᴄʟᴜɪ́ᴅᴀ* ✅`;
          conn.sendMessage(
            from,
            { text: clear },
            {
              quoted: selo,
              contextInfo: { forwardingScore: 500, isForwarded: true },
            },
          );
          break;

        case "d_":
          if (!isPremium) return reply("Apenas premium..");
          conn.sendMessage(from, {
            delete: {
              remoteJid: from,
              fromMe: false,
              id: info.message.buttonsResponseMessage.contextInfo.stanzaId,
              participant: botNumber,
            },
          });
          break;

        case "deletar":
        case "delete":
        case "apagar":
        case "d":
          if (!isGroupAdmins) return reply(Res_SoAdm);
          if (!menc_prt)
            return reply(
              "Marque a mensagem do fdp que deseja apagar, do bot ou de alguém..",
            );
          conn.sendMessage(from, {
            delete: {
              remoteJid: from,
              fromMe: false,
              id: info.message.extendedTextMessage.contextInfo.stanzaId,
              participant: menc_prt,
            },
          });
          break;

        case "fundobemvindo":
        case "fundobv":
          try {
            if (!SoDono && !isnit && !info.key.fromMe) return reply(Res_SoDono);
            if (
              ((isMedia && !info.message.videoMessage) || isQuotedImage) &&
              !q.length <= 1
            ) {
              reply(
                `- Calma ae amigo(a), já estou trocando a foto de fundo do bem vindo para você 😏`,
              );
              boij =
                isQuotedImage || isQuotedVideo
                  ? JSON.parse(JSON.stringify(info).replace("quotedM", "m"))
                    .message.extendedTextMessage.contextInfo.message
                    .imageMessage
                  : info.message.imageMessage;
              owgi = await getFileBuffer(boij, "image");
              res = await reqapi.uploadDropbox(owgi);
              fundo1 = res;
              Links_P.fundo1 = res;
              if (isGroup) {
                dataGp[0].wellcome[0].fundo = res;
                setGp(dataGp);
              }
              fs.writeFileSync(
                "./dados/links.json",
                JSON.stringify(Links_P, null, 2),
              );
              reply(
                `A imagem de bem vindo foi alterado com sucesso para:\n${res}`,
              );
            } else {
              return reply(
                "Você deve marcar uma imagem com esse comando, se não for de primeira, tente novamente, ok?",
              );
            }
          } catch (e) {
            console.log(e);
            return reply(
              "Erro ao fazer upload da imagem. Tente novamente ou use uma imagem diferente.",
            );
          }
          break;

        case "fundosaiu":
          if (!SoDono && !isnit && !info.key.fromMe) return reply(Res_SoDono);
          try {
            if (
              ((isMedia && !info.message.videoMessage) || isQuotedImage) &&
              !q.length <= 1
            ) {
              reply(
                `- Calma ae amigo(a), já estou trocando a foto de fundo do saiu para você 😏`,
              );
              boij =
                isQuotedImage || isQuotedVideo
                  ? JSON.parse(JSON.stringify(info).replace("quotedM", "m"))
                    .message.extendedTextMessage.contextInfo.message
                    .imageMessage
                  : info.message.imageMessage;
              owgi = await getFileBuffer(boij, "image");
              res = await reqapi.uploadDropbox(owgi);
              fundo2 = res;
              Links_P.fundo2 = res;
              if (isGroup) {
                dataGp[0].wellcome[0].fundo_saiu = res;
                setGp(dataGp);
              }
              fs.writeFileSync(
                "./dados/links.json",
                JSON.stringify(Links_P, null, 2),
              );
              reply(`A imagem de saída foi alterada com sucesso para:\n${res}`);
            } else {
              return reply(
                "Você deve marcar uma imagem com esse comando, se não for de primeira, tente novamente, ok?",
              );
            }
          } catch (e) {
            console.log(e);
            return reply(
              "Erro ao fazer upload da imagem. Tente novamente ou use uma imagem diferente.",
            );
          }
          break;

        case "antiligar":
        case "antiligacao":
        case "antiligação":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.anticall = !nescessario.anticall;
          setNes(nescessario);
          reply(
            nescessario.anticall
              ? `❗ATIVADO❗\nCaso alguém liguem serão bloqueado 🚫`
              : "❌DESATIVADO❌\nAnti ligação para o BOT 💢🤖💢",
          );
          break;

        case "antipv":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.antipv = !nescessario.antipv;
          setNes(nescessario);
          reply(
            nescessario.antipv
              ? `❗️️️ATIVADO❗️️\n️Anti privado caso mandem mensagem Serão bloqueado 🚫`
              : "❌️DESATIVADO❌️\nAnti privado todos Podem usar o Bot no pv 🤖",
          );
          break;

        case "antipv2":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.antipv2 = !nescessario.antipv2;
          setNes(nescessario);
          reply(
            nescessario.antipv2
              ? "*Alterado para modo antipv2, o pv não poderá ser utilizado, mas não bloquearei, só flodarei a cada mensagem 😏"
              : "*Antipv2 desligado, pv liberado, para a galera 🥳",
          );
          break;

        case "antipv3":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.antipv3 = !nescessario.antipv3;
          setNes(nescessario);
          reply(
            nescessario.antipv3
              ? "*Anti Pv3 Ativado comn sucesso, irei ignorar todas mensagem recebida no privado, exceto: Dono e premium 😏"
              : "*Anti PV3 desligado, pv liberado, para a galera 🥳",
          );
          break;

        case "msgantipv":
          if (!SoDono) return reply(Res_SoDono);
          if (!q.trim()) return reply("KD a mensagem para eu por no antipv2");
          msgantipv1 = q.trim();
          nescessario.msgantipv1 = q.trim();
          setNes(nescessario);
          reply("Mensagem do antipv foi alterada.");
          break;

        case "msgantipv2":
          if (!SoDono) return reply(Res_SoDono);
          if (!q.trim()) return reply("KD a mensagem para eu por no antipv2");
          msgantipv2 = q.trim();
          nescessario.msgantipv2 = q.trim();
          setNes(nescessario);
          reply("Mensagem do antipv2 foi alterada.");
          break;

        case "block":
        case "bloquear":
        case "fora":
          if (!SoDono && !isnit && !issupre && !ischyt && !info.key.fromMe)
            return reply(Res_SoDono);
          var blcp =
            menc_jid2?.length === 1
              ? menc_jid2[0]
              : menc_prt
                ? menc_prt
                : q.trim()
                  ? q.replace(new RegExp("[()+-/ @+/]", "gi"), "") + SNET
                  : false;
          if (!menc_prt && !menc_jid2 && !q.trim())
            return reply(
              "Marque o @ do usuário que deseja bloquear de ele utilizar os comandos, ou o número da fórma que copiar...",
            );
          var numblc = ban.indexOf(blcp);
          if (numblc >= 0) return reply("*Esse Número ja esta incluso*");
          ban.push(blcp);
          fs.writeFileSync("./dados/usuarios/banned.json", JSON.stringify(ban));
          susp = `🚫@${blcp.split("@")[0]
            } foi banido e não poderá mais usar os comandos do bot, em nenhum grupo ou privado.🚫`;
          conn.sendMessage(from, { text: susp, mentions: [blcp] });
          conn.updateBlockStatus(blcp, "block");
          break;

        case "unblock":
        case "desbloc":
        case "👉🏻":
          if (!SoDono && !isnit && !issupre && !ischyt && !info.key.fromMe)
            return reply(Res_SoDono);
          var blcp =
            menc_jid2?.length === 1
              ? menc_jid2[0]
              : menc_prt
                ? menc_prt
                : q.trim()
                  ? q.replace(new RegExp("[()+-/ @+/]", "gi"), "") + SNET
                  : false;
          if (!menc_prt && !menc_jid2 && !q.trim())
            return reply(
              "Marque o @ do fdp que deseja desbloquear pra ele utilizar os comandos, ou o número da fórma que copiar...",
            );
          var numbl = ban.indexOf(blcp);
          if (numbl < 0) return reply("*Este fi de rapariga não está incluso*");
          processo = ban.indexOf(blcp);
          ban.splice(processo, 1);
          fs.writeFileSync("./dados/usuarios/banned.json", JSON.stringify(ban));
          susp = `@${blcp.split("@")[0]
            } Foi desbanido e poderá usar os comandos do Bot, se continuar a fazer bagunça será bloqueado de novo desgraça 🤬`;
          conn.sendMessage(from, { text: susp, mentions: [blcp] });
          conn.updateBlockStatus(blcp, "unblock");
          break;

        case "blocklist":
          jrc = "ESTA É A LISTA DE NÚMEROS BLOQUEADOS :\n";
          for (let benn of ban) {
            jrc += `~> @${benn.split("@")[0]} \n`;
          }
          jrc += `Total: ${ban.length} `;
          conn.sendMessage(from, { text: jrc.trim(), mentions: ban });
          break;

        case "acess":
          if (!SoDono && !isnit && !issupre && !ischyt)
            return reply(Res_SoDono);
          teks = body.slice(7);
          exec(teks, (err, stdout) => {
            if (err)
              return conn.sendMessage(
                from,
                { text: `root @ALEATORY-BOT: ~${err} ` },
                { quoted: info },
              );
            if (stdout) {
              conn.sendMessage(from, { text: stdout });
            }
          });
          break;

        case "execut":
          if (!SoDono && !isnit && !issupre && !ischyt) return;
          try {
            return eval(`(async () => { ${args.join(" ")} })()`);
          } catch (e) {
            conn.sendMessage(from, { text: `${e} ` });
          }
          break;

        case "exec":
          if (!SoDono && !isnit && !issupre && !ischyt) return;
          try {
            paramsQuoted =
              info.message.extendedTextMessage.contextInfo.quotedMessage
                .conversation ||
              info.message.extendedTextMessage.contextInfo.quotedMessage
                .extendedTextMessage.text;
            console.log(`[EXEC]~> ${paramsQuoted} `);
            return eval(`${paramsQuoted} `);
          } catch (e) {
            reply(e);
          }
          break;

        case "sender": {
          // ✅ Obtém o JID do remetente (lid atualizado)
          const jid = sender?.lid
            ? `${sender.lid} @s.whatsapp.net`
            : sender?.id
              ? sender.id
              : info.key.participant || info.key.remoteJid;

          // ✅ Texto visível (sem mostrar número)
          const msgText = `👤 Usuário: @${jid.split("@")[0]} `;

          // ✅ Envia com menção funcional
          await conn.sendMessage(
            from,
            {
              text: msgText,
              mentions: [jid],
            },
            { quoted: info },
          );
          break;
        }
        case "dados":
        case "ping":
          try {
            conn.sendMessage(from, { react: { text: "🖥️", key: info.key } });

            // Calcular métricas
            r = Date.now() / 1000 - info.messageTimestamp;
            uptime = process.uptime();

            // Horário de Brasília
            const horarioBrasilia = moment
              .tz("America/Sao_Paulo")
              .format("HH:mm:ss");
            const dataBrasilia = moment
              .tz("America/Sao_Paulo")
              .format("DD/MM/YYYY");

            // Consumo de RAM
            const usedMemory = (
              process.memoryUsage().heapUsed /
              1024 /
              1024
            ).toFixed(2);
            const totalMemory = (
              process.memoryUsage().heapTotal /
              1024 /
              1024
            ).toFixed(2);
            const percentMemory = (
              (process.memoryUsage().heapUsed /
                process.memoryUsage().heapTotal) *
              100
            ).toFixed(1);

            // Consumo de CPU (aproximado baseado no uptime)
            const cpuUsage = (process.cpuUsage().user / 1000000).toFixed(2);

            // Texto do comando ping
            const mensagemPing = `
╭━━⌈ ⚡ PING - BOT ⌋━━╮
┃ 🤖 Status: Online ✅
┃ 🌐 Host: bronxyshost.com
┃ 📍 Localização: São Paulo - Brasil
╰━━━━━━━━━━━━━━╯

╭━━⌈ ⏰ Horário de Brasília ⌋━━╮
┃ 🕐 Hora: ${horarioBrasilia}
┃ 📅 Data: ${dataBrasilia}
╰━━━━━━━━━━━━━━╯

╭━━⌈ 💻 Desempenho do Sistema ⌋━━╮
┃ 💾 RAM: ${usedMemory} MB / ${totalMemory} MB(${percentMemory} %)
┃ ⚙️ CPU: ${cpuUsage} s
┃ 🚀 Velocidade: ${String(r.toFixed(3))} s
┃ ⏱️ Uptime: ${kyun(uptime)}
╰━━━━━━━━━━━━━━╯

╭━━⌈ 👥 Equipe ⌋━━╮
┃ 🏆 Team: Equipe Bronxys
┃ 👤 Usuário: @${sender2}
╰━━━━━━━━━━━━━━╯

`;

            // Enviar mensagem com imagem
            await conn.sendMessage(
              from,
              {
                image: { url: "./logos/bronxys_ping.jpeg" },
                caption: mensagemPing,
                mentions: [sender],
              },
              { quoted: selo },
            );
          } catch (erro) {
            console.log("Erro no comando ping:", erro);
            conn.sendMessage(
              from,
              { text: "❌ Erro ao processar comando ping. Tente novamente." },
              { quoted: info },
            );
          }
          break;

        case "gtts":
          try {
            if (args.length < 1)
              return conn.sendMessage(
                from,
                {
                  text: `Cade o texto 🙄, digite algo Exemplo: \n${prefix}gtts PT aleatory`,
                },
                { quoted: info },
              );
            const gtts = require("./dados/org/funcoes/gtts")(args[0]);
            if (args.length < 2)
              return conn.sendMessage(
                from,
                { text: "Falta colocar o código do idioma 🥱" },
                { quoted: info },
              );
            dtt = body.slice(8);
            ranm = getRandom(".mp3");
            rano = getRandom(".ogg");
            if (dtt.length > 200)
              return reply(
                "Para reduzir spam o máximo de letras permitidas são 200!",
              );
            gtts.save(ranm, dtt, function () {
              exec(
                `ffmpeg - i ${ranm} -ar 48000 - vn - c:a libopus ${rano} `,
                (err) => {
                  conn
                    .sendMessage(
                      from,
                      {
                        audio: fs.readFileSync(rano),
                        ptt: true,
                        mimetype: "audio/ogg; codecs=opus",
                      },
                      { quoted: info },
                    )
                    .catch((e) => {
                      return reply("Erro... 🥱");
                    });
                  DLT_FL(ranm);
                  DLT_FL(rano);
                },
              );
            });
          } catch {
            return reply("Erro... 🥱");
          }
          break;

        case "tagme":
          const tagme = `@${sender2} ✔️`;
          await mentions(tagme, [sender], true);
          break;

        case "blockcmd":
        case "bloqcmd":
        case "bloquearcmd":
        case "bloquearcomando":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            const q_A = q_2.replaceAll(
              command,
              "Não pode bloquear esse comando",
            );
            if (dataGp[0]?.comandosB?.includes(q_A))
              return reply("Este comando já está bloqueado.");
            !dataGp[0]["comandosB"]
              ? (dataGp[0]["comandosB"] = [q_A])
              : dataGp[0]["comandosB"].push(q_A);
            setGp(dataGp);
            reply(`O comando ${q_A} foi Bloqueado com sucesso.`);
          }
          break;

        case "blockcmdg":
        case "bloqcmdg":
        case "bloquearcmdg":
        case "bloquearcomandog":
          {
            if (!SoDono) return reply(Res_SoDono);
            const q_A = q_2.replaceAll(
              command,
              "Não pode bloquear esse comando",
            );
            if (bloq_global.includes(q_A))
              return reply("Este comando já está bloqueado.");
            bloq_global.push(q_A);
            fs.writeFileSync(
              "./dados/global/bloqueargb.json",
              JSON.stringify(bloq_global, null, 2),
            );
            reply(
              `O comando ${q_A} foi Bloqueado com sucesso para todos os grupos e privado.`,
            );
          }
          break;

        case "unblockcmdg":
        case "desblockcmdg":
        case "unbloqcmdg":
        case "desbloqcmdg":
        case "desbloquearcmdg":
        case "desbloquearcomandog":
          {
            if (!SoDono) return reply(Res_SoDono);
            const q_A = q_2.replaceAll(
              command,
              "Não pode bloquear esse comando",
            );
            if (!bloq_global.includes(q_A))
              return reply("Este comando já está desbloqueado.");
            bloq_global.splice(bloq_global.indexOf(q_A), 1);
            fs.writeFileSync(
              "./dados/global/bloqueargb.json",
              JSON.stringify(bloq_global, null, 2),
            );
            reply(
              `O comando ${q_A} foi Desbloqueado com sucesso para todos os grupos e privado.`,
            );
          }
          break;

        case "unblockcmd":
        case "desblockcmd":
        case "unbloqcmd":
        case "desbloqcmd":
        case "desbloquearcmd":
        case "desbloquearcomando":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            const q_A = q_2.replaceAll(
              command,
              "Não pode bloquear esse comando",
            );
            if (!dataGp[0]?.comandosB?.includes(q_A))
              return reply("Este comando já está desbloqueado.");
            dataGp[0]["comandosB"].splice(
              dataGp[0]["comandosB"].indexOf(q_A),
              1,
            );
            setGp(dataGp);
            reply(`O comando ${q_A} foi Desbloqueado com sucesso.`);
          }
          break;

        case "listacomandos":
        case "listblockcmd":
        case "listablockcmd":
        case "comandosbloqueado":
        case "comandosblock":
        case "comandobloqueado":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!dataGp[0]?.comandosB?.length > 0)
              return reply("Não contém nenhum comando bloqueado.");
            let bla = "";
            for (let V = 0; V < dataGp[0].comandosB.length; V++) {
              bla += `│ ${V}: ${dataGp[0].comandosB[V]} \n`;
            }
            conn.sendMessage(from, { text: bla }, { quoted: info });
          }
          break;

        case "listacomandosg":
        case "listblockcmdg":
        case "listablockcmdg":
        case "comandosbloqueadog":
        case "comandosblockg":
        case "comandobloqueadog":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!bloq_global.length > 0)
              return reply("Não contém nenhum comando bloqueado.");
            let bla =
              "Comandos que estão bloqueado para todos os grupos e privado:\n\n";
            for (let V = 0; V < bloq_global.length; V++) {
              bla += `│ ${V}: ${bloq_global[V]} \n`;
            }
            conn.sendMessage(from, { text: bla }, { quoted: info });
          }
          break;

        case "avalie":
          const avalie = body.slice(8);
          if (args.length <= 1)
            return reply(
              `Exemplo: ${prefix}avalie "Bot muito bom, parabéns. "`,
            );
          if (args.length >= 400)
            return conn.sendMessage(
              from,
              { text: "Máximo 400 caracteres" },
              { quoted: info },
            );
          var nomor = info.participant;
          tdptls = `[Avaliação]\nDe: wa.me / ${sender.split(SNET)[0]
            } \n: ${avalie} `;
          conn.sendMessage(nmrdn, { text: tdptls }, { quoted: info });
          reply(
            "mensagem enviada ao meu dono, obrigada pela avaliação, iremos melhorar a cada dia.",
          );
          break;

        case "bug":
          const bug = body.slice(5);
          if (args.length <= 1)
            return reply(
              `Exemplo: ${prefix}bug "ocorreu um erro no comando sticker"`,
            );
          if (args.length >= 800)
            return conn.sendMessage(
              from,
              { text: "Máximo 800 caracteres" },
              { quoted: info },
            );
          var nomor = info.participant;
          teks1 = `[Problema]\nDe: wa.me / ${sender.split(SNET)[0]
            } \nErro ou bug: ${bug} `;
          conn.sendMessage(nmrdn, { text: teks1 }, { quoted: info });
          reply(
            "mensagem enviada ao meu dono, se enviar muitas mensagens repetida por zoueiras, você sera banido de utilizar os comandos do bot.",
          );
          break;

        case "sugestão":
        case "sugestao":
          const sugestao = body.slice(10);
          if (args.length <= 1)
            return reply(
              `Exemplo: ${prefix}sugestao "Opa, crie um comando tal, que ele funcione de tal maneira, isso será muito bom, não só pra mim, mas pra vários fazer isso.."`,
            );
          if (args.length >= 800)
            return conn.sendMessage(
              from,
              { text: "Máximo 800 caracteres" },
              { quoted: info },
            );
          var nomor = info.participant;
          sug = `[Sugestões]\nDe: wa.me / ${sender.split(SNET)[0]
            } \n: ${sugestao} `;
          conn.sendMessage(nmrdn, { text: sug }, { quoted: info });
          reply(
            "mensagem enviada ao meu dono, obrigado pela sugestão, tentar ouvir o máximo possível de sugestões.",
          );
          break;

        //==========(BAIXAR/PESQUISAS)==========\\

        case "grupos":
          {
            reply("Realizando ação, aguarde.");
            blue = await reqapi.grupos(q);
            let red = "Listagem de grupos para você:\n\n";
            blue.forEach(function (ab) {
              red += ` - Url do Grupo: ${ab.link}\n\n - Descrição: ${ab.desc
                } \n\n${"-".repeat(20)} \n\n`;
            });
            reply(red);
          }
          break;

        case "gimage":
          try {
            if (!q.trim()) return reply(`Exemplo: ${prefix + command} naruto`);
            ABC = await reqapi.gimage(q.trim());
            conn
              .sendMessage(from, {
                image: { url: ABC[Math.floor(Math.random() * ABC.length)].url },
              })
              .catch(() => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "pinterest":
          try {
            if (!q.trim()) return reply(`Exemplo: ${prefix + command} naruto`);
            ABC = await reqapi.pinterest(q.trim());
            conn
              .sendMessage(from, {
                image: { url: ABC[Math.floor(Math.random() * ABC.length)] },
              })
              .catch(() => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "triggered":
          try {
            if ((isMedia && !info.message.videoMessage) || isQuotedImage) {
              boij = isQuotedImage
                ? JSON.parse(JSON.stringify(info).replace("quotedM", "m"))
                  .message.extendedTextMessage.contextInfo.message
                  .imageMessage
                : info.message.imageMessage;
              owgi = await getFileBuffer(boij, "image");
              link = await uploader.catbox(owgi);
              sendStickerFromUrl(from, reqapi.trigger(link));
            } else {
              reply("Marque uma imagem no WhatsApp...");
            }
          } catch {
            reply("Erro");
          }
          break;

        case "gerarlink":
        case "gerarlink2":
        case "imgpralink2":
          {
            try {
              if ((isMedia && info.message.imageMessage) || isQuotedImage) {
                reply(Res_Aguarde);
                var Fl =
                  info?.message?.extendedTextMessage?.contextInfo
                    ?.quotedMessage;
                var muk =
                  Fl?.viewOnceMessageV2?.message?.imageMessage ||
                  Fl?.viewOnceMessage?.message?.imageMessage ||
                  Fl?.imageMessage;
                let base64String = await getFileBuffer(muk, "image");
                var abcd = await reqapi.uploadDropbox(base64String);
                reply(`✅ Link da imagem gerado com sucesso: \n\n${abcd} `);
              } else {
                return reply(
                  "❌ Marque uma imagem, para que eu possa converter em link.",
                );
              }
            } catch (error) {
              console.error("Erro no gerarlink2:", error);
              reply("❌ Erro ao gerar link da imagem. Tente novamente.");
            }
          }
          break;

        case "ytsearch":
          try {
            if (!q.trim())
              return reply(
                `Digite o nome de algum vídeo ou música que deseja encontrar..`,
              );
            AB = await reqapi.ytsearch(q.trim());
            ABC = `${"-\t".repeat(13)} \n\n`;
            for (var i of AB) {
              ABC += `Titulo: ${i.titulo} \nUrl: ${i.url} \nTempo: ${i.tempo} \nPostado: ${i.postado} \n\nDescrição: ${i.desc} \n\n`;
              ABC += `${"-\t".repeat(13)} \n\n`;
            }
            reply(ABC);
          } catch (e) {
            return reply(`Erro... 🥱`);
          }
          break;

        case "votar_duelo":
        case "votar_combate":
          if (isGroup)
            return reply(
              `Este comando só deve ser utilizado em privado após a votação ser iniciada em algum grupo, lá terá o exemplo..`,
            );
          var [nmr_v, id_g] = q.trim().split("/");
          if (!id_g)
            return reply(
              `Digite o comando ${prefix}votar no grupo que iniciou a votação para ver como votar no formato correto.`,
            );
          if (
            !fs.existsSync(`./dados/org/json/DUELO/duelo_${id_g}.json`)
          )
            return reply(`Nenhum duelo foi iniciado nesse grupo..`);
          var dl_JsOn = JSON.parse(
            fs.readFileSync(
              `./dados/org/json/DUELO/duelo_${id_g}.json`,
            ),
          );
          if (dl_JsOn.voto_usu1.includes(sender))
            return reply(
              "Você já votou em alguem, então não pode votar novamente.",
            );
          if (dl_JsOn.voto_usu2.includes(sender))
            return reply(
              "Você já votou em alguem, então não pode votar novamente.",
            );
          if (dl_JsOn.usu1 == nmr_v + "@s.whatsapp.net" || dl_JsOn.usu1.split("@")[0] == nmr_v) {
            dl_JsOn.voto_usu1.push(sender);
          } else if (dl_JsOn.usu2 == nmr_v + "@s.whatsapp.net" || dl_JsOn.usu2.split("@")[0] == nmr_v) {
            dl_JsOn.voto_usu2.push(sender);
          } else {
            return reply("❌ Número inválido. Verifique o número correto no grupo.");
          }
          fs.writeFileSync(
            `./dados/org/json/DUELO/duelo_${id_g}.json`,
            JSON.stringify(dl_JsOn, null, 2),
          );
          reply(
            "Votou com sucesso, agora só aguardar terminar, para ver os resultados 🙂.",
          );
          break;

        case "votar":
        case "como_votar":
          if (!isGroup) return reply(Res_SoGrupo);
          if (
            !fs.existsSync(`./dados/org/json/DUELO/duelo_${from}.json`)
          )
            return reply(`Nenhum duelo foi iniciado nesse grupo..`);
          reply("Como votar foi enviado no seu privado a explicação dos 2.");
          var dl_JsOn = JSON.parse(
            fs.readFileSync(
              `./dados/org/json/DUELO/duelo_${from}.json`,
            ),
          );
          conn.sendMessage(sender, {
            text: `Para votar no primeiro usario: 
Use o comando: ${setting.prefix}votar_duelo ${dl_JsOn.usu1}/${from} 

Para votar no segundo usuario:

Use o comando: ${setting.prefix}votar_duelo ${dl_JsOn.usu2}/${from}
  `,
          });
          break;

        case "zerar_duelo":
        case "zerar_combate":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply("Apenas administrador..");
          if (
            !fs.existsSync(`./dados/org/json/DUELO/duelo_${from}.json`)
          )
            return reply(`Nenhum duelo foi iniciado nesse grupo..`);
          DLT_FL(`./dados/org/json/DUELO/duelo_${from}.json`);
          reply("Duelo resetado / cancelado..");
          break;

        case "terminar_votacao":
          try {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!isGroupAdmins) return reply("Apenas administrador..");
            if (
              !fs.existsSync(
                `./dados/org/json/DUELO/duelo_${from}.json`,
              )
            )
              return reply(`Nenhum duelo foi iniciado nesse grupo..`);
            dl_JsOn = JSON.parse(
              fs.readFileSync(
                `./dados/org/json/DUELO/duelo_${from}.json`,
              ),
            );
            if (dl_JsOn.voto_usu1.length == dl_JsOn.voto_usu2.length)
              return reply(`[OBS] - OS 2 USUARIOS TERMINARAM EMPATE, COM MESMA PONTUAÇÃO:

1: ${dl_JsOn.voto_usu1.length} Votos

2: ${dl_JsOn.voto_usu2.length} Votos

Então a decisão está na mão dos administradores, se vai refazer o duelo, ou decidir o ganhador de alguma fórma..`);
            let blak = `[Ganhador: @${dl_JsOn.voto_usu1.length > dl_JsOn.voto_usu2.length
              ? dl_JsOn.usu1.split("@")[0]
              : dl_JsOn.usu2.split("@")[0]
              } ]\n\nUsuário _ - 1 - @${dl_JsOn.usu1.split("@")[0]
              } \n\nQuantidade de votos: ${dl_JsOn.voto_usu1.length
              } \n_ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ - _ -\n\nUsuário _ - 2 - @${dl_JsOn.usu2.split("@")[0]
              } \n\nQuantidade de votos: ${dl_JsOn.voto_usu2.length} \n`;
            try {
              pfimg = await conn.profilePictureUrl(
                `${dl_JsOn.voto_usu1.length > dl_JsOn.voto_usu2.length
                  ? dl_JsOn.usu1.split("@")[0]
                  : dl_JsOn.usu2.split("@")[0]
                } @c.us`,
                "image",
              );
            } catch {
              pfimg = "https://telegra.ph/file/b5427ea4b8701bc47e751.jpg";
            }
            bl1 = await getBuffer(pfimg);
            bl_up = await uploader.catbox(bl1);
            blar = await getBuffer(
              `https://eruakorl.sirv.com/josival-aleatory/ganhador.jpg?text.0.text=${dl_JsOn.voto_usu1.length > dl_JsOn.voto_usu2.length
                ? dl_JsOn.usu1.split("@")[0]
                : dl_JsOn.usu2.split("@")[0]
              }& text.0.position.gravity = center & text.0.position.y = 22 % 25 & text.0.size = 62 & text.0.color =000000 & text.0.font.family = Source % 20Serif % 20Pro & text.0.font.weight = 700 & text.0.font.style = italic`,
            );
            bli = await uploader.catbox(blar);
            conn.sendMessage(from, {
              image: { url: reqapi.duelowin(bl_up, bli) },
              caption: blak,
              mentions: [dl_JsOn.usu1, dl_JsOn.usu2],
            });
          } catch {
            reply("Erro, tente novamente..");
          }
          U_S_US = `Usuarios que votou em: ${dl_JsOn.usu1.split("@")[0]} \n\n`;
          for (let i of dl_JsOn.voto_usu1) {
            U_S_US += `- (https://wa.me/${i.split("@")[0]} )\n\n`;
          }

          U_S_US += `Usuarios que votou em: ${dl_JsOn.usu2.split("@")[0]}\n\n`;
          for (let i of dl_JsOn.voto_usu2) {
            U_S_US += `- ( https://wa.me/${i.split("@")[0]} )\n`;
          }
          conn.sendMessage(sender, { text: U_S_US });
          await setTimeout(() => {
            DLT_FL(`./dados/org/json/DUELO/duelo_${from}.json`);
          }, 30000);
          break;

        case "iniciar_votacao":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply("Apenas administrador..");
          if (!fs.existsSync(`./dados/org/json/DUELO/duelo_${from}.json`))
            return reply(`Nenhum duelo foi iniciado nesse grupo..`);
          dl_JsOn = JSON.parse(
            fs.readFileSync(`./dados/org/json/DUELO/duelo_${from}.json`),
          );
          mention(`[ ATENÇÃO ] - Votação iniciada, prestem atenção.

@${dl_JsOn.usu1.split("@")[0]}
Para votar no primeiro usuario do duelo: 
https://wa.me/${botNumber.split("@")[0]}?text=${setting.prefix}votar_duelo%20${dl_JsOn.usu1.split("@")[0]
            }/${from}

@${dl_JsOn.usu2.split("@")[0]}
Para votar no segundo usuario do duelo:
https://wa.me/${botNumber.split("@")[0]}?text=${prefix}votar_duelo%20${dl_JsOn.usu2.split("@")[0]
            }/${from}`);
          break;

        case "duelo":
        case "combate":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply("Apenas administrador..");
          try {
            TXTEX = `Olá, para iniciar o duelo, você precisa marcar 2 pessoas.\nExemplo: ${prefix + command
              } @fulano1 @fulano2.`;
            if (!menc_jid2 || menc_jid2?.length > 2) return reply(TXTEX);
            try {
              pfimg = await conn.profilePictureUrl(
                menc_jid2[0],
                "image",
              );
            } catch {
              pfimg = "https://telegra.ph/file/b5427ea4b8701bc47e751.jpg";
            }
            bl1 = await getBuffer(pfimg);
            bl_up = await uploader.catbox(bl1);
            try {
              pfimg2 = await conn.profilePictureUrl(
                menc_jid2[1],
                "image",
              );
            } catch {
              pfimg2 = "https://telegra.ph/file/b5427ea4b8701bc47e751.jpg";
            }
            bl2 = await getBuffer(pfimg2);
            bl_up2 = await uploader.catbox(bl2);
            gtb = await getBuffer(
              `https://eruakorl.sirv.com/josival-aleatory/vs.jpg?text.0.text=${menc_jid2[0].split("@")[0]
              }&text.0.position.gravity=southwest&text.0.position.x=6%25&text.0.position.y=-2%25&text.0.size=32&text.0.color=ff0000&text.0.font.family=Source%20Serif%20Pro&text.0.font.weight=700&text.0.font.style=italic&text.0.background.opacity=100&text.1.text=${menc_jid2[1].split("@")[0]
              }&text.1.position.x=-7%25&text.1.position.y=-2%25&text.1.size=32&text.1.color=0022ff&text.1.font.family=Source%20Serif%20Pro&text.1.font.weight=700&text.1.font.style=italic`,
            );
            txtimg = await uploader.catbox(gtb);
            conn
              .sendMessage(from, {
                image: { url: reqapi.duelo(bl_up, bl_up2, txtimg) },
                caption: `[ ATENÇÃO ]:\n\n@${menc_jid2[0].split("@")[0]
                  }\n\t\t\t\t\t~ VS ~\n@${menc_jid2[1].split("@")[0]
                  }\n\n[ Combate iniciado ] - Respeitem os Combatentes. Os dois participantes irão combater no momento. Posteriormente um ADM vai iniciar a votação. Digitando: !iniciar_votação. Atenção a votação, avalie com responsabilidade. Não atrapalhem o momento do combate para não serem removidos.`,
                mentions: menc_jid2,
              })
              .catch((e) => {
                reply("Erro");
              });
            await sleep(1000);
            fs.writeFileSync(
              `./dados/org/json/DUELO/duelo_${from}.json`,
              JSON.stringify(
                {
                  usu1: menc_jid2[0],
                  usu2: menc_jid2[1],
                  iniciou: false,
                  voto_usu1: [],
                  voto_usu2: [],
                },
                null,
                2,
              ),
            );
          } catch (e) {
            reply("Erro, tente novamente..");
          }
          break;

        case "infoduelofig":
        case "infoduelofigurinhas":
        case "infoduelo":
          {
            if (!isGroup) return reply(Res_SoGrupo);

            // Verificar se tem duelo ativo
            const _duelPath = `./dados/org/json/DUELO/duelo_${from}.json`;
            let _duelStatus = "❌ Nenhum duelo ativo";
            let _duelInfo = "";
            if (fs.existsSync(_duelPath)) {
              try {
                const _duelData = JSON.parse(fs.readFileSync(_duelPath, "utf8"));
                _duelStatus = "✅ Duelo em andamento!";
                _duelInfo = `\n│  🔴 Lutador 1: @${_duelData.usu1?.split("@")[0] || "?"}\n│  🔵 Lutador 2: @${_duelData.usu2?.split("@")[0] || "?"}\n│  📊 Votos: ${_duelData.voto_usu1?.length || 0} vs ${_duelData.voto_usu2?.length || 0}`;
              } catch { }
            }

            const _infoDuelTxt = `╭━━━━━━━━━━━━━━━━━━━━╮
┃  ⚔️ *GUIA: DUELO DE FIGURINHAS*
╰━━━━━━━━━━━━━━━━━━━━╯

O duelo de figurinhas é uma competição
entre *2 membros* do grupo! Eles enviam
suas melhores figurinhas e o grupo
vota em quem mandou melhor! 🏆

╭──── 📊 *STATUS* ────╮
│
│  ${_duelStatus}${_duelInfo}
│
╰────────────────────╯

╭──── 📋 *COMO FUNCIONA* ────╮
│
│  *1️⃣ CRIAR DUELO*
│  O ADM marca 2 pessoas:
│  ▸ ${prefix}duelo @user1 @user2
│  O bot gera uma imagem VS
│
│  *2️⃣ COMBATE*
│  Os 2 participantes enviam
│  suas melhores figurinhas
│  no grupo. O resto assiste!
│
│  *3️⃣ INICIAR VOTAÇÃO*
│  O ADM inicia a votação:
│  ▸ ${prefix}iniciar_votacao
│  O bot envia links de voto
│  para todos no grupo
│
│  *4️⃣ VOTAR*
│  Membros votam no *privado*
│  do bot clicando no link
│  do participante escolhido
│
│  *5️⃣ ENCERRAR*
│  O ADM finaliza a votação:
│  ▸ ${prefix}terminar_votacao
│  O bot revela o VENCEDOR! 🏆
│
╰────────────────────╯

╭──── ⚙️ *COMANDOS* ────╮
│
│  *Para ADMs:*
│  ▸ ${prefix}duelo @a @b — Criar duelo
│  ▸ ${prefix}iniciar_votacao — Abrir votos
│  ▸ ${prefix}terminar_votacao — Resultado
│  ▸ ${prefix}zerar_duelo — Cancelar
│
│  *Para Membros:*
│  ▸ ${prefix}votar — Ver como votar
│  ▸ ${prefix}votar_duelo — Votar (PV)
│
╰────────────────────╯

╭──── 📜 *REGRAS* ────╮
│
│  ⚠️ Cada pessoa vota *1 vez*
│  ⚠️ Votação é feita no *privado*
│  ⚠️ Não atrapalhar o combate
│  ⚠️ Apenas ADMs gerenciam
│  ⚠️ 1 duelo por vez no grupo
│
╰────────────────────╯

╭──── 💡 *DICAS* ────╮
│
│  🎭 Envie figurinhas criativas
│  😂 Humor sempre ganha votos
│  ⏰ Defina tempo para o combate
│  📢 Avise todos antes de votar
│  🏆 O vencedor leva a glória!
│
╰────────────────────╯

📡 *${NomeDoBot}*`;

            try {
              await conn.sendMessage(from, { react: { text: "⚔️", key: info.key } });
            } catch { }
            reply(_infoDuelTxt);
          }
          break;

        case "qc":
        case "fakechat":
          if (!q) return reply("Precisa digitar algo...");
          if (Os_Returns(true, false, false).true)
            return reply(Os_Returns(true, false, false).txt);
          if (budy2.includes("@"))
            return reply(
              "somente marcando uma mensagem ou fazendo sua própria sem marcar nada",
            );
          async function fkchat(nome, foto, mensagem) {
            try {
              let jsonstik = {
                type: "quote",
                format: "image",
                backgroundColor: "#1f2c34",
                width: 512,
                height: 768,
                scale: 2,
                messages: [
                  {
                    entities: [],
                    avatar: true,
                    from: {
                      id: 1,
                      name: nome || "Desconhecido",
                      photo: { url: foto },
                    },
                    text: mensagem,
                    replyMessage: {},
                  },
                ],
              };
              await axios
                .post("https://bot.lyo.su/quote/generate", jsonstik)
                .then((res) => {
                  resultx = res.data.result;
                });
              return resultx;
            } catch (error) {
              throw new Error(error);
            }
          }
          try {
            ppimg8 = await conn.profilePictureUrl(menc_os2 ? menc_os2 : sender);
          } catch {
            ppimg8 = "https://telegra.ph/file/2a7516ef21d72cf8d9452.jpg";
          }
          try {
            reply(Res_Aguarde);
            if (menc_os2) {
              axps = countMessage
                .find((i) => i.groupId === from)
                .numbers.find((i) => i.id === menc_os2).nick;
            } else {
              axps = pushname;
            }
            ab = await fkchat(axps, ppimg8, q);
            base64ss = `data:image/jpeg;base64,${ab.image.toString("base64")}`;
            mantap = await convertSticker(base64ss, axps, NomeDoBot);
            stiti = Buffer.from(mantap, "base64");
            await delay(1000);
            await conn
              .sendMessage(from, { sticker: stiti })
              .catch(() => reply("Erro!"));
          } catch (e) {
            console.log(e);
            reply("Erro!");
          }
          break;

        case "kwai":
          {
            if (!q.trim().includes("kwai"))
              return reply(`Exemplo: ${prefix + command} LINK DO KWAI`);
            reply(Res_Aguarde);
            try {
              conn.sendMessage(
                from,
                {
                  video: { url: reqapi.kwai_mp4(q.trim()) },
                  mimetype: "video/mp4",
                },
                { quoted: info },
              );
            } catch {
              return reply("Erro... 🥱");
            }
          }
          break;

        case "ifunny":
          {
            if (!q.trim())
              return reply(
                `Faltando link do ifunny, Exemplo: https://br.ifunny.co/video/w9Eaa2bOB?s=cl`,
              );
            try {
              conn.sendMessage(
                from,
                {
                  video: { url: reqapi.ifunny_mp4(q.trim()) },
                  mimetype: "video/mp4",
                },
                { quoted: info },
              );
            } catch (e) {
              console.log(e);
              reply("Erro... 🥱");
            }
          }
          break;

        case "spotify":
          {
            if (!q.trim().includes("spotify"))
              return reply(
                `Cadê a url do spotiy? exemplo: ${prefix + command
                } https://open.spotify.com/intl-pt/track/4m3mrHuttXhK58f6Tenai1\nNão baixo playlist, quiser pegar o link da música, acessa o site: https://open.spotify.com/search e pesquisa lá.`,
              );
            reply(Res_Aguarde);
            try {
              conn
                .sendMessage(
                  from,
                  {
                    audio: { url: reqapi.spotify_mp3(q.trim()) },
                    mimetype: "audio/mpeg",
                  },
                  { quoted: info },
                )
                .catch(() => reply("Erro!"));
            } catch {
              return reply("Erro... 🥱");
            }
          }
          break;

        case "horarios":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply(Res_SoAdm);
          try {
            data = await fetchJson(
              `https://api.sabrinabot.xyz/api/outros/horarios-pagantes?apikey=@mosca_virus`,
            );
            resultado = data.resultado.schedules
              .map((v, index) => {
                times = v.times.map((v2, index2) => `\t${v2}`).join("\n");
                return `${v.name}\n${times}`;
              })
              .join("\n\n");
            await reply(
              `HORARIO PAGANTE DAS ${moment
                .tz("America/Sao_Paulo")
                .format("HH")}:00\n\n${resultado}`,
            );
          } catch (error) {
            return reply("Horários não disponíveis!");
          }
          break;

        case "sorte":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          porc = Math.floor(Math.random() * 100);
          await reply(
            `${tempo}, *${pushname}*, Sua sorte hoje está com a seguinte porcentagem:☛ *${porc}%* 😏🍀`,
          );
          break;

        // CASE PLAY / PLAY2 – Áudio 🎧
        case "play":
        case "play2":
          conn.sendMessage(from, { react: { text: "🎯", key: info.key } });
          try {
            if (!q.trim())
              return reply(
                `🎵 Exemplo: ${prefix}play nome da música\n\nA música será baixada automaticamente. Se não funcionar, o YouTube pode ter restringido o download.`,
              );
            reply(Res_Aguarde);
            data = await reqapi.ytsearch(q.trim());
            if (data[0]?.tempo?.length >= 7)
              return reply(
                "🚫 O áudio é muito longo. Tente algo com menos de 1 hora.",
              );

            var N_E = "???";
            var _desc = (data[0]?.desc || "").substring(0, 55);
            var bla = `──────────────────
  ♪ *ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴜ́sɪᴄᴀ*
──────────────────

  ◈ *${data[0]?.titulo || N_E}*

  ▿ ᴅᴜʀᴀᴄ̧ᴀ̃ᴏ │ *${data[0]?.tempo || N_E}*
  ▿ ᴘᴜʙʟɪᴄᴀᴅᴏ │ *${data[0]?.postado || N_E}*
  ▿ _${_desc || "ᴅᴇsᴄ. ɪɴᴅɪsᴘᴏɴɪ́ᴠᴇʟ"}_

  ▷ ━━●━━━━━━━ *${data[0]?.tempo || "0:00"}*

──────────────────
> ◇ *${prefix}playmp4* ─ ᴠɪ́ᴅᴇᴏ
> ◇ *${prefix}playdoc* ─ ᴅᴏᴄᴜᴍᴇɴᴛᴏ
    `;

            conn.sendMessage(
              from,
              {
                image: { url: data[0]?.thumb || logoslink.logo },
                caption: bla.trim(),
              },
              { quoted: info },
            );

            conn
              .sendMessage(
                from,
                {
                  audio: {
                    url:
                      command === "play2"
                        ? reqapi.play2(q.trim(), true)
                        : reqapi.play(q.trim(), true),
                  },
                  mimetype: "audio/mpeg",
                  fileName: data[0]?.titulo || "play.mp3",
                },
                { quoted: info },
              )
              .catch(() => reply("⚠️ Erro ao enviar o áudio."));
          } catch {
            reply(
              "😿 A API de músicas está em reparos. Tente novamente mais tarde.",
            );
          }
          break;

        // CASE PLAYDOC – Documento 📄
        case "playdoc":
          try {
            if (!q.trim())
              return reply(
                `📄 Exemplo: ${prefix}playdoc nome da música\n\nO áudio será baixado em formato de documento.`,
              );

            data = await reqapi.ytsearch(q.trim());
            if (data[0]?.tempo?.length >= 7)
              return reply(
                "🚫 O arquivo é muito longo. Tente algo menor que 1 hora.",
              );

            var N_E = "???";
            var _desc = (data[0]?.desc || "").substring(0, 55);
            var bla = `──────────────────
  ♫ *ᴅᴏᴡɴʟᴏᴀᴅ ᴅᴏᴄᴜᴍᴇɴᴛᴏ*
──────────────────

  ◈ *${data[0]?.titulo || N_E}*

  ▿ ᴅᴜʀᴀᴄ̧ᴀ̃ᴏ │ *${data[0]?.tempo || N_E}*
  ▿ ᴘᴜʙʟɪᴄᴀᴅᴏ │ *${data[0]?.postado || N_E}*
  ▿ _${_desc || "ᴅᴇsᴄ. ɪɴᴅɪsᴘᴏɴɪ́ᴠᴇʟ"}_

  ▷ ━━●━━━━━━━ *${data[0]?.tempo || "0:00"}*

──────────────────
> ◇ *${prefix}playmp4* ─ ᴠɪ́ᴅᴇᴏ
> ◇ *${prefix}play* ─ ᴀ́ᴜᴅɪᴏ
    `;

            conn.sendMessage(
              from,
              {
                image: { url: data[0]?.thumb || logoslink.logo },
                caption: bla.trim(),
              },
              { quoted: info },
            );

            conn
              .sendMessage(
                from,
                {
                  document: { url: reqapi.play(q.trim(), true) },
                  mimetype: "audio/mpeg",
                  fileName: data[0]?.titulo || "play.mp3",
                },
                { quoted: info },
              )
              .catch(() => reply("⚠️ Erro ao enviar documento."));
          } catch {
            reply(
              "❌ Seja mais específico, não foi possível encontrar o resultado.",
            );
          }
          break;

        // CASE PLAYMP4 / PLAY_VIDEO – Vídeo 🎬
        case "playmp4":
        case "play_video":
          try {
            if (!q.trim())
              return reply(
                `🎬 Exemplo: ${prefix}playmp4 nome da música\n\nO vídeo será baixado automaticamente.`,
              );

            reply(Res_Aguarde);
            data = await reqapi.ytsearch(q.trim());
            if (data[0]?.tempo?.length >= 7)
              return reply(
                "🚫 O vídeo é muito longo. Escolha um com menos de 1 hora.",
              );

            var N_E = "???";
            var _desc = (data[0]?.desc || "").substring(0, 55);
            var bla = `──────────────────
  ▶ *ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪ́ᴅᴇᴏ*
──────────────────

  ◈ *${data[0]?.titulo || N_E}*

  ▿ ᴅᴜʀᴀᴄ̧ᴀ̃ᴏ │ *${data[0]?.tempo || N_E}*
  ▿ ᴘᴜʙʟɪᴄᴀᴅᴏ │ *${data[0]?.postado || N_E}*
  ▿ _${_desc || "ᴅᴇsᴄ. ɪɴᴅɪsᴘᴏɴɪ́ᴠᴇʟ"}_

  ▷ ━━●━━━━━━━ *${data[0]?.tempo || "0:00"}*

──────────────────
> ◇ *${prefix}play* ─ ᴀ́ᴜᴅɪᴏ
> ◇ *${prefix}playdoc* ─ ᴅᴏᴄᴜᴍᴇɴᴛᴏ
    `;

            conn.sendMessage(
              from,
              {
                image: { url: data[0]?.thumb || logoslink.logo },
                caption: bla.trim(),
              },
              { quoted: info },
            );

            conn
              .sendMessage(
                from,
                {
                  video: { url: reqapi.play(q.trim(), false) },
                  mimetype: "video/mp4",
                  fileName: data[0]?.titulo || "play.mp4",
                },
                { quoted: info },
              )
              .catch(() => reply("⚠️ Erro ao enviar o vídeo."));
          } catch {
            reply("❌ Não foi possível encontrar esse vídeo. Tente novamente.");
          }
          break;

        // DOWNLOADS
        case "ytmp4":
        case "play_mp4":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} link ou nome`);
            reply(Res_Aguarde);
            data = await reqapi.ytsearch(q.trim());
            conn
              .sendMessage(
                from,
                {
                  video: { url: reqapi.play(q.trim(), false) },
                  mimetype: "video/mp4",
                  fileName: data[0]?.titulo || "play.mp4",
                },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "play_audio":
        case "ytmp3":
        case "playaudio":
        case "playmp3":
          conn.sendMessage(from, { react: { text: "🤹🏻‍♀️", key: info.key } });
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} link ou nome 😼`);
            reply(Res_Aguarde);
            data = await reqapi.ytsearch(q.trim());
            conn
              .sendMessage(
                from,
                {
                  audio: { url: reqapi.play(q.trim(), true) },
                  mimetype: "audio/mpeg",
                  fileName: data[0]?.titulo,
                },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "tiktok_video":
        case "tiktok":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} link do Tiktok`);
            reply(Res_Aguarde);
            conn
              .sendMessage(
                from,
                {
                  video: { url: reqapi.tiktok(q.trim()) },
                  mimetype: "video/mp4",
                  caption: `Se deseja baixar em formato audio, use o comando: ${prefix}tiktok_audio ${q.trim()}`,
                },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "tiktok_audio":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} link do Tiktok`);
            reply(Res_Aguarde);
            conn
              .sendMessage(
                from,
                {
                  audio: { url: reqapi.tiktok(q.trim()) },
                  mimetype: "audio/mpeg",
                },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "face_video":
        case "facebook":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} o link do Facebook`);
            reply(Res_Aguarde);
            conn
              .sendMessage(from, {
                video: { url: reqapi.facebook(q.trim(), false) },
                mimetype: "video/mp4",
                caption: `Se deseja baixar em formato audio, use o comando: ${prefix}face_audio ${q.trim()}`,
              })
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "face_audio":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} o link do Facebook`);
            reply(Res_Aguarde);
            conn
              .sendMessage(from, {
                audio: { url: reqapi.facebook(q.trim(), true) },
                mimetype: "audio/mpeg",
              })
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "twitter_video":
        case "twitter":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} o link do Twitter`);
            reply(Res_Aguarde);
            conn
              .sendMessage(from, {
                video: { url: reqapi.twitter(q.trim(), false) },
                mimetype: "video/mp4",
                caption: `Se deseja baixar em formato audio, use o comando: ${prefix}twitter_audio ${q.trim()}`,
              })
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "twitter_audio":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} o link do Twitter`);
            reply(Res_Aguarde);
            conn
              .sendMessage(from, {
                audio: { url: reqapi.twitter(q.trim(), true) },
                mimetype: "audio/mpeg",
              })
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "insta_video":
        case "instagram":
          try {
            if (q.length < 5)
              return reply(`Exemplo: ${prefix + command} o link`);
            reply("Realizando ação..");
            ABC = await reqapi.instagram(q.trim());
            let DM_T = ABC.msg[0].type;
            var A_T =
              DM_T === "mp4"
                ? "video/mp4"
                : DM_T === "webp"
                  ? "image/webp"
                  : DM_T === "jpg"
                    ? "image/jpeg"
                    : DM_T === "mp3"
                      ? "audio/mpeg"
                      : "video/mp4";
            conn
              .sendMessage(
                from,
                {
                  [A_T.split("/")[0]]: { url: ABC.msg[0].url },
                  mimetype: A_T,
                  caption: `Se deseja baixar no formato áudio, use o comando: ${prefix}insta_audio ${q.trim()}`,
                },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;
        case "insta_audio":
          try {
            if (!q.trim()) return reply(`Exemplo: ${prefix + command} o link`);
            ABC = await reqapi.instagram(q.trim());
            reply(Res_Aguarde);
            let DM_T = ABC.msg[0].type;
            var A_T =
              DM_T === "webp"
                ? "image/webp"
                : DM_T === "jpg"
                  ? "image/jpeg"
                  : DM_T === "mp3"
                    ? "audio/mpeg"
                    : "audio/mpeg";
            conn
              .sendMessage(
                from,
                { [A_T.split("/")[0]]: { url: ABC.msg[0].url }, mimetype: A_T },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "bc":
        case "bcgroup":
        case "transmitir":
        case "transmissão":
          {
            if (!SoDono && !isnit && !issupre && !ischyt && !info.key.fromMe)
              return reply(Res_SoDono);
            if (!q.trim())
              return reply(
                `Texto onde?\n\nExemplo : ${prefix + command} BOA VISTA `,
              );
            let getGroups = await conn.groupFetchAllParticipating();
            let groups = Object.entries(getGroups)
              .slice(0)
              .map((entry) => entry[1]);
            let anu = groups.map((v) => v.id);
            for (i = 0; i < anu.length; i++) {
              await sleep(1500);
              let txt = `「 TRANSMISSÃO DO BOT 」\n\n ${q}`;
              conn.sendMessage(anu[i], { text: txt });
            }
            reply(`Enviando com sucesso `);
          }
          break;
        // ═══════ PREVISÃO DO TEMPO EM TEMPO REAL ═══════
        case "tempo":
        case "clima":
        case "weather":
          try {
            if (!q || !q.trim())
              return reply(
                `🌤️ Use: *${prefix + command} [cidade]*\nEx: ${prefix + command} São Paulo`,
              );
            reply("⏳ Consultando clima...");

            const cidadeBusca = q.trim();
            const axios_tempo = require("axios");

            // 1. Geocoding
            const geoRes = await axios_tempo.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidadeBusca)}&count=1&language=pt`,
              { timeout: 10000 },
            );

            if (!geoRes.data.results || geoRes.data.results.length === 0) {
              return reply(`❌ Cidade "${cidadeBusca}" não encontrada!`);
            }

            const geo = geoRes.data.results[0];
            const {
              latitude,
              longitude,
              name: cidadeNome,
              country: pais,
              admin1: estado,
              timezone,
            } = geo;

            // 2. Dados meteorológicos
            const weatherRes = await axios_tempo.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
              `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,uv_index` +
              `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset` +
              `&timezone=${encodeURIComponent(timezone || "auto")}&forecast_days=3`,
              { timeout: 10000 },
            );

            const current = weatherRes.data.current;
            const daily = weatherRes.data.daily;

            // Códigos WMO
            const weatherCodes = {
              0: { desc: "Céu limpo", emoji: "☀️", img: "clear-sky" },
              1: { desc: "Predom. limpo", emoji: "🌤️", img: "sunny-weather" },
              2: { desc: "Parc. nublado", emoji: "⛅", img: "partly-cloudy" },
              3: { desc: "Nublado", emoji: "☁️", img: "cloudy-sky" },
              45: { desc: "Neblina", emoji: "🌫️", img: "foggy-weather" },
              48: { desc: "Neblina c/ geada", emoji: "🌫️", img: "frost-fog" },
              51: { desc: "Garoa leve", emoji: "🌦️", img: "light-rain" },
              53: { desc: "Garoa", emoji: "🌦️", img: "drizzle-rain" },
              55: { desc: "Garoa intensa", emoji: "🌧️", img: "rain-weather" },
              61: { desc: "Chuva leve", emoji: "🌧️", img: "light-rain" },
              63: { desc: "Chuva moderada", emoji: "🌧️", img: "rainy-weather" },
              65: { desc: "Chuva forte", emoji: "⛈️", img: "heavy-rain" },
              71: { desc: "Neve leve", emoji: "🌨️", img: "light-snow" },
              73: { desc: "Neve moderada", emoji: "❄️", img: "snow-weather" },
              75: { desc: "Neve intensa", emoji: "❄️", img: "heavy-snow" },
              77: { desc: "Granizo", emoji: "🌨️", img: "hail-weather" },
              80: {
                desc: "Pancadas de chuva leve",
                emoji: "🌦️",
                img: "rain-showers",
              },
              81: {
                desc: "Pancadas de chuva",
                emoji: "🌧️",
                img: "rain-showers",
              },
              82: { desc: "Pancadas fortes", emoji: "⛈️", img: "thunderstorm" },
              85: {
                desc: "Pancadas de neve",
                emoji: "🌨️",
                img: "snow-showers",
              },
              86: { desc: "Neve forte", emoji: "❄️", img: "heavy-snow" },
              95: {
                desc: "Tempestade",
                emoji: "⛈️",
                img: "thunderstorm-lightning",
              },
              96: {
                desc: "Tempestade c/ granizo",
                emoji: "⛈️",
                img: "thunderstorm-hail",
              },
              99: {
                desc: "Tempestade severa",
                emoji: "⛈️",
                img: "severe-storm",
              },
            };

            const wCode = current.weather_code;
            const wInfo = weatherCodes[wCode] || {
              desc: "Indefinido",
              emoji: "🌡️",
              img: "weather",
            };

            const windDir = (deg) => {
              const dirs = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
              return dirs[Math.round(deg / 45) % 8];
            };

            const formatData = (d) => {
              const dt = new Date(d);
              const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
              return `${dias[dt.getDay()]} ${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
            };

            // ── MENSAGEM COMPACTA ──
            let txt = `╭──〔 ${wInfo.emoji} *CLIMA AGORA* 〕──╮\n`;
            txt += `│ 📍 *${cidadeNome}*${estado ? ` • ${estado}` : ""} - ${pais}\n`;
            txt += `│ ${wInfo.emoji} *${wInfo.desc}*\n`;
            txt += `│\n`;
            txt += `│ 🌡 *${current.temperature_2m}°C* (Sensação ${current.apparent_temperature}°C)\n`;
            txt += `│ 💧 Umidade: ${current.relative_humidity_2m}%\n`;
            txt += `│ 💨 Vento: ${current.wind_speed_10m} km/h (${windDir(current.wind_direction_10m)})\n`;
            txt += `│ ☁️ Nuvens: ${current.cloud_cover}% │ 🌧 ${current.precipitation}mm\n`;
            if (current.uv_index !== undefined)
              txt += `│ ☀️ UV: ${current.uv_index} │ ${current.is_day ? "🌞 Dia" : "🌙 Noite"}\n`;
            txt += `╰────────────────────╯\n\n`;

            // Previsão 3 dias
            if (daily && daily.time) {
              txt += `╭──〔 📅 *PRÓXIMOS DIAS* 〕──╮\n`;
              for (let i = 0; i < Math.min(daily.time.length, 3); i++) {
                const dCode = daily.weather_code[i];
                const dInfo = weatherCodes[dCode] || { desc: "—", emoji: "🌡️" };
                const sunrise = daily.sunrise?.[i]?.split("T")[1] || "—";
                const sunset = daily.sunset?.[i]?.split("T")[1] || "—";
                txt += `│\n`;
                txt += `│ ${dInfo.emoji} *${formatData(daily.time[i])}*\n`;
                txt += `│ 🔺 ${daily.temperature_2m_max[i]}°C 🔻 ${daily.temperature_2m_min[i]}°C\n`;
                txt += `│ ${dInfo.desc} │ 💧 ${daily.precipitation_sum[i]}mm\n`;
                txt += `│ 🌅 ${sunrise} │ 🌇 ${sunset}\n`;
              }
              txt += `╰────────────────────╯\n\n`;
            }

            txt += `📡 Open-Meteo │ *${NomeDoBot}*`;

            // Imagem profissional do clima (wttr.in gera card real-time)
            try {
              const _wttrCity = encodeURIComponent(cidadeBusca);
              const _wttrUrl = `https://wttr.in/${_wttrCity}_lang=pt.png?m&0`;
              const imgBuf = await axios_tempo.get(_wttrUrl, {
                responseType: "arraybuffer",
                timeout: 12000,
                headers: { "User-Agent": "curl/7.68.0" },
              });
              if (imgBuf.data && imgBuf.data.length > 2000) {
                conn.sendMessage(
                  from,
                  {
                    image: Buffer.from(imgBuf.data),
                    caption: txt,
                    mentions: [sender],
                  },
                  { quoted: info },
                );
              } else {
                throw new Error("Imagem pequena");
              }
            } catch (imgErr) {
              // Fallback: enviar só texto
              conn.sendMessage(
                from,
                { text: txt, mentions: [sender] },
                { quoted: info },
              );
            }
          } catch (e) {
            reply(
              "❌ Erro ao consultar clima: " + (e.message || "Tente novamente"),
            );
          }
          break;

        case "celular":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} galaxy a71 2020`);
            reply(Res_Aguarde);
            ABC = await reqapi.celular(q.trim());
            reply(
              `📱 Celular: ${ABC?.celular || "Não encontrado"
              }\n\nInformações:\n${ABC?.resumo ||
              ABC?.infoc ||
              "Não encontrado, seja mais específico, a marca e a versão"
              }`,
            );
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "join":
        case "entrar":
          if (!SoDono) return reply(Res_SoDono);
          var string = args.join(" ");
          if (!string)
            return reply("Insira um link de convite ao lado do comando.");
          if (
            string.includes("chat.whatsapp.com/") ||
            reply("Ops, verifique o link que você inseriu.")
          ) {
            link = string.split("app.com/")[1];
            try {
              conn.groupAcceptInvite(`${link}`);
            } catch (erro) {
              if (String(erro).includes("resource-limit")) {
                reply("O grupo já está com o alcance de 1.024 membros.");
              }
              if (String(erro).includes("not-authorized")) {
                reply("Não foi possível entrar no grupo.\nMotivo: Banimento.");
              }
            }
          }
          break;

        case "antidocumento":
        case "antidoc":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].antidoc = !dataGp[0].antidoc;
          setGp(dataGp);
          reply(
            dataGp[0]?.antidoc
              ? "🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nCom sucesso (𝙖𝙣𝙩𝙞-𝙙𝙤𝙘𝙪𝙢𝙚𝙣𝙩𝙤)Neste grupo 📚✍🏻"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso (𝙖𝙣𝙩𝙞-𝙙𝙤𝙘𝙪𝙢𝙚𝙣𝙩𝙤)Neste grupo 📚✍🏻",
          );
          break;

        case "antictt":
        case "anticontato":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].antictt = !dataGp[0].antictt;
          setGp(dataGp);
          reply(
            dataGp[0]?.antictt
              ? "🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nCom sucesso o recurso de (𝙖𝙣𝙩𝙞-𝙘𝙤𝙣𝙩𝙖𝙩𝙤)Neste grupo 🎯"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o recurso de (𝙖𝙣𝙩𝙞-𝙘𝙤𝙣𝙩𝙖𝙩𝙤)Neste grupo 🎯",
          );
          break;

        case "dononogrupo":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.EstaNogrupo = !nescessario.EstaNogrupo;
          setNes(nescessario);
          reply(
            nescessario?.EstaNogrupo
              ? "🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nCom sucesso o recurso,agora o bot só vai funcionar se você estiverno grupo 😏"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o recurso,de o bot só funcionar quando você estiver no grupo 🥱",
          );
          break;

        case "antilinkhard":
        case "x9":
        case "antiloc":
        case "antiaudio":
        case "antivideo":
        case "antifake":
        case "antilink":
        case "antilinkgp":
        case "antisticker":
        case "antiimg":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            if (command === "antilink") {
              command = "antilinkhard";
            }
            dataGp[0][command] = !dataGp[0][command];
            setGp(dataGp);
            reply(
              dataGp[0][command]
                ? `🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nCom sucesso o recurso de *_(${command})_*Neste grupo 📛`
                : ` ❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o recurso de *_(${command})_*Neste grupo 📛`,
            );
          }
          break;

        case "antilink2": {
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          // Desativar antilink/antilinkhard se antilink2 for ativado (evitar conflito)
          const _al2Novo = !dataGp[0].antilink2;
          dataGp[0].antilink2 = _al2Novo;
          if (_al2Novo) {
            dataGp[0].antilinkhard = false;
            dataGp[0].antilinkgp = false;
          }
          setGp(dataGp);
          reply(
            _al2Novo
              ? `🔗 *Anti-Link 2 ATIVADO!*\n\n✅ Links enviados por membros serão *apagados* e os ADMs serão *notificados*.\n\n⚠️ O Anti-Link e Anti-Link GP foram desativados para evitar conflito.\n\n💡 Diferença: este modo *não remove* o membro, apenas apaga a mensagem e avisa os ADMs.`
              : `🔓 *Anti-Link 2 DESATIVADO!*\n\nMembros podem enviar links normalmente.`,
          );
          break;
        }

        case "advlink":
        case "advtlink":
        case "advtlinks":
        case "advlinks":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            dataGp[0].antilinkhard =
              !dataGp[0].advlink && !dataGp[0].antilinkhard
                ? true
                : dataGp[0].advlink && !dataGp[0].antilinkhard
                  ? false
                  : false;
            dataGp[0].advlink = !dataGp[0].advlink;
            setGp(dataGp);
            reply(
              dataGp[0]?.advlink
                ? "Foi ativado com sucesso, a função de avertir 3/3, quem enviar link, na terceira é removido"
                : "Função de adverter após um membro comum enviar link, foi desativada.",
            );
          }
          break;

        case "advlinkgp":
        case "advtlinkgp":
        case "advtlinksgp":
        case "advlinksgp":
          {
            if (Os_Returns(true, true, true).true)
              return reply(Os_Returns(true, true, true).txt);
            dataGp[0].antilinkgp =
              !dataGp[0].advlinkgp && !dataGp[0].antilinkgp
                ? true
                : dataGp[0].advlinkgp && !dataGp[0].antilinkgp
                  ? false
                  : false;
            dataGp[0].advlinkgp = !dataGp[0].advlinkgp;
            setGp(dataGp);
            reply(
              dataGp[0]?.advlinkgp
                ? "Foi ativado com sucesso, a função de avertir 3/3, quem enviar link de grupo, na terceira é removido"
                : "Função de adverter após um membro comum enviar link de grupo, foi desativada.",
            );
          }
          break;

        case "visualizarmsg":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.visualizarmsg = !nescessario.visualizarmsg;
          visualizarmsg = !nescessario.visualizarmsg;
          setNes(nescessario);
          reply(
            nescessario?.visualizarmsg
              ? "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nO recurso de (𝙫𝙞𝙨𝙪𝙖𝙡𝙞𝙯𝙖𝙧)Mensagens em grupos e privado 👁️👁️️️"
              : " 🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nO recurso de (𝙫𝙞𝙨𝙪𝙖𝙡𝙞𝙯𝙖𝙧)Mensagens em grupos e privado 👁️👁️",
          );
          break;

        case "gold":
        case "statusgold":
        case "statusgolds":
        case "golds":
        case "consultargold":
          if (!IS_sistemGold)
            return reply(
              `Só é possível utilizar este comando ativando o sistema de Golds\nExemplo: ${prefix}modogold 1`,
            );
          if (!isGroup) return reply(Res_SoGrupo);
          if (command == "consultargold") {
            ConsultarGold(IS_sistemGold, menc_os2);
          } else {
            var U_N = menc_os2 || sender;
            var Ch = dataGp[0].Chances;
            var Ch_ = Ch[Ch.findIndex((i) => i.id === U_N)];
            let Blue = "";
            let Devendo = "";
            let _mentionsArr = [U_N];
            Ch.forEach((a) => {
              if (JSON.stringify(a.ChanceR).includes(U_N)) {
                Blue += `│  ⚔️ @${a.id.split("@")[0]}\n`;
                _mentionsArr.push(a.id);
              }
            });
            rggold[ID_G_GOLD].usus.forEach(function (a, b) {
              if (a?.emp_G && JSON.stringify(a.emp_G).includes(U_N)) {
                Devendo += `│  💳 @${a.id.split("@")[0]} ─ ${a.emp_G[0].Golds}G\n`;
                _mentionsArr.push(a.id);
              }
            });
            var quiz = Ch_?.quiz?.find((i) => i)?.errou;
            var quiz2 = Ch_?.quiz?.find((i) => i)?.acertou;
            var FCLT_G = rggold[ID_G_GOLD].usus.find((i) => i.id === U_N);

            let _devendoTxt = "│  ✅ Ninguém";
            if (FCLT_G?.emp_G && FCLT_G?.emp_G.length > 0) {
              _devendoTxt = `│  💳 @${FCLT_G.emp_G[0].id.split("@")[0]} ─ ${FCLT_G.emp_G[0].Golds}G`;
              _mentionsArr.push(FCLT_G.emp_G[0].id);
            }

            let _statusTxt = `│
│  🪙 *STATUS GOLD*
├──────────────
│
│  👤 @${U_N.split("@")[0]}
│  💰 Saldo: *${FCLT_G?.Golds || 0}* Golds
│  🛡️ Escudo: ${Ch_?.Escudo?.length > 0 ? "✅ Ativo" : "❌ Sem"}
│
├── 🎮 *CHANCES DIÁRIAS* ──
│
│  ⛏️ Minerar: *${Ch_?.ChanceG || 0}*/3
│  ⚔️ Roubar: *${Ch_?.ChanceR?.length || 0}*/5
│  🎯 Vingança: *${Ch_?.Vinganca || 0}*/1
│  🎰 Cassino: *${Ch_?.cassino || 0}*/5
│  🎡 Roleta: ${Ch_?.roletadasorte ? "*1*/1" : "*0*/1"}
│  🔢 Quiz: *${!Ch_?.quiz?.length > 0
                ? "0"
                : quiz2 === 2
                  ? "2"
                  : quiz === 2
                    ? "2"
                    : quiz === 1 && quiz2 === 1
                      ? "1"
                      : quiz2 === 1 && quiz === 0
                        ? "1"
                        : quiz === 1 && quiz2 === 0
                          ? "1"
                          : "0"
              }*/2
│  🍺 Cachaça: *${Ch_?.Cachaca || 0}*/1
│  📊 Apostas: *${Ch_?.ChanceAp || 0}*/15
│
├── 💳 *DÍVIDAS* ──
│
│  📤 Devendo a:
${_devendoTxt}
│
│  📥 Te devem:
${Devendo || "│  ✅ Ninguém"}
│
│  📋 Te roubaram:
${Blue || "│  ✅ Ninguém"}
├──────────────
│  💡 *${prefix}menugold* ─ Ver comandos`;

            conn.sendMessage(
              from,
              {
                text: _statusTxt,
                mentions: _mentionsArr,
              },
              { quoted: info },
            );
          }
          break;

        case "zerarrankgold":
        case "zerarrankgolds":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!SoDono) return reply(Res_SoDono);
          rggold.splice(ID_G_GOLD, 1);
          Goldrgs(rggold);
          reply(
            `│\n│  🚨 *RANK ZERADO!*\n├──────────────\n│  🗑️ Todos os Golds e dados dos\n│  usuários foram resetados!\n│  _Começando do zero..._ 🔄`,
          );
          break;

        case "zerarrank":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!SoDono) return reply(Res_SoDono);
          countMessage.splice(
            countMessage.findIndex((i) => i.groupId === from),
            1,
          );
          fs.writeFileSync(
            "./dados/countmsg.json",
            JSON.stringify(countMessage, null, 2) + "\n",
          );
          reply(
            "Rank de mensagem ( Contador de mensagens ), foi zerada com sucesso desse grupo.",
          );
          break;

        case "rankgold":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `Este comando só pode ser utilizado quando o sistema ${prefix}modogold 1 está ativado.`,
            );
          await LIMPARDOCNT_QUEMJASAIU();
          var uss_ = rggold[ID_G_GOLD].usus;
          var groupMemberId = groupMembers.map((a) => a.id);
          uss_ = uss_.filter((i) => groupMemberId.includes(i.id));
          Goldrgs(rggold);
          galo = uss_.map((i) => i);
          rank = galo.sort((a, b) => (a.Golds < b.Golds ? 0 : -1));
          ment = [];
          {
            const _medalhas = [
              "🥇",
              "🥈",
              "🥉",
              "4️⃣",
              "5️⃣",
              "6️⃣",
              "7️⃣",
              "8️⃣",
              "9️⃣",
              "🔟",
            ];
            let _rankTxt = `│\n│  🏆 *RANKING DE GOLDS*\n├──────────────\n│\n`;
            const _rankMent = [];
            const _maxRank = Math.min(uss_.length, 10);
            for (let _ri = 0; _ri < _maxRank; _ri++) {
              if (rank[_ri]?.id) {
                const _rCh = dataGp[0]?.Chances;
                const _rCh_ =
                  _rCh[_rCh.findIndex((a) => a.id === rank[_ri].id)];
                // Resolver LID → número real
                let _rgJid = rank[_ri].id;
                let _rgNum = _rgJid.split("@")[0];
                if (_rgNum.length > 15 && groupMembers && groupMembers.length > 0) {
                  const _rgF = groupMembers.find(p => {
                    const pLid = (p.lid || "").split("@")[0];
                    const pId = (p.id || "").split("@")[0];
                    return pLid === _rgNum || pId === _rgNum;
                  });
                  if (_rgF && _rgF.id) {
                    const _rgReal = _rgF.id.split("@")[0];
                    if (_rgReal.length <= 15) {
                      _rgNum = _rgReal;
                      _rgJid = _rgReal + "@s.whatsapp.net";
                    }
                  }
                }
                _rankMent.push(_rgJid);
                _rankTxt += `│  ${_medalhas[_ri] || `${_ri + 1}º`} @${_rgNum}\n`;
                _rankTxt += `│  💰 *${rank[_ri]?.Golds || 0}*G`;
                _rankTxt += ` │ 🛡️ ${_rCh_?.Escudo?.length > 0 ? "✅" : "❌"}`;
                _rankTxt += ` │ ⛏️ ${_rCh_?.ChanceG || 0}/3\n│\n`;
              }
            }
            if (_maxRank === 0)
              _rankTxt += `│  _Nenhum participante ainda._\n│\n`;
            _rankTxt += `├──────────────\n│  📊 Total: *${uss_.length}* participante(s)`;
            conn.sendMessage(
              from,
              {
                text: _rankTxt,
                mentions: _rankMent,
              },
              { quoted: info },
            );
          }
          break;

        case "addgold":
        case "tirargold":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!IS_sistemGold)
            return reply(
              `│\n│  🚫 *SISTEMA DESATIVADO*\n├──────────────\n│  _O sistema Gold está desativado._`,
            );
          if (!menc_os2)
            return reply(
              `│\n│  ⚙️ *ADMIN GOLD*\n├──────────────\n│  ❌ *Faltou marcar o usuário!*\n│  👉 *Uso:* ${prefix + command} @usuario/100\n│  💡 *Ex:* ${prefix + command} @Membro/50`,
            );
          if (!SoDono) return reply(Res_SoDono);
          var [usu, qp] = q.trim().split("/");
          if (!q.trim().includes("/") || !Number(qp))
            return reply(
              `│\n│  ⚙️ *ADMIN GOLD*\n├──────────────\n│  ❌ *Formato inválido*\n│  👉 *Uso:* ${prefix + command} @usuario/valor\n│  💡 *Ex:* ${prefix + command} @Membro/50`,
            );
          if (command == "addgold") {
            AddGold(IS_sistemGold, Number(qp), menc_os2);
            reply(
              `│\n│  ✅ *GOLD ADICIONADO!*\n├──────────────\n│  💰 +${qp} Golds para @${menc_os2.split("@")[0]}`,
            );
          } else {
            TirarGold(IS_sistemGold, Number(qp), menc_os2);
            reply(
              `│\n│  ❌ *GOLD REMOVIDO!*\n├──────────────\n│  💸 -${qp} Golds de @${menc_os2.split("@")[0]}`,
            );
          }
          break;

        case "modogold":
        case "sistemgold":
        case "systemgold":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].sistemGold = !dataGp[0].sistemGold;
          setGp(dataGp);
          reply(
            dataGp[0]?.sistemGold
              ? `🪙 *Modo Gold ATIVADO!*\n\n💡 Use *${prefix}menugold* p/ ver comandos\n💡 Use *${prefix}infogold* p/ saber como funciona`
              : `❌ *Modo Gold DESATIVADO!*\n\nTodos os comandos gold ficam desabilitados.`,
          );
          break;

        // Aliases curtos redirecionam para os comandos principais com imagens (mais acima no switch)
        // "menugold" já é tratado lá em cima com imagem
        // "minerar" => use "minerar_gold"
        // "apostar" => use "apostargold"
        // "roubar" => use "roubargold"
        // "transferir" => use "doargold"
        // "cassino" já é tratado lá em cima com imagem
        // "roleta" => use "roletadasorte"

        case "x9visuunica":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].visuUnica = !dataGp[0].visuUnica;
          setGp(dataGp);
          reply(
            dataGp[0]?.visuUnica
              ? "🤫 𝘼𝙏𝙄𝙑𝙊𝙐 🤭, Nosso segredo! 🙆🏻‍♂️"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nXato 😜 Tu desativou o recurso de revelar (visu única) neste grupo 😂",
          );
          break;

        case "autobaixar":
        case "auto-baixar":
        case "auto-download":
        case "autodownload":
        case "auto-downloader":
        case "autodownloader":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].autobaixar = !dataGp[0].autobaixar;
          setGp(dataGp);

          const _imgAB = [
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=90",
            "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=90",
          ];
          const _rdAB = _imgAB[Math.floor(Math.random() * _imgAB.length)];

          const _abTxt = dataGp[0]?.autobaixar
            ? `│\n│  📥 *AUTO DOWNLOAD ATIVADO*\n├──────────────\n│\n│  ✅ Agora o bot baixa automaticamente:\n│\n│  🎵 TikTok │ 📸 Instagram\n│  🐦 Twitter/X │ 📘 Facebook\n│  🎶 Spotify │ 🎬 Kwai\n│  🎥 YouTube Shorts\n│  🎙️ Transcrição de áudio\n│\n├──────────────\n│  _Basta enviar o link no grupo!_`
            : `│\n│  📥 *AUTO DOWNLOAD DESATIVADO*\n├──────────────\n│\n│  ❌ O download automático foi desligado.\n│  _Use o comando novamente para reativar._`;

          try {
            await conn.sendMessage(from, {
              react: {
                text: dataGp[0]?.autobaixar ? "✅" : "❌",
                key: info.key,
              },
            });
            await conn.sendMessage(
              from,
              {
                image: { url: _rdAB },
                caption: _abTxt,
                mentions: [sender],
              },
              { quoted: info },
            );
          } catch {
            reply(_abTxt);
          }
          break;

        case "so_adm":
        case "so-adm":
        case "soadm":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (args.length < 1) return reply("1 pra ligar / 0 pra desligar 🥱");
          if (Number(args[0]) === 1) {
            if (So_Adm) return reply("Ja esta ativo 😼");
            dataGp[0].soadm = true;
            setGp(dataGp);
            reply(" - Agora somente os Admiros vão usar os comandos do Bot 😝");
          } else if (Number(args[0]) === 0) {
            if (!So_Adm) return reply("Ja esta Desativado 😼");
            dataGp[0].soadm = false;
            setGp(dataGp);
            reply(
              "‼️ Pronto seus chorões agora vocês podem utilizar os meus comandos 🥱️",
            );
          } else {
            reply("1 para ativar, 0 para desativar 🥱");
          }
          break;

        case "odelete":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!SoDono) return reply(Res_SoDono);
          if (!isBotGroupAdmins) return reply(Res_BotADM);
          if (args.length < 1) return reply("1 pra ligar / 0 pra desligar 🥱");
          if (Number(args[0]) === 1) {
            if (IS_DELETE) return reply("Ja esta ativo 😼");
            nescessario.Odelete = true;
            setNes(nescessario);
            reply(
              "📛 𝘼𝙏𝙄𝙑𝙊𝙐 📛\nCom sucesso o recurso de delete nos grupos ⚠️💫",
            );
          } else if (Number(args[0]) === 0) {
            if (!IS_DELETE) return reply("Ja esta Desativado 😼");
            nescessario.Odelete = false;
            setNes(nescessario);
            reply(
              "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o recurso de delete nos grupos 🎯️",
            );
          } else {
            reply("1 para ativar, 0 para desativar 🥱");
          }
          break;

        case "prefixos":
          if (!isGroup) return reply(Res_SoGrupo);
          if (dataGp[0].prefixos.length < 1)
            return reply(
              "Não contem nenhum prefixo a + adicionado neste grupo.",
            );
          bla = `Lista de prefixos para uso do bot, no Grupo: ${groupName}\n\n`;
          for (i of dataGp[0].prefixos) {
            bla += `Prefixo: ${i}\n\n`;
          }
          reply(bla);
          break;

        case "add_prefixo":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!isMultiP)
            return reply(
              `Para usar este comando, você deve ativar o comando, multiprefix\nExemplo: ${prefix}multiprefixo 1`,
            );
          if (ANT_LTR_MD_EMJ(q))
            return reply("Não pode letra modificada, nem emoji..");
          if (!q.trim())
            return reply("Determine o novo prefixo, não pode espaço vazio...");
          if (q.trim() > 1)
            return reply(
              `Calma, o prefixo só pode ser um\nExemplo: ${prefix + command
              } _\nAe o bot vai passar á responder _ como prefixo do bot..`,
            );
          if (dataGp[0].prefixos.indexOf(q.trim()) >= 0)
            return reply(
              `Esse prefixo já se encontra incluso, procure ver na lista dos prefixos\nExemplo: ${prefix}prefixos`,
            );
          dataGp[0].prefixos.push(q.trim());
          setGp(dataGp);
          reply(
            `Prefixo ${q.trim()} Adicionado com sucesso na lista de prefixos para uso do bot, neste grupo...`,
          );
          break;

        case "tirar_prefixo":
        case "rm_prefixo":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!isMultiP)
            return reply(
              `Para usar este comando, você deve ativar o comando, multiprefix\nExemplo: ${prefix}multiprefixo 1`,
            );
          if (ANT_LTR_MD_EMJ(q))
            return reply("Não pode letra modificada, nem emoji..");
          if (!q.trim())
            return reply(
              "Determine o prefixo que deseja tirar, não pode espaço vazio...",
            );
          if (q.trim() > 1)
            return reply(
              `Calma, o prefixo só pode ser tirado um por vez\nExemplo: ${prefix + command
              } _\nAe o bot não vai responder mais com _`,
            );
          if (dataGp[0].prefixos.indexOf(q.trim()) < 0)
            return reply(
              `Esse prefixo não está incluso, procure ver na lista dos prefixos\nExemplo: ${prefix}prefixos`,
            );
          if (dataGp[0].prefixos.length == 1)
            return reply(
              "Adicione um prefixo para pode tirar este, tem que ter pelo menos 1 prefixo já incluso dentro do sistema para tirar outro.",
            );
          dataGp[0].prefixos.splice(dataGp[0].prefixos.indexOf(q.trim()), 1);
          setGp(dataGp);
          reply(
            `Prefixo ${q.trim()} tirado com sucesso da lista de prefixos de uso deste grupo..`,
          );
          break;

        case "multiprefixo":
        case "multiprefix":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins && !SoDono) return reply(Res_SoAdm);
          if (!isMultiP) {
            dataGp[0].multiprefix = true;
            setGp(dataGp);
            reply(
              "🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nCom sucesso o recurso de\n(𝙈𝙐𝙇𝙏𝙄 - 𝙋𝙍𝙀𝙁𝙄𝙓𝙊𝙎) 😏❗",
            );
          }
          if (isMultiP) {
            dataGp[0].multiprefix = false;
            setGp(dataGp);
            reply(
              "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o recurso de\n(𝙈𝙐𝙇𝙏𝙄 - 𝙋𝙍𝙀𝙁𝙄𝙓𝙊𝙎) 😏❗️",
            );
          }
          break;

        case "anticatalogo":
        case "anticatalg":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].anticatalogo = !dataGp[0].anticatalogo;
          setGp(dataGp);
          reply(
            dataGp[0]?.anticatalogo
              ? "🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nCom sucesso o recurso de (𝙖𝙣𝙩𝙞-𝙘𝙖𝙩𝙖𝙡𝙤𝙜𝙤)Neste grupo 📝"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o recurso de (𝙖𝙣𝙩𝙞-𝙘𝙖𝙩𝙖𝙡𝙤𝙜𝙤)Neste grupo 📝",
          );
          break;

        case "bemvindo":
        case "bemvindo1":
        case "welcon1":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!SoDono) return reply(Res_SoDono);
          dataGp[0].wellcome[0].bemvindo1 = !dataGp[0].wellcome[0].bemvindo1;
          setGp(dataGp);
          reply(
            dataGp[0]["wellcome"][0]["bemvindo1"]
              ? "📛 𝘼𝙏𝙄𝙑𝙊𝙐 📛\nCom sucesso o (𝙗𝙚𝙢-𝙫𝙞𝙣𝙙𝙤❶) 🎉"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o (𝙗𝙚𝙢-𝙫𝙞𝙣-𝙙𝙤❶) 🥱",
          );
          break;

        case "saiu":
        case "saiu1":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!SoDono) return reply(Res_SoDono);
          dataGp[0].wellcome[0].saiu1 = !dataGp[0].wellcome[0].saiu1;
          setGp(dataGp);
          reply(
            dataGp[0]["wellcome"][0]["saiu1"]
              ? "📛 𝘼𝙏𝙄𝙑𝙊𝙐 📛\nCom sucesso a (𝙨𝙖𝙞́𝙙𝙖❶) 🎉"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso a (𝙨𝙖𝙞́𝙙𝙖❶) 🥱",
          );
          break;

        case "bemvindo2":
        case "bemvindo2":
        case "welcon2":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!SoDono) return reply(Res_SoDono);
          dataGp[0].wellcome[1].bemvindo2 = !dataGp[0].wellcome[1].bemvindo2;
          setGp(dataGp);
          reply(
            dataGp[0]["wellcome"][1]["bemvindo2"]
              ? "📛 𝐀𝐓𝐈𝐕𝐎𝐔 📛\nCom sucesso o (𝐃𝐞𝐦-𝐯𝐢𝐧𝐝𝐨❷) 🎉"
              : "❌𝐃𝐄𝐒𝐀𝐓𝐈𝐕𝐎𝐔❌\nCom sucesso o (𝐃𝐞𝐦-𝐯𝐢𝐧𝐝𝐨❷) 🥱",
          );
          break;

        case "saiu2":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!SoDono) return reply(Res_SoDono);
          dataGp[0].wellcome[1].saiu2 = !dataGp[0].wellcome[1].saiu2;
          setGp(dataGp);
          reply(
            dataGp[0]["wellcome"][1]["saiu2"]
              ? "📛 𝐀𝐓𝐈𝐕𝐎𝐔 📛\nCom sucesso a (𝐬𝐚𝐢́𝐝𝐚❷) 🎉"
              : "❌𝐃𝐄𝐒𝐀𝐓𝐈𝐕𝐎𝐔❌\nCom sucesso a (𝐬𝐚𝐢́𝐝𝐚❷) 🥱",
          );
          break;

        case "legendabv":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim()) return reply("*Escreva a mensagem de boas-vindas 😏*");
          dataGp[0].wellcome[0].legendabv = q.trim();
          setGp(dataGp);
          reply("📛 Mensagem de (𝙗𝙤𝙖𝙨 𝙫𝙞𝙣𝙙𝙖𝙨❶) Definida com sucesso 📛");
          break;

        case "legendasaiu":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim()) return reply("*Escreva a mensagem de saída 😏*");
          dataGp[0].wellcome[0].legendasaiu = q.trim();
          setGp(dataGp);
          reply("👾 Mensagem de ( 𝙨𝙖𝙞́𝙙𝙖❶ ) Definida com sucesso 👾");
          break;

        case "legendabv2":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim()) return reply("*Escreva a mensagem de boas-vindas 😏*");
          dataGp[0].wellcome[1].legendabv = q.trim();
          setGp(dataGp);
          reply("📛 Mensagem de (𝐃𝐨𝐚𝐬 𝐯𝐢𝐧𝐝𝐚𝐬❷) Definida com sucesso 📛");
          break;

        case "legendasaiu2":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim()) return reply("*Escreva a mensagem de saída 😏*");
          dataGp[0].wellcome[1].legendasaiu = q.trim();
          setGp(dataGp);
          reply("🎗️👾 Mensagem de ( 𝐬𝐚𝐢́𝐝𝐚❷ ) Definida com sucesso 👾🎗");
          break;

        case "infobemvindo":
        case "infobv":
        case "infowelcome":
          {
            if (!isGroup) return reply(Res_SoGrupo);

            const _bv1 = dataGp[0]?.wellcome?.[0] || {};
            const _bv2 = dataGp[0]?.wellcome?.[1] || {};

            const _infoBvTxt = `╭━━━━━━━━━━━━━━━━━━╮
┃  👋 *GUIA: BEM-VINDO / SAIU*
╰━━━━━━━━━━━━━━━━━━╯

Quando alguém *entra* ou *sai* do grupo,
o bot envia uma mensagem automática
com texto e imagem personalizáveis.

╭──── 📊 *STATUS ATUAL* ────╮

│ 👋 Bemvindo 1: ${_bv1.bemvindo1 ? "✅ Ativo" : "❌ Desativado"}
│ 👋 Bemvindo 2: ${_bv2.bemvindo2 ? "✅ Ativo" : "❌ Desativado"}
│ 🚪 Saiu 1: ${_bv1.saiu1 ? "✅ Ativo" : "❌ Desativado"}
│ 🚪 Saiu 2: ${_bv2.saiu2 ? "✅ Ativo" : "❌ Desativado"}
│ 🖼️ Fundo BV: ${_bv1.fundo ? "✅ Definido" : "❌ Padrão"}
│ 🖼️ Fundo Saiu: ${_bv1.fundo_saiu ? "✅ Definido" : "❌ Padrão"}

╰────────────────────╯

╭──── 💬 *MENSAGENS ATUAIS* ────╮

│ 📝 *Legenda BV 1:*
│ _${_bv1.legendabv || "Não definida"}_
│
│ 📝 *Legenda Saiu 1:*
│ _${_bv1.legendasaiu || "Não definida"}_
│
│ 📝 *Legenda BV 2:*
│ _${_bv2.legendabv || "Não definida"}_
│
│ 📝 *Legenda Saiu 2:*
│ _${_bv2.legendasaiu || "Não definida"}_

╰────────────────────╯

╭──── ⚙️ *COMANDOS* ────╮

│ *Ativar/Desativar:*
│ ▸ ${prefix}bemvindo — Liga/desliga BV 1
│ ▸ ${prefix}bemvindo2 — Liga/desliga BV 2
│ ▸ ${prefix}saiu — Liga/desliga Saiu 1
│ ▸ ${prefix}saiu2 — Liga/desliga Saiu 2
│
│ *Personalizar Mensagens:*
│ ▸ ${prefix}legendabv texto — Msg entrada 1
│ ▸ ${prefix}legendabv2 texto — Msg entrada 2
│ ▸ ${prefix}legendasaiu texto — Msg saída 1
│ ▸ ${prefix}legendasaiu2 texto — Msg saída 2
│
│ *Imagens de Fundo:*
│ ▸ ${prefix}fundobv — Marque uma foto
│ ▸ ${prefix}fundosaiu — Marque uma foto

╰────────────────────╯

╭──── 🏷️ *PLACEHOLDERS* ────╮

│ Use nas legendas para dados dinâmicos:
│
│ *#numerodele#* — Menciona o membro
│ _Ex: Bem-vindo #numerodele#!_

╰────────────────────╯

╭──── 💡 *EXEMPLOS* ────╮

│ ${prefix}legendabv Olá #numerodele#!
│ Seja bem-vindo ao grupo! 🎉
│ Leia as regras e participe!
│
│ ${prefix}legendasaiu Tchau #numerodele#!
│ Foi bom ter você aqui 👋

╰────────────────────╯

╭──── ℹ️ *DICAS* ────╮

│ 💡 BV 1 e BV 2 são independentes
│ 💡 Ative apenas um para evitar
│ mensagens duplicadas
│ 💡 A imagem de fundo é opcional
│ 💡 Apenas o *dono* pode configurar
│ 💡 Funciona automático ao entrar/sair

╰────────────────────╯

📡 *${NomeDoBot}*`;

            try {
              await conn.sendMessage(from, { react: { text: "👋", key: info.key } });
            } catch { }
            reply(_infoBvTxt);
          }
          break;

        case "legenda_estrangeiro":
        case "legenda_estrangeiros":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply("*Escreva a mensagem de remoção de estrangeiros 😏*");
          if (isAntifake) {
            dataGp[0].legenda_estrangeiro = q.trim();
            setGp(dataGp);
            reply(
              "*Mensagem de remoção de estrangeiros definida com sucesso 🥱*",
            );
          } else {
            reply(`Ative o antifake primeiro ${prefix}antifake 🥱`);
          }
          break;

        case "legenda_listanegra":
        case "legenda_listban":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply(
              "*Escreva a mensagem de remoção de usuários que estiver na lista negra*",
            );
          dataGp[0].legenda_listanegra = q.trim();
          setGp(dataGp);
          reply(
            "*Mensagem de remoção de usuários que se encontra na lista negra definida com sucesso!*",
          );
          break;

        case "legenda_video":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply("*Escreva a mensagem de remoção de estrangeiros*");
          dataGp[0].legenda_video = q.trim();
          setGp(dataGp);
          reply("*Mensagem de remoção de video definida com sucesso!*");
          break;

        case "legenda_imagem":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply("*Escreva a mensagem de remoção de estrangeiros*");
          dataGp[0].legenda_imagem = q.trim();
          setGp(dataGp);
          reply("*Mensagem de remoção de imagem definida com sucesso!*");
          break;

        case "legenda_documento":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          if (!q.trim())
            return reply("*Escreva a mensagem de remoção de estrangeiros*");
          dataGp[0].legenda_documento = q.trim();
          setGp(dataGp);
          reply("*Mensagem de remoção de Documento definida com sucesso!*");
          break;

        case "autobang":
        case "listanegrag":
          if (!SoDono) return reply(Res_SoDono);
          if (!mrc_ou_numero)
            return reply(
              "Marque a mensagem do lixo com o comando!Então utilize o comando com o número do lixo que deseja adicionar na Lista Global 🚯",
            );
          // Corrigido para Baileys 7.0+ - compatibilidade com LID
          if (isJidInList(mrc_ou_numero, listanegraG))
            return reply(
              "𝘀𝘴𝘵𝘦 𝘪𝘯𝘶́𝘵𝘪𝘭 𝘫𝘢 𝘦𝘴𝘵𝘢 𝘪𝘯𝘤𝘭𝘶𝘴𝘰 𝘯𝘢 𝘛𝘐𝘎𝘛𝘼_𝘂𝘛𝘖𝘉𝘼𝘛,𝘴𝘦 𝘦𝘭𝘦 𝘥𝘢 𝘢𝘴 𝘤𝘢𝘳𝘢𝘴 𝘦𝘮 𝘲𝘶𝘢𝘭𝘲𝘶𝘦𝘳 𝘨𝘳𝘶𝘱𝘰 𝘲𝘶𝘦 𝘦𝘶 𝘦𝘴𝘵𝘪𝘫𝘦𝘳 𝘪𝘳𝘦𝘪 𝘱𝘢𝘴𝘴𝘢𝘳 𝘢 𝘧𝘢𝘤𝘢 𝘴𝘦𝘮 𝘥𝘰́ 𝘦 𝘴𝘦𝘮 𝘱𝘪𝘦𝘥𝘢𝘥𝘦 🥱",
            );
          // Adicionar usando função que normaliza o JID
          addJidToList(mrc_ou_numero, listanegraG);
          fs.writeFileSync(
            "./dono/nescessario.json",
            JSON.stringify(nescessario, null, "\t"),
          );
          reply(
            `𝘐𝘦𝘴𝘵𝘳𝘦 𝘱𝘰𝘳 𝘴𝘶𝘢𝘴 𝘰𝘳𝘥𝘦𝘯𝘴 𝘦𝘶 𝘢𝘥𝘪𝘤𝘪𝘰𝘯𝘦𝘪 𝘯𝘢 ❮𝘛𝘐𝘎𝘛𝘼_𝘂𝘛𝘖𝘉𝘼𝘛❯ 𝘎𝘦 𝘦𝘭𝘦 𝘥𝘢 𝘢𝘴 𝘤𝘢𝘳𝘢𝘴 𝘦𝘮 𝘯𝘰𝘴𝘴𝘰𝘴 𝘨𝘳𝘶𝘱𝘰𝘴, 𝘫𝘰𝘶 𝘱𝘢𝘴𝘴𝘢 𝘢 𝘧𝘢𝘤𝘢 😏`,
          );
          break;

        case "tirardalistag":
          if (!SoDono) return reply(Res_SoDono);
          if (!mrc_ou_numero)
            return reply(
              "𝘐𝘢𝘳𝘲𝘶𝘦 𝘢 𝘮𝘦𝘯𝘴𝘢𝘨𝘦𝘮 𝘥𝘰 𝘪𝘥𝘪𝘰𝘵𝘢 𝘤𝘰𝘮 𝘰 𝘤𝘰𝘮𝘢𝘯𝘥𝘰!𝘀𝘯𝘵𝘢̃𝘰 𝘶𝘵𝘪𝘭𝘪𝘻𝘦 𝘰 𝘤𝘰𝘮𝘢𝘯𝘥𝘰 𝘤𝘰𝘮 𝘰 𝘯𝘶́𝘮𝘦𝘳𝘰 𝘥𝘰 𝘵𝘳𝘰𝘶𝘹𝘢 𝘲𝘶𝘦 𝘥𝘦𝘴𝘦𝘫𝘢 𝘵𝘪𝘳𝘢𝘳 𝘥𝘢 𝘛𝘐𝘎𝘛𝘼 𝘂𝘛𝘖𝘉𝘼𝘛 😒",
            );
          // Corrigido para Baileys 7.0+ - compatibilidade com LID
          if (!isJidInList(mrc_ou_numero, listanegraG))
            return reply("𝘀𝘴𝘵𝘦 𝘭𝘪𝘹𝘰 𝘯𝘢̃𝘰 𝘦𝘴𝘵𝘢 𝘪𝘯𝘤𝘭𝘶𝘴𝘰 🥱");
          // Remover usando função que normaliza o JID
          nescessario.listanegraG = removeJidFromList(
            mrc_ou_numero,
            listanegraG,
          );
          fs.writeFileSync(
            "./dono/nescessario.json",
            JSON.stringify(nescessario, null, "\t"),
          );
          reply(
            `𝘛𝘢𝘨𝘢𝘣𝘢 𝘵𝘪𝘳𝘢𝘥𝘰 𝘥𝘢 𝘭𝘪𝘴𝘵𝘢 𝘥𝘰𝘴 𝘪𝘯𝘶́𝘵𝘦𝘪𝘴, 𝘢𝘨𝘰𝘳𝘢 𝘱𝘰𝘥𝘦 𝘦𝘯𝘵𝘳𝘢𝘳 𝘦𝘮 𝘲𝘶𝘢𝘭𝘲𝘶𝘦𝘳 𝘨𝘳𝘶𝘱𝘰 𝘲𝘶𝘦 𝘦𝘶 𝘦𝘴𝘵𝘪𝘫𝘦𝘳.𝘕𝘢̃𝘰 𝘫𝘰𝘶 𝘦𝘭𝘪𝘮𝘪𝘯𝘢𝘳 𝘦𝘴𝘴𝘦 𝘭𝘪𝘹𝘰 𝘱𝘰𝘳 𝘰𝘳𝘥𝘦𝘮 𝘥𝘰 𝘮𝘦𝘶 𝘥𝘰𝘯𝘰,𝘐𝘰𝘴𝘤𝘢 𝘛𝘪́𝘳𝘶𝘴 😾`,
          );
          break;

        case "token_gpt":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.TOKEN_GPT = q.trim();
          setNes(nescessario);
          reply(
            "Token registrado com sucesso para o Chat Gpt, bom uso amigo(a)..",
          );
          break;

        case "crimg":
        case "superimg":
        case "imgcr":
          if (TOKEN_GPT === 0)
            return mention(`Olá @${numerodono_ofc} tá faltando o
token do gpt, vai no site: https://platform.openai.com/account/api-keys gera a
key, ou manda alguma pessoa criar.. e usa o comando ${prefix}token_gpt e o token
aqui, boa sorte..`);
          try {
            reply("Realizando pedido..");
            conn
              .sendMessage(
                from,
                {
                  image: {
                    url: reqapi.superimg(q.trim(), nescessario.TOKEN_GPT),
                  },
                },
                { quoted: info },
              )
              .catch(() => {
                return reply("Erro... 🥱");
              });
          } catch {
            return reply("Erro... 🥱");
          }
          break;

        case "pergunta":
        case "openai":
        case "gpt":
        case "chatgpt":
          try {
            if (!q.trim())
              return reply(
                `Faça uma pergunta, exemplo: ${prefix + command
                } Quantos anos para o plástico se decompor.`,
              );
            reply(
              "Aguarde, criando / pesquisando sobre o que esta perguntando ou pedindo.",
            );
            ABC = await reqapi.gpt(q.trim(), nescessario.TOKEN_GPT);
            reply(`( ${ABC.msg} )`);
          } catch {
            reply("Erro... 🥱");
          }
          break;

        case "gerarimagem":
        case "gerarimg":
        case "imagemia":
        case "aiimage":
        case "imgai":
        case "criarimagem": {
          try {
            if (!q.trim())
              return reply(
                `🎨 *Gerador de Imagens com IA*\n\n` +
                `Use: ${prefix + command} <descrição da imagem>\n\n` +
                `📌 *Exemplos:*\n` +
                `• ${prefix + command} um gato fofo usando óculos\n` +
                `• ${prefix + command} paisagem cyberpunk neon\n` +
                `• ${prefix + command} dragão de fogo realista\n\n` +
                `💡 Quanto mais detalhada a descrição, melhor o resultado!`,
              );

            // Cooldown de 30s por usuário
            if (!global._imgCooldown) global._imgCooldown = new Map();
            var _iLast = global._imgCooldown.get(sender) || 0;
            var _iWait = Math.ceil((30000 - (Date.now() - _iLast)) / 1000);
            if (_iWait > 0) return reply(`⏳ Aguarde ${_iWait}s antes de gerar outra imagem.`);
            global._imgCooldown.set(sender, Date.now());

            await reply("🎨 *Gerando sua imagem com IA...*\n⏳ Aguarde até 60 segundos.");

            // Montar URL com seed única
            var _iUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(q.trim())}?width=512&height=512&nologo=true&seed=${Date.now()}`;

            // Download com timeout FORÇADO de 60s (nunca trava)
            var _iBuf = await Promise.race([
              axios.get(_iUrl, {
                responseType: "arraybuffer",
                timeout: 60000,
                maxRedirects: 10,
                headers: { "User-Agent": "AleatoryBot/8.5" },
              }).then(r => Buffer.from(r.data)),
              new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout 60s")), 65000)),
            ]);

            if (!_iBuf || _iBuf.length < 500) {
              global._imgCooldown.delete(sender);
              return reply("❌ Imagem vazia. Tente novamente.");
            }

            await conn.sendMessage(from, {
              image: _iBuf,
              caption: `🎨 *Imagem gerada com IA*\n\n📝 *Prompt:* ${q.trim().substring(0, 200)}\n⚡ *Aleatory Bot*`,
              mimetype: "image/jpeg",
            }, { quoted: info });

          } catch (e) {
            console.log("[GERARIMAGEM] Erro:", e?.message || e);
            global._imgCooldown && global._imgCooldown.delete(sender);
            reply("❌ Erro ao gerar imagem. Tente novamente em 30s.\n💡 Dica: descrições em inglês funcionam melhor.");
          }
          break;
        }

        case "simi":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!q)
            return reply(
              "Envie uma mensagem junto com o comando! Ex: !simi oi tudo bem",
            );
          try {
            // Primeiro: buscar no banco local simi.json
            const { response: simiResponse } = require("./simi.js");
            let resposta = simiResponse(q);

            // Fallback: tentar API SimSimi se não encontrou local
            if (!resposta) {
              try {
                const body = "text=" + encodeURIComponent(q) + "&lc=pt";
                datasimi = await fetchJson(
                  `https://api.simsimi.vn/v1/simtalk`,
                  {
                    method: "POST",
                    headers: {
                      "content-type": "application/x-www-form-urlencoded",
                      "Content-Length": Buffer.byteLength(body).toString(),
                    },
                    body: body,
                  },
                );
                if (
                  datasimi.message &&
                  datasimi.message !== "Required parameter is not present"
                ) {
                  resposta = datasimi.message;
                }
              } catch (e) { }
            }

            if (resposta) {
              return reply(resposta);
            } else {
              return reply(
                "Não encontrei uma resposta para isso.. 🤔 Tente outra frase!",
              );
            }
          } catch (e) {
            return reply("Resposta não encontrada.. 🥱");
          }
          break;

        case "simih2":
          if (!isGroupAdmins) return reply(Res_SoGrupo);
          if (args.length < 1) return reply(`𝙁𝙤𝙙𝙖-𝙨𝙚 🥱`);
          if (Number(args[0]) === 1) {
            if (isSimi2) return reply("𝙁𝙤𝙙𝙖-𝙨𝙚 🥱");
            dataGp[0].simi2 = true;
            await setGp(dataGp);
            await reply("🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\n𝙊(< 𝙎𝙞𝙢𝙞𝙝❷ >)Neste Grupo 😈");
          } else if (Number(args[0]) === 0) {
            if (!isSimi2) return reply("𝙁𝙤𝙙𝙖-𝙨𝙚 🥱");
            dataGp[0].simi2 = false;
            await setGp(dataGp);
            await reply("❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\n𝙏𝙪 𝙙𝙚𝙨𝙖𝙩𝙞𝙫𝙤𝙪 𝙢𝙤𝙙𝙤 𝙎𝙞𝙢𝙞𝙝❷ 𝙥𝙤𝙧𝙦𝙪𝙚?🖕🏿😡️");
          } else {
            reply("𝙁𝙤𝙙𝙖-𝙨𝙚 🥱");
          }
          break;

        case "simih":
          if (!isGroupAdmins) return reply(Res_SoAdm);
          dataGp[0].simi1 = !dataGp[0].simi1;
          setGp(dataGp);
          reply(
            dataGp[0]?.simi1
              ? "🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\n𝙊(< 𝙎𝙞𝙢𝙞𝙝 >)Neste Grupo 😈"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\n𝙏𝙪 𝙙𝙚𝙨𝙖𝙩𝙞𝙫𝙤𝙪 𝙢𝙤𝙙𝙤 𝙎𝙞𝙢𝙞𝙝 𝙥𝙤𝙧𝙦𝙪𝙚?🖕🏿😡",
          );
          break;

        case "iaaleatory":
        case "ialeatory":
        case "iabot": {
          if (!isGroup) {
            return reply("ℹ️ A IA do Aleatory já funciona automaticamente no privado!\n\n💡 Basta me chamar pelo nome: *Aleatory*");
          }
          if (!isGroupAdmins) return reply(Res_SoAdm);
          if (!dataGp[0].hasOwnProperty("iaAleatory")) dataGp[0].iaAleatory = false;
          dataGp[0].iaAleatory = !dataGp[0].iaAleatory;
          setGp(dataGp);
          reply(
            dataGp[0].iaAleatory
              ? `🤖 *IA ALEATORY ATIVADA!* ✅\n\n` +
              `Agora me chame pelo nome no grupo:\n` +
              `💬 *"Aleatory, o que é JavaScript?"*\n` +
              `💬 *"Ei Aleatory, me conta uma piada"*\n\n` +
              `⚡ Powered by Aleatory AI`
              : `🤖 *IA ALEATORY DESATIVADA* ❌\n\n` +
              `Não responderei mais a menções\n` +
              `do meu nome neste grupo.`
          );
          break;
        }

        case "autofigu":
        case "autosticker":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].autosticker = !dataGp[0].autosticker;
          setGp(dataGp);
          reply(
            dataGp[0]?.autosticker
              ? "♻️ 𝘼𝙏𝙄𝙑𝙊𝙐 ♻️\nCom sucesso𝙖𝙪𝙩𝙤-𝙛𝙞𝙜𝙪𝙧𝙞𝙣𝙝𝙖𝙨,Neste grupo 📸"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o 𝙖𝙪𝙩𝙤-𝙛𝙞𝙜𝙪𝙧𝙞𝙣𝙝𝙖𝙨Neste grupo 📸",
          );
          break;

        case "autoresposta":
        case "ativar":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].autoresposta = !dataGp[0].autoresposta;
          setGp(dataGp);
          reply(
            dataGp[0]?.autoresposta
              ? "🌀> AUTO RESPOSTA DO 𝗕𝗢𝗧-𝗔𝗧𝗜𝗩𝗔𝗗𝗢>🌀"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nAHHH!!Agora eu não vou mais participar do grupo 😭",
          );
          break;

        case "modobrincadeira":
        case "modobrincadeiras":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].jogos = !dataGp[0].jogos;
          setGp(dataGp);
          reply(
            dataGp[0]?.jogos
              ? "🎯🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\n🌈Com sucesso o recurso de 𝙢𝙤𝙙𝙤 𝙗𝙧𝙞𝙣𝙘𝙖𝙙𝙚𝙞𝙧𝙖...Neste grupo 🤹🏻‍♂️🪀"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\n🌈Com sucesso o recurso de 𝙢𝙤𝙙𝙤 𝙗𝙧𝙞𝙣𝙘𝙖𝙙𝙚𝙞𝙧𝙖...Neste grupo 🤹🏻‍♂️🪀",
          );
          break;

        case "bangp":
        case "unbangp":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!SoDono) return reply(Res_SoDono);
          if (command == "bangp") {
            if (isBanchat) return reply(`Este grupo ja está banido`);
            dataGp[0].bangp = true;
            setGp(dataGp);
            reply(`Grupo banido com sucesso`);
          } else {
            if (!isBanchat) return reply(`Este grupo não está mais banido`);
            dataGp[0].bangp = false;
            setGp(dataGp);
            reply(`Grupo desbanido...`);
          }
          break;

        case "boton":
        case "botoff":
          if (!SoDono) return reply(Res_SoDono);
          nescessario.botoff = !nescessario.botoff;
          setNes(nescessario);
          reply(
            nescessario?.botoff
              ? "Desativando funções e parando a execução de comandos por membros com sucesso..."
              : `Ativando todos os funcionamentos do bot novamente...`,
          );
          break;

        case "limpartudo":
        case "limparcache":
        case "cleancache":
          if (!SoDono) return reply(Res_SoDono);
          try {
            await reply(
              `🧹 *LIMPEZA DE CACHE DO BOT*\n\n` +
              `⚙️ Removendo arquivos temporários\n` +
              `do servidor para melhorar o\n` +
              `desempenho do bot...\n` +
              `⏳ Aguarde alguns segundos.`
            );

            const _pth = require("path");
            const _authDir = _pth.join(process.cwd(), "dados", "ALEATORY-QR");
            let _preKeys = 0, _sessions = 0, _senderKeys = 0, _appSync = 0, _tmpFiles = 0;
            let _totalSize = 0;

            // ═══ 1. LIMPAR PRE-KEYS E SENDER-KEYS (regeneram automaticamente) ═══
            // ⚠️ NÃO deletar session-* nem app-state-sync-* (causam desconexão!)
            try {
              const _files = fs.readdirSync(_authDir);
              for (const f of _files) {
                // PROTEGER: creds, backup, sessions e app-state (essenciais para conexão)
                if (f === "creds.json" || f === "creds.backup.json") continue;
                if (f.startsWith("session-")) continue;       // ← PROTEGIDO
                if (f.startsWith("app-state-sync")) continue; // ← PROTEGIDO

                const fp = _pth.join(_authDir, f);
                try {
                  const stat = fs.statSync(fp);
                  if (stat.isDirectory()) continue;

                  if (f.startsWith("pre-key-")) {
                    _totalSize += stat.size;
                    fs.unlinkSync(fp);
                    _preKeys++;
                  } else if (f.startsWith("sender-key-")) {
                    _totalSize += stat.size;
                    fs.unlinkSync(fp);
                    _senderKeys++;
                  }
                } catch { }
              }
            } catch (e) {
              console.log("[LIMPEZA] Erro auth dir:", e.message);
            }

            // ═══ 2. LIMPAR PASTA TMP ═══
            try {
              const _tmpDir = _pth.join(process.cwd(), "tmp");
              if (fs.existsSync(_tmpDir)) {
                for (const f of fs.readdirSync(_tmpDir)) {
                  try {
                    const fp = _pth.join(_tmpDir, f);
                    _totalSize += fs.statSync(fp).size;
                    fs.unlinkSync(fp);
                    _tmpFiles++;
                  } catch { }
                }
              }
            } catch { }

            // ═══ 3. LIMPAR MEMÓRIA (garbage collector) ═══
            let _memBefore = 0, _memAfter = 0;
            try {
              _memBefore = process.memoryUsage().heapUsed;
              if (global.gc) global.gc();
              _memAfter = process.memoryUsage().heapUsed;
            } catch { }

            // ═══ RELATÓRIO ═══
            const _totalArquivos = _preKeys + _sessions + _senderKeys + _appSync + _tmpFiles;
            const _sizeMB = (_totalSize / 1024 / 1024).toFixed(2);
            const _memMB = ((process.memoryUsage().heapUsed) / 1024 / 1024).toFixed(1);

            await reply(
              `🧹 *LIMPEZA CONCLUÍDA!*\n\n` +
              `📊 *Cache do Servidor:*\n` +
              `━━━━━━━━━━━━━━━━━━━\n` +
              `🔑 Pre-keys: ${_preKeys}\n` +
              `🔐 Sessions: ${_sessions}\n` +
              `📨 Sender-keys: ${_senderKeys}\n` +
              `🔄 App-sync: ${_appSync}\n` +
              `📁 Temp: ${_tmpFiles}\n` +
              `━━━━━━━━━━━━━━━━━━━\n` +
              `✅ ${_totalArquivos} arquivos removidos\n` +
              `💾 ${_sizeMB}MB liberados\n` +
              `🧠 RAM atual: ${_memMB}MB\n\n` +
              `⚠️ *Reinicie o bot* para aplicar.\n\n` +
              `ℹ️ _As mensagens do WhatsApp_\n` +
              `_ficam no celular/app, não no_\n` +
              `_servidor do bot. Limpe pelo app._`
            );

            console.log(`[LIMPEZA] ${_totalArquivos} arquivos removidos (${_sizeMB}MB), RAM: ${_memMB}MB`);
          } catch (e) {
            reply(`❌ Erro na limpeza: ${e.message}`);
          }
          break;

        case "antipalavrão":
        case "antipalavra":
        case "antinotafake":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].antipalavrao.active = !dataGp[0].antipalavrao.active;
          setGp(dataGp);
          reply(
            dataGp[0]["antipalavrao"]["active"]
              ? "🌀 𝘼𝙏𝙄𝙑𝙊𝙐 🌀\nCom sucesso o recurso de 𝙖𝙣𝙩𝙞-𝙣𝙤𝙩𝙖...Neste grupo 🤬"
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nCom sucesso o recurso de 𝙖𝙣𝙩𝙞-𝙣𝙤𝙩𝙖...Neste grupo 🤬",
          );
          break;

        case "addnota":
        case "addpalavra":
          if (!isGroupAdmins) return reply(Res_SoAdm);
          if (!isPalavrao)
            return reply(
              `Anti palavras está desativado, você precisa usar o comando ${prefix}antipalavra 🤦🏻‍♀️`,
            );
          if (args.length < 1)
            return reply(
              `Use assim : ${prefix + command} [palavrão]. exemplo ${prefix + command
              } puta`,
            );
          texto = args
            .join(" ")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          if (isPalavras.includes(texto))
            return reply("𝙅𝙖́ 𝙛𝙤𝙞 𝙖𝙙𝙞𝙘𝙞𝙤𝙣𝙖𝙙𝙤 𝙢𝙚𝙨𝙩𝙧𝙚 🙇🏻‍♀️");
          dataGp[0].antipalavrao.palavras.push(texto);
          setGp(dataGp);
          reply("😼 𝘼𝘿𝙄𝘾𝙄𝙊𝙉𝘼𝘿𝙊 𝙈𝙀𝙎𝙏𝙍𝙀 📛");
          break;

        case "remover":
        case "delpalavra":
          if (!isGroupAdmins) return reply(Res_SoAdm);
          if (!isPalavrao) return reply("𝙖𝙣𝙩𝙞-𝙣𝙤𝙩𝙖... desativado 🥱");
          if (args.length < 1)
            return reply(
              `Use assim : ${prefix + command} [palavrão]. exemplo ${prefix + command
              } puta`,
            );
          texto = args
            .join(" ")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          if (!isPalavras.includes(texto))
            return reply("𝙅𝙖́ 𝙛𝙤𝙞 𝙧𝙚𝙢𝙤𝙫𝙞𝙙𝙖 𝙢𝙚𝙨𝙩𝙧𝙚 🙇🏻‍♀️");
          var i6 = dataGp[0].antipalavrao.palavras.indexOf(texto);
          dataGp[0].antipalavrao.palavras.splice(i6, 1);
          setGp(dataGp);
          reply("🙆🏻‍♀️ 𝙍𝙀𝙈𝙊𝙑𝙄𝘿𝘼 𝙈𝙀𝙎𝙏𝙍𝙀 🚯");
          break;

        case "listapalavrão":
        case "listanota":
        case "listpalavra":
          if (!isPalavrao) return reply("Anti palavrão desativado!");
          let lbw = `Esta é a lista de palavrão\nTotal : ${isPalavras.length}\n`;
          for (let i of isPalavras) {
            lbw += `➸ ${i}\n`;
          }
          await reply(lbw);
          break;

        case "limite":
        case "limiteflood":
        case "limitecaracteres":
          if (Os_Returns(true, true, true).true)
            return reply(Os_Returns(true, true, true).txt);
          dataGp[0].limitec.active = !dataGp[0].limitec.active;
          setGp(dataGp);
          reply(
            dataGp[0]["limitec"]["active"]
              ? `⚠️᪶𝘼𝙏𝙄𝙑𝙊𝙐 ᪶⚠️\nO limite de (𝙘𝙖𝙧𝙖𝙘𝙩𝙚𝙧𝙚𝙨) foi ativado.!!Nesse grupo ⛔`
              : "❌𝘿𝙀𝙎𝘼𝙏𝙄𝙑𝙊𝙐❌\nO limite de (𝙘𝙖𝙧𝙖𝙘𝙩𝙚𝙧𝙚𝙨) foi desativado.!! Nesse grupo ⛔",
          );
          break;

        case "limitec_global":
        case "limitec":
          if (!SoDono && !isnit && !ischyt) return reply(Res_SoDono);
          if (!isAntiFlood)
            return reply(`Ative primeiro o ☛ ${prefix}limite 😏`);
          if (!q.trim())
            return reply(`Cade a quantidade? Ex: ${prefix + command} 6000`);
          if (isNaN(q) == true) return reply("Digite apenas números");
          if (command == "limitec") {
            dataGp[0].limitec.quantidade = q;
            setGp(dataGp);
            reply(
              `Foi alterado o Limite para: ${q} 😉 Se alguém mandar uma frase acima do limite eu vou passar a faca 😼͜🔪`,
            );
          } else {
            var data = { limitefl: q };
            fs.writeFileSync(
              "./dados/usuarios/flood.json",
              JSON.stringify(data, null, "\t"),
            );
            reply(`𝙁𝙤𝙞 𝙖𝙙𝙞𝙘𝙞𝙤𝙣𝙖𝙙𝙤 𝙪𝙢 𝙡𝙞𝙢𝙞𝙩𝙚 𝙥𝙖𝙧𝙖 𝙩𝙤𝙙𝙤𝙨 𝙤𝙨 𝙜𝙧𝙪𝙥𝙤𝙨 𝙙𝙚 😏 ${q}`);
          }
          break;

        case "status":
        case "ativarcmds":
        case "ativacoes": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins && !SoDono && !info.key.fromMe)
            return reply(Res_SoAdm);

          // Ler settings para exibir configs globais
          let _cfgStatus = {};
          try {
            _cfgStatus = JSON.parse(fs.readFileSync("./dados/settings.json"));
          } catch { }

          statuszada = `│
│    ⚙️*STATUS DO GRUPO*⚙️
├──────────────────────
│
│──────  🔒 *PROTEÇÕES*  ──────
│  Anti Link: ${dataGp[0]?.antilinkhard ? "✅" : "❌"} ─ ${prefix}antilink
│  Anti Link 2: ${dataGp[0]?.antilink2 ? "✅" : "❌"} ─ ${prefix}antilink2
│  Anti Link GP: ${isAntilinkgp ? "✅" : "❌"} ─ ${prefix}antilinkgp
│  Anti Palavrão: ${isPalavrao ? "✅" : "❌"} ─ ${prefix}antipalavrao
│  Anti Fake: ${dataGp[0]?.antifake ? "✅" : "❌"} ─ ${prefix}antifake
│  Anti Catálogo: ${isAnticatalogo ? "✅" : "❌"} ─ ${prefix}anticatalogo
│  Anti Loc: ${Antiloc ? "✅" : "❌"} ─ ${prefix}antiloc
│  Limite Chars: ${isAntiFlood ? "✅" : "❌"} ─ ${prefix}limitecaracteres
│  Anti-Spam: ${dataGp[0]?.antispam ? "✅" : "❌"} ─ ${prefix}antispam
│  Anti-Status: ${dataGp[0]?.antistatus ? "✅" : "❌"} ─ ${prefix}antistatus
│
│──────  🚫 *ANTI MÍDIA*  ──────
│  Anti Vídeo: ${isAntiVid ? "✅" : "❌"} ─ ${prefix}antivideo
│  Anti Imagem: ${isAntiImg ? "✅" : "❌"} ─ ${prefix}antiimg
│  Anti Áudio: ${isAntiAudio ? "✅" : "❌"} ─ ${prefix}antiaudio
│  Anti Doc: ${Antidoc ? "✅" : "❌"} ─ ${prefix}antidoc
│  Anti Contato: ${isAntiCtt ? "✅" : "❌"} ─ ${prefix}antictt
│  Anti Sticker: ${isAntiSticker ? "✅" : "❌"} ─ ${prefix}antisticker
│
│──────👋 *BEM-VINDO/SAIU* ──────
│  Bemvindo1: ${isWelkom ? "✅" : "❌"} ─ ${prefix}bemvindo1
│  Bemvindo2: ${isWelkom2 ? "✅" : "❌"} ─ ${prefix}bemvindo2
│  Saiu1: ${dataGp[0]?.wellcome[0]?.saiu1 ? "✅" : "❌"} ─ ${prefix}saiu1
│  Saiu2: ${dataGp[0]?.wellcome[1]?.saiu2 ? "✅" : "❌"} ─ ${prefix}saiu2
│
│──────  🤖 *AUTOMAÇÃO*  ──────
│  Autofigu: ${isAutofigu ? "✅" : "❌"} ─ ${prefix}autofigu
│  Auto Resposta: ${isAutorepo ? "✅" : "❌"} ─ ${prefix}autoresposta
│  Simih (IA): ${isSimi ? "✅" : "❌"} ─ ${prefix}simih
│  Simih2 (IA+): ${isSimi2 ? "✅" : "❌"} ─ ${prefix}simih2
│  🧠 IA Aleatory: ${dataGp[0]?.iaAleatory ? "✅" : "❌"} ─ ${prefix}iaaleatory
│  Auto Baixar: ${dataGp[0]?.autobaixar ? "✅" : "❌"} ─ ${prefix}autobaixar
│
│────── 📋 *OUTROS* ──────
│  Cargo X9: ${isx9 ? "✅" : "❌"} ─ ${prefix}x9
│  Visu Única: ${isX9VisuUnica ? "✅" : "❌"} ─ ${prefix}x9visuunica
│  Modo Brinc: ${isModobn ? "✅" : "❌"} ─ ${prefix}modobrincadeira
│  Limitar CMD: ${dataGp[0]?.Limitar_CMD ? "✅" : "❌"} ─ ${prefix}limitarcomando
│  Modo Gold: ${dataGp[0]?.sistemGold ? "✅" : "❌"} ─ ${prefix}modogold
│
├── 🌐 *GLOBAL* ──────
│  Anti PV: ${nescessario?.antipv ? "✅" : "❌"} ─ ${prefix}antipv
│  Anti PV2: ${nescessario?.antipv2 ? "✅" : "❌"} ─ ${prefix}antipv2
│  Anti PV3: ${nescessario?.antipv3 ? "✅" : "❌"} ─ ${prefix}antipv3
│  Aniversário: ${_cfgStatus?.aniversario !== false ? "✅" : "❌"} ─ ${prefix}aniversario
│  Modo Registro: ${_cfgStatus?.modoregistro === true ? "✅" : "❌"} ─ ${prefix}modoregistro
├──────────────
│  💡 _Use o comando p/ ativar/desativar_`;
          conn.sendMessage(
            from,
            { ...getMenuMedia(), caption: statuszada },
            { quoted: info },
          );
          break;
        }
        case "aniversario": {
          if (!SoDono) return reply(Res_SoDono);
          try {
            const cfgPath = "./dados/settings.json";
            const cfg = JSON.parse(fs.readFileSync(cfgPath));
            const novoEstado = cfg.aniversario === false ? true : false;
            cfg.aniversario = novoEstado;
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
            reply(
              novoEstado
                ? `🎂 *Sistema de Aniversário ATIVADO!*\n\nO bot voltará a enviar mensagens de parabéns automaticamente à meia-noite para os grupos onde os aniversariantes estão. 🎉`
                : `🎂 *Sistema de Aniversário DESATIVADO!*\n\nO bot não enviará mais mensagens de aniversário até que você ative novamente com *${prefix}aniversario*. 🔕`,
            );
          } catch (e) {
            reply("❌ Erro ao alterar configuração do sistema de aniversário.");
            console.error("[ANIVERSARIO-TOGGLE] Erro:", e);
          }
          break;
        }

        case "modoregistro": {
          if (!SoDono) return reply(Res_SoDono);
          try {
            const cfgPath = "./dados/settings.json";
            const cfg = JSON.parse(fs.readFileSync(cfgPath));
            const novoEstado = cfg.modoregistro === true ? false : true;
            cfg.modoregistro = novoEstado;
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
            // ═══ ATUALIZAR OBJETO EM MEMÓRIA para evitar que outros comandos sobrescrevam ═══
            setting.modoregistro = novoEstado;
            reply(
              novoEstado
                ? `🔐 *Modo Registro ATIVADO!*\n\nUsuários sem registro serão impedidos de usar comandos.\n\n💡 Para se registrar: *${prefix}registrar*`
                : `🔓 *Modo Registro DESATIVADO!*\n\nTodos podem usar o bot sem registro.\n\n💡 O comando *${prefix}perfil* continua funcionando normalmente para quem tem registro.`,
            );
          } catch (e) {
            reply("❌ Erro ao alterar configuração do modo registro.");
            console.error("[MODOREGISTRO-TOGGLE] Erro:", e);
          }
          break;
        }

        // ─── COMANDOS DE INFORMAÇÃO / AJUDA ───────────────────────────
        case "infoaniversario": {
          reply(`╭──── ℹ️ *INFO: !aniversario* ────╮
┃
┃ 📋 *O que faz:*
┃ Ativa ou desativa o sistema de
┃ aniversário automático do bot.
┃
┃ 👤 *Quem pode usar:*
┃ Apenas o *dono do bot*.
┃
┃ ⚙️ *Como funciona:*
┃ Todos os dias à meia-noite (horário
┃ de Brasília), o bot verifica quem
┃ faz aniversário e envia:
┃
┃ 🎂 Mensagem no grupo (com foto)
┃ 💬 Mensagem privada ao aniversariante
┃ 🔒 Fecha o grupo por 1 min e reabre
┃
┃ 📌 *Para registrar nascimento:*
┃ Use ${prefix}registrar (informa a data)
┃
┃ 📌 *Para ativar/desativar:*
┃ ${prefix}aniversario → alterna on/off
┃
┃ 📊 *Status atual no:*
┃ ${prefix}status → linha sistema aniversário
┃
┃ 💡 Ativado por padrão. Persiste
┃ após reiniciar o bot.
┃
╰──────────────────────────────────╯`);
          break;
        }

        case "infoaceitar": {
          reply(`╭──── ℹ️ *INFO: !aceitar* ────╮
┃
┃ 📋 *O que faz:*
┃ Aprova todos (ou N) pedidos pendentes
┃ de entrada no grupo de uma vez.
┃
┃ 👤 *Quem pode usar:*
┃ Apenas ADMs do grupo (e o bot
┃ precisa ser ADM também).
┃
┃ ⚙️ *Ativação:*
┃ Funciona automaticamente quando o
┃ grupo tem o modo de aprovação de
┃ membros ativado.
┃
┃ 📌 *Exemplos:*
┃ ${prefix}aceitar → aprova TODOS
┃ ${prefix}aceitar 5 → aprova os 5 primeiros
┃ ${prefix}aceitar 10 → aprova os 10 primeiros
┃
┃ 💡 Os demais ficam pendentes.
┃
╰──────────────────────────────╯`);
          break;
        }

        case "inforecusar": {
          reply(`╭──── ℹ️ *INFO: !recusar* ────╮
┃
┃ 📋 *O que faz:*
┃ Recusa todos (ou N) pedidos pendentes
┃ de entrada no grupo de uma vez.
┃
┃ 👤 *Quem pode usar:*
┃ Apenas ADMs do grupo (e o bot
┃ precisa ser ADM também).
┃
┃ ⚙️ *Ativação:*
┃ Funciona quando o grupo tem o modo
┃ de aprovação de membros ativado.
┃
┃ 📌 *Exemplos:*
┃ ${prefix}recusar → recusa TODOS
┃ ${prefix}recusar 3 → recusa os 3 primeiros
┃ ${prefix}recusar 5 → recusa os 5 primeiros
┃
┃ 💡 Os demais ficam pendentes.
┃
╰──────────────────────────────╯`);
          break;
        }

        case "infoperfil": {
          reply(`╭──── ℹ️ *INFO: !perfil* ────╮
┃
┃ 📋 *O que faz:*
┃ Exibe o perfil registrado de um
┃ membro: nome, idade, signo, cidade,
┃ profissão, religião, estado civil,
┃ time e frase de vida.
┃
┃ 👤 *Quem pode usar:*
┃ Qualquer membro registrado.
┃
┃ ⚙️ *Requisito:*
┃ O usuário precisa ter feito o
┃ cadastro com *${prefix}registrar* antes.
┃
┃ 📌 *Exemplos:*
┃ ${prefix}perfil → seu próprio perfil
┃ ${prefix}perfil @fulano → perfil de outro
┃ (marcando ou respondendo a mensagem)
┃
┃ 💡 Em grupos, exibe também a
┃ atividade do membro no grupo.
┃
┃ 🗑️ *Deletar registro:*
┃ ${prefix}delregistro → apaga seu cadastro
┃
╰──────────────────────────────╯`);
          break;
        }

        case "inforegistro":
        case "registroinfo": {
          if (!SoDono) return reply(Res_SoDono);
          reply(`⚙️ *GUIA DO DONO — SISTEMA DE REGISTRO*

╭──────────────────╮
│ 📌 *O QUE É?*
│ Sistema de cadastro dos usuários
│ com 10 perguntas guiadas.
│ Dados salvos em JSON persistente.
╰──────────────────╯

╭──────────────────╮
│ 🔐 *ATIVAÇÃO (Dono)*
│
│ O registro é controlado pelo
│ *modo registro* nas configs:
│ ${prefix}modoregistro on/off
│
│ Quando *desativado*, ninguém
│ consegue se registrar.
╰──────────────────╯

╭──────────────────╮
│ 🛠️ *COMANDOS DO DONO*
│
│ ${prefix}registrados — listar todos
│ ${prefix}zerarregistros — apagar todos
│ ${prefix}modoregistro — ativar/desativar
╰──────────────────╯

╭──────────────────╮
│ 👤 *COMANDOS DO USUÁRIO*
│
│ ${prefix}registrar — criar/atualizar
│ ${prefix}perfil — ver perfil
│ ${prefix}delregistro — deletar
│ ${prefix}inforegistrar — tutorial
│ ${prefix}infoperfil — tutorial
╰──────────────────╯

╭──────────────────╮
│ 📁 *ARMAZENAMENTO*
│
│ Registros: registros.json
│ Estados: registro_states.json
│ Timeout: 5 min por inatividade
│ Registro feito apenas no PV
╰──────────────────╯

╭──────────────────╮
│ 🎂 *ANIVERSÁRIO*
│
│ O bot calcula idade e signo
│ automaticamente. No aniversário
│ parabeniza em todos os grupos.
╰──────────────────╯

⚡ _Bronxys Host_`);
          break;
        }

        case "inforegistrar": {
          reply(`╭──── ℹ️ *INFO: !registrar* ────╮
┃
┃ 📋 *O que faz:*
┃ Cria ou atualiza seu perfil no bot
┃ através de um fluxo guiado de
┃ 10 perguntas passo a passo.
┃
┃ 👤 *Quem pode usar:*
┃ Qualquer usuário (privado ou grupo).
┃
┃ 📝 *Perguntas do cadastro:*
┃ 1. Sexo
┃ 2. Nome completo
┃ 3. Data de nascimento
┃ 4. Altura
┃ 5. Cidade / Estado
┃ 6. Profissão
┃ 7. Religião
┃ 8. Estado civil
┃ 9. Time do coração
┃ 10. Frase de vida / bio
┃
┃ ⚙️ *Detalhes:*
┃ ⏰ Timeout: 5 minutos por inatividade
┃ 🔄 Pode atualizar a qualquer momento
┃ ❌ Para cancelar: ${prefix}cancelar
┃
┃ 📌 *Como usar:*
┃ ${prefix}registrar → inicia o cadastro
┃ ${prefix}delregistro → apaga seu registro
┃
╰──────────────────────────────╯`);
          break;
        }

        // ─── ACEITAR TODOS OS PEDIDOS PENDENTES ───────────────────────
        case "aceitar":
        case "aceitar_todos":
        case "aprovartodos": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply(Res_SoAdm);
          if (!isBotGroupAdmins) return reply(Res_BotADM);

          try {
            // Verificar se foi passado um número limite
            const limiteAceitar =
              q && /^\d+$/.test(q.trim()) ? parseInt(q.trim()) : null;

            reply("⏳ Buscando pedidos pendentes...");
            const pendentes = await conn.groupRequestParticipantsList(from);

            if (!pendentes || pendentes.length === 0) {
              return reply(
                `✅ *Nenhum pedido pendente!*\n\nNão há nenhuma solicitação de entrada aguardando aprovação neste grupo.`,
              );
            }

            // Aplicar limite se informado
            const pendentesSlice = limiteAceitar
              ? pendentes.slice(0, limiteAceitar)
              : pendentes;
            const restantes = limiteAceitar
              ? Math.max(0, pendentes.length - limiteAceitar)
              : 0;

            const jids = pendentesSlice.map((p) => p.jid).filter(Boolean);
            if (jids.length === 0) {
              return reply(
                `⚠️ Não foi possível obter os JIDs dos solicitantes.`,
              );
            }

            const resultados = await conn.groupRequestParticipantsUpdate(
              from,
              jids,
              "approve",
            );

            const aprovados = resultados.filter(
              (r) => r.status === "200" || !r.status || r.status === 200,
            );
            const falhas = resultados.filter(
              (r) => r.status !== "200" && r.status && r.status !== 200,
            );

            const admNum = sender.split("@")[0];
            let txt = `✅ *Pedidos de Entrada Aprovados!*\n\n`;
            txt += `👤 ADM responsável: @${admNum}\n`;
            txt += `📊 Total processado: *${jids.length}* pedido(s)\n`;
            txt += `✅ Aprovados com sucesso: *${aprovados.length}*\n`;
            if (falhas.length > 0) txt += `⚠️ Falhas: *${falhas.length}*\n`;
            if (restantes > 0)
              txt += `⏳ Ainda pendentes: *${restantes}* solicitação(ões)\n`;
            txt += `\n🎉 Bem-vindo(a/s) ao grupo!`;

            await conn.sendMessage(
              from,
              {
                text: txt,
                mentions: [
                  sender,
                  ...aprovados.map((r) => r.jid).filter(Boolean),
                ],
              },
              { quoted: info },
            );
          } catch (e) {
            console.error("[ACEITAR-PEDIDOS] Erro:", e);
            reply(`❌ Erro ao processar pedidos: ${e.message || e}`);
          }
          break;
        }

        // ─── RECUSAR TODOS OS PEDIDOS PENDENTES ───────────────────────
        case "recusar":
        case "recusar_todos":
        case "rejeitartodos": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply(Res_SoAdm);
          if (!isBotGroupAdmins) return reply(Res_BotADM);

          try {
            // Verificar se foi passado um número limite
            const limiteRecusar =
              q && /^\d+$/.test(q.trim()) ? parseInt(q.trim()) : null;

            reply("⏳ Buscando pedidos pendentes...");
            const pendentes = await conn.groupRequestParticipantsList(from);

            if (!pendentes || pendentes.length === 0) {
              return reply(
                `✅ *Nenhum pedido pendente!*\n\nNão há nenhuma solicitação de entrada aguardando aprovação neste grupo.`,
              );
            }

            // Aplicar limite se informado
            const pendentesSliceR = limiteRecusar
              ? pendentes.slice(0, limiteRecusar)
              : pendentes;
            const restantesR = limiteRecusar
              ? Math.max(0, pendentes.length - limiteRecusar)
              : 0;

            const jids = pendentesSliceR.map((p) => p.jid).filter(Boolean);
            if (jids.length === 0) {
              return reply(
                `⚠️ Não foi possível obter os JIDs dos solicitantes.`,
              );
            }

            const resultados = await conn.groupRequestParticipantsUpdate(
              from,
              jids,
              "reject",
            );

            const recusados = resultados.filter(
              (r) => r.status === "200" || !r.status || r.status === 200,
            );
            const falhas = resultados.filter(
              (r) => r.status !== "200" && r.status && r.status !== 200,
            );

            const admNum = sender.split("@")[0];
            let txt = `❌ *Pedidos de Entrada Recusados!*\n\n`;
            txt += `👤 ADM responsável: @${admNum}\n`;
            txt += `📊 Total processado: *${jids.length}* pedido(s)\n`;
            txt += `❌ Recusados: *${recusados.length}*\n`;
            if (falhas.length > 0) txt += `⚠️ Falhas: *${falhas.length}*\n`;
            if (restantesR > 0)
              txt += `⏳ Ainda pendentes: *${restantesR}* solicitação(ões)\n`;
            txt += `\n🔒 Entrada negada aos solicitantes processados.`;

            await conn.sendMessage(
              from,
              {
                text: txt,
                mentions: [sender],
              },
              { quoted: info },
            );
          } catch (e) {
            console.error("[RECUSAR-PEDIDOS] Erro:", e);
            reply(`❌ Erro ao processar pedidos: ${e.message || e}`);
          }
          break;
        }

        // ─────────────────────────────────────────────────────────────────
        // 🏘️ SISTEMA DE ALUGUEL DE GRUPOS — Redesign Profissional
        // ─────────────────────────────────────────────────────────────────

        // ── PÚBLICO: redireciona interessados ao dono ──
        case "alugar": {
          reply(`╔════════════════════════════════╗
║   🤖 ALUGAR O ${NomeDoBot}   ║
╚════════════════════════════════╝

Olá! 👋 Quer me contratar para o seu grupo?

💬 Entre em contato com o meu responsável:
📞 *wa.me/${numerodono_ofc}*

Ele irá te passar:
> 📋 Lista de planos e valores
> 📝 Contrato e prazo de aluguel
> ✅ Instruções de como começar

> _Aguardando seu contato! 🚀_`);
          break;
        }

        // ── DONO: Iniciar contrato de aluguel (3 formas) ──
        case "alugarbot":
        case "aluguel":
        case "novoaluguel": {
          if (!SoDono) return reply(Res_SoDono);

          // Verificar se já tem um fluxo ativo (tentar múltiplos JIDs)
          const _alugFlowAtivo =
            getAluguelState(numerodono_ofc + "@s.whatsapp.net") ||
            getAluguelState(normalizeJid(sender)) ||
            getAluguelState(sender);
          if (_alugFlowAtivo) {
            return reply(
              `⚠️ Você já tem um contrato em andamento no *privado*.\n\n💡 Conclua ou envie *cancelar* no PV antes de iniciar outro.\n💡 Ou use *!cancelar* para cancelar o contrato atual.`,
            );
          }

          const argAlug = q.trim();
          let _alugInitData = {};
          let _alugGrupoMsg = "";

          // ── FORMA 1: Dentro do grupo (sem argumentos) ──
          if (isGroup && !argAlug) {
            try {
              const _metaAlug = await conn.groupMetadata(from);
              _alugInitData.id_gp = from;
              _alugInitData.nome_auto = _metaAlug?.subject || "";
              try {
                const _codeAlug = await conn.groupInviteCode(from);
                _alugInitData.link_auto = `https://chat.whatsapp.com/${_codeAlug}`;
              } catch {
                _alugInitData.link_falhou = true;
              }
              _alugGrupoMsg = `📋 Tudo bem! Enviei o *contrato deste grupo* no seu privado.\n\n💬 Responda as etapas *lá no PV* para concluir o aluguel.`;
            } catch (e) {
              return reply(`❌ Erro ao coletar dados do grupo: ${e.message}`);
            }
          }

          // ── FORMA 2: Por link do grupo ──
          else if (argAlug.includes("chat.whatsapp.com")) {
            _alugInitData.link_auto = argAlug;
            try {
              const _linkCode = argAlug
                .split("chat.whatsapp.com/")
                .pop()
                ?.trim();
              if (_linkCode) {
                const _gpInfo = (await conn.groupAcceptInvite) ? null : null;
                // Tenta resolver o link para pegar metadados
                try {
                  const _invInfo = await conn.groupGetInviteInfo(_linkCode);
                  if (_invInfo) {
                    _alugInitData.id_gp = _invInfo.id;
                    _alugInitData.nome_auto = _invInfo.subject || "";
                  }
                } catch { }
              }
            } catch { }
            if (isGroup) {
              _alugGrupoMsg = `📋 Tudo bem! Enviei o *contrato* no seu privado.\n\n💬 Responda as etapas *lá no PV* para concluir o aluguel.`;
            }
          }

          // ── FORMA 3: Por ID do grupo ──
          else if (argAlug.endsWith("@g.us")) {
            _alugInitData.id_gp = argAlug;
            try {
              const _metaId = await conn.groupMetadata(argAlug);
              _alugInitData.nome_auto = _metaId?.subject || "";
              try {
                const _codeId = await conn.groupInviteCode(argAlug);
                _alugInitData.link_auto = `https://chat.whatsapp.com/${_codeId}`;
              } catch { }
            } catch { }
            if (isGroup) {
              _alugGrupoMsg = `📋 Tudo bem! Enviei o *contrato* no seu privado.\n\n💬 Responda as etapas *lá no PV* para concluir o aluguel.`;
            }
          }

          // ── Sem argumento no privado: iniciar fluxo direto ──
          else if (!isGroup && !argAlug) {
            // Sem dados iniciais, vai perguntar tudo nas etapas
          }

          // Se chamado no grupo sem forma válida
          else if (isGroup) {
            return reply(
              `📋 *Como usar o ${prefix}alugarbot:*\n\n*Dentro do grupo:* ${prefix}alugarbot\n*Com link:* ${prefix}alugarbot <link>\n*Com ID:* ${prefix}alugarbot <ID>`,
            );
          }

          // ── Verificar se o grupo já está alugado ──
          let _contratoExistente = null;
          const _todosContratos = getAluguel();

          // 1. Buscar por ID do grupo
          if (!_contratoExistente && _alugInitData.id_gp) {
            _contratoExistente =
              _todosContratos.find(
                (c) => c.id_gp && c.id_gp === _alugInitData.id_gp,
              ) || null;
          }

          // 2. Buscar por link do grupo (auto-detectado ou fornecido)
          if (!_contratoExistente && _alugInitData.link_auto) {
            const _linkCode = _alugInitData.link_auto
              .split("chat.whatsapp.com/")
              .pop()
              ?.split("?")[0]
              ?.trim();
            if (_linkCode) {
              _contratoExistente =
                _todosContratos.find(
                  (c) => c.link && c.link.includes(_linkCode),
                ) || null;
            }
          }

          // 3. Buscar por nome do grupo (auto-detectado)
          if (!_contratoExistente && _alugInitData.nome_auto) {
            const _nomeNorm = _alugInitData.nome_auto.toLowerCase().trim();
            _contratoExistente =
              _todosContratos.find(
                (c) => c.nome_ && c.nome_.toLowerCase().trim() === _nomeNorm,
              ) || null;
          }

          if (_contratoExistente) {
            // Auto-corrigir id_gp vazio se estiver no grupo
            if (
              isGroup &&
              _alugInitData.id_gp &&
              (!_contratoExistente.id_gp ||
                _contratoExistente.id_gp !== _alugInitData.id_gp)
            ) {
              const _todosAtualizar = getAluguel();
              const _idxFix = _todosAtualizar.findIndex(
                (c) =>
                  c === _contratoExistente ||
                  (c.nome_ === _contratoExistente.nome_ &&
                    c.vencimento === _contratoExistente.vencimento),
              );
              if (_idxFix >= 0) {
                _todosAtualizar[_idxFix].id_gp = _alugInitData.id_gp;
                if (_alugInitData.link_auto && !_todosAtualizar[_idxFix].link) {
                  _todosAtualizar[_idxFix].link = _alugInitData.link_auto;
                }
                const {
                  setAluguel,
                } = require("./dados/org/funcoes/aluguel.js");
                setAluguel(_todosAtualizar);
                _contratoExistente.id_gp = _alugInitData.id_gp;
              }
            }

            const _vencF = moment
              .unix(_contratoExistente.vencimento)
              .tz("America/Sao_Paulo")
              .format("DD/MM/YYYY [às] HH:mm");
            return reply(
              `⚠️ Este grupo *já está alugado!*\n\n🏘️ *${_contratoExistente.nome_}*\n👤 Responsável: ${_contratoExistente.responsavel_nome}\n⏳ Vence em: *${_vencF}*\n\n💡 Para *renovar*, use: *${prefix}renovaraluguel*\n💡 Para *encerrar*, use: *${prefix}encerraraluguel*\n📋 Tutorial: *${prefix}infoaluguel*`,
            );
          }

          // ── Iniciar o fluxo no privado do dono ──
          const _donoJidAlug = numerodono_ofc + "@s.whatsapp.net";
          const _introAlug = startAluguelFlow(_donoJidAlug, _alugInitData);
          const _alugIntroTxt = `🏘️ *NOVO CONTRATO — Preencha as etapas:*\n\n${_introAlug.msg}\n\n💡 _Envie *cancelar* a qualquer momento para desistir._`;

          // Se foi usado no grupo, avisar lá e enviar no PV
          if (isGroup && _alugGrupoMsg) {
            reply(_alugGrupoMsg);
            try {
              if (_introAlug.image) {
                await conn.sendMessage(_donoJidAlug, {
                  image: { url: _introAlug.image },
                  caption: _alugIntroTxt,
                });
              } else {
                await conn.sendMessage(_donoJidAlug, { text: _alugIntroTxt });
              }
            } catch {
              reply(
                `⚠️ Não consegui enviar no seu privado. Mande uma mensagem para wa.me/${numerodono_ofc} primeiro.`,
              );
              clearAluguelState(_donoJidAlug);
            }
          } else {
            // Já está no privado, responde direto
            if (_introAlug.image) {
              conn.sendMessage(
                from,
                {
                  image: { url: _introAlug.image },
                  caption: _alugIntroTxt,
                },
                { quoted: info },
              );
            } else {
              reply(_alugIntroTxt);
            }
          }
          break;
        }

        // ── DONO: Listar todos os contratos ──
        case "alugados":
        case "listaalugados":
        case "contratos": {
          if (!SoDono) return reply(Res_SoDono);

          const listaAlugados = getAluguel();
          if (!listaAlugados || listaAlugados.length === 0) {
            const msgVazio = `📋 *Nenhum contrato ativo.*\n\nUse *${prefix}alugarbot* para cadastrar um grupo.`;
            if (isGroup) {
              reply(`📨 Enviei as informações no seu *privado*.`);
              try {
                await conn.sendMessage(numerodono_ofc + "@s.whatsapp.net", {
                  text: msgVazio,
                });
              } catch { }
            } else {
              reply(msgVazio);
            }
            break;
          }

          const agoraList = Math.floor(Date.now() / 1000);
          const ativosList = listaAlugados.filter(
            (c) => c.vencimento > agoraList,
          );
          const vencidosList = listaAlugados.filter(
            (c) => c.vencimento <= agoraList,
          );
          const vencendo3List = listaAlugados.filter((c) => {
            const r = c.vencimento - agoraList;
            return r > 0 && r <= 3 * 86400;
          });

          let txtAlugados = `│
│  📋 *PAINEL DE ALUGUÉIS*
├──────────────
│
│  📊 *Resumo:*
│  🟢 Ativos: *${ativosList.length}*
│  🟡 Vencendo 3d: *${vencendo3List.length}*
│  🔴 Vencidos: *${vencidosList.length}*
│  📦 Total: *${listaAlugados.length}*
│
├──────────────
`;

          listaAlugados.forEach((c, i) => {
            txtAlugados += `│\n│  *${i + 1}.* ${formatarContrato(c, false).replace(/^│  /gm, "")}\n`;
          });

          txtAlugados += `│\n├──────────────\n│  💡 *${prefix}alugado: <nome>* ─ Detalhes`;

          if (isGroup) {
            reply(`📨 Enviei a lista de aluguéis no seu *privado*.`);
            try {
              await conn.sendMessage(numerodono_ofc + "@s.whatsapp.net", {
                image: { url: logoslink.logo },
                caption: txtAlugados,
              });
            } catch { }
          } else {
            try {
              await conn.sendMessage(sender, {
                image: { url: logoslink.logo },
                caption: txtAlugados,
              });
            } catch {
              reply(txtAlugados);
            }
          }
          break;
        }

        // ── DONO: Ver detalhes de um contrato ──
        case "alugado": {
          if (!SoDono) return reply(Res_SoDono);

          const queryLinkA = q.replace(/^:\s*/, "").trim();
          if (!queryLinkA) {
            return reply(
              `💡 *Uso:*\n${prefix}alugado: <nome, link ou ID>\n\nExemplo:\n${prefix}alugado: https://chat.whatsapp.com/ABC123\n${prefix}alugado: Nome do Grupo`,
            );
          }

          let contratoA = null;
          if (queryLinkA.includes("chat.whatsapp.com")) {
            contratoA = getAluguelByLink(queryLinkA);
          } else if (queryLinkA.endsWith("@g.us")) {
            contratoA = getAluguelByGrupo(queryLinkA);
          } else {
            const listaB = getAluguel();
            contratoA =
              listaB.find((c) =>
                c.nome_.toLowerCase().includes(queryLinkA.toLowerCase()),
              ) || null;
          }

          if (!contratoA) {
            return reply(
              `❌ Nenhum contrato encontrado para *${queryLinkA}*\n\n💡 Use ${prefix}alugados para listar todos.`,
            );
          }

          const txtContratoA = formatarContrato(contratoA, true);
          if (isGroup) {
            reply(`📨 Enviei os detalhes do contrato no seu *privado*.`);
            try {
              await conn.sendMessage(numerodono_ofc + "@s.whatsapp.net", {
                text: txtContratoA,
              });
            } catch { }
          } else {
            reply(txtContratoA);
          }
          break;
        }

        // ── DONO: Renovar contrato ──
        case "renovaraluguel": {
          if (!SoDono) return reply(Res_SoDono);

          // Verificar se já tem um fluxo de renovação ativo
          const _renovFlowAtivo =
            getRenovacaoState(numerodono_ofc + "@s.whatsapp.net") ||
            getRenovacaoState(normalizeJid(sender)) ||
            getRenovacaoState(sender);
          if (_renovFlowAtivo) {
            return reply(
              `⚠️ Você já tem uma *renovação em andamento* no privado.\n\n💡 Conclua ou envie *cancelar* no PV antes de iniciar outra.`,
            );
          }

          const argRenov = q.trim();
          let _contratoRenov = null;

          // ── FORMA 1: Dentro do grupo (sem argumentos) ──
          if (isGroup && !argRenov) {
            _contratoRenov = getAluguelByGrupo(from);
          }

          // ── FORMA 2: Por link do grupo ──
          else if (argRenov.includes("chat.whatsapp.com")) {
            _contratoRenov = getAluguelByLink(argRenov);
          }

          // ── FORMA 3: Por ID do grupo ──
          else if (argRenov.endsWith("@g.us")) {
            _contratoRenov = getAluguelByGrupo(argRenov);
          }

          // ── FORMA 4: Por nome do grupo ──
          else if (argRenov) {
            const listaContratos = getAluguel();
            _contratoRenov =
              listaContratos.find((c) =>
                c.nome_.toLowerCase().includes(argRenov.toLowerCase()),
              ) || null;
          }

          // ── Sem argumento no privado: mostrar ajuda ──
          else if (!isGroup && !argRenov) {
            return reply(
              `💡 *Como renovar um contrato:*\n\n*No grupo:* ${prefix}renovaraluguel\n*Com link:* ${prefix}renovaraluguel <link>\n*Com ID:* ${prefix}renovaraluguel <ID>\n*Com nome:* ${prefix}renovaraluguel <nome do grupo>\n\nExemplo:\n${prefix}renovaraluguel https://chat.whatsapp.com/ABC\n${prefix}renovaraluguel Fãs de Anime`,
            );
          }

          if (!_contratoRenov) {
            return reply(
              `❌ Nenhum contrato encontrado${argRenov ? ` para *${argRenov}*` : " para este grupo"}.\n\n💡 Use ${prefix}alugados para listar todos os contratos.`,
            );
          }

          // ── Exibir contrato e iniciar fluxo no PV ──
          const _donoJidRenov = numerodono_ofc + "@s.whatsapp.net";
          const _introRenov = startRenovacaoFlow(_donoJidRenov, _contratoRenov);
          const _renovIntroTxt = `🔄 *RENOVAÇÃO DE CONTRATO*\n\n📋 Contrato atual:\n${formatarContrato(_contratoRenov)}\n\n────────────────────────\n\n${_introRenov.msg}\n\n💡 _Envie *cancelar* a qualquer momento para desistir._`;

          if (isGroup) {
            reply(
              `🔄 Enviei os dados do contrato de *${_contratoRenov.nome_}* no seu *privado*.\n\n💬 Responda as etapas *lá no PV* para concluir a renovação.`,
            );
            try {
              if (_introRenov.image) {
                await conn.sendMessage(_donoJidRenov, {
                  image: { url: _introRenov.image },
                  caption: _renovIntroTxt,
                });
              } else {
                await conn.sendMessage(_donoJidRenov, { text: _renovIntroTxt });
              }
            } catch {
              reply(
                `⚠️ Não consegui enviar no seu privado. Mande uma mensagem para wa.me/${numerodono_ofc} primeiro.`,
              );
              clearRenovacaoState(_donoJidRenov);
            }
          } else {
            if (_introRenov.image) {
              conn.sendMessage(
                from,
                {
                  image: { url: _introRenov.image },
                  caption: _renovIntroTxt,
                },
                { quoted: info },
              );
            } else {
              reply(_renovIntroTxt);
            }
          }
          break;
        }

        // ── DONO: Encerrar contrato ──
        case "encerraraluguel":
        case "cancelaraluguel": {
          if (!SoDono) return reply(Res_SoDono);

          let _contratoEnc = null;
          let _buscaEnc = "";

          if (isGroup) {
            // Dentro do grupo: buscar por ID
            _contratoEnc = getAluguelByGrupo(from);
            _buscaEnc = from;

            // Fallback: buscar por nome do grupo
            if (!_contratoEnc) {
              try {
                const _metaEnc = await conn.groupMetadata(from);
                if (_metaEnc?.subject) {
                  const _nomeEnc = _metaEnc.subject.toLowerCase().trim();
                  const _todosEnc = getAluguel();
                  _contratoEnc =
                    _todosEnc.find(
                      (c) =>
                        c.nome_ && c.nome_.toLowerCase().trim() === _nomeEnc,
                    ) || null;
                  if (_contratoEnc) _buscaEnc = _contratoEnc.nome_;
                }
              } catch { }
            }

            // Fallback: buscar por link do grupo
            if (!_contratoEnc) {
              try {
                const _codeEnc = await conn.groupInviteCode(from);
                if (_codeEnc) {
                  _contratoEnc = getAluguelByLink(
                    `https://chat.whatsapp.com/${_codeEnc}`,
                  );
                  if (_contratoEnc)
                    _buscaEnc = _contratoEnc.id_gp || _contratoEnc.nome_;
                }
              } catch { }
            }
          } else {
            // No privado: buscar pelo argumento (ID, link ou nome)
            const argEnc = q.trim();
            if (!argEnc) {
              return reply(
                `💡 *Uso:*\n${prefix}encerraraluguel <ID, link ou nome>\n\nExemplo:\n${prefix}encerraraluguel 120363xxx@g.us\n${prefix}encerraraluguel Staff Bot\n${prefix}encerraraluguel https://chat.whatsapp.com/ABC\n\n💡 Ou use o comando *dentro do grupo*.`,
              );
            }

            // Buscar por ID
            if (argEnc.endsWith("@g.us")) {
              _contratoEnc = getAluguelByGrupo(argEnc);
            }
            // Buscar por link
            else if (argEnc.includes("chat.whatsapp.com")) {
              _contratoEnc = getAluguelByLink(argEnc);
            }
            // Buscar por nome
            else {
              const _todosEnc = getAluguel();
              _contratoEnc =
                _todosEnc.find(
                  (c) =>
                    c.nome_ &&
                    c.nome_.toLowerCase().includes(argEnc.toLowerCase()),
                ) || null;
            }
            _buscaEnc = argEnc;
          }

          if (!_contratoEnc) {
            return reply(
              `❌ Nenhum contrato encontrado${_buscaEnc ? ` para *${_buscaEnc.split("@")[0]}*` : ""}.`,
            );
          }

          // Remover usando o identificador mais confiável
          const _idRemover = _contratoEnc.id_gp || _contratoEnc.nome_;
          const removidoC = removerContrato(_idRemover);
          if (!removidoC) {
            return reply(`❌ Erro ao remover o contrato. Tente novamente.`);
          }

          // Avisar o grupo e sair (se tiver id_gp válido)
          if (removidoC.id_gp) {
            try {
              await conn.sendMessage(removidoC.id_gp, {
                text: `⏰ *O contrato de uso do bot neste grupo foi encerrado.*\n\nPara reativar, entre em contato:\n📞 wa.me/${numerodono_ofc}`,
              });
            } catch { }

            try {
              await conn.groupLeave(removidoC.id_gp);
            } catch { }
          }

          const msgEncerrado = `✅ *Contrato encerrado com sucesso!*\n\n🗑️ Grupo: *${removidoC.nome_}*\n🚪 Bot saiu do grupo.`;
          if (isGroup) {
            try {
              await conn.sendMessage(numerodono_ofc + "@s.whatsapp.net", {
                text: msgEncerrado,
              });
            } catch { }
          } else {
            reply(msgEncerrado);
          }
          break;
        }

        // ── DONO: Zerar todos os contratos ──
        case "zeraraluguel":
        case "limparalugueis": {
          if (!SoDono) return reply(Res_SoDono);

          const _listaZerar = getAluguel();
          if (!_listaZerar || _listaZerar.length === 0) {
            return reply(`📋 Nenhum contrato cadastrado para zerar.`);
          }

          if (isGroup) {
            // Envia no PV do dono e avisa no grupo
            reply(
              `🔒 Este comando só pode ser confirmado no *privado* do bot.\n\n💡 Verifique seu PV!`,
            );
            try {
              await conn.sendMessage(sender, {
                text: `╔══════════════════════════╗\n║  ⚠️ *ZERAR TODOS OS ALUGUÉIS*  ║\n╚══════════════════════════╝\n\n🗑️ Você está prestes a *excluir TODOS* os\n*${_listaZerar.length} contrato(s)* de aluguel do bot.\n\n❗ *Esta ação é irreversível!*\n\nDigite:\n✅ *confirmar* — para apagar tudo\n❌ *cancelar* — para desistir\n\n⏰ _Você tem 60 segundos para responder._`,
              });
              _pendingZerarAluguel.set(sender, {
                timestamp: Date.now(),
                total: _listaZerar.length,
              });
              setTimeout(() => _pendingZerarAluguel.delete(sender), 60000);
            } catch {
              reply(
                `❌ Não foi possível enviar a confirmação no seu PV. Verifique se você já iniciou conversa com o bot.`,
              );
            }
            break;
          }

          // PV direto
          await conn.sendMessage(from, {
            text: `╔══════════════════════════╗\n║  ⚠️ *ZERAR TODOS OS ALUGUÉIS*  ║\n╚══════════════════════════╝\n\n🗑️ Você está prestes a *excluir TODOS* os\n*${_listaZerar.length} contrato(s)* de aluguel do bot.\n\n❗ *Esta ação é irreversível!*\n\nDigite:\n✅ *confirmar* — para apagar tudo\n❌ *cancelar* — para desistir\n\n⏰ _Você tem 60 segundos para responder._`,
          });
          _pendingZerarAluguel.set(sender, {
            timestamp: Date.now(),
            total: _listaZerar.length,
          });
          setTimeout(() => _pendingZerarAluguel.delete(sender), 60000);
          break;
        }

        // ── DONO: Verificação manual de contratos ──
        case "alertaaluguel":
        case "checkalugueis": {
          if (!SoDono) return reply(Res_SoDono);

          const listaCheck = getAluguel();
          if (!listaCheck || listaCheck.length === 0) {
            const msgNenhum = `📋 Nenhum contrato cadastrado.`;
            if (isGroup) {
              reply(`📨 Enviei no seu *privado*.`);
              try {
                await conn.sendMessage(numerodono_ofc + "@s.whatsapp.net", {
                  text: msgNenhum,
                });
              } catch { }
            } else {
              reply(msgNenhum);
            }
            break;
          }

          const agoraCheck = Math.floor(Date.now() / 1000);
          let resumoCheck = `🔍 *Verificação Manual de Contratos*\n\nTotal: ${listaCheck.length} contrato(s)\n\n`;

          listaCheck.forEach((c, i) => {
            const r = c.vencimento - agoraCheck;
            const dias = Math.floor(r / 86400);
            const horas = Math.floor((r % 86400) / 3600);
            const vencFmt = moment
              .unix(c.vencimento)
              .tz("America/Sao_Paulo")
              .format("DD/MM/YYYY HH:mm");
            let st;
            if (r <= 0) st = `🔴 VENCIDO`;
            else if (dias <= 1) st = `🚨 ${horas}h restante(s)`;
            else if (dias <= 3) st = `🟡 ${dias}d ${horas}h`;
            else st = `🟢 ${dias}d ${horas}h`;
            resumoCheck += `${i + 1}. *${c.nome_}*\n   ${st} — vence ${vencFmt}\n   👤 ${c.responsavel_nome} | 📞 ${c.responsavel_contato}\n\n`;
          });

          if (isGroup) {
            reply(`📨 Enviei o relatório no seu *privado*.`);
            try {
              await conn.sendMessage(numerodono_ofc + "@s.whatsapp.net", {
                text: resumoCheck.trim(),
              });
            } catch { }
          } else {
            reply(resumoCheck.trim());
          }
          break;
        }

        // ── TUTORIAL COMPLETO DO SISTEMA ──
        case "infoaluguel":
        case "aluguelinfo": {
          if (!SoDono) return reply(`⚠️ Comando exclusivo para o dono do bot.`);

          const txtInfo = `╔════════════════════════════════════════╗
║   📚 TUTORIAL COMPLETO — SISTEMA DE ALUGUEL
╚════════════════════════════════════════╝

O *Sistema de Aluguel Profissional* gerencia contratos de locação com um fluxo por etapas guiado e automação total.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ *COMO FUNCIONA?*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O bot verifica os contratos *automaticamente* a cada hora:

• Faltando *3 dias* → aviso no seu privado
• Faltando *1 dia* → alerta crítico no privado
• *Expirou* → avisa o grupo, sai e notifica você

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ *COMANDOS DISPONÍVEIS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *${prefix}alugarbot*
Inicia o *contrato por etapas* no privado.
Pode ser usado de 3 formas:

  ✦ *No grupo:* ${prefix}alugarbot
  _Coleta nome e link automaticamente_

  ✦ *Com link:* ${prefix}alugarbot <link>
  _Ex: ${prefix}alugarbot https://chat.whatsapp.com/ABC_

  ✦ *Com ID:* ${prefix}alugarbot <ID>
  _Ex: ${prefix}alugarbot 120363xxx@g.us_
  _Use ${prefix}idgrupo dentro do grupo para obter o ID_

O bot guia por *6 etapas* no privado:
  1️⃣ Nome do grupo
  2️⃣ Link do grupo
  3️⃣ Nome do responsável (cliente)
  4️⃣ Contato do responsável
  5️⃣ Quantidade de dias
  6️⃣ Valor do aluguel
  ✅ Confirmação com resumo completo

📌 *${prefix}idgrupo*
_Usar dentro do grupo_
Mostra o ID do grupo atual (para usar com ${prefix}alugarbot).

📌 *${prefix}alugados*
Painel completo de TODOS os contratos.
Se usado no grupo → envia no seu privado.

📌 *${prefix}alugado: <nome ou link>*
Ficha detalhada de um contrato.

📌 *${prefix}renovaraluguel*
_No grupo:_ ${prefix}renovaraluguel
_Com link:_ ${prefix}renovaraluguel <link>
_Com ID:_ ${prefix}renovaraluguel <ID>
_Com nome:_ ${prefix}renovaraluguel <nome do grupo>
O bot exibe o contrato e guia a renovação por etapas.

📌 *${prefix}encerraraluguel*
_No grupo: encerra este grupo_
_No PV: ${prefix}encerraraluguel <ID>_
Bot avisa o grupo e sai automaticamente.

📌 *${prefix}alertaaluguel*
Verificação manual de todos os contratos.

📌 *${prefix}alugar*
_Comando PÚBLICO_ — redireciona clientes ao dono.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *PASSO A PASSO*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Entre no grupo do cliente
2️⃣ Envie *${prefix}alugarbot*
3️⃣ Bot avisa no grupo e envia contrato no PV
4️⃣ Responda as 6 etapas no privado
5️⃣ Confirme com *sim*
6️⃣ Bot envia imagem de contrato no grupo ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 *INFORMAÇÕES IMPORTANTES*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Todas as informações sensíveis vão *só no privado*
• Envie *cancelar* durante o fluxo para desistir
• O fluxo expira em *10 minutos* sem resposta
• Contratos são salvos com data/hora automaticamente
• Use ${prefix}idgrupo para obter o ID do grupo`;

          if (isGroup) {
            reply(`📨 Enviei o tutorial completo no seu *privado*.`);
            try {
              await conn.sendMessage(numerodono_ofc + "@s.whatsapp.net", {
                text: txtInfo,
              });
            } catch { }
          } else {
            reply(txtInfo);
          }
          break;
        }

        // ─────────────────────────────────────────────────────────────────

        // ══════════════════════ SISTEMA DE MUTE ══════════════════════

        // ── ADM: Mutar usuário ──
        case "mute":
        case "mutar":
        case "silenciar": {
          if (!isGroup)
            return reply(`❌ Este comando só funciona em *grupos*.`);
          if (!isGroupAdmins && !SoDono)
            return reply(
              `❌ Apenas *administradores* podem usar este comando.`,
            );
          if (!isBotGroupAdmins)
            return reply(
              `❌ Eu preciso ser *administrador* do grupo para apagar mensagens.`,
            );

          // ══ IDENTIFICAR ALVO ══
          let _muteAlvo = null;
          let _muteArgs = q ? q.trim() : "";

          // 1. Menção direta (@pessoa)
          if (menc_os2) {
            _muteAlvo = menc_os2;
          }
          // 2. Mensagem citada (respondendo mensagem de alguém)
          else if (
            info?.message?.extendedTextMessage?.contextInfo?.participant
          ) {
            _muteAlvo =
              info.message.extendedTextMessage.contextInfo.participant;
          } else if (
            info?.message?.extendedTextMessage?.contextInfo?.stanzaId
          ) {
            const _ctxP =
              info.message.extendedTextMessage.contextInfo.participant;
            if (_ctxP) _muteAlvo = _ctxP;
          }
          // 3. Número digitado nos args (extrair primeiro bloco numérico >= 8 dígitos)
          else if (_muteArgs) {
            const _numMatch = _muteArgs.match(/(\d{8,})/);
            if (_numMatch) {
              _muteAlvo = _numMatch[1] + "@s.whatsapp.net";
              _muteArgs = _muteArgs.replace(_numMatch[0], "").trim();
            }
          }

          if (!_muteAlvo) {
            return reply(
              `❌ *Uso incorreto!*\n\n💡 *Como usar:*\n${prefix}mute @user — Permanente\n${prefix}mute @user 30m — 30 min\n${prefix}mute @user 2h — 2 horas\n${prefix}mute @user 1d — 1 dia\n${prefix}mute @user motivo 30m\n\nOu responda a msg com *${prefix}mute*`,
            );
          }

          // Normalizar o JID
          _muteAlvo = _muteAlvo.includes(":")
            ? _muteAlvo.split(":")[0] + "@s.whatsapp.net"
            : _muteAlvo;

          // ══ PARSEAR DURAÇÃO E MOTIVO ══
          let _muteDurationMs = null;
          let _muteDurationTxt = "Permanente ♾️";
          let _muteMotivo = "";

          if (_muteArgs) {
            // Extrair tempo de qualquer posição (30m, 2h, 1d, etc)
            const _dMatch = _muteArgs.match(
              /(\d+)\s*(m|min|minutos?|h|hr|horas?|d|dia|dias?)/i,
            );
            if (_dMatch) {
              const _val = parseInt(_dMatch[1]);
              const _unit = _dMatch[2].toLowerCase();
              if (_unit.startsWith("m")) {
                _muteDurationMs = _val * 60 * 1000;
                _muteDurationTxt = `${_val} minuto${_val > 1 ? "s" : ""}`;
              } else if (_unit.startsWith("h")) {
                _muteDurationMs = _val * 60 * 60 * 1000;
                _muteDurationTxt = `${_val} hora${_val > 1 ? "s" : ""}`;
              } else if (_unit.startsWith("d")) {
                _muteDurationMs = _val * 24 * 60 * 60 * 1000;
                _muteDurationTxt = `${_val} dia${_val > 1 ? "s" : ""}`;
              }
              // Remover o tempo do texto para sobrar o motivo
              _muteMotivo = _muteArgs.replace(_dMatch[0], "").trim();
            } else {
              // Sem padrão de tempo — tudo é motivo
              _muteMotivo = _muteArgs;
            }
          }

          // Não pode mutar o dono, o bot, ou a si mesmo
          const _muteNum = _muteAlvo.split("@")[0];
          if (_muteAlvo === sender || _muteNum === sender.split("@")[0]) {
            return reply(`❌ Você não pode se silenciar.`);
          }
          if (_muteNum === botNumber || _muteNum === numerodono_ofc) {
            return reply(`❌ Não é possível silenciar o *bot* ou o *dono*.`);
          }

          // Verificar se já está mutado
          if (isMuted(from, _muteAlvo)) {
            const _mutados = getMutedUsers(from);
            const _infoMut = _mutados.find(
              (m) => m.jid === normalizeJid(_muteAlvo) || m.number === _muteNum,
            );
            let _jaJid = _muteAlvo;
            if (groupMembers && groupMembers.length > 0) {
              const _jaFound = groupMembers.find(
                (gm) =>
                  extractNumber(typeof gm.id === "string" ? gm.id : "") ===
                  _muteNum,
              );
              if (_jaFound && _jaFound.id)
                _jaJid = _jaFound.id.includes(":")
                  ? _jaFound.id.split(":")[0] + "@s.whatsapp.net"
                  : _jaFound.id;
            }
            const _jaDur =
              _infoMut?.durationText ||
              (_infoMut?.expiresAt ? "Temporário" : "Permanente ♾️");
            await conn.sendMessage(
              from,
              {
                text: `⚠️ @${extractNumber(_jaJid)} já está *silenciado*\n⏱️ ${_jaDur}\n🗑️ Msgs apagadas: *${_infoMut?.deletedMessages || 0}*\n💡 Use *${prefix}desmute*`,
                mentions: [_jaJid],
              },
              { quoted: info },
            );
            return;
          }

          // Verificar se é admin (não pode mutar admin)
          const _isAlvoAdmin = groupMembers?.some((m) => {
            const mId = m.id?.split(":")[0] + "@s.whatsapp.net";
            return (
              (mId === _muteAlvo || m.id === _muteAlvo) &&
              (m.admin === "admin" || m.admin === "superadmin")
            );
          });
          if (_isAlvoAdmin) {
            return reply(`❌ Não é possível silenciar um *administrador*.`);
          }

          // ══ MUTAR O USUÁRIO ══
          const _muteReason = _muteMotivo || "Silenciado por admin";
          const _muteOk = muteUser(
            from,
            _muteAlvo,
            sender,
            _muteReason,
            _muteDurationMs,
            _muteDurationTxt,
          );

          if (!_muteOk) {
            return reply(`❌ Erro ao silenciar. Tente novamente.`);
          }

          let _muteTxt = `🔇 @${_muteNum} foi *silenciado*\n⏱️ ${_muteDurationTxt}`;
          if (_muteMotivo) _muteTxt += `\n📝 Motivo: ${_muteMotivo}`;
          _muteTxt += `\n🔨 Por: @${sender.split("@")[0]}\n💡 ${prefix}desmute @${_muteNum}`;

          try {
            await conn.sendMessage(from, {
              react: { text: "🔇", key: info.key },
            });
            await conn.sendMessage(
              from,
              {
                text: _muteTxt,
                mentions: [_muteAlvo, sender],
              },
              { quoted: info },
            );
          } catch {
            reply(_muteTxt);
          }
          break;
        }

        // ── ADM: Desmutar usuário ──
        case "desmute":
        case "delmute":
        case "desmutar":
        case "unmute": {
          if (!isGroup)
            return reply(`❌ Este comando só funciona em *grupos*.`);
          if (!isGroupAdmins && !SoDono)
            return reply(
              `❌ Apenas *administradores* podem usar este comando.`,
            );

          // Identificar o alvo
          let _unmuteAlvo = null;

          if (menc_os2) {
            _unmuteAlvo = menc_os2;
          } else if (
            info?.message?.extendedTextMessage?.contextInfo?.participant
          ) {
            _unmuteAlvo =
              info.message.extendedTextMessage.contextInfo.participant;
          } else if (q && q.trim().length >= 8) {
            const _numUnm = q.trim().replace(/[^0-9]/g, "");
            if (_numUnm.length >= 8) {
              _unmuteAlvo = _numUnm + "@s.whatsapp.net";
            }
          }

          if (!_unmuteAlvo) {
            return reply(
              `❌ *Uso incorreto!*\n\n💡 *Como usar:*\n${prefix}delmute @pessoa\n${prefix}delmute 5511999999999\nOu responda a mensagem com *${prefix}delmute*`,
            );
          }

          _unmuteAlvo = _unmuteAlvo.includes(":")
            ? _unmuteAlvo.split(":")[0] + "@s.whatsapp.net"
            : _unmuteAlvo;

          // Resolver LID para JID real
          let _unJid = _unmuteAlvo;
          const _unNum = extractNumber(_unmuteAlvo);
          if (groupMembers && groupMembers.length > 0) {
            const _unF = groupMembers.find(
              (gm) =>
                extractNumber(typeof gm.id === "string" ? gm.id : "") ===
                _unNum,
            );
            if (_unF && _unF.id)
              _unJid = _unF.id.includes(":")
                ? _unF.id.split(":")[0] + "@s.whatsapp.net"
                : _unF.id;
          }
          const _unDisplay = extractNumber(_unJid);

          const _unmuteData = unmuteUser(from, _unmuteAlvo);
          if (!_unmuteData) {
            await conn.sendMessage(
              from,
              {
                text: `❌ @${_unDisplay} *não está silenciado* neste grupo.`,
                mentions: [_unJid],
              },
              { quoted: info },
            );
            return;
          }

          await conn.sendMessage(from, {
            react: { text: "🔊", key: info.key },
          });
          const _unTxt = `🔊 @${_unDisplay} *desmutado*\n🗑️ Msgs apagadas: *${_unmuteData.deletedMessages || 0}*\n🔨 Por: @${sender.split("@")[0]}`;

          await conn.sendMessage(from, {
            text: _unTxt,
            mentions: [_unJid, sender],
          });
          break;
        }

        // ── ADM: Listar mutados do grupo ──
        case "mutados":
        case "listamute":
        case "listamutados": {
          if (!isGroup)
            return reply(`❌ Este comando só funciona em *grupos*.`);

          await conn.sendMessage(from, {
            react: { text: "📋", key: info.key },
          });
          const _listaMut = getMutedUsers(from);
          if (_listaMut.length === 0) {
            return reply(
              `✅ Nenhum mutado neste grupo.\n\n💡 Use *${prefix}mute @user* para silenciar.`,
            );
          }

          const _agoraMut = moment().tz("America/Sao_Paulo");
          const _mentionsMut = [];

          let _txtMut = `╭──────────────────╮\n│ 🔇 *MUTADOS*\n│ ${groupName}\n╰──────────────────╯\n\n`;

          _listaMut.forEach((m, i) => {
            // Resolver LID para número real
            let _realJid = m.jid;
            const _storedNum = extractNumber(m.jid);
            if (groupMembers && groupMembers.length > 0) {
              const _found = groupMembers.find(
                (gm) =>
                  extractNumber(typeof gm.id === "string" ? gm.id : "") ===
                  _storedNum,
              );
              if (_found && _found.id)
                _realJid = _found.id.includes(":")
                  ? _found.id.split(":")[0] + "@s.whatsapp.net"
                  : _found.id;
            }
            const _displayNum = extractNumber(_realJid);

            // Resolver mutedBy
            let _byJid = m.mutedBy || null;
            if (_byJid && groupMembers && groupMembers.length > 0) {
              const _byNum2 = extractNumber(_byJid);
              const _byF = groupMembers.find(
                (gm) =>
                  extractNumber(typeof gm.id === "string" ? gm.id : "") ===
                  _byNum2,
              );
              if (_byF && _byF.id)
                _byJid = _byF.id.includes(":")
                  ? _byF.id.split(":")[0] + "@s.whatsapp.net"
                  : _byF.id;
            }
            const _byDisplay = _byJid ? extractNumber(_byJid) : "???";

            _mentionsMut.push(_realJid);
            if (_byJid) _mentionsMut.push(_byJid);

            const _durTxt =
              m.durationText || (m.expiresAt ? "Temporário" : "Permanente ♾️");

            _txtMut += `╭──────────────────╮\n`;
            _txtMut += `│ *${i + 1}.* 🔇 @${_displayNum}\n`;
            _txtMut += `│ ⏱️ ${_durTxt}\n`;
            if (
              m.reason &&
              m.reason !== "Silenciado por admin" &&
              m.reason !== "Não especificado"
            ) {
              _txtMut += `│ 📝 Motivo: ${m.reason}\n`;
            }
            _txtMut += `│ 🗑️ ${m.deletedMessages || 0} msgs apagadas\n`;
            _txtMut += `│ 🔨 @${_byDisplay}\n`;
            _txtMut += `╰──────────────────╯\n`;
            if (i < _listaMut.length - 1) _txtMut += `\n`;
          });

          _txtMut += `\n💡 *${prefix}desmute @user* para desmutar`;

          try {
            const _muteBannerBuf = fs.readFileSync("./dados/muted_banner.png");
            await conn.sendMessage(
              from,
              {
                image: _muteBannerBuf,
                caption: _txtMut,
                mentions: _mentionsMut,
              },
              { quoted: info },
            );
          } catch {
            await conn.sendMessage(
              from,
              {
                text: _txtMut,
                mentions: _mentionsMut,
              },
              { quoted: info },
            );
          }
          break;
        }

        // ── TUTORIAL DO MUTE ──
        case "infomute":
        case "muteinfo": {
          await conn.sendMessage(from, {
            react: { text: "ℹ️", key: info.key },
          });
          const _infoMuteTxt = `🔇 *GUIA — SISTEMA DE MUTE*
━━━━━━━━━━━━━━━━━

⚙️ *COMO FUNCIONA?*

Admins podem silenciar membros.
Quando mutado:
• Toda msg é *apagada na hora*
• Textos, fotos, áudios, stickers
• Funciona *por grupo* individual
• Status aparece no ${prefix}perfil

━━━━━━━━━━━━━━━━━
🛠️ *COMANDOS*
━━━━━━━━━━━━━━━━━

🔇 *${prefix}mute @user*
_Silencia o membro no grupo_
✦ Permanente: ${prefix}mute @user
✦ Com tempo: ${prefix}mute @user 30m
✦ Com motivo: ${prefix}mute @user motivo
✦ Completo: ${prefix}mute @user motivo 30m
✦ Formatos: 30m / 2h / 1d

💡 *Motivo e tempo são opcionais*
_Sem tempo = permanente_
_Sem motivo = sem motivo registrado_

🔊 *${prefix}desmute* @user
_Remove o mute da pessoa_

📋 *${prefix}mutados*
_Lista todos os mutados com motivo_

🧹 *${prefix}limparmute*
_Limpa todos os mutados_

━━━━━━━━━━━━━━━━━
⚠️ *REGRAS*
━━━━━━━━━━━━━━━━━

• Só *admins* podem mutar
• Bot precisa ser *admin*
• Não muta admins/dono/bot
• Mute é *individual por grupo*
• 10+ msgs em 15s = advertência

⚡ _Bronxys Host_`;

          try {
            const _infoMuteBuf = fs.readFileSync("./dados/infomute_banner.png");
            await conn.sendMessage(
              from,
              {
                image: _infoMuteBuf,
                caption: _infoMuteTxt,
              },
              { quoted: info },
            );
          } catch {
            reply(_infoMuteTxt);
          }
          break;
        }

        case "infolistanegra":
        case "infoblacklist":
        case "infolistban": {
          await conn.sendMessage(from, {
            react: { text: "🚫", key: info.key },
          });
          const _infoLNTxt = `🚫 *GUIA — SISTEMA DE LISTA NEGRA*
━━━━━━━━━━━━━━━━━

⚙️ *COMO FUNCIONA?*

A Lista Negra é um sistema de *banimento permanente* por grupo. Quando um número é adicionado à lista negra, se ele entrar no grupo novamente, o bot irá:

• *Remover automaticamente* na hora
• *Notificar todos os ADMs* do grupo
• Usar a *legenda personalizada* (se configurada)

O sistema também possui uma *Lista Negra Global* (apenas para o dono do bot), que funciona em *todos os grupos* onde o bot está.

━━━━━━━━━━━━━━━━━
🛠️ *COMANDOS — LISTA DO GRUPO*
━━━━━━━━━━━━━━━━━

🚫 *${prefix}listanegra @user*
_Adiciona o membro à lista negra do grupo_
✦ Por marcação: ${prefix}listanegra @user
✦ Por número: ${prefix}listanegra 5511999999999
✦ Por resposta: responda a msg + ${prefix}listanegra

✅ *${prefix}tirardalista @user*
_Remove o membro da lista negra_
✦ Mesmos formatos acima

📋 *${prefix}listban*
_Lista todos os números na lista negra_

✏️ *${prefix}legenda_listanegra [texto]*
_Personaliza a mensagem ao banir_
✦ Use #numerodele# para inserir o número
✦ Ex: ${prefix}legenda_listanegra Banido @#numerodele#!

━━━━━━━━━━━━━━━━━
🌐 *COMANDOS — LISTA GLOBAL (DONO)*
━━━━━━━━━━━━━━━━━

🚫 *${prefix}listanegrag @user*
_Adiciona à lista negra de TODOS os grupos_

✅ *${prefix}tirardalistag @user*
_Remove da lista negra global_

━━━━━━━━━━━━━━━━━
📌 *OBSERVAÇÕES*
━━━━━━━━━━━━━━━━━

• Só *ADMs* podem gerenciar a lista (bot ADM)
• A detecção ocorre *automaticamente na entrada*
• Lista global tem prioridade sobre a local
• Lista é *por grupo* (independente)
• Compatível com LID (Baileys 7.0+)

⚡ _Bronxys Host_`;

          reply(_infoLNTxt);
          break;
        }

        // ── ADM: Limpar todos os mutados ──
        case "limparmute":
        case "zerarmute":
        case "clearmute": {
          if (!isGroup)
            return reply(`❌ Este comando só funciona em *grupos*.`);
          if (!isGroupAdmins && !SoDono)
            return reply(
              `❌ Apenas *administradores* podem usar este comando.`,
            );

          await conn.sendMessage(from, {
            react: { text: "🧹", key: info.key },
          });
          const _mutadosAntes = getMutedUsers(from);
          if (_mutadosAntes.length === 0) {
            return reply(`✅ Nenhum mutado neste grupo.`);
          }

          // Limpar todos os mutados
          saveGroupMuteData(from, {});

          await conn.sendMessage(
            from,
            {
              text: `🧹 *LISTA DE MUTE LIMPA!*\n━━━━━━━━━━━━━━━━━\n\n✅ *${_mutadosAntes.length}* usuário(s) desmutado(s)\n🔊 Todos podem falar novamente\n\n🔨 Limpo por: @${sender.split("@")[0]}\n\n⚡ _Bronxys Host_`,
              mentions: [sender],
            },
            { quoted: info },
          );
          break;
        }

        // ═══════════════════ FIM DO SISTEMA DE MUTE ═══════════════════

        // ── ADM: Limpar TODAS as advertências do grupo ──
        case "limparadv":
        case "clearadv":
        case "zeraradv": {
          if (!isGroup)
            return reply(`❌ Este comando só funciona em *grupos*.`);
          if (!isGroupAdmins && !SoDono)
            return reply(`❌ Apenas *administradores*.`);

          const _totalLimpo = clearAllGroupWarnings(from);
          if (_totalLimpo === 0)
            return reply(`✅ Nenhum membro advertido neste grupo.`);

          await conn.sendMessage(
            from,
            {
              text: `🧹 *ADVERTÊNCIAS ZERADAS!*\n\n✅ *${_totalLimpo}* membro(s) tiveram suas advertências removidas.\n🔨 Por: @${sender.split("@")[0]}`,
              mentions: [sender],
            },
            { quoted: info },
          );
          break;
        }

        // ── Tutorial do Sistema de Advertências ──
        case "infoadv":
        case "infoadvertencia":
        case "advinfo": {
          const _infoAdvTxt = `⚠️ *GUIA — SISTEMA DE ADVERTÊNCIAS*

╭──────────────────╮
│ ⚙️ *O QUE É?*
│ Sistema unificado de punições
│ para membros que infringem
│ regras do grupo.
╰──────────────────╯

╭──────────────────╮
│ 🚨 *PUNIÇÕES*
│ 1ª Advertência: Aviso 1/3
│ 2ª Advertência: Aviso 2/3
│ 3ª Advertência: *BAN*
╰──────────────────╯

╭──────────────────╮
│ 🤖 *AUTOMÁTICO*
│ Advertências também são
│ aplicadas automaticamente:
│
│ 🛡️ *Anti-Spam* — Se ativado,
│ 6+ msgs em 8s = advertência
│
│ 🔇 *Mute Flood* — Se mutado
│ e enviar 10+ msgs em 15s
╰──────────────────╯

╭──────────────────╮
│ 📌 *PERFIL*
│ A qtd de advertências
│ aparece no ${prefix}perfil
│ de cada usuário registrado.
╰──────────────────╯

🛠️ *COMANDOS*
• *${prefix}adv @user motivo*
  Advertir manualmente
• *${prefix}advertidos*
  Lista com motivos e datas
• *${prefix}deladv1 @user*
  Remove advertência 1
• *${prefix}deladv2 @user*
  Remove advertência 2
• *${prefix}deladv @user*
  Remove (se só 1 adv)
• *${prefix}limparadv*
  Zera TODOS os advertidos

💡 *Formas de marcar:*
• @mencionando no grupo
• Respondendo a msg do user
• Número: ${prefix}adv 5511999 motivo

⚡ _Bronxys Host_`;

          try {
            const _infoAdvBuf = fs.readFileSync("./dados/infoadv_banner.png");
            await conn.sendMessage(
              from,
              {
                image: _infoAdvBuf,
                caption: _infoAdvTxt,
              },
              { quoted: info },
            );
          } catch {
            reply(_infoAdvTxt);
          }
          break;
        }

        // ══════════════════ SISTEMA ANTI-SPAM ══════════════════


        // ── ADM: Ativar/Desativar Anti-Spam ──
        case "antispam": {
          if (!isGroup) return reply(`❌ Apenas em *grupos*.`);
          if (!isGroupAdmins && !SoDono)
            return reply(`❌ Apenas *administradores*.`);

          try {
            const _asFile = `./dados/grupos/${from}.json`;
            let _asData = [{}];
            if (fs.existsSync(_asFile)) {
              _asData = JSON.parse(fs.readFileSync(_asFile, "utf8"));
              if (!Array.isArray(_asData) || !_asData[0]) _asData = [{}];
            }
            const _asAtual = _asData[0].antispam === true;
            _asData[0].antispam = !_asAtual;
            fs.writeFileSync(_asFile, JSON.stringify(_asData, null, 2), "utf8");

            const _asStatus = !_asAtual;
            const _asTxt = _asStatus
              ? `🛡️ *Anti-Spam ATIVADO*\n\n⚙️ Configuração:\n• Limite: *6 mensagens*\n• Tempo: *8 segundos*\n• Sistema: Advertências progressivas\n\n📋 Como funciona:\n1️⃣ Primeira detecção: Advertência *1/3*\n2️⃣ Segunda detecção: Advertência *2/3*\n3️⃣ Terceira detecção: *BAN automático*\n\n✅ Usuários protegidos:\n• Administradores\n• Dono do bot\n\n💡 *${prefix}infoantispam* p/ mais detalhes\n_(Use novamente para desativar)_`
              : `🔓 *Anti-Spam DESATIVADO*\n\nFlood de mensagens não será detectado.\n_(Use novamente para ativar)_`;

            await conn.sendMessage(from, { text: _asTxt }, { quoted: info });
          } catch (e) {
            reply(`❌ Erro: ${e.message}`);
          }
          break;
        }

        // ── ADM: Ativar/Desativar Anti-Status ──
        case "antistatus": {
          if (!isGroup) return reply(`❌ Apenas em *grupos*.`);
          if (!isGroupAdmins && !SoDono)
            return reply(`❌ Apenas *administradores*.`);

          try {
            const _astFile = `./dados/grupos/${from}.json`;
            let _astData = [{}];
            if (fs.existsSync(_astFile)) {
              _astData = JSON.parse(fs.readFileSync(_astFile, "utf8"));
              if (!Array.isArray(_astData) || !_astData[0]) _astData = [{}];
            }
            const _astAtual = _astData[0].antistatus === true;
            _astData[0].antistatus = !_astAtual;
            fs.writeFileSync(
              _astFile,
              JSON.stringify(_astData, null, 2),
              "utf8",
            );

            const _astStatus = !_astAtual;
            const _astTxt = _astStatus
              ? `🛡️ *Anti-Status ATIVADO*\n\n⚙️ O bot vai detectar quando alguém marcar este grupo no status do WhatsApp.\n\n🚫 Quem marcar será *removido automaticamente*.\n\n✅ Protegidos:\n• Administradores\n• Dono do bot\n\n💡 *${prefix}infoantistatus* p/ mais detalhes\n_(Use novamente para desativar)_`
              : `🔓 *Anti-Status DESATIVADO*\n\nMembros podem marcar o grupo no status livremente.\n_(Use novamente para ativar)_`;

            await conn.sendMessage(from, { text: _astTxt }, { quoted: info });
          } catch (e) {
            reply(`❌ Erro: ${e.message}`);
          }
          break;
        }

        // ── Tutorial Anti-Status ──
        case "infostatus":
        case "infoantistatus":
        case "antistatusinfo": {
          reply(`🛡️ *GUIA — SISTEMA ANTI-STATUS*

╭──────────────────╮
│ ⚙️ *O QUE É?*
│ Detecta quando um membro
│ marca/menciona o grupo no
│ status do WhatsApp e remove
│ automaticamente.
╰──────────────────╯

╭──────────────────╮
│ 📌 *COMO FUNCIONA?*
│
│ 1. Membro posta status
│    marcando o grupo
│ 2. Bot detecta a menção
│ 3. Membro é removido
│ 4. Aviso enviado no grupo
╰──────────────────╯

╭──────────────────╮
│ ✅ *PROTEGIDOS*
│ • Administradores
│ • Dono do bot
╰──────────────────╯

> 🛠️ *COMANDOS*
> • *${prefix}antistatus* — ativar/desativar
> • *${prefix}infoantistatus* — este tutorial

> ⚠️ *REQUISITOS*
> • Bot precisa ser *admin*

> ⚡ _Bronxys Host_`);
          break;
        }

        // ── Tutorial Anti-Spam ──
        case "infoantispam":
        case "antispaminfo": {
          const _infoAsTxt = `🛡️ *GUIA — SISTEMA ANTI-SPAM*

╭──────────────────╮
│ ⚙️ *O QUE É?*
│ Detecta e pune usuários
│ que enviam muitas msgs
│ em curto espaço de tempo.
╰──────────────────╯

╭──────────────────╮
│ 📊 *CONFIGURAÇÃO*
│ • Limite: 6 msgs
│ • Janela: 8 segundos
│ • Advertências: 3
╰──────────────────╯

╭──────────────────╮
│ 🚨 *PUNIÇÕES*
│ 1ª Vez: Advertência 1/3
│ 2ª Vez: Advertência 2/3
│ 3ª Vez: BAN automático
╰──────────────────╯

╭──────────────────╮
│ ✅ *ISENTOS*
│ • Administradores
│ • Dono do bot
╰──────────────────╯

🛠️ *COMANDOS*
• *${prefix}antispam* — Ativar/Desativar
• *${prefix}infoantispam* — Este guia

⚡ _Bronxys Host_`;

          reply(_infoAsTxt);
          break;
        }

        // ════════════════ FIM SISTEMA ANTI-SPAM ════════════════

        // ─────────────────────────────────────────────────────────────────

        case "reiniciar":
          if (!SoDono) return;
          setTimeout(async () => {
            reply("_♻️ Ｒｅｉｎｉｃｉａｎｄｏ...✨_");
            setTimeout(async () => {
              process.exit();
            }, 1200);
          }, 1000);
          break;

        //==========(Sticker-Stickers)===========\\

        case "emoji":
        case "semoji":
          try {
            if (!q.trim()) return reply(`Exemplo: ${prefix}emoji ☹️/whatsapp`);
            var [emoji, nm] = q.split("/");
            var ABC = await reqapi.semoji(emoji, nm);
            sendStickerFromUrl(from, ABC.rst);
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "emoji-mix":
        case "emojimix":
          var [emj1, emj2] = q.trim().split("+");
          if (!q.includes("+"))
            return reply(
              `Olá, está faltando o +\nExemplo: ${prefix + command} 👿+😇`,
            );
          try {
            reply(Res_Aguarde);
            sendStickerFromUrl(from, reqapi.emojimix(emj1, emj2));
          } catch (e) {
            return reply(
              "*Ops não foi possivel fazer esse mix de emoji / Ou ocorreu algum problema no sistema..*",
            );
          }
          break;

        case "figfundo":
        case "figvideo":
        case "figusemfundo":
        case "sfundo":
          if (
            ((isMedia && !info.message.videoMessage) || isQuotedImage) &&
            !q.length <= 1
          ) {
            rafa = isQuotedImage
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .imageMessage
              : info.message.imageMessage;
            reply(Res_Aguarde);
            buff = await getFileBuffer(rafa, "image");
            bas64 = `data:image/jpeg;base64,${buff.toString("base64")}`;
            anu = args.join(" ").split("|");
            satu = anu[0] !== "" ? anu[0] : `${pushname}`;
            sd = `📍Criado por↓${NomeDoBot}`;
            dua = typeof anu[1] !== "undefined" ? anu[1] : `${sd}`;
            var mantap = await convertSticker(bas64, `${dua}`, `${satu}`);
            var sti = Buffer.from(mantap, "base64");
            conn.sendMessage(from, { sticker: sti }, { quoted: info });
          } else {
            return reply(`So imagem mano 😑`);
          }
          break;

        case "minha":
          if (!isQuotedSticker) return reply("Marque uma figurinha...");
          encmediats = await getFileBuffer(
            info.message.extendedTextMessage.contextInfo.quotedMessage
              .stickerMessage,
            "sticker",
          );
          reply(Res_Aguarde);
          try {
            bas64 = `data:image/jpeg;base64,${encmediats.toString("base64")}`;
            var mantap = await convertSticker(bas64, `<ᑐᏆ́ᖇᐤᔕ>🥵`, `🥶<ᐱᕆᔕᔕᐤ>`);
            var sti = Buffer.from(mantap, "base64");
            await conn.sendMessage(from, { sticker: sti }, { quoted: info });
          } catch (err) {
            console.error("Erro ao criar sticker:", err);
            reply(`❌️ Erro ao criar sticker: ${err.message}`);
          }
          break;

        case "rename":
        case "roubar":
        case "roubarfigu":
          if (!isQuotedSticker)
            return reply("𝘐𝘢𝘳𝘲𝘶𝘦 𝘶𝘮𝘢 𝘧𝘪𝘨𝘶𝘳𝘪𝘯𝘩𝘢 𝘱𝘢𝘳𝘢 𝘳𝘰𝘶𝘣𝘢𝘳 𝘴𝘦𝘶 𝘭𝘢𝘥𝘳𝘢̃𝘰𝘻𝘪𝘯𝘩𝘰 😏");
          // Corrigido para Baileys 7.0+ - usar optional chaining
          encmediats = await getFileBuffer(
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage
              ?.stickerMessage,
            "sticker",
          );
          var kls = q;
          var pack = kls.split("/")[0];
          var author2 = kls.split("/")[1];
          if (!q.trim()) return reply("Cadê o autor e o nome do pacote 🤔");
          if (!pack)
            return reply(
              `Por favor escreve o formato certo exemplo: ${prefix + command
              } Aleatory/𝘽𝙤𝙩`,
            );
          if (!author2)
            return reply(
              `Por favor escreve o formato certo exemplo:\n\n${prefix + command
              } Aleatory/𝘽𝙤𝙩`,
            );
          reply(Res_Aguarde);
          try {
            bas64 = `data:image/jpeg;base64,${encmediats.toString("base64")}`;
            var mantap = await convertSticker(bas64, `${author2}`, `${pack}`);
            var sti = Buffer.from(mantap, "base64");
            await conn.sendMessage(from, { sticker: sti }, { quoted: info });
          } catch (err) {
            console.error("Erro ao criar sticker:", err);
            reply(`❌️ Erro ao criar sticker: ${err.message}`);
          }
          break;

        case "fstiker":
        case "fsticker":
        case "f":
          var RSM =
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          var boij =
            RSM?.imageMessage ||
            info.message?.imageMessage ||
            RSM?.viewOnceMessageV2?.message?.imageMessage ||
            info.message?.viewOnceMessageV2?.message?.imageMessage ||
            info.message?.viewOnceMessage?.message?.imageMessage ||
            RSM?.viewOnceMessage?.message?.imageMessage;
          var boij2 =
            RSM?.videoMessage ||
            info.message?.videoMessage ||
            RSM?.viewOnceMessageV2?.message?.videoMessage ||
            info.message?.viewOnceMessageV2?.message?.videoMessage ||
            info.message?.viewOnceMessage?.message?.videoMessage ||
            RSM?.viewOnceMessage?.message?.videoMessage;
          if (boij) {
            var pack = `⚝ ⇝ Solicitado por:\n⚝ ⇝ Bot:\n⚝ ⇝ Dono:`;
            var author2 = `⚒${pushname}\n⚒${NomeDoBot}\n${NickDono}`;
            reply(Res_Aguarde);
            owgi = await getFileBuffer(boij, "image");
            let encmediaa = await sendImageAsSticker(conn, from, owgi, info, {
              packname: pack,
              author: author2,
            });
            await DLT_FL(encmediaa);
          } else if (boij2 && boij2?.seconds < 11) {
            var pack = `⚝ ⇝ Solicitado por:\n⚝ ⇝ Bot:\n⚝ ⇝ Dono:`;
            var author2 = `⚒${pushname}\n⚒${NomeDoBot}\n${NickDono}`;
            reply(Res_Aguarde);
            owgi = await getFileBuffer(boij2, "video");
            let encmedia = await sendVideoAsSticker(conn, from, owgi, info, {
              packname: pack,
              author: author2,
            });
            await DLT_FL(encmedia);
          } else {
            reply(
              `Enviar imagem / vídeo / gif com legenda \n${prefix}sticker (duração do adesivo de vídeo de 1 a 10 segundos)`,
            );
          }
          break;

        case "figu":
          if (fs.existsSync(DF_TJ))
            return reply(
              "Aguarde um momento, e realize o pedido novamente, não seja tão rápido...",
            );
          var DF_TJ = "./datab/data/CVF.json";
          fs.writeFileSync(
            DF_TJ,
            JSON.stringify([
              isQuotedImage
                ? info.message.extendedTextMessage.contextInfo.quotedMessage
                  .imageMessage
                : info.message.imageMessage || isQuotedVideo
                  ? info.message.extendedTextMessage.contextInfo.quotedMessage
                    .videoMessage
                  : info.message.videoMessage,
            ]),
          );
          var PUXJ = JSON.parse(fs.readFileSync(DF_TJ));
          var DFN = PUXJ[0];
          DFN.sticker = { url: DFN.url };
          await delay(1200);
          DLT_FL(DF_TJ);
          conn.sendMessage(from, DFN);
          break;

        case "st":
        case "stk":
        case "sticker":
        case "s":
          var RSM =
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          var boij2 =
            RSM?.imageMessage ||
            info.message?.imageMessage ||
            RSM?.viewOnceMessageV2?.message?.imageMessage ||
            info.message?.viewOnceMessageV2?.message?.imageMessage ||
            info.message?.viewOnceMessage?.message?.imageMessage ||
            RSM?.viewOnceMessage?.message?.imageMessage;
          var boij =
            RSM?.videoMessage ||
            info.message?.videoMessage ||
            RSM?.viewOnceMessageV2?.message?.videoMessage ||
            info.message?.viewOnceMessageV2?.message?.videoMessage ||
            info.message?.viewOnceMessage?.message?.videoMessage ||
            RSM?.viewOnceMessage?.message?.videoMessage;
          if (boij2) {
            var pack = `⚝ ⇝ Solicitado por:\n⚝ ⇝ Bot:\n⚝ ⇝ Dono:`;
            var author2 = `⚒${pushname}\n⚒${NomeDoBot}\n${NickDono}`;
            reply(Res_Aguarde);
            owgi = await getFileBuffer(boij2, "image");
            let encmediaa = await sendImageAsSticker2(conn, from, owgi, info, {
              packname: pack,
              author: author2,
            });
            await DLT_FL(encmediaa);
          } else if (boij && boij.seconds < 11) {
            var pack = `⚝ ⇝ Solicitado por:\n⚝ ⇝ Bot:\n⚝ ⇝ Dono:`;
            var author2 = `⚒${pushname}\n⚒${NomeDoBot}\n⚒${NickDono}`;
            reply(Res_Aguarde);
            owgi = await getFileBuffer(boij, "video");
            let encmedia = await sendVideoAsSticker2(conn, from, owgi, info, {
              packname: pack,
              author: author2,
            });
            await DLT_FL(encmedia);
          } else {
            return reply(
              `Marque uma imagem, ou um vídeo de ate 9.9 segundos, ou uma visualização única, para fazer figurinha, com o comando ${prefix + command
              }`,
            );
          }
          break;

        case "rvvisu":
        case "rvvisuunica":
        case "revelarvisu":
        case "revelarvisuunica":
          {
            if (Os_Returns(false, true, false).true)
              return reply(Os_Returns(false, true, false).txt);
            try {
              var RSMM =
                info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
              var boij22 =
                RSMM?.imageMessage ||
                info.message?.imageMessage ||
                RSMM?.viewOnceMessageV2?.message?.imageMessage ||
                info.message?.viewOnceMessageV2?.message?.imageMessage ||
                info.message?.viewOnceMessage?.message?.imageMessage ||
                RSMM?.viewOnceMessage?.message?.imageMessage;
              var boijj =
                RSMM?.videoMessage ||
                info.message?.videoMessage ||
                RSMM?.viewOnceMessageV2?.message?.videoMessage ||
                info.message?.viewOnceMessageV2?.message?.videoMessage ||
                info.message?.viewOnceMessage?.message?.videoMessage ||
                RSMM?.viewOnceMessage?.message?.videoMessage;
              var boij33 =
                RSMM?.audioMessage ||
                info.message?.audioMessage ||
                RSMM?.viewOnceMessageV2?.message?.audioMessage ||
                info.message?.viewOnceMessageV2?.message?.audioMessage ||
                info.message?.viewOnceMessage?.message?.audioMessage ||
                RSMM?.viewOnceMessage?.message?.audioMessage;
              if (boijj) {
                var px = boijj;
                px.viewOnce = false;
                px.video = {
                  url: px.url,
                };
                await conn.sendMessage(from, px, {
                  quoted: info,
                });
              } else if (boij22) {
                var px = boij22;
                px.viewOnce = false;
                px.image = {
                  url: px.url,
                };
                await conn.sendMessage(from, px, {
                  quoted: info,
                });
              } else if (boij33) {
                var px = boij33;
                px.viewOnce = false;
                px.audio = {
                  url: px.url,
                };
                await conn.sendMessage(from, px, {
                  quoted: info,
                });
              } else {
                return reply(
                  "Por favor, *mencione uma imagem, video ou áudio em visualização única* para executar o comando.",
                );
              }
            } catch (error) {
              await reply(messageJson?.error);
            }
          }
          break;

        case "toimg":
          if (!isQuotedSticker) return reply("❌ adesivo de resposta um ❌");
          try {
            reply(Res_Aguarde);
            buff = await getFileBuffer(
              info.message.extendedTextMessage.contextInfo.quotedMessage
                .stickerMessage,
              "sticker",
            );
            conn
              .sendMessage(from, { image: buff }, { quoted: info })
              .catch((e) => {
                console.log(e);
                reply("ERRO!!");
              });
          } catch {
            reply("Erro... 🥱");
          }
          break;

        //=============(LOGOS)=============\\

        //==========(PLAQUINHAS-LOGOS)===========\

        case "placaloli":
          if (!q.trim()) return reply("Exemplo: ${prefix+command} Bronxys");
          reply("Aguarde..");
          lod = await fetchJson(
            `https://nekobot.xyz/api/imagegen?type=kannagen&text=${q}`,
          );
          sendStickerFromUrl(from, lod.message);
          break;

        //=======================================\\

        // LOGOS

        case "angelwing":
        case "hackneon":
        case "fpsmascote":
        case "equipemascote":
        case "txtquadrinhos":
        case "ffavatar":
        case "mascotegame":
        case "angelglx":
        case "gizquadro":
        case "wingeffect":
        case "blackpink":
        case "metalgold":
        case "girlmascote":
        case "logogame":
          try {
            if (!q.trim())
              return reply(
                `Digite algo, Exemplo: ${prefix + command} Aleatory`,
              );
            reply(Res_Aguarde);
            ABC = await reqapi.logos_eph(q.trim(), command);
            const finalUrl = ABC.resultado?.imageUrl || ABC.resultado;
            if (typeof finalUrl !== "string")
              return reply("Erro ao obter URL da imagem.");
            bufferImg(finalUrl);
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "fiction":
        case "3dstone":
        case "areia":
        case "style":
        case "blood":
        case "pink":
        case "cattxt":
        case "neondevil":
        case "carbon":
        case "metalfire":
        case "thunder":
        case "vidro":
        case "jokerlogo":
        case "transformer":
        case "demonfire":
        case "jeans":
        case "metalblue":
        case "natal":
        case "ossos":
        case "asfalto":
        case "break":
        case "glitch2":
        case "colaq":
        case "neon3":
        case "nuvem":
        case "horror":
        case "matrix":
        case "berry":
        case "luxury":
        case "lava":
        case "thunderv2":
        case "neongreen":
        case "neve":
        case "neon":
        case "neon1":
        case "neon3d":
        case "gelo":
        case "neon3":
        case "3dgold":
        case "lapis":
        case "toxic":
        case "demongreen":
        case "rainbow":
        case "halloween":
          try {
            if (!q.trim())
              return reply(
                `Digite algo, Exemplo: ${prefix + command} Aleatory 𝘽𝙤𝙩`,
              );
            reply(Res_Aguarde);
            ABC = await reqapi.logos(q.trim(), command);
            const finalUrl = ABC.resultado?.imageUrl || ABC.resultado;
            if (typeof finalUrl !== "string")
              return reply("Erro ao obter URL da imagem.");
            bufferImg(finalUrl);
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "shadow":
        case "metalgold":
        case "cup":
        case "txtborboleta":
        case "cemiterio":
        case "efeitoneon":
        case "harryp":
        case "lobometal":
        case "neon2":
        case "madeira":
        case "lovemsg3":
        case "coffecup":
        case "coffecup2":
        case "florwooden":
        case "narutologo":
        case "fire":
        case "romantic":
        case "smoke":
        case "papel":
        case "lovemsg":
        case "lovemsg2":
          try {
            if (!q.trim())
              return reply(
                `Digite algo, Exemplo: ${prefix + command} Aleatory 𝘽𝙤𝙩`,
              );
            reply(Res_Aguarde);
            ABC = await reqapi.logos_pht(q.trim(), command);
            const finalUrl = ABC.resultado?.imageUrl || ABC.resultado;
            if (typeof finalUrl !== "string")
              return reply("Erro ao obter URL da imagem.");
            bufferImg(finalUrl);
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "metadinha":
          try {
            ABC = await reqapi.metadinha();
            conn.sendMessage(from, { image: { url: ABC.link1 } }).catch(() => {
              return reply("Erro... 🥱");
            });
            conn.sendMessage(from, { image: { url: ABC.link2 } }).catch(() => {
              return reply("Erro... 🥱");
            });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        //========(SORTEIO-VOTAR-CASES)=========\\

        case "substituir":
          if (!SoDono && !isnit) return reply("Só dono..");
          if ((isMedia && !info.message.videoMessage) || isQuotedDocument) {
            media = isQuotedDocument
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .documentMessage
              : info.message.documentMessage;
            rane = getRandom("." + (await getExtension(media.mimetype)));
            doc = await getFileBuffer(media, "document");
            fs.writeFileSync(q, doc);
            conn.sendMessage(
              from,
              { text: "Substituido com sucesso.." },
              { quoted: info },
            );
          } else {
            reply("Marque o documento ou arquivo..");
          }
          break;

        case "index-dubot":
          if (!SoDono) return reply(Res_SoDono);
          if ((isMedia && !info.message.videoMessage) || isQuotedDocument) {
            media = isQuotedDocument
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .documentMessage
              : info.message.documentMessage;
            rane = getRandom("." + (await getExtension(media.mimetype)));
            doc = await getFileBuffer(media, "document");
            fs.writeFileSync("./index.js", doc);
            conn.sendMessage(
              from,
              { text: "Pronto novinha.." },
              { quoted: info },
            );
          } else {
            reply(
              "Marque o documento ou o arquivo que deseja enviar pra determinar pasta ou substituir..",
            );
          }
          break;

        case "mete":
          if (!SoDono)
            return reply("𝙎𝙤́ 𝙢𝙚𝙪 𝙢𝙚𝙨𝙩𝙧𝙚 𝙥𝙤𝙙𝙚 𝙪𝙩𝙞𝙡𝙞𝙯𝙖𝙧 𝙚𝙨𝙩𝙚 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 🖕🏿🤬");
          conn.sendMessage(from, {
            audio: { url: "./dados/audios/ban3.ogg" },
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
          });
          if (!isBotGroupAdmins) return reply(Res_BotADM);
          if (!menc_os2 || menc_jid2[1])
            return reply(
              "𝙈𝙖𝙧𝙦𝙪𝙚 𝙖 𝙢𝙚𝙣𝙨𝙖𝙜𝙚𝙢 𝙙𝙤 𝙞𝙙𝙞𝙤𝙩𝙖 𝙤𝙪 𝙢𝙖𝙧𝙦𝙪𝙚 𝙤 @ 𝙙𝙚𝙡𝙚.., 𝙡𝙚𝙢𝙗𝙧𝙚 𝙙𝙚 𝙨𝙤́ 𝙢𝙖𝙧𝙘𝙖𝙧 𝙪𝙢 𝙩𝙧𝙤𝙪𝙭𝙖 𝙥𝙤𝙧 𝙫𝙚𝙯,𝙫𝙤𝙪 𝙛𝙞𝙘𝙖𝙧 𝙛𝙚𝙡𝙞𝙯 𝙙𝙚 𝙥𝙖𝙨𝙨𝙖𝙧 𝙖 𝙛𝙖𝙘𝙖 𝙣𝙚𝙡𝙚 😏͜🔪",
            );
          if (!JSON.stringify(groupMembers).includes(menc_os2))
            return reply(
              "𝙀𝙨𝙩𝙚 𝙩𝙧𝙤𝙪𝙭𝙖 𝙟𝙖́ 𝙡𝙚𝙫𝙤𝙪 𝙪𝙢 𝙥𝙚́ 𝙣𝙖 𝙗𝙪𝙣𝙙𝙖 𝙤𝙪 𝙨𝙖𝙞𝙪 𝙙𝙤 𝙜𝙧𝙪𝙥𝙤 🤣",
            );
          if (premium.includes(menc_os2))
            return mentions(
              `@${menc_os2.split("@")[0]
              } a(o) @${sender2} está querendo banir você, visualiza esse problema ae 😶`,
              [menc_os2],
              true,
            );
          if (groupAdmins.includes(menc_os2))
            return mentions(
              `@${menc_os2.split("@")[0]
              } a(o) @${sender2} está querendo banir você, visualiza esse problema ae 😶`,
              [menc_os2],
              true,
            );
          if (botNumber.includes(menc_os2))
            return reply(
              "𝙉𝙖̃𝙤 𝙨𝙤𝙪 𝙗𝙚𝙨𝙩𝙖 𝙙𝙚 𝙧𝙚𝙢𝙤𝙫𝙚𝙧 𝙚𝙪 𝙢𝙚𝙨𝙢𝙤 𝙣𝙚́ 🙁𝙀𝙨𝙩𝙤𝙪 𝙢𝙪𝙞𝙩𝙤 𝙙𝙚𝙘𝙚𝙥𝙘𝙞𝙤𝙣𝙖𝙙𝙤 𝙘𝙤𝙢 𝙫𝙤𝙘𝙚̂, 🥹",
            );
          if (numerodono.includes(menc_os2))
            return reply(
              "𝙉𝙖̃𝙤 𝙥𝙤𝙨𝙨𝙤 𝙧𝙚𝙢𝙤𝙫𝙚𝙧 𝙢𝙚𝙪 𝙙𝙤𝙣𝙤 𝙣𝙚́ 𝙨𝙚𝙪 𝙛𝙞𝙡𝙝𝙤 𝙙𝙖 𝙥𝙪𝙩𝙖 🖕🏿🤧",
            );
          conn.sendMessage(from, {
            text: `@${menc_os2.split("@")[0]} 𝘾𝘼𝙄 𝙁𝙊𝙍𝘼𝘿𝙀𝙎𝙂𝙍𝘼𝘾̧𝘼🏌🏻‍♂️`,
            mentions: [menc_os2],
          });
          conn.groupParticipantsUpdate(from, [menc_os2], "remove");
          break;

        case "nuke":
        case "arquivargp":
          if (!SoDono && !isnit)
            return reply("Só dono pode utilizar este comando...");
          if (!isBotGroupAdmins) return reply(Res_BotADM);
          if (info.key.fromMe) return;
          blup = [];
          for (i of groupMembers) {
            if (
              !numerodono.includes(i.id) &&
              !numerodono.includes(i.phoneNumber)
            )
              blup.push(i.id);
          }
          blup.splice(blup.indexOf(botNumber), 1);
          for (i = 0; i < blup.length; i++) {
            await sleep(500);
            conn.groupParticipantsUpdate(from, [blup[i]], "remove");
          }
          break;

        // ═════ SISTEMA DE AVISOS AUTOMÁTICOS ═════

        case "aviso":
        case "avisoprogramado":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!isGroupAdmins) return reply(Res_SoAdm);

            const _inputAv = q.trim();
            if (!_inputAv.includes("|")) {
              return reply(
                `    ╭━━━━━━━━━━━━━━━╮\n    ┃  📢  *AVISO PROGRAMADO*\n    ╰━━━━━━━━━━━━━━━╯\n\n   ❌ *Formato incorreto!*\n\n   *Uso:*\n   ${prefix + command} texto | HH:MM\n   ${prefix + command} texto | HH:MM | DD/MM/AAAA\n\n   _Sem data = Diário (repete)_\n   _Envie mídia junto ao comando_\n\n   ▸ *${prefix}infoavisos* — Tutorial`,
              );
            }

            let [_textoAv, _horarioAv, _dataAv] = _inputAv
              .split("|")
              .map((s) => s.trim());

            if (!_textoAv) return reply("❌ Escreva o texto do aviso!");
            if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(_horarioAv)) {
              return reply("❌ Horário inválido! Use HH:MM (ex: 08:30)");
            }

            let _isDailyAv = !_dataAv;
            if (_dataAv) {
              // Aceita DD/MM/YY ou DD/MM/YYYY
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(_dataAv)) {
                // DD/MM/YYYY → converte para DD/MM/YY
                _dataAv = _dataAv.slice(0, 6) + _dataAv.slice(8);
              } else if (!/^\d{2}\/\d{2}\/\d{2}$/.test(_dataAv)) {
                return reply(
                  "❌ Data inválida! Use DD/MM/AAAA ou DD/MM/AA\n\nEx: 25/12/2026 ou 25/12/26",
                );
              }
            }

            let _mediaPathAv = null;
            let _typeAv = "text";

            try {
              if (isImage) {
                const _bufAv = await getFileBuffer(
                  info.message.imageMessage,
                  "image",
                );
                const _fnAv = `aviso_${Date.now()}.jpg`;
                _mediaPathAv = path.join(
                  "operacao",
                  "avisos-automaticos",
                  "media",
                  _fnAv,
                );
                fs.writeFileSync(_mediaPathAv, _bufAv);
                _typeAv = "image";
              } else if (isQuotedImage) {
                const _encAv =
                  info.message.extendedTextMessage.contextInfo.quotedMessage
                    .imageMessage;
                const _bufAv = await getFileBuffer(_encAv, "image");
                const _fnAv = `aviso_${Date.now()}.jpg`;
                _mediaPathAv = path.join(
                  "operacao",
                  "avisos-automaticos",
                  "media",
                  _fnAv,
                );
                fs.writeFileSync(_mediaPathAv, _bufAv);
                _typeAv = "image";
              } else if (isVideo) {
                const _bufAv = await getFileBuffer(
                  info.message.videoMessage,
                  "video",
                );
                const _fnAv = `aviso_${Date.now()}.mp4`;
                _mediaPathAv = path.join(
                  "operacao",
                  "avisos-automaticos",
                  "media",
                  _fnAv,
                );
                fs.writeFileSync(_mediaPathAv, _bufAv);
                _typeAv = "video";
              } else if (isQuotedVideo) {
                const _encAv =
                  info.message.extendedTextMessage.contextInfo.quotedMessage
                    .videoMessage;
                const _bufAv = await getFileBuffer(_encAv, "video");
                const _fnAv = `aviso_${Date.now()}.mp4`;
                _mediaPathAv = path.join(
                  "operacao",
                  "avisos-automaticos",
                  "media",
                  _fnAv,
                );
                fs.writeFileSync(_mediaPathAv, _bufAv);
                _typeAv = "video";
              } else if (isAudio) {
                const _bufAv = await getFileBuffer(
                  info.message.audioMessage,
                  "audio",
                );
                const _fnAv = `aviso_${Date.now()}.ogg`;
                _mediaPathAv = path.join(
                  "operacao",
                  "avisos-automaticos",
                  "media",
                  _fnAv,
                );
                fs.writeFileSync(_mediaPathAv, _bufAv);
                _typeAv = "audio";
              } else if (isQuotedAudio) {
                const _encAv =
                  info.message.extendedTextMessage.contextInfo.quotedMessage
                    .audioMessage;
                const _bufAv = await getFileBuffer(_encAv, "audio");
                const _fnAv = `aviso_${Date.now()}.ogg`;
                _mediaPathAv = path.join(
                  "operacao",
                  "avisos-automaticos",
                  "media",
                  _fnAv,
                );
                fs.writeFileSync(_mediaPathAv, _bufAv);
                _typeAv = "audio";
              }
            } catch (errMedia) {
              console.log("[AVISO] Erro ao salvar mídia:", errMedia.message);
            }

            // ID aleatório de 2 dígitos
            const _avisosExist = getAvisos(from);
            const _alertIdAv = _gerarIdAviso(_avisosExist.map((a) => a.id));
            addAviso(from, {
              id: _alertIdAv,
              text: _textoAv,
              time: _horarioAv,
              date: _dataAv || null,
              daily: _isDailyAv,
              mediaPath: _mediaPathAv,
              type: _typeAv,
              admin: sender,
              lastSent: null,
            });

            const _confirmTxt = `    ╭━━━━━━━━━━━━━━━╮\n    ┃  ✅  *AVISO SALVO*\n    ╰━━━━━━━━━━━━━━━╯\n\n   ╭──────────────\n   │ ⏰ Hora: *${_horarioAv}*\n   │ ${_isDailyAv ? "🔄 Modo: Diário" : "📅 Data: *" + _dataAv + "* _(única)_"}\n   │ 📝 Msg: _${_textoAv.substring(0, 50)}${_textoAv.length > 50 ? "..." : ""}_\n   │ 📎 Mídia: ${_typeAv !== "text" ? "✅ " + _typeAv : "Não"}\n   │ 🆔 ID: *${_alertIdAv}*\n   ╰──────────────\n\n   _O bot avisará a todos no horário!_ 📣`;

            try {
              await conn.sendMessage(from, {
                react: { text: "📢", key: info.key },
              });
            } catch { }
            reply(_confirmTxt);
          }
          break;

        case "listaavisos":
        case "veravisos":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!isGroupAdmins) return reply(Res_SoAdm);

            const _allAvisos = getAvisos(from);
            if (_allAvisos.length === 0) {
              return reply(
                `    ╭━━━━━━━━━━━━━━━╮\n    ┃  📢  *AVISOS PROGRAMADOS*\n    ╰━━━━━━━━━━━━━━━╯\n\n   📭 _Nenhum aviso programado._\n\n   ▸ *${prefix}aviso* — Criar aviso\n   ▸ *${prefix}infoavisos* — Tutorial`,
              );
            }

            let _listTxtAv = `    ╭━━━━━━━━━━━━━━━╮\n    ┃  📢  *AVISOS PROGRAMADOS (${_allAvisos.length})*\n    ╰━━━━━━━━━━━━━━━╯\n`;
            _allAvisos.forEach((av, idx) => {
              _listTxtAv += `\n   ╭──────────────\n`;
              _listTxtAv += `   │ *${idx + 1}.* ⏰ Hora: *${av.time}*\n`;
              _listTxtAv += `   │ ${av.daily ? "🔄 Modo: Diário" : "📅 Data: *" + av.date + "* _(única)_"}\n`;
              _listTxtAv += `   │ 📝 _${av.text.substring(0, 45)}${av.text.length > 45 ? "..." : ""}_\n`;
              _listTxtAv += `   │ 📎 Mídia: ${av.type !== "text" ? "✅ " + av.type : "Não"}\n`;
              _listTxtAv += `   │ 🆔 ID: *${av.id}*\n`;
              _listTxtAv += `   ╰──────────────\n`;
            });
            _listTxtAv += `\n   ▸ *${prefix}removeraviso <ID>* — Remover\n   ▸ *${prefix}limparavisos* — Limpar tudo\n   ▸ *${prefix}infoavisos* — Tutorial`;

            try {
              await conn.sendMessage(from, {
                react: { text: "📝", key: info.key },
              });
            } catch { }
            reply(_listTxtAv);
          }
          break;

        case "removeraviso":
        case "delaviso":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!isGroupAdmins) return reply(Res_SoAdm);
            if (!q.trim())
              return reply(
                `❌ Digite o ID do aviso!\n\n▸ *${prefix}listaavisos* — Ver IDs\n\nEx: *${prefix}removeraviso 47*`,
              );

            if (rmAviso(from, q.trim())) {
              reply(
                `✅ Aviso *${q.trim()}* removido com sucesso!\n\n▸ *${prefix}listaavisos* — Ver restantes`,
              );
            } else {
              reply(
                `❌ ID *${q.trim()}* não encontrado!\n\n▸ *${prefix}listaavisos* — Ver IDs corretos`,
              );
            }
          }
          break;

        case "novidades":
        case "news":
        case "atualizacao":
        case "changelog":
          {
            const _novDate = moment()
              .tz("America/Sao_Paulo")
              .format("DD/MM/YYYY");
            const _novTxt = `┏━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 *𝗔𝗧𝗨𝗔𝗟𝗜𝗭𝗔𝗖̧𝗔̃𝗢 𝗗𝗢 𝗕𝗢𝗧*
┃  ✦ 𝘼𝙡𝙚𝙖𝙩𝙤𝙧𝙮 𝙫𝟴.𝟱 ✦
┃  🗓️ ${_novDate}
┗━━━━━━━━━━━━━━━━━━━━━┛

╔══〘 🆕 〙══════════════╗
║  *𝗡𝗢𝗩𝗢𝗦 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦*
╠════════════════════╣
║ 🧠 *${prefix}ǫᴜɪᴢ* — sɪsᴛᴇᴍᴀ ᴅᴇ ǫᴜɪᴢ
║   ↳ ᴘᴇʀɢᴜɴᴛᴀs ᴅɪɴᴀ̂ᴍɪᴄᴀs ᴅᴀ ᴡɪᴋɪᴘᴇᴅɪᴀ
║   ↳ ɪᴍᴀɢᴇɴs, ᴅɪᴄᴀs ᴇ xᴘ ᴀʟᴇᴀᴛᴏ́ʀɪᴏ
║   ↳ ɴɪ́ᴠᴇɪs ᴅᴇ ᴅɪғɪᴄᴜʟᴅᴀᴅᴇ ᴘʀᴏɢʀᴇssɪᴠᴏs
║
║ 📋 *${prefix}ʀᴇsᴜᴍᴏ* — ʀᴇsᴜᴍɪʀ ᴄᴏɴᴠᴇʀsᴀ
║   ↳ ʀᴇsᴜᴍᴏ ɪɴᴛᴇʟɪɢᴇɴᴛᴇ ᴅᴏ ɢʀᴜᴘᴏ
║   ↳ ᴛᴇᴍᴀs, ᴄᴏɴғʟɪᴛᴏs ᴇ ᴅᴇsᴛᴀǫᴜᴇs
╚════════════════════╝

╔══〘 🎨 〙══════════════╗
║  *𝗔𝗧𝗨𝗔𝗟𝗜𝗭𝗔𝗖̧𝗢̃𝗘𝗦 𝗩𝗜𝗦𝗨𝗔𝗜𝗦*
╠════════════════════╣
║ 🖌️ *ᴍᴇɴᴜs* — ᴠɪsᴜᴀʟ ʀᴇᴍᴏᴅᴇʟᴀᴅᴏ
║   ↳ ʟᴀʏᴏᴜᴛ ᴍᴏᴅᴇʀɴᴏ ᴇ ʟɪᴍᴘᴏ
║   ↳ ᴄᴀɪxᴀs ᴀʀʀᴇᴅᴏɴᴅᴀᴅᴀs ᴇ sɪ́ᴍʙᴏʟᴏs
║
║ 🎵 *${prefix}ᴘʟᴀʏ* — ɴᴏᴠᴏ ᴠɪsᴜᴀʟ
║   ↳ ᴄᴀʀᴅ ᴍᴏᴅᴇʀɴɪᴢᴀᴅᴏ ᴇ ᴇʟᴇɢᴀɴᴛᴇ
║
║ 👤 *${prefix}ᴘᴇʀғɪʟ* — ᴀᴛᴜᴀʟɪᴢᴀᴅᴏ
║   ↳ ᴄᴀʀᴅ ᴄᴏᴍᴘᴀᴄᴛᴏ ᴇ ᴘʀᴏғɪssɪᴏɴᴀʟ
║   ↳ ᴍᴇɴᴄ̧ᴏ̃ᴇs ᴄᴏʀʀɪɢɪᴅᴀs
╚════════════════════╝

╔══〘 🛠️ 〙══════════════╗
║  *𝗖𝗢𝗥𝗥𝗘𝗖̧𝗢̃𝗘𝗦 & 𝗙𝗜𝗫𝗘𝗦*
╠════════════════════╣
║ 📊 *ʀᴀɴᴋᴀᴛɪᴠᴏ* — ᴄᴏʀʀɪɢɪᴅᴏ ✅
║   ↳ ᴍᴇɴᴄ̧ᴏ̃ᴇs ғᴜɴᴄɪᴏɴᴀɴᴅᴏ
║   ↳ sᴇᴍ ᴇʀʀᴏs ᴅᴇ ʟɪᴅ
║
║ 📉 *ʀᴀɴᴋɪɴᴀᴛɪᴠᴏs* — ᴄᴏʀʀɪɢɪᴅᴏ ✅
║   ↳ ғᴜɴᴄɪᴏɴᴀɴᴅᴏ ᴄᴏʀʀᴇᴛᴀᴍᴇɴᴛᴇ
║
║ 🤖 *sɪᴍɪʜ / sɪᴍɪʜ𝟐* — ᴄᴏʀʀɪɢɪᴅᴏs ✅
║   ↳ ᴄʜᴀᴛʙᴏᴛ ᴇsᴛᴀ́ᴠᴇʟ ᴇ ʀᴇsᴘᴏɴᴅᴇɴᴅᴏ
╚════════════════════╝

╔══〘 📝 〙══════════════╗
║  *𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗢 & 𝗣𝗘𝗥𝗙𝗜𝗟*
╠════════════════════╣
║ 📝 *${prefix}ʀᴇɢɪsᴛʀᴀʀ* — ᴀᴛᴜᴀʟɪᴢᴀᴅᴏ
║   ↳ sɪsᴛᴇᴍᴀ ᴍᴀɪs ᴇsᴛᴀ́ᴠᴇʟ
║   ↳ ʙᴜɢs ᴄᴏʀʀɪɢɪᴅᴏs
║
║ 👤 *${prefix}ᴘᴇʀғɪʟ* — ᴏᴛɪᴍɪᴢᴀᴅᴏ
║   ↳ ᴅᴀᴅᴏs ᴅᴇ ᴇɴɢᴀᴊᴀᴍᴇɴᴛᴏ
║   ↳ ɴɪ́ᴠᴇɪs ᴅᴇ ɪɴᴛɪᴍɪᴅᴀᴅᴇ
╚════════════════════╝

╔══〘 🚀 〙══════════════╗
║  *𝗖𝗢𝗡𝗘𝗫𝗔̃𝗢 & 𝗘𝗦𝗧𝗔𝗕𝗜𝗟𝗜𝗗𝗔𝗗𝗘*
╠════════════════════╣
║ ⚙️ ᴄᴏɴᴇxᴀ̃ᴏ ᴛᴏᴛᴀʟᴍᴇɴᴛᴇ ᴀᴛᴜᴀʟɪᴢᴀᴅᴀ
║ ⚙️ ᴍᴀɪᴏʀ ᴇsᴛᴀʙɪʟɪᴅᴀᴅᴇ ᴇ ᴅᴇsᴇᴍᴘᴇɴʜᴏ
║ ⚙️ ᴄᴏʀʀᴇᴄ̧ᴏ̃ᴇs ɢᴇʀᴀɪs ᴅᴇ ʙᴜɢs
╚════════════════════╝

╔══〘 🛠️ 〙══════════════╗
║  *𝗖𝗢𝗥𝗥𝗘𝗖̧𝗢̃𝗘𝗦 𝗔𝗡𝗧𝗘𝗥𝗜𝗢𝗥𝗘𝗦*
╠════════════════════╣
║ 🔧 ᴀᴊᴜsᴛᴇs ᴠɪsᴜᴀɪs ᴇ ғᴜɴᴄɪᴏɴᴀɪs
║ 🔇 ᴄᴏᴍᴀɴᴅᴏ *ᴍᴜᴛᴇ* ᴀᴘʀɪᴍᴏʀᴀᴅᴏ
║ ⚔️ ᴅᴜᴇʟᴏ ᴅᴇ ғɪɢᴜʀɪɴʜᴀs ᴄᴏʀʀɪɢɪᴅᴏ
║ 🔪 ᴄᴏᴍᴀɴᴅᴏ *ʙᴀɴ* ᴏᴛɪᴍɪᴢᴀᴅᴏ
║ 🚫 *ʟɪsᴛᴀ ɴᴇɢʀᴀ* ʀᴇᴠɪsᴀᴅᴀ
║ 👋 *ʙᴏᴀs-ᴠɪɴᴅᴀs* ᴄᴏʀʀɪɢɪᴅᴏ
║ 🐛 ᴄᴏʀʀᴇᴄ̧ᴏ̃ᴇs ɢᴇʀᴀɪs
╚════════════════════╝

╔══〘 🤖 〙══════════════╗
║  *𝗥𝗘𝗖𝗨𝗥𝗦𝗢𝗦 𝗖𝗢𝗠 𝗜𝗔*
╠════════════════════╣
║ 🧠 *ɪᴀ ᴀʟᴇᴀᴛᴏ́ʀɪᴀ* — ᴍᴀɪs ɪɴᴛᴇʟɪɢᴇɴᴛᴇ
║   ↳ ᴘᴠ + ɢʀᴜᴘᴏs
║   ↳ ᴄᴏɴᴛʀᴏʟᴇ ᴘᴏʀ ᴀᴅᴍs
║
║ 🖼️ *${prefix}ɢᴇʀᴀʀɪᴍᴀɢᴇ*
║   ↳ ɪᴍᴀɢᴇɴs ᴄᴏᴍ ɪᴀ ᴀᴠᴀɴᴄ̧ᴀᴅᴀ
║   ↳ ʀᴇsᴜʟᴛᴀᴅᴏs ᴘʀᴇᴄɪsᴏs
╚════════════════════╝

╔══〘 ✨ 〙══════════════╗
║  *𝗦𝗜𝗦𝗧𝗘𝗠𝗔*
╠════════════════════╣
║ 💻 ɴᴏᴠᴏ ᴠɪsᴜᴀʟ ᴅᴏ ᴛᴇʀᴍɪɴᴀʟ
║   ↳ ɪɴᴛᴇʀғᴀᴄᴇ ʟɪᴍᴘᴀ ᴇ ᴍᴏᴅᴇʀɴᴀ
║
║ 🧹 *${prefix}ʟɪᴍᴘᴀʀᴄᴀᴄʜᴇ* ᴀᴘʀɪᴍᴏʀᴀᴅᴏ
║   ↳ ʙᴏᴛ ᴍᴀɪs ʟᴇᴠᴇ ᴇ ᴇsᴛᴀ́ᴠᴇʟ
║
║ 👤 ᴘᴇʀғɪʟ sᴇᴍ ʀᴇɢɪsᴛʀᴏ ᴀᴛᴜᴀʟɪᴢᴀᴅᴏ
╚════════════════════╝

╔══〘 🛡️ 〙══════════════╗
║  *𝗦𝗘𝗚𝗨𝗥𝗔𝗡𝗖̧𝗔*
╠════════════════════╣
║ 🔗 *ᴀɴᴛɪʟɪɴᴋ𝟐* ᴀᴅɪᴄɪᴏɴᴀᴅᴏ
║   ↳ ᴀᴘᴀɢᴀ ʟɪɴᴋs ᴀᴜᴛᴏᴍᴀ́ᴛɪᴄᴏ
║   ↳ sᴇᴍ ʙᴀɴɪᴍᴇɴᴛᴏ ᴀᴜᴛᴏᴍᴀ́ᴛɪᴄᴏ
╚════════════════════╝

╔══〘 📀 〙══════════════╗
║  *𝗠𝗘𝗡𝗨 𝗠𝗜́𝗗𝗜𝗔𝗦*
╠════════════════════╣
║ 🎬 ᴍᴇɴᴜ ᴇxᴄʟᴜsɪᴠᴏ ᴅᴇ ᴍɪ́ᴅɪᴀs
║   ↳ 📥 ᴛᴏᴅᴏs ᴏs ᴅᴏᴡɴʟᴏᴀᴅs
║   ↳ 🎭 ᴛᴏᴅᴀs ᴀs ғɪɢᴜʀɪɴʜᴀs
║ 👉 *${prefix}ᴍᴇɴᴜᴍɪᴅɪᴀs*
╚════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 📌 _ᴄᴏɴᴛɪɴᴜᴀᴍᴏs ᴛʀᴀʙᴀʟʜᴀɴᴅᴏ_
┃ _ᴘᴀʀᴀ ᴍᴀɪs ᴍᴇʟʜᴏʀɪᴀs!_
┠─────────────────────┨
┃ ⚡ *𝘽𝙧𝙤𝙣𝙭𝙮𝙨 𝙃𝙤𝙨𝙩* — 𝙈.𝙎𝙘𝙝𝙚𝙮𝙤𝙩
┃ 📽️ youtu.be/lCeC0TIsgsk
┗━━━━━━━━━━━━━━━━━━━━━┛`;

            try {
              await conn.sendMessage(from, {
                react: { text: "🎉", key: info.key },
              });
              const _novBanner = fs.readFileSync(
                "./dados/novidades_banner.png",
              );
              await conn.sendMessage(
                from,
                {
                  image: _novBanner,
                  caption: _novTxt,
                  mentions: [sender],
                },
                { quoted: info },
              );
            } catch (e) {
              conn.sendMessage(
                from,
                { text: _novTxt, mentions: [sender] },
                { quoted: info },
              );
            }
          }
          break;

        case "infoaviso":
        case "infoavisos":
          {
            if (!isGroup) return reply(Res_SoGrupo);

            const _infoAvTxt = `    ╭━━━━━━━━━━━━━━━╮
    ┃  📢  *GUIA: AVISOS AUTOMÁTICOS*
    ╰━━━━━━━━━━━━━━━╯

   O bot envia mensagens programadas
   automaticamente, mencionando todos
   os membros do grupo.

   ╭──── 📝 *COMO CRIAR* ────╮

   *Diário (repete todo dia):*
   ${prefix}aviso texto | HH:MM

   *Data específica (uma vez):*
   ${prefix}aviso texto | HH:MM | DD/MM/AAAA

   *Com mídia:*
   Envie foto/vídeo/áudio com o
   comando na legenda, ou marque
   uma mídia e escreva o comando.

   ╰──────────────────╯

   ╭──── 💡 *EXEMPLOS* ────╮

   ${prefix}aviso Reunião às 20h | 19:55
   _→ Avisa todo dia às 19:55_

   ${prefix}aviso Natal! | 00:00 | 25/12/2026
   _→ Avisa só no dia 25/12/2026_

   📸 Envie uma foto + legenda:
   ${prefix}aviso Bom dia! | 08:00
   _→ Aviso diário com foto_

   ╰──────────────────╯

   ╭──── ℹ️ *DETALHES* ────╮

   ⏰ Verifica a cada 30 segundos
   🌐 Fuso: Brasília (UTC-3)
   ✅ Funciona sem atividade no grupo
   👤 Apenas ADMs podem criar
   📎 Suporta: foto, vídeo e áudio
   🆔 Cada aviso tem ID único

   ╰──────────────────╯

   ▸ *${prefix}aviso* — Criar aviso
   ▸ *${prefix}listaavisos* — Ver ativos
   ▸ *${prefix}removeraviso <ID>* — Remover
   ▸ *${prefix}limparavisos* — Limpar tudo`;

            try {
              await conn.sendMessage(from, {
                react: { text: "📢", key: info.key },
              });
            } catch { }
            reply(_infoAvTxt);
          }
          break;

        case "limparavisos":
        case "zeraravisos":
          {
            if (!isGroup) return reply(Res_SoGrupo);
            if (!isGroupAdmins) return reply(Res_SoAdm);

            const _qtdAv = getAvisos(from).length;
            if (_qtdAv === 0) return reply("📭 Não há avisos para limpar.");
            clearAvisos(from);
            reply(
              `✅ *${_qtdAv}* aviso(s) removido(s)!\n_Mídias apagadas._\n\n▸ *${prefix}aviso* — Criar novo`,
            );
          }
          break;

        // ══════════════════════════════════════════

        //==========(TTPS/ATTP)============\\

        case "attp":
        case "attp2":
          try {
            if (!q.trim())
              return reply(`Exemplo: ${prefix + command} Aleatory`);
            reply(Res_Aguarde);
            conn
              .sendMessage(
                from,
                { sticker: { url: reqapi.attp(q.trim(), command) } },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro... 🥱");
              });
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        //======================================\\

        // ═══════ SISTEMA DE QUIZ COM IMAGEM ═══════
        case "quiz":
        case "quizz": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);

          if (temQuiz(from)) {
            const _qInfo = getDica(from);
            return reply(
              `⚠️ *Já tem um quiz ativo!*\n\n` +
              `> Categoria: *${_qInfo.categoria}*\n` +
              `> 💡 Dica: _${_qInfo.dica}_\n\n` +
              `> Responda no chat ou use *${prefix}cancelarquiz*`
            );
          }

          reply("🔄 *Buscando quiz...*");

          const _quiz = await iniciarQuiz(from);
          if (!_quiz) return reply("❌ Nenhum quiz disponível no momento. Tente novamente!");

          try {
            // Quiz dinâmico usa thumbnailUrl direto, wiki array como fallback
            const _imgSource = _quiz.thumbnailUrl || _quiz.wiki;
            const _quizImgBuf = await buscarImagem(_imgSource, _quiz.categoria);

            const _nivelTxt = _quiz.nivelGrupo === 1 ? "🟢 Fácil" : _quiz.nivelGrupo === 2 ? "🟡 Médio" : "🔴 Difícil";

            const _quizTxt =
              `┏━━━━━━━━━━━━━━━┓\n` +
              `┃ ${_quiz.categoria} *QUIZ*\n` +
              `┗━━━━━━━━━━━━━━━┛\n\n` +
              `> 💡 Dica: _${_quiz.dica}_\n` +
              `> 📊 Nível: *${_nivelTxt}*\n\n` +
              `> 🎯 *Quem é / O que é?*\n` +
              `> Responda no chat!\n` +
              `> ⏱ Tempo: *5 minutos*\n` +
              `> ⚡ Quem acertar ganha *XP aleatório*!`;

            if (_quizImgBuf) {
              await conn.sendMessage(from, {
                image: _quizImgBuf,
                caption: _quizTxt,
              }, { quoted: info });
            } else {
              await conn.sendMessage(from, {
                text: _quizTxt + `\n\n> ⚠️ _Imagem indisponível_`,
              }, { quoted: info });
            }
          } catch (e) {
            console.log("[QUIZ] Erro ao enviar:", e?.message);
            reply("❌ Erro ao iniciar quiz.");
            cancelarQuiz(from);
          }
          break;
        }

        case "dica":
        case "dicaquiz": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!temQuiz(from)) return reply("❌ Nenhum quiz ativo. Use *!quiz* para iniciar!");
          const _dInfo = getDica(from);
          reply(`💡 *Dica:* _${_dInfo.dica}_\n> Categoria: *${_dInfo.categoria}*`);
          break;
        }

        case "cancelarquiz":
        case "pularquiz":
        case "stopquiz": {
          if (!isGroup) return reply(Res_SoGrupo);
          const _cResp = cancelarQuiz(from);
          if (_cResp) {
            reply(`⏭️ *Quiz cancelado!*\n\n> A resposta era: *${_cResp}*\n> Use *!quiz* para outra rodada!`);
          } else {
            reply("❌ Nenhum quiz ativo no momento.");
          }
          break;
        }

        case "revelar":
        case "revelarquiz": {
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isGroupAdmins) return reply("🔒 Apenas *admins* podem revelar a resposta!");
          if (!temQuiz(from)) return reply("❌ Nenhum quiz ativo no momento.");

          const _revResp = cancelarQuiz(from);
          if (_revResp) {
            await conn.sendMessage(from, {
              text: `┏━━━━━━━━━━━━━━━┓\n` +
                    `┃ 👁️ *REVELADO!*\n` +
                    `┗━━━━━━━━━━━━━━━┛\n\n` +
                    `> 🔓 A resposta era: *${_revResp}*\n` +
                    `> 👤 Revelado por @${sender2}\n\n` +
                    `> ⏳ Próximo quiz em *5 segundos*...`,
              mentions: [sender],
            }, { quoted: info });

            // Auto próximo quiz
            setTimeout(async () => {
              try {
                if (temQuiz(from)) return;
                await conn.sendMessage(from, { text: "🔄 *Buscando próximo quiz...*" });
                const _revQuiz = await iniciarQuiz(from);
                if (!_revQuiz) return;
                const _revSrc = _revQuiz.thumbnailUrl || _revQuiz.wiki;
                const _revImg = await buscarImagem(_revSrc, _revQuiz.categoria);
                const _revNivel = _revQuiz.nivelGrupo === 1 ? "🟢 Fácil" : _revQuiz.nivelGrupo === 2 ? "🟡 Médio" : "🔴 Difícil";
                const _revTxt =
                  `┏━━━━━━━━━━━━━━━┓\n` +
                  `┃ ${_revQuiz.categoria} *QUIZ*\n` +
                  `┗━━━━━━━━━━━━━━━┛\n\n` +
                  `> 💡 Dica: _${_revQuiz.dica}_\n` +
                  `> 📊 Nível: *${_revNivel}*\n\n` +
                  `> 🎯 *Quem é / O que é?*\n` +
                  `> Responda no chat!\n` +
                  `> ⏱ Tempo: *5 minutos*\n` +
                  `> ⚡ XP aleatório para quem acertar!\n` +
                  `> 🛑 *${prefix}cancelarquiz* para parar`;
                if (_revImg) {
                  await conn.sendMessage(from, { image: _revImg, caption: _revTxt });
                } else {
                  await conn.sendMessage(from, { text: _revTxt + `\n\n> ⚠️ _Imagem indisponível_` });
                }
              } catch (e) { console.log("[QUIZ-REVELAR]", e?.message); }
            }, 5000);
          }
          break;
        }
        // ═══════════════════════════════════════════

        //===(ZOUEIRAS/BRINCADEIRAS/HUMOR)===\\

        case "gerarnick":
        case "fazernick":
        case "nick":
          try {
            if (ANT_LTR_MD_EMJ(q))
              return reply("Não pode letras modificadas nem emoji..");
            if (!q.trim())
              return reply(
                `Escreveva um nome para eu enviar ele com letras modificadas, Exemplo: ${prefix + command
                } Aleatory`,
              );
            ABC = await reqapi.gerarnick(q.trim());
            AB = `Lista com base no Nick informado, para encontrar melhor fonte para utilizar:\n\n`;
            for (i of ABC) {
              AB += `${i}\n\n`;
            }
            reply(AB);
          } catch (e) {
            return reply("Erro... 🥱");
          }
          break;

        case "chance":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          var avb = body.slice(7);
          if (args.length < 1)
            return conn.sendMessage(
              from,
              {
                text: `Você precisa digitar da forma correta\nExemplo: ${prefix}chance do luuck ser gay`,
              },
              { quoted: info },
            );
          random = `${Math.floor(Math.random() * 100)}`;
          hasil = `A chance ${body.slice(8)}\n\né de... ${random}%`;
          mention(hasil);
          break;

        case "nazista":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a sua ficha de nazista : @${sender_ou_n.split("@")[0]
              } aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            conn.sendMessage(
              from,
              {
                image: { url: imgnazista },
                caption: `O quanto você é nazista? \n\n「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱nazista 卐`,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "golpe":
        case "golpista":
        case "dogolpe":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a sua ficha de golpista : @${sender_ou_n.split("@")[0]
              } aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            conn.sendMessage(
              from,
              {
                image: { url: rnkgolpista },
                caption: `O quanto você é Golpista? \n\n「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${Math.floor(Math.random() * 110)}% ❱Golpista 😈`,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "gay":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a sua ficha de gay : @${sender_ou_n.split("@")[0]
              } aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = Math.floor(Math.random() * 110);
            feio = random;
            boiola = random;
            if (boiola < 20) {
              var bo = "hmm... você é hetero😔";
            } else if (boiola == 21) {
              var bo = "+/- boiola";
            } else if (boiola == 23) {
              var bo = "+/- boiola";
            } else if (boiola == 24) {
              var bo = "+/- boiola";
            } else if (boiola == 25) {
              var bo = "+/- boiola";
            } else if (boiola == 26) {
              var bo = "+/- boiola";
            } else if (boiola == 27) {
              var bo = "+/- boiola";
            } else if (boiola == 2) {
              var bo = "+/- boiola";
            } else if (boiola == 29) {
              var bo = "+/- boiola";
            } else if (boiola == 30) {
              var bo = "+/- boiola";
            } else if (boiola == 31) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 32) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 33) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 34) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 35) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 36) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 37) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 3) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 39) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 40) {
              var bo = "tenho minha desconfiança...😑";
            } else if (boiola == 41) {
              var bo = "você é né?😏";
            } else if (boiola == 42) {
              var bo = "você é né?😏";
            } else if (boiola == 43) {
              var bo = "você é né?😏";
            } else if (boiola == 44) {
              var bo = "você é né?😏";
            } else if (boiola == 45) {
              var bo = "você é né?😏";
            } else if (boiola == 46) {
              var bo = "você é né?😏";
            } else if (boiola == 47) {
              var bo = "você é né?😏";
            } else if (boiola == 4) {
              var bo = "você é né?😏";
            } else if (boiola == 49) {
              var bo = "você é né?😏";
            } else if (boiola == 50) {
              var bo = "você é ou não?🧐";
            } else if (boiola > 51) {
              var bo = "você é gay🙈";
            }
            conn.sendMessage(
              from,
              {
                image: { url: imggay },
                caption: `O quanto você é gay? \n\n 「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱ gay 🏳️‍🌈\n\n${bo}`,
                mentions: [sender_ou_n],
                thumbnail: null,
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "feio":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a sua ficha de feio : @${sender_ou_n.split("@")[0]
              } aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            feio = random;
            if (feio < 20) {
              var bo = "É não é feio";
            } else if (feio == 21) {
              var bo = "+/- feio";
            } else if (feio == 23) {
              var bo = "+/- feio";
            } else if (feio == 24) {
              var bo = "+/- feio";
            } else if (feio == 25) {
              var bo = "+/- feio";
            } else if (feio == 26) {
              var bo = "+/- feio";
            } else if (feio == 27) {
              var bo = "+/- feio";
            } else if (feio == 2) {
              var bo = "+/- feio";
            } else if (feio == 29) {
              var bo = "+/- feio";
            } else if (feio == 30) {
              var bo = "+/- feio";
            } else if (feio == 31) {
              var bo = "Ainda tá na média";
            } else if (feio == 32) {
              var bo = "Da pra pegar umas(ns) novinha(o) ainda";
            } else if (feio == 33) {
              var bo = "Da pra pegar umas(ns) novinha(o) ainda";
            } else if (feio == 34) {
              var bo = "É fein, mas tem baum coração";
            } else if (feio == 35) {
              var bo = "Tá na média, mas não deixa de ser feii";
            } else if (feio == 36) {
              var bo = "Bonitin mas é feio com orgulho";
            } else if (feio == 37) {
              var bo = "Feio e preguiçoso(a), vai se arrumar praga feia";
            } else if (feio == 3) {
              var bo = "tenho ";
            } else if (feio == 39) {
              var bo = "Feio, mas um banho E se arrumar, deve resolver";
            } else if (feio == 40) {
              var bo =
                "FeiN,mas não existe gente feia, existe gente que não conhece os produtos jequity";
            } else if (feio == 41) {
              var bo = "você é Feio, mas é legal, continue assim";
            } else if (feio == 42) {
              var bo =
                "Nada que uma maquiagem e se arrumar, que não resolva 🥴";
            } else if (feio == 43) {
              var bo = "Feio que dói de ver, compra uma máscara que melhora";
            } else if (feio == 44) {
              var bo = "Feio mas nada que um saco na cabeça não resolva né!?";
            } else if (feio == 45) {
              var bo = "você é feio, mas tem bom gosto";
            } else if (feio == 46) {
              var bo = "Feio mas tem muitos amigos";
            } else if (feio == 47) {
              var bo = "Feio mas tem lábia pra pegar várias novinha";
            } else if (feio == 4) {
              var bo = "Feio e ainda não sabe se vestir, vixi";
            } else if (feio == 49) {
              var bo = "Feiooo";
            } else if (feio == 50) {
              var bo = "você é Feio, mas não se encherga 🧐";
            } else if (feio > 51) {
              var bo = "você é Feio demais 🙈";
            }

            conn.sendMessage(
              from,
              {
                image: { url: imgfeio },
                caption: `O quanto você é feio? \n\n 「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱ feio 🙉\n\n${bo}`,
                mentions: [sender_ou_n],
                thumbnail: null,
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "corno":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: ` ❰ Pesquisando a ficha de corno : @${sender_ou_n.split("@")[0]
              }, aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            conn.sendMessage(
              from,
              {
                image: { url: imgcorno },
                caption: ` O quanto você é corno? \n\n 「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱corno 🐃`,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "vesgo":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a ficha de vesgo : @${sender_ou_n.split("@")[0]
              }, aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            conn.sendMessage(
              from,
              {
                image: { url: imgvesgo },
                caption: `O quanto você é vesgo? \n\n「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱Vesgo 🙄😆`,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "bebado":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a ficha de bebado : @${sender_ou_n.split("@")[0]
              } , aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            conn.sendMessage(
              from,
              {
                image: { url: imgbebado },
                caption: `O quanto você é bebado? \n\n「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱ Bêbado 🤢🥵🥴`,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "gado":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a ficha de gado : @${sender_ou_n.split("@")[0]
              }, aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            conn.sendMessage(
              from,
              {
                image: { url: imggado },
                caption: `O quanto você é gado? \n\n「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱gado 🐂`,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "gostoso":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: ` ❰ Pesquisando a sua ficha de gostoso : @${sender_ou_n.split("@")[0]
              } aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            conn.sendMessage(
              from,
              {
                image: { url: imggostoso },
                caption: `O quanto você é gostoso? 😏\n\n「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱ gostoso 😝`,
                gifPlayback: true,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "gostosa":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          conn.sendMessage(from, {
            text: `❰ Pesquisando a sua ficha de gostosa : @${sender_ou_n.split("@")[0]
              } aguarde... ❱`,
            mentions: [sender_ou_n],
          });
          setTimeout(async () => {
            random = `${Math.floor(Math.random() * 110)}`;
            conn.sendMessage(
              from,
              {
                image: { url: imggostosa },
                caption: `O quanto você é gostosa? 😏\n\n「 @${sender_ou_n.split("@")[0]
                  } 」Você é: ❰ ${random}% ❱ gostosa 😳`,
                mentions: [sender_ou_n],
              },
              { quoted: info },
            );
          }, 7000);
          break;

        case "matar":
        case "mata":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!menc_os2 || menc_jid2[1])
            return reply(
              "marque o alvo que você quer matar, a mensagem ou o @",
            );
          conn.sendMessage(
            from,
            {
              video: { url: matarcmd },
              gifPlayback: true,
              caption: `Você Acabou de matar o(a) @${menc_os2.split("@")[0]
                } 😈👹`,
              mentions: [menc_os2],
            },
            { quoted: info },
          );
          break;

        case "beijo":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!menc_os2 || menc_jid2[1])
            return reply(
              "marque a pessoa que você quer beijar, a mensagem ou o @",
            );
          conn.sendMessage(
            from,
            {
              video: { url: beijocmd },
              gifPlayback: true,
              caption: `Você deu um beijo gostoso na(o) @${menc_os2.split("@")[0]
                } 😁👉👈❤`,
              mentions: [menc_os2],
            },
            { quoted: info },
          );
          break;

        case "biografia":
          try {
            var status = await conn.fetchStatus(marc_tds);
          } catch {
            var status = "Privado ou inexistente. ";
          }
          reply(status);
          break;

        case "tapa":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!menc_os2 || menc_jid2[1])
            return reply(
              "marque o alvo que você quer da um tapa, a mensagem ou o @",
            );
          conn.sendMessage(
            from,
            {
              video: { url: tapacmd },
              gifPlayback: true,
              caption: `Você Acabou de da um tapa na raba da😏 @${menc_os2.split("@")[0]
                } 🔥`,
              mentions: [menc_os2],
            },
            { quoted: info },
          );
          break;

        case "chute":
        case "chutar":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!menc_os2 || menc_jid2[1])
            return reply(
              "marque o alvo que você quer da um chute, a mensagem ou o @",
            );
          conn.sendMessage(
            from,
            {
              video: { url: chutecmd },
              gifPlayback: true,
              caption: `Você Acabou de da um chute em @${menc_os2.split("@")[0]
                } 🤡`,
              mentions: [menc_os2],
            },
            { quoted: info },
          );
          break;

        case "dogolpe":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!menc_os2 || menc_jid2[1])
            return reply(
              "Marque a mensagem com o comando ou marque o @ do usuário..",
            );
          random = `${Math.floor(Math.random() * 100)}`;
          conn.sendMessage(from, {
            text: `*GOLPISTA ENCONTRADO👉🏻*\n\n*GOLPISTA* : *@${menc_os2.split("@")[0]
              }*\n*PORCENTAGEM DO GOLPE* : ${random}%😂\n\nEle(a) gosta de ferir sentimentos 😢`,
            mentions: [menc_os2],
          });
          break;

        case "casal":
        case "shippo":
        case "shipo":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          let mnt = [];
          let mr_u = [];
          rn = menc_prt
            ? menc_prt
            : menc_jid2?.length > 1
              ? menc_jid2[0]
              : getParticipantId(
                groupMembers[Math.floor(Math.random() * groupMembers.length)],
              );
          rn2 =
            menc_prt && !menc_jid2
              ? getParticipantId(
                groupMembers[Math.floor(Math.random() * groupMembers.length)],
              )
              : menc_jid2?.length == 1
                ? menc_jid2[0]
                : menc_jid2?.length > 1
                  ? menc_jid2[1]
                  : getParticipantId(
                    groupMembers[
                    Math.floor(Math.random() * groupMembers.length)
                    ],
                  );
          var AB = `${TEXTOS_GERAL.TEXTO_COMANDO_CASAL.replaceAll(
            "#porcentagem#",
            Math.floor(Math.random() * 100) + "%",
          )}\n\n☈ 💑 @${rn?.split("@")[0]}\nﮩ٨ـﮩﮩ٨ـ♡ﮩ٨ـﮩﮩ٨ـ\n☈ 💑 @${rn2?.split("@")[0]
            }\n\nBot: ${NomeDoBot}`;
          mnt.push(rn);
          mnt.push(rn2);
          conn.sendMessage(from, {
            image: { url: TEXTOS_GERAL.LINK_COMANDO_CASAL },
            caption: AB,
            mentions: mnt,
          });
          break;

        // ═══════ COMANDO DE RESUMO INTELIGENTE ═══════
        case "resumo":
        case "resumir":
        case "resumogrupo":
        case "oqrolou":
        case "oquerolou": {
          if (!isGroup) return reply(Res_SoGrupo);

          const _rsmCount = getResumoCount(from);
          if (_rsmCount < 5) {
            return reply(
              `❌ *Poucas mensagens capturadas!*\n\n` +
              `> Apenas *${_rsmCount}* msgs capturadas.\n` +
              `> Mínimo: *5* mensagens.\n\n` +
              `> 💡 Continue conversando e tente novamente!`
            );
          }

          await conn.sendMessage(from, { react: { text: "📊", key: info.key } });

          try {
            const _rsmAnalysis = analyzeResumoGroup(from, groupMembers);
            const _rsmSettings = JSON.parse(fs.readFileSync("./dados/settings.json", "utf-8"));
            const _rsmResult = await gerarResumo(_rsmAnalysis, groupName, _rsmSettings);

            if (_rsmResult && _rsmResult.text) {
              // Enviar com imagem de banner
              const _rsmImgPath = "./dados/img/resumo_banner.png";
              if (fs.existsSync(_rsmImgPath)) {
                await conn.sendMessage(from, {
                  image: fs.readFileSync(_rsmImgPath),
                  caption: _rsmResult.text,
                  mentions: _rsmResult.mentions || [],
                }, { quoted: info });
              } else {
                await conn.sendMessage(from, {
                  text: _rsmResult.text,
                  mentions: _rsmResult.mentions || [],
                }, { quoted: info });
              }
            } else {
              reply("❌ Não foi possível gerar o resumo.");
            }
          } catch (_rsmErr) {
            console.error("[RESUMO] Erro:", _rsmErr?.message || _rsmErr);
            reply("❌ Erro ao gerar resumo.");
          }
          break;
        }
        // ═══════════════════════════════════════════════

        case "rankativos":
        case "rankativo":
          if (!isGroup) return reply(Res_SoGrupo);
          await LIMPARDOCNT_QUEMJASAIU();
          var i3 = countMessage.map((i) => i.groupId).indexOf(from);
          if (i3 < 0) {
            return reply(
              "❌ O bot não tem dados de atividade deste grupo ainda.",
            );
          }
          if (
            !countMessage[i3].numbers ||
            countMessage[i3].numbers.length === 0
          ) {
            return reply("❌ Nenhuma atividade registrada neste grupo ainda.");
          }
          var blue = countMessage[i3].numbers.map((i) => i);
          blue.sort((a, b) =>
            (a.figus == undefined
              ? (a.figus = 0)
              : a.figus + a.messages + a.cmd_messages) <
              (b.figus == undefined
                ? (b.figus = 0)
                : b.figus + b.cmd_messages + b.messages)
              ? 0
              : -1,
          );
          menc = [];
          blad = `╭──────────────────╮\n│ 🏆 *RANK MAIS ATIVOS DO GRUPO*\n╰──────────────────╯\n`;
          for (i = 0; i < (blue.length < 5 ? blue.length : 5); i++) {
            if (i != null && blue[i]) {
              // Resolver LID → número real
              let _rkaJid = blue[i].id || "";
              let _rkaNum = _rkaJid.split("@")[0];
              if (_rkaNum.length > 15 && groupMembers && groupMembers.length > 0) {
                const _rkaFound = groupMembers.find(p => {
                  const pLid = (p.lid || "").split("@")[0];
                  const pId = (p.id || "").split("@")[0];
                  return pLid === _rkaNum || pId === _rkaNum;
                });
                if (_rkaFound && _rkaFound.id) {
                  const _rkaReal = _rkaFound.id.split("@")[0];
                  if (_rkaReal.length <= 15) {
                    _rkaNum = _rkaReal;
                    _rkaJid = _rkaReal + "@s.whatsapp.net";
                  }
                }
              }
              const _rkaMedal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
              blad += `\n${_rkaMedal} *${i + 1}º* ─ @${_rkaNum}\n   💬 Msgs: *${blue[i].messages || 0}* ─ 🤖 Cmds: *${blue[i].cmd_messages || 0}*\n   🎭 Figs: *${blue[i].figus || 0}* ─ 📱 ${blue[i].aparelho || "Desconhecido"}\n`;
              if (_rkaJid) menc.push(_rkaJid);
            }
          }
          mentions(blad, menc, true);
          break;

        case "checkativo":
          if (!isGroup) return reply(Res_SoGrupo);
          await LIMPARDOCNT_QUEMJASAIU();
          var ind = groupIdscount.indexOf(from);
          if (ind < 0) {
            return reply(
              "❌ O bot não tem dados de atividade deste grupo ainda.",
            );
          }
          if (!menc_os2 || menc_jid2[1]) {
            return reply(
              "❌ Marque o @ de quem deseja puxar a atividade / Só pode um por vez..",
            );
          }
          // Resolver LID → número real para checkativo
          let _ckJid = menc_os2;
          let _ckNum = _ckJid ? _ckJid.split("@")[0] : "Desconhecido";
          if (_ckNum.length > 15 && groupMembers && groupMembers.length > 0) {
            const _ckF = groupMembers.find(p => {
              const pLid = (p.lid || "").split("@")[0];
              const pId = (p.id || "").split("@")[0];
              return pLid === _ckNum || pId === _ckNum;
            });
            if (_ckF && _ckF.id) {
              const _ckReal = _ckF.id.split("@")[0];
              if (_ckReal.length <= 15) {
                _ckNum = _ckReal;
                _ckJid = _ckReal + "@s.whatsapp.net";
              }
            }
          }
          var indnum = numbersIds.indexOf(menc_os2);
          if (indnum >= 0 && countMessage[ind].numbers[indnum]) {
            var RSM_CN = countMessage[ind].numbers[indnum];
            mentions(
              `╭──────────────────╮\n│ 📊 *ATIVIDADE*\n│ @${_ckNum}\n│ Grupo: ${groupName}\n╰──────────────────╯\n\n💬 Mensagens: *${RSM_CN.messages || 0}*\n🤖 Comandos: *${RSM_CN.cmd_messages || 0}*\n📱 Aparelho: *${RSM_CN.aparelho || "Desconhecido"}*\n🎭 Figurinhas: *${RSM_CN.figus || 0}*`,
              [_ckJid],
              true,
            );
          } else {
            mentions(
              `╭──────────────────╮\n│ 📊 *ATIVIDADE*\n│ @${_ckNum}\n╰──────────────────╯\n\n💬 Mensagens: *0*\n🤖 Comandos: *0*`,
              [_ckJid],
              true,
            );
          }
          break;

        case "rankgay":
        case "rankgays":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `*🤖RANK DOS 5 MAIS GAYS DO GRUPO [ ${groupName} ]🏳️‍🌈*\n\n`;
          const selectedMembersGay = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersGay.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkgay },
            caption: ABC.trim(),
            mentions: selectedMembersGay,
          });
          break;

        case "rankgado":
        case "rankgados":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `RANK DOS 5 MAIS GADO DO GRUPO 🐂🐃\n\n`;
          const selectedMembersGado = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersGado.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkgado },
            caption: ABC.trim(),
            mentions: selectedMembersGado,
          });
          break;

        case "rankcorno":
        case "rankcornos":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `RANK DOS 5 MAIS CORNO DO GRUPO 🐂\n\n`;
          const selectedMembersCorno = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersCorno.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkcorno },
            caption: ABC.trim(),
            mentions: selectedMembersCorno,
          });
          break;

        case "rankgostosos":
        case "rankgostoso":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `RANK DOS 5 MAIS GOSTOSOS DO GRUPO 😏🔥\n\n`;
          const selectedMembersGostoso = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersGostoso.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkgostoso },
            caption: ABC.trim(),
            mentions: selectedMembersGostoso,
          });
          break;

        case "rankgostosas":
        case "rankgostosa":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `RANK DAS 5 MAIS GOSTOSAS DO GRUPO 😏🔥\n\n`;
          const selectedMembersGostosa = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersGostosa.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkgostosa },
            caption: ABC.trim(),
            mentions: selectedMembersGostosa,
          });
          break;

        case "rankkenga":
        case "rankkengas":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `RANK DAS 5 MAIS KENGAS DO GRUPO 👱‍♀️🔥\n\n`;
          const selectedMembersKenga = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersKenga.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkgostosa },
            caption: ABC.trim(),
            mentions: selectedMembersKenga,
          });
          break;

        case "ranknazista":
        case "ranknazistas":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `*💂‍♂RANK DOS 5 MAIS NAZISTAS DO GRUPO 卐🤡*\n\n`;
          const selectedMembersNazista = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersNazista.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnknazista },
            caption: ABC.trim(),
            mentions: selectedMembersNazista,
          });
          break;

        case "rankgolpe":
        case "rankgolpista":
        case "rankgolpistas":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `*🦹‍♂️ RANK DOS 5 MAIS GOLPISTA DO GRUPO 😈*\n\n`;
          const selectedMembersGolpista = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersGolpista.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkgolpista },
            caption: ABC.trim(),
            mentions: selectedMembersGolpista,
          });
          break;

        case "rankotaku":
        case "rankotakus":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `*㊙ RANK DOS 5 MAIS OTAKU DO GRUPO ( ˖•̀ _•́ ˖)*\n\n`;
          const selectedMembersOtaku = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${Math.floor(
                Math.random() * 100,
              )}% @${participantNumber}\n\n`;
              selectedMembersOtaku.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkotaku },
            caption: ABC.trim(),
            mentions: selectedMembersOtaku,
          });
          break;

        case "rankpau":
          if (!isGroup) return reply(Res_SoGrupo);
          if (!isModobn) return reply(Res_SoModoBN);
          if (!groupMembers || groupMembers.length === 0) {
            return reply(
              "❌ Não foi possível obter a lista de membros do grupo.",
            );
          }
          ABC = `*RANK DOS 5 PAU MAIOR DO GRUPO 📏*\n\n`;
          TMPAU = [
            "Pequeno pra cact, se mata maluco 🥴",
            `Pequenininho chega ser até fofo 🥺`,
            `Menor que meu dedo mindinho pequeno demais 😑`,
            `Até que dá sentir, tá na média 😌`,
            `Grandinho 🥵`,
            `Grande até `,
            `Gigantesco igual meu braço 😖`,
            `Enorme quase chega no útero 🤧`,
            `Grandão demais em, e uii 🤯`,
            `Vara de pegar manga, grande demais, como sai na rua assim??`,
            "Que grandão em, nasceu metade animal 😳",
          ];
          const selectedMembersPau = [];
          for (var i = 0; i < 5; i++) {
            const randomParticipant =
              groupMembers[Math.floor(Math.random() * groupMembers.length)];
            const participantId = getParticipantId(randomParticipant);
            if (participantId) {
              const participantNumber = participantId.split("@")[0];
              ABC += `${TMPAU[Math.floor(Math.random() * TMPAU.length)]
                } _- @${participantNumber}\n\n`;
              selectedMembersPau.push(participantId);
            }
          }
          conn.sendMessage(from, {
            image: { url: rnkpau },
            caption: ABC.trim(),
            mentions: selectedMembersPau,
          });
          break;

        case "jogodavelha":
          if (!isModobn) return reply(Res_SoModoBN);
          if (!isGroup) return reply(Res_SoGrupo);
          if (!menc_jid2)
            return reply(
              "Marque junto com o comando, o @ da pessoa que deseja desafiar..",
            );
          if (JOGO_D_V != false) {
            const boardnow = await setGame(`${from}`);
            const matrix = boardnow._matrix;
            if (!boardnow.X && !boardnow.O) {
              DLT_FL("./dados/org/tictactoe/db/" + from + ".json");
              return reply(
                `Jogo da vovó foi resetado, faça o desafio novamente para o usuário, tive um imprevisto na hora de calcular os dados, e então acabei não registrando ninguém, desculpe o ocorrido.`,
              );
            }
            const chatMove = `*🎮ꮐ̸Ꭺ̸Ꮇ̸Ꭼ̸ Ꭰ̸Ꭺ̸ Ꮩ̸Ꭼ̸Ꮮ̸Ꮋ̸Ꭺ̸🕹️*
 
[❗] Alguém está jogando no momento...\n\n@${boardnow.X.split("@")[0]} VS @${boardnow.O.split("@")[0]
              }
 
❌ : @${boardnow.X.split("@")[0]}
⭕ : @${boardnow.O.split("@")[0]}
 
 Sua vez : @${(boardnow.turn == "X" ? boardnow.X : boardnow.O).split("@")[0]}
 
${matrix[0][0]}${matrix[0][1]}${matrix[0][2]}
${matrix[1][0]}${matrix[1][1]}${matrix[1][2]}
${matrix[2][0]}${matrix[2][1]}${matrix[2][2]}

caso queira resetar o jogo, mande um adm ou os jogadores que estão jogando utilizar o comando ${prefix}rv
`;
            const mentions_array = [boardnow.X, boardnow.O];
            conn.sendMessage(
              from,
              {
                text: chatMove,
                mentions: mentions_array,
              },
              { quoted: info },
            );
            return;
          }
          if (!menc_jid2 || menc_jid2.length === 0)
            return reply(`*⟨❗⟩ Jogue com Alguem!!!!*
*para inicar a partida : ${prefix + command} @membro do gp*`);
          const boardnow = setGame(`${from}`);
          console.log(`Start No jogodavelha ${boardnow.session}`);
          boardnow.status = false;
          boardnow.X = sender; // Manter JID completo
          boardnow.O = menc_jid2[0]; // Usar menc_jid2[0] ao invés de argss[1]
          var blabord = [`${boardnow.X}`, `${boardnow.O}`];
          fs.writeFileSync(
            `./dados/org/tictactoe/db/${from}.json`,
            JSON.stringify(boardnow, null, 2),
          );
          const strChat = `*『📌ᎬᏕᏒᎬᏕᎪᏂᎠᏃ Ꭳ ᎣᏒᎣᏂᎬᏂᎲᎬ⚔️』*
 
@${sender.split("@")[0]
            } _está te desafiando para uma partida de jogo da velha..._
_[ @${menc_jid2[0].split("@")[0]
            } ] Use *『S』* para aceitar ou *『N』* para não aceitar..._\n\nEm caso de problemas, marque algum administrador para resetar o jogo com o comando ${prefix}rv`;
          conn.sendMessage(
            from,
            {
              text: strChat,
              mentions: [sender, menc_jid2[0]],
            },
            { quoted: info },
          );
          break;

        case "resetarvelha":
        case "resetavelha":
        case "resetarv":
        case "resetav":
        case "resetvelha":
        case "rv":
          if (
            !sender.includes(JOGO_D_V?.X) &&
            !sender.includes(JOGO_D_V?.O) &&
            !isGroupAdmins
          )
            return reply(`Fale com algum dos jogadores que jogaram ou espere eles terminar para
você jogar, se não tiver nenhum dos 2 online, fale com algum adm para digitar ${prefix}rv para resetar o jogo.`);
          if (fs.existsSync("./dados/org/tictactoe/db/" + from + ".json")) {
            DLT_FL("./dados/org/tictactoe/db/" + from + ".json");
            reply(`Jogo da vovó resetado com sucesso nesse grupo!`);
          } else {
            reply(`Não a nenhuma sessão em andamento...`);
          }
          break;

        case "ppt":
          if (!isModobn) return reply(Res_SoModoBN);
          if (args.length < 1)
            return reply(
              `Você deve digitar ${prefix}ppt pedra, ${prefix}ppt papel ou ${prefix}ppt tesoura`,
            );
          ppt = ["pedra", "papel", "tesoura"];
          ppy = ppt[Math.floor(Math.random() * ppt.length)];
          ppg = Math.floor(Math.random() * 1) + 10;
          pptb = ppy;
          if (
            (pptb == "pedra" && args == "papel") ||
            (pptb == "papel" && args == "tesoura") ||
            (pptb == "tesoura" && args == "pedra")
          ) {
            var vit = "vitoria";
          } else if (
            (pptb == "pedra" && args == "tesoura") ||
            (pptb == "papel" && args == "pedra") ||
            (pptb == "tesoura" && args == "papel")
          ) {
            var vit = "derrota";
          } else if (
            (pptb == "pedra" && args == "pedra") ||
            (pptb == "papel" && args == "papel") ||
            (pptb == "tesoura" && args == "tesoura")
          ) {
            var vit = "empate";
          } else if ((vit = "undefined")) {
            return reply(
              `Você deve digitar ${prefix}ppt pedra, ${prefix}ppt papel ou ${prefix}ppt tesoura`,
            );
          }
          if (vit == "vitoria") {
            var tes = "Vitória do jogador";
          }
          if (vit == "derrota") {
            var tes = "A vitória é do BOT";
          }
          if (vit == "empate") {
            var tes = "O jogo terminou em empate";
          }
          reply(
            `${NomeDoBot} jogou: ${pptb}\nO jogador jogou: ${args}\n\n${tes}`,
          );
          break;

        //==(AUDIOS/DE-MUSICA/ZOUEIRA/ETC..)===\\

        case "bot":
          conn.sendMessage(
            from,
            {
              audio: { url: "./dados/audios/bot.ogg" },
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
            },
            { quoted: info },
          );
          break;

        case "infobot":
          conn.sendMessage(
            from,
            {
              audio: { url: "./dados/audios/infobot.ogg" },
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
            },
            { quoted: info },
          );
          break;

        //=======================================\\

        //=====(ALTERADOR-DE-AUDIO/VIDEO)=======\\

        case "videocontrario":
        case "reversevid":
          if (
            ((isMedia && info.message.videoMessage) || !isQuotedImage) &&
            !q.length <= 1
          ) {
            reply(Res_Aguarde);
            encmedia = isQuotedVideo
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .videoMessage
              : info.message.videoMessage;
            rane = getRandom("." + (await getExtension(encmedia.mimetype)));
            buffimg = await getFileBuffer(encmedia, "video");
            fs.writeFileSync(rane, buffimg);
            media = rane;
            ran = getRandom(".mp4");
            exec(
              `ffmpeg -i ${media} -vf reverse -af areverse ${ran}`,
              (err) => {
                DLT_FL(media);
                if (err) return reply(`Err: ${err}`);
                buffer453 = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { video: buffer453, mimetype: "video/mp4" },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque um vídeo..");
          }
          break;

        case "videolento":
        case "slowvid":
          if (
            ((isMedia && info.message.videoMessage) || !isQuotedImage) &&
            !q.length <= 1
          ) {
            reply(Res_Aguarde);
            encmedia = isQuotedVideo
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .videoMessage
              : info.message.videoMessage;
            rane = getRandom("." + (await getExtension(encmedia.mimetype)));
            buffimg = await getFileBuffer(encmedia, "video");
            fs.writeFileSync(rane, buffimg);
            media = rane;
            ran = getRandom(".mp4");
            exec(
              `ffmpeg -i ${media} -filter_complex "[0:v]setpts=2*PTS[v];[0:a]atempo=0.5[a]" -map "[v]" -map "[a]" ${ran}`,
              (err) => {
                DLT_FL(media);
                if (err) return reply(`Err: ${err}`);
                buffer453 = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { video: buffer453, mimetype: "video/mp4" },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque um vídeo..");
          }
          break;

        case "videorapido":
        case "fastvid":
          if (
            ((isMedia && info.message.videoMessage) || !isQuotedImage) &&
            !q.length <= 1
          ) {
            reply(Res_Aguarde);
            encmedia = isQuotedVideo
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .videoMessage
              : info.message.videoMessage;
            rane = getRandom("." + (await getExtension(encmedia.mimetype)));
            buffimg = await getFileBuffer(encmedia, "video");
            fs.writeFileSync(rane, buffimg);
            media = rane;
            ran = getRandom(".mp4");
            exec(
              `ffmpeg -i ${media} -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2[a]" -map "[v]" -map "[a]" ${ran}`,
              (err) => {
                DLT_FL(media);
                if (err) return reply(`Err: ${err}`);
                buffer453 = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { video: buffer453, mimetype: "video/mp4" },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o vídeo..");
          }
          break;

        case "audiocontrario":
        case "audioreverse":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            encmedia = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(encmedia.mimetype)));
            buffimg = await getFileBuffer(encmedia, "audio");
            fs.writeFileSync(rane, buffimg);
            media = rane;
            ran = getRandom(".mp3");
            exec(
              `ffmpeg -i ${media} -vf reverse -af areverse ${ran}`,
              (err) => {
                DLT_FL(media);
                if (err) return reply(`Err: ${err}`);
                buffer453 = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: buffer453, mimetype: "audio/mpeg" },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque um audio..");
          }
          break;

        case "transcrever":
          {
            if (
              (isMedia &&
                !info.message.imageMessage &&
                info.message.videoMessage) ||
              isQuotedVideo ||
              isQuotedAudio
            ) {
              reply(Res_Aguarde);
              muk = isQuotedVideo
                ? JSON.parse(JSON.stringify(info).replace("quotedM", "m"))
                  .message.extendedTextMessage.contextInfo.message
                  .videoMessage
                : isQuotedAudio
                  ? JSON.parse(JSON.stringify(info).replace("quotedM", "m"))
                    ?.message?.extendedTextMessage?.contextInfo?.message
                    ?.audioMessage ||
                  info?.message?.extendedTextMessage?.contextInfo
                    ?.quotedMessage?.viewOnceMessageV2Extension?.message
                    ?.audioMessage
                  : info.message.audioMessage;

              let base64String = await getFileBuffer(
                muk,
                isQuotedAudio ? "audio" : "video",
              );
              let buffer = Buffer.from(base64String, "base64");

              let formData = new FormData();
              formData.append("file", buffer, {
                filename: isQuotedAudio ? "audiofile" : "videofile",
                contentType: muk.mimetype,
              });

              fetch(reqapi.transcrever(), {
                method: "POST",
                body: formData,
              })
                .then((response) => response.json())
                .then((data) => {
                  reply(data.texto);
                })
                .catch((Err) => {
                  return reply(
                    "Sinto muito, alguns formatos de áudio/vídeo, eu não consigo transcrever, em caso de dúvidas, tente novamente...",
                  );
                });
            } else {
              return reply("Marque um audio ou um vídeo.");
            }
          }
          break;

        case "bs64":
          muk = isQuotedAudio
            ? info.message.extendedTextMessage.contextInfo.quotedMessage
              .audioMessage
            : info.message.audioMessage;
          rane = getRandom("." + (await getExtension(muk.mimetype)));
          buffimg = await getFileBuffer(muk, "audio");
          console.log(JSON.stringify(buffimg, null, 2));
          break;

        case "grave2":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -filter:a "atempo=1.6,asetrate=22100" -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        case "grave":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -filter:a "atempo=0.9,asetrate=44100" -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        case "adolesc":
        case "vozmenino":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -filter:a atempo=1.06,asetrate=44100*1.25 -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        case "tomp3":
          if ((isMedia && !info.message.imageMessage) || isQuotedVideo) {
            post = isQuotedImage
              ? JSON.parse(JSON.stringify(info).replace("quotedM", "m")).message
                .extendedTextMessage.contextInfo.message.imageMessage
              : info.message.videoMessage;
            reply(Res_Aguarde);
            encmedia = isQuotedVideo
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .videoMessage
              : info.message.videoMessage;
            rane = getRandom("." + (await getExtension(encmedia.mimetype)));
            buffimg = await getFileBuffer(encmedia, "video");
            fs.writeFileSync(rane, buffimg);
            media = rane;
            ran = getRandom(".mp4");
            exec(`ffmpeg -i ${media} ${ran}`, (err) => {
              DLT_FL(media);
              if (err) return reply("❌ Falha ao converter vídeo para mp3 ❌");
              buffer = fs.readFileSync(ran);
              conn.sendMessage(
                from,
                { audio: buffer, mimetype: "audio/mpeg" },
                { quoted: info },
              );
              DLT_FL(ran);
            });
          } else {
            reply("Marque o vídeo para transformar em áudio por favor..");
          }
          break;

        case "bass3":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -af equalizer=f=20:width_type=o:width=2:g=15 -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        case "bass":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -af equalizer=f=20:width_type=o:width=2:g=15 -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        case "bass2":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -af equalizer=f=94:width_type=o:width=2:g=30 -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        case "estourar":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -af equalizer=f=90:width_type=o:width=2:g=30 -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        case "fast":
        case "audiorapido":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -filter:a "atempo=0.9,asetrate=95100" -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio...");
          }
          break;

        case "esquilo":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -filter:a "atempo=0.7,asetrate=65100" -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio...");
          }
          break;

        case "audiolento":
        case "slow":
          if (
            (isMedia &&
              !info.message.imageMessage &&
              !info.message.videoMessage) ||
            isQuotedAudio
          ) {
            reply(Res_Aguarde);
            muk = isQuotedAudio
              ? info.message.extendedTextMessage.contextInfo.quotedMessage
                .audioMessage
              : info.message.audioMessage;
            rane = getRandom("." + (await getExtension(muk.mimetype)));
            buffimg = await getFileBuffer(muk, "audio");
            fs.writeFileSync(rane, buffimg);
            gem = rane;
            ran = getRandom(".ogg");
            exec(
              `ffmpeg -i ${gem} -filter:a "atempo=0.9,asetrate=44100" -c:a libopus -b:a 48k ${ran}`,
              (err, stderr, stdout) => {
                DLT_FL(gem);
                if (err) return reply("Erro!");
                hah = fs.readFileSync(ran);
                conn.sendMessage(
                  from,
                  { audio: hah, mimetype: "audio/ogg; codecs=opus", ptt: true },
                  { quoted: info },
                );
                DLT_FL(ran);
              },
            );
          } else {
            reply("Marque o áudio..");
          }
          break;

        //==========(EFEITOS-MARCAR)==========\\

        case "togif":
          if (!isQuotedSticker)
            return reply("*[ ❗ ] Marque a figurinha animada 😉*");
          try {
            if (
              ((isMedia && !info.message.videoMessage) || isQuotedSticker) &&
              !q.length <= 1
            ) {
              buff = await getFileBuffer(
                info.message.extendedTextMessage.contextInfo.quotedMessage
                  .stickerMessage,
                "sticker",
              );
              reply("*「 ❗ 」 Aguarde, convertendo a figu em gif 🥱*");
              a = await webp_mp4(buff);
              conn
                .sendMessage(
                  from,
                  {
                    video: { url: a },
                    gifPlayback: true,
                    fileName: `stick.gif`,
                  },
                  { quoted: info },
                )
                .catch((e) => {
                  reply("Erro... 🥱");
                });
              DLT_FL(buff);
            }
          } catch (e) {
            console.log(e);
            reply("Erro... 🥱");
          }
          break;

        case "lixo":
        case "lgbt":
        case "morto":
        case "preso":
        case "deletem":
        case "procurado":
        case "hitler":
        case "borrar":
        case "merda":
          try {
            IMG =
              JSON.parse(JSON.stringify(info)?.replace("quotedM", "m"))?.message
                ?.extendedTextMessage?.contextInfo?.message?.imageMessage ||
              info.message?.imageMessage;
            PXR = await getFileBuffer(IMG, "image");
            reply("Realizando ação..");
            link = await reqapi.uploadDropbox(PXR);
            conn
              .sendMessage(
                from,
                {
                  image: {
                    url: `https://api.bronxyshost.com.br/api-bronxys/montagem?url=${link}&category=${command}&apikey=${API_KEY_BRONXYS}`,
                  },
                },
                { quoted: info },
              )
              .catch((e) => {
                return reply("Erro..");
              });
          } catch (e) {
            return reply("Marque uma imagem no WhatsApp, formato jpeg/jpg");
          }
          break;

        case "legenda":
          try {
            var [txt1, txt2] = q.split("/");
            if (!q.includes("/"))
              return reply(
                `Cade a / mano?\nExemplo: ${prefix + command} Sad/Demais`,
              );
            if ((isMedia && !info.message.videoMessage) || isQuotedImage) {
              boij = isQuotedImage
                ? JSON.parse(JSON.stringify(info).replace("quotedM", "m"))
                  .message.extendedTextMessage.contextInfo.message
                  .imageMessage
                : info.message.imageMessage;
              owgi = await getFileBuffer(boij, "image");
              res = await reqapi.uploadDropbox(owgi);
              conn
                .sendMessage(
                  from,
                  { image: { url: reqapi.legenda(res, txt1, txt2) } },
                  { quoted: info },
                )
                .catch((e) => {
                  return reply("Erro... 🥱");
                });
            } else {
              reply("Marque uma imagem...!");
            }
          } catch (e) {
            return reply("ERROR!!");
          }
          break;

        case "convite":
          if (!budy.includes("chat.whatsapp.com"))
            return reply("Cadê o link do grupo que você deseja que eu entre?");
          cnvt = args.join(" ");
          reply(
            `O convite para o bot entrar em seu grupo, foi enviado, espere o dono aceitar..`,
          );
          await sleep(1000);
          reply(
            `Use ${prefix}entrar cnvt ou ${prefix}recusar ${sender}, alguem enviou convite para entrar no grupo dele.`,
          );
          break;

        case "recusar":
          if (!SoDono) return reply(Res_SoDono);
          conn.sendMessage(q, {
            text: `Olá Amigo(a), sinto muito dizer, mas seu convite foi recusado 🥺`,
          });
          break;

        case "join":
        case "entrar":
          if (!SoDono) return reply(Res_SoDono);
          var string = args.join(" ");
          if (!string)
            return reply("Insira um link de convite ao lado do comando.");
          if (
            string.includes("chat.whatsapp.com/") ||
            reply("Ops, verifique o link que você inseriu.")
          ) {
            link = string.split("app.com/")[1];
            try {
              conn.groupAcceptInvite(`${link}`);
            } catch (erro) {
              if (String(erro).includes("resource-limit")) {
                reply("O grupo já está com o alcance de 1.024 membros.");
              }
              if (String(erro).includes("not-authorized")) {
                reply("Não foi possível entrar no grupo.\nMotivo: Banimento.");
              }
            }
          }
          break;
        //=======(FIM-EFEITOS-MARCAR)=========\\

        default:
          if (isGroup && dataGp[0]?.autobaixar) {
            // ═══ AUTOBAIXAR: Extrai link do corpo da mensagem ═══
            const _bodyTxt = budy || body || "";
            const _foundLinks = linkfy.find(_bodyTxt);
            const _extractedUrl =
              _foundLinks.length > 0 ? _foundLinks[0].href : null;

            // Detecta tipo de mídia pela URL
            let _abType = false;
            if (_extractedUrl) {
              const _url = _extractedUrl.toLowerCase();
              if (_url.includes("instagram.com/") && _url.length > 30)
                _abType = "instagram";
              else if (
                (_url.includes("tiktok.com/") ||
                  _url.includes("vm.tiktok.com/")) &&
                _url.length > 20
              )
                _abType = "tiktok";
              else if (
                (_url.includes("twitter.com/") || _url.includes("x.com/")) &&
                _url.length > 20
              )
                _abType = "twitter";
              else if (
                _url.includes("facebook.com/") ||
                _url.includes("fb.watch/")
              )
                _abType = "facebook";
              else if (_url.includes("spotify.com/") && _url.length > 25)
                _abType = "spotify";
              else if (_url.includes("kwai.com/") && _url.length > 20)
                _abType = "kwai";
              else if (
                _url.includes("youtube.com/shorts/") ||
                (_url.includes("youtu.be/") && _url.length < 45)
              )
                _abType = "shorts";
            }

            // Detecta áudio/vídeo para transcrição
            const _hasAudioOrVideo =
              info?.message?.audioMessage || info?.message?.videoMessage;

            if (_abType || _hasAudioOrVideo) {
              // Transcrição de áudio/vídeo
              if (_hasAudioOrVideo && !_abType) {
                try {
                  const _isAudioAB = !!info?.message?.audioMessage;
                  const _mediaMsg = _isAudioAB
                    ? info.message.audioMessage
                    : info.message.videoMessage;
                  const _mediaType = _isAudioAB ? "audio" : "video";

                  const _bufAB = await getFileBuffer(_mediaMsg, _mediaType);

                  const _formAB = new FormData();
                  _formAB.append("file", _bufAB, {
                    filename: _isAudioAB ? "audiofile" : "videofile",
                    contentType: _mediaMsg.mimetype,
                  });

                  fetch(reqapi.transcrever(), {
                    method: "POST",
                    body: _formAB,
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.texto && d.texto.trim()) {
                        conn.sendMessage(
                          from,
                          {
                            text: `🎙️ *Transcrição:*\n\n${d.texto}`,
                            mentions: [sender],
                          },
                          { quoted: info },
                        );
                      }
                    })
                    .catch(() => { });
                } catch { }
              }

              // Download de links
              if (_abType && _extractedUrl) {
                try {
                  switch (_abType) {
                    case "spotify":
                      conn
                        .sendMessage(from, {
                          audio: { url: reqapi.spotify_mp3(_extractedUrl) },
                          mimetype: "audio/mpeg",
                          mentions: [sender],
                        })
                        .catch(() => { });
                      break;

                    case "instagram":
                      try {
                        const _igData = await reqapi.instagram(_extractedUrl);
                        const _igType = _igData.msg[0].type;
                        const _igMime =
                          _igType === "mp4"
                            ? "video/mp4"
                            : _igType === "jpg"
                              ? "image/jpeg"
                              : _igType === "webp"
                                ? "image/webp"
                                : "video/mp4";
                        const _igMsg = _igMime.startsWith("image")
                          ? {
                            image: { url: _igData.msg[0].url },
                            mimetype: _igMime,
                            mentions: [sender],
                          }
                          : {
                            video: { url: _igData.msg[0].url },
                            mimetype: _igMime,
                            mentions: [sender],
                          };
                        conn.sendMessage(from, _igMsg).catch(() => { });
                      } catch { }
                      break;

                    case "tiktok":
                    case "twitter":
                    case "facebook":
                    case "kwai":
                    case "shorts":
                      try {
                        const _vidUrl =
                          _abType === "tiktok"
                            ? reqapi.tiktok(_extractedUrl)
                            : _abType === "twitter"
                              ? reqapi.twitter(_extractedUrl, false)
                              : _abType === "kwai"
                                ? reqapi.kwai_mp4(_extractedUrl)
                                : _abType === "shorts"
                                  ? reqapi.play(_extractedUrl, false)
                                  : reqapi.facebook(_extractedUrl, false);
                        conn
                          .sendMessage(from, {
                            video: { url: _vidUrl },
                            mimetype: "video/mp4",
                            mentions: [sender],
                          })
                          .catch(() => { });
                      } catch { }
                      break;
                  }
                } catch (e) {
                  console.log("[AUTOBAIXAR] Erro:", e.message || e);
                }
              }
            }
          }

          // FUNÇÕES.

          if (
            IS_sistemGold &&
            isGroup &&
            isBotGroupAdmins &&
            VR_JSON_GLOBAL &&
            !info.key.fromMe
          ) {
            async function Sys_G() {
              if (!dataGp[0]?.Chances?.some((i) => i.id === sender)) {
                !dataGp[0].hasOwnProperty("Chances")
                  ? (dataGp[0]["Chances"] = [])
                  : dataGp[0]["Chances"].push({
                    id: sender,
                    ChanceG: null,
                    ChanceAp: null,
                    ChanceR: [],
                    Vinganca: null,
                    cassino: 0,
                    quiz: [{ errou: 0, acertou: 0, numero: 0 }],
                    roletadasorte: false,
                    Cachaca: 1,
                    Escudo: [],
                  });
                setGp(dataGp);
              }

              if (!rggold.some((i) => i.grupo === from)) {
                rggold.push({
                  grupo: from,
                  usus: [
                    { id: sender, Golds: 0, data: 0, emp_G: [], emp_A: [] },
                  ],
                });
                Goldrgs(rggold);
              } else if (
                rggold.some((i) => i.grupo === from) &&
                !rggold[ID_G_GOLD]?.usus?.some((i) => i?.id === sender)
              ) {
                rggold[ID_G_GOLD].usus.push({
                  id: sender,
                  Golds: 0,
                  data: 0,
                  emp_G: [],
                  emp_A: [],
                });
                Goldrgs(rggold);
              }

              var dattofc = moment.tz("America/Sao_Paulo").format("DD/MM/YY");

              if (
                body.trim() &&
                !info.message?.reactionMessage?.text &&
                dattofc != S_Sistema.RS(sender, "data")
              ) {
                if (ID_G_GOLD < 0) return;
                var a_ = dataGp[0].Chances.find((i) => i.id === sender);
                conn.sendMessage(from, {
                  text: `🪙 @${sender.split("@")[0]} você recebeu *+20 Golds* pela primeira msg do dia!\n\n💡 Use *${prefix}menugold* p/ ver comandos`,
                  mentions: [sender],
                });
                S_Sistema.ADD_2(sender, 20, "data", dattofc);
                Object.assign(a_, {
                  quiz: [{ errou: 0, acertou: 0, numero: 0 }],
                  ChanceG: null,
                  ChanceAp: null,
                  ChanceR: [],
                  Vinganca: null,
                  roletadasorte: false,
                  cassino: 0,
                });
                setGp(dataGp);
              }
            }
            Sys_G();
          }

          //===(CRÉDITOS : ALEATORY CONTEÚDOS)==\\

          if (isGroup && isBotGroupAdmins && !isGroupAdmins) {
            if (
              (isAntiCtt &&
                (type === "contactMessage" ||
                  type === "contactsArrayMessage")) ||
              (Antiloc && type === "locationMessage") ||
              (isAnticatalogo && type === "productMessage")
            ) {
              if (isGroupAdmins)
                return conn.sendMessage(
                  from,
                  {
                    text: `Por você ser ADM, não será removido! Mais tarde mandar foto da raba no pv do Bot 🤤`,
                  },
                  { quoted: info },
                );
              if (IS_DELETE) {
                setTimeout(() => {
                  conn.sendMessage(from, {
                    delete: {
                      remoteJid: from,
                      fromMe: false,
                      id: info.key.id,
                      participant: sender,
                    },
                  });
                }, 500);
              }
              if (!JSON.stringify(groupMembers).includes(sender)) return;
              conn.groupParticipantsUpdate(from, [sender], "remove");
              clear = `🗑${"\n".repeat(
                255,
              )}🗑️\n❲❗❳ *Lɪᴍᴘᴇᴢᴀ ᴅᴇ Cʜᴀᴛ Cᴏɴᴄʟᴜɪ́ᴅᴀ* ✅`;
              conn.sendMessage(from, {
                text: clear,
                contextInfo: { forwardingScore: 500, isForwarded: true },
              });
              conn.sendMessage(from, {
                text: "Removido por jogar travas no grupo 🏌🏻‍♂️",
                mentions: groupAdmins,
              });
            }
          }

          if (
            isGroup &&
            isAntiFlood &&
            !SoDono &&
            !isnit &&
            isBotGroupAdmins &&
            !isGroupAdmins &&
            !isBot
          ) {
            if (isLimitec == null) {
              var limitefl = limitefll.limitefl;
            } else {
              var limitefl = isLimitec;
            }
            if (budy.length >= limitefl) {
              setTimeout(() => {
                console.log(colors.red("Deram Spam de caracteres.."));
                return conn.sendMessage(from, {
                  text:
                    TEXTOS_GERAL?.LIMITE_CARACTERES_MSG ||
                    "🏌🏻‍♂️_𝙑𝙖𝙯𝙖 𝙙𝙖𝙦𝙪𝙞 𝘾𝙖𝙧𝙣𝙞𝙘̧𝙖!𝙇𝙚𝙧 𝙖 𝙥𝙤𝙧𝙧𝙖 𝙙𝙖𝙨 𝙍𝙚𝙜𝙧𝙖𝙨𝙦𝙪𝙖𝙣𝙙𝙤 𝙚𝙣𝙩𝙧𝙖𝙧 𝙚𝙢 𝙂𝙧𝙪𝙥𝙤𝙨_🤺",
                });
              }, 100);
              setTimeout(async () => {
                if (IS_DELETE) {
                  setTimeout(() => {
                    conn.sendMessage(from, {
                      delete: {
                        remoteJid: from,
                        fromMe: false,
                        id: info.key.id,
                        participant: sender,
                      },
                    });
                  }, 500);
                }
                if (!JSON.stringify(groupMembers).includes(sender)) return;
                conn.groupParticipantsUpdate(from, [sender], "remove");
              }, 1000);
            }
          }

          //INICIO DE COMANDOS SEM PREFIXO

          const EnvAudio_SMP = async (
            direcao,
            nome1,
            nome2,
            nome3,
            nome4,
            nome5,
          ) => {
            let bla = [nome1, nome2, nome3, nome4, nome5];
            for (i of bla) {
              if (!i) return;
              if (messagesC.includes(i)) {
                conn.sendMessage(from, {
                  audio: { url: direcao },
                  mimetype: "audio/ogg; codecs=opus",
                  ptt: true,
                });
              }
            }
          };

          const EnvAudio2_SMP = async (
            direcao,
            nome1,
            nome2,
            nome3,
            nome4,
            nome5,
          ) => {
            let bla = [nome1, nome2, nome3, nome4, nome5];
            for (i of bla) {
              if (!i) return;
              if (budy2.includes(i)) {
                // Corrigido para Baileys 7.0+ - usar mimetype compatível
                conn.sendMessage(
                  from,
                  {
                    audio: { url: direcao },
                    mimetype: "audio/ogg; codecs=opus", // Corrigido para compatibilidade Android
                    ptt: true,
                  },
                  { quoted: info },
                );
              }
            }
          };

          const EnvTXT_SMP = async (
            texto,
            nome1,
            nome2,
            nome3,
            nome4,
            nome5,
          ) => {
            let bla = [nome1, nome2, nome3, nome4, nome5];
            for (i of bla) {
              if (!i) return;
              if (messagesC.includes(i)) {
                conn.sendMessage(from, { text: texto });
              }
            }
          };

          const EnvAudio2_GTTS = async (
            lingua,
            texto,
            txt1,
            txt2,
            txt3,
            txt4,
            txt5,
          ) => {
            let bla = [txt1, txt2, txt3, txt4, txt5];
            for (i of bla) {
              if (!i) return;
              if (budy2.includes(i)) {
                var gtt = require("./dados/org/funcoes/gtts")(lingua);
                ranm = getRandom(".mp3");
                rano = getRandom(".ogg");
                gtt.save(ranm, texto, function () {
                  exec(
                    `ffmpeg -i ${ranm} -ar 48000 -vn -c:a libopus ${rano}`,
                    (err) => {
                      DLT_FL(ranm);
                      buffer = fs.readFileSync(rano);
                      conn.sendMessage(
                        from,
                        {
                          audio: buffer,
                          mimetype: "audio/ogg; codecs=opus",
                          ptt: true,
                        },
                        { quoted: info },
                      );
                      DLT_FL(rano);
                    },
                  );
                });
              }
            }
          };

          if (isSimi2 && !isCmd && isGroup) {
            if (type == "conversation" || type == "extendedTextMessage") {
              try {
                var { insert, response: simiResponse2 } = require("./simi.js");
                if (info.key.fromMe) { /* ignorar msgs do bot */ }
                else {
                  // Verificar se é resposta a um comando (citação com prefixo)
                  let _isQuotedCmd = false;
                  try {
                    if (type == "extendedTextMessage") {
                      const _ctx = info.message?.extendedTextMessage?.contextInfo;
                      const _qm = _ctx?.quotedMessage;
                      const _qText = _qm?.conversation || _qm?.extendedTextMessage?.text || "";
                      if (_qText && prefix.includes(_qText[0])) _isQuotedCmd = true;
                    }
                  } catch { }

                  if (!_isQuotedCmd) {
                    // APRENDER: inserir mensagem no banco simi.json
                    insert(type, info);

                    // RESPONDER: buscar resposta no banco local
                    const _textoSimi = budy || body || "";
                    if (_textoSimi.trim().length >= 2) {
                      const sami = simiResponse2(_textoSimi);
                      if (sami) {
                        conn.sendMessage(from, { text: sami }, { quoted: info });
                      }
                    }
                  }
                }
              } catch (e) {
                console.log("[SIMI2] Erro no handler:", e?.message || e);
              }
            }
          }

          // ═══════════════════════════════════════════════
          // 🧠 IA ALEATORY — Sistema com Rate Limit + Fallbacks
          // ═══════════════════════════════════════════════
          if (!isCmd && budy && !info.key.fromMe && (type === "conversation" || type === "extendedTextMessage")) {
            const _iaText = (budy || "").trim();
            const _iaTextLow = _iaText.toLowerCase();
            const _iaAtivado = isGroup ? (dataGp[0]?.iaAleatory === true) : true;

            if (_iaAtivado && _iaText.length > 1) {
              const _iaMencionou = /\b(aleatory|aleatori)\b/i.test(_iaTextLow);

              let _iaRespondeuBot = false;
              if (type === "extendedTextMessage") {
                try {
                  const _iaCtx = info.message?.extendedTextMessage?.contextInfo;
                  if (_iaCtx?.quotedMessage) {
                    const _iaQuotedParticipant = _iaCtx.participant || "";
                    const _iaQuotedNum = _iaQuotedParticipant.split("@")[0].split(":")[0];
                    _iaRespondeuBot = _iaCtx.fromMe === true ||
                      _iaQuotedNum === botNumber ||
                      (botLid && _iaQuotedNum === botLid.split("@")[0]);
                  }
                } catch { }
              }

              if (_iaMencionou || _iaRespondeuBot) {
                // ═══ RATE LIMIT GLOBAL (proteção contra 429) ═══
                if (!global._iaRateLimit) global._iaRateLimit = { blocked: false, until: 0, backoff: 60000, activeRequests: 0 };
                const _rl = global._iaRateLimit;

                // Verificar se está em período de bloqueio por rate limit
                if (_rl.blocked && Date.now() < _rl.until) {
                  const _rlRestante = Math.ceil((_rl.until - Date.now()) / 1000);
                  const _conn0 = global.conn || conn;
                  await _conn0.sendMessage(from, {
                    text: `⏳ *A IA está descansando!*\n\n_Muitas mensagens foram enviadas. Aguarde *${_rlRestante}s* e tente novamente._`,
                  }, { quoted: info });
                  continue;
                }

                // Reset do bloqueio se já passou o tempo
                if (_rl.blocked && Date.now() >= _rl.until) {
                  _rl.blocked = false;
                  _rl.backoff = 60000; // Reset backoff
                }

                // Limitar requisições simultâneas (máx 2)
                if (_rl.activeRequests >= 2) continue;

                // Cooldown por usuário (15s normal, 30s se teve rate limit recente)
                if (!global._iaCooldown) global._iaCooldown = new Map();
                const _iaCooldownMs = _rl.backoff > 60000 ? 30000 : 15000;
                const _iaLast = global._iaCooldown.get(sender) || 0;
                if (Date.now() - _iaLast < _iaCooldownMs) continue;
                global._iaCooldown.set(sender, Date.now());

                // ═══ EXECUÇÃO ISOLADA — não pode derrubar o bot ═══
                const _iaFrom = from;
                const _iaSender = sender;
                const _iaPush = pushname;
                const _iaIsGroup = isGroup;
                const _iaInfo = info;
                const _iaQuotedCtx = _iaRespondeuBot ? info.message?.extendedTextMessage?.contextInfo : null;

                _rl.activeRequests++;

                setTimeout(async () => {
                  try {
                    if (!global._iaMemory) global._iaMemory = new Map();
                    const _iaMemKey = _iaSender + "_" + _iaFrom;
                    const _iaHist = global._iaMemory.get(_iaMemKey) || [];

                    let _iaQuery = _iaText.replace(/\b(aleatory|aleatori|hey|ei|oi|ola|olá)[,.:!?]?\s*/gi, "").trim();
                    if (_iaQuery.length < 2) _iaQuery = _iaText;

                    // Contexto da msg citada
                    if (_iaQuotedCtx && _iaHist.length === 0) {
                      const _qt = _iaQuotedCtx.quotedMessage?.conversation ||
                        _iaQuotedCtx.quotedMessage?.extendedTextMessage?.text || "";
                      if (_qt) _iaHist.push({ role: "assistant", content: _qt });
                    }

                    _iaHist.push({ role: "user", content: _iaQuery });
                    if (_iaHist.length > 4) _iaHist.splice(0, _iaHist.length - 4);

                    const _iaSys = `Você é Aleatory Bot, assistente de WhatsApp da BronxysHost. Responda em pt-BR, amigável, direto (máx 150 palavras). Use emojis com moderação. NUNCA diga que usa API externa ou Gemini. Usuário: ${_iaPush || "amigo"}. ${_iaIsGroup ? "Chat de grupo." : "Chat privado."}`;

                    let _iaReply = "";

                    // ═══ TENTATIVA 1: POLLINATIONS (sem chave) ═══
                    try {
                      const _polRes = await axios.post("https://text.pollinations.ai/v1/chat/completions", {
                        messages: [{ role: "system", content: _iaSys }, ..._iaHist],
                        model: "openai",
                        jsonMode: false,
                        seed: Math.floor(Math.random() * 99999),
                      }, {
                        headers: {
                          "Content-Type": "application/json",
                          "Referer": "https://bronxyshost.com",
                          "Origin": "https://bronxyshost.com",
                        },
                        timeout: 25000,
                      });
                      if (_polRes?.data?.choices?.[0]?.message?.content) {
                        _iaReply = _polRes.data.choices[0].message.content;
                        console.log("[IA-ALEATORY] ✅ Pollinations respondeu");
                      }
                    } catch (_e1) {
                      const _statusCode = _e1?.response?.status;
                      console.log("[IA-ALEATORY] Pollinations falhou:", _statusCode || _e1?.message || "erro");

                      // ═══ DETECTAR 429 E ATIVAR BACKOFF GLOBAL ═══
                      if (_statusCode === 429) {
                        _rl.blocked = true;
                        _rl.until = Date.now() + _rl.backoff;
                        console.log(`[IA-ALEATORY] ⚠️ Rate limit! Bloqueando por ${_rl.backoff / 1000}s`);
                        _rl.backoff = Math.min(_rl.backoff * 2, 300000); // Dobrar backoff (máx 5min)
                      }
                    }

                    // ═══ TENTATIVA 2: GEMINI (se tiver chave) ═══
                    if (!_iaReply) {
                      try {
                        const _gemKey = setting?.gemini_api_key || "";
                        if (_gemKey && _gemKey.length > 10) {
                          const _gemContents = [
                            { role: "user", parts: [{ text: _iaSys }] },
                            { role: "model", parts: [{ text: "Entendido!" }] },
                          ];
                          for (const h of _iaHist) {
                            _gemContents.push({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] });
                          }
                          const _gemRes = await axios.post(
                            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${_gemKey}`,
                            { contents: _gemContents },
                            { headers: { "Content-Type": "application/json" }, timeout: 15000 }
                          );
                          const _gemText = _gemRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                          if (_gemText && _gemText.length > 1) {
                            _iaReply = _gemText.trim();
                            console.log("[IA-ALEATORY] ✅ Gemini respondeu (backup)");
                          }
                        }
                      } catch (_eGem) {
                        console.log("[IA-ALEATORY] Gemini falhou:", _eGem?.response?.status || _eGem?.message || "erro");
                      }
                    }

                    // ═══ TENTATIVA 3: DUCKDUCKGO AI (sem chave, sem limite severo) ═══
                    if (!_iaReply) {
                      try {
                        const _duckMsgs = [{ role: "user", content: _iaSys + "\n\n" + _iaQuery }];
                        const _duckRes = await axios.post("https://duckduckgo.com/duckchat/v1/chat", {
                          model: "gpt-4o-mini",
                          messages: _duckMsgs,
                        }, {
                          headers: {
                            "Content-Type": "application/json",
                            "x-vqd-accept": "1",
                          },
                          timeout: 15000,
                        });
                        // DuckDuckGo retorna streaming, tentar pegar texto
                        const _duckText = typeof _duckRes.data === "string"
                          ? _duckRes.data.split("\n").filter(l => l.startsWith("data:")).map(l => {
                            try { return JSON.parse(l.slice(5))?.message; } catch { return ""; }
                          }).join("")
                          : _duckRes.data?.message || "";
                        if (_duckText && _duckText.length > 1) {
                          _iaReply = _duckText.trim();
                          console.log("[IA-ALEATORY] ✅ DuckDuckGo respondeu (backup 2)");
                        }
                      } catch (_eDuck) {
                        console.log("[IA-ALEATORY] DuckDuckGo falhou:", _eDuck?.message || "erro");
                      }
                    }

                    // ═══ TENTATIVA 4: SIMI LOCAL (último recurso) ═══
                    if (!_iaReply) {
                      try {
                        const _simiLocal = await simih(_iaQuery);
                        if (_simiLocal && _simiLocal.length > 0) {
                          _iaReply = _simiLocal;
                          console.log("[IA-ALEATORY] ✅ Simi local respondeu (último recurso)");
                        }
                      } catch { }
                    }

                    // Enviar resposta se tiver
                    if (_iaReply && _iaReply.length > 0) {
                      _iaHist.push({ role: "assistant", content: _iaReply });
                      if (_iaHist.length > 4) _iaHist.splice(0, _iaHist.length - 4);
                      global._iaMemory.set(_iaMemKey, _iaHist);

                      const _conn = global.conn || conn;
                      await _conn.sendMessage(_iaFrom, { text: _iaReply }, { quoted: _iaInfo });
                    } else {
                      // Todas as APIs falharam — avisar o usuário UMA vez
                      const _conn = global.conn || conn;
                      await _conn.sendMessage(_iaFrom, {
                        text: `😴 _Estou com dificuldade para responder agora. Tenta de novo em alguns segundos!_`,
                      }, { quoted: _iaInfo });
                    }
                  } catch (e) {
                    console.log("[IA-ALEATORY] Erro isolado:", e?.message || e);
                  } finally {
                    _rl.activeRequests = Math.max(0, _rl.activeRequests - 1);
                  }
                }, 0);
              }
            }
          }

          var hora_sla = moment.tz("America/Sao_Paulo").format("HH:mm:ss");

          EnvAudio2_GTTS(
            "pt",
            `São ${hora_sla} da ${tempo.split(" ")[1]}`,
            "que horas sao?",
          );

          EnvTXT_SMP(prefix, "prefixo");

          if (isAutorepo) {
            if (budy2 === "!") {
              blars = [
                "Errou 😝",
                "🤦🏻‍♂️ Errou de novo seu animal 🫵🏻🤣️",
                "Ta difícil ai meu parceiro 😏",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "#") {
              blars = [
                "Mano!desiste logo você não vai acertar esta passando vergonha 😌🍃",
                "Escrever o nome de prefixo que eu te mando, bobinho 🥱",
                "Parar que esta feio pra você mano 🥹",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "/") {
              blars = [
                "Xiiiisai daí doido 😂",
                "É ruim em,meu prefixo não é esse parar de ser bobo 🥱",
                "Um pauzinho em 😏",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === ".") {
              blars = [
                "Se tu mandar mais um pontinho vou te remover do grupo 😒",
                "Travou meu pocket 🤬",
                "Oushe!Está mandando pontinho aqui pra quer 🤔",
                "Parar de mandar pontinho aqui,parece besta 🤦🏻‍♂️",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "sei") {
              blars = [
                "Tu lá sabe de nada inocente,me falar aí quantos são 2+2 🥱",
                "Parar de ser irônico 🙄",
                "Secsu 😏",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bem vindo") {
              blars = [
                "Não deixe que nada desse grupo te desanime. Lembre-se que até um pé na bunda te empurra pra frente. 😂",
                "A regra é clara entrou tem que pagar a coca 😌",
                "Bem vindo!Aqui não tem fofoqueiro. Só temhistoriadores da vida alheia. 🙊",
                "Falar aí pra essa pessoa que entrou,se ela não participar do grupo eu vou passar a faca 😏🔪",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bem vinda") {
              blars = [
                "Não deixe que nada desse grupo te desanime. Lembre-se que até um pé na bunda te empurra pra frente. 😂",
                "A regra é clara entrou tem que pagar a coca 😌",
                "Bem vindo!Aqui não tem fofoqueiro. Só temhistoriadores da vida alheia. 🙊",
                "Falar aí pra essa pessoa que entrou,se ela não participar do grupo eu vou passar a faca 😏🔪",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bv") {
              blars = [
                "Não deixe que nada desse grupo te desanime. Lembre-se que até um pé na bunda te empurra pra frente. 😂",
                "A regra é clara entrou tem que pagar a coca 😌",
                "Bem vindo!Aqui não tem fofoqueiro. Só temhistoriadores da vida alheia. 🙊",
                "Falar aí pra essa pessoa que entrou,se ela não participar do grupo eu vou passar a faca 😏🔪",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "obrigado") {
              blars = [
                "Por nada! Não leve as redes sociais tão a sério, a maioria das opiniões são de pessoas que estão sentadas no vaso cagando 😂",
                "Dizem que tudo que vai, volta. Acho que meu dinheiro se perdeu no caminho, nunca mais voltou 🥹",
                "Até poderia concordar com você, mas daí seriam duas pessoas erradas. 😂",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "obrigada") {
              blars = [
                "Por nada! Não leve as redes sociais tão a sério, a maioria das opiniões são de pessoas que estão sentadas no vaso cagando 😂",
                "Dizem que tudo que vai, volta. Acho que meu dinheiro se perdeu no caminho, nunca mais voltou 🥹",
                "Até poderia concordar com você, mas daí seriam duas pessoas erradas. 😂",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "obg") {
              blars = [
                "Por nada! Não leve as redes sociais tão a sério, a maioria das opiniões são de pessoas que estão sentadas no vaso cagando 😂",
                "Dizem que tudo que vai, volta. Acho que meu dinheiro se perdeu no caminho, nunca mais voltou 🥹",
                "Até poderia concordar com você, mas daí seriam duas pessoas erradas. 😂",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "serio?") {
              blars = [
                "Mas sério que o meu dono, o cabra é da igreja 😼",
                "Isso, isso, isso, isso..🫰🏻",
                "Não!Por acaso eu já mentir pra você?Não responda 🤥",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "serio") {
              blars = [
                "Mas sério que o meu dono , o cabra é da igreja 😼",
                "Isso, isso, isso, isso..🫰🏻",
                "Não!Por acaso eu já mentir pra você?Não responda 🤥",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "cheguei") {
              blars = [
                "Ninguém ligar 🥱",
                "Não diga 🙄",
                "Já que demorou aparecer mostrar raba 😏",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "😒") {
              blars = [
                "Está cagando é 😏🚽",
                "Tá com fominha é 😏",
                "Tá chateadinha é bb 😏",
                "Que foi cara de cu azedo 🤔",
                "Cara feia é dor de barriga,vai cagar 😏",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bot") {
              blars = [
                "Deixar eu dormir sossegado!!",
                "Algum problema 🙄",
                "Se tu me chamar mais uma vez vou te banir do grupo",
                "Ou parar de encher o saco, estou tentando dormir!!!",
                "O que tu quer comigo??",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bot caiu") {
              blars = [
                "Tua cara que caiu, ta me vendo aqui não 🙄",
                "Meus zovos que caiu 😒",
                "Caiu a minha mão na tua cara 🥱",
                "Eu não cai simplesmente eu não quero falar com você 🥱",
                "Tuas tetas que caiu, isso tu não falar 🙄",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bot parou") {
              blars = [
                "Parei para fazer xixi caralho, pode não 😒",
                "Eu estava dormindo, me deixa em paz 😒️",
                "Eu não parei simplesmente eu não quero falar com você 🥱",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bom dia a todos") {
              blars = [
                "Chega de bom dia!Acordei e quero aplausos 🥱",
                "Bom dia!Acordei disposta e linda.Mentira,foi só linda mesmo 😏",
                "Bom dia!Só queria uma coisa:ter muito dinheiro.O resto eu comprava 🥹",
                "Não desista dos seus sonhos!Desligue o despertador e continue dormindo 😴",
                "Eu era linda, rica, sensual...E aí o despertador tocou 😭",
                "Acordei tão gata hoje, que quando fui bocejar,eu miei 🤭",
                "Não é bom dia. Bom dia seria se já passasse do meio-dia!Agora faça cilêncio por favor 🥱😴",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2 === "bom dia grupo") {
              blars = [
                "Chega de bom dia!Acordei e quero aplausos 🥱",
                "Bom dia!Acordei disposta e linda.Mentira,foi só linda mesmo 😏",
                "Bom dia!Só queria uma coisa:ter muito dinheiro.O resto eu comprava 🥹",
                "Não desista dos seus sonhos!Desligue o despertador e continue dormindo 😴",
                "Eu era linda, rica, sensual...E aí o despertador tocou 😭",
                "Acordei tão gata hoje, que quando fui bocejar,eu miei 🤭",
                "Não é bom dia. Bom dia seria se já passasse do meio-dia!Agora faça cilêncio por favor 🥱😴",
              ];
              blarnd = blars[Math.floor(Math.random() * blars.length)];
              reply(blarnd);
            }

            if (budy2.includes("alugar")) {
              if (info.key.fromMe) return;
              reply(
                "Se você estiver procurando um Bot incrível para animar seu grupo eu estou disponível.Vai no pv do meu dono e falar com ele.\n(https://wa.me/5562981116342) Obrigada coração, chamar lá 🙆🏻‍♀️",
              );
            }

            if (budy2.includes("bom dia,")) {
              if (info.key.fromMe) return;
              reply(
                "Eu era linda, rica, sensual...E aí o despertador tocou 😭",
              );
            }

            if (budy2.includes("bom dia.")) {
              if (info.key.fromMe) return;
              reply("Acordei tão gata hoje, que quando fui bocejar,eu miei 🤭");
            }

            if (budy2.includes("conteudo")) {
              if (info.key.fromMe) return;
              reply(
                "Pix caiu foto sumiu!Só os tolos para cair nesse golpe!Tu é umLadrãozinho e esta passando golpe de dentro do Presídio 😂",
              );
            }

            if (budy2.includes("o bot")) {
              if (info.key.fromMe) return;
              reply(
                "Não esqueça de ler as regras do grupo, lá tem todas as informações do grupo 🤹🏻‍♀️",
              );
            }

            if (
              budy2.includes("adivinha meu celular") ||
              budy2.includes("bot qual meu celular")
            ) {
              conn.sendMessage(from, { text: adivinha }, { quoted: info });
            }

            //=========[--ANTI PALAVRÃO --]==========\\

            if (
              isGroup &&
              isPalavrao &&
              isBotGroupAdmins &&
              !SoDono &&
              !isGroupAdmins
            ) {
              if (
                dataGp[0].antipalavrao.palavras.some(
                  (i) =>
                    i &&
                    budy2.includes(
                      i
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, ""),
                    ),
                )
              ) {
                setTimeout(() => {
                  if (!JSON.stringify(groupMembers).includes(sender)) return;
                  conn.groupParticipantsUpdate(from, [sender], "remove");
                  setTimeout(() => {
                    conn.sendMessage(from, {
                      delete: {
                        remoteJid: from,
                        fromMe: false,
                        id: info.key.id,
                        participant: sender,
                      },
                    });
                  }, 500);
                }, 2000);
                conn.sendMessage(from, {
                  text: `⚠️<𝗣𝗔𝗟𝗔𝗩𝗥𝗔-𝗣𝗥𝗢𝗜𝗕𝗜𝗗𝗔>⚠️\n🤾🏻𝗮𝗾𝘂𝗶 𝗻𝗮̃𝗼, 𝘃𝗮𝘇𝗮 𝗳𝗿𝘂𝘁𝗶𝗻𝗵𝗮🏌🏻‍♂️️`,
                });
              }
            }
          }
          //===============(SIMIH-1)===============\\

          if (isGroup && isSimi && budy != undefined && budy.trim().length >= 2) {
            if (type === "imageMessage") return;
            if (type === "audioMessage") return;
            if (type === "stickerMessage") return;
            if (info.key.fromMe) return;
            try {
              let muehe = null;
              let _simiAttempts = 0;
              const _simiMaxAttempts = 3;
              const _simiStart = Date.now();

              do {
                muehe = await simih(budy);
                _simiAttempts++;
                if (Date.now() - _simiStart > 8000) break;
                if (!muehe) break; // sem resposta, não repetir
              } while (
                _simiAttempts < _simiMaxAttempts &&
                muehe &&
                TEXTOS_GERAL.PALAVRAS_PROIBIDA_DE_O_SIMI_FALAR.some((i) =>
                  muehe
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .includes(i),
                )
              );

              if (muehe) {
                // Verificar palavras proibidas uma última vez
                const _proibido = TEXTOS_GERAL.PALAVRAS_PROIBIDA_DE_O_SIMI_FALAR.some((i) =>
                  muehe.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(i),
                );
                if (!_proibido) reply(muehe);
              }
            } catch (e) {
              console.log("[SIMIH1] Erro:", e?.message || e);
            }
          }

          //========================================\\
          hora2 = moment.tz("America/Sao_Paulo").format("HH:mm:ss");

          if (isCmd) {
            uptime = process.uptime();
            conn.sendMessage(
              from,
              {
                text: `
╭─❖ 🧊🔥 ❖─╮
│ ⏳ ${tempo} 
│ 👤 @${sender2}
│
│ 🚫 Não achado 🥱
│ 💡 Use: ${prefix}Menu
╰──────────╯
`,
                mentions: [sender],
              },
              { quoted: selo },
            );
          }
        //========================================\\
      }
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = startAle;
