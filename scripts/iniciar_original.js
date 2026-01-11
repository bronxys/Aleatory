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
  colors,
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

const usePairingCode = process.argv.includes("sim");

if (!usePairingCode && !fs.existsSync(`${qrcode}/creds.json`))
  console.log(
    colors.yellow(
      "Se você não tiver outro aparelho para ler o qrcode, você pode usar, ( sh start.sh sim ), sem os parenteses, e você conectará com código de emparelhamento, o novo modelo."
    )
  );
const useMobile = process.argv.includes("--mobile");

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
  // Se participant é um objeto (Baileys 7.0+)
  if (typeof participant === 'object' && participant !== null) {
    // Priorizar id (preferencial no Baileys 7.0+), depois phoneNumber, depois lid
    return participant.id || participant.phoneNumber || participant.lid || participant;
  }
  // Se participant é uma string (versões antigas)
  return participant;
};

// Função auxiliar para extrair apenas o número (sem @s.whatsapp.net ou @lid)
const getParticipantNumber = (participant) => {
  const jid = getParticipantJid(participant);
  return String(jid).split('@')[0];
};

// Funções auxiliares para compatibilidade com LID (Baileys 7.0+)
const extractNumber = (jid) => {
  if (!jid) return '';
  return String(jid).split('@')[0];
};

const isJidInList = (jid, list) => {
  if (!jid || !Array.isArray(list)) return false;
  const number = extractNumber(jid);
  return list.some(item => extractNumber(item) === number);
};

