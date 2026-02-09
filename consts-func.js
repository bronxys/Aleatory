const {
  default: makeWASocket,
  downloadContentFromMessage,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  makeInMemoryStore,
  DisconnectReason,
  WAGroupMetadata,
  relayWAMessage,
  MediaPathMap,
  mentionedJid,
  processTime,
  MediaType,
  Browser,
  MessageType,
  Presence,
  Mimetype,
  Browsers,
  delay,
  MessageRetryMap,
} = require("@whiskeysockets/baileys");

// MÓDULOS ABAIXO..

const { Boom } = require("@hapi/boom");

const axios = require("axios");

const fs = require("fs-extra");

const cheerio = require("cheerio");

const crypto = require("crypto");

const util = require("util");

const P = require("pino");

const NodeCache = require("node-cache");

const linkfy = require("linkifyjs");

const ms = require("ms");

const ffmpeg = require("fluent-ffmpeg");

const fetch = require("node-fetch");

const qrterminal = require("qrcode-terminal");

const { exec, spawn, execSync } = require("child_process");

const moment = require("moment-timezone");

const colors = require("colors");

const time = moment.tz("America/Sao_Paulo").format("HH:mm:ss");

const hora = moment.tz("America/Sao_Paulo").format("HH:mm:ss");

const date = moment.tz("America/Sao_Paulo").format("DD/MM/YY");

const uploader = require("./dados/upload.js");

// FUNÇÕES ABAIXO...

const {
  sendVideoAsSticker,
  sendImageAsSticker,
} = require("./dados/org/sticker/rename.js");

const {
  sendVideoAsSticker2,
  sendImageAsSticker2,
} = require("./dados/org/sticker/rename2.js");

const { validmove, setGame } = require("./dados/org/tictactoe");

const {
  wait,
  getExtension,
  generateMessageID,
  getMembros,
  getGroupAdmins,
  getRandom,
  banner,
  banner2,
  banner3,
  temporizador,
  chyt,
  getBuffer,
  fetchJson,
  fetchText,
  getBase64,
  convertSticker,
  nit,
  supre,
  recognize,
  FormData,
} = require("./dados/org/funcoes/functions.js"); // FUNÇÕES NESCESSARIAS PRA FUNFAR ALGUMAS COISAS

// JSON FUNÇÕES ABAIXO CONSTS >

const rg_aluguel = JSON.parse(
  fs.readFileSync("./dados/org/json/rg_aluguel.json")
);

const rgp = JSON.parse(fs.readFileSync("./dados/org/json/TMGP.json"));

try {
  var countMessage = JSON.parse(fs.readFileSync("./dados/countmsg.json"));
} catch {
  fs.writeFileSync("./dados/countmsg.json", JSON.stringify([]));
}

try {
  var recolherLNK = JSON.parse(
    fs.readFileSync("./dados/org/funcoes/recolherLNK.json")
  );
} catch (e) {
  fs.writeFileSync("./dados/org/funcoes/recolherLNK.json", JSON.stringify([]));
}

const daily = JSON.parse(fs.readFileSync("./dados/usuarios/diario.json"));

const nescessario = JSON.parse(fs.readFileSync("./dono/nescessario.json"));

const premium = JSON.parse(fs.readFileSync("./dados/global/premium.json"));

const ban = JSON.parse(fs.readFileSync("./dados/usuarios/banned.json"));

const limitefll = JSON.parse(fs.readFileSync("./dados/usuarios/flood.json"));

const antispam = JSON.parse(fs.readFileSync("./dono/media/antispam.json"));

const rggold = JSON.parse(fs.readFileSync("./dados/org/json/golds.json"));

const anotar = JSON.parse(fs.readFileSync("./dados/org/json/anotar.json"));

const setting = JSON.parse(fs.readFileSync("./dados/settings.json"));

const logoslink = JSON.parse(fs.readFileSync("./dados/logos.json"));

const black_ = JSON.parse(fs.readFileSync("./dados/global/AVISOS.json"));

const Limit_CMD = JSON.parse(fs.readFileSync("./dados/global/limitarcmd.json"));

const infos = JSON.parse(fs.readFileSync("./dados/org/json/infos.json"));

const bloq_global = JSON.parse(
  fs.readFileSync("./dados/global/bloqueargb.json")
);

//\\

// JS DE MENUS / INFORMAÇÕES DE UTILIZAR \

const {
  menu,
  adms,
  menudono,
  menulogos,
  menuprem,
  brincadeiras,
  efeitos,
  alteradores,
  menugold,
} = require("./dono/menus/menus.js");

const { tabela, cmd_termux } = require("./dono/infos/infos_global.js");

const { infodono } = require("./dono/menus/infodono.js");

