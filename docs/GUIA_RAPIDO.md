# 🚀 Guia Rápido - Sistema de Lista Negra Corrigido

## 📦 Instalação

1. **Extrair o arquivo ZIP:**
   ```bash
   unzip Alea_CORRIGIDO_ListaNegra.zip
   cd Alea_Limpo
   ```

2. **Instalar dependências (se ainda não instalou):**
   ```bash
   npm install
   ```

3. **Iniciar o bot:**
   ```bash
   npm start
   ```

---

## 🎯 Comandos Disponíveis

### 📋 Lista Negra do Grupo (Requer Admin)

#### ➕ Adicionar à lista negra
```
!listanegra @usuario
!addautoban 5511999999999
```
- Adiciona usuário à lista negra do grupo
- Se o usuário entrar novamente, será removido automaticamente

#### ➖ Remover da lista negra
```
!tirardalista @usuario
!delautoban 5511999999999
```
- Remove usuário da lista negra do grupo
- Usuário poderá entrar normalmente

#### 📜 Ver lista negra
```
!listban
```
- Mostra todos os usuários na lista negra do grupo

#### ✏️ Personalizar mensagem
```
!legenda_listanegra Você foi banido por violar as regras!
```
- Define mensagem personalizada ao remover usuário
- Se não definir, usa mensagem padrão

---

### 🌍 Lista Negra Global (Apenas Dono)

#### ➕ Adicionar à lista global
```
!autobang @usuario
!listanegrag 5511999999999
```
- Adiciona à lista negra em **TODOS** os grupos
- Usuário será removido automaticamente de qualquer grupo

#### ➖ Remover da lista global
```
!tirardalistag @usuario
```
- Remove da lista negra global
- Usuário poderá entrar em qualquer grupo

---

## ✨ Novidades e Melhorias

### ✅ Compatibilidade Total com Baileys 7.0+
- Funciona com formato LID (`@lid`) e PN (`@s.whatsapp.net`)
- Não importa o formato, o sistema detecta corretamente

### ✅ Remoção Automática 100% Funcional
- Quando usuário banido entra, é removido **instantaneamente**
- Envia mensagem personalizada ou padrão
- Funciona para lista do grupo e lista global

### ✅ Verificação de Permissões
- Bot verifica se é admin antes de tentar remover
- Evita erros e problemas de permissão

### ✅ Mensagens Sempre Enviadas
- **Antes:** Só enviava se tivesse mensagem personalizada
- **Agora:** Sempre envia (personalizada ou padrão)

### ✅ Logs Detalhados
- Logs coloridos para facilitar debug
- Mostra exatamente o que está acontecendo

---

## 🔧 Exemplos de Uso

### Cenário 1: Banir usuário problemático
```
Admin: !listanegra @usuario_problema
Bot: 𝘗𝘰𝘳 𝘰𝘳𝘥𝘦𝘯𝘴 𝘥𝘰 𝘼𝘥𝘮𝘪𝘳𝘰 𝘦𝘶 𝘢𝘥𝘪𝘤𝘪𝘰𝘯𝘦𝘪 𝘦𝘴𝘵𝘦 𝘪𝘯𝘶́𝘵𝘪𝘭 𝘯𝘢 𝘭𝘪𝘴𝘵𝘢!

[Usuário tenta entrar novamente]
Bot: 𝙊𝙡𝙝𝙖 𝙖𝙞 𝙛𝙖𝙢𝙞́𝙡𝙞𝙖 𝙦𝙪𝙚𝙢 𝙙𝙚𝙪 𝙖𝙨 𝙘𝙖𝙧𝙖𝙨...
[Usuário é removido automaticamente]
```

### Cenário 2: Personalizar mensagem de ban
```
Admin: !legenda_listanegra ⚠️ Você foi banido por spam! Não tente entrar novamente.
Bot: *Mensagem de remoção de usuários que se encontra na lista negra definida com sucesso!*

[Próximo banido que entrar verá a mensagem personalizada]
```

### Cenário 3: Ver quem está banido
```
Admin: !listban
Bot: *Números que vou moer na porrada se voltar 😡:*
➞ *5511999999999*
➞ *5511888888888*
*Esses ai vou descer meu martelo do ban 🥵*
```

### Cenário 4: Perdoar usuário
```
Admin: !tirardalista @usuario
Bot: 𝘗𝘰𝘳 𝘰𝘳𝘥𝘦𝘯𝘴 𝘥𝘰 𝘼𝘥𝘮𝘪𝘳𝘰 𝘦𝘶 𝘵𝘪𝘳𝘦𝘪 𝘦𝘴𝘴𝘦 𝘧𝘪 𝘥𝘦 𝘳𝘢𝘱𝘢𝘳𝘪𝘨𝘢 𝘥𝘢 𝘭𝘪𝘴𝘵𝘢 𝘯𝘦𝘨𝘳𝘢
```

---

## ⚠️ Requisitos Importantes

### 1. Bot precisa ser Admin
- Para remover usuários, o bot **DEVE** ser admin do grupo
- Se não for admin, apenas loga aviso no console

### 2. Formato de Número
- Aceita menção: `@usuario`
- Aceita número: `5511999999999`
- Aceita com código: `+55 11 99999-9999`

### 3. Permissões
- **Lista do Grupo:** Qualquer admin pode gerenciar
- **Lista Global:** Apenas dono do bot pode gerenciar

---

## 🐛 Solução de Problemas

### Problema: Bot não remove usuário
**Solução:** Verifique se o bot é admin do grupo

### Problema: Usuário entra mesmo estando na lista
**Solução:** 
1. Verifique se o número está correto: `!listban`
2. Verifique logs do console
3. Certifique-se que o bot está rodando

### Problema: Mensagem não aparece
**Solução:** 
- Agora sempre aparece (padrão ou personalizada)
- Se não aparecer, verifique logs do console

---

## 📊 Arquivos Modificados

### ✏️ `iniciar.js`
- Corrigido `getParticipantJid` para priorizar `id`
- Adicionadas funções `extractNumber` e `isJidInList`
- Corrigida verificação de lista negra global
- Corrigida verificação de lista negra do grupo
- Adicionada verificação de permissões
- Adicionados logs detalhados

### ✏️ `index.js`
- Funções auxiliares já estavam corretas
- Todos os comandos já estavam usando as funções corretas

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console (coloridos e detalhados)
2. Certifique-se que está usando Baileys 7.0+
3. Verifique se o bot tem permissões de admin

---

## 🎉 Pronto para Usar!

O sistema está **100% funcional** e compatível com a versão mais recente da Baileys. Basta extrair, instalar dependências e rodar!

**Boa sorte com seu bot! 🤖✨**
