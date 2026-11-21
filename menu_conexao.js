/**
 * ALEATORY BOT — BRONXYS ENGINE
 * Sistema de Menu v9.0 — Edição Especial de Natal 🎄
 * bronxyshost.com | Desde 2021
 */

const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');

// ═══ CORES — PALETA NATALINA ═══
const colors = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  italic: '\x1b[3m', underline: '\x1b[4m',
  green: '\x1b[38;5;34m', brightGreen: '\x1b[38;5;46m',
  blue: '\x1b[38;5;75m', brightBlue: '\x1b[38;5;117m',
  cyan: '\x1b[38;5;87m', brightCyan: '\x1b[38;5;123m',
  yellow: '\x1b[38;5;226m', brightYellow: '\x1b[38;5;228m',
  red: '\x1b[38;5;196m', brightRed: '\x1b[38;5;9m',
  magenta: '\x1b[38;5;177m', brightMagenta: '\x1b[38;5;219m',
  white: '\x1b[37m', brightWhite: '\x1b[97m',
  gray: '\x1b[38;5;245m', darkGray: '\x1b[38;5;240m',
  orange: '\x1b[38;5;208m', gold: '\x1b[38;5;220m',
  lime: '\x1b[38;5;118m', purple: '\x1b[38;5;141m',
  pink: '\x1b[38;5;205m',
  bgRed: '\x1b[48;5;52m', bgGreen: '\x1b[48;5;22m',
  bgBlue: '\x1b[48;5;24m', bgPurple: '\x1b[48;5;54m',
  bgGray: '\x1b[48;5;236m',
  black: '\x1b[30m',
  // Natalinas extras
  xmasRed: '\x1b[38;5;160m', xmasGreen: '\x1b[38;5;28m',
  xmasGold: '\x1b[38;5;178m', snow: '\x1b[38;5;255m',
  holly: '\x1b[38;5;34m', candy: '\x1b[38;5;210m',
};

const symbols = { check: '✓', cross: '✗', warning: '⚠', arrow: '➤', bullet: '▸', star: '★', snow: '❄', tree: '🎄', gift: '🎁', bell: '🔔', light: '✦' };
const R = colors.reset;
const B = colors.bold;
const D = colors.dim;

function typeWriter(text, speed = 25) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { process.stdout.write(text[i]); i++; }
      else { clearInterval(interval); resolve(); }
    }, speed);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function clearScreen() { process.stdout.write('\x1Bc'); }

// ═══ CHRISTMAS LIGHT PALETTE ═══
const XMAS_LIGHTS = [
  '\x1b[38;5;196m', // vermelho
  '\x1b[38;5;46m',  // verde
  '\x1b[38;5;226m', // amarelo/dourado
  '\x1b[38;5;196m', // vermelho
  '\x1b[38;5;255m', // branco/neve
  '\x1b[38;5;46m',  // verde
  '\x1b[38;5;208m', // laranja
  '\x1b[38;5;196m', // vermelho
  '\x1b[38;5;46m',  // verde
  '\x1b[38;5;226m', // dourado
];

// ═══ CHRISTMAS LIGHT STRING (animated) ═══
function generateLightString(offset = 0, length = 37) {
  const bulbs = ['✦', '●', '◆', '★', '●', '✦'];
  let str = '';
  for (let i = 0; i < length; i++) {
    const ci = (i + offset) % XMAS_LIGHTS.length;
    const bi = (i + offset) % bulbs.length;
    str += `${XMAS_LIGHTS[ci]}${bulbs[bi]}${R}`;
  }
  return str;
}

// ═══ BANNER ASCII — ALEATORY NATAL 🎄 ═══
const BANNER_ART = [
  ' ▄▀█ █   █▀▀ ▄▀█ ▀█▀ █▀█ █▀█ █▄█',
  ' █▀█ █▄▄ ██▄ █▀█  █  █▄█ █▀▄  █ ',
];

let _rgbInterval = null;

