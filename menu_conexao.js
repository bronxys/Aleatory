/**
 * ALEATORY BOT — BRONXYS ENGINE
 * Sistema de Menu v5.0 — Premium
 * bronxyshost.com | Desde 2021
 */

const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');

// ═══ CORES ═══
const colors = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  italic: '\x1b[3m', underline: '\x1b[4m',
  green: '\x1b[38;5;78m', brightGreen: '\x1b[38;5;120m',
  blue: '\x1b[38;5;75m', brightBlue: '\x1b[38;5;117m',
  cyan: '\x1b[38;5;87m', brightCyan: '\x1b[38;5;123m',
  yellow: '\x1b[38;5;222m', brightYellow: '\x1b[38;5;228m',
  red: '\x1b[38;5;210m', brightRed: '\x1b[38;5;217m',
  magenta: '\x1b[38;5;177m', brightMagenta: '\x1b[38;5;219m',
  white: '\x1b[37m', brightWhite: '\x1b[97m',
  gray: '\x1b[38;5;245m', darkGray: '\x1b[38;5;240m',
  orange: '\x1b[38;5;208m', gold: '\x1b[38;5;214m',
  lime: '\x1b[38;5;118m', purple: '\x1b[38;5;141m',
  pink: '\x1b[38;5;205m',
  bgBlue: '\x1b[48;5;24m', bgPurple: '\x1b[48;5;54m',
  bgGreen: '\x1b[48;5;28m', bgGray: '\x1b[48;5;236m',
  black: '\x1b[30m',
};

const symbols = { check: '✓', cross: '✗', warning: '⚠', arrow: '➤', bullet: '▸' };
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

// ═══ RGB PALETTE ═══
const RGB = [
  '\x1b[38;5;196m','\x1b[38;5;202m','\x1b[38;5;208m',
  '\x1b[38;5;214m','\x1b[38;5;220m','\x1b[38;5;226m',
  '\x1b[38;5;118m','\x1b[38;5;46m', '\x1b[38;5;48m',
  '\x1b[38;5;51m', '\x1b[38;5;45m', '\x1b[38;5;39m',
  '\x1b[38;5;33m', '\x1b[38;5;63m', '\x1b[38;5;99m',
  '\x1b[38;5;135m','\x1b[38;5;171m','\x1b[38;5;207m',
  '\x1b[38;5;205m','\x1b[38;5;199m',
];

// ═══ BANNER ASCII — ALEATORY (2 linhas, moderno) ═══
const BANNER_ART = [
  ' ▄▀█ █   █▀▀ ▄▀█ ▀█▀ █▀█ █▀█ █▄█',
  ' █▀█ █▄▄ ██▄ █▀█  █  █▄█ █▀▄  █ ',
];

let _rgbInterval = null;

// ═══ BANNER COM RGB ANIMADO ═══
function showBannerRGB() {
  if (_rgbInterval) clearInterval(_rgbInterval);
  const g = colors.darkGray;
  const totalLines = BANNER_ART.length + 4; // art + separadores + bronxys + info
  let offset = 0;

  // Linhas completas do banner
  const allLines = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ...BANNER_ART,
    '       ◆ B R O N X Y S ◆',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  // Desenhar inicial
  console.log();
  for (let i = 0; i < allLines.length; i++) {
    const ci = (offset + i * 3) % RGB.length;
    console.log(`  ${RGB[ci]}${B}${allLines[i]}${R}`);
  }
  console.log(`  ${g}  ⚡ bronxyshost.com | v8.5${R}`);
  console.log(`  ${g}  👨‍💻 Josival & M.Scheyot${R}`);
  console.log();

  // Animação RGB contínua
  const startRow = 2;
  _rgbInterval = setInterval(() => {
    offset = (offset + 1) % RGB.length;
    process.stdout.write(`\x1b[${startRow};0H`);
    for (let i = 0; i < allLines.length; i++) {
      const ci = (offset + i * 3) % RGB.length;
      process.stdout.write(`  ${RGB[ci]}${B}${allLines[i]}${R}\x1b[K\n`);
    }
  }, 100);
}

