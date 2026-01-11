/**
 * Script de teste para visualizar o menu de conexão
 * Execute: node testar_menu.js
 */

const {
  clearScreen,
  showWelcomeScreen,
  showPairingInstructions,
  showQRInstructions,
  showSuccess,
  showError,
  showWarning,
  showLoading,
  stopLoading,
  colors,
  symbols
} = require('./menu_conexao.js');

async function testMenu() {
  // Mostrar tela de boas-vindas
  await showWelcomeScreen();
  
  console.log('\n');
  
  // Simular seleção de opção 1
  console.log(`${colors.brightCyan}${symbols.arrow}${colors.reset} ${colors.brightWhite}Usuário digitou: 1${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  clearScreen();
  showPairingInstructions();
  showSuccess('Método selecionado: Código de Pareamento');
  
  console.log('\n');
  
  // Simular loading
  const loadingInterval = showLoading('Gerando código de pareamento...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  stopLoading(loadingInterval, 'Código gerado com sucesso!');
  
  // Mostrar código simulado
  const code = '12345678';
  console.log(`\n${colors.brightGreen}╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║                                                               ║`);
  console.log(`║          ${colors.brightWhite}🔐 SEU CÓDIGO DE PAREAMENTO 🔐${colors.brightGreen}                      ║`);
  console.log(`║                                                               ║`);
  console.log(`║                  ${colors.bgWhite}${colors.black}  ${code.slice(0, 4)} - ${code.slice(4)}  ${colors.reset}${colors.brightGreen}                     ║`);
  console.log(`║                                                               ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.brightYellow}⏱️  O código expira em 60 segundos!${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular conexão bem-sucedida
  console.log(`\n${colors.brightGreen}╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║                                                               ║`);
  console.log(`║          ${colors.green}${symbols.check}${colors.reset} ${colors.brightWhite}CONECTADO COM SUCESSO!${colors.reset} ${colors.green}${symbols.check}${colors.brightGreen}                      ║`);
  console.log(`║                                                               ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.brightCyan}╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║  ${colors.brightWhite}📊 INFORMAÇÕES DA CONEXÃO${colors.brightCyan}                                     ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Número: ${colors.brightWhite}5511999999999${colors.reset}                                    ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Nome: ${colors.brightWhite}Bot Alea${colors.reset}                                          ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Status: ${colors.brightGreen}Online${colors.reset}                                          ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Baileys: ${colors.brightGreen}v7.0+${colors.reset}                                          ${colors.brightCyan}║${colors.reset}`);
  console.log(`${colors.brightCyan}╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.brightYellow}🤖 Bot Alea iniciado com sucesso!${colors.reset}`);
  console.log(`${colors.dim}Aguardando mensagens...${colors.reset}\n`);
  
  // Demonstrar outros tipos de mensagem
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  showWarning('Esta é uma mensagem de aviso!');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  showError('Esta é uma mensagem de erro!');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`\n${colors.brightMagenta}╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║  ${colors.brightWhite}✨ TESTE DO MENU CONCLUÍDO COM SUCESSO! ✨${colors.brightMagenta}                  ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
}

testMenu().catch(console.error);
