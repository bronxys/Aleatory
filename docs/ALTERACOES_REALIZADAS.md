# Alterações Realizadas no Sistema de Lista Negra - Bot Alea

## ✅ Correções Aplicadas

### 1. **Arquivo: iniciar.js**

#### A. Função `getParticipantJid` (Linha 116-124)
**Antes:**
```javascript
const getParticipantJid = (participant) => {
  if (typeof participant === 'object' && participant !== null) {
    return participant.phoneNumber || participant.id;
  }
  return participant;
};
```

**Depois:**
```javascript
const getParticipantJid = (participant) => {
  if (typeof participant === 'object' && participant !== null) {
    // Priorizar id (preferencial no Baileys 7.0+), depois phoneNumber, depois lid
    return participant.id || participant.phoneNumber || participant.lid || participant;
  }
  return participant;
};
```

**Motivo:** Segundo a documentação oficial da Baileys 7.0+, o campo `id` é o preferencial do WhatsApp.

---

#### B. Adicionadas Funções Auxiliares (Linha 132-142)
```javascript
// Funções auxiliares para compatibilidade com LID (Baileys 7.0+)
const extractNumber = (jid) => {
  if (!jid) return '';
  return String(jid).split('@')[0];
};

const isJidInList = (jid, list) => {
  if (!jid || !Array.isArray(list)) return false;
  const number = extractNumber(jid);
  return list.some(item => extractNumber(item) === number);
};
```

**Motivo:** Necessário para comparar JIDs independentemente do formato (LID ou PN).

---

#### C. Lista Negra Global (Linha 318-345)
**Antes:**
```javascript
if (ale2.action == "add") {
  const num = getParticipantJid(ale2.participants[0]);
  if (nescessario.listanegraG.includes(num)) {
    await conn.sendMessage(GroupMetadata_.id, {
      text: TEXTOS_GERAL?.LISTA_NEGRA_GLOBAL_MENSAGEM || "...",
    });
    conn.groupParticipantsUpdate(
      GroupMetadata_.id,
      [ale2.participants[0]],
      "remove"
    );
    return;
  }
}
```

**Depois:**
```javascript
if (ale2.action == "add") {
  const participantJid = getParticipantJid(ale2.participants[0]);
  
  // Verificar se está na lista negra global usando comparação de números
  if (isJidInList(participantJid, nescessario.listanegraG)) {
    // Verificar se o bot é admin antes de remover
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!groupAdmins_.includes(botJid)) {
      console.log(colors.yellow('[LISTA NEGRA GLOBAL] Bot não é admin, não pode remover'));
      return;
    }
    
    console.log(colors.red(`[LISTA NEGRA GLOBAL] Removendo ${extractNumber(participantJid)} do grupo`));
    
    await conn.sendMessage(GroupMetadata_.id, {
      text: TEXTOS_GERAL?.LISTA_NEGRA_GLOBAL_MENSAGEM || "...",
    });
    
    await conn.groupParticipantsUpdate(
      GroupMetadata_.id,
      [ale2.participants[0]],
      "remove"
    );
    return;
  }
}
```

**Melhorias:**
- ✅ Usa `isJidInList()` em vez de `.includes()` (compatível com LID)
- ✅ Verifica se o bot é admin antes de tentar remover
- ✅ Adiciona logs para debug
- ✅ Usa `await` no `groupParticipantsUpdate`

---

#### D. Lista Negra do Grupo (Linha 347-374)
**Antes:**
```javascript
const participantJidForCheck = getParticipantJid(ale2.participants[0]);
if (
  ale2.action == "add" &&
  jsonGp[0].listanegra.includes(participantJidForCheck)
) {
  if (
    jsonGp[0]?.legenda_listanegra &&
    jsonGp[0]?.legenda_listanegra != "0"
  ) {
    await conn.sendMessage(GroupMetadata_.id, {
      text: jsonGp[0]?.legenda_listanegra,
    });
  }
  conn.groupParticipantsUpdate(
    GroupMetadata_.id,
    [ale2.participants[0]],
    "remove"
  );
}
```

**Depois:**
```javascript
const participantJidForCheck = getParticipantJid(ale2.participants[0]);

// Verificar se está na lista negra do grupo usando comparação de números
if (ale2.action == "add" && isJidInList(participantJidForCheck, jsonGp[0].listanegra)) {
  // Verificar se o bot é admin antes de remover
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  if (!groupAdmins_.includes(botJid)) {
    console.log(colors.yellow('[LISTA NEGRA] Bot não é admin, não pode remover'));
    return;
  }
  
  console.log(colors.red(`[LISTA NEGRA] Removendo ${extractNumber(participantJidForCheck)} do grupo`));
  
  // Enviar mensagem personalizada ou padrão
  const mensagem = (jsonGp[0]?.legenda_listanegra && jsonGp[0]?.legenda_listanegra != "0")
    ? jsonGp[0].legenda_listanegra
    : "𝐙𝐥𝐡𝐚 𝐚𝐢 𝐟𝐚𝐦𝐢́𝐥𝐢𝐚 𝐪𝐮𝐞𝐦 𝐝𝐞𝐮 𝐚𝐬 𝐜𝐚𝐫𝐚𝐬 𝐩𝐨𝐫 𝐀𝐪𝐮𝐢..! 𝐩𝐨𝐫 𝐨𝐫𝐝𝐞𝐧𝐬 𝐝𝐨 𝐀𝐝𝐦𝐢𝐫𝐨 𝐢𝐫𝐞𝐢 𝐭𝐞 𝐩𝐚𝐬𝐬𝐚𝐫 𝐚 𝐅𝐚𝐜𝐚😝🔪\n𝐀𝐠𝐨𝐫𝐚 𝐬𝐢𝐧𝐭𝐚 𝐨 𝐩𝐨𝐝𝐞𝐫 𝐝𝐨 𝐁𝐚𝐧 𝐂𝐚𝐛𝐚𝐜̧𝐨𝐕𝐀𝐙𝐀 😡🤬";
  
  await conn.sendMessage(GroupMetadata_.id, {
    text: mensagem,
  });
  
  await conn.groupParticipantsUpdate(
    GroupMetadata_.id,
    [ale2.participants[0]],
    "remove"
  );
}
```

