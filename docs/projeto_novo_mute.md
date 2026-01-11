# 🔇 Projeto do Novo Sistema de Mute

## 📋 Análise do Sistema Atual

### ✅ O que já funciona:
1. ✅ Armazenamento individual por grupo em `./dados/grupos/{groupId}.json`
2. ✅ Compatibilidade com LID usando `areJidsEqual()`
3. ✅ Normalização de JID antes de salvar
4. ✅ Deletar mensagem do usuário mutado
5. ✅ Remover do grupo se bot for admin
6. ✅ Mensagem alternativa se bot não for admin
7. ✅ Remover da lista após banir

### ❌ O que precisa melhorar:
1. ❌ Sistema atual **remove** o usuário após primeira mensagem
2. ❌ Usuário solicitou que **apenas delete** as mensagens
3. ❌ Falta comando para listar usuários mutados
4. ❌ Falta opção de mute temporário (com tempo)
5. ❌ Falta contador de mensagens deletadas

---

## 🎯 Requisitos do Novo Sistema

### Funcionalidades Principais:

1. **Mute Permanente (Padrão)**
   - ADM usa `!mute @usuario`
   - Bot **apenas deleta** as mensagens
   - **NÃO remove** do grupo automaticamente
   - Usuário permanece mutado até ADM usar `!desmute`

2. **Desmute**
   - ADM usa `!desmute @usuario`
   - Remove da lista de mutados
   - Usuário pode enviar mensagens novamente

3. **Listar Mutados**
   - ADM usa `!listmute` ou `!mutados`
   - Mostra todos os usuários mutados do grupo
   - Mostra quantas mensagens foram deletadas de cada um

4. **Armazenamento Individual por Grupo**
   - Arquivo: `./dados/grupos/{groupId}.json`
   - Estrutura:
     ```json
     {
       "mutedUsers": {
         "5511999999999@s.whatsapp.net": {
           "mutedAt": "2025-11-08T02:00:00.000Z",
           "mutedBy": "5511888888888@s.whatsapp.net",
           "deletedMessages": 0
         }
       }
     }
     ```

5. **Deleção Automática**
   - Detecta mensagem de usuário mutado
   - Deleta a mensagem **silenciosamente**
   - Incrementa contador de mensagens deletadas
   - **NÃO** envia mensagem pública (para não poluir o grupo)
   - **NÃO** remove do grupo

6. **Validações**
   - ✅ Apenas ADMs podem usar comandos
   - ✅ Não pode mutar o bot
   - ✅ Não pode mutar o dono
   - ✅ Não pode mutar outros ADMs
   - ✅ Verificar se já está mutado
   - ✅ Verificar se existe na lista antes de desmutar

---

## 🏗️ Estrutura do Sistema

### 1. Arquivo de Dados por Grupo

**Localização:** `./dados/grupos/{groupId}.json`

**Estrutura:**
```json
{
  "mutedUsers": {
    "5511999999999@s.whatsapp.net": {
      "mutedAt": "2025-11-08T02:00:00.000Z",
      "mutedBy": "5511888888888@s.whatsapp.net",
      "deletedMessages": 0,
      "reason": "Spam" // Opcional
    }
  }
}
```

---

### 2. Funções Auxiliares

#### `loadGroupMuteData(groupId)`
Carrega dados de mute do grupo

#### `saveGroupMuteData(groupId, data)`
Salva dados de mute do grupo

#### `isMuted(groupId, userJid)`
Verifica se usuário está mutado (compatível com LID)

#### `muteUser(groupId, userJid, mutedBy, reason)`
Adiciona usuário à lista de mutados

#### `unmuteUser(groupId, userJid)`
Remove usuário da lista de mutados

#### `incrementDeletedMessages(groupId, userJid)`
Incrementa contador de mensagens deletadas

#### `getMutedUsers(groupId)`
Retorna lista de usuários mutados

---

### 3. Comandos

#### `!mute @usuario [motivo]`
- **Permissão:** Apenas ADMs
- **Ação:** Adiciona usuário à lista de mutados
- **Resposta:** Mensagem confirmando mute
- **Exemplo:** `!mute @usuario Spam`

#### `!desmute @usuario`
- **Permissão:** Apenas ADMs
- **Ação:** Remove usuário da lista de mutados
- **Resposta:** Mensagem confirmando desmute
- **Exemplo:** `!desmute @usuario`

#### `!listmute` ou `!mutados`
- **Permissão:** Apenas ADMs
- **Ação:** Lista todos os usuários mutados
- **Resposta:** Lista com informações de cada mutado
- **Exemplo:** `!listmute`

---

### 4. Verificação Automática

**Localização:** Antes do switch de comandos