// ═══ BANNER COM LUZES NATALINAS ANIMADAS ═══
function showBannerRGB() {
  if (_rgbInterval) clearInterval(_rgbInterval);
  const g = colors.darkGray;
  let offset = 0;

  const xr = colors.xmasRed;
  const xg = colors.xmasGreen;
  const gld = colors.xmasGold;
  const sn = colors.snow;

  // Desenho inicial
  console.log();
  console.log(`  ${generateLightString(0)}`);
  console.log(`  ${xr}${B}${BANNER_ART[0]}${R}`);
  console.log(`  ${xg}${B}${BANNER_ART[1]}${R}`);
  console.log(`  ${gld}${B}    🎄 B R O N X Y S 🎄${R}`);
  console.log(`  ${generateLightString(5)}`);
  console.log(`  ${g}  ⚡ bronxyshost.com | v${R}\x1b[1;38;5;226m9.0\x1b[0m \x1b[38;5;196m🎄\x1b[0m`);
  console.log(`  ${g}  👨‍💻 Josival & M.Scheyot${R}`);
  console.log(`  ${sn}${D}  ❄ Edição Especial de Natal ❄${R}`);
  console.log();

  // Animação de luzes natalinas
  const startRow = 2;
  _rgbInterval = setInterval(() => {
    offset = (offset + 1) % XMAS_LIGHTS.length;

    // Mover cursor para o topo do banner
    process.stdout.write(`\x1b[${startRow};0H`);

    // Linha de luzes superior
    process.stdout.write(`  ${generateLightString(offset)}\x1b[K\n`);

    // Banner art alternando vermelho/verde
    const c1 = offset % 2 === 0 ? xr : xg;
    const c2 = offset % 2 === 0 ? xg : xr;
    process.stdout.write(`  ${c1}${B}${BANNER_ART[0]}${R}\x1b[K\n`);
    process.stdout.write(`  ${c2}${B}${BANNER_ART[1]}${R}\x1b[K\n`);

    // Bronxys com estrela piscante
    const starColor = offset % 3 === 0 ? gld : (offset % 3 === 1 ? sn : xr);
    process.stdout.write(`  ${starColor}${B}    🎄 B R O N X Y S 🎄${R}\x1b[K\n`);

    // Linha de luzes inferior
    process.stdout.write(`  ${generateLightString(offset + 5)}\x1b[K\n`);
  }, 150);
}

function stopRGBBanner() {
  if (_rgbInterval) { clearInterval(_rgbInterval); _rgbInterval = null; }
}

// ═══ BANNER ESTÁTICO NATALINO (reconexão) ═══
function showBanner() {
  const xr = colors.xmasRed;
  const xg = colors.xmasGreen;
  const gld = colors.xmasGold;
  const sn = colors.snow;
  const g = colors.darkGray;

  console.log();
  console.log(`  ${generateLightString(3)}`);
  console.log(`  ${xr}${B}${BANNER_ART[0]}${R}`);
  console.log(`  ${xg}${B}${BANNER_ART[1]}${R}`);
  console.log(`  ${gld}${B}    🎄 B R O N X Y S 🎄${R}`);
  console.log(`  ${generateLightString(7)}`);
  console.log(`  ${g}  ⚡ bronxyshost.com | v${R}\x1b[1;38;5;226m9.0\x1b[0m \x1b[38;5;196m🎄\x1b[0m`);
  console.log(`  ${g}  👨‍💻 Josival & M.Scheyot${R}`);
  console.log(`  ${sn}${D}  ❄ Edição Especial de Natal ❄${R}`);
  console.log();
}

// ═══ SYSTEM INFO ═══
async function showSystemInfo() {
  const g = colors.darkGray;
  console.log(`  ${colors.cyan}${B}📊 SISTEMA${R}`);
  console.log(`  ${g}${"─".repeat(31)}${R}`);
  try {
    console.log(`  ${colors.green}${symbols.check}${R} Node.js ${colors.brightWhite}${process.version}${R}`);
    try {
      const { stdout } = await execPromise('npm --version');
      console.log(`  ${colors.green}${symbols.check}${R} npm    ${colors.brightWhite}v${stdout.trim()}${R}`);
    } catch { console.log(`  ${colors.red}${symbols.cross}${R} npm    ${colors.red}N/A${R}`); }
    try {
      await execPromise('ffmpeg -version 2>&1');
      console.log(`  ${colors.green}${symbols.check}${R} FFmpeg ${colors.brightWhite}OK${R}`);
    } catch { console.log(`  ${colors.yellow}${symbols.warning}${R} FFmpeg ${colors.yellow}N/A${R}`); }
    try {
      await import('@whiskeysockets/baileys');
      console.log(`  ${colors.green}${symbols.check}${R} Baileys ${colors.brightWhite}v7.0+${R}`);
    } catch { console.log(`  ${colors.red}${symbols.cross}${R} Baileys ${colors.red}N/A${R}`); }
  } catch { }
  console.log();
}

