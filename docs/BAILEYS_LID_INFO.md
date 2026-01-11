# Informações sobre LID na Baileys 7.0+

## O que é LID?
- **LID** = Local Identifier (Identificador Local)
- Sistema implementado pelo WhatsApp para garantir anonimato em grupos grandes
- Cada usuário tem um LID único na plataforma (NÃO é único por grupo)
- **PN** = Phone Number (formato antigo: `user@s.whatsapp.net`)

## Principais mudanças:

### 1. Formatos de JID
- **Formato antigo (PN)**: `5511999999999@s.whatsapp.net`
- **Formato novo (LID)**: `1234567890@lid`
- Ambos são JIDs válidos e podem ser usados para enviar mensagens

### 2. Conversão entre LID e PN
- WhatsApp permite obter LID a partir de PN (via `onWhatsApp()`)
- **NÃO é possível** obter PN a partir de LID diretamente
- A Baileys mantém um mapeamento interno: `sock.signalRepository.lidMapping`

### 3. Métodos disponíveis para mapeamento:
```javascript
const store = sock.signalRepository.lidMapping;
// Métodos disponíveis:
// - storeLIDPNMapping(lid, pn)
// - storeLIDPNMappings(mappings)
// - getLIDForPN(pn)
// - getLIDsForPNs(pns)
// - getPNForLID(lid)
```

### 4. Eventos de participantes em grupos
- `groupParticipantsUpdate` pode retornar LIDs ou PNs
- Necessário normalizar JIDs para comparação
- Comparar apenas o número (parte antes do @)

### 5. Campos alternativos em mensagens (6.8.0+)
- `remoteJidAlt` -> para DMs
- `participantAlt` -> para grupos
- Se `participant` é LID, `participantAlt` será PN (e vice-versa)

### 6. GroupMetadata
- Cada campo de ID agora tem versão LID e PN:
  - `owner` e `ownerPn`
  - `descOwner` e `descOwnerPn`
- Array `participants` agora usa objeto Contact com campo `id` (preferencial)

### 7. Tipo Contact
- Não tem mais campos `jid`/`lid` separados
- Tem campo `id` (preferencial do WhatsApp)
- Tem `phoneNumber` OU `lid` dependendo do formato do `id`

## Recomendações para implementação:

### 1. Normalização de JID
```javascript
function normalizeJid(jid) {
  if (!jid) return jid;
  // Extrair apenas o número
  const number = jid.split('@')[0];
  // Retornar no formato PN padrão
  return `${number}@s.whatsapp.net`;
}
```

### 2. Comparação de JIDs
```javascript
function areJidsEqual(jid1, jid2) {
  if (!jid1 || !jid2) return false;
  // Comparar apenas os números
  return jid1.split('@')[0] === jid2.split('@')[0];
}
```

### 3. Verificar se JID está em lista
```javascript
function isJidInList(jid, list) {
  if (!jid || !Array.isArray(list)) return false;
  const number = jid.split('@')[0];
  return list.some(item => item.split('@')[0] === number);
}
```

### 4. Extrair participante de evento
```javascript
function getParticipantJid(participant) {
  // Se participant é objeto (Baileys 7.0+)
  if (typeof participant === 'object' && participant !== null) {
    // Priorizar id, depois phoneNumber, depois lid
    return participant.id || participant.phoneNumber || participant.lid || participant;
  }
  // Se é string, retornar direto
  return participant;
}
```

## Importante:
- **Migrar para LIDs** é a recomendação oficial
- PNs são menos confiáveis agora
- Sempre normalizar JIDs antes de comparar ou armazenar
- Usar apenas o número (antes do @) para comparações


## Comportamento do groupParticipantsUpdate

### Problema identificado (Issue #1842):
- O evento `groupParticipantsUpdate` pode retornar LIDs no campo `jid`
- Exemplo de retorno:
```json
{
  "status": "200",
  "jid": "1234567890@lid",
  "content": {
    "tag": "participant",
    "attrs": {
      "jid": "1234567890@lid",
      "type": "admin",
      "phone_number": "5511999999999@s.whatsapp.net"
    }
  }
}
```

### Solução:
- Verificar se existe `phone_number` nos attrs
- Se existir, usar `phone_number` como JID principal
- Caso contrário, usar o `jid` retornado
- **SEMPRE** normalizar para comparação (extrair apenas número)

### Implementação recomendada:
```javascript
// Ao receber evento de participante
sock.ev.on('group-participants.update', async (event) => {
  const { id, participants, action } = event;
  
  for (const participant of participants) {
    // Extrair JID do participante
    let participantJid = participant;
    
    // Se participant é objeto, extrair corretamente
    if (typeof participant === 'object') {
      participantJid = participant.id || participant.phoneNumber || participant.lid || participant;
    }
    
    // Normalizar para comparação
    const participantNumber = participantJid.split('@')[0];
    
    // Verificar na lista negra comparando apenas números
    const isBlacklisted = blacklist.some(item => item.split('@')[0] === participantNumber);
    
    if (isBlacklisted && action === 'add') {
      // Remover do grupo
      await sock.groupParticipantsUpdate(id, [participantJid], 'remove');
    }
  }
});
```
