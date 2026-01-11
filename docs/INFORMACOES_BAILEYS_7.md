# Informações Importantes - Baileys 7.0.0

## Mudanças Principais

### 1. Sistema LID (Local Identifier)
- WhatsApp agora usa LIDs em vez de apenas números de telefone (PN)
- LID é único para cada usuário (não por grupo)
- Formato antigo: `user@s.whatsapp.net` (PN)
- Novo formato: LID
- **Importante**: Ambos LID e PN são JIDs válidos

### 2. Mudanças no Contact Type
- Não há mais campos `jid`/`lid` separados
- Agora existe um campo `id` (preferido pelo WhatsApp)
- Campos: `id`, `phoneNumber` e `lid`
- Se `id` é LID, então `phoneNumber` está presente, e vice-versa
- **IMPORTANTE**: Essas mudanças afetam a propriedade `participants` dos grupos

### 3. Mudanças no GroupMetadata
- Cada ID type agora é LID e associado com tipo PN
- Exemplos: `owner` e `ownerPn`, `descOwner` e `descOwnerPn`

### 4. Mudanças no MessageKey
- Novos campos:
  - `remoteJidAlt` -> para DMs
  - `participantAlt` -> para Grupos e outros contextos
- Se participant é LID, o Alt será PN

### 5. Eventos
- Novo evento: `lid-mapping.update` - retorna mapeamento LID/PN quando encontrado
- Função `isJidUser` foi removida e substituída por `isPnUser`

### 6. ACKs
- **IMPORTANTE**: Não enviamos mais ACKs em entrega bem-sucedida de mensagens
- WhatsApp parece estar banindo usuários por isso

### 7. ESM (ECMAScript Modules)
- Baileys 6.8.0+ usa ESM em vez de CommonJS
- Não há mais `makeWASocket.default`
- Usar `import` em vez de `require()`

## Possíveis Problemas com Boas-Vindas

### Problema Identificado:
O evento `group-participants.update` pode estar emitindo dados corrompidos de participantes na v7.x (issue #1911)

### Solução Potencial:
1. Verificar se `ale2.participants[0]` está no formato correto
2. Lidar com LIDs e PNs adequadamente
3. Usar `conn.profilePictureUrl()` com o formato correto de JID
4. Garantir que mentions use o formato correto

## Formato Correto para Participantes
- Para obter foto de perfil: usar `@c.us` ou `@s.whatsapp.net`
- Para mentions: usar o array de participantes diretamente
- Verificar se o participante é LID ou PN antes de processar


## Issue #1911 - Participantes Corrompidos (RESOLVIDA)

### Problema:
- Na versão 7.0.0-rc.5, o evento `group-participants.update` emitia participantes como "[object Object]" em vez de objetos válidos
- Isso quebrava toda a lógica de boas-vindas e saída

### Causa:
- Bug na versão 7.0.0-rc.5 que foi corrigido na branch master

### Solução:
- **IMPORTANTE**: O problema foi resolvido na branch master do Baileys
- Se estiver usando 7.0.0-rc.5, considerar atualizar para versão mais recente (rc.6 ou master)
- O formato correto dos participantes agora é:
```json
{
  "id": "xxxxxxxxx@g.us",
  "author": "xxxxxxxx@lid",
  "participants": [
    {
      "id": "xxxxxxxxxxxxxxxx@lid",
      "phoneNumber": "xxxxxxxxxxxxx@s.whatsapp.net",
      "admin": null
    }
  ],
  "action": "remove"
}
```

### Implicações para o Bot:
- O código atual pode estar tentando acessar `ale2.participants[0]` como string
- Na versão corrigida, `ale2.participants[0]` é um objeto com `id` e `phoneNumber`
- Precisa adaptar o código para lidar com o novo formato de objeto