// ═══ MENU NATALINO ═══
function showMenu() {
  const g = colors.darkGray;
  const xr = colors.xmasRed;
  const xg = colors.xmasGreen;
  const gld = colors.xmasGold;
  const sn = colors.snow;

  // Header natalino
  console.log(`  ${xr}🎄 ${xg}${B}CONEXÃO${R} ${gld}${B}NATALINA${R} ${xr}🎄${R}`);
  console.log(`  ${xr}✦${xg}●${gld}✦${xr}●${sn}✦${xg}●${gld}✦${xr}●${xg}✦${gld}●${xr}✦${xg}●${gld}✦${xr}●${xg}✦${gld}●${xr}✦${xg}●${R}`);
  console.log();

  // Option 1
  console.log(`  ${sn}${B}1.${R} ${xg}🎁 Código de Pareamento${R}`);
  console.log(`     ${g}Conecte sem outro celular${R}`);
  console.log();

  // Option 2
  console.log(`  ${sn}${B}2.${R} ${xr}🎅 QR Code${R}`);
  console.log(`     ${g}Escaneie com o WhatsApp${R}`);
  console.log();

  // Option 3
  console.log(`  ${sn}${B}3.${R} ${gld}⭐ Tenho Dúvidas${R}`);
  console.log(`     ${g}Tutorial em vídeo${R}`);
  console.log();

  // Option 4
  console.log(`  ${sn}${B}4.${R} ${xg}🛡️ Devo Confiar?${R}`);
  console.log(`     ${g}Conheça a BronxysHost${R}`);
  console.log();

  // Option 5
  console.log(`  ${sn}${B}5.${R} ${xr}🚪 Sair${R}`);
  console.log();
  console.log(`  ${xr}✦${xg}●${gld}✦${xr}●${sn}✦${xg}●${gld}✦${xr}●${xg}✦${gld}●${xr}✦${xg}●${gld}✦${xr}●${xg}✦${gld}●${xr}✦${xg}●${R}`);
  console.log();
}

// ═══ PRIMEIRA VEZ — NATAL ANIMADO 🎄 ═══
async function showFirstTimeWelcome() {
  clearScreen();

  const g = colors.darkGray;
  const gld = colors.xmasGold;
  const xr = colors.xmasRed;
  const xg = colors.xmasGreen;
  const sn = colors.snow;
  const w = colors.brightWhite;

  // Banner com luzes natalinas animadas por 3s
  showBannerRGB();
  await sleep(3000);
  stopRGBBanner();

  // Tela final com banner estático natalino
  clearScreen();
  showBanner();

  console.log(`  ${xr}🎅 ${gld}${B}PRIMEIRA CONEXÃO DETECTADA${R} ${xg}🎄${R}`);
  console.log(`  ${xr}✦${xg}●${gld}✦${xr}●${sn}✦${xg}●${gld}✦${xr}●${xg}✦${gld}●${xr}✦${xg}●${gld}✦${xr}●${R}`);
  console.log();

  await sleep(300);

  // Typing boas-vindas natalinas
  await typeWriter(`  ${xg}`, 0);
  await typeWriter(`🎄 Bem-vindo ao Aleatory Bot v9.0!\n`, 25);
  await typeWriter(`  O bot oficial da BronxysHost.\n\n`, 25);
  process.stdout.write(R);

  await sleep(200);

  await typeWriter(`  ${w}`, 0);
  await typeWriter(`A maior host no setor de bots,\n`, 20);
  await typeWriter(`  APIs e websites do Brasil.\n`, 20);
  await typeWriter(`  Desde 2021. +1000 comandos.\n\n`, 20);
  process.stdout.write(R);

  await sleep(200);

  await typeWriter(`  ${colors.purple}`, 0);
  await typeWriter(`Criado por Josival e\n`, 20);
  await typeWriter(`  desenvolvido por M.Scheyot.\n`, 20);
  process.stdout.write(R);

  console.log();
  console.log(`  ${xr}✦${xg}●${gld}✦${xr}●${sn}✦${xg}●${gld}✦${xr}●${xg}✦${gld}●${xr}✦${xg}●${gld}✦${xr}●${R}`);
  console.log(`  ${gld}${B}▸ Selecione o método abaixo${R}`);
  console.log();

  await sleep(300);
}

