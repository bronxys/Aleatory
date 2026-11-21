/**
 * ALEATORY BOT — BRONXYS ENGINE
 * Interface de Console v9.0 — Edição Comemorativa de Natal
 * Layout responsivo (42 cols) otimizado para Painel Mobile & PC
 * bronxyshost.com | Desde 2021
 */

const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');

// ═══ PALETA NATALINA PREMIUM (ANSI 256-COLOR) ═══
const colors = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  italic: '\x1b[3m', underline: '\x1b[4m',

  // Cores principais
  green: '\x1b[38;5;40m', brightGreen: '\x1b[38;5;83m',
  blue: '\x1b[38;5;75m', brightBlue: '\x1b[38;5;117m',
  cyan: '\x1b[38;5;87m', brightCyan: '\x1b[38;5;159m',
  yellow: '\x1b[38;5;220m', brightYellow: '\x1b[38;5;228m',
  red: '\x1b[38;5;196m', brightRed: '\x1b[38;5;203m',
  magenta: '\x1b[38;5;177m', brightMagenta: '\x1b[38;5;219m',
  white: '\x1b[38;5;252m', brightWhite: '\x1b[38;5;255m',
  gray: '\x1b[38;5;245m', darkGray: '\x1b[38;5;239m',
  orange: '\x1b[38;5;208m', gold: '\x1b[38;5;220m',
  lime: '\x1b[38;5;118m', purple: '\x1b[38;5;141m',
  pink: '\x1b[38;5;205m', black: '\x1b[38;5;16m',

  // Paleta Natalina
  xmasRed: '\x1b[38;5;196m',
  xmasCrimson: '\x1b[38;5;160m',
  xmasGreen: '\x1b[38;5;40m',
  xmasPine: '\x1b[38;5;34m',
  xmasMint: '\x1b[38;5;84m',
  xmasGold: '\x1b[38;5;220m',
  xmasChampagne: '\x1b[38;5;229m',
  snow: '\x1b[38;5;255m',
  ice: '\x1b[38;5;153m',
  border: '\x1b[38;5;240m',

  // Badges / Pills
  bgRed: '\x1b[48;5;160m',
  bgGreen: '\x1b[48;5;22m',
  bgGold: '\x1b[48;5;178m',
  bgBlue: '\x1b[48;5;24m',
  bgPurple: '\x1b[48;5;54m',
  bgGray: '\x1b[48;5;236m',
};

// Símbolos 100% largura-1 garantida (nunca quebram bordas no celular/xterm)
const symbols = {
  check: '✓', cross: '✗', warning: '!', arrow: '»',
  bullet: '▸', dot: '●', star: '★', snow: '❄',
  spark: '✦', diamond: '◆', sep: '·',
};

const R = colors.reset;
const B = colors.bold;
const D = colors.dim;

// Largura interna padrão do card (40 + 2 bordas = 42 cols, perfeito para mobile e PC)
const W = 40;
const M = ' '; // Margem esquerda limpa

