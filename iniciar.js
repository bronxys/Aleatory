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
    require("@whiskeysockets/baileys");
    require("colors");
    require("axios");
    require("fs-extra");
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
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  PHONENUMBER_MCC,
  isJidStatusBroadcast,
  isJidNewsletter,
  isJidBroadcast,
  delay,
  Browsers,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const readline = require("readline");
const MAIN_LOGGER = require("@whiskeysockets/baileys/lib/Utils/logger").default;
const { Boom } = require("@hapi/boom");
const NodeCache = require("node-cache");

// Importar sistema de menu profissional
const {
  clearScreen,
  showWelcomeScreen,
  showPairingInstructions,
  showQRInstructions,
  showLoading,
  stopLoading,
  showSuccess,
  showError,
  showWarning,
  colors,
  symbols,
} = require("./menu_conexao.js");

let sessionStartTime;

const logger = MAIN_LOGGER.child({});
logger.level = "silent";

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
      `${colors.brightCyan}${symbols.arrow}${colors.reset} Digite sua escolha (1, 2 ou 3): `
    );

    if (choice === "1") {
      connectionMethod = "pairing";
      usePairingCode = true;
      clearScreen();
      showPairingInstructions();
      showSuccess("Método selecionado: Código de Pareamento");
      return;
    } else if (choice === "2") {
      connectionMethod = "qr";
      usePairingCode = false;
      clearScreen();
      showQRInstructions();
      showSuccess("Método selecionado: QR Code");
      return;
    } else if (choice === "3") {
      console.log(
        `\n${colors.brightYellow}👋 Até logo! Encerrando...${colors.reset}\n`
      );
      process.exit(0);
    } else {
      showError("Opção inválida! Digite 1, 2 ou 3.");
    }
  }
}