// ═══ DÚVIDAS ═══
async function showHelpScreen() {
  clearScreen();
  console.log();
  console.log(`  ${colors.yellow}${B}❓ PRECISA DE AJUDA?${R}`);
  console.log(`  ${colors.darkGray}${"─".repeat(31)}${R}`);
  console.log();
  console.log(`  ${colors.cyan}${B}🎬 Tutorial em Vídeo:${R}`);
  console.log(`  ${colors.blue}${colors.underline}https://youtu.be/lCeC0TIsgsk${R}`);
  console.log(`  ${colors.blue}${colors.underline}?si=T_PQCqFDerwJqQNV${R}`);
  console.log();
  console.log(`  ${colors.darkGray}${"─".repeat(31)}${R}`);
  console.log(`  ${colors.brightWhite}${B}Passo rápido:${R}`);
  console.log(`  ${colors.lime}1.${R} Abra o WhatsApp do bot`);
  console.log(`  ${colors.lime}2.${R} Configurações > Aparelhos`);
  console.log(`  ${colors.lime}3.${R} Conectar um aparelho`);
  console.log(`  ${colors.lime}4.${R} Escolha: código ou QR`);
  console.log();
  console.log(`  ${colors.gold}${symbols.bullet} bronxyshost.com${R}`);
  console.log();
}

// ═══ DEVO CONFIAR? ═══
async function showTrustScreen() {
  clearScreen();
  console.log();
  console.log(`  ${colors.purple}${B}🛡️ POR QUE CONFIAR?${R}`);
  console.log(`  ${colors.darkGray}${"─".repeat(31)}${R}`);
  console.log();
  console.log(`  ${colors.gold}${B}BronxysHost — Desde 2021${R}`);
  console.log(`  ${colors.brightWhite}Maior host no setor de bots,${R}`);
  console.log(`  ${colors.brightWhite}APIs e websites do Brasil.${R}`);
  console.log();
  console.log(`  ${colors.lime}${symbols.check}${R} +5 anos no mercado`);
  console.log(`  ${colors.lime}${symbols.check}${R} +10.000 usuários`);
  console.log(`  ${colors.lime}${symbols.check}${R} +1.000 comandos`);
  console.log(`  ${colors.lime}${symbols.check}${R} Suporte 24h`);
  console.log(`  ${colors.lime}${symbols.check}${R} Atualizações constantes`);
  console.log(`  ${colors.lime}${symbols.check}${R} Código seguro e auditado`);
  console.log();
  console.log(`  ${colors.darkGray}${"─".repeat(31)}${R}`);
  console.log(`  ${colors.gold}${D}"Não somos apenas uma host,${R}`);
  console.log(`  ${colors.gold}${D} somos a revolução dos bots${R}`);
  console.log(`  ${colors.gold}${D} no Brasil." — Equipe Bronxys${R}`);
  console.log();
  console.log(`  ${colors.cyan}🌐 bronxyshost.com${R}`);
  console.log();
}

// ═══ INSTRUÇÕES ═══
function showPairingInstructions() {
  console.log();
  console.log(`  ${colors.blue}${B}📱 CÓDIGO DE PAREAMENTO${R}`);
  console.log(`  ${colors.darkGray}${"─".repeat(31)}${R}`);
  console.log(`  ${colors.brightWhite}1.${R} Abra o WhatsApp do bot`);
  console.log(`  ${colors.brightWhite}2.${R} ${colors.cyan}Mais opções (⋮)${R}`);
  console.log(`  ${colors.brightWhite}3.${R} ${colors.cyan}Aparelhos conectados${R}`);
  console.log(`  ${colors.brightWhite}4.${R} ${colors.cyan}Conectar aparelho${R}`);
  console.log(`  ${colors.brightWhite}5.${R} ${colors.cyan}Conectar com número${R}`);
  console.log(`  ${colors.brightWhite}6.${R} Digite o código de 8 dígitos`);
  console.log();
}