// ═══ HELPERS DE LAYOUT & ALINHAMENTO ═══
function stripAnsi(str) {
  return String(str).replace(/\x1b\[[0-9;]*m/g, '');
}

function visLen(str) {
  return Array.from(stripAnsi(str)).length;
}

function truncVis(str, maxLen) {
  const plain = stripAnsi(str);
  const chars = Array.from(plain);
  if (chars.length <= maxLen) return str;
  return chars.slice(0, Math.max(0, maxLen - 1)).join('') + '…';
}

function padRight(str, width) {
  const len = visLen(str);
  return len >= width ? str : str + ' '.repeat(width - len);
}

function centerText(str, width) {
  const len = visLen(str);
  if (len >= width) return str;
  const left = Math.floor((width - len) / 2);
  const right = width - len - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

function boxTop(title = '', borderCol = colors.border, titleCol = colors.xmasGold) {
  if (!title) {
    return `${M}${borderCol}╭${'─'.repeat(W)}╮${R}`;
  }
  const label = ` ${title} `;
  const tLen = visLen(label);
  const rem = Math.max(0, W - tLen);
  const lBar = Math.floor(rem / 2);
  const rBar = rem - lBar;
  return `${M}${borderCol}╭${'─'.repeat(lBar)}${R}${titleCol}${B}${label}${R}${borderCol}${'─'.repeat(rBar)}╮${R}`;
}

function boxDiv(borderCol = colors.border) {
  return `${M}${borderCol}├${'─'.repeat(W)}┤${R}`;
}

function boxBot(borderCol = colors.border) {
  return `${M}${borderCol}╰${'─'.repeat(W)}╯${R}`;
}

function boxRow(content = '', borderCol = colors.border) {
  const padded = padRight(content, W);
  return `${M}${borderCol}│${R}${padded}${borderCol}│${R}`;
}

function boxCenter(content = '', borderCol = colors.border) {
  const centered = centerText(content, W);
  return `${M}${borderCol}│${R}${centered}${borderCol}│${R}`;
}

function boxKV(label, value, dotCol = colors.xmasGreen, borderCol = colors.border) {
  const left = `  ${dotCol}${symbols.dot}${R} ${colors.gray}${padRight(label, 11)}${R}`;
  return boxRow(`${left}${value}`, borderCol);
}

// Badges (pills) estilosas
function pill(text, bg, fg = colors.brightWhite) {
  return `${bg}${fg}${B} ${text} ${R}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function clearScreen() { process.stdout.write('\x1Bc'); }

function typeWriter(text, speed = 18) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { process.stdout.write(text[i]); i++; }
      else { clearInterval(interval); resolve(); }
    }, speed);
  });
}

// ═══ GUIRLANDA DE LUZES NATALINAS (ESPAÇADA & ELEGANTE) ═══
const LIGHT_COLORS = [
  colors.xmasRed,
  colors.xmasGold,
  colors.xmasGreen,
  colors.ice,
  colors.xmasRed,
  colors.xmasMint,
  colors.xmasChampagne,
];
const LIGHT_GLYPHS = ['✦', '❄', '★', '●', '❄', '✦', '★'];

function renderGarland(offset = 0) {
  // 10 luzes simétricas (5 esq + centro + 5 dir) = 36 chars exatos -> 2 espaços cada lado em W=40
  const left = [];
  const right = [];
  for (let i = 0; i < 5; i++) {
    const col = LIGHT_COLORS[(i + offset) % LIGHT_COLORS.length];
    const gl = LIGHT_GLYPHS[(i + offset) % LIGHT_GLYPHS.length];
    const bulb = `${col}${gl}${R}`;
    left.push(bulb);
    right.unshift(bulb);
  }
  const sep = `${colors.darkGray} · ${R}`;
  return `${left.join(sep)}  ${right.join(sep)}`;
}

// ═══ LOGO PIXEL-ART COM EFEITO SHIMMER NATALINO ═══
const LOGO_L1 = '▄▀█ █   █▀▀ ▄▀█ ▀█▀ █▀█ █▀█ █▄█';
const LOGO_L2 = '█▀█ █▄▄ ██▄ █▀█  █  █▄█ █▀▄  █ ';

function colorizeLogoLine(line, basePalette, shimmerPos = -1) {
  const chars = Array.from(line);
  const n = chars.length;
  let out = '';
  for (let i = 0; i < n; i++) {
    const ch = chars[i];
    if (ch === ' ') {
      out += ' ';
      continue;
    }
    if (shimmerPos >= 0 && Math.abs(i - shimmerPos) <= 2) {
      const dist = Math.abs(i - shimmerPos);
      const col = dist === 0 ? colors.brightWhite : colors.xmasChampagne;
      out += `${col}${B}${ch}${R}`;
    } else {
      const idx = Math.floor((i / n) * basePalette.length);
      const col = basePalette[Math.min(idx, basePalette.length - 1)];
      out += `${col}${B}${ch}${R}`;
    }
  }
  return out;
}

const TOP_PALETTE = ['\x1b[38;5;196m', '\x1b[38;5;203m', '\x1b[38;5;208m', '\x1b[38;5;220m', '\x1b[38;5;203m', '\x1b[38;5;196m'];
const BOT_PALETTE = ['\x1b[38;5;34m', '\x1b[38;5;40m', '\x1b[38;5;46m', '\x1b[38;5;84m', '\x1b[38;5;40m', '\x1b[38;5;34m'];

function buildBannerLines(offset = 0, shimmerPos = -1) {
  const bdr = colors.border;
  const gld = colors.xmasGold;
  const red = colors.xmasRed;
  const grn = colors.xmasGreen;
  const ice = colors.ice;
  const wht = colors.brightWhite;
  const gry = colors.gray;

  const badge = pill('v9.0', colors.bgRed, colors.brightWhite);
  const subtitle = `${gld}★${R}  ${wht}${B}B R O N X Y S${R}  ${badge}  ${gld}★${R}`;
  const xmasTag = `${ice}❄${R}  ${colors.xmasChampagne}Edição Comemorativa de Natal${R}  ${ice}❄${R}`;
  const meta1 = `  ${grn}${symbols.dot}${R} ${wht}bronxyshost.com${R}       ${gld}★${R} ${gry}Desde 2021${R}`;
  const meta2 = `  ${red}${symbols.dot}${R} ${gry}Josival ${colors.darkGray}&${R} ${gry}M.Scheyot${R}   ${colors.xmasMint}✦${R} ${gry}+1000 cmds${R}`;

  return [
    '',
    boxTop(`${red}❄${R} ${gld}NATAL 2026${R} ${grn}❄${R}`, bdr, gld),
    boxCenter(renderGarland(offset), bdr),
    boxRow('', bdr),
    boxCenter(colorizeLogoLine(LOGO_L1, TOP_PALETTE, shimmerPos), bdr),
    boxCenter(colorizeLogoLine(LOGO_L2, BOT_PALETTE, shimmerPos >= 0 ? shimmerPos - 2 : -1), bdr),
    boxRow('', bdr),
    boxCenter(subtitle, bdr),
    boxCenter(xmasTag, bdr),
    boxDiv(bdr),
    boxRow(meta1, bdr),
    boxRow(meta2, bdr),
    boxBot(bdr),
  ];
}

let _rgbInterval = null;

// ═══ BANNER ANIMADO (SHIMMER DOURADO + LUZES NATALINAS) ═══
function showBannerRGB() {
  if (_rgbInterval) clearInterval(_rgbInterval);
  let frame = 0;

  const initial = buildBannerLines(0, 0);
  console.log(initial.join('\n'));

  _rgbInterval = setInterval(() => {
    frame++;
    const shimmer = (frame * 2) % (LOGO_L1.length + 10) - 4;
    const lines = buildBannerLines(frame, shimmer);
    // Re-desenha no topo sem flicker
    process.stdout.write('\x1b[H');
    for (const ln of lines) {
      process.stdout.write(`${ln}\x1b[K\n`);
    }
  }, 140);
}

function stopRGBBanner() {
  if (_rgbInterval) {
    clearInterval(_rgbInterval);
    _rgbInterval = null;
  }
}

// ═══ BANNER ESTÁTICO NATALINO ═══
function showBanner() {
  console.log(buildBannerLines(2, -1).join('\n'));
}

// ═══ CARD DE RECONEXÃO (ENQUANTO CONECTA) ═══
function showConnectingCard() {
  const bdr = colors.border;
  console.log();
  console.log(boxTop(`${colors.xmasGold}★ BEM-VINDO DE VOLTA ★`, bdr, colors.xmasGold));
  console.log(boxRow(`  ${colors.xmasMint}✦${R} ${colors.brightWhite}${B}Aleatory Bot v9.0${R} ${colors.gray}· Edição Natal${R}`, bdr));
  console.log(boxRow(`  ${colors.ice}▸${R} ${colors.gray}Conectando ao WhatsApp...${R}`, bdr));
  console.log(boxBot(bdr));
  console.log();
}

// ═══ DASHBOARD ONLINE CONSOLIDADO (PAINEL PRINCIPAL CONECTADO) ═══
function showOnlineDashboard(info = {}) {
  const {
    waVersion = null,
    keepAliveSec = 25,
    modulesActive = 5,
    modulesTotal = 5,
    aluguelAtivo = true,
    broadcastStatus = 'ok', // 'scheduled' | 'sent' | 'ok'
  } = info;

  clearScreen();
  showBanner();

  const bdr = colors.border;
  const verStr = Array.isArray(waVersion)
    ? `v${waVersion.join('.')}`
    : (waVersion ? String(waVersion) : 'Automática');

  const onlineBadge = pill('ONLINE', colors.bgGreen, colors.brightGreen);
  const modColor = modulesActive === modulesTotal ? colors.brightGreen : colors.xmasGold;
  const modText = `${modColor}${B}${modulesActive}/${modulesTotal}${R} ${colors.gray}ativos${R}`;

  const alugText = aluguelAtivo
    ? `${colors.brightGreen}Ativo${R} ${colors.darkGray}(15min)${R}`
    : `${colors.xmasGold}Config. dono${R}`;

  let bcText;
  if (broadcastStatus === 'scheduled') {
    bcText = `${colors.xmasGold}Enviando em 15s...${R}`;
  } else if (broadcastStatus === 'sent') {
    bcText = `${colors.brightGreen}Entregue${R} ${colors.gray}(v9.0)${R}`;
  } else {
    bcText = `${colors.ice}Já enviadas${R} ${colors.darkGray}(v9.0)${R}`;
  }

  console.log();
  console.log(boxTop(`${colors.brightGreen}●${R} ${colors.xmasGold}PAINEL DE CONTROLE`, bdr, colors.xmasGold));
  console.log(boxRow('', bdr));
  console.log(boxKV('Status', `${onlineBadge} ${colors.gray}Estável${R}`, colors.brightGreen, bdr));
  console.log(boxKV('WhatsApp', `${colors.brightWhite}${truncVis(verStr, 22)}${R}`, colors.ice, bdr));
  console.log(boxKV('KeepAlive', `${colors.brightWhite}Ativo${R} ${colors.gray}(${keepAliveSec}s)${R}`, colors.xmasMint, bdr));
  console.log(boxKV('Módulos', modText, colors.xmasGold, bdr));
  console.log(boxKV('Aluguel', alugText, aluguelAtivo ? colors.brightGreen : colors.xmasGold, bdr));
  console.log(boxKV('Novidades', bcText, colors.xmasRed, bdr));
  console.log(boxRow('', bdr));
  console.log(boxDiv(bdr));
  console.log(boxCenter(`${colors.xmasRed}✦${R} ${colors.xmasChampagne}Feliz Natal! Aguardando comandos${R} ${colors.xmasGreen}✦${R}`, bdr));
  console.log(boxBot(bdr));

  if (!aluguelAtivo) {
    console.log(`${M} ${colors.xmasGold}${symbols.bullet}${R} ${colors.gray}Configure seu número em settings.json${R}`);
  }
  console.log();
}

// ═══ INFO DO SISTEMA (COMPACTA EM 2 COLUNAS) ═══
async function showSystemInfo() {
  const bdr = colors.border;
  const nodeV = process.version;
  let npmV = 'N/A';
  let ffmpegOk = false;
  let baileysOk = false;

  try {
    const { stdout } = await execPromise('npm --version');
    npmV = `v${stdout.trim()}`;
  } catch { }
  try {
    await execPromise('ffmpeg -version 2>&1');
    ffmpegOk = true;
  } catch { }
  try {
    await import('@whiskeysockets/baileys');
    baileysOk = true;
  } catch { }

  const c1a = `  ${colors.brightGreen}${symbols.check}${R} ${colors.gray}Node${R} ${colors.brightWhite}${padRight(nodeV, 10)}${R}`;
  const c1b = `${npmV !== 'N/A' ? colors.brightGreen + symbols.check : colors.red + symbols.cross}${R} ${colors.gray}npm${R} ${colors.brightWhite}${npmV}${R}`;

  const c2a = `  ${ffmpegOk ? colors.brightGreen + symbols.check : colors.xmasGold + symbols.warning}${R} ${colors.gray}FFmpeg${R} ${ffmpegOk ? colors.brightWhite + padRight('OK', 8) : colors.xmasGold + padRight('N/A', 8)}${R}`;
  const c2b = `${baileysOk ? colors.brightGreen + symbols.check : colors.red + symbols.cross}${R} ${colors.gray}Baileys${R} ${colors.brightWhite}${baileysOk ? 'v7.0+' : 'N/A'}${R}`;

  console.log(boxTop(`${colors.ice}✦${R} ${colors.brightWhite}AMBIENTE`, bdr, colors.brightWhite));
  console.log(boxRow(`${c1a}${c1b}`, bdr));
  console.log(boxRow(`${c2a}${c2b}`, bdr));
  console.log(boxBot(bdr));
  console.log();
}

// ═══ MENU DE CONEXÃO NATALINO ═══
function showMenu() {
  const bdr = colors.border;
  const opt = (num, bg, title, desc) => {
    console.log(boxRow(`  ${pill(num, bg, colors.brightWhite)} ${colors.brightWhite}${B}${title}${R}`, bdr));
    if (desc) console.log(boxRow(`      ${colors.gray}${desc}${R}`, bdr));
  };

  console.log(boxTop(`${colors.xmasRed}★${R} ${colors.xmasGold}CONEXÃO NATALINA${R} ${colors.xmasGreen}★`, bdr, colors.xmasGold));
  console.log(boxRow('', bdr));
  opt('1', colors.bgGreen, 'Código de Pareamento', 'Conecte sem outro celular');
  console.log(boxRow('', bdr));
  opt('2', colors.bgRed, 'QR Code', 'Escaneie com o WhatsApp');
  console.log(boxRow('', bdr));
  opt('3', colors.bgGold, 'Tenho Dúvidas', 'Tutorial em vídeo passo a passo');
  console.log(boxRow('', bdr));
  opt('4', colors.bgBlue, 'Sobre a BronxysHost', 'Conheça nossa estrutura');
  console.log(boxRow('', bdr));
  opt('5', colors.bgGray, 'Sair', '');
  console.log(boxRow('', bdr));
  console.log(boxBot(bdr));
  console.log();
}

// ═══ PRIMEIRA CONEXÃO — BOAS-VINDAS NATALINAS ═══
async function showFirstTimeWelcome() {
  clearScreen();

  showBannerRGB();
  await sleep(2400);
  stopRGBBanner();

  clearScreen();
  showBanner();

  const bdr = colors.border;
  console.log();
  console.log(boxTop(`${colors.xmasGold}★ PRIMEIRA CONEXÃO ★`, bdr, colors.xmasGold));
  console.log(boxRow('', bdr));
  console.log(boxCenter(`${colors.xmasMint}${B}Bem-vindo ao Aleatory v9.0!${R}`, bdr));
  console.log(boxCenter(`${colors.gray}O bot oficial da BronxysHost${R}`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxCenter(`${colors.brightWhite}Maior host de bots, APIs e sites${R}`, bdr));
  console.log(boxCenter(`${colors.xmasChampagne}Desde 2021 · +1.000 comandos${R}`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxBot(bdr));
  console.log();
}

// ═══ AJUDA / TUTORIAL ═══
async function showHelpScreen() {
  clearScreen();
  showBanner();
  const bdr = colors.border;
  console.log();
  console.log(boxTop(`${colors.xmasGold}? PRECISA DE AJUDA`, bdr, colors.xmasGold));
  console.log(boxRow('', bdr));
  console.log(boxRow(`  ${colors.ice}${B}Tutorial em Vídeo:${R}`, bdr));
  console.log(boxRow(`  ${colors.brightBlue}${colors.underline}https://youtu.be/lCeC0TIsgsk${R}`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxDiv(bdr));
  console.log(boxRow(`  ${colors.brightWhite}${B}Passo rápido:${R}`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}1.${R} Abra o WhatsApp do bot`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}2.${R} Menu > Aparelhos conectados`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}3.${R} Conectar um aparelho`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}4.${R} Use código ou escaneie o QR`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxBot(bdr));
  console.log();
}

// ═══ SOBRE A BRONXYSHOST ═══
async function showTrustScreen() {
  clearScreen();
  showBanner();
  const bdr = colors.border;
  console.log();
  console.log(boxTop(`${colors.xmasGold}★ SOBRE A BRONXYSHOST`, bdr, colors.xmasGold));
  console.log(boxRow('', bdr));
  console.log(boxCenter(`${colors.brightWhite}${B}BronxysHost · Desde 2021${R}`, bdr));
  console.log(boxCenter(`${colors.gray}Bots, APIs e Websites no Brasil${R}`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxRow(`  ${colors.brightGreen}${symbols.check}${R} +5 anos de mercado`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}${symbols.check}${R} +10.000 usuários ativos`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}${symbols.check}${R} +1.000 comandos exclusivos`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}${symbols.check}${R} Suporte humano 24h`, bdr));
  console.log(boxRow(`  ${colors.brightGreen}${symbols.check}${R} Atualizações constantes`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxDiv(bdr));
  console.log(boxCenter(`${colors.xmasChampagne}Josival · M.Scheyot · Luana · Rafael${R}`, bdr));
  console.log(boxCenter(`${colors.ice}bronxyshost.com${R}`, bdr));
  console.log(boxBot(bdr));
  console.log();
}

// ═══ INSTRUÇÕES DE CONEXÃO ═══
function showPairingInstructions() {
  showBanner();
  const bdr = colors.border;
  console.log();
  console.log(boxTop(`${colors.brightGreen}★ CÓDIGO DE PAREAMENTO`, bdr, colors.brightGreen));
  console.log(boxRow('', bdr));
  console.log(boxRow(`  ${colors.xmasGold}1.${R} Abra o WhatsApp do bot`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}2.${R} ${colors.ice}Mais opções (⋮)${R}`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}3.${R} ${colors.ice}Aparelhos conectados${R}`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}4.${R} ${colors.ice}Conectar um aparelho${R}`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}5.${R} ${colors.ice}Conectar com número${R}`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}6.${R} Digite o código de 8 dígitos`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxBot(bdr));
  console.log();
}

