// ═══════════════════════════════════════════════════════════
//  ALEATORY v9.0 — ÁUDIO DE APRESENTAÇÃO (!duvida)
//  Voz neural pt-BR (Microsoft Edge TTS) + cache em OGG/Opus
//  By Josival & M.Scheyot • bronxyshost.com
// ═══════════════════════════════════════════════════════════
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const ROOT = path.join(__dirname, "..", "..", "..");
const AUDIO_DIR = path.join(ROOT, "media", "duvida");
const AUDIO_OGG = path.join(AUDIO_DIR, "aleatory_intro.ogg");
const AUDIO_MP3 = path.join(AUDIO_DIR, "aleatory_intro.mp3");

const VOZ = "pt-BR-AntonioNeural";

// Texto falado (usado apenas como fallback se o áudio pré-gerado em media/duvida/aleatory_intro.ogg for removido)
const ROTEIRO = [
  "E aí, tudo bem? Eu sou o Aleatory, o bot oficial da BronxysHost!",
  "Eu nasci com uma missão bem clara: transformar o seu grupo de WhatsApp em uma experiência completa de verdade. Aqui você encontra mais de mil comandos — tem figurinhas, downloads, jogos, inteligência artificial, moderação automática, sistema de aluguel e muito mais! Tudo rodando liso, vinte e quatro horas por dia.",
  "E nada disso existiria sem quem acreditou no sonho. Eu fui criado pelo Josival, uma mente visionária que deu vida a esse projeto desde o primeiro dia. E fui desenvolvido pelo M.Scheyot, o cara por trás de cada linha do meu código, que trabalha sem parar pra me deixar cada vez mais rápido, mais estável e mais inteligente a cada atualização.",
  "E essa família não para por aí! A Luana e o Rafael fazem parte dessa equipe desde dois mil e vinte e um — lado a lado, ajudando pessoas todos os dias, resolvendo problemas e realizando sonhos de verdade.",
  "Por trás de toda essa estrutura está a BronxysHost ponto com: a maior host do Brasil no setor de bots, APIs e websites! Servidores ultrarrápidos, estabilidade de ponta, suporte humano de verdade que realmente te atende, e preços que cabem no seu bolso.",
  "Quer colocar o seu próprio bot no ar, hospedar o seu site ou tirar o seu projeto do papel? Não perde tempo — a BronxysHost é o lugar certo pra você! Acesse agora mesmo: BronxysHost ponto com.",
  "Ah, e não esquece: manda o comando menu aqui no chat pra descobrir tudo o que eu consigo fazer por você.",
  "Um Feliz Natal incrível pra você... e seja muito bem-vindo à família Aleatory!",
].join(" ");

let _gerando = null;

function _ffmpegToOpus(input, output) {
  return new Promise((resolve, reject) => {
    execFile(
      "ffmpeg",
      ["-y", "-i", input, "-vn", "-ac", "1", "-ar", "48000", "-c:a", "libopus", "-b:a", "64k", "-application", "voip", output],
      { timeout: 60000 },
      (err) => (err ? reject(err) : resolve(output)),
    );
  });
}

async function _gerar() {
  const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aleatory-tts-"));
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOZ, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioFilePath } = await tts.toFile(tmpDir, ROTEIRO, { rate: "+4%", pitch: "+0Hz" });
    try { tts.close && tts.close(); } catch { }
    fs.copyFileSync(audioFilePath, AUDIO_MP3);
    try {
      await _ffmpegToOpus(AUDIO_MP3, AUDIO_OGG);
      return { buffer: fs.readFileSync(AUDIO_OGG), mimetype: "audio/ogg; codecs=opus" };
    } catch {
      return { buffer: fs.readFileSync(AUDIO_MP3), mimetype: "audio/mpeg" };
    }
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
  }
}

/** Retorna { buffer, mimetype } do áudio de apresentação (gera e guarda em cache se preciso). */
async function getDuvidaAudio() {
  if (fs.existsSync(AUDIO_OGG) && fs.statSync(AUDIO_OGG).size > 1000) {
    return { buffer: fs.readFileSync(AUDIO_OGG), mimetype: "audio/ogg; codecs=opus" };
  }
  if (fs.existsSync(AUDIO_MP3) && fs.statSync(AUDIO_MP3).size > 1000) {
    try {
      await _ffmpegToOpus(AUDIO_MP3, AUDIO_OGG);
      return { buffer: fs.readFileSync(AUDIO_OGG), mimetype: "audio/ogg; codecs=opus" };
    } catch {
      return { buffer: fs.readFileSync(AUDIO_MP3), mimetype: "audio/mpeg" };
    }
  }
  if (!_gerando) _gerando = _gerar().finally(() => { _gerando = null; });
  return _gerando;
}

module.exports = { getDuvidaAudio, ROTEIRO, AUDIO_OGG };
