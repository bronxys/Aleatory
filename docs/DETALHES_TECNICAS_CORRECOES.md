# Correções para Boas-Vindas - Baileys 7.0.0-rc.5

## Problema Identificado

O código atual tenta acessar `ale2.participants[0]` como uma string, mas na versão 7.0.0-rc.5 (e versões posteriores), os participantes são objetos com a estrutura:

```javascript
{
  "id": "xxxxxxxxxxxxxxxx@lid",
  "phoneNumber": "xxxxxxxxxxxxx@s.whatsapp.net",
  "admin": null
}
```

## Correções Necessárias

### 1. Função auxiliar para extrair JID do participante

Adicionar após a linha 113 (após as funções bye2):

```javascript
// Função auxiliar para extrair o JID correto do participante (compatível com Baileys 7.0+)
const getParticipantJid = (participant) => {
  // Se participant é um objeto (Baileys 7.0+)
  if (typeof participant === 'object' && participant !== null) {
    // Priorizar phoneNumber se disponível, senão usar id
    return participant.phoneNumber || participant.id;
  }
  // Se participant é uma string (versões antigas)
  return participant;
};

// Função auxiliar para extrair apenas o número (sem @s.whatsapp.net ou @lid)
const getParticipantNumber = (participant) => {
  const jid = getParticipantJid(participant);
  return String(jid).split('@')[0];
};
```

### 2. Correção na linha 361 - profilePictureUrl

**Linha atual (361):**
```javascript
ppimg = await conn.profilePictureUrl(
  `${String(ale2.participants[0]).split("@")[0]}@c.us`,
  "image"
);
```

**Correção:**
```javascript
const participantJid = getParticipantJid(ale2.participants[0]);
ppimg = await conn.profilePictureUrl(
  participantJid,
  "image"
);
```

### 3. Correção na linha 379 - Verificação antifake

**Linha atual (379):**
```javascript
if (jsonGp[0].antifake == true && !String(ale2.participants[0]).startsWith("55"))
  return;
```

**Correção:**
```javascript
const participantNumber = getParticipantNumber(ale2.participants[0]);
if (jsonGp[0].antifake == true && !participantNumber.startsWith("55"))
  return;
```

### 4. Correção na linha 393 - Substituição #numerodele#

**Linha atual (388-402):**
```javascript
if (isWelcomed) {
  teks = jsonGp[0].wellcome[0].legendabv
    .replace("#hora#", time)
    .replace("#nomedogp#", GroupMetadata_.subject)
    .replace(
      "#numerodele#",
      "@" + String(ale2.participants[0]).split("@")[0]
    )
    .replace("#numerobot#", conn.user.id)
    .replace(
      "#prefix#",
      jsonGp[0].multiprefix == true
        ? jsonGp[0].prefixos[0]
        : setting.prefix
    )
    .replace("#descrição#", groupDesc);
}
```

**Correção:**
```javascript
if (isWelcomed) {
  const participantNumber = getParticipantNumber(ale2.participants[0]);
  teks = jsonGp[0].wellcome[0].legendabv
    .replace("#hora#", time)
    .replace("#nomedogp#", GroupMetadata_.subject)
    .replace("#numerodele#", "@" + participantNumber)
    .replace("#numerobot#", conn.user.id)
    .replace(
      "#prefix#",
      jsonGp[0].multiprefix == true
        ? jsonGp[0].prefixos[0]
        : setting.prefix
    )
    .replace("#descrição#", groupDesc);
}
```

### 5. Correção na linha 404-407 - Função welcome

**Linha atual:**
```javascript
} else {
  teks = welcome(
    String(ale2.participants[0]).split("@")[0],
    GroupMetadata_.subject
  );
}
```

**Correção:**
```javascript
} else {
  const participantNumber = getParticipantNumber(ale2.participants[0]);
  teks = welcome(participantNumber, GroupMetadata_.subject);
}
```

### 6. Correção na linha 410-414 - sendMessage com mentions

**Linha atual:**
```javascript
conn.sendMessage(GroupMetadata_.id, {
  image: { url: `${ppimg}` },
  mentions: ale2.participants,
  caption: teks,
});
```