const { gitdobot } = require("./dono/gitdobot.js");

const { configbot } = require("./dono/menus/configurar.js");

const { conselhob } = require("./dados/org/js/conselhob.js");

const { palavrasc } = require("./dados/org/js/conselhos.js");

//\\

// PEGAR LINK DA IMAGEM
function upload(midia) {
  return new Promise(async (resolve, reject) => {
    try {
      const { fromBuffer } = require("file-type");
      const { ext } = await fromBuffer(midia);
      const form = new FormData();
      form.append("file", midia, "tmp." + ext);
      fetch("https://telegra.ph/upload", {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          resolve("https://telegra.ph" + data[0].src);
        })
        .catch((error) => reject(error));
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

// DELETAR ARQUIVO..
function DLT_FL(file) {
  try {
    fs.unlinkSync(file);
  } catch (error) { }
}

// CONVERTER BYTES EM KB / MB / GB / TB
const convertBytes = function (bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) {
    return "n/a";
  }
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  if (i == 0) {
    return bytes + " " + sizes[i];
  }
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

// ANTI NOME MODIFICADA / EMOJI
function ANT_LTR_MD_EMJ(str) {
  for (let i = 0, n = str.length; i < n; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    }
  }
  return false;
}

// Transformar segundos em hora/minutos
function kyun(seconds) {
  function pad(s) {
    return (s < 10 ? "0" : "") + s;
  }
  var dias = Math.floor(seconds / (60 * 60) / 24);
  var horas = Math.floor((seconds / (60 * 60)) % 24);
  var minutos = Math.floor((seconds % (60 * 60)) / 60);
  var segundos = Math.floor(seconds % 60);
  return `${pad(dias)} Dia(s) ${pad(horas)} Hora(s) ${pad(
    minutos
  )} Minuto(s) ${pad(segundos)} Segundo(s)`;
}

// FUNÇÃO DO BAILES PRA PUXAR MÍDIA ENVIADA, E EXECUTAR AÇÃO..
const getFileBuffer = async (mediakey, MediaType) => {
  const stream = await downloadContentFromMessage(mediakey, MediaType);

  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
};

// Tudo abaixo await sleep(1000) vai demorar 1 segundo pra funcionar, 1000 é igual 1 segundo..
const sleep = async function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ENVIAR FIGU EM URL
const enviarfiguUrl = async (conn, from, link, mr) => {
  ranp = getRandom(".gif");
  rano = getRandom(".webp");
  ini_buffer = `${link}`;
  exec(
    `wget ${ini_buffer} -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 320:320 ${rano}`,
    (err) => {
      DLT_FL(ranp);
      buff = fs.readFileSync(rano);
      conn.sendMessage(from, { sticker: buff }, { quoted: mr }).catch(() => {
        return console.log("Erro..");
      });
      DLT_FL(rano);
    }
  );
};

// INTELIGENCIA-ARTIFICIAL
const simih = async (text) => {
  try {
    datasimi = await fetchJson(`https://api.simsimi.vn/v1/simtalk`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "text=" + text + "&lc=pt",
    });
    if (datasimi.message == "Required parameter is not present") return;
    return datasimi.message;
  } catch (e) {
    return;
  }
};

module.exports = {
  // MÓDULOS ABAIXO >

  P,
  fs,
  util,
  Boom,
  axios,
  linkfy,
  ms,
  ffmpeg,
  fetch,
  qrterminal,
  exec,
  spawn,
  execSync,
  limitefll,
  moment,
  time,
  hora,
  date,

  // FUNÇÕES JS ABAIXO >
  uploader,
  getBuffer,
  convertSticker,
  fetchJson,
  fetchText,
  getBase64,
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
  banner,
  banner2,
  banner3,
  temporizador,
  chyt,
  simih,
  Limit_CMD,

  // JSON FUNÇÕES ABAIXO >
  rggold,
  antispam,
  anotar,
  countMessage,
  recolherLNK,
  daily,
  nescessario,
  premium,
  ban,
  black_,
  rgp,
  rg_aluguel,
  infos,
  bloq_global,

  // JSON JUNÇÕES DE ATIconst / DESATIconst
  setting,
  logoslink,

  // JS DE MENUS, INFORMAÇÕES DE UTILIZAR COMANDOS \\

  menu,
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
  menugold,
  recognize,
  colors,
  cheerio,
  NodeCache,
  // FUNÇÃO...

  kyun,
  sendVideoAsSticker,
  sendImageAsSticker,
  sendVideoAsSticker2,
  sendImageAsSticker2,
  enviarfiguUrl,
  getFileBuffer,
  DLT_FL,
  sleep,
  ANT_LTR_MD_EMJ,
  convertBytes,
};