**Fluxo:**
1. Verificar se é grupo
2. Verificar se não é ADM ou dono
3. Carregar dados de mute do grupo
4. Verificar se usuário está mutado (compatível com LID)
5. Se mutado:
   - Deletar mensagem **silenciosamente**
   - Incrementar contador
   - **NÃO** enviar mensagem pública
   - **NÃO** remover do grupo
   - `return` (não processar mais nada)

---

## 🎨 Mensagens do Sistema

### Mute:
```
✅ @usuario foi mutado.

🔇 Suas mensagens serão deletadas automaticamente.
📊 Motivo: [motivo ou "Não especificado"]
👤 Mutado por: @admin

Para desmutar, use: !desmute @usuario
```

### Desmute:
```
✅ @usuario foi desmutado.

✅ Pode enviar mensagens novamente.
📊 Total de mensagens deletadas: 5
```

### Lista de Mutados:
```
🔇 *USUÁRIOS MUTADOS* 🔇

Total: 3 usuários

1️⃣ @usuario1
   📅 Mutado em: 08/11/2025 02:00
   👤 Mutado por: @admin1
   📊 Mensagens deletadas: 12
   📝 Motivo: Spam

2️⃣ @usuario2
   📅 Mutado em: 07/11/2025 15:30
   👤 Mutado por: @admin2
   📊 Mensagens deletadas: 3
   📝 Motivo: Não especificado

3️⃣ @usuario3
   📅 Mutado em: 06/11/2025 10:15
   👤 Mutado por: @admin1
   📊 Mensagens deletadas: 0
   📝 Motivo: Flood
```

---

## 🔒 Validações

### Comando !mute:
1. ✅ Verificar se é grupo
2. ✅ Verificar se é ADM
3. ✅ Verificar se marcou alguém
4. ✅ Verificar se não é o bot
5. ✅ Verificar se não é o dono
6. ✅ Verificar se não é outro ADM
7. ✅ Verificar se já está mutado

### Comando !desmute:
1. ✅ Verificar se é grupo
2. ✅ Verificar se é ADM
3. ✅ Verificar se marcou alguém
4. ✅ Verificar se está mutado

### Comando !listmute:
1. ✅ Verificar se é grupo
2. ✅ Verificar se é ADM

### Verificação Automática:
1. ✅ Verificar se é grupo
2. ✅ Verificar se não é ADM ou dono
3. ✅ Verificar se está mutado (compatível com LID)

---

## 📝 Diferenças do Sistema Atual

| Aspecto | Sistema Atual | Novo Sistema |
|---------|---------------|--------------|
| Ação ao enviar mensagem | Remove do grupo | Apenas deleta mensagem |
| Mensagem pública | Sim, envia mensagem | Não, deleta silenciosamente |
| Permanência | Remove após 1 mensagem | Permanece mutado até desmute |
| Contador | Não tem | Conta mensagens deletadas |
| Lista de mutados | Não tem | Comando !listmute |
| Motivo do mute | Não tem | Opcional ao mutar |
| Informações | Básicas | Completas (data, quem mutou, etc) |

---

## 🎯 Vantagens do Novo Sistema

1. ✅ **Mais silencioso** - Não polui o grupo com mensagens
2. ✅ **Mais flexível** - Usuário permanece no grupo
3. ✅ **Mais informativo** - Contador e histórico
4. ✅ **Mais profissional** - ADMs têm controle total
5. ✅ **Compatível com LID** - Funciona com Baileys 7.0+
6. ✅ **Individual por grupo** - Cada grupo tem sua lista
7. ✅ **Persistente** - Dados salvos em arquivo

---

## 🚀 Implementação

### Ordem de Implementação:

1. ✅ Criar funções auxiliares
2. ✅ Implementar comando !mute
3. ✅ Implementar comando !desmute
4. ✅ Implementar comando !listmute
5. ✅ Implementar verificação automática
6. ✅ Testar e validar

---

## 📊 Estrutura de Arquivos

```
./dados/grupos/
├── 5511999999999-1234567890@g.us.json
│   └── { "mutedUsers": { ... } }
├── 5511888888888-0987654321@g.us.json
│   └── { "mutedUsers": { ... } }
└── ...
```

---

## ✅ Checklist de Implementação

- [ ] Criar funções auxiliares de mute
- [ ] Implementar comando !mute
- [ ] Implementar comando !desmute
- [ ] Implementar comando !listmute
- [ ] Implementar verificação automática silenciosa
- [ ] Remover código antigo (mensagem pública e remoção)
- [ ] Testar com LID
- [ ] Testar com PN
- [ ] Validar sintaxe
- [ ] Documentar

---

**Status:** 📝 Projeto Completo - Pronto para Implementação
