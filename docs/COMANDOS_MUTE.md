# Comandos de Mute/Desmute - Bot Alea

## Data: 07 de Novembro de 2025

---

## Novos Comandos Adicionados

### 1. Comando `mute` / `mutar`

**Descrição**: Muta um usuário no grupo. Se o usuário mutado enviar qualquer mensagem, será banido automaticamente.

**Uso**:
```
!mute @usuario
!mutar @usuario
```

**Ou marque a mensagem do usuário:**
```
!mute (marcando mensagem)
!mutar (marcando mensagem)
```

**Requisitos**:
- ✅ Apenas em grupos
- ✅ Apenas administradores podem usar
- ✅ Bot precisa ser administrador
- ❌ Não pode mutar o bot
- ❌ Não pode mutar o dono do bot

**Resultado**:
```
✅ @usuario foi mutado.

⚠️ Se enviar mensagens, será banido automaticamente.
```

---

### 2. Comando `desmute` / `desmutar` / `unmute`

**Descrição**: Remove o mute de um usuário, permitindo que ele envie mensagens novamente.

**Uso**:
```
!desmute @usuario
!desmutar @usuario
!unmute @usuario
```

**Ou marque a mensagem do usuário:**
```
!desmute (marcando mensagem)
```

**Requisitos**:
- ✅ Apenas em grupos
- ✅ Apenas administradores podem usar

**Resultado**:
```
✅ @usuario foi desmutado e pode enviar mensagens novamente.
```

**Se o usuário não estiver mutado:**
```
❌ Este usuário não está mutado.
```

---

## Como Funciona

### Sistema de Banimento Automático

1. **Administrador muta um usuário**
   - O usuário é adicionado à lista de mutados do grupo
   - Informação salva em `/dados/grupos/{grupo_id}.json`

2. **Usuário mutado tenta enviar mensagem**
   - Bot detecta automaticamente
   - Envia mensagem de aviso no grupo
   - **Bane o usuário automaticamente**
   - Remove da lista de mutados

3. **Mensagem de banimento:**
   ```
   ⚠️ @usuario estava mutado e foi banido por enviar mensagens.
   ```

---

## Estrutura de Dados

Os usuários mutados são salvos no arquivo JSON do grupo:

**Arquivo**: `/dados/grupos/{grupo_id}.json`

**Estrutura**:
```json
{
  "mutedUsers": {
    "5511999999999@s.whatsapp.net": true,
    "5511888888888@s.whatsapp.net": true
  }
}
```

---

## Exceções

### Quem NÃO pode ser mutado:
- ❌ O próprio bot
- ❌ O dono do bot
- ❌ (Usuários mutados não incluem admins se tentarem enviar mensagem)

### Quem NÃO é afetado pelo auto-ban:
- ✅ Administradores do grupo (podem enviar mensagens mesmo mutados)
- ✅ Dono do bot (pode enviar mensagens mesmo mutado)

---

## Exemplos de Uso

### Exemplo 1: Mutar usuário problemático
```
Admin: !mute @usuario_chato
Bot: ✅ @usuario_chato foi mutado.
     ⚠️ Se enviar mensagens, será banido automaticamente.

[usuario_chato tenta enviar mensagem]

Bot: ⚠️ @usuario_chato estava mutado e foi banido por enviar mensagens.
[usuario_chato é removido do grupo]
```

### Exemplo 2: Desmutar usuário
```
Admin: !desmute @usuario_chato
Bot: ✅ @usuario_chato foi desmutado e pode enviar mensagens novamente.

[usuario_chato pode enviar mensagens normalmente]
```

### Exemplo 3: Tentar desmutar usuário não mutado
```
Admin: !desmute @usuario_normal
Bot: ❌ Este usuário não está mutado.
```

---

## Fluxo de Funcionamento

```
┌─────────────────────────────────────────────────────────────┐
│                    COMANDO !mute @usuario                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Verificar permissões  │
                │ - É grupo?            │
                │ - É admin?            │
                │ - Bot é admin?        │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Adicionar à lista de  │
                │ mutados no JSON       │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Enviar confirmação    │
                └───────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  USUÁRIO MUTADO ENVIA MENSAGEM        │
        └───────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Bot detecta mensagem  │
                │ de usuário mutado     │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Enviar aviso de ban   │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Banir usuário         │
                │ (remover do grupo)    │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Remover da lista de   │
                │ mutados               │
                └───────────────────────┘
```

---

## Testes Recomendados

### Teste 1: Mutar e desmutar
```bash
1. !mute @usuario
2. Verificar mensagem de confirmação
3. !desmute @usuario
4. Verificar mensagem de desmute
```

### Teste 2: Auto-ban ao enviar mensagem
```bash
1. !mute @usuario
2. Fazer o usuário enviar uma mensagem
3. Verificar se foi banido automaticamente
```

### Teste 3: Proteção de admins
```bash
1. !mute @admin
2. Admin envia mensagem
3. Verificar que NÃO foi banido
```

---

## Arquivos Modificados

### index.js
- **Linha 2907-2937**: Verificação de usuários mutados (antes do switch)
- **Linha 3222-3258**: Comando `mute` / `mutar`
- **Linha 3260-3294**: Comando `desmute` / `desmutar` / `unmute`

---

## Compatibilidade

| Funcionalidade | Status |
|----------------|--------|
| Mute em grupos | ✅ |
| Desmute em grupos | ✅ |
| Auto-ban ao enviar mensagem | ✅ |
| Proteção de admins | ✅ |
| Proteção do dono | ✅ |
| Proteção do bot | ✅ |
| Persistência de dados | ✅ |

---

**Sistema de mute/desmute implementado com sucesso!** 🎉
