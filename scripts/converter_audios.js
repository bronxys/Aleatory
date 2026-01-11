const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * Script para converter todos os áudios MP3 para OGG/Opus
 * Garante compatibilidade universal no WhatsApp
 */

const AUDIOS_DIR = path.join(__dirname, 'dados', 'audios');
const BACKUP_DIR = path.join(__dirname, 'dados', 'audios_backup_mp3');

// Criar pasta de backup se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Pasta de backup criada:', BACKUP_DIR);
}

/**
 * Converte um arquivo MP3 para OGG/Opus
 */
async function convertMp3ToOgg(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus')
      .format('ogg')
      .audioBitrate('48k')
      .audioChannels(1)
      .audioFrequency(48000)
      .on('end', () => {
        console.log(`✅ Convertido: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ Erro ao converter ${path.basename(inputPath)}:`, err.message);
        reject(err);
      })
      .save(outputPath);
  });
}

/**
 * Processa todos os arquivos MP3 da pasta
 */
async function convertAllAudios() {
  console.log('🎵 Iniciando conversão de áudios...\n');
  
  // Listar todos os arquivos MP3
  const files = fs.readdirSync(AUDIOS_DIR).filter(file => file.endsWith('.mp3'));
  
  console.log(`📊 Total de arquivos MP3 encontrados: ${files.length}\n`);
  
  let converted = 0;
  let errors = 0;
  
  for (const file of files) {
    const inputPath = path.join(AUDIOS_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    const outputPath = path.join(AUDIOS_DIR, file.replace('.mp3', '.ogg'));
    
    try {
      // Fazer backup do MP3 original
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(inputPath, backupPath);
      }
      
      // Converter para OGG
      await convertMp3ToOgg(inputPath, outputPath);
      
      // Remover MP3 original após conversão bem-sucedida
      fs.unlinkSync(inputPath);
      
      converted++;
    } catch (error) {
      console.error(`❌ Falha ao processar ${file}`);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA CONVERSÃO');
  console.log('='.repeat(60));
  console.log(`✅ Convertidos com sucesso: ${converted}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📁 Backups salvos em: ${BACKUP_DIR}`);
  console.log('='.repeat(60));
  
  // Verificar arquivos OGG criados
  const oggFiles = fs.readdirSync(AUDIOS_DIR).filter(file => file.endsWith('.ogg'));
  console.log(`\n🎉 Total de arquivos OGG disponíveis: ${oggFiles.length}`);
}

// Executar conversão
convertAllAudios().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