function stopRGBBanner() {
  if (_rgbInterval) { clearInterval(_rgbInterval); _rgbInterval = null; }
}

// ═══ BANNER ESTÁTICO (reconexão) ═══
function showBanner() {
  const c1 = '\x1b[38;5;51m';
  const c2 = '\x1b[38;5;45m';
  const m = '\x1b[38;5;135m';
  const g = colors.darkGray;

  console.log();
  console.log(`  ${c1}${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}`);
  console.log(`  ${c1}${B}${BANNER_ART[0]}${R}`);
  console.log(`  ${c2}${B}${BANNER_ART[1]}${R}`);
  console.log(`  ${m}${B}       ◆ B R O N X Y S ◆${R}`);
  console.log(`  ${m}${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}`);
  console.log(`  ${g}  ⚡ bronxyshost.com | v8.5${R}`);
  console.log(`  ${g}  👨‍💻 Josival & M.Scheyot${R}`);
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

// ═══ MENU ═══
function showMenu() {
  const g = colors.darkGray;
  console.log(`  ${colors.cyan}${B}🔌 CONEXÃO${R}`);
  console.log(`  ${g}${"─".repeat(31)}${R}`);
  console.log();
  console.log(`  ${colors.brightWhite}${B}1.${R} ${colors.blue}📱 Código de Pareamento${R}`);
  console.log(`     ${g}Conecte sem outro celular${R}`);
  console.log();
  console.log(`  ${colors.brightWhite}${B}2.${R} ${colors.green}📷 QR Code${R}`);
  console.log(`     ${g}Escaneie com o WhatsApp${R}`);
  console.log();
  console.log(`  ${colors.brightWhite}${B}3.${R} ${colors.yellow}❓ Tenho Dúvidas${R}`);
  console.log(`     ${g}Tutorial em vídeo${R}`);
  console.log();
  console.log(`  ${colors.brightWhite}${B}4.${R} ${colors.purple}🛡️ Devo Confiar?${R}`);
  console.log(`     ${g}Conheça a BronxysHost${R}`);
  console.log();
  console.log(`  ${colors.brightWhite}${B}5.${R} ${colors.red}🚪 Sair${R}`);
  console.log();
}

// ═══ PRIMEIRA VEZ — ANIMADO ═══
async function showFirstTimeWelcome() {
  clearScreen();

  const g = colors.darkGray;
  const gld = colors.gold;
  const w = colors.brightWhite;

  // Banner RGB animado por 3s
  showBannerRGB();
  await sleep(3000);
  stopRGBBanner();

  // Tela final com banner estático
  clearScreen();
  showBanner();

  console.log(`  ${gld}${B}🎉 PRIMEIRA CONEXÃO DETECTADA${R}`);
  console.log(`  ${g}${"─".repeat(31)}${R}`);
  console.log();

  await sleep(300);

  // Typing boas-vindas
  await typeWriter(`  ${colors.green}`, 0);
  await typeWriter(`Bem-vindo ao Aleatory Bot!\n`, 25);
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
  console.log(`  ${g}${"─".repeat(31)}${R}`);
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
  const f = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  let i = 0;
  process.stdout.write(`\n  ${colors.cyan}${f[0]}${R} ${msg}`);
  return setInterval(() => { i=(i+1)%f.length; process.stdout.write(`\r  ${colors.cyan}${f[i]}${R} ${msg}`); }, 80);
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
    // ═══ RECONEXÃO — RGB + BEM-VINDO DE VOLTA ═══
    clearScreen();
    showBannerRGB();
    await sleep(3000);
    stopRGBBanner();

    clearScreen();
    showBanner();

    const g = colors.darkGray;
    const gld = colors.gold;

    console.log(`  ${gld}${B}👋 BEM-VINDO DE VOLTA!${R}`);
    console.log(`  ${g}${"─".repeat(31)}${R}`);
    console.log();

    await typeWriter(`  ${colors.green}`, 0);
    await typeWriter(`Olá! Seu Aleatory Bot está\n`, 25);
    await typeWriter(`  100% funcional e pronto.\n`, 25);
    await typeWriter(`  Aproveite! 🚀\n`, 25);
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
