const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Lista de todas as dependências essenciais para o bot funcionar
const dependencies = [
  "@whiskeysockets/baileys@7.0.0-rc14",
  "@hapi/boom",
  "axios",
  "fs-extra",
  "cheerio",
  "pino",
  "node-cache",
  "linkifyjs",
  "ms",
  "fluent-ffmpeg",
  "node-fetch@2",
  "qrcode-terminal",
  "moment-timezone",
  "colors",
  "file-type@16.5.3",
];

function checkAndInstall() {
  console.log("\x1b[36m[SISTEMA]\x1b[0m Verificando ambiente do bot...");
  let missing = false;

  // Verifica se as principais bibliotecas estão presentes
  try {
    require("colors");
    require("axios");
    require("fs-extra");
    // Baileys é ESM, verificar se o diretório existe no node_modules
    if (!fs.existsSync("./node_modules/@whiskeysockets/baileys")) {
      missing = true;
    }
  } catch (e) {
    missing = true;
  }

  if (missing) {
    console.log(
      "\x1b[33m[AVISO]\x1b[0m Dependências essenciais não encontradas."
    );
    console.log(
      "\x1b[36m[SISTEMA]\x1b[0m Iniciando instalação automática de todas as bibliotecas..."
    );
    console.log(
      "\x1b[36m[SISTEMA]\x1b[0m Isso pode levar cerca de 1 minuto. Por favor, aguarde."
    );

    try {
      execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
      console.log(
        "\x1b[32m[SUCESSO]\x1b[0m Todas as dependências foram instaladas!"
      );
      console.log(
        "\x1b[36m[SISTEMA]\x1b[0m Reiniciando o processo para carregar as bibliotecas..."
      );
    } catch (err) {
      console.log("\x1b[31m[ERRO]\x1b[0m Falha na instalação automática.");
      console.log(
        "Tente executar manualmente no console: npm install " +
        dependencies.join(" ")
      );
      process.exit(1);
    }
  } else {
    console.log("\x1b[32m[SISTEMA]\x1b[0m Ambiente verificado com sucesso!");
  }
}

// Executa a verificação
checkAndInstall();

// Início do código original do bot
// Baileys é carregado via import() dinâmico dentro de INC() para compatibilidade ESM
const readline = require("readline");
const { Boom } = require("@hapi/boom");
const NodeCache = require("node-cache");

// ═══════════════════════════════════════════════════════════
// STORE DE MENSAGENS — Para o callback getMessage do Baileys 7.x
// Map limitado (FIFO, 2500 msgs / 5min TTL) — NUNCA lança ECACHEFULL
// ═══════════════════════════════════════════════════════════
const _MESSAGE_STORE_MAX = 2500;
const _MESSAGE_STORE_TTL_MS = 300_000;
const _messageStoreMap = new Map();

function _safeMessageStoreSet(id, msg) {
  try {
    if (!id || !msg) return;
    if (_messageStoreMap.has(id)) _messageStoreMap.delete(id);
    _messageStoreMap.set(id, { msg, ts: Date.now() });
    while (_messageStoreMap.size > _MESSAGE_STORE_MAX) {
      const oldestKey = _messageStoreMap.keys().next().value;
      if (oldestKey === undefined) break;
      _messageStoreMap.delete(oldestKey);
    }
  } catch { }
}

function _safeMessageStoreGet(id) {
  try {
    if (!id) return undefined;
    const entry = _messageStoreMap.get(id);
    if (!entry) return undefined;
    if (Date.now() - entry.ts > _MESSAGE_STORE_TTL_MS) {
      _messageStoreMap.delete(id);
      return undefined;
    }
    return entry.msg;
  } catch {
    return undefined;
  }
}

global._storeOutgoingMessage = (id, message) => {
  if (id && message) _safeMessageStoreSet(id, { message });
};

// ═══ CACHES SEPARADOS DE METADADOS DE GRUPO ═══
// 1) _baileysGroupCache: EXCLUSIVO para Baileys (cachedGroupMetadata) — guarda SOMENTE objetos puros/intactos
//    vindos direto do WhatsApp (com participants + addressingMode). NUNCA recebe fallback de disco nem mutação!
// 2) _groupMetadataCache / _groupMetadataStale: para lógica do bot (index.js, bem-vindo, ADV), protegido contra 429.
const _baileysGroupCache = new NodeCache({ stdTTL: 180, checkperiod: 60, useClones: false });
const _groupMetadataCache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
const _groupMetadataStale = new Map();
const _GROUP_STALE_MAX = 300;
const _groupMetadataInFlight = new Map();
let _groupMetadataRateLimitedUntil = 0;

function _saveStaleGroupMeta(groupId, meta) {
  if (!groupId || !meta) return;
  if (_groupMetadataStale.has(groupId)) _groupMetadataStale.delete(groupId);
  _groupMetadataStale.set(groupId, meta);
  while (_groupMetadataStale.size > _GROUP_STALE_MAX) {
    const oldest = _groupMetadataStale.keys().next().value;
    if (oldest === undefined) break;
    _groupMetadataStale.delete(oldest);
  }
}

function _findGroupMetadataOnDisk(groupId) {
  try {
    if (fs.existsSync("./dados/global/groups.json")) {
      const diskGroups = JSON.parse(fs.readFileSync("./dados/global/groups.json", "utf8"));
      if (Array.isArray(diskGroups)) {
        return diskGroups.find((g) => g && g.id === groupId) || null;
      }
    }
  } catch { }
  return null;
}

function _applyParticipantUpdateToCache(groupId, action, participants) {
  // Invalidar cache do Baileys em add/remove para que a criptografia de grupo nunca use lista desatualizada
  if (action === "add" || action === "remove") {
    _baileysGroupCache.del(groupId);
  }

  const cached = _groupMetadataCache.get(groupId) || _groupMetadataStale.get(groupId);
  if (!cached || !Array.isArray(cached.participants) || !Array.isArray(participants)) return;

  // Clonar lista de participantes antes de mutar (nunca mutar referência compartilhada)
  const updated = { ...cached, participants: cached.participants.map((m) => (m ? { ...m } : m)) };

  for (const p of participants) {
    const pId = typeof p === "string" ? p : (p.id || p.phoneNumber || "");
    const pPn = typeof p === "object" && p.phoneNumber ? p.phoneNumber : "";
    const pNum = String(pPn || pId).split("@")[0].split(":")[0];
    if (!pId && !pNum) continue;

    const idx = updated.participants.findIndex((m) => {
      if (!m) return false;
      if (pId && (m.id === pId || m.lid === pId || m.phoneNumber === pId)) return true;
      if (pPn && (m.id === pPn || m.phoneNumber === pPn)) return true;
      const mNum = String(m.phoneNumber || m.id || "").split("@")[0].split(":")[0];
      return Boolean(pNum && mNum === pNum);
    });

    if (action === "add" && idx === -1) {
      updated.participants.push({
        id: pId || pPn,
        ...(pPn ? { phoneNumber: pPn } : {}),
        admin: null,
      });
    } else if (action === "remove" && idx !== -1) {
      updated.participants.splice(idx, 1);
    } else if (action === "promote" && idx !== -1) {
      updated.participants[idx].admin = "admin";
    } else if (action === "demote" && idx !== -1) {
      updated.participants[idx].admin = null;
    }
  }
  _groupMetadataCache.set(groupId, updated);
  _saveStaleGroupMeta(groupId, updated);
}