function showQRInstructions() {
  console.log();
  console.log(`  ${colors.green}${B}📷 QR CODE${R}`);
  console.log(`  ${colors.darkGray}${"─".repeat(31)}${R}`);
  console.log(`  ${colors.brightWhite}1.${R} Abra o WhatsApp do bot`);
  console.log(`  ${colors.brightWhite}2.${R} ${colors.cyan}Mais opções (⋮)${R}`);
  console.log(`  ${colors.brightWhite}3.${R} ${colors.cyan}Aparelhos conectados${R}`);
  console.log(`  ${colors.brightWhite}4.${R} ${colors.cyan}Conectar aparelho${R}`);
  console.log(`  ${colors.brightWhite}5.${R} Aponte a câmera pro QR`);
  console.log();
}

function askQuestion(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`  ${colors.cyan}${symbols.arrow}${R} ${prompt} `, (a) => { rl.close(); resolve(a.trim()); });
  });
}

function showLoading(msg) {
  const f = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`\n  ${colors.cyan}${f[0]}${R} ${msg}`);
  return setInterval(() => { i = (i + 1) % f.length; process.stdout.write(`\r  ${colors.cyan}${f[i]}${R} ${msg}`); }, 80);
}

function stopLoading(interval, msg = '') {
  clearInterval(interval); process.stdout.write('\r\x1b[K');
  if (msg) console.log(`  ${colors.green}${symbols.check}${R} ${msg}`);
}

function showSuccess(m) { console.log(`\n  ${colors.green}${symbols.check}${R} ${colors.brightGreen}${m}${R}\n`); }
function showError(m) { console.log(`\n  ${colors.red}${symbols.cross}${R} ${colors.brightRed}${m}${R}\n`); }
function showWarning(m) { console.log(`\n  ${colors.yellow}${symbols.warning}${R} ${colors.brightYellow}${m}${R}\n`); }

// ═══ TELA PRINCIPAL ═══
async function showWelcomeScreen() {
  const isFirstTime = !fs.existsSync('./qrcode/creds.json');

  if (isFirstTime) {
    await showFirstTimeWelcome();
  } else {
    // ═══ RECONEXÃO — LUZES NATALINAS + BEM-VINDO DE VOLTA ═══
    clearScreen();
    showBannerRGB();
    await sleep(3000);
    stopRGBBanner();

    clearScreen();
    showBanner();

    const g = colors.darkGray;
    const gld = colors.xmasGold;
    const xr = colors.xmasRed;
    const xg = colors.xmasGreen;
    const sn = colors.snow;

    console.log(`  ${xr}🎅 ${gld}${B}BEM-VINDO DE VOLTA!${R} ${xg}🎄${R}`);
    console.log(`  ${xr}✦${xg}●${gld}✦${xr}●${sn}✦${xg}●${gld}✦${xr}●${xg}✦${gld}●${xr}✦${xg}●${gld}✦${xr}●${R}`);
    console.log();

    await typeWriter(`  ${colors.green}`, 0);
    await typeWriter(`🎄 Aleatory Bot v9.0 ativo!\n`, 25);
    await typeWriter(`  100% funcional e pronto.\n`, 25);
    await typeWriter(`  Feliz Natal! 🎁\n`, 25);
    process.stdout.write(R);
    console.log();
  }

  await showSystemInfo();
  showMenu();
}

module.exports = {
  clearScreen, showBanner, showSystemInfo, showMenu,
  showWelcomeScreen, showFirstTimeWelcome,
  showHelpScreen, showTrustScreen,
  startRGBBanner: showBannerRGB, stopRGBBanner,
  showPairingInstructions, showQRInstructions,
  askQuestion, showLoading, stopLoading,
  showSuccess, showError, showWarning,
  colors, symbols,
};
