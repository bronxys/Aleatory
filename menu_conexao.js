/**
 * Sistema de Menu Profissional para Conexão WhatsApp
 * Versão 3.0 - Design Limpo e Responsivo
 * 
 * Visual clean sem bordas complexas, otimizado para mobile e desktop
 */

const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Paleta de cores suaves e profissionais
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Verde suave (sucesso)
  green: '\x1b[38;5;78m',
  brightGreen: '\x1b[38;5;120m',
  
  // Azul suave (informação)
  blue: '\x1b[38;5;75m',
  brightBlue: '\x1b[38;5;117m',
  cyan: '\x1b[38;5;87m',
  brightCyan: '\x1b[38;5;123m',
  
  // Amarelo suave (aviso)
  yellow: '\x1b[38;5;222m',
  brightYellow: '\x1b[38;5;228m',
  
  // Vermelho suave (erro)
  red: '\x1b[38;5;210m',
  brightRed: '\x1b[38;5;217m',
  
  // Roxo/Magenta suave (destaque)
  magenta: '\x1b[38;5;177m',
  brightMagenta: '\x1b[38;5;219m',
  
  // Branco e cinza
  white: '\x1b[37m',
  brightWhite: '\x1b[97m',
  gray: '\x1b[38;5;245m',
  
  // Fundos
  bgWhite: '\x1b[107m',
  black: '\x1b[30m',
};

// Símbolos Unicode
const symbols = {
  check: '✓',
  cross: '✗',
  warning: '⚠',
  arrow: '➤',
  bullet: '▸',
  dot: '•',
};

/**
 * Limpa a tela do terminal
 */
function clearScreen() {
  process.stdout.write('\x1Bc');
}

/**
 * Exibe banner principal
 */