**Correção:**
```javascript
// Extrair JIDs para mentions (compatível com objetos e strings)
const mentionJids = ale2.participants.map(p => getParticipantJid(p));

conn.sendMessage(GroupMetadata_.id, {
  image: { url: `${ppimg}` },
  mentions: mentionJids,
  caption: teks,
});
```

### 7. Correção na linha 417-433 - Mensagem de saída (remove)

**Linha atual:**
```javascript
} else if (ale2.action === "remove") {
  mem = String(ale2.participants[0]);

  if (isByed) {
    teks = jsonGp[0].wellcome[0].legendasaiu
      .replace("#hora#", time)
      .replace("#nomedogp#", GroupMetadata_.subject)
      .replace("#numerodele#", String(ale2.participants[0]).split("@")[0])
      .replace("#numerobot#", conn.user.id)
      .replace(
        "#prefix#",
        jsonGp[0].multiprefix == true
          ? jsonGp[0].prefixos[0]
          : setting.prefix
      )
      .replace("#descrição#", groupDesc);
  } else {
    teks = bye(String(ale2.participants[0]).split("@")[0]);
  }
  conn.sendMessage(GroupMetadata_.id, {
    image: { url: ppimg },
    caption: teks,
    mentions: ale2.participants,
  });
}
```

**Correção:**
```javascript
} else if (ale2.action === "remove") {
  const participantNumber = getParticipantNumber(ale2.participants[0]);
  const participantJid = getParticipantJid(ale2.participants[0]);

  if (isByed) {
    teks = jsonGp[0].wellcome[0].legendasaiu
      .replace("#hora#", time)
      .replace("#nomedogp#", GroupMetadata_.subject)
      .replace("#numerodele#", participantNumber)
      .replace("#numerobot#", conn.user.id)
      .replace(
        "#prefix#",
        jsonGp[0].multiprefix == true
          ? jsonGp[0].prefixos[0]
          : setting.prefix
      )
      .replace("#descrição#", groupDesc);
  } else {
    teks = bye(participantNumber);
  }
  
  const mentionJids = ale2.participants.map(p => getParticipantJid(p));
  
  conn.sendMessage(GroupMetadata_.id, {
    image: { url: ppimg },
    caption: teks,
    mentions: mentionJids,
  });
}
```

### 8. Correções similares para bemvindo2 (linhas 443-497)

**Aplicar as mesmas correções para o bloco bemvindo2:**

- Linha 448-462: Substituir `String(ale2.participants[0]).split("@")[0]` por `getParticipantNumber(ale2.participants[0])`
- Linha 464-467: Corrigir função welcome2
- Linha 469-472: Corrigir mentions
- Linha 474-496: Corrigir mensagem de saída do bemvindo2

### 9. Correção na linha 282 - Verificação do bot

**Linha atual:**
```javascript
if (String(ale2.participants[0]).startsWith(conn.user.id.split(":")[0])) return;
```

**Correção:**
```javascript
const participantJid = getParticipantJid(ale2.participants[0]);
if (String(participantJid).startsWith(conn.user.id.split(":")[0])) return;
```

### 10. Correção na linha 289-290 - Lista negra global

**Linha atual:**
```javascript
if (ale2.action == "add") {
  num = String(ale2.participants[0]);
  if (nescessario.listanegraG.includes(num)) {
```

**Correção:**
```javascript
if (ale2.action == "add") {
  const participantJid = getParticipantJid(ale2.participants[0]);
  if (nescessario.listanegraG.includes(participantJid)) {
```

## Resumo das Mudanças

1. ✅ Adicionar funções auxiliares `getParticipantJid()` e `getParticipantNumber()`
2. ✅ Substituir todas as ocorrências de `String(ale2.participants[0]).split("@")[0]` por `getParticipantNumber(ale2.participants[0])`
3. ✅ Substituir todas as ocorrências de `String(ale2.participants[0])` por `getParticipantJid(ale2.participants[0])`
4. ✅ Corrigir o array `mentions` para usar `ale2.participants.map(p => getParticipantJid(p))`
5. ✅ Manter a lógica de verificação de configurações (bemvindo1, bemvindo2, legendas)

Essas correções garantem compatibilidade com Baileys 7.0.0-rc.5 e versões posteriores, mantendo a funcionalidade de boas-vindas e saída funcionando corretamente.