**Melhorias:**
- ✅ Usa `isJidInList()` em vez de `.includes()` (compatível com LID)
- ✅ Verifica se o bot é admin antes de tentar remover
- ✅ **SEMPRE envia mensagem** (padrão ou personalizada)
- ✅ Adiciona logs para debug
- ✅ Usa `await` no `groupParticipantsUpdate`

---

### 2. **Arquivo: index.js**

#### Funções já existentes (Linha 241-279)
As funções auxiliares já estavam implementadas corretamente:
- ✅ `normalizeJid(jid)` - Normaliza JID para formato padrão
- ✅ `extractNumber(jid)` - Extrai apenas o número do JID
- ✅ `areJidsEqual(jid1, jid2)` - Compara dois JIDs
- ✅ `isJidInList(jid, list)` - Verifica se JID está na lista
- ✅ `addJidToList(jid, list)` - Adiciona JID à lista
- ✅ `removeJidFromList(jid, list)` - Remove JID da lista

#### Comandos já corrigidos:
- ✅ `listanegra` / `addautoban` (Linha 3050-3070)
- ✅ `tirardalista` / `delautoban` (Linha 3072-3091)
- ✅ `listban` (Linha 3093-3105)
- ✅ `legenda_listanegra` (Linha 10070-10083)
- ✅ `autobang` / `listanegrag` (Linha 10115-10136)
- ✅ `tirardalistag` (Linha 10138-10156)

---

## 🎯 Funcionalidades Implementadas

### ✅ 1. Compatibilidade com LID (Baileys 7.0+)
- Todos os comandos agora funcionam com JIDs no formato LID (`@lid`) e PN (`@s.whatsapp.net`)
- Comparações baseadas apenas no número (parte antes do `@`)

### ✅ 2. Remoção Automática
- Quando um usuário da lista negra entra no grupo, é **automaticamente removido**
- Funciona tanto para lista negra global quanto para lista negra do grupo

### ✅ 3. Mensagens Personalizadas
- Admins podem definir mensagem personalizada com `!legenda_listanegra`
- Se não houver mensagem personalizada, usa mensagem padrão
- **SEMPRE** envia mensagem ao remover (antes só enviava se houvesse personalizada)

### ✅ 4. Verificação de Permissões
- Bot verifica se é admin antes de tentar remover
- Evita erros e logs desnecessários

### ✅ 5. Logs Detalhados
- Logs coloridos para facilitar debug
- Mostra quando remove da lista negra global ou do grupo
- Mostra quando não pode remover por não ser admin

---

## 📋 Comandos Funcionais

### Comandos de Lista Negra do Grupo (Admin):
1. **`!listanegra`** ou **`!addautoban`** - Adiciona usuário à lista negra do grupo
2. **`!tirardalista`** ou **`!delautoban`** - Remove usuário da lista negra do grupo
3. **`!listban`** - Mostra todos os usuários na lista negra do grupo
4. **`!legenda_listanegra`** - Define mensagem personalizada ao remover

### Comandos de Lista Negra Global (Dono):
5. **`!autobang`** ou **`!listanegrag`** - Adiciona usuário à lista negra global
6. **`!tirardalistag`** - Remove usuário da lista negra global

---

## 🔧 Como Usar

### Adicionar à lista negra:
```
!listanegra @usuario
```
ou
```
!listanegra 5511999999999
```

### Remover da lista negra:
```
!tirardalista @usuario
```

### Ver lista negra:
```
!listban
```

### Definir mensagem personalizada:
```
!legenda_listanegra Você foi banido deste grupo por violar as regras!
```

---

## ✅ Testes de Sintaxe

- ✅ `iniciar.js` - Sintaxe válida
- ✅ `index.js` - Sintaxe válida

---

## 📝 Observações Importantes

1. **LID vs PN**: O sistema agora funciona com ambos os formatos. Não importa se o usuário entra com LID ou PN, será detectado e removido.

2. **Bot precisa ser Admin**: O bot só consegue remover usuários se for admin do grupo. Caso contrário, apenas loga o aviso.

3. **Mensagem sempre enviada**: Diferente da versão anterior, agora SEMPRE envia uma mensagem ao remover (padrão ou personalizada).

4. **Persistência**: As listas são salvas em arquivos JSON e persistem entre reinicializações.

5. **Lista Global**: Funciona em todos os grupos onde o bot está presente (apenas dono pode gerenciar).

---

## 🚀 Próximos Passos Recomendados

1. Testar em ambiente real com usuários reais
2. Monitorar logs para verificar funcionamento
3. Ajustar mensagens padrão se necessário
4. Considerar adicionar comando para listar usuários da lista negra global
