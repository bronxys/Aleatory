const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir comandos de efeitos de áudio
 * Converte saída de MP3 para OGG nos comandos de filtros de áudio
 */

const INDEX_PATH = path.join(__dirname, 'index.js');

console.log('🔧 Corrigindo comandos de efeitos de áudio...\n');

// Ler o arquivo index.js
let content = fs.readFileSync(INDEX_PATH, 'utf8');

// Substituir todos os getRandom(".mp3") para getRandom(".ogg") em comandos de efeito de áudio
// Isso garante que os arquivos temporários já sejam criados em OGG

const replacements = [
  // Comandos de efeito de áudio que geram arquivos temporários
  {
    from: /ran = getRandom\("\.mp3"\);(\s+)exec\(\s+`ffmpeg -i \$\{gem\}/g,
    to: 'ran = getRandom(".ogg");$1exec(\n              `ffmpeg -i ${gem}'
  },
  
  // Garantir que ffmpeg gera saída em OGG/Opus
  {
    from: /ffmpeg -i \$\{gem\} -filter:a "atempo=1\.6,asetrate=22100" \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -filter:a "atempo=1.6,asetrate=22100" -c:a libopus -b:a 48k ${ran}'
  },
  {
    from: /ffmpeg -i \$\{gem\} -filter:a "atempo=0\.9,asetrate=44100" \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -filter:a "atempo=0.9,asetrate=44100" -c:a libopus -b:a 48k ${ran}'
  },
  {
    from: /ffmpeg -i \$\{gem\} -filter:a atempo=1\.06,asetrate=44100\*1\.25 \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -filter:a atempo=1.06,asetrate=44100*1.25 -c:a libopus -b:a 48k ${ran}'
  },
  {
    from: /ffmpeg -i \$\{gem\} -af equalizer=f=20:width_type=o:width=2:g=15 \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -af equalizer=f=20:width_type=o:width=2:g=15 -c:a libopus -b:a 48k ${ran}'
  },
  {
    from: /ffmpeg -i \$\{gem\} -af equalizer=f=94:width_type=o:width=2:g=30 \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -af equalizer=f=94:width_type=o:width=2:g=30 -c:a libopus -b:a 48k ${ran}'
  },
  {
    from: /ffmpeg -i \$\{gem\} -af equalizer=f=90:width_type=o:width=2:g=30 \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -af equalizer=f=90:width_type=o:width=2:g=30 -c:a libopus -b:a 48k ${ran}'
  },
  {
    from: /ffmpeg -i \$\{gem\} -filter:a "atempo=0\.9,asetrate=95100" \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -filter:a "atempo=0.9,asetrate=95100" -c:a libopus -b:a 48k ${ran}'
  },
  {
    from: /ffmpeg -i \$\{gem\} -filter:a "atempo=0\.7,asetrate=65100" \$\{ran\}/g,
    to: 'ffmpeg -i ${gem} -filter:a "atempo=0.7,asetrate=65100" -c:a libopus -b:a 48k ${ran}'
  },
];

let totalReplacements = 0;

// Aplicar todas as substituições
replacements.forEach((replacement, index) => {
  const before = content;
  content = content.replace(replacement.from, replacement.to);
  
  // Contar quantas substituições foram feitas
  const matches = before.match(replacement.from);
  if (matches) {
    console.log(`✅ Corrigidos ${matches.length} comando(s) de efeito de áudio`);
    totalReplacements += matches.length;
  }
});

// Salvar o arquivo atualizado
fs.writeFileSync(INDEX_PATH, content, 'utf8');

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DAS CORREÇÕES');
console.log('='.repeat(60));
console.log(`✅ Total de correções: ${totalReplacements}`);
console.log(`📁 Arquivo atualizado: ${INDEX_PATH}`);
console.log('='.repeat(60));
console.log('\n🎉 Comandos de efeitos de áudio corrigidos!');
