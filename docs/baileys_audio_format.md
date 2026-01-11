# Formato de Áudio na Baileys 7.0+

## 📊 Informações Importantes

### Problema Comum:
- ❌ Áudios em MP3 **não funcionam** em dispositivos móveis
- ❌ Mensagem de erro: "O áudio não está disponível porque há algo errado com o arquivo de áudio"

### Solução:
- ✅ Converter áudio para **OGG com codec OPUS**
- ✅ Usar mimetype correto: `audio/ogg; codecs=opus`

---

## 🔧 Configuração Correta

### Para PTT (Push-to-Talk / Áudio de Voz):
```javascript
{
  audio: { url: audioPath },
  mimetype: "audio/ogg; codecs=opus",
  ptt: true
}
```

### Para Áudio Regular (não PTT):
```javascript
{
  audio: { url: audioPath },
  mimetype: "audio/mpeg",
  ptt: false
}
```

---

## 🎯 Conversão com fluent-ffmpeg

### Para PTT (áudio de voz):
```javascript
const ffmpeg = require("fluent-ffmpeg");

ffmpeg(inputPath)
  .audioCodec("libopus")
  .format("ogg")
  .audioBitrate("48k")
  .audioChannels(1)
  .save(outputPath)
  .on("end", () => {
    // Enviar com mimetype: "audio/ogg; codecs=opus"
  });
```

### Para Áudio Regular:
```javascript
ffmpeg(inputPath)
  .audioCodec("libmp3lame")
  .format("mp3")
  .audioFrequency(44100)
  .audioChannels(2)
  .audioBitrate("128k")
  .save(outputPath)
  .on("end", () => {
    // Enviar com mimetype: "audio/mpeg"
  });
```

---

## ✅ Código Recomendado

```javascript
// Determinar mimetype baseado em ptt
const mimetype = isPtt ? "audio/ogg; codecs=opus" : "audio/mpeg";

await conn.sendMessage(jid, {
  audio: { url: audioPath },
  mimetype: mimetype,
  ptt: isPtt
});
```

---

## 🎯 Para Hidetag/Totag

Quando reenviar áudio marcado, **sempre** usar:

```javascript
if (aud_d) {
  DFC = aud_d;
  aud_d.audio = { url: aud_d.url };
  aud_d.mimetype = "audio/ogg; codecs=opus"; // ✅ IMPORTANTE
  aud_d.ptt = true;
}
```

---

## 📝 Observações Importantes

### 1. **Mimetype é Obrigatório**
- Não basta apenas o formato OGG
- Precisa especificar `codecs=opus`
- Formato completo: `"audio/ogg; codecs=opus"`

### 2. **Compatibilidade**
- ✅ Funciona em Android
- ✅ Funciona em iOS
- ✅ Funciona em WhatsApp Web
- ✅ Funciona em WhatsApp Desktop

### 3. **Alternativas**
- Para iOS: `audio/aac` também funciona
- Para Android: `audio/ogg; codecs=opus` é preferível
- Para máxima compatibilidade: **usar OGG OPUS**

---

## 🚀 Implementação no Bot

### Locais que precisam de correção:

1. **Comando hidetag/totag** (Linha 3661-3665)
   - ✅ Adicionar mimetype ao reenviar áudio

2. **Comando marca/marcar** (Linha 3679-3684)
   - ✅ Já usa mimetype correto

3. **Outros comandos que enviam áudio**
   - Buscar por: `audio:`, `audioMessage`, `ptt:`
   - Verificar se todos usam mimetype correto

---

## 🔍 Checklist de Correção

- [ ] Hidetag/totag: Adicionar mimetype ao áudio
- [ ] Buscar todos os comandos que enviam áudio
- [ ] Verificar se usam mimetype correto
- [ ] Testar em dispositivos móveis
- [ ] Documentar mudanças

---

## 📚 Referências

- Issue #1797: https://github.com/WhiskeySockets/Baileys/issues/1797
- Issue #501: https://github.com/WhiskeySockets/Baileys/issues/501
- Issue #193: https://github.com/WhiskeySockets/Baileys/issues/193

---

**Conclusão:** Sempre usar `mimetype: "audio/ogg; codecs=opus"` para PTT e garantir compatibilidade universal!