// ═══════════════════════════════════════════════════════════
// FUNÇÃO PARA BUSCAR VERSÃO MAIS RECENTE DO WA WEB
// ═══════════════════════════════════════════════════════════
async function getWAVersionFromWPP() {
  // ═══ TENTATIVA 1: fetchLatestBaileysVersion (fonte oficial do Baileys) ═══
  try {
    const baileys = await import("@whiskeysockets/baileys");
    const fetchVer = baileys.fetchLatestBaileysVersion;
    if (fetchVer) {
      const { version } = await fetchVer();
      if (version && Array.isArray(version)) {
        return version;
      }
    }
  } catch { }

  // ═══ TENTATIVA 2: WPPConnect (scraping de versão) ═══
  try {
    const _axiosWPP = require('axios');
    const response = await _axiosWPP.get('https://wppconnect.io/pt-BR/whatsapp-versions/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      timeout: 10000
    });

    const regex = /2\.3000\.(\d+)/;
    const match = response.data.match(regex);

    if (match?.[1]) {
      return [2, 3000, +match[1]];
    }
  } catch { }

  // ═══ FALLBACK: versão fixa segura ═══
  return null;
}

// Importar sistema de menu profissional
const {
  clearScreen,
  showBanner,
  showWelcomeScreen,
  showConnectingCard,
  showOnlineDashboard,
  showHelpScreen,
  showTrustScreen,
  showPairingInstructions,
  showQRInstructions,
  showMenu,
  showLoading,
  stopLoading,
  showSuccess,
  showError,
  showWarning,
  askQuestion: menuAskQuestion,
  colors,
  symbols,
} = require("./menu_conexao.js");

let sessionStartTime;

// Suprimir erros de descriptografia (Bad MAC) que não afetam o funcionamento
const originalConsoleError = console.error;
console.error = function () {
  const message = typeof arguments[0] === 'string' ? arguments[0] : '';
  const suppressPatterns = [
    'Failed to decrypt message',
    'Bad MAC',
    'Session error',
    'verifyMAC',
    'doDecryptWhisperMessage',
    'decryptWithSessions',
  ];
  const fullMsg = Array.from(arguments).map(a => String(a)).join(' ');
  if (suppressPatterns.some(p => fullMsg.includes(p))) {
    return; // Suprimir - são erros normais de sessão que não afetam o bot
  }
  originalConsoleError.apply(console, arguments);
};

// ═══ PROTEÇÃO CONTRA CRASH POR PROMISES NÃO TRATADAS ═══
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERRO] Promise não tratada:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[ERRO] Exceção não capturada:', err?.message || err);
  console.error(err?.stack);
  // NUNCA faz process.exit — mantém o bot vivo
});
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// GUARDIÃO DA SESSÃO — PROTEÇÃO ABSOLUTA DO QRCODE/CREDS
// ════════════════════════════════════════════════════════
// NOTA: CREDS_PATH e CREDS_BACKUP_PATH são definidos após a declaração de qrcode (linha ~249)

// Backup automático do creds.json
function _backupCreds() {
  try {
    if (fs.existsSync(CREDS_PATH)) {
      fs.copyFileSync(CREDS_PATH, CREDS_BACKUP_PATH);
    }
  } catch (e) {
    console.error('[GUARDIÃO] Erro ao fazer backup do creds.json:', e.message);
  }
}

// Restaurar creds.json do backup se necessário
function _restoreCreds() {
  try {
    if (!fs.existsSync(CREDS_PATH) && fs.existsSync(CREDS_BACKUP_PATH)) {
      fs.copyFileSync(CREDS_BACKUP_PATH, CREDS_PATH);
      console.log('\x1b[32m[GUARDIÃO]\x1b[0m creds.json restaurado do backup!');
      return true;
    }
  } catch (e) {
    console.error('[GUARDIÃO] Erro ao restaurar backup:', e.message);
  }
  return false;
}

// Função de restart SEGURO — exportada para que index.js possa usar
global._safeRestart = function () {
  console.log('\x1b[33m[RESTART]\x1b[0m Reiniciando conexão de forma segura (sem deletar sessão)...');
  _backupCreds(); // Garantir backup antes de reconectar
  _isReconnecting = false; // Permitir nova conexão
  setTimeout(() => {
    createConnection().catch(e => console.error('[RESTART] Erro:', e.message));
  }, 2000);
};

// Interceptar process.exit para NUNCA encerrar por acidente
const _originalExit = process.exit;
let _exitAllowed = false; // Apenas true no menu de seleção
process.exit = function (code) {
  if (_exitAllowed) {
    return _originalExit.call(process, code);
  }
  console.log(`\x1b[31m[GUARDIÃO]\x1b[0m process.exit(${code}) BLOQUEADO! ` +
    `Sessão protegida. Usando restart seguro...`);
  // Em vez de sair, fazer restart seguro
  if (global._safeRestart) global._safeRestart();
};
// ════════════════════════════════════════════════════════

const {
  fetch,
  axios,
  util,
  P,
  linkfy,
  cheerio,
  ms,
  exec,
  moment,
  time,
  hora,
  date,
  getBuffer,
  fetchJson,
  getBase64,
  upload,
  banner2,
  banner3,
  getGroupAdmins,
  nescessario,
  setting,
  countMessage,
  getRandom,
} = require("./consts-func.js");

const { TEXTOS_GERAL } = require("./dono/textos.js");

var qrcode = "./dados/ALEATORY-QR";

// ═══ DEFINIR CREDS_PATH AQUI (após qrcode ser declarado) ═══
const CREDS_PATH = `${qrcode}/creds.json`;
const CREDS_BACKUP_PATH = `${qrcode}/creds.backup.json`;

try {
  if (!fs.existsSync("./dados/global"))
    fs.mkdirSync("./dados/global", { recursive: true });
  if (!fs.existsSync("./dados/global/groups.json")) {
    fs.writeFileSync("./dados/global/groups.json", JSON.stringify([], null, 2));
  }
} catch (e) { }

// Variáveis globais para controle de conexão
let connectionMethod = null; // 'pairing' ou 'qr'
let usePairingCode = false;

function coletarNumeros(inputString) {
  return inputString.replace(/\D/g, "");
}

const originalConsoleInfo = console.info;

