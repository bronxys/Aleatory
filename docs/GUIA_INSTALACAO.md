# 🚀 Guia de Instalação - Bot Alea com Sistema de Áudio OGG/Opus

## 📦 O que foi modificado?

Este bot foi **completamente atualizado** com um sistema de áudios em formato OGG/Opus, garantindo compatibilidade universal em todos os dispositivos (Android, iOS, Web).

### ✨ Melhorias Implementadas

- ✅ **96 áudios convertidos** de MP3 para OGG/Opus
- ✅ **147+ referências atualizadas** no código
- ✅ **Compatibilidade universal** garantida
- ✅ **62% de economia de espaço** em disco
- ✅ **Qualidade de áudio mantida** com codec Opus
- ✅ **Sistema de conversão automático** para novos áudios

## 📋 Requisitos

- **Node.js** v14 ou superior
- **FFmpeg** instalado no sistema
- **Conexão com internet**
- **Número de WhatsApp** para conectar o bot

## 🔧 Instalação

### 1. Extrair o arquivo

```bash
unzip Alea_BOT_AUDIO_OGG_FIXED.zip
cd Alea_Limpo
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o bot (se necessário)

Edite o arquivo de configuração conforme suas necessidades.

### 4. Iniciar o bot

```bash
npm start
```

ou

```bash
node index.js
```

### 5. Escanear QR Code

Quando o bot iniciar, um QR Code aparecerá no terminal. Escaneie-o com o WhatsApp para conectar.

## 🎵 Sistema de Áudios

### Arquivos de Áudio

Todos os áudios estão localizados em:
```
dados/audios/          # 98 arquivos OGG (ativos)
dados/audios_backup_mp3/  # 96 arquivos MP3 (backup)
```

### Adicionar Novos Áudios

Se você quiser adicionar novos áudios:

1. Coloque o arquivo MP3 na pasta `dados/audios/`
2. Execute o script de conversão:
   ```bash
   node converter_audios.js
   ```
3. Atualize as referências no código:
   ```bash
   node atualizar_referencias_audio.js
   ```

### Formato dos Áudios

- **Formato**: OGG
- **Codec**: Opus (libopus)
- **Sample Rate**: 48000 Hz
- **Bitrate**: 48 kbps
- **Canais**: 1 (mono)
- **Mimetype**: `audio/ogg; codecs=opus`

## 📱 Comandos de Áudio

### Comandos Diretos

| Comando | Descrição |
|---------|-----------|
| `/bot` | Áudio de apresentação do bot |
| `/admin` | Áudio de admin |
| `/marca` ou `/marcar` | Marca todos com áudio |

### Autoresposta

O bot responde automaticamente com áudios quando detecta certas palavras:
- **"bom dia"** → Áudio de bom dia
- **"boa tarde"** → Áudio de boa tarde
- **"boa noite"** → Áudio de boa noite
- E muitos outros triggers...

### Comandos de Efeitos

Responda a um áudio com comandos de efeito para modificá-lo:
- Acelerar
- Desacelerar
- Graves (bass boost)
- Agudos (treble boost)
- E outros...

### Text-to-Speech (TTS)

```bash
/gtts pt Olá, mundo!
```

Converte texto em áudio (idioma: pt = português)

## 🔍 Verificação de Instalação

Para verificar se tudo está funcionando:

```bash
# Verificar sintaxe do código
node -c index.js

# Verificar arquivos de áudio
ls -lh dados/audios/*.ogg | wc -l
# Deve mostrar: 98
```

## 📊 Estatísticas

- **Total de áudios**: 98 arquivos OGG
- **Tamanho dos áudios**: ~11 MB
- **Economia de espaço**: 62% comparado aos MP3 originais
- **Backups preservados**: 96 arquivos MP3 (27 MB)

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'fluent-ffmpeg'"

```bash
npm install
```

### Erro: "ffmpeg not found"

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Baixe o FFmpeg de https://ffmpeg.org/download.html e adicione ao PATH

### Áudios não funcionam no Android

✅ **Já corrigido!** Todos os áudios agora estão em formato OGG/Opus, compatível com todos os sistemas.

### Áudios não funcionam no iOS

✅ **Já corrigido!** O formato OGG/Opus é compatível com iOS também.

## 📚 Documentação Adicional

- **VALIDACAO_SISTEMA_AUDIO.md** - Detalhes técnicos das modificações
- **ANALISE_AUDIOS.md** - Análise completa do sistema de áudios
- **converter_audios.js** - Script de conversão em lote
- **audio_converter.js** - Módulo de conversão (em `dados/org/funcoes/`)

## 🎯 Recursos Principais

1. **Sistema de Autoresposta** - ~130 triggers de palavras-chave
2. **Comandos de Administração** - Ban, kick, promover, rebaixar
3. **Brincadeiras** - Diversos comandos divertidos
4. **Efeitos de Áudio** - Modificação de áudios em tempo real
5. **Text-to-Speech** - Conversão de texto em áudio
6. **Compatibilidade Universal** - Funciona em todos os dispositivos

## 💡 Dicas

- **Backup Regular**: Faça backup da pasta `sessao/` para não perder a conexão
- **Atualizações**: Mantenha as dependências atualizadas com `npm update`
- **Logs**: Verifique os logs em caso de erros
- **Testes**: Teste todos os comandos de áudio após instalação

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme que o FFmpeg está instalado
3. Verifique se todas as dependências foram instaladas
4. Consulte a documentação técnica em `VALIDACAO_SISTEMA_AUDIO.md`

## 🎉 Pronto!

Seu bot está configurado e pronto para uso com sistema de áudios de última geração!

**Aproveite a compatibilidade universal e a qualidade de áudio superior!** 🚀
