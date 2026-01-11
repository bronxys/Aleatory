# Instruções de Instalação

## Dependência Necessária

Para que os comandos de sticker funcionem corretamente, você precisa instalar a biblioteca `wa-sticker-formatter`.

### Como Instalar

Execute o seguinte comando no diretório do bot:

```bash
npm install wa-sticker-formatter
```

ou se você usar yarn:

```bash
yarn add wa-sticker-formatter
```

## Verificação

Após a instalação, verifique se o pacote foi adicionado ao seu `package.json`:

```json
{
  "dependencies": {
    "wa-sticker-formatter": "^4.4.4"
  }
}
```

## Correções Implementadas

### 1. Comando "roubar" e "rename" (Stickers)
- **Problema**: API antiga de stickers estava fora do ar (erro 404)
- **Solução**: Substituída pela biblioteca `wa-sticker-formatter`
- **Arquivo modificado**: `/dados/org/funcoes/functions.js`

### 2. Comando "x9visuunica" (Visualização Única)
- **Problema**: Erro ao processar mensagens de visualização única
- **Solução**: Implementado uso correto de `downloadContentFromMessage` do Baileys
- **Arquivo modificado**: `index.js` (linhas 2579-2627)

## Testando as Correções

Após instalar a dependência e reiniciar o bot:

1. **Teste o comando roubar**:
   - Marque uma figurinha
   - Digite: `!roubar NomePack/NomeAutor`

2. **Teste o comando x9visuunica**:
   - Ative o recurso: `!x9visuunica`
   - Peça para alguém enviar uma foto/vídeo em visualização única
   - O bot deve revelar automaticamente

## Observações

- Certifique-se de que todas as dependências do `package.json` estão instaladas
- Reinicie o bot após instalar a nova dependência
- Se houver erros, verifique os logs do console para mais detalhes
