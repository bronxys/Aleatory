# Correções Aplicadas no Bot Alea

## Data: 07 de Novembro de 2025

---

## 1. Correção do Comando "roubar" e "rename" (Stickers)

### Problema Identificado
- **Erro**: Request failed with status code 404
- **Causa**: A API de stickers antiga (`https://sticker-api-tpe3wet7da-uc.a.run.app/prepareWebp`) estava fora do ar
- **Arquivo afetado**: `/dados/org/funcoes/functions.js` (linha 29-44)
- **Comandos afetados**: 
  - `roubar` / `roubarfigu`
  - `minha`
  - `fstiker`
  - Qualquer comando que use `convertSticker()`

### Solução Implementada
- **Biblioteca**: Instalada `wa-sticker-formatter` (versão 4.4.4)
- **Mudança**: Função `convertSticker()` completamente reescrita
- **Método**: Uso da biblioteca moderna que cria stickers com metadados (autor e pack) de forma local, sem depender de APIs externas

### Código Anterior (Problemático)
```javascript
function convertSticker(base64, author, pack){
 return new Promise((resolve, reject) =>{
   axios('https://sticker-api-tpe3wet7da-uc.a.run.app/prepareWebp', {
     method: 'POST',
     // ... configurações da API que não funciona mais
   }).then(({data}) => {
     resolve(data.webpBase64);
   }).catch(reject);
 });
}
```

### Código Novo (Corrigido)
```javascript
async function convertSticker(base64, author, pack) {
    try {
        const { Sticker } = require('wa-sticker-formatter');
        const imageBuffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        const sticker = new Sticker(imageBuffer, {
            pack: pack || 'Sticker',
            author: author || 'Bot',
            type: 'full',
            quality: 100
        });
        
        const buffer = await sticker.toBuffer();
        return buffer.toString('base64');
    } catch (error) {
        console.error('Erro ao converter sticker:', error);
        throw error;
    }
}
```

### Vantagens da Nova Implementação
- ✅ Não depende de APIs externas (mais confiável)
- ✅ Processamento local (mais rápido)
- ✅ Tratamento de erros melhorado
- ✅ Compatível com Baileys 7.0+
- ✅ Suporta metadados (autor e pack)

---

## 2. Correção do Comando "x9visuunica" (Visualização Única)

### Problema Identificado
- **Erro**: SyntaxError: "undefined" is not valid JSON
- **Causa**: Função `getFileBuffer()` não estava processando corretamente mensagens de visualização única no Baileys 7.0+
- **Arquivo afetado**: `index.js` (linhas 2579-2605)

### Solução Implementada
- **Método**: Uso correto de `downloadContentFromMessage()` do Baileys
- **Mudanças**:
  - Adicionado tratamento de erro com try-catch
  - Implementado download por stream (método correto do Baileys)
  - Validação de mensagem antes de processar
  - Mensagem de erro amigável ao usuário

### Código Anterior (Problemático)
```javascript
if (isX9VisuUnica) {
    if (info.message?.viewOnceMessageV2 || ...) {
        var Dfn = Fl?.viewOnceMessage?.message?.imageMessage || ...;
        bla = await getFileBuffer(Dfn, Dfn.mimetype.split("/")[0]);
        conn.sendMessage(from, {
            [Dfn.mimetype.split("/")[0]]: bla,
            // ...
        });
    }
}
```

### Código Novo (Corrigido)
```javascript
if (isX9VisuUnica) {
    if (info.message?.viewOnceMessageV2 || ...) {
        try {
            var Dfn = Fl?.viewOnceMessage?.message?.imageMessage || ...;
            
            if (!Dfn) {
                console.log('Mensagem viewOnce não encontrada');
            } else {
                const mediaType = Dfn.mimetype.split("/")[0];
                const stream = await downloadContentFromMessage(Dfn, mediaType);
                
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                await conn.sendMessage(from, {
                    [mediaType]: buffer,
                    mimetype: Dfn.mimetype,
                    caption: Dfn?.caption ? `Revelando...` : "😏 Se fudeu...",
                });
            }
        } catch (error) {
            console.error('Erro ao processar viewOnce:', error);
            reply('❌ Erro ao revelar visualização única. Tente novamente.');
        }
    }
}
```

### Vantagens da Nova Implementação
- ✅ Compatível com Baileys 7.0+
- ✅ Tratamento de erros robusto
- ✅ Validação de dados antes de processar
- ✅ Mensagens de erro amigáveis
- ✅ Uso correto da API do Baileys

---

## 3. Atualização do package.json

### Dependência Adicionada
```json
{
  "dependencies": {
    "wa-sticker-formatter": "^4.4.4"
  }
}
```

---

## Instruções de Instalação

### Passo 1: Instalar Dependências
```bash
cd Alea
npm install
```

ou

```bash
npm install wa-sticker-formatter
```

### Passo 2: Reiniciar o Bot
```bash
npm start
```

---

## Testes Recomendados

### Teste 1: Comando "roubar"
1. Marque uma figurinha de alguém
2. Digite: `!roubar MeuPack/MeuNome`
3. Resultado esperado: Bot deve criar uma figurinha com os metadados personalizados

### Teste 2: Comando "x9visuunica"
1. Ative o recurso: `!x9visuunica`
2. Peça para alguém enviar uma foto/vídeo em visualização única
3. Resultado esperado: Bot deve revelar a mídia automaticamente

---

## Observações Importantes

⚠️ **Atenção**: Certifique-se de executar `npm install` antes de iniciar o bot para instalar a nova dependência.

⚠️ **Compatibilidade**: As correções foram feitas para Baileys 7.0+. Se você estiver usando uma versão anterior, pode haver incompatibilidades.

⚠️ **Logs**: Em caso de erro, verifique os logs do console para mais detalhes sobre o problema.

---

## Arquivos Modificados

1. `/dados/org/funcoes/functions.js` - Função convertSticker reescrita
2. `index.js` - Código x9visuunica corrigido (linhas 2579-2627)
3. `package.json` - Adicionada dependência wa-sticker-formatter

---

## Suporte

Se encontrar algum problema após as correções:
1. Verifique se executou `npm install`
2. Verifique os logs do console
3. Certifique-se de que está usando Baileys 7.0+
4. Verifique se todas as dependências foram instaladas corretamente
