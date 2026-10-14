// Módulo para converter imagens/animações WebP em MP4
// Usa ffmpeg local ao invés de API externa (ezgif.com)
const fs = require("fs-extra");
const { exec } = require("child_process");

// Função para gerar nome aleatório (fallback se getRandom não estiver disponível)
function _getRandom(ext) {
  return (
    "./tmp_" +
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36) +
    ext
  );
}

// Deletar arquivo temporário com segurança
function _delFile(file) {
  try {
    if (typeof file === "string") fs.unlinkSync(file);
  } catch (e) {}
}

// Função para converter WebP animado em MP4 (Buffer)
async function webp_mp4(imageBuffer) {
  const tmpWebp = _getRandom(".webp");
  const tmpMp4 = tmpWebp.replace(/\.webp$/i, ".mp4");

  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(tmpWebp, imageBuffer);
      exec(
        `ffmpeg -y -i ${tmpWebp} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tmpMp4}`,
        { timeout: 30000 },
        (err, stdout, stderr) => {
          _delFile(tmpWebp);
          if (err) {
            _delFile(tmpMp4);
            return reject(
              new Error("[webp_mp4] ffmpeg falhou: " + (err.message || err))
            );
          }
          try {
            const mp4Buffer = fs.readFileSync(tmpMp4);
            _delFile(tmpMp4);
            resolve(mp4Buffer);
          } catch (readErr) {
            _delFile(tmpMp4);
            reject(
              new Error("[webp_mp4] Erro ao ler mp4: " + readErr.message)
            );
          }
        }
      );
    } catch (writeErr) {
      _delFile(tmpWebp);
      _delFile(tmpMp4);
      reject(
        new Error("[webp_mp4] Erro ao gravar webp: " + writeErr.message)
      );
    }
  });
}

// Exporta a função webp_mp4
module.exports = webp_mp4;
