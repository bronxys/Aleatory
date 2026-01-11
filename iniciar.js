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
} = require("baileys");
const readline = require("readline");
const MAIN_LOGGER = require("baileys/lib/Utils/logger").default;
const { TEXTOS_GERAL } = require("./dono/textos.js");

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
  symbols
} = require('./menu_conexao.js');

let sessionStartTime;

const logger = MAIN_LOGGER.child({});
logger.level = "silent";

const {
  fs,
  fetch,
  Boom,
  axios,
  util,
  P,
  linkfy,
  request,
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
  NodeCache,
} = require("./consts-func.js");

var qrcode = "./dados/ALEATORY-QR";

try {
  JSON.parse(fs.readFileSync("./dados/global/groups.json"));
} catch {
  fs.writeFileSync("./dados/global/groups.json", JSON.stringify([], null, 2));
}

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
    "Removing old closed session: SessionEntry {",
    "Another forbidden string",
    "Closing stale open session for new outgoing prekey bundle",
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

// Funções padrão de mensagens de boas-vindas
const welcome = (numero, nomeGrupo) => {
  return `🫵🏻 {𝗕𝗘𝗠-𝗩𝗜𝗡𝗗𝗢} @${numero}\n\n🎗️ Seja bem-vindo(a) ao grupo *${nomeGrupo}*!\n\n📋 Leia as regras e participe! Inativos serão removidos 🥱`;
};

const bye = (numero) => {
  return `👋 Tchau @${numero}! Até a próxima! 🚪`;
};

const welcome2 = (numero, nomeGrupo) => {
  return `🫵🏻 {𝗕𝗘𝗠-𝗩𝗜𝗡𝗗𝗢} @${numero}\n\n🎗️ Seja bem-vindo(a) ao grupo *${nomeGrupo}*!\n\n📋 Leia as regras e participe! Inativos serão removidos 🥱`;
};

const bye2 = (numero) => {
  return `👋 Tchau @${numero}! Até a próxima! 🚪`;
};

// Função auxiliar para extrair o JID correto do participante (compatível com Baileys 7.0+)
const getParticipantJid = (participant) => {
  if (!participant) return '';
  
  // Se já é uma string, retornar diretamente
  if (typeof participant === 'string') {
    return participant;
  }
  
  // Se é um objeto, priorizar id e phoneNumber
  if (typeof participant === 'object' && participant !== null) {
    // 1. Prioridade: id (JID completo)
    if (participant.id && participant.id.includes('@')) {
      return participant.id;
    }
    
    // 2. Segunda opção: phoneNumber (geralmente é o JID completo)
    if (participant.phoneNumber && participant.phoneNumber.includes('@')) {
      return participant.phoneNumber;
    }
    
    // 3. Terceira opção: id sem @ (adicionar @s.whatsapp.net)
    if (participant.id) {
      return participant.id.includes('@') ? participant.id : `${participant.id}@s.whatsapp.net`;
    }
    
    // 4. Quarta opção: phoneNumber sem @ (adicionar @s.whatsapp.net)
    if (participant.phoneNumber) {
      return participant.phoneNumber.includes('@') 
        ? participant.phoneNumber 
        : `${participant.phoneNumber}@s.whatsapp.net`;
    }
    
    // 5. ÚLTIMO RECURSO: lid (precisa ser processado)
    if (participant.lid) {
      // LID vem no formato: "241 44324925037 4" (com espaços)
      const lidClean = String(participant.lid).replace(/\s+/g, '');
      return `${lidClean}@lid`;
    }
  }
  
  return String(participant);
};

const getParticipantNumber = (participant) => {
  const jid = getParticipantJid(participant);
  
  if (!jid) return '';
  
  // Extrair número antes do @
  const number = String(jid).split('@')[0];
  
  // Remover espaços se houver (caso do LID)
  return number.replace(/\s+/g, '');
};

const extractNumber = (jid) => {
  if (!jid) return '';
  return String(jid).split('@')[0];
};

const isJidInList = (jid, list) => {
  if (!jid || !Array.isArray(list)) return false;
  const number = extractNumber(jid);
  return list.some(item => extractNumber(item) === number);
};

/**
 * Menu principal de seleção de método de conexão
 */
