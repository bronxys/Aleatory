const fs = require('fs');
const path = require('path');

/**
 * Script para atualizar todas as referências de áudios MP3 para OGG no index.js
 */

const INDEX_PATH = path.join(__dirname, 'index.js');

console.log('🔧 Atualizando referências de áudios no index.js...\n');

// Ler o arquivo index.js
let content = fs.readFileSync(INDEX_PATH, 'utf8');

// Lista de todas as substituições necessárias
const replacements = [
  // Função EnvAudio2_SMP - todos os arquivos da pasta audios
  { from: /\.\/dados\/audios\/(\w+)\.mp3/g, to: './dados/audios/$1.ogg' },
  
  // Casos específicos que podem ter sido perdidos
  { from: '"./dados/audios/bani.mp3"', to: '"./dados/audios/bani.ogg"' },
  { from: '"./dados/audios/promover.mp3"', to: '"./dados/audios/promover.ogg"' },
  { from: '"./dados/audios/marcar.mp3"', to: '"./dados/audios/marcar.ogg"' },
  { from: '"./dados/audios/admin.mp3"', to: '"./dados/audios/admin.ogg"' },
  { from: '"./dados/audios/nubrinks.mp3"', to: '"./dados/audios/nubrinks.ogg"' },
  { from: '"./dados/audios/ban3.mp3"', to: '"./dados/audios/ban3.ogg"' },
  { from: '"./dados/audios/bot.mp3"', to: '"./dados/audios/bot.ogg"' },
  { from: '"./dados/audios/infobot.mp"', to: '"./dados/audios/infobot.ogg"' },
];

let totalReplacements = 0;

// Aplicar todas as substituições
replacements.forEach((replacement, index) => {
  const before = content;
  content = content.replace(replacement.from, replacement.to);
  
  // Contar quantas substituições foram feitas
  if (typeof replacement.from === 'string') {
    if (before !== content) {
      console.log(`✅ Substituído: ${replacement.from} → ${replacement.to}`);
      totalReplacements++;
    }
  } else {
    // Para regex, contar matches
    const matches = before.match(replacement.from);
    if (matches) {
      console.log(`✅ Substituídos ${matches.length} arquivos: *.mp3 → *.ogg`);
      totalReplacements += matches.length;
    }
  }
});

// Salvar o arquivo atualizado
fs.writeFileSync(INDEX_PATH, content, 'utf8');

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DAS ATUALIZAÇÕES');
console.log('='.repeat(60));
console.log(`✅ Total de substituições: ${totalReplacements}`);
console.log(`📁 Arquivo atualizado: ${INDEX_PATH}`);
console.log('='.repeat(60));
console.log('\n🎉 Todas as referências de áudio foram atualizadas com sucesso!');