async function INC() {
  let pairingPhoneNumber = null; // Declarar no escopo da função
  const { state, saveCreds } = await useMultiFileAuthState(qrcode);

  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger,
    version,
    browser: Browsers.macOS("Chrome"), // Obrigatório para pairing code funcionar
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
    if (useMobile) {
      throw new Error(
        "Não é possível usar o código de emparelhamento com API móvel"
      );
    }
    const phoneNumber = await question(
      ".Por favor insira o seu número:\nobs: Sem O + e digite seu número certinho como está no whatsapp, mas lembre-se, é o número que será o bot, não o seu.\n"
    );
    pairingPhoneNumber = coletarNumeros(phoneNumber);
    console.log(
      colors.yellow(
        "Aguardando 10 segundos antes de solicitar código de pareamento..."
      )
    );
    
    // Aguardar delay e solicitar código imediatamente
    await delay(10000);
    
    try {
      const code = await conn.requestPairingCode(pairingPhoneNumber);
      console.log(
        colors.green(
          `\n╔═══════════════════════════════════════╗\n║  CÓDIGO DE PAREAMENTO: ${code}  ║\n╚═══════════════════════════════════════╝\n`
        )
      );
      console.log(
        colors.cyan(
          "Vá no WhatsApp que será o bot:\n" +
          "1. Acesse 'Aparelhos Conectados'\n" +
          "2. Clique em 'Conectar um aparelho'\n" +
          "3. Na parte inferior, clique em 'Conectar com número de telefone'\n" +
          "4. Digite o código acima\n"
        )
      );
    } catch (error) {
      console.log(colors.red("Erro ao solicitar código de pareamento:"), error);
    }
  }

  if (
    useMobile &&
    !fs.existsSync("./dados/ALEATORY-QR/creds.json") &&
    !conn.authState.creds.registered
  ) {
    const { registration } = conn.authState.creds || { registration: {} };
    if (!registration.phoneNumber) {
      registration.phoneNumber = await question(
        ".Por favor insira o seu número:\nobs: Sem O + e digite seu número certinho comk está no whatsapp\n"
      );
    }

    const libPhonenumber = await require("libphonenumber-js");
    const phoneNumber = libPhonenumber.parsePhoneNumber(
      registration.phoneNumber
    );
    if (!phoneNumber?.isValid()) {
      throw new Error(
        "Número de telefone inválido: " + registration.phoneNumber
      );
    }
    registration.phoneNumber = phoneNumber.format("E.164");
    registration.phoneNumberCountryCode = phoneNumber.countryCallingCode;
    registration.phoneNumberNationalNumber = phoneNumber.nationalNumber;
    const mcc = PHONENUMBER_MCC[phoneNumber.countryCallingCode];
    if (!mcc) {
      throw new Error(
        "Não foi possível encontrar MCC para o número de telefone: " +
          registration.phoneNumber +
          "\nEspecifique o MCC manualmente."
      );
    }
    registration.phoneNumberMobileCountryCode = mcc;
    async function enterCode() {
      try {
        const code = await question("Digite o código único:\n");
        const response = await conn.register(
          code.replace(/["']/g, "").trim().toLowerCase()
        );
        console.log("Seu número de telefone foi registrado com sucesso.");
        console.log(response);
        rl.close();
      } catch (error) {
        console.error(
          "Falha ao registrar seu número de telefone. Por favor, tente novamente.\n",
          error
        );
        await askForOTP();
      }
    }

    async function askForOTP() {
      let code = await question(
        'Como você gostaria de receber o código único para registro? "sms" ou "voz"\n'
      );
      code = code.replace(/["']/g, "").trim().toLowerCase();
      if (code !== "sms" && code !== "voice") {
        return await askForOTP();
      }
      registration.method = code;
      try {
        await conn.requestRegistrationCode(registration);
        await enterCode();
      } catch (error) {
        console.error(
          "Falha ao solicitar o código de registro. Por favor, tente novamente.\n",
          error
        );
        await askForOTP();
      }
    }
    askForOTP();
  }

  conn.ev.process(async (events) => {
    if (events["group-participants.update"]) {
      try {
        var ale2 = events["group-participants.update"];
        console.log(colors.cyan("[EVENTO] group-participants.update recebido:"));
        console.log(colors.yellow(`  → Grupo: ${ale2.id}`));
        console.log(colors.yellow(`  → Ação: ${ale2.action}`));
        console.log(colors.yellow(`  → Participante: ${ale2.participants[0]}`));
        
        if (!fs.existsSync(`./dados/grupos/${ale2.id}.json`)) {
          console.log(colors.red(`[AVISO] Arquivo de configuração do grupo não encontrado: ./dados/grupos/${ale2.id}.json`));
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
          
          // Verificar se está na lista negra global usando comparação de números
          if (isJidInList(participantJid, nescessario.listanegraG)) {
            // Verificar se o bot é admin antes de remover
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            if (!groupAdmins_.includes(botJid)) {
              console.log(colors.yellow('[LISTA NEGRA GLOBAL] Bot não é admin, não pode remover'));
              return;
            }
            
            console.log(colors.red(`[LISTA NEGRA GLOBAL] Removendo ${extractNumber(participantJid)} do grupo`));
            
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
        
        // Verificar se está na lista negra do grupo usando comparação de números
        if (ale2.action == "add" && isJidInList(participantJidForCheck, jsonGp[0].listanegra)) {
          // Verificar se o bot é admin antes de remover
          const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
          if (!groupAdmins_.includes(botJid)) {
            console.log(colors.yellow('[LISTA NEGRA] Bot não é admin, não pode remover'));
            return;
          }
          
          console.log(colors.red(`[LISTA NEGRA] Removendo ${extractNumber(participantJidForCheck)} do grupo`));
          
          // Enviar mensagem personalizada ou padrão
          const mensagem = (jsonGp[0]?.legenda_listanegra && jsonGp[0]?.legenda_listanegra != "0")
            ? jsonGp[0].legenda_listanegra
            : "𝐙𝐥𝐡𝐚 𝐚𝐢 𝐟𝐚𝐦𝐢́𝐥𝐢𝐚 𝐪𝐮𝐞𝐦 𝐝𝐞𝐮 𝐚𝐬 𝐜𝐚𝐫𝐚𝐬 𝐩𝐨𝐫 𝐀𝐪𝐮𝐢..! 𝐩𝐨𝐫 𝐨𝐫𝐝𝐞𝐧𝐬 𝐝𝐨 𝐀𝐝𝐦𝐢𝐫𝐨 𝐢𝐫𝐞𝐢 𝐭𝐞 𝐩𝐚𝐬𝐬𝐚𝐫 𝐚 𝐅𝐚𝐜𝐚😝🔪\n𝐀𝐠𝐨𝐫𝐚 𝐬𝐢𝐧𝐭𝐚 𝐨 𝐩𝐨𝐝𝐞𝐫 𝐝𝐨 𝐁𝐚𝐧 𝐂𝐚𝐛𝐚𝐜̧𝐨𝐕𝐀𝐙𝐀 😡🤬";
          
          await conn.sendMessage(GroupMetadata_.id, {
            text: mensagem,
          });
          
          await conn.groupParticipantsUpdate(
            GroupMetadata_.id,
            [ale2.participants[0]],
            "remove"
          );
        }
        const participantNumForFake = getParticipantNumber(ale2.participants[0]);
        if (
          jsonGp[0].antifake &&
          ale2.action === "add" &&
          !participantNumForFake.startsWith("55")
        ) {
          if (
            jsonGp[0]?.legenda_estrangeiro &&
            jsonGp[0]?.legenda_estrangeiro != "0"
          ) {
            await conn.sendMessage(GroupMetadata_.id, {
              text: jsonGp[0].legenda_estrangeiro,
            });
          }
          setTimeout(async () => {
            conn.groupParticipantsUpdate(
              GroupMetadata_.id,
              [ale2.participants[0]],
              "remove"
            );
          }, 1000);
        }

        // BEM VINDO
        console.log(colors.cyan("[CONFIG] Verificando configurações de boas-vindas:"));
        console.log(colors.yellow(`  → Bemvindo1 (com foto): ${jsonGp[0].wellcome[0].bemvindo1 ? "ATIVO" : "INATIVO"}`));
        console.log(colors.yellow(`  → Bemvindo2 (sem foto): ${jsonGp[0].wellcome[1].bemvindo2 ? "ATIVO" : "INATIVO"}`));
        
        if (
          !jsonGp[0].wellcome[1].bemvindo2 &&
          !jsonGp[0].wellcome[0].bemvindo1
        ) {
          console.log(colors.red("[INFO] Nenhum bemvindo ativo, ignorando evento."));
          return;
        }

        let ppimg = null;
        let ppimgBuffer = null;
        let hasValidImage = false;
        try {
          const participantJid = getParticipantJid(ale2.participants[0]);
          console.log(colors.cyan("[IMAGEM] Tentando obter foto de perfil..."));
          ppimg = await conn.profilePictureUrl(
            participantJid,
            "image"
          );
          console.log(colors.cyan(`[IMAGEM] URL da foto obtida: ${ppimg}`));
          ppimgBuffer = await getBuffer(ppimg);
          console.log(colors.green("[IMAGEM] Buffer da imagem obtido com sucesso!"));
          hasValidImage = true;
        } catch (e) {
          console.log(colors.yellow("[IMAGEM] Não foi possível obter foto de perfil."));
          console.log(colors.red(`[IMAGEM] Erro: ${e.message}`));
          ppimg = null;
          ppimgBuffer = null;
          hasValidImage = false;
        }

        const isWelcomed =
          jsonGp[0].wellcome[0].legendabv != null ? true : false;
        const isByed = jsonGp[0].wellcome[0].legendasaiu != 0 ? true : false;
        const isWelcomed2 =
          jsonGp[0].wellcome[1].legendabv != null ? true : false;
        const isByed2 = jsonGp[0].wellcome[1].legendasaiu != 0 ? true : false;
        const groupDesc = GroupMetadata_.desc;
        const participantNumber = getParticipantNumber(ale2.participants[0]);
        if (jsonGp[0].antifake == true && !participantNumber.startsWith("55"))
          return;
        if (jsonGp[0].wellcome[0].bemvindo1 == true) {
          console.log(colors.green("[BEMVINDO1] Executando bemvindo1 (com foto)..."));
          // PEGAR DESCRIÇÃO DO GRUPO. /ANTNMSCVRS

          if (ale2.action === "add") {
            console.log(colors.green("[BEMVINDO1] Enviando mensagem de boas-vindas..."));
            if (isWelcomed) {
              const participantNum = getParticipantNumber(ale2.participants[0]);
              teks = jsonGp[0].wellcome[0].legendabv
                .replace("#hora#", time)
                .replace("#nomedogp#", GroupMetadata_.subject)
                .replace("#numerodele#", "@" + participantNum)
                .replace("#numerobot#", conn.user.id)
                .replace(
                  "#prefix#",
                  jsonGp[0].multiprefix == true
                    ? jsonGp[0].prefixos[0]
                    : setting.prefix
                )
                .replace("#descrição#", groupDesc);
            } else {
              const participantNum = getParticipantNumber(ale2.participants[0]);
              teks = welcome(participantNum, GroupMetadata_.subject);
            }

            // Extrair JIDs para mentions (compatível com objetos e strings)
            const mentionJids = ale2.participants.map(p => getParticipantJid(p));
            
            // Enviar com imagem se disponível, senão enviar apenas texto
            if (hasValidImage && ppimgBuffer) {
              try {
                // Tentativa 1: Enviar buffer direto (RECOMENDADO)
                console.log(colors.cyan("[BEMVINDO1] Tentando enviar com buffer direto..."));
                await conn.sendMessage(GroupMetadata_.id, {
                  image: ppimgBuffer,
                  mentions: mentionJids,
                  caption: teks,
                });
                console.log(colors.green("[BEMVINDO1] Mensagem de boas-vindas com imagem enviada com sucesso!"));
              } catch (imgError) {
                console.log(colors.yellow("[BEMVINDO1] Falha ao enviar buffer, tentando com URL original..."));
                console.log(colors.red(`[BEMVINDO1] Erro: ${imgError.message}`));
                try {
                  // Tentativa 2: Enviar com URL original do WhatsApp
                  await conn.sendMessage(GroupMetadata_.id, {
                    image: { url: ppimg },
                    mentions: mentionJids,
                    caption: teks,
                  });
                  console.log(colors.green("[BEMVINDO1] Mensagem de boas-vindas com URL enviada com sucesso!"));
                } catch (urlError) {
                  console.log(colors.yellow("[BEMVINDO1] Falha ao enviar URL, enviando apenas texto..."));
                  console.log(colors.red(`[BEMVINDO1] Erro: ${urlError.message}`));
                  // Fallback final: enviar apenas texto
                  await conn.sendMessage(GroupMetadata_.id, {
                    text: teks,
                    mentions: mentionJids,
                  });
                  console.log(colors.green("[BEMVINDO1] Mensagem de boas-vindas (texto) enviada com sucesso!"));
                }
              }
            } else {
              // Sem imagem disponível, enviar apenas texto
              console.log(colors.yellow("[BEMVINDO1] Sem imagem disponível, enviando apenas texto..."));
              await conn.sendMessage(GroupMetadata_.id, {
                text: teks,
                mentions: mentionJids,
              });
              console.log(colors.green("[BEMVINDO1] Mensagem de boas-vindas (texto) enviada com sucesso!"));
            }
          } else if (ale2.action === "remove") {
            const participantNum = getParticipantNumber(ale2.participants[0]);

            if (isByed) {
              teks = jsonGp[0].wellcome[0].legendasaiu
                .replace("#hora#", time)
                .replace("#nomedogp#", GroupMetadata_.subject)
                .replace("#numerodele#", participantNum)
                .replace("#numerobot#", conn.user.id)
                .replace(
                  "#prefix#",
                  jsonGp[0].multiprefix == true
                    ? jsonGp[0].prefixos[0]
                    : setting.prefix
                )
                .replace("#descrição#", groupDesc);
            } else {
              teks = bye(participantNum);
            }
            
            const mentionJids = ale2.participants.map(p => getParticipantJid(p));
            
            // Enviar com imagem se disponível, senão enviar apenas texto
            if (hasValidImage && ppimgBuffer) {
              try {
                // Tentativa 1: Enviar buffer direto (RECOMENDADO)
                console.log(colors.cyan("[BEMVINDO1] Tentando enviar saída com buffer direto..."));
                await conn.sendMessage(GroupMetadata_.id, {
                  image: ppimgBuffer,
                  caption: teks,
                  mentions: mentionJids,
                });
                console.log(colors.green("[BEMVINDO1] Mensagem de saída com imagem enviada com sucesso!"));
              } catch (imgError) {
                console.log(colors.yellow("[BEMVINDO1] Falha ao enviar buffer na saída, tentando com URL original..."));
                console.log(colors.red(`[BEMVINDO1] Erro: ${imgError.message}`));
                try {
                  // Tentativa 2: Enviar com URL original do WhatsApp
                  await conn.sendMessage(GroupMetadata_.id, {
                    image: { url: ppimg },
                    caption: teks,
                    mentions: mentionJids,
                  });
                  console.log(colors.green("[BEMVINDO1] Mensagem de saída com URL enviada com sucesso!"));
                } catch (urlError) {
                  console.log(colors.yellow("[BEMVINDO1] Falha ao enviar URL na saída, enviando apenas texto..."));
                  console.log(colors.red(`[BEMVINDO1] Erro: ${urlError.message}`));
                  // Fallback final: enviar apenas texto
                  await conn.sendMessage(GroupMetadata_.id, {
                    text: teks,
                    mentions: mentionJids,
                  });
                  console.log(colors.green("[BEMVINDO1] Mensagem de saída (texto) enviada com sucesso!"));
                }
              }
            } else {
              // Sem imagem disponível, enviar apenas texto
              console.log(colors.yellow("[BEMVINDO1] Sem imagem disponível para saída, enviando apenas texto..."));
              await conn.sendMessage(GroupMetadata_.id, {
                text: teks,
                mentions: mentionJids,
              });
              console.log(colors.green("[BEMVINDO1] Mensagem de saída (texto) enviada com sucesso!"));
            }
          }
        }

        if (jsonGp[0].wellcome[1].bemvindo2 == true) {
          console.log(colors.green("[BEMVINDO2] Executando bemvindo2 (sem foto)..."));
          if (ale2.action === "add") {
            console.log(colors.green("[BEMVINDO2] Enviando mensagem de boas-vindas..."));
            if (isWelcomed2) {
              const participantNum = getParticipantNumber(ale2.participants[0]);
              teks = jsonGp[0].wellcome[1].legendabv
                .replace("#hora#", time)
                .replace("#nomedogp#", GroupMetadata_.subject)
                .replace("#numerodele#", "@" + participantNum)
                .replace("#numerobot#", conn.user.id)
                .replace(
                  "#prefix#",
                  jsonGp[0].multiprefix == true
                    ? jsonGp[0].prefixos[0]
                    : setting.prefix
                )
                .replace("#descrição#", groupDesc);
            } else {
              const participantNum = getParticipantNumber(ale2.participants[0]);
              teks = welcome2(participantNum, GroupMetadata_.subject);
            }
            
            const mentionJids = ale2.participants.map(p => getParticipantJid(p));
            
            conn.sendMessage(GroupMetadata_.id, {
              text: teks,
              mentions: mentionJids,
            });
            console.log(colors.green("[BEMVINDO2] Mensagem de boas-vindas enviada com sucesso!"));
          } else if (ale2.action === "remove") {
            const participantNum = getParticipantNumber(ale2.participants[0]);

            if (isByed2) {
              teks = jsonGp[0].wellcome[1].legendasaiu
                .replace("#hora#", time)
                .replace("#nomedogp#", GroupMetadata_.subject)
                .replace("#numerodele#", participantNum)
                .replace("#numerobot#", conn.user.id)
                .replace(
                  "#prefix#",
                  jsonGp[0].multiprefix == true
                    ? jsonGp[0].prefixos[0]
                    : setting.prefix
                )
                .replace("#descrição#", groupDesc);
            } else {
              teks = bye2(participantNum);
            }
            
            const mentionJids = ale2.participants.map(p => getParticipantJid(p));
            
            conn.sendMessage(GroupMetadata_.id, {
              text: teks,
              mentions: mentionJids,
            });
          }
        }
      } catch (e) {
        if (String(e).includes("bye is not defined")) {
          console.log(
            "Mensagem de saiu do bemvindo, não definida, caso não queira definir, só ignorar..."
          );
        } else if (String(e).includes("bye2 is not defined")) {
          console.log(
            "Mensagem de saiu2, do bemvindo2, não está definida, caso não queira definir, só ignorar essa mensage..."
          );
        } else {
          console.log(e);
        }
      }
    }

    if (events["connection.update"]) {
      const update = events["connection.update"];
      const {
        connection,
        lastDisconnect,
        qr,
        isNewLogin,
        receivedPendingNotifications,
      } = update;

      if (!usePairingCode && qr) {
        console.log(
          colors.green(
            "VOCÊ PRECISARÁ DE UM SEGUNDO CELULAR, PARA TIRAR FOTO DO QRCODE, PRA DEPOIS ESCANEAR A FOTO QUE TIROU"
          )
        );
      }

      const shouldReconnect = new Boom(lastDisconnect?.error)?.output
        .statusCode;

      switch (connection) {
        case "close":
          if (shouldReconnect) {
            if (shouldReconnect == 428) {
              console.log(
                colors.yellow(
                  "Conexão caiu, irei ligar novamente, se continuar com este erro, não se preocupe, pode ocorrer por inatividade, mas se não tiver funcionando adequadamente ae é um problema, entre em contato com o Suporte da Bronxys.."
                )
              );
            } else if (shouldReconnect == 401) {
              console.log(
                colors.red(
                  "O QRCODE DO BOT FOI DESCONECTADO, RE-LEIA O QRCODE DENOVO PARA CONECTAR"
                )
              );
              fs.remove(qrcode)
                .then(() => {
                  console.log("Qrcode excluído com sucesso");
                })
                .catch((err) => {
                  console.error(`Erro ao excluir o qrcode: ${err}`);
                });
            } else if (shouldReconnect == 515) {
              console.log(
                colors.gray("Restart Nescessario para estabilizar a conexão...")
              );
            } else if (shouldReconnect == 440) {
              return console.log(
                colors.gray(
                  "Está tendo um pequeno conflito, se isso aparecer mais de 4 vez, creio que há uma outra sessão aberta, ou o bot ligado em outro lugar, caso contrário ignore.."
                )
              );
            } else if (shouldReconnect == 503) {
              console.log(colors.grey("Erro desconhecido, code: 503"));
            } else if (shouldReconnect == 502) {
              console.log(
                colors.grey("CONEXÃO TA QUERENDO CAIR, É A INTERNET...")
              );
            } else if (shouldReconnect == 408) {
              console.log(
                colors.gray(
                  "Conexão fraca, pode ser o cpu que não está suportando também..."
                )
              );
            } else {
              console.log("Conexão Fechada _- POR: ", lastDisconnect?.error);
            }
            INC();
          }
          break;

        case "connecting":
          console.log(colors.green("CONECTANDO.. ALEATORRY-BOT BRONXYS"));
          
          // Solicitar código de pareamento quando estiver conectando
          if (pairingPhoneNumber && !conn.authState.creds.registered) {
            try {
              console.log(colors.yellow("Aguardando 10 segundos antes de solicitar código de pareamento..."));
              await delay(10000); // Delay de 10 segundos OBRIGATÓRIO
              const code = await conn.requestPairingCode(pairingPhoneNumber);
              console.log(
                colors.green(
                  `\n╔═══════════════════════════════════════╗\n║  CÓDIGO DE PAREAMENTO: ${code}  ║\n╚═══════════════════════════════════════╝\n`
                )
              );
              console.log(
                colors.cyan(
                  "Vá no WhatsApp que será o bot:\n" +
                  "1. Acesse 'Aparelhos Conectados'\n" +
                  "2. Clique em 'Conectar um aparelho'\n" +
                  "3. Na parte inferior, clique em 'Conectar com número de telefone'\n" +
                  "4. Digite o código acima\n"
                )
              );
              pairingPhoneNumber = null; // Limpar para não solicitar novamente
            } catch (error) {
              console.log(colors.red("Erro ao solicitar código de pareamento:"), error);
            }
          }
          break;

        case "open":
          console.log(banner3.string);
          console.log(banner2.string);
          console.log(
            colors.green(
              `〔- _ ALEATORY-BOT BRONXYS _ - CONECTADO COM SUCESSO..  〕`
            )
          );
          if (rl) {
            rl.close();
          }
          sessionStartTime = moment().tz("America/Sao_Paulo").unix();
          await conn.sendPresenceUpdate("available");
          break;

        default:
          break;
      }
    }

    if (events["messages.upsert"]) {
      var upsert = events["messages.upsert"];
      const startAle = require("./index.js");
      sessionStartTim = upsert.messages.some(
        (i) => i.messageTimestamp > sessionStartTime
      );
      startAle(upsert, conn, qrcode, sessionStartTim)
        .then(() => {})
        .catch((error) => {
          console.log("Erro no Bot:", String(error));
        });
    }

    if (events["creds.update"]) {
      await saveCreds();
    }
  });
}
INC().catch(async (e) => {
  console.log(colors.red("ERROR EM INICIAR.JS: " + e));
});