function showQRInstructions() {
  showBanner();
  const bdr = colors.border;
  console.log();
  console.log(boxTop(`${colors.xmasRed}★ CONEXÃO POR QR CODE`, bdr, colors.xmasRed));
  console.log(boxRow('', bdr));
  console.log(boxRow(`  ${colors.xmasGold}1.${R} Abra o WhatsApp do bot`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}2.${R} ${colors.ice}Mais opções (⋮)${R}`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}3.${R} ${colors.ice}Aparelhos conectados${R}`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}4.${R} ${colors.ice}Conectar um aparelho${R}`, bdr));
  console.log(boxRow(`  ${colors.xmasGold}5.${R} Aponte a câmera para o QR`, bdr));
  console.log(boxRow('', bdr));
  console.log(boxBot(bdr));
  console.log();
}

function askQuestion(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`${M} ${colors.xmasGold}${symbols.arrow}${R} ${prompt} `, (a) => { rl.close(); resolve(a.trim()); });
  });
}

function showLoading(msg) {
  const f = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`\n${M} ${colors.xmasGold}${f[0]}${R} ${msg}`);
  return setInterval(() => {
    i = (i + 1) % f.length;
    process.stdout.write(`\r${M} ${colors.xmasGold}${f[i]}${R} ${msg}`);
  }, 80);
}

function stopLoading(interval, msg = '') {
  clearInterval(interval);
  process.stdout.write('\r\x1b[K');
  if (msg) console.log(`${M} ${colors.brightGreen}${symbols.check}${R} ${msg}`);
}

function showSuccess(m) {
  console.log(`${M} ${pill('OK', colors.bgGreen, colors.brightGreen)} ${colors.brightWhite}${m}${R}`);
}
function showError(m) {
  console.log(`${M} ${pill('ERRO', colors.bgRed, colors.brightWhite)} ${colors.brightRed}${m}${R}`);
}
function showWarning(m) {
  console.log(`${M} ${pill('AVISO', colors.bgGold, colors.black)} ${colors.xmasGold}${m}${R}`);
}

// ═══ TELA PRINCIPAL DE BOAS-VINDAS ═══
async function showWelcomeScreen() {
  const isFirstTime = !fs.existsSync('./dados/ALEATORY-QR/creds.json');

  if (isFirstTime) {
    await showFirstTimeWelcome();
  } else {
    clearScreen();
    showBannerRGB();
    await sleep(2200);
    stopRGBBanner();
    clearScreen();
    showBanner();
    showConnectingCard();
  }

  await showSystemInfo();
  showMenu();
}

module.exports = {
  clearScreen, showBanner, showSystemInfo, showMenu,
  showWelcomeScreen, showFirstTimeWelcome,
  showConnectingCard, showOnlineDashboard,
  showHelpScreen, showTrustScreen,
  startRGBBanner: showBannerRGB, stopRGBBanner,
  showPairingInstructions, showQRInstructions,
  askQuestion, showLoading, stopLoading,
  showSuccess, showError, showWarning,
  colors, symbols,
};