function showBanner() {
  console.log(`\n${colors.brightCyan}${colors.bold}════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log();
  console.log(`   ${colors.brightBlue}█████╗ ██╗     ███████╗ █████╗ ████████╗ ██████╗ ██████╗ ██╗   ██╗${colors.reset}`);
  console.log(`  ${colors.brightBlue}██╔══██╗██║     ██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝${colors.reset}`);
  console.log(`  ${colors.blue}███████║██║     █████╗  ███████║   ██║   ██║   ██║██████╔╝ ╚████╔╝${colors.reset}`);
  console.log(`  ${colors.blue}██╔══██║██║     ██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝${colors.reset}`);
  console.log(`  ${colors.cyan}██║  ██║███████╗███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║   ██║${colors.reset}`);
  console.log(`  ${colors.cyan}╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝${colors.reset}`);
  console.log();
  console.log(`              ${colors.brightMagenta}██████╗ ██████╗  ██████╗ ███╗   ██╗██╗  ██╗██╗   ██╗███████╗${colors.reset}`);
  console.log(`              ${colors.brightMagenta}██╔══██╗██╔══██╗██╔═══██╗████╗  ██║╚██╗██╔╝╚██╗ ██╔╝██╔════╝${colors.reset}`);
  console.log(`              ${colors.brightMagenta}██████╔╝██████╔╝██║   ██║██╔██╗ ██║ ╚███╔╝  ╚████╔╝ ███████╗${colors.reset}`);
  console.log(`              ${colors.brightMagenta}██╔══██╗██╔══██╗██║   ██║██║╚██╗██║ ██╔██╗   ╚██╔╝  ╚════██║${colors.reset}`);
  console.log(`              ${colors.brightMagenta}██████╔╝██║  ██║╚██████╔╝██║ ╚████║██╔╝ ██╗   ██║   ███████║${colors.reset}`);
  console.log(`              ${colors.brightMagenta}╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚══════╝${colors.reset}`);
  console.log();
  console.log(`           ${colors.brightWhite}👨‍💻 Criador Josival/ Apoio M.Scheyot 👨‍💻${colors.reset}`);
  console.log();
  console.log(`${colors.brightCyan}${colors.bold}════════════════════════════════════════════════════════════════════════${colors.reset}\n`);
}

/**
 * Exibe informações do sistema
 */
async function showSystemInfo() {
  console.log(`${colors.brightBlue}${colors.bold}📊 INFORMAÇÕES DO SISTEMA${colors.reset}`);
  console.log(`${colors.gray}────────────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log();
  
  try {
    // Node.js
    const nodeVersion = process.version;
    console.log(`  ${colors.green}${symbols.check}${colors.reset} Node.js: ${colors.brightWhite}${nodeVersion}${colors.reset}`);
    
    // npm
    try {
      const { stdout: npmVersion } = await execPromise('npm --version');
      const npm = npmVersion.trim();
      console.log(`  ${colors.green}${symbols.check}${colors.reset} npm: ${colors.brightWhite}v${npm}${colors.reset}`);
    } catch {
      console.log(`  ${colors.red}${symbols.cross}${colors.reset} npm: ${colors.red}Não encontrado${colors.reset}`);
    }
    
    // FFmpeg
    try {
      await execPromise('ffmpeg -version 2>&1 | head -n 1');
      console.log(`  ${colors.green}${symbols.check}${colors.reset} FFmpeg: ${colors.brightWhite}Instalado${colors.reset}`);
    } catch {
      console.log(`  ${colors.yellow}${symbols.warning}${colors.reset} FFmpeg: ${colors.yellow}Não encontrado${colors.reset}`);
    }
    
    // Baileys
    try {
      require('@whiskeysockets/baileys');
      console.log(`  ${colors.green}${symbols.check}${colors.reset} Baileys: ${colors.brightWhite}v7.0+ Instalado${colors.reset}`);
    } catch {
      console.log(`  ${colors.red}${symbols.cross}${colors.reset} Baileys: ${colors.red}Não instalado${colors.reset}`);
    }
  } catch (error) {
    console.log(`  ${colors.red}Erro ao verificar sistema${colors.reset}`);
  }
  
  console.log();
}

/**
 * Exibe menu de opções
 */
function showMenu() {
  console.log(`${colors.brightCyan}${colors.bold}🔌 ESCOLHA O MÉTODO DE CONEXÃO${colors.reset}`);
  console.log(`${colors.gray}────────────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log();
  console.log(`  ${colors.brightWhite}1.${colors.reset} ${colors.brightBlue}📱 Conectar via Código de Pareamento${colors.reset}`);
  console.log(`     ${colors.gray}${symbols.bullet} Ideal para conectar sem outro dispositivo${colors.reset}`);
  console.log(`     ${colors.gray}${symbols.bullet} Receba um código de 8 dígitos${colors.reset}`);
  console.log();
  console.log(`  ${colors.brightWhite}2.${colors.reset} ${colors.brightGreen}📷 Conectar via QR Code${colors.reset}`);
  console.log(`     ${colors.gray}${symbols.bullet} Método tradicional e rápido${colors.reset}`);
  console.log(`     ${colors.gray}${symbols.bullet} Escaneie com seu WhatsApp${colors.reset}`);
  console.log();
  console.log(`  ${colors.brightWhite}3.${colors.reset} ${colors.red}🚪 Sair${colors.reset}`);
  console.log();
}

/**
 * Exibe instruções para código de pareamento
 */
function showPairingInstructions() {
  console.log();
  console.log(`${colors.brightBlue}${colors.bold}📱 INSTRUÇÕES - CÓDIGO DE PAREAMENTO${colors.reset}`);
  console.log(`${colors.gray}────────────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log();
  console.log(`  ${colors.brightWhite}1.${colors.reset} Abra o WhatsApp que será o bot`);
  console.log(`  ${colors.brightWhite}2.${colors.reset} Toque em ${colors.cyan}'Mais opções'${colors.reset} (⋮) ou ${colors.cyan}'Configurações'${colors.reset}`);
  console.log(`  ${colors.brightWhite}3.${colors.reset} Selecione ${colors.cyan}'Aparelhos conectados'${colors.reset}`);
  console.log(`  ${colors.brightWhite}4.${colors.reset} Toque em ${colors.cyan}'Conectar um aparelho'${colors.reset}`);
  console.log(`  ${colors.brightWhite}5.${colors.reset} Na parte inferior, toque em ${colors.cyan}'Conectar com número'${colors.reset}`);
  console.log(`  ${colors.brightWhite}6.${colors.reset} Digite o código de 8 dígitos que será exibido`);
  console.log();
}

/**
 * Exibe instruções para QR Code
 */
function showQRInstructions() {
  console.log();
  console.log(`${colors.brightGreen}${colors.bold}📷 INSTRUÇÕES - QR CODE${colors.reset}`);
  console.log(`${colors.gray}────────────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log();
  console.log(`  ${colors.brightWhite}1.${colors.reset} Abra o WhatsApp que será o bot`);
  console.log(`  ${colors.brightWhite}2.${colors.reset} Toque em ${colors.cyan}'Mais opções'${colors.reset} (⋮) ou ${colors.cyan}'Configurações'${colors.reset}`);
  console.log(`  ${colors.brightWhite}3.${colors.reset} Selecione ${colors.cyan}'Aparelhos conectados'${colors.reset}`);
  console.log(`  ${colors.brightWhite}4.${colors.reset} Toque em ${colors.cyan}'Conectar um aparelho'${colors.reset}`);
  console.log(`  ${colors.brightWhite}5.${colors.reset} Aponte a câmera para o QR Code abaixo`);
  console.log();
}

/**
 * Solicita entrada do usuário
 */
function askQuestion(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${colors.brightCyan}${symbols.arrow}${colors.reset} ${prompt} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Exibe animação de loading
 */
function showLoading(message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  process.stdout.write(`\n${colors.brightBlue}${frames[0]}${colors.reset} ${message}`);
  
  return setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.write(`\r${colors.brightBlue}${frames[i]}${colors.reset} ${message}`);
  }, 80);
}

/**
 * Para animação de loading
 */
function stopLoading(interval, successMessage = '') {
  clearInterval(interval);
  process.stdout.write('\r\x1b[K');
  
  if (successMessage) {
    console.log(`${colors.green}${symbols.check}${colors.reset} ${successMessage}`);
  }
}

/**
 * Exibe mensagem de sucesso
 */
function showSuccess(message) {
  console.log();
  console.log(`${colors.green}${symbols.check}${colors.reset} ${colors.brightGreen}${message}${colors.reset}`);
  console.log();
}

/**
 * Exibe mensagem de erro
 */
function showError(message) {
  console.log();
  console.log(`${colors.red}${symbols.cross}${colors.reset} ${colors.brightRed}${message}${colors.reset}`);
  console.log();
}

/**
 * Exibe mensagem de aviso
 */
function showWarning(message) {
  console.log();
  console.log(`${colors.yellow}${symbols.warning}${colors.reset} ${colors.brightYellow}${message}${colors.reset}`);
  console.log();
}

/**
 * Exibe tela de boas-vindas completa
 */
async function showWelcomeScreen() {
  clearScreen();
  showBanner();
  await showSystemInfo();
  showMenu();
}

module.exports = {
  clearScreen,
  showBanner,
  showSystemInfo,
  showMenu,
  showWelcomeScreen,
  showPairingInstructions,
  showQRInstructions,
  askQuestion,
  showLoading,
  stopLoading,
  showSuccess,
  showError,
  showWarning,
  colors,
  symbols
};
