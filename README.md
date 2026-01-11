# ALEATORY BOT - WhatsApp

Bot de WhatsApp desenvolvido com Baileys v7.

## 📁 Estrutura do Projeto

```
Alea_Limpo/
├── dados/           # Dados, JSONs e funções auxiliares
├── dono/            # Menus e configurações do dono
├── operacao/        # Operações e comandos
├── logos/           # Imagens e logos
├── docs/            # 📚 Documentação e guias (51 arquivos)
├── scripts/         # 🔧 Scripts de teste e correção (13 arquivos)
├── index.js         # Arquivo principal do bot
├── iniciar.js       # Script de inicialização
├── consts-func.js   # Constantes e funções globais
├── menu_conexao.js  # Menu de conexão
├── package.json     # Dependências do projeto
└── start.sh         # Script para iniciar o bot
```

## 🚀 Como Usar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o bot:
```bash
npm start
# ou
node iniciar.js
```

## 📚 Documentação

Toda a documentação foi organizada na pasta `docs/`:
- Guias de instalação e uso
- Correções aplicadas
- Informações técnicas
- Análises de problemas

## 🔧 Scripts Auxiliares

Scripts de teste e correção estão na pasta `scripts/`:
- Scripts de teste de funcionalidades
- Scripts de correção de bugs
- Backups de versões anteriores

## ⚠️ Importante

- Não remova os arquivos da raiz (index.js, iniciar.js, consts-func.js)
- Os arquivos em `docs/` e `scripts/` são apenas para referência
- Mantenha o arquivo `.env` ou configurações sensíveis fora do controle de versão