async function selectConnectionMethod() {
  await showWelcomeScreen();
  
  while (true) {
    const choice = await question(`${colors.brightCyan}${symbols.arrow}${colors.reset} Digite sua escolha (1, 2 ou 3): `);
    
    if (choice === '1') {
      connectionMethod = 'pairing';
      usePairingCode = true;
      clearScreen();
      showPairingInstructions();
      showSuccess('Método selecionado: Código de Pareamento');
      return;
    } else if (choice === '2') {
      connectionMethod = 'qr';
      usePairingCode = false;
      clearScreen();
      showQRInstructions();
      showSuccess('Método selecionado: QR Code');
      return;
    } else if (choice === '3') {
      console.log(`\n${colors.brightYellow}👋 Até logo! Encerrando...${colors.reset}\n`);
      process.exit(0);
    } else {
      showError('Opção inválida! Digite 1, 2 ou 3.');
    }
  }
}

async function INC() {
  // Verificação de IP/VPS autorizado
  try {
    console.log(`\n${colors.brightCyan}┌${"─".repeat(63)}┐`);
    console.log(`│ ${colors.brightWhite}🔒 Verificando autorização de host...${colors.brightCyan}${" ".repeat(24)}│`);
    console.log(`└${"─".repeat(63)}┘${colors.reset}\n`);
    
    var [ip, vps] = await Promise.all([
      axios.get("https://l2.io/ip.json"),
      axios.get("https://raw.githubusercontent.com/bronxys/bronxys/main/list.json")
    ]);
    
    if (!vps.data.includes(ip.data.ip)) {
      console.log(`\n${colors.brightRed}┌${"─".repeat(63)}┐`);
      console.log(`│ ${colors.brightWhite}❌ ACESSO NEGADO${colors.brightRed}${" ".repeat(46)}│`);
      console.log(`│${" ".repeat(65)}│`);
      console.log(`│ ${colors.brightYellow}Este bot só funciona em hospedagem autorizada.${colors.brightRed}${" ".repeat(13)}│`);
      console.log(`│ ${colors.brightYellow}IP detectado: ${ip.data.ip}${colors.brightRed}${" ".repeat(65 - 15 - ip.data.ip.length)}│`);
      console.log(`│${" ".repeat(65)}│`);
      console.log(`│ ${colors.dim}Para usar este bot, hospede em: bronxys${colors.brightRed}${" ".repeat(23)}│`);
      console.log(`└${"─".repeat(63)}┘${colors.reset}\n`);
      return process.exit(1);
    }
    
    console.log(`${colors.brightGreen}✓ Host autorizado! IP: ${ip.data.ip}${colors.reset}\n`);
  } catch (e) {
    console.log(`\n${colors.brightRed}┌${"─".repeat(63)}┐`);
    console.log(`│ ${colors.brightWhite}❌ FALHA NA CONEXÃO${colors.brightRed}${" ".repeat(42)}│`);
    console.log(`│${" ".repeat(65)}│`);
    console.log(`│ ${colors.brightYellow}Não foi possível verificar a autorização do host.${colors.brightRed}${" ".repeat(10)}│`);
    console.log(`│ ${colors.brightYellow}Verifique sua conexão com a internet.${colors.brightRed}${" ".repeat(23)}│`);
    console.log(`│${" ".repeat(65)}│`);
    console.log(`│ ${colors.dim}Erro: ${e.message}${colors.brightRed}${" ".repeat(65 - 7 - e.message.length)}│`);
    console.log(`└${"─".repeat(63)}┘${colors.reset}\n`);
    return process.exit(1);
  }
  
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
    browser: Browsers.macOS("Chrome"),
    defaultQueryTimeoutMs: undefined,
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
    keepAliveIntervalMs: 300000,
  });

  // Solicitar código de pareamento se necessário
  if (
    usePairingCode &&
    !fs.existsSync("./dados/ALEATORY-QR/creds.json") &&
    !conn.authState.creds.registered
  ) {
    console.log(`\n${colors.brightCyan}╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║  ${colors.brightWhite}📱 CONFIGURAÇÃO DO NÚMERO${colors.brightCyan}                                     ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    const phoneNumber = await question(
      `${colors.brightCyan}${symbols.arrow}${colors.reset} Digite o número do WhatsApp (com DDI, sem +):\n${colors.dim}Exemplo: 5511999999999${colors.reset}\n`
    );
    
    pairingPhoneNumber = coletarNumeros(phoneNumber);
    
    if (pairingPhoneNumber.length < 10) {
      showError('Número inválido! Certifique-se de incluir o DDI.');
      process.exit(1);
    }
    
    const loadingInterval = showLoading('Gerando código de pareamento...');
    
    await delay(3000);
    
    try {
      const code = await conn.requestPairingCode(pairingPhoneNumber);
      stopLoading(loadingInterval, 'Código gerado com sucesso!');
      
      console.log(`\n${colors.brightGreen}╔═══════════════════════════════════════════════════════════════╗`);
      console.log(`║                                                               ║`);
      console.log(`║          ${colors.brightWhite}🔐 SEU CÓDIGO DE PAREAMENTO 🔐${colors.brightGreen}                      ║`);
      console.log(`║                                                               ║`);
      console.log(`║                  ${colors.bgWhite}${colors.black}  ${code.slice(0, 4)} - ${code.slice(4)}  ${colors.reset}${colors.brightGreen}                     ║`);
      console.log(`║                                                               ║`);
      console.log(`╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
      
      console.log(`${colors.brightYellow}⏱️  O código expira em 60 segundos!${colors.reset}\n`);
      
      showPairingInstructions();
      
    } catch (error) {
      stopLoading(loadingInterval, '');
      showError('Erro ao gerar código de pareamento!');
      console.error(error);
      process.exit(1);
    }
  }

  // Handler de atualização de conexão
  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairingCode) {
      console.log(`\n${colors.brightGreen}╔═══════════════════════════════════════════════════════════════╗`);
      console.log(`║  ${colors.brightWhite}📷 QR CODE GERADO${colors.brightGreen}                                             ║`);
      console.log(`╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
      
      const qrcode = require('qrcode-terminal');
      qrcode.generate(qr, { small: true });
      
      console.log(`\n${colors.brightYellow}⏱️  O QR Code expira em 60 segundos!${colors.reset}\n`);
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      
      if (shouldReconnect) {
        showWarning('Conexão perdida! Reconectando...');
        INC();
      } else {
        showError('Conexão encerrada! Execute o bot novamente.');
        process.exit(0);
      }
    } else if (connection === "open") {
      sessionStartTime = Date.now();
      
      console.log(`\n${colors.brightGreen}╔═══════════════════════════════════════════════════════════════╗`);
      console.log(`║                                                               ║`);
      console.log(`║          ${colors.green}${symbols.check}${colors.reset} ${colors.brightWhite}CONECTADO COM SUCESSO!${colors.reset} ${colors.green}${symbols.check}${colors.brightGreen}                      ║`);
      console.log(`║                                                               ║`);
      console.log(`╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
      
      console.log(`${colors.brightCyan}╔═══════════════════════════════════════════════════════════════╗`);
      console.log(`║  ${colors.brightWhite}📊 INFORMAÇÕES DA CONEXÃO${colors.brightCyan}                                     ║`);
      console.log(`╠═══════════════════════════════════════════════════════════════╣${colors.reset}`);
      console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Número: ${colors.brightWhite}${conn.user.id.split(':')[0]}${colors.reset}`);
      console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Nome: ${colors.brightWhite}${conn.user.name || 'Bot Alea'}${colors.reset}`);
      console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Status: ${colors.brightGreen}Online${colors.reset}`);
      console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Baileys: ${colors.brightGreen}v7.0+${colors.reset}`);
      console.log(`${colors.brightCyan}╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
      
      console.log(`${colors.brightYellow}🤖 Bot Alea iniciado com sucesso!${colors.reset}`);
      console.log(`${colors.dim}Aguardando mensagens...${colors.reset}\n`);
      
      // Carregar o index.js após conexão bem-sucedida
      const startAle = require("./index.js");
      
      // Registrar handler de mensagens
      conn.ev.on('messages.upsert', async (upsert) => {
        await startAle(upsert, conn, qrcode, sessionStartTime);
      });
    }
  });

  conn.ev.on("creds.update", saveCreds);

  // Resto do código do iniciar.js original continua aqui...
  // (Eventos de grupo, mensagens, etc.)
  
  conn.ev.process(async (events) => {
    if (events["group-participants.update"]) {
      try {
        var ale2 = events["group-participants.update"];
        
        if (!fs.existsSync(`./dados/grupos/${ale2.id}.json`)) {
          return;
        }
        var jsonGp = JSON.parse(
          fs.readFileSync(`./dados/grupos/${ale2.id}.json`)
        );

        let GroupMetadata_;
        try {
          GroupMetadata_ = await conn.groupMetadata(ale2.id);
        } catch {
          return;
        }

        const participantJid = getParticipantJid(ale2.participants[0]);
        if (String(participantJid).startsWith(conn.user.id.split(":")[0])) return;

        const membros_ = GroupMetadata_.participants;
        const groupAdmins_ = getGroupAdmins(membros_);

        if (ale2.action == "add") {
          const participantJid = getParticipantJid(ale2.participants[0]);
          
          if (isJidInList(participantJid, nescessario.listanegraG)) {
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            if (!groupAdmins_.includes(botJid)) {
              return;
            }
            
            await conn.sendMessage(GroupMetadata_.id, {
              text:
                TEXTOS_GERAL?.LISTA_NEGRA_GLOBAL_MENSAGEM ||
                "🫵🏻 𝐙𝐥𝐡𝐚 𝐪𝐮𝐞𝐦 𝐝𝐞𝐮 𝐚𝐬 𝐂𝐚𝐫𝐚𝐬 𝐩𝐨𝐫 𝐚𝐪𝐮𝐢.  𝐀𝐪𝐮𝐢 𝐯𝐨𝐜𝐞̂ 𝐧𝐚̃𝐨 𝐯𝐚𝐢 𝐛𝐚𝐠𝐮𝐧𝐜̧𝐚 𝐧𝐚̃𝐨!  𝐒𝐢𝐧𝐭𝐚 𝐨 𝐩𝐨𝐝𝐞𝐫 𝐝𝐨 𝐁𝐚𝐧 🤬\n🤺_𝐗𝐀𝐙𝐀 𝐂𝐀𝐁𝐀𝐂̧𝐎_🏌",
            });
            
            await conn.groupParticipantsUpdate(
              GroupMetadata_.id,
              [ale2.participants[0]],
              "remove"
            );
            return;
          }
        }

        const participantJidForCheck = getParticipantJid(ale2.participants[0]);
        
        if (ale2.action == "add" && isJidInList(participantJidForCheck, jsonGp[0].listanegra)) {
          const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
          if (!groupAdmins_.includes(botJid)) {
            return;
          }

          await conn.sendMessage(GroupMetadata_.id, {
            text: "🫵🏻 𝐙𝐥𝐡𝐚 𝐪𝐮𝐞𝐦 𝐝𝐞𝐮 𝐚𝐬 𝐂𝐚𝐫𝐚𝐬 𝐩𝐨𝐫 𝐚𝐪𝐮𝐢.  𝐀𝐪𝐮𝐢 𝐯𝐨𝐜𝐞̂ 𝐧𝐚̃𝐨 𝐯𝐚𝐢 𝐛𝐚𝐠𝐮𝐧𝐜̧𝐚 𝐧𝐚̃𝐨!  𝐒𝐢𝐧𝐭𝐚 𝐨 𝐩𝐨𝐝𝐞𝐫 𝐝𝐨 𝐁𝐚𝐧 🤬\n🤺_𝐗𝐀𝐙𝐀 𝐂𝐀𝐁𝐀𝐂̧𝐎_🏌",
          });

          await conn.groupParticipantsUpdate(
            GroupMetadata_.id,
            [ale2.participants[0]],
            "remove"
          );
          return;
        }

        // Mensagens de boas-vindas e despedida
        const participantJidMain = getParticipantJid(ale2.participants[0]);
        const participantNumber = getParticipantNumber(ale2.participants[0]);
        
        // Carregar links de imagens
        let Links_P = {};
        try {
          Links_P = JSON.parse(fs.readFileSync('./dados/links.json'));
        } catch {
          Links_P = { fundo1: '', fundo2: '' };
        }
        
        // BEMVINDO1 - Com foto de perfil do participante
        if (jsonGp[0].wellcome && jsonGp[0].wellcome[0] && jsonGp[0].wellcome[0].bemvindo1) {
          if (ale2.action === "add") {
            try {
              // Pegar legenda personalizada ou usar padrão
              let welcomeMsg = jsonGp[0].wellcome[0].legendabv || 
                `🫵🏻 {𝗕𝗘𝗠-𝗩𝗜𝗡𝗗𝗢} #numerodele# 𝙇𝙚𝙧 𝙖𝙨 𝙧𝙚𝙜𝙧𝙖𝙨 𝙚́ 𝙥𝙖𝙧𝙩𝙞́𝙘𝙞𝙥𝙚..! 𝙄𝙣𝙖𝙩𝙞𝙫𝙤𝙨 𝙨𝙚𝙧𝙖̃𝙤 𝙧𝙚𝙢𝙤𝙫𝙞𝙙𝙤𝙨 🥱`;
              
              // Substituir placeholders
              welcomeMsg = welcomeMsg
                .replace(/#numerodele#/g, `@${participantNumber}`)
                .replace(/#usuario#/g, `@${participantNumber}`);
              
              // Tentar obter foto de perfil do participante
              let profilePicUrl = null;
              try {
                profilePicUrl = await conn.profilePictureUrl(participantJidMain, 'image');
              } catch {
                profilePicUrl = null; // Participante não tem foto de perfil
              }
              
              // Enviar com foto de perfil se existir
              if (profilePicUrl) {
                await conn.sendMessage(GroupMetadata_.id, {
                  image: { url: profilePicUrl },
                  caption: welcomeMsg,
                  mentions: [participantJidMain]
                });
              } else {
                // Enviar apenas texto se não houver foto de perfil
                await conn.sendMessage(GroupMetadata_.id, {
                  text: welcomeMsg,
                  mentions: [participantJidMain]
                });
              }
            } catch (error) {
              console.error('Erro ao enviar bemvindo1:', error);
            }
          } else if (ale2.action === "remove") {
            try {
              // Pegar legenda de saída personalizada ou usar padrão
              let byeMsg = jsonGp[0].wellcome[0].legendasaiu || 
                `👋 Tchau #numerodele#! Até a próxima! 🚪`;
              
              // Substituir placeholders
              byeMsg = byeMsg
                .replace(/#numerodele#/g, `@${participantNumber}`)
                .replace(/#usuario#/g, `@${participantNumber}`);
              
              // Tentar obter foto de perfil do participante que saiu
              let profilePicUrl = null;
              try {
                profilePicUrl = await conn.profilePictureUrl(participantJidMain, 'image');
              } catch {
                profilePicUrl = null; // Participante não tem foto de perfil
              }
              
              // Enviar com foto de perfil se existir
              if (profilePicUrl) {
                await conn.sendMessage(GroupMetadata_.id, {
                  image: { url: profilePicUrl },
                  caption: byeMsg,
                  mentions: [participantJidMain]
                });
              } else {
                // Enviar apenas texto se não houver foto de perfil
                await conn.sendMessage(GroupMetadata_.id, {
                  text: byeMsg,
                  mentions: [participantJidMain]
                });
              }
            } catch (error) {
              console.error('Erro ao enviar mensagem de saída bemvindo1:', error);
            }
          }
        }
        
        // BEMVINDO2 - Sem foto (apenas texto)
        if (jsonGp[0].wellcome && jsonGp[0].wellcome[1] && jsonGp[0].wellcome[1].bemvindo2) {
          if (ale2.action === "add") {
            try {
              // Pegar legenda personalizada ou usar padrão
              let welcomeMsg2 = jsonGp[0].wellcome[1].legendabv || 
                `🫵🏻 {𝗕𝗘𝗠-𝗩𝗜𝗡𝗗𝗢} #numerodele# 𝙇𝙚𝙧 𝙖𝙨 𝙧𝙚𝙜𝙧𝙖𝙨 𝙚́ 𝙥𝙖𝙧𝙩𝙞́𝙘𝙞𝙥𝙚..! 𝙄𝙣𝙖𝙩𝙞𝙫𝙤𝙨 𝙨𝙚𝙧𝙖̃𝙤 𝙧𝙚𝙢𝙤𝙫𝙞𝙙𝙤𝙨 🥱`;
              
              // Substituir placeholders
              welcomeMsg2 = welcomeMsg2
                .replace(/#numerodele#/g, `@${participantNumber}`)
                .replace(/#usuario#/g, `@${participantNumber}`);
              
              // Enviar apenas texto (sem foto)
              await conn.sendMessage(GroupMetadata_.id, {
                text: welcomeMsg2,
                mentions: [participantJidMain]
              });
            } catch (error) {
              console.error('Erro ao enviar bemvindo2:', error);
            }
          } else if (ale2.action === "remove") {
            try {
              // Pegar legenda de saída personalizada ou usar padrão
              let byeMsg2 = jsonGp[0].wellcome[1].legendasaiu || 
                `👋 Tchau #numerodele#! Até a próxima! 🚪`;
              
              // Substituir placeholders
              byeMsg2 = byeMsg2
                .replace(/#numerodele#/g, `@${participantNumber}`)
                .replace(/#usuario#/g, `@${participantNumber}`);
              
              await conn.sendMessage(GroupMetadata_.id, {
                text: byeMsg2,
                mentions: [participantJidMain]
              });
            } catch (error) {
              console.error('Erro ao enviar mensagem de saída bemvindo2:', error);
            }
          }
        }
      } catch (error) {
        console.error("Erro no evento group-participants.update:", error);
      }
    }
  });

  return conn;
}

INC().catch((err) => {
  showError('Erro fatal ao iniciar o bot!');
  console.error(err);
  process.exit(1);
});
