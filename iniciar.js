const { execSync } = require("child_process");
const fs = require("fs");

// Lista de todas as dependências essenciais para o bot funcionar
const dependencies = [
  "@whiskeysockets/baileys@7.0.0-rc.9",
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

// Importar sistema de menu profissional
const {
  clearScreen,
  showBanner,
  showWelcomeScreen,
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
const CREDS_PATH = `${qrcode}/creds.json`;
const CREDS_BACKUP_PATH = `${qrcode}/creds.backup.json`;

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

const msgRetryCounterCache = new NodeCache();

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
function initializeSchedulers() {
  if (_schedulersInitialized) return;
  _schedulersInitialized = true;

  // ── Horários (abrir/fechar grupo novo sistema) ──
  try {
    const { initHorariosScheduler } = require("./dados/org/funcoes/horarios_grupo.js");
    initHorariosScheduler(); // Sem parâmetro — usa global.conn
  } catch (e) {
    console.error("[HORÁRIOS] Erro ao iniciar scheduler:", e.message);
  }

  // ── Avisos automáticos ──
  try {
    const { initAvisosScheduler } = require("./operacao/avisos-automaticos/index.js");
    initAvisosScheduler(); // Sem parâmetro — usa global.conn
  } catch (e) {
    console.error("[AVISOS] Erro ao iniciar scheduler:", e.message);
  }

  // ── Abrir/Fechar grupo (sistema antigo) ──
  try {
    const { initAbrirFecharScheduler } = require("./operacao/abrir-fechar-grupo/index.js");
    initAbrirFecharScheduler(); // Sem parâmetro — usa global.conn
  } catch (e) {
    console.error("[ABRIR/FECHAR] Erro ao iniciar scheduler:", e.message);
  }

  // ── Aniversário ──
  try {
    const { initBirthdayScheduler } = require("./dados/org/funcoes/aniversario.js");
    initBirthdayScheduler(); // Sem parâmetro — usa global.conn
  } catch (e) {
    console.error("[ANIVERSÁRIO] Erro ao iniciar scheduler:", e.message);
  }

  // ── Aluguel ──
  try {
    const { initAluguelScheduler } = require("./dados/org/funcoes/aluguel.js");
    const _settingAluguel = JSON.parse(fs.readFileSync("./dono/nescessario.json", "utf-8"));
    const _numerodonoAluguel = String(_settingAluguel?.numerodono || "")
      .replace(/\D/g, "");
    if (_numerodonoAluguel) {
      initAluguelScheduler(null, _numerodonoAluguel); // conn ignorado — usa global.conn
      console.log("🏘️ Sistema de aluguel automático iniciado!");
    }
  } catch (e) {
    console.error("[ALUGUEL] Erro ao iniciar scheduler:", e.message);
  }

  console.log("\x1b[32m[SCHEDULERS]\x1b[0m Todos os schedulers inicializados (usam global.conn dinâmico).");
}

// ═══════════════════════════════════════════════════════════
// TRATAR ERRO DE SESSÃO (NUNCA deleta sessão/QR code)
// ═══════════════════════════════════════════════════════════
async function _handleSessionError(motivo) {
  console.log(`\n\x1b[31m[SESSÃO]\x1b[0m ${motivo}`);
  // ══ NUNCA DELETAR A PASTA DE SESSÃO / QRCODE ══
  // Apenas logar o erro e tentar reconectar
  console.log(`\x1b[33m[SESSÃO]\x1b[0m A sessão NÃO será deletada. Tentando reconectar em 10s...`);
  console.log(`\x1b[33m[SESSÃO]\x1b[0m Se realmente deslogou, delete manualmente a pasta "${qrcode}" e reinicie.`);
  _isReconnecting = false; // Permitir nova reconexão
  await new Promise(r => setTimeout(r, 10000));
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

    // Exibir menu de seleção se não houver sessão ativa
    if (!fs.existsSync(`${qrcode}/creds.json`)) {
      await selectConnectionMethod();
    } else {
      // ═══ RECONEXÃO — Mostrar banner RGB + bem-vindo de volta ═══
      const { clearScreen: _cls, showBanner, startRGBBanner, stopRGBBanner } = require("./menu_conexao.js");
      const _sleep = (ms) => new Promise(r => setTimeout(r, ms));

      _cls();
      startRGBBanner();
      await _sleep(3000);
      stopRGBBanner();

      _cls();
      showBanner();

      const _g = '\x1b[38;5;240m';
      const _gld = '\x1b[38;5;214m';
      const _grn = '\x1b[38;5;78m';
      const _B = '\x1b[1m';
      const _R = '\x1b[0m';

      console.log(`  ${_gld}${_B}👋 BEM-VINDO DE VOLTA!${_R}`);
      console.log(`  ${_g}${"─".repeat(31)}${_R}`);
      console.log(`  ${_grn}Aleatory Bot 100% funcional.${_R}`);
      console.log(`  ${_grn}Conectando... Aproveite! 🚀${_R}`);
      console.log(`  ${_g}${"─".repeat(31)}${_R}`);
      console.log();
    }

    let pairingPhoneNumber = null;
    const { state, saveCreds } = await useMultiFileAuthState(qrcode);
    const { version } = await fetchLatestBaileysVersion();

    const conn = _makeWASocket({
      logger: _logger,
      version,
      browser: Browsers.ubuntu("Chrome"),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, _logger),
      },
      shouldIgnoreJid: (jid) =>
        isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
      msgRetryCounterCache,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      keepAliveIntervalMs: 30_000,
      emitOwnEvents: false,
      connectTimeoutMs: 60_000,
      retryRequestDelayMs: 2_000,
    });

    // ═══ GUARDAR REFERÊNCIA DO SOCKET ATUAL ═══
    _currentSocket = conn;
    // NÃO atualizar global.conn aqui — só quando connection === "open"
    // Isso evita que schedulers usem um socket que ainda não conectou

    console.log(`\x1b[36m[KEEPALIVE]\x1b[0m Ativo: ping a cada 30s para manter conexão.`);

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

    // ═══════ HANDLER DE CONEXÃO (NÃO RECURSIVO) ═══════
    conn.ev.on("connection.update", async (update) => {
      try {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !usePairingCode) {
          const qrcodeTerminal = require("qrcode-terminal");
          qrcodeTerminal.generate(qr, { small: true });
        }

        if (connection === "close") {
          // ═══ LIBERAR FLAG DE RECONEXÃO ═══
          _isReconnecting = false;

          const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

          // ── SESSÃO ENCERRADA (LoggedOut) ou CREDENCIAIS ──
          // NUNCA deletar sessão automaticamente — apenas tentar reconectar
          if (reason === DisconnectReason.loggedOut) {
            console.log(`\x1b[31m[CONEXÃO]\x1b[0m LoggedOut detectado.`);
            await _handleSessionError("WhatsApp reportou LoggedOut. Tentando reconectar...");
            return;
          }

          if (reason === 401 || reason === 405) {
            console.log(`\x1b[31m[CONEXÃO]\x1b[0m Código ${reason} — possível erro temporário de credenciais.`);
            await _handleSessionError(`Erro ${reason} reportado. Tentando reconectar sem deletar sessão...`);
            return;
          }

          // ── RESTART REQUIRED (515) ──
          if (reason === DisconnectReason.restartRequired || reason === 515) {
            console.log(`\x1b[33m[RECONEXÃO]\x1b[0m WhatsApp pediu restart. Reconectando em 3s...`);
            _reconnectAttempts = 0;
            await new Promise(r => setTimeout(r, 3000));
            createConnection(); // Cria NOVO socket, limpa o anterior
            return;
          }

          // ── PROBLEMA DE INTERNET / CONEXÃO TEMPORÁRIA ──
          _reconnectAttempts++;

          if (_reconnectAttempts >= _MAX_RETRIES_BEFORE_RESET) {
            console.log(`\x1b[31m[CONEXÃO]\x1b[0m ${_MAX_RETRIES_BEFORE_RESET} tentativas falharam.`);
            // NÃO deleta sessão — apenas reseta contador e tenta de novo após longa pausa
            _reconnectAttempts = 0;
            console.log(`\x1b[33m[RECONEXÃO]\x1b[0m Resetando contador. Próxima tentativa em 5 minutos...`);
            await new Promise(r => setTimeout(r, 300_000)); // 5 min
            createConnection();
            return;
          }

          // Backoff exponencial: 5s → max 120s
          const _delayMs = Math.min(5000 * Math.pow(1.4, _reconnectAttempts - 1), 120_000);
          const _delaySec = Math.round(_delayMs / 1000);

          console.log(
            `\x1b[33m[RECONEXÃO]\x1b[0m Tentativa ${_reconnectAttempts}/${_MAX_RETRIES_BEFORE_RESET}` +
            ` | Motivo: ${reason || "desconhecido"}` +
            ` | Próxima em ${_delaySec}s...`
          );

          await new Promise(r => setTimeout(r, _delayMs));
          createConnection(); // Cria NOVO socket, limpa o anterior

        } else if (connection === "open") {
          _reconnectAttempts = 0;
          _isReconnecting = false; // Reconexão completa
          sessionStartTime = Date.now();
          global.conn = conn; // ═══ ÚNICO LUGAR onde global.conn é definido ═══
          _backupCreds(); // Backup de segurança a cada conexão bem-sucedida
          showSuccess("CONECTADO COM SUCESSO!");
          console.log(`\x1b[36m[CONEXÃO]\x1b[0m Sessão estável. KeepAlive ativo (30s). Uptime iniciado.`);

          // ── Registrar handler de mensagens (NESTE socket) ──
          const startAle = require("./index.js");
          conn.ev.on("messages.upsert", async (upsert) => {
            try {
              await startAle(upsert, conn, qrcode, sessionStartTime);
            } catch (err) {
              console.error("[MSG] Erro ao processar mensagem:", err?.message || err);
            }
          });

          // ── Inicializar schedulers UMA VEZ (global, usam global.conn) ──
          initializeSchedulers();
        }
      } catch (e) {
        console.error("[CONEXÃO] Erro no handler de connection.update:", e?.message || e);
        // NUNCA crashar — logar e continuar
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
        const autorJid = ale2.author || ale2.authorPn || null;
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

        let Links_P = {};
        try {
          Links_P = JSON.parse(fs.readFileSync("./dados/links.json"));
        } catch (e) { }

        const setting = JSON.parse(fs.readFileSync("./dados/settings.json"));

        let GroupMetadata_;
        try {
          GroupMetadata_ = await conn.groupMetadata(groupId);
        } catch (e) {
          console.error("[BEMVINDO] Erro ao obter metadados:", e);
          return;
        }

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
        if (!isWelkom && !isWelkom2 && !isSaiu1 && !isSaiu2 && !jsonGpBV[0]?.antifake && !_hasListaNegra && !_hasListaNegraG) return;

        const jsonGp = jsonGpBV;

        const time = new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const processLegend = (legenda, participantNumber) => {
          return legenda
            .replace(/#hora#/g, time)
            .replace(/#nomedogp#/g, GroupMetadata_.subject)
            .replace(/#numerodele#/g, "@" + participantNumber)
            .replace(/#numerobot#/g, conn.user.id.split(":")[0])
            .replace(
              /#prefix#/g,
              jsonGp[0].multiprefix ? jsonGp[0].prefixos[0] : setting.prefix
            )
            .replace(/#descrição#/g, GroupMetadata_.desc || "");
        };

        const sendWelcomeImage = async (titulo, tipo) => {
          try {
            const participant = ale2.participants[0];
            const participantId = typeof participant === "string"
              ? participant
              : participant.id;
            const participantNumber = participantId.split("@")[0];

            let ppimg = null;
            try {
              ppimg = await conn.profilePictureUrl(participantId, "image");
            } catch (e) {
              ppimg = "https://i.imgur.com/2wMJqoA.png";
            }

            const legendaTexto = ale2.action === "add"
              ? jsonGp[0].wellcome[tipo].legendabv
              : jsonGp[0].wellcome[tipo].legendasaiu;

            const fundo = ale2.action === "add"
              ? (jsonGp[0].wellcome[tipo].fundo || Links_P.fundo1 || "")
              : (jsonGp[0].wellcome[tipo].fundo_saiu || Links_P.fundo2 || Links_P.fundo1 || "");

            const teks = processLegend(legendaTexto, participantNumber);
            const mentions = ale2.participants.map(p => typeof p === "string" ? p : p.id);

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
          const participant = ale2.participants[0];
          const participantId = getParticipantJid(participant);
          const participantNumber = getParticipantNumber(participant);
          console.log(`[BEMVINDO] Novo membro: ${participantNumber} em ${GroupMetadata_.subject}`);

          // ═══════ VERIFICAÇÃO DE LISTA NEGRA GLOBAL ═══════
          try {
            const _nescessario = JSON.parse(fs.readFileSync("./dono/nescessario.json"));
            const _listanegraG = _nescessario?.listanegraG;
            if (Array.isArray(_listanegraG) && _listanegraG.length > 0) {
              if (isJidInList(participantId, _listanegraG)) {
                console.log(`[LISTA-NEGRA-GLOBAL] Usuário ${participantNumber} está na lista negra GLOBAL! Removendo de ${GroupMetadata_.subject}...`);

                try {
                  await conn.groupParticipantsUpdate(groupId, [participantId], "remove");
                } catch (e) {
                  console.error("[LISTA-NEGRA-GLOBAL] Falha ao remover:", e.message);
                }

                try {
                  const _lngAdmins = (GroupMetadata_?.participants || [])
                    .filter((p) => p.admin)
                    .map((p) => p.id);
                  const _lngMentions = [participantId, ..._lngAdmins];
                  const _lngAdmTags = _lngAdmins.map((a) => `@${a.split("@")[0]}`).join(" ");

                  await conn.sendMessage(groupId, {
                    text: `🚫 *LISTA NEGRA GLOBAL* — Membro banido!\n\n👤 O usuário @${participantNumber} está na *lista negra global* do bot e foi removido automaticamente.\n\n📢 *ADMs notificados:* ${_lngAdmTags}`,
                    mentions: _lngMentions,
                  });
                } catch (e) {
                  console.error("[LISTA-NEGRA-GLOBAL] Erro ao enviar aviso:", e.message);
                }

                return;
              }
            }
          } catch { }
          // ═══════ FIM LISTA NEGRA GLOBAL ═══════

          // ═══════ VERIFICAÇÃO DE LISTA NEGRA DO GRUPO ═══════
          if (Array.isArray(jsonGp[0]?.listanegra) && jsonGp[0].listanegra.length > 0) {
            if (isJidInList(participantId, jsonGp[0].listanegra)) {
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
                  .map((p) => p.id);

                const _lnMentions = [participantId, ..._lnAdmins];
                const _lnAdmTags = _lnAdmins.map((a) => `@${a.split("@")[0]}`).join(" ");

                // Usar legenda personalizada se existir
                let _lnMsg = jsonGp[0]?.legenda_listanegra && jsonGp[0].legenda_listanegra !== "0"
                  ? jsonGp[0].legenda_listanegra.replace(/#numerodele#/g, `@${participantNumber}`)
                  : `🚫 *LISTA NEGRA* — Membro banido!\n\n👤 O usuário @${participantNumber} estava na *lista negra* e foi removido automaticamente.`;

                _lnMsg += `\n\n📢 *ADMs notificados:* ${_lnAdmTags}`;

                await conn.sendMessage(groupId, {
                  text: _lnMsg,
                  mentions: _lnMentions,
                });
              } catch (e) {
                console.error("[LISTA-NEGRA] Erro ao enviar aviso:", e.message);
              }

              return; // Não processar boas-vindas para quem foi banido
            }
          }
          // ═══════ FIM LISTA NEGRA ═══════

          if (jsonGp[0].antifake && participantNumber && !participantNumber.startsWith("55")) {
            console.log(`[ANTI-FAKE] Removendo número estrangeiro: ${participantNumber} (${participantId})`);
            const msgFake = jsonGp[0].legenda_estrangeiro && jsonGp[0].legenda_estrangeiro !== "0"
              ? jsonGp[0].legenda_estrangeiro
              : "⚠️ Números de outros países não são permitidos neste grupo. ⚠️";

            try {
              await conn.sendMessage(groupId, { text: msgFake, mentions: [participantId] });
            } catch (e) { console.error("[ANTI-FAKE] Erro ao enviar msg:", e.message); }

            try {
              await conn.groupParticipantsUpdate(groupId, [participantId], "remove");
            } catch (e) {
              console.error("[ANTI-FAKE] Falha ao remover estrangeiro:", e);
            }
            return;
          } else if (jsonGp[0].antifake && participantNumber && participantNumber.startsWith("55")) {
            console.log(`[ANTI-FAKE] Número brasileiro permitido: +${participantNumber}`);
          }

          if (isWelkom) {
            await sendWelcomeImage("BEM VINDO(A)", 0);
          } else if (isWelkom2) {
            const legendabv = jsonGp[0].wellcome[1].legendabv;
            const teks = processLegend(legendabv, participantNumber);
            const mentions = ale2.participants.map(p => typeof p === "string" ? p : p.id);
            await conn.sendMessage(groupId, { text: teks, mentions: mentions });
          }
        }

        // ==================== EVENTO REMOVE (SAÍDA) ====================
        if (ale2.action === "remove") {
          const participant = ale2.participants[0];
          const participantNumber = (typeof participant === "string" ? participant : participant.id).split("@")[0];
          console.log(`[SAIU] Membro saiu: ${participantNumber} de ${GroupMetadata_.subject}`);

          if (isSaiu1) {
            await sendWelcomeImage("ATÉ LOGO", 0);
          } else if (isSaiu2) {
            const legendasaiu = jsonGp[0].wellcome[1].legendasaiu;
            const teks = processLegend(legendasaiu, participantNumber);
            const mentions = ale2.participants.map(p => typeof p === "string" ? p : p.id);
            await conn.sendMessage(groupId, { text: teks, mentions: mentions });
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