async function INC() {
  // Verificação de IP/VPS autorizado
  try {
    var [ip, vps] = await Promise.all([
      axios.get("https://api.ipify.org?format=json"),
      axios
        .get("https://raw.githubusercontent.com/bronxys/bronxys/main/list.json")
        .catch(() => ({ data: [] })),
    ]);

    if (vps.data.length > 0 && !vps.data.includes(ip.data.ip)) {
      showError(`IP ${ip.data.ip} não autorizado.`);
      // return process.exit(1);
    }
  } catch (e) { }

  // Exibir menu de seleção se não houver sessão ativa
  if (!fs.existsSync(`${qrcode}/creds.json`)) {
    await selectConnectionMethod();
  }

  let pairingPhoneNumber = null;
  const { state, saveCreds } = await useMultiFileAuthState(qrcode);

  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger,
    version,
    browser: Browsers.ubuntu("Chrome"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    msgRetryCounterCache,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
  });

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
      showError("Número inválido!");
      process.exit(1);
    }

    const loadingInterval = showLoading("Gerando código...");

    await delay(3000);

    try {
      const code = await conn.requestPairingCode(pairingPhoneNumber);
      stopLoading(loadingInterval, "Código gerado!");
      console.log(`\nCÓDIGO DE PAREAMENTO: ${code}\n`);
    } catch (error) {
      stopLoading(loadingInterval, "");
      showError("Erro ao gerar código!");
      process.exit(1);
    }
  }

  // Handler de atualização de conexão
  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairingCode) {
      const qrcodeTerminal = require("qrcode-terminal");
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        showError(
          "Sessão encerrada! Delete a pasta de sessão e tente novamente."
        );
        process.exit(1);
      } else {
        showWarning("Conexão perdida! Reconectando...");
        INC();
      }
    } else if (connection === "open") {
      sessionStartTime = Date.now();
      showSuccess("CONECTADO COM SUCESSO!");

      const startAle = require("./index.js");
      conn.ev.on("messages.upsert", async (upsert) => {
        await startAle(upsert, conn, qrcode, sessionStartTime);
      });
    }
  });

  conn.ev.on("creds.update", saveCreds);

  // Eventos de grupo - Sistema de Boas-Vindas Bronxys API
  conn.ev.on("group-participants.update", async (ale2) => {
    try {
      const groupId = ale2.id;
      const axios = require("axios");
      const FormData = require("form-data");

      // Verificar se é grupo
      if (!groupId.endsWith("@g.us")) return;

      // Carregar configurações do grupo
      const dirGroup = `./dados/grupos/${groupId}.json`;
      if (!fs.existsSync(dirGroup)) return;

      let jsonGp;
      try {
        jsonGp = JSON.parse(fs.readFileSync(dirGroup));
      } catch (e) {
        console.error("[BEMVINDO] Erro ao ler JSON do grupo:", e);
        return;
      }

      // Carregar links globais (fundos)
      let Links_P = {};
      try {
        Links_P = JSON.parse(fs.readFileSync("./dados/links.json"));
      } catch (e) { }

      // Carregar settings
      const setting = JSON.parse(fs.readFileSync("./dados/settings.json"));

      // Obter metadados do grupo
      let GroupMetadata_;
      try {
        GroupMetadata_ = await conn.groupMetadata(groupId);
      } catch (e) {
        console.error("[BEMVINDO] Erro ao obter metadados:", e);
        return;
      }

      // Verificar configurações de boas-vindas e saída
      const isWelkom = jsonGp[0]?.wellcome?.[0]?.bemvindo1 || false;
      const isWelkom2 = jsonGp[0]?.wellcome?.[1]?.bemvindo2 || false;
      const isSaiu1 = jsonGp[0]?.wellcome?.[0]?.saiu1 || false;
      const isSaiu2 = jsonGp[0]?.wellcome?.[1]?.saiu2 || false;

      if (!isWelkom && !isWelkom2 && !isSaiu1 && !isSaiu2) return;

      // Obter hora atual
      const time = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Função para substituir variáveis na legenda
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

      // Função para enviar imagem de boas-vindas/saída via API Bronxys (padrão do amigo)
      const sendWelcomeImage = async (titulo, tipo) => {
        try {
          // Pegar o primeiro participante
          const participant = ale2.participants[0];
          const participantId = typeof participant === "string"
            ? participant
            : participant.id;
          const participantNumber = participantId.split("@")[0];

          // Obter foto de perfil
          let ppimg = null;
          try {
            ppimg = await conn.profilePictureUrl(participantId, "image");
          } catch (e) {
            ppimg = "https://i.imgur.com/2wMJqoA.png";
          }

          // Obter legenda e fundo do tipo correto
          const legendaTexto = ale2.action === "add"
            ? jsonGp[0].wellcome[tipo].legendabv
            : jsonGp[0].wellcome[tipo].legendasaiu;

          const fundo = ale2.action === "add"
            ? (jsonGp[0].wellcome[tipo].fundo || Links_P.fundo1 || "")
            : (jsonGp[0].wellcome[tipo].fundo_saiu || Links_P.fundo2 || Links_P.fundo1 || "");

          const teks = processLegend(legendaTexto, participantNumber);

          // Mapeamento de mentions igual ao amigo
          const mentions = ale2.participants.map(p => typeof p === "string" ? p : p.id);

          if (typeof ppimg === "string" && ppimg.startsWith("https")) {
            // API Key Bronxys
            const API_KEY = "Bronxys30092025";
            const apiUrl = `https://api.bronxyshost.com.br/welcome?titulo=${encodeURIComponent(
              titulo
            )}&nome=${participantNumber}&perfil=${encodeURIComponent(ppimg)}&fundo=${encodeURIComponent(fundo)}&grupo=${encodeURIComponent(GroupMetadata_.subject)}&apikey=${API_KEY}`;

            console.log(`[API BRONXYS] URL: ${apiUrl}`);

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
              // Se falhar o download do buffer, tenta o envio direto como último recurso (pode dar erro de stream)
              // ou envia apenas texto se preferir. Aqui vou restaurar o fallback de texto para segurança.
              return conn.sendMessage(groupId, {
                text: teks,
                mentions: mentions,
              });
            }
          }

          // Fallback: upload da imagem via POST
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
        const participantId = typeof participant === "string" ? participant : participant.id;
        const participantNumber = participantId.split("@")[0];
        console.log(`[BEMVINDO] Novo membro: ${participantNumber} em ${GroupMetadata_.subject}`);

        // ==================== ANTI-FAKE (NÚMEROS ESTRANGEIROS) ====================
        if (jsonGp[0].antifake && !participantId.startsWith("55")) {
          console.log(`[ANTI-FAKE] Removendo número estrangeiro: ${participantId}`);

          // Enviar mensagem de aviso (se houver legenda configurada ou padrão)
          const msgFake = jsonGp[0].legenda_estrangeiro && jsonGp[0].legenda_estrangeiro !== "0"
            ? jsonGp[0].legenda_estrangeiro
            : "⚠️ Números de outros países não são permitidos neste grupo. ⚠️";

          await conn.sendMessage(groupId, {
            text: msgFake,
            mentions: [participantId]
          });

          // Remover o participante
          try {
            await conn.groupParticipantsUpdate(groupId, [participantId], "remove");
          } catch (e) {
            console.error("[ANTI-FAKE] Falha ao remover estrangeiro (bot pode não ser admin):", e);
          }
          return; // Não envia mensagem de boas-vindas para fakes
        }

        if (isWelkom) {
          // bemvindo1: COM imagem da API Bronxys
          await sendWelcomeImage("BEM VINDO(A)", 0);
        } else if (isWelkom2) {
          // bemvindo2: SEM foto (apenas texto)
          const legendabv = jsonGp[0].wellcome[1].legendabv;
          const teks = processLegend(legendabv, participantNumber);
          const mentions = ale2.participants.map(p => typeof p === "string" ? p : p.id);

          await conn.sendMessage(groupId, {
            text: teks,
            mentions: mentions,
          });
        }
      }

      // ==================== EVENTO REMOVE (SAÍDA) ====================
      if (ale2.action === "remove") {
        const participant = ale2.participants[0];
        const participantNumber = (typeof participant === "string" ? participant : participant.id).split("@")[0];
        console.log(`[SAIU] Membro saiu: ${participantNumber} de ${GroupMetadata_.subject}`);

        if (isSaiu1) {
          // saiu1: COM imagem da API Bronxys
          await sendWelcomeImage("ATÉ LOGO", 0);
        } else if (isSaiu2) {
          // saiu2: SEM foto (apenas texto)
          const legendasaiu = jsonGp[0].wellcome[1].legendasaiu;
          const teks = processLegend(legendasaiu, participantNumber);
          const mentions = ale2.participants.map(p => typeof p === "string" ? p : p.id);

          await conn.sendMessage(groupId, {
            text: teks,
            mentions: mentions,
          });
        }
      }
    } catch (e) {
      console.error("[BEMVINDO] Erro no evento de grupo:", e);
    }
  });

  return conn;
}

INC().catch((err) => {
  console.error(err);
  process.exit(1);
});
