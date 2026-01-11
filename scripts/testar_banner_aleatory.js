/**
 * Script de Teste do Banner ALEATORY V7
 */

const {
  clearScreen,
  showBanner,
  showSystemInfo,
  showMenu,
  colors
} = require('./menu_conexao.js');

async function testarBanner() {
  clearScreen();
  
  console.log(`${colors.brightWhite}═══════════════════════════════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.brightCyan}Testando novo banner: ALEATORY V7${colors.reset}\n`);
  console.log(`${colors.brightWhite}═══════════════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  showBanner();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await showSystemInfo();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  showMenu();
  
  console.log(`\n${colors.brightGreen}✓ Banner atualizado com sucesso!${colors.reset}`);
  console.log(`${colors.gray}Nome alterado de "ALEA BOT" para "ALEATORY V7"${colors.reset}\n`);
}

testarBanner().catch(console.error);
