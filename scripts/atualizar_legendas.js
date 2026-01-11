const fs = require('fs');
const path = require('path');

// Legendas padrão
const LEGENDA_BEM_VINDO_PADRAO = "Olá #numerodele#! 🎉\n\nSeja bem-vindo(a) ao grupo *#nomedogp#*! 🎗️\n\n📋 Por favor, leia as regras do grupo e participe ativamente.\n\n⏰ Hora: #hora#\n\n_Membros inativos poderão ser removidos._";

const LEGENDA_SAIU_PADRAO = "👋 Até logo #numerodele#!\n\nObrigado por ter participado do grupo *#nomedogp#*.\n\n_Volte sempre que quiser!_ 🚪";

// Diretório dos grupos
const gruposDir = './dados/grupos';

// Função para atualizar um arquivo de grupo
function atualizarGrupo(arquivo) {
  try {
    const caminhoCompleto = path.join(gruposDir, arquivo);
    
    // Ler o arquivo
    const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
    const dados = JSON.parse(conteudo);
    
    // Verificar se é um array e tem o formato correto
    if (!Array.isArray(dados) || dados.length === 0) {
      console.log(`❌ Formato inválido: ${arquivo}`);
      return false;
    }
    
    let modificado = false;
    
    // Atualizar bemvindo1
    if (dados[0].wellcome && dados[0].wellcome[0]) {
      // Se legendabv está vazia ou é a legenda antiga problemática
      if (!dados[0].wellcome[0].legendabv || dados[0].wellcome[0].legendabv.trim() === '') {
        dados[0].wellcome[0].legendabv = LEGENDA_BEM_VINDO_PADRAO;
        modificado = true;
      }
      
      // Se legendasaiu está como 0 ou vazia, adicionar legenda padrão
      if (dados[0].wellcome[0].legendasaiu === 0 || dados[0].wellcome[0].legendasaiu === '0') {
        dados[0].wellcome[0].legendasaiu = LEGENDA_SAIU_PADRAO;
        modificado = true;
      }
    }
    
    // Atualizar bemvindo2
    if (dados[0].wellcome && dados[0].wellcome[1]) {
      // Se legendabv está vazia ou é a legenda antiga problemática
      if (!dados[0].wellcome[1].legendabv || dados[0].wellcome[1].legendabv.trim() === '') {
        dados[0].wellcome[1].legendabv = LEGENDA_BEM_VINDO_PADRAO;
        modificado = true;
      }
      
      // Se legendasaiu está como 0 ou vazia, adicionar legenda padrão
      if (dados[0].wellcome[1].legendasaiu === 0 || dados[0].wellcome[1].legendasaiu === '0') {
        dados[0].wellcome[1].legendasaiu = LEGENDA_SAIU_PADRAO;
        modificado = true;
      }
    }
    
    // Salvar se foi modificado
    if (modificado) {
      fs.writeFileSync(caminhoCompleto, JSON.stringify(dados, null, 2), 'utf8');
      console.log(`✅ Atualizado: ${arquivo}`);
      return true;
    } else {
      console.log(`ℹ️  Sem alterações: ${arquivo}`);
      return false;
    }
    
  } catch (erro) {
    console.log(`❌ Erro ao processar ${arquivo}:`, erro.message);
    return false;
  }
}

// Função principal
function main() {
  console.log('🚀 Iniciando atualização de legendas de boas-vindas...\n');
  
  // Verificar se o diretório existe
  if (!fs.existsSync(gruposDir)) {
    console.log('❌ Diretório de grupos não encontrado:', gruposDir);
    return;
  }
  
  // Ler todos os arquivos do diretório
  const arquivos = fs.readdirSync(gruposDir);
  
  // Filtrar apenas arquivos JSON de grupos
  const arquivosGrupos = arquivos.filter(arquivo => 
    arquivo.endsWith('.json') && arquivo.includes('@g.us')
  );
  
  if (arquivosGrupos.length === 0) {
    console.log('⚠️  Nenhum arquivo de grupo encontrado.');
    return;
  }
  
  console.log(`📁 Encontrados ${arquivosGrupos.length} grupos.\n`);
  
  // Processar cada arquivo
  let atualizados = 0;
  arquivosGrupos.forEach(arquivo => {
    if (atualizarGrupo(arquivo)) {
      atualizados++;
    }
  });
  
  console.log(`\n✨ Processo concluído!`);
  console.log(`📊 Total de grupos: ${arquivosGrupos.length}`);
  console.log(`✅ Grupos atualizados: ${atualizados}`);
  console.log(`ℹ️  Grupos sem alterações: ${arquivosGrupos.length - atualizados}`);
}

// Executar
main();