console.info = function () {
  const message = util.format(...arguments);
  const forbiddenStrings = [
    "Closing session: SessionEntry",
    "Removing old closed session",
    "Closing stale open session",
  ];
  if (forbiddenStrings.some((str) => message.includes(str))) {
    return;
  }
  originalConsoleInfo.apply(console, arguments);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Cache com TTL de 10min para evitar vazamento de RAM em container de 1 GB
const msgRetryCounterCache = new NodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

// Função auxiliar para extrair o JID correto do participante (compatível com Baileys 7.0+)
const getParticipantJid = (participant) => {
  if (!participant) return "";
  if (typeof participant === "string") return participant;
  if (typeof participant === "object" && participant !== null) {
    // Priorizar phoneNumber (número real) sobre id (LID)
    if (participant.phoneNumber)
      return participant.phoneNumber.includes("@")
        ? participant.phoneNumber
        : `${participant.phoneNumber}@s.whatsapp.net`;
    if (participant.id)
      return participant.id.includes("@")
        ? participant.id
        : `${participant.id}@s.whatsapp.net`;
    if (participant.lid) {
      const lidClean = String(participant.lid).replace(/\s+/g, "");
      return `${lidClean}@lid`;
    }
  }
  return String(participant);
};

const getParticipantNumber = (participant) => {
  if (!participant) return "";
  // Priorizar phoneNumber diretamente para obter o número real
  if (typeof participant === "object" && participant !== null) {
    if (participant.phoneNumber) {
      return String(participant.phoneNumber).split("@")[0].replace(/\s+/g, "");
    }
  }
  const jid = getParticipantJid(participant);
  if (!jid) return "";
  return String(jid).split("@")[0].replace(/\s+/g, "");
};

const extractNumber = (jid) => {
  if (!jid) return "";
  return String(jid).split("@")[0];
};

const isJidInList = (jid, list) => {
  if (!jid || !Array.isArray(list)) return false;
  const number = extractNumber(jid);
  return list.some((item) => extractNumber(item) === number);
};

/**
 * Menu principal de seleção de método de conexão
 */
async function selectConnectionMethod() {
  await showWelcomeScreen();

  while (true) {
    const choice = await question(
      `${colors.cyan}${symbols.arrow}${colors.reset} Escolha (1-5): `
    );

    if (choice === "1") {
      connectionMethod = "pairing";
      usePairingCode = true;
      clearScreen();
      showPairingInstructions();
      showSuccess("Método: Código de Pareamento");
      return;
    } else if (choice === "2") {
      connectionMethod = "qr";
      usePairingCode = false;
      clearScreen();
      showQRInstructions();
      showSuccess("Método: QR Code");
      return;
    } else if (choice === "3") {
      // Tenho Dúvidas — mostra tutorial
      await showHelpScreen();
      console.log(`  ${colors.yellow}Pressione ENTER para voltar...${colors.reset}`);
      await question("");
      clearScreen();
      showBanner();
      await require("./menu_conexao.js").showSystemInfo();
      showMenu();
    } else if (choice === "4") {
      // Devo Confiar?
      await showTrustScreen();
      console.log(`  ${colors.purple}Pressione ENTER para voltar...${colors.reset}`);
      await question("");
      clearScreen();
      showBanner();
      await require("./menu_conexao.js").showSystemInfo();
      showMenu();
    } else if (choice === "5") {
      console.log(
        `\n  ${colors.brightYellow}👋 Até logo! Encerrando...${colors.reset}\n`
      );
      _exitAllowed = true;
      _originalExit.call(process, 0);
    } else {
      showError("Opção inválida! Digite 1 a 5.");
    }
  }
}

// ═══════════════════════════════════════════════════════════
// VARIÁVEIS GLOBAIS DE CONEXÃO (persistentes entre reconexões)
// ═══════════════════════════════════════════════════════════
let _baileysMod = null;
let _makeWASocket = null;
let _baileysUtils = null;
let _logger = null;
let _reconnectAttempts = 0;
let _sessionErrorAttempts = 0;
let _bannerShownOnce = false;
let _sessionResetDone = false;
const _MAX_RETRIES_BEFORE_RESET = 50;
let _schedulersInitialized = false;
// ═══ PROTEÇÃO CONTRA ACÚMULO DE SOCKETS ═══
let _isReconnecting = false; // Impede reconexões simultâneas
let _currentSocket = null;   // Referência ao socket atual para limpeza

// ═══════════════════════════════════════════════════════════
// CARREGAR BAILEYS (UMA VEZ)
// ═══════════════════════════════════════════════════════════
async function loadBaileys() {
  if (_baileysMod) return; // Já carregado

  _baileysMod = await import("@whiskeysockets/baileys");
  try {
    const { installNativeAudioStickerProtoExtension } = require("./dados/org/funcoes/wa_adapter.js");
    installNativeAudioStickerProtoExtension(_baileysMod);
  } catch { }
  _makeWASocket = _baileysMod.default || _baileysMod.makeWASocket;
  _baileysUtils = {
    useMultiFileAuthState: _baileysMod.useMultiFileAuthState,
    fetchLatestBaileysVersion: _baileysMod.fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore: _baileysMod.makeCacheableSignalKeyStore,
    isJidStatusBroadcast: _baileysMod.isJidStatusBroadcast,
    isJidNewsletter: _baileysMod.isJidNewsletter,
    isJidBroadcast: _baileysMod.isJidBroadcast,
    delay: _baileysMod.delay,
    Browsers: _baileysMod.Browsers,
    DisconnectReason: _baileysMod.DisconnectReason,
  };

  // Logger
  try {
    const loggerMod = await import("@whiskeysockets/baileys/lib/Utils/logger");
    const MAIN_LOGGER = loggerMod.default || loggerMod;
    _logger = (typeof MAIN_LOGGER.child === 'function' ? MAIN_LOGGER : MAIN_LOGGER.default).child({});
  } catch (e) {
    const pino = require("pino");
    _logger = pino({ level: "silent" });
  }
  _logger.level = "silent";
}

// ═══════════════════════════════════════════════════════════
// INICIALIZAR SCHEDULERS (UMA VEZ, USAM global.conn)
// ═══════════════════════════════════════════════════════════
let _schedulerSummary = { modulesActive: 0, modulesTotal: 5, aluguelAtivo: false };

function initializeSchedulers() {
  if (_schedulersInitialized) return _schedulerSummary;
  _schedulersInitialized = true;

  let active = 0;
  let aluguelAtivo = false;
  // Silencia apenas os 5 logs verbosos síncronos de inicialização para exibir no painel consolidado
  const _origLog = console.log;
  console.log = () => { };

  try {
    try {
      const { initHorariosScheduler } = require("./dados/org/funcoes/horarios_grupo.js");
      initHorariosScheduler();
      active++;
    } catch (e) {
      console.error("[HORÁRIOS] Erro ao iniciar scheduler:", e.message);
    }

    try {
      const { initAvisosScheduler } = require("./operacao/avisos-automaticos/index.js");
      initAvisosScheduler();
      active++;
    } catch (e) {
      console.error("[AVISOS] Erro ao iniciar scheduler:", e.message);
    }

    try {
      const { initAbrirFecharScheduler } = require("./operacao/abrir-fechar-grupo/index.js");
      initAbrirFecharScheduler();
      active++;
    } catch (e) {
      console.error("[ABRIR/FECHAR] Erro ao iniciar scheduler:", e.message);
    }

    try {
      const { initBirthdayScheduler } = require("./dados/org/funcoes/aniversario.js");
      initBirthdayScheduler();
      active++;
    } catch (e) {
      console.error("[ANIVERSÁRIO] Erro ao iniciar scheduler:", e.message);
    }

    try {
      const { initAluguelScheduler } = require("./dados/org/funcoes/aluguel.js");
      const _settingAluguel = JSON.parse(fs.readFileSync("./dados/settings.json", "utf-8"));
      const _numerodonoAluguel = String(_settingAluguel?.numerodono || "").replace(/\D/g, "");
      if (_numerodonoAluguel) {
        initAluguelScheduler(null, _numerodonoAluguel);
        aluguelAtivo = true;
        active++;
      }
    } catch (e) {
      console.error("[ALUGUEL] Erro ao iniciar scheduler:", e.message);
    }
  } finally {
    console.log = _origLog;
  }

  _schedulerSummary = { modulesActive: active, modulesTotal: 5, aluguelAtivo };
  return _schedulerSummary;
}

// ═══════════════════════════════════════════════════════════
// TRATAR ERRO DE SESSÃO (NUNCA deleta sessão/QR code)
// Backoff progressivo (30s -> 60s -> 5min) para não spammar o WhatsApp
// ═══════════════════════════════════════════════════════════
async function _handleSessionError(motivo) {
  _sessionErrorAttempts += 1;
  const waitSec = _sessionErrorAttempts === 1 ? 30 : _sessionErrorAttempts === 2 ? 60 : 300;
  console.log(`\n\x1b[31m[SESSÃO]\x1b[0m ${motivo}`);
  console.log(`\x1b[33m[SESSÃO]\x1b[0m A sessão NÃO será deletada automaticamente. Próxima tentativa em ${waitSec}s...`);
  console.log(`\x1b[33m[SESSÃO]\x1b[0m Se trocou de número ou deslogou, apague TODA a pasta "${qrcode}" e reinicie.`);
  _isReconnecting = false;
  await new Promise(r => setTimeout(r, waitSec * 1000));
  createConnection();
}

// ═══════════════════════════════════════════════════════════
// CRIAR CONEXÃO (pode ser chamada múltiplas vezes sem duplicar)
// ═══════════════════════════════════════════════════════════
async function createConnection() {
  // ═══ IMPEDIR RECONEXÃO SIMULTÂNEA ═══
  if (_isReconnecting) {
    console.log('[CONEXÃO] Reconexão já em andamento, ignorando chamada duplicada...');
    return;
  }
  _isReconnecting = true;

  try {
    // ═══ FECHAR SOCKET ANTERIOR (LIMPEZA TOTAL) ═══
    if (_currentSocket) {
      console.log('[CONEXÃO] Limpando socket anterior...');
      try {
        _currentSocket.ev.removeAllListeners();
      } catch (e) { /* OK: socket pode já estar morto */ }
      try {
        _currentSocket.end(undefined);
      } catch (e) { /* OK: socket pode já estar fechado */ }
      _currentSocket = null;
    }

    await loadBaileys();

    // ═══════════════════════════════════════════════════════════
    // BLOQUEIO DE IP — DESATIVADO TEMPORARIAMENTE
    // Para reativar, descomente o bloco abaixo:
    // ═══════════════════════════════════════════════════════════
    /*
    try {
      const [ipRes, vpsRes] = await Promise.all([
        axios.get("https://api.ipify.org?format=json", { timeout: 10000 }).catch(() => axios.get("https://l2.io/ip.json", { timeout: 10000 })).catch(() => null),
        axios.get("https://raw.githubusercontent.com/bronxys/bronxys/main/list.json", { timeout: 10000 }).catch(() => null),
      ]);

      if (!ipRes || !vpsRes) {
        console.log("\x1b[33m[AVISO]\x1b[0m Falha na verificação de IP (timeout/offline).");
        console.log("\x1b[33m[AVISO]\x1b[0m Tentando prosseguir mesmo assim... (Verificação secundária ativa)");
      } else {
        const meuIP = ipRes.data?.ip || ipRes.data;
        const listaPermitida = Array.isArray(vpsRes.data) ? vpsRes.data : [];

        if (listaPermitida.length > 0 && !listaPermitida.includes(meuIP)) {
          console.log("\x1b[31m╔══════════════════════════════════════════════════╗\x1b[0m");
          console.log("\x1b[31m║  ⛔ ACESSO NEGADO — IP NÃO AUTORIZADO           ║\x1b[0m");
          console.log("\x1b[31m║  Este bot só funciona na hospedagem Bronxys.     ║\x1b[0m");
          console.log(`\x1b[31m║  IP detectado: ${String(meuIP).padEnd(33)}║\x1b[0m`);
          console.log("\x1b[31m║  Contrate em: bronxyshost.com                    ║\x1b[0m");
          console.log("\x1b[31m╚══════════════════════════════════════════════════╝\x1b[0m");
          _exitAllowed = true;
          _originalExit.call(process, 1);
          return;
        }
        console.log(`\x1b[32m[BRONXYS]\x1b[0m IP autorizado ✅`);
      }
    } catch (e) {
      console.log("\x1b[33m[AVISO]\x1b[0m Erro na conexão de verificação. Prosseguindo...");
    }
    */

    const {
      useMultiFileAuthState,
      fetchLatestBaileysVersion,
      makeCacheableSignalKeyStore,
      isJidStatusBroadcast,
      isJidNewsletter,
      isJidBroadcast,
      delay,
      Browsers,
      DisconnectReason,
    } = _baileysUtils;

    // ═══ FLAG: primeira conexão (QR/código recém-escaneado) ═══
    const _isFirstConnection = !fs.existsSync(`${qrcode}/creds.json`);

    // Exibir menu de seleção se não houver sessão ativa
    if (_isFirstConnection) {
      await selectConnectionMethod();
    } else if (!_bannerShownOnce) {
      _bannerShownOnce = true;
      // ═══ INICIALIZAÇÃO — Banner Natalino Animado (apenas 1x ao iniciar) ═══
      const { clearScreen: _cls, showBanner: _sBan, startRGBBanner, stopRGBBanner } = require("./menu_conexao.js");
      const _sleep = (ms) => new Promise(r => setTimeout(r, ms));

      _cls();
      startRGBBanner();
      await _sleep(2200);
      stopRGBBanner();

      _cls();
      _sBan();
      showConnectingCard();
    } else {
      console.log("\x1b[36m[CONEXÃO]\x1b[0m Reconectando ao WhatsApp...");
    }

    let pairingPhoneNumber = null;
    const { state, saveCreds } = await useMultiFileAuthState(qrcode);

    // ═══ BUSCAR VERSÃO ATUALIZADA DO WA WEB ═══
    const waVersion = await getWAVersionFromWPP() || [2, 3000, 1044006379];

    const conn = _makeWASocket({
      logger: _logger,
      version: waVersion,
      browser: Browsers.ubuntu("Chrome"),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, _logger),
      },
      shouldIgnoreJid: (jid) =>
        isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
      msgRetryCounterCache,
      markOnlineOnConnect: false,  // false = não suprime notificações do celular
      syncFullHistory: false,
      generateHighQualityLinkPreview: false, // evita download de previews (economiza RAM e acelera envios)
      keepAliveIntervalMs: 25_000, // 25s (ideal para manter NAT/firewalls ativos)
      emitOwnEvents: false,
      connectTimeoutMs: 60_000,
      defaultQueryTimeoutMs: 60_000,  // Evita falhas de query sob carga
      retryRequestDelayMs: 500,       // Backoff interno mais rápido
      // ═══ getMessage — ESSENCIAL para Baileys 7.x ═══
      // Permite retry de descriptografia quando mensagem chega fora de ordem
      getMessage: async (key) => {
        const stored = _safeMessageStoreGet(key?.id);
        return stored?.message || undefined;
      },
      // ═══ Cache PURO de metadados para criptografia do Baileys (NUNCA usa disco/mutação) ═══
      cachedGroupMetadata: async (jid) => _baileysGroupCache.get(jid),
    });

    // ═══ WRAPPER GLOBAL DE conn.groupMetadata (Cache 5min + Dedup + Proteção 429) ═══
    // Impede que chamadas frequentes no index.js (rgGroupM) ou eventos de grupo disparem 429 rate-overlimit
    const _rawGroupMetadata = conn.groupMetadata.bind(conn);
    conn.groupMetadata = async (jid) => {
      if (!jid) return null;
      const cached = _groupMetadataCache.get(jid);
      if (cached) return cached;

      if (Date.now() < _groupMetadataRateLimitedUntil) {
        const fallback = _groupMetadataStale.get(jid) || _findGroupMetadataOnDisk(jid);
        if (fallback) return fallback;
      }

      if (_groupMetadataInFlight.has(jid)) {
        return _groupMetadataInFlight.get(jid);
      }

      const fetchPromise = (async () => {
        try {
          const fresh = await _rawGroupMetadata(jid);
          if (fresh) {
            // Salvar cópia intacta no cache puro do Baileys somente se tiver participants + addressingMode válidos
            if (Array.isArray(fresh.participants) && fresh.participants.length > 0 && fresh.addressingMode) {
              _baileysGroupCache.set(jid, fresh);
            }
            _groupMetadataCache.set(jid, fresh);
            _saveStaleGroupMeta(jid, fresh);
          }
          return fresh;
        } catch (err) {
          const msg = String(err?.message || err || "");
          const code = err?.data || err?.output?.statusCode || err?.statusCode;
          if (code === 429 || /rate-overlimit|429/i.test(msg)) {
            _groupMetadataRateLimitedUntil = Date.now() + 60_000;
            const fallback = _groupMetadataStale.get(jid) || _findGroupMetadataOnDisk(jid);
            if (fallback) {
              // NUNCA colocar fallback de disco no _baileysGroupCache! Apenas no cache de leitura do app
              _groupMetadataCache.set(jid, fallback, 60);
              return fallback;
            }
          }
          throw err;
        } finally {
          _groupMetadataInFlight.delete(jid);
        }
      })();

      _groupMetadataInFlight.set(jid, fetchPromise);
      return fetchPromise;
    };

    // ═══ GUARDAR REFERÊNCIA DO SOCKET ATUAL ═══
    _currentSocket = conn;
    // NÃO atualizar global.conn aqui — só quando connection === "open"
    // Isso evita que schedulers usem um socket que ainda não conectou

    // Solicitar código de pareamento se necessário
    if (
      usePairingCode &&
      !fs.existsSync(`${qrcode}/creds.json`) &&
      !conn.authState.creds.registered
    ) {
      const phoneNumber = await question(
        `${colors.brightCyan}${symbols.arrow}${colors.reset} Digite o número do WhatsApp (com DDI, sem +):\n`
      );

      pairingPhoneNumber = coletarNumeros(phoneNumber);

      if (pairingPhoneNumber.length < 10) {
        showError("Número inválido! Tentando reconectar em 5s...");
        await new Promise(r => setTimeout(r, 5000));
        _isReconnecting = false; // Liberar flag antes de reconectar
        return createConnection(); // Reconectar em vez de process.exit
      }

      const loadingInterval = showLoading("Gerando código...");
      await delay(3000);

      try {
        const code = await conn.requestPairingCode(pairingPhoneNumber);
        stopLoading(loadingInterval, "Código gerado!");
        console.log(`\nCÓDIGO DE PAREAMENTO: ${code}\n`);
      } catch (error) {
        stopLoading(loadingInterval, "");
        showError("Erro ao gerar código! Tentando reconectar...");
        await new Promise(r => setTimeout(r, 5000));
        _isReconnecting = false; // Liberar flag antes de reconectar
        return createConnection(); // Reconectar em vez de process.exit
      }
    }

    // ── Registrar handlers de mensagens e grupos UMA ÚNICA VEZ neste socket (evita duplicação se 'open' disparar 2x) ──
    const startAle = require("./index.js");
    conn.ev.on("messages.upsert", async (upsert) => {
      try {
        if (upsert.messages) {
          for (const msg of upsert.messages) {
            if (msg.key?.id && msg.message) {
              _safeMessageStoreSet(msg.key.id, msg);
            }
          }
        }
        await startAle(upsert, conn, qrcode, sessionStartTime || Date.now());
      } catch (err) {
        console.error("[MSG] Erro ao processar mensagem:", err?.message || err);
      }
    });

    // ═══ ATUALIZAR CACHE DE METADADOS DE GRUPO (sem mutar cache do Baileys) ═══
    conn.ev.on("groups.update", async (updates) => {
      for (const update of updates) {
        if (!update?.id) continue;
        // Invalidar cache do Baileys para evitar divergência em addressingMode/ephemeralDuration
        _baileysGroupCache.del(update.id);
        const existing = _groupMetadataCache.get(update.id);
        if (existing && typeof existing === "object") {
          const merged = { ...existing, ...update };
          _groupMetadataCache.set(update.id, merged);
          _saveStaleGroupMeta(update.id, merged);
        }
      }
    });

    // ═══════ HANDLER DE CONEXÃO (NÃO RECURSIVO) ═══════
    conn.ev.on("connection.update", async (update) => {
      try {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !usePairingCode) {
          const qrcodeTerminal = require("qrcode-terminal");
          qrcodeTerminal.generate(qr, { small: true });
        }

        if (connection === "close") {
          // Limpar global.conn para que schedulers não tentem enviar em socket morto
          if (global.conn === conn) global.conn = null;
          _isReconnecting = false;

          const errObj = lastDisconnect?.error;
          const reason = new Boom(errObj)?.output?.statusCode;
          const errDetail = errObj?.message || "";
          const errTag = errObj?.data?.tag || (typeof errObj?.data === "string" ? errObj.data : "");
          const detailSuffix = [errDetail, errTag].filter(Boolean).join(" / ");

          // Em erro 500 (badSession / Stream Errored), limpar cache puro do Baileys antes de reconectar
          if (reason === 500 || reason === DisconnectReason.badSession) {
            _baileysGroupCache.flushAll();
          }

          // ── SESSÃO ENCERRADA (LoggedOut), BAN/PROIBIDO (403), CONFLITO (440) ou CREDENCIAIS (401/405) ──
          if (reason === DisconnectReason.loggedOut) {
            await _handleSessionError(`WhatsApp reportou LoggedOut (${detailSuffix || "401"}).`);
            return;
          }

          if (reason === DisconnectReason.connectionReplaced || reason === 440) {
            await _handleSessionError("Sessão substituída (440) — outro processo conectou com o mesmo número.");
            return;
          }

          if (reason === 401 || reason === 403 || reason === 405) {
            await _handleSessionError(`Código ${reason} (${detailSuffix || "erro de sessão/credenciais"}).`);
            return;
          }

          // ── RESTART REQUIRED (515) ──
          if (reason === DisconnectReason.restartRequired || reason === 515) {
            console.log(`\x1b[33m[RECONEXÃO]\x1b[0m WhatsApp pediu restart (515). Reconectando em 3s...`);
            _reconnectAttempts = 0;
            await new Promise(r => setTimeout(r, 3000));
            createConnection();
            return;
          }

          // ── PROBLEMA DE INTERNET / STREAM ERROR (500/428/408) ──
          _reconnectAttempts++;

          if (_reconnectAttempts >= _MAX_RETRIES_BEFORE_RESET) {
            console.log(`\x1b[31m[CONEXÃO]\x1b[0m ${_MAX_RETRIES_BEFORE_RESET} tentativas falharam.`);
            _reconnectAttempts = 0;
            console.log(`\x1b[33m[RECONEXÃO]\x1b[0m Resetando contador. Próxima tentativa em 5 minutos...`);
            await new Promise(r => setTimeout(r, 300_000));
            createConnection();
            return;
          }

          // Backoff exponencial: 5s → max 120s
          const _delayMs = Math.min(5000 * Math.pow(1.4, _reconnectAttempts - 1), 120_000);
          const _delaySec = Math.round(_delayMs / 1000);

          console.log(
            `\x1b[33m[RECONEXÃO]\x1b[0m Tentativa ${_reconnectAttempts}/${_MAX_RETRIES_BEFORE_RESET}` +
            ` | Motivo: ${reason || "desconhecido"}${detailSuffix ? ` (${detailSuffix})` : ""}` +
            ` | Próxima em ${_delaySec}s...`
          );

          await new Promise(r => setTimeout(r, _delayMs));
          createConnection();

        } else if (connection === "open") {
          _reconnectAttempts = 0;
          _sessionErrorAttempts = 0;
          _isReconnecting = false;
          sessionStartTime = Date.now();
          global.conn = conn;
          _backupCreds();

          // ── Inicializar schedulers UMA VEZ (global, usam global.conn) ──
          const _schedInfo = initializeSchedulers();

          // ═══ PAINEL ONLINE CONSOLIDADO (MOBILE & PC) ═══
          // Broadcast automático desativado por segurança anti-ban ao conectar número novo (use !novidades manualmente)
          showOnlineDashboard({
            waVersion,
            keepAliveSec: 25,
            modulesActive: _schedInfo.modulesActive,
            modulesTotal: _schedInfo.modulesTotal,
            aluguelAtivo: _schedInfo.aluguelAtivo,
            broadcastStatus: "ok",
          });
        }
      } catch (e) {
        console.error("[CONEXÃO] Erro no handler de connection.update:", e?.message || e);
      }
    });

    conn.ev.on("creds.update", saveCreds);

    // Eventos de grupo - Sistema de Boas-Vindas + X9 Revelação de ADM
    conn.ev.on("group-participants.update", async (ale2) => {
      try {
        const groupId = ale2.id;
        const axios = require("axios");
        const FormData = require("form-data");

        // Verificar se é grupo
        if (!groupId.endsWith("@g.us")) return;

        // ─── LOGGING SEMPRE (independente de config) ───────────────────
        const acao = ale2.action; // 'add' | 'remove' | 'promote' | 'demote'
        _applyParticipantUpdateToCache(groupId, acao, ale2.participants);
        const autorJid = ale2.authorPn || ale2.author || null;
        const autorNum = autorJid ? String(autorJid).split("@")[0] : null;

        for (const p of (ale2.participants || [])) {
          const pId = typeof p === "string" ? p : (p.phoneNumber || p.id || "");
          const pNum = String(pId).split("@")[0];
          if (acao === "add") {
            console.log(`[ENTRADA] +${pNum} entrou em ${groupId}${autorNum ? ` (por ADM: ${autorNum})` : ""}`);
          } else if (acao === "remove") {
            console.log(`[SAIU] -${pNum} saiu de ${groupId}${autorNum ? ` (removido por: ${autorNum})` : ""}`);
          }
        }

        // ─── SISTEMA X9: REVELAR ADM QUE ADICIONOU/APROVOU ─────────────
        const dirGroup = `./dados/grupos/${groupId}.json`;
        const botNumX9 = conn.user?.id?.split(":")[0] || "";
        const botLidX9 = conn.user?.lid?.split(":")[0] || "";
        const autorEhOBot = autorNum && (autorNum === botNumX9 || autorNum === botLidX9);

        if (fs.existsSync(dirGroup)) {
          let jsonGp;
          try { jsonGp = JSON.parse(fs.readFileSync(dirGroup)); } catch (e) { jsonGp = null; }

          if (jsonGp && jsonGp[0]?.x9 && autorNum && !autorEhOBot) {
            if (acao === "add") {
              for (const p of (ale2.participants || [])) {
                const pId = typeof p === "string" ? p : (p.phoneNumber || p.id || "");
                const pNum = String(pId).split("@")[0];
                const pJid = pNum.includes("@") ? pId : `${pNum}@s.whatsapp.net`;
                const autorJidFull = autorJid.includes("@") ? autorJid : `${autorNum}@s.whatsapp.net`;

                if (autorNum === pNum) continue;

                try {
                  await conn.sendMessage(groupId, {
                    text: `✅ A entrada de @${pNum} foi *aprovada/adicionada* pelo ADM @${autorNum}. Bem-vindo(a)! 🎉`,
                    mentions: [pJid, autorJidFull].filter(Boolean),
                  });
                } catch (e) {
                  console.error("[X9] Erro ao enviar:", e.message);
                }
              }
            }
          }
        }

        // ─── SISTEMA DE BOAS-VINDAS ─────────────────────────────────────
        if (!fs.existsSync(dirGroup)) return;

        let jsonGpBV;
        try {
          jsonGpBV = JSON.parse(fs.readFileSync(dirGroup));
        } catch (e) {
          console.error("[BEMVINDO] Erro ao ler JSON do grupo:", e);
          return;
        }

        // Só processar boas-vindas/saída/antifake/listanegra em eventos add/remove
        if (ale2.action !== "add" && ale2.action !== "remove") return;

        const isWelkom = jsonGpBV[0]?.wellcome?.[0]?.bemvindo1 || false;
        const isWelkom2 = jsonGpBV[0]?.wellcome?.[1]?.bemvindo2 || false;
        const isSaiu1 = jsonGpBV[0]?.wellcome?.[0]?.saiu1 || false;
        const isSaiu2 = jsonGpBV[0]?.wellcome?.[1]?.saiu2 || false;

        const _hasListaNegra = Array.isArray(jsonGpBV[0]?.listanegra) && jsonGpBV[0].listanegra.length > 0;
        let _hasListaNegraG = false;
        try {
          const _nesCheck = JSON.parse(fs.readFileSync("./dono/nescessario.json"));
          _hasListaNegraG = Array.isArray(_nesCheck?.listanegraG) && _nesCheck.listanegraG.length > 0;
        } catch { }

        const _precisaNoAdd =
          ale2.action === "add" &&
          (isWelkom || isWelkom2 || jsonGpBV[0]?.antifake || _hasListaNegra || _hasListaNegraG);
        const _precisaNoRemove =
          ale2.action === "remove" && (isSaiu1 || isSaiu2);

        if (!_precisaNoAdd && !_precisaNoRemove) return;

        let Links_P = {};
        try {
          Links_P = JSON.parse(fs.readFileSync("./dados/links.json"));
        } catch (e) { }

        const setting = JSON.parse(fs.readFileSync("./dados/settings.json"));

        // Usar cache primeiro para evitar 429 rate-overlimit no WhatsApp!
        let GroupMetadata_ = _groupMetadataCache.get(groupId) || null;
        if (!GroupMetadata_) {
          try {
            GroupMetadata_ = await conn.groupMetadata(groupId);
            if (GroupMetadata_) _groupMetadataCache.set(groupId, GroupMetadata_);
          } catch (e) {
            // Fallback para cache em disco (dados/global/groups.json) se bater 429 rate-overlimit
            try {
              if (fs.existsSync("./dados/global/groups.json")) {
                const _diskGroups = JSON.parse(fs.readFileSync("./dados/global/groups.json", "utf8"));
                if (Array.isArray(_diskGroups)) {
                  GroupMetadata_ = _diskGroups.find((g) => g && g.id === groupId) || null;
                }
              }
            } catch { }
            if (!GroupMetadata_) {
              console.warn(`[BEMVINDO] Metadados indisponíveis (${e?.message || e}); usando fallback mínimo.`);
              GroupMetadata_ = { id: groupId, subject: "", desc: "", participants: [] };
            }
          }
        }

        const jsonGp = jsonGpBV;

        const time = new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const processLegend = (legenda, participantNumber) => {
          return String(legenda || "")
            .replace(/#hora#/gi, time)
            .replace(/#nomedogp#/gi, GroupMetadata_.subject || "")
            .replace(/@?#numerodele#/gi, "@" + participantNumber)
            .replace(/#numerobot#/gi, conn.user.id.split(":")[0])
            .replace(
              /#prefix#/gi,
              jsonGp[0].multiprefix ? jsonGp[0].prefixos[0] : setting.prefix
            )
            .replace(/#descri[cç][aã]o#/gi, GroupMetadata_.desc || "");
        };

        /**
         * Resolve o participante de group-participants.update (string ou objeto, LID ou PN)
         * garantindo correspondência EXATA entre `@${display}` na legenda e `mentionJid` em `mentions`.
         */
        const resolveWelcomeParticipant = async (rawParticipant) => {
          const isObj = rawParticipant && typeof rawParticipant === "object";
          const rawId = isObj
            ? String(rawParticipant.id || rawParticipant.jid || rawParticipant.lid || "").trim()
            : String(rawParticipant || "").trim();
          const rawPn = isObj && rawParticipant.phoneNumber
            ? String(rawParticipant.phoneNumber).trim()
            : "";
          const rawLid = isObj && rawParticipant.lid
            ? String(rawParticipant.lid).trim()
            : (rawId.endsWith("@lid") ? rawId : "");

          const lookupNums = new Set(
            [rawId, rawPn, rawLid]
              .map((v) => extractNumber(v).replace(/\D/g, ""))
              .filter(Boolean)
          );

          let metaMember = null;
          if (Array.isArray(GroupMetadata_?.participants)) {
            metaMember = GroupMetadata_.participants.find((gm) =>
              [gm.id, gm.lid, gm.phoneNumber]
                .filter(Boolean)
                .some((v) => lookupNums.has(extractNumber(v).replace(/\D/g, "")))
            );
          }

          let mappedPn = null;
          const lidForLookup =
            (metaMember?.id && String(metaMember.id).endsWith("@lid") ? metaMember.id : null) ||
            metaMember?.lid ||
            rawLid ||
            (extractNumber(rawId).replace(/\D/g, "").length >= 14
              ? `${extractNumber(rawId).replace(/\D/g, "")}@lid`
              : null);

          if (!rawPn && !metaMember?.phoneNumber && lidForLookup && conn?.signalRepository?.lidMapping?.getPNForLID) {
            try {
              mappedPn = await conn.signalRepository.lidMapping.getPNForLID(lidForLookup);
            } catch { }
          }

          const pnCandidates = [
            rawPn,
            metaMember?.phoneNumber,
            mappedPn,
            metaMember?.id && String(metaMember.id).endsWith("@s.whatsapp.net") ? metaMember.id : null,
            rawId.endsWith("@s.whatsapp.net") ? rawId : null,
          ].filter(Boolean);

          for (const cand of pnCandidates) {
            const s = String(cand).trim();
            if (s.endsWith("@lid")) continue;
            const digits = extractNumber(s).replace(/\D/g, "");
            if (digits && digits.length >= 8 && digits.length <= 15) {
              const pnJid = `${digits}@s.whatsapp.net`;
              return {
                display: digits,
                mentionJid: pnJid,
                actionJid: metaMember?.id || rawId || pnJid,
                phoneJid: pnJid,
                lidJid: lidForLookup || null,
              };
            }
          }

          // Fallback LID válido (@lid no mentions + @<lid> no texto -> menção funciona!)
          const fallbackLid = lidForLookup || rawId;
          const lidDigits = extractNumber(fallbackLid).replace(/\D/g, "") || extractNumber(rawId);
          const isLid =
            Boolean(lidForLookup) ||
            String(fallbackLid).endsWith("@lid") ||
            lidDigits.length >= 14;
          const finalMentionJid = isLid
            ? `${lidDigits}@lid`
            : `${lidDigits}@s.whatsapp.net`;

          return {
            display: lidDigits,
            mentionJid: finalMentionJid,
            actionJid: metaMember?.id || rawId || finalMentionJid,
            phoneJid: isLid ? null : finalMentionJid,
            lidJid: isLid ? finalMentionJid : null,
          };
        };

        const sendWelcomeImage = async (titulo, tipo, resolvedParticipant) => {
          try {
            const resolved =
              resolvedParticipant ||
              (await resolveWelcomeParticipant(ale2.participants[0]));
            const participantNumber = resolved.display;
            const mentionJid = resolved.mentionJid;

            let ppimg = null;
            try {
              ppimg = await conn.profilePictureUrl(mentionJid, "image");
            } catch {
              try {
                if (resolved.actionJid && resolved.actionJid !== mentionJid) {
                  ppimg = await conn.profilePictureUrl(resolved.actionJid, "image");
                }
              } catch { }
            }
            if (!ppimg) {
              ppimg = "https://i.imgur.com/2wMJqoA.png";
            }

            const legendaTexto = ale2.action === "add"
              ? jsonGp[0].wellcome[tipo].legendabv
              : jsonGp[0].wellcome[tipo].legendasaiu;

            const fundo = ale2.action === "add"
              ? (jsonGp[0].wellcome[tipo].fundo || Links_P.fundo1 || "")
              : (jsonGp[0].wellcome[tipo].fundo_saiu || Links_P.fundo2 || Links_P.fundo1 || "");

            const teks = processLegend(legendaTexto, participantNumber);
            const mentions = [mentionJid];

            if (typeof ppimg === "string" && ppimg.startsWith("https")) {
              const API_KEY = "Bronxys30092025";
              const apiUrl = `https://api.bronxyshost.com.br/welcome?titulo=${encodeURIComponent(
                titulo
              )}&nome=${participantNumber}&perfil=${encodeURIComponent(ppimg)}&fundo=${encodeURIComponent(fundo)}&grupo=${encodeURIComponent(GroupMetadata_.subject)}&apikey=${API_KEY}`;

              try {
                const imgResponse = await axios.get(apiUrl, {
                  responseType: "arraybuffer",
                  timeout: 20000,
                });

                return conn.sendMessage(groupId, {
                  image: Buffer.from(imgResponse.data),
                  mentions: mentions,
                  caption: teks,
                });
              } catch (apiError) {
                console.error("[BEMVINDO] Erro ao baixar imagem da API:", apiError.message);
                return conn.sendMessage(groupId, {
                  text: teks,
                  mentions: mentions,
                });
              }
            }

            const formData = new FormData();
            formData.append("perfil", ppimg);
            formData.append("titulo", titulo);
            formData.append("nome", participantNumber);
            formData.append("fundo", fundo);
            formData.append("grupo", GroupMetadata_.subject);

            const response = await axios.post(
              "https://api.bronxyshost.com.br/welcome_?apikey=Bronxys30092025",
              formData,
              {
                headers: {
                  ...formData.getHeaders(),
                  "Content-Type": "multipart/form-data",
                },
                responseType: "arraybuffer",
                timeout: 15e3,
              }
            );

            conn.sendMessage(groupId, {
              image: response.data,
              mentions: mentions,
              caption: teks,
            });
          } catch (error) {
            console.error(`Erro ao enviar ${titulo}:`, error);
          }
        };

        // ==================== EVENTO ADD (ENTRADA) ====================
        if (ale2.action === "add") {
          for (const participant of (ale2.participants || [])) {
            const resolved = await resolveWelcomeParticipant(participant);
            const participantId = resolved.actionJid || getParticipantJid(participant);
            const participantMentionJid = resolved.mentionJid;
            const participantNumber = resolved.display;
            console.log(`[BEMVINDO] Novo membro: ${participantNumber} em ${GroupMetadata_.subject}`);

            // ═══════ VERIFICAÇÃO DE LISTA NEGRA GLOBAL ═══════
            let _bloqueadoListaNegra = false;
            try {
              const _nescessario = JSON.parse(fs.readFileSync("./dono/nescessario.json"));
              const _listanegraG = _nescessario?.listanegraG;
              if (Array.isArray(_listanegraG) && _listanegraG.length > 0) {
                if (isJidInList(participantMentionJid, _listanegraG) || isJidInList(participantId, _listanegraG)) {
                  console.log(`[LISTA-NEGRA-GLOBAL] Usuário ${participantNumber} está na lista negra GLOBAL! Removendo de ${GroupMetadata_.subject}...`);

                  try {
                    await conn.groupParticipantsUpdate(groupId, [participantId], "remove");
                  } catch (e) {
                    console.error("[LISTA-NEGRA-GLOBAL] Falha ao remover:", e.message);
                  }

                  try {
                    const _lngAdmins = (GroupMetadata_?.participants || [])
                      .filter((p) => p.admin)
                      .map((p) => p.phoneNumber || p.id);
                    const _lngMentions = [participantMentionJid, ..._lngAdmins];
                    const _lngAdmTags = _lngAdmins.map((a) => `@${String(a).split("@")[0]}`).join(" ");

                    await conn.sendMessage(groupId, {
                      text: `🚫 *LISTA NEGRA GLOBAL* — Membro banido!\n\n👤 O usuário @${participantNumber} está na *lista negra global* do bot e foi removido automaticamente.\n\n📢 *ADMs notificados:* ${_lngAdmTags}`,
                      mentions: _lngMentions,
                    });
                  } catch (e) {
                    console.error("[LISTA-NEGRA-GLOBAL] Erro ao enviar aviso:", e.message);
                  }

                  _bloqueadoListaNegra = true;
                }
              }
            } catch { }
            if (_bloqueadoListaNegra) continue;
            // ═══════ FIM LISTA NEGRA GLOBAL ═══════

            // ═══════ VERIFICAÇÃO DE LISTA NEGRA DO GRUPO ═══════
            if (Array.isArray(jsonGp[0]?.listanegra) && jsonGp[0].listanegra.length > 0) {
              if (isJidInList(participantMentionJid, jsonGp[0].listanegra) || isJidInList(participantId, jsonGp[0].listanegra)) {
                console.log(`[LISTA-NEGRA] Usuário ${participantNumber} está na lista negra do grupo ${GroupMetadata_.subject}! Removendo...`);

                // 1. REMOVER o participante do grupo
                try {
                  await conn.groupParticipantsUpdate(groupId, [participantId], "remove");
                } catch (e) {
                  console.error("[LISTA-NEGRA] Falha ao remover:", e.message);
                }

                // 2. AVISAR no grupo e MARCAR os ADMs
                try {
                  const _lnAdmins = (GroupMetadata_?.participants || [])
                    .filter((p) => p.admin)
                    .map((p) => p.phoneNumber || p.id);

                  const _lnMentions = [participantMentionJid, ..._lnAdmins];
                  const _lnAdmTags = _lnAdmins.map((a) => `@${String(a).split("@")[0]}`).join(" ");

                  // Usar legenda personalizada se existir
                  let _lnMsg = jsonGp[0]?.legenda_listanegra && jsonGp[0].legenda_listanegra !== "0"
                    ? jsonGp[0].legenda_listanegra.replace(/@?#numerodele#/gi, `@${participantNumber}`)
                    : `🚫 *LISTA NEGRA* — Membro banido!\n\n👤 O usuário @${participantNumber} estava na *lista negra* e foi removido automaticamente.`;

                  _lnMsg += `\n\n📢 *ADMs notificados:* ${_lnAdmTags}`;

                  await conn.sendMessage(groupId, {
                    text: _lnMsg,
                    mentions: _lnMentions,
                  });
                } catch (e) {
                  console.error("[LISTA-NEGRA] Erro ao enviar aviso:", e.message);
                }

                continue; // Não processar boas-vindas para quem foi banido
              }
            }
            // ═══════ FIM LISTA NEGRA ═══════

            const _phoneDigitsForFake = resolved.phoneJid ? extractNumber(resolved.phoneJid) : "";
            if (jsonGp[0].antifake && _phoneDigitsForFake && !_phoneDigitsForFake.startsWith("55")) {
              console.log(`[ANTI-FAKE] Removendo número estrangeiro: ${participantNumber} (${participantId})`);
              const msgFake = jsonGp[0].legenda_estrangeiro && jsonGp[0].legenda_estrangeiro !== "0"
                ? jsonGp[0].legenda_estrangeiro.replace(/@?#numerodele#/gi, `@${participantNumber}`)
                : "⚠️ Números de outros países não são permitidos neste grupo. ⚠️";

              try {
                await conn.sendMessage(groupId, { text: msgFake, mentions: [participantMentionJid] });
              } catch (e) { console.error("[ANTI-FAKE] Erro ao enviar msg:", e.message); }

              try {
                await conn.groupParticipantsUpdate(groupId, [participantId], "remove");
              } catch (e) {
                console.error("[ANTI-FAKE] Falha ao remover estrangeiro:", e);
              }
              continue;
            } else if (jsonGp[0].antifake && _phoneDigitsForFake && _phoneDigitsForFake.startsWith("55")) {
              console.log(`[ANTI-FAKE] Número brasileiro permitido: +${_phoneDigitsForFake}`);
            }

            if (isWelkom) {
              await sendWelcomeImage("BEM VINDO(A)", 0, resolved);
            } else if (isWelkom2) {
              const legendabv = jsonGp[0].wellcome[1].legendabv;
              const teks = processLegend(legendabv, participantNumber);
              await conn.sendMessage(groupId, { text: teks, mentions: [participantMentionJid] });
            }
          }
        }

        // ==================== EVENTO REMOVE (SAÍDA) ====================
        if (ale2.action === "remove") {
          for (const participant of (ale2.participants || [])) {
            const resolved = await resolveWelcomeParticipant(participant);
            const participantNumber = resolved.display;
            const participantMentionJid = resolved.mentionJid;
            console.log(`[SAIU] Membro saiu: ${participantNumber} de ${GroupMetadata_.subject}`);

            if (isSaiu1) {
              await sendWelcomeImage("ATÉ LOGO", 0, resolved);
            } else if (isSaiu2) {
              const legendasaiu = jsonGp[0].wellcome[1].legendasaiu;
              const teks = processLegend(legendasaiu, participantNumber);
              await conn.sendMessage(groupId, { text: teks, mentions: [participantMentionJid] });
            }
          }
        }
      } catch (e) {
        console.error("[BEMVINDO] Erro no evento de grupo:", e);
      }
    });

    return conn;

  } catch (err) {
    console.error("[CONEXÃO] Erro fatal ao criar conexão:", err?.message || err);
    _isReconnecting = false; // ═══ LIBERAR FLAG para permitir nova tentativa ═══
    // Tentar reconectar em 10s
    console.log("\x1b[33m[CONEXÃO]\x1b[0m Tentando reconectar em 10s...");
    await new Promise(r => setTimeout(r, 10000));
    createConnection();
  }
}

// ═══════════════════════════════════════════════════════════
// INICIAR O BOT
// ═══════════════════════════════════════════════════════════
createConnection().catch((err) => {
  console.error("[FATAL] Erro ao iniciar:", err);
  // NÃO faz process.exit — tenta reconectar
  setTimeout(() => createConnection().catch(console.error), 10000);
});
