/**
 * Script de Teste do Menu de Conexão v2.0
 * Demonstra o novo design com cores suaves e agradáveis
 */

const {
  clearScreen,
  showBanner,
  showSystemInfo,
  showMenu,
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

async function demonstrarMenu() {
  // Limpar tela e mostrar banner
  clearScreen();
  showBanner();
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mostrar informações do sistema
  await showSystemInfo();
  
  // Aguardar
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mostrar menu
  showMenu();
  
  // Aguardar
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simular seleção da opção 1
  console.log(`${colors.brightCyan}${symbols.arrow}${colors.reset} Digite sua escolha (1, 2 ou 3): ${colors.brightWhite}1${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  clearScreen();
  showPairingInstructions();
  showSuccess('Método selecionado: Código de Pareamento');
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simular geração de código
  console.log(`${colors.brightCyan}╔═══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║  ${colors.brightWhite}📱 CONFIGURAÇÃO DO NÚMERO${colors.brightCyan}                                             ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.brightCyan}${symbols.arrow}${colors.reset} Digite o número do WhatsApp (com DDI, sem +):`);
  console.log(`${colors.dim}Exemplo: 5511999999999${colors.reset}`);
  console.log(`${colors.brightWhite}5511999999999${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const loadingInterval = showLoading('Gerando código de pareamento...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  stopLoading(loadingInterval, 'Código gerado com sucesso!');
  
  // Mostrar código
  console.log(`\n${colors.brightGreen}╔═══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║                                                                       ║`);
  console.log(`║          ${colors.brightWhite}🔐 SEU CÓDIGO DE PAREAMENTO 🔐${colors.brightGreen}                              ║`);
  console.log(`║                                                                       ║`);
  console.log(`║                  ${colors.bgWhite}${colors.black}  1234 - 5678  ${colors.reset}${colors.brightGreen}                                 ║`);
  console.log(`║                                                                       ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.brightYellow}⏱️  O código expira em 60 segundos!${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular conexão
  const connectingInterval = showLoading('Aguardando conexão...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  stopLoading(connectingInterval, '');
  
  // Mostrar sucesso
  console.log(`\n${colors.brightGreen}╔═══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║                                                                       ║`);
  console.log(`║          ${colors.green}${symbols.check}${colors.reset} ${colors.brightWhite}CONECTADO COM SUCESSO!${colors.reset} ${colors.green}${symbols.check}${colors.brightGreen}                              ║`);
  console.log(`║                                                                       ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.brightCyan}╔═══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║  ${colors.brightWhite}📊 INFORMAÇÕES DA CONEXÃO${colors.brightCyan}                                             ║`);
  console.log(`╠═══════════════════════════════════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Número: ${colors.brightWhite}5511999999999${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Nome: ${colors.brightWhite}Bot Alea${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Status: ${colors.brightGreen}Online${colors.reset}`);
  console.log(`${colors.brightCyan}║${colors.reset}  ${colors.green}${symbols.check}${colors.reset} Baileys: ${colors.brightGreen}v7.0+${colors.reset}`);
  console.log(`${colors.brightCyan}╚═══════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.brightYellow}🤖 Bot Alea iniciado com sucesso!${colors.reset}`);
  console.log(`${colors.dim}Aguardando mensagens...${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Demonstrar outros tipos de mensagem
  console.log(`\n${colors.brightWhite}═══════════════════════════════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.brightWhite}Demonstração de outros tipos de mensagem:${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  showWarning('Este é um aviso de exemplo');
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  showError('Este é um erro de exemplo');
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  showSuccess('Esta é uma mensagem de sucesso de exemplo');
  
  console.log(`\n${colors.brightGreen}✓ Demonstração concluída!${colors.reset}\n`);
  console.log(`${colors.gray}As cores foram escolhidas para serem suaves e agradáveis aos olhos.${colors.reset}`);
  console.log(`${colors.gray}Paleta profissional com tons pastéis de azul, verde, amarelo e vermelho.${colors.reset}\n`);
}

// Executar demonstração
demonstrarMenu().catch(console.error);
