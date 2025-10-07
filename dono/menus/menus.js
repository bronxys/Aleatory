const menu = (prefix, NomeDoBot, sender) => {
  
// NÃO APAGUE ESSE ${NickDono} nem 
//${numerodn} nem ${NomeDoBot} nem ${prefix} só se quiser apagar completo, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa.  
  
return `​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​
╔══════════════════════════════╗

   ✨ 📜 MENU DE COMANDOS 📜 ✨

👤 Usuário: @${sender.split("@")[0]}
ℹ️ Para detalhes de um comando:
   ➤ ${prefix}info [nome do comando]

╚══════════════════════════════╝

╔══ ⚙️ CONFIGURAÇÃO BÁSICA ⚙️ ══╗
➤ ${prefix}bronxys
➤ ${prefix}configurar-bot
➤ ${prefix}tutorial
╚══════════════════════════════╝

╔══ 🎛️ MENUS DIVERSOS 🎛️ ══╗
➤ ${prefix}menudono
➤ ${prefix}menuadm
➤ ${prefix}menupremium
➤ ${prefix}efeitosimg
➤ ${prefix}logos
➤ ${prefix}brincadeiras
➤ ${prefix}menugold
╚══════════════════════════════╝

╔══ 👥 MEMBROS 👥 ══╗
➤ ${prefix}infobot
➤ ${prefix}bug (questione)
➤ ${prefix}sugestao (dica)
➤ ${prefix}avaliar (o-quao-bom)
╚══════════════════════════════╝

╔══ 🔍 PESQUISAS & DOWNLOADS 🔍 ══╗
➤ ${prefix}transcrever (marcar-audio)
➤ ${prefix}play / playdoc (nome)
➤ ${prefix}playstore (nome)
➤ ${prefix}ytsearch (nome)
➤ ${prefix}tiktok / instagram / facebook / twitter
➤ ${prefix}spotify / kwai / threads / soundcloud
➤ ${prefix}ifunny / gerarlink
➤ ${prefix}amazon (ex: celular A13)
➤ ${prefix}grupos (ex: Naruto)
╚══════════════════════════════╝

╔══ ℹ️ INFORMAÇÕES ℹ️ ══╗
➤ ${prefix}ping (velo)
➤ ${prefix}gitdobot
➤ ${prefix}rankativo
➤ ${prefix}moedas
➤ ${prefix}esporte_noticias
➤ ${prefix}celular (ex: Galaxy a9)
➤ ${prefix}letramusica (ex: Ela me traiu)
╚══════════════════════════════╝

╔══ 🎮 JOGOS 🎮 ══╗
➤ ${prefix}sistemgold
➤ ${prefix}iniciar_forca
➤ ${prefix}jogodavelha (@marcar)
╚══════════════════════════════╝

╔══ 🖼️ FIGURINHAS 🖼️ ══╗
➤ ${prefix}attp (texto)
➤ ${prefix}sticker (foto)
➤ ${prefix}toimg / togif (figu)
➤ ${prefix}rename (text/text)
➤ ${prefix}figurinhas (ex: 5)
╚══════════════════════════════╝

╔══ 📚 COMANDOS BÁSICOS 📚 ══╗
➤ ${prefix}gtts (linguagem+texto)
➤ ${prefix}tagme
➤ ${prefix}emoji 😏 / emojimix 😉+🙂
➤ ${prefix}tabela (letras)
➤ ${prefix}conselhobiblico
➤ ${prefix}simi (fale algo)
➤ ${prefix}perfil / fazernick (nick)
➤ ${prefix}bot / signo (virgem)
➤ ${prefix}metadinha
➤ ${prefix}tomp3 (video > audio)
╚══════════════════════════════╝`;
};

// MENU DE ADMINISTRADORES 

const adms = (prefix, sender) => { 
 
// NÃO APAGUE ESSE ${prefix}, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa. 

return `​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​

──────────────────────────────

🛠 **MENU DE ADMS** 🛠

Usuário: @${sender.split("@")[0]}

➡️ Use ${prefix}info nome do comando para obter informações detalhadas sobre um comando.

──────────────────────────────

** Quiser saber os comandos, tipo antilink, antifake e etc.. : use o comando ${prefix}ativações **

──────────────────────────────

**Configurações Gerais:**

◈• ${prefix}autobaixar
◈• ${prefix}sorteio
◈• ${prefix}sorte
◈• ${prefix}atividades
◈• ${prefix}multiprefixo
◈• ${prefix}duelo
◈• ${prefix}Bloqcmd (comando)
◈• ${prefix}so_adm

──────────────────────────────

**Gerenciamento de Membros:**

◈• ${prefix}listanegra (número)
◈• ${prefix}tirardalista (número)
◈• ${prefix}ban ( @usu ou responder a mensagem)
◈• ${prefix}promover [@] (Promover a Adm)

──────────────────────────────

**Configurações do Grupo:**

◈• ${prefix}grupo
◈• ${prefix}status
◈• ${prefix}linkgp
◈• ${prefix}grupoinfo
◈• ${prefix}descgp (txt)
◈• ${prefix}nomegp (nome)
◈• ${prefix}legenda_estrangeiro (msg)

──────────────────────────────

**Comandos de Marcação:**

◈• ${prefix}Marcar (marca todos do GP)
◈• ${prefix}Marcar2 (marca todos Wa.me/)
◈• ${prefix}Hidetag (txt) (marcação)
◈• ${prefix}Ausente (fale oq faz ou o que vai fazer)

──────────────────────────────

**Anti-Spam e Palavras:**

◈• ${prefix}limitarcomando
◈• ${prefix}antipalavra
◈• ${prefix}limpar (texto invisível GP)

──────────────────────────────

**Tabelas e Notas:**

◈• ${prefix}anotações
◈• ${prefix}tabelagp

──────────────────────────────
`;
};

// MENU DE DONO

const menudono = (prefix, sender) => {
	
// NÃO APAGUE ESSE ${prefix}, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode alterar ele tod0, menos as definições, só se quiser apagar a definição completa. 	

return `​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​

──────────────────────────────

🔐 MENU DE DONO 🔐

Usuário: @${sender.split("@")[0]}

➡️ Use ${prefix}info [nome do comando] para obter informações detalhadas sobre um comando.

──────────────────────────────

**Configurações:**

◈• ${prefix}Configurar-bot

──────────────────────────────

** Quiser saber os comandos, tipo antipv, So_Adm e etc.. : use o comando ${prefix}Ativações_dono **

──────────────────────────────

**Comandos de Configuração:**

◈• ${prefix}audio-menu
◈• ${prefix}Recolherlink
◈• ${prefix}Botoff
◈• ${prefix}Dononogrupo
◈• ${prefix}Addgold
◈• ${prefix}Limitecaracteres
◈• ${prefix}Rgtm
◈• ${prefix}Cmdpremium
◈• ${prefix}Rg_aluguel
◈• ${prefix}ListanegraG (número que saiu)
◈• ${prefix}Bemvindo
◈• ${prefix}Bemvindo2
◈• ${prefix}legendabv
◈• ${prefix}legendasaiu
◈• ${prefix}legendasaiu2
◈• ${prefix}Bangp
◈• ${prefix}Fotomenu (marcar imagem) 
◈• ${prefix}Bloqcmdg (comando)
◈• ${prefix}Listagp
◈• ${prefix}Antiligar
◈• ${prefix}Ausente (fale oq faz ou o que vai fazer)
◈• ${prefix}Addpremium @(marca)/30d
◈• ${prefix}Bloquear [@] (bloq de usar cmds) 
◈• ${prefix}Prefixo-bot (prefixo-novo)
◈• ${prefix}Bcgp (TM-PRA-PV-MEMBROS)
◈• ${prefix}Antipv

──────────────────────────────

`;

};

// MENU DE LOGOS 

const menulogos = (prefix, sender) => {
  
// NÃO APAGUE ESSE ${prefix}, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa.  
  
return `​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​

──────────────────────────────

MENU DE LOGOS 🎨

Usuário: @${sender.split("@")[0]}

🔤 Logos de 1 Texto 🔤

◈• ${prefix}logos1 (txt)

──────────────────────────────
`;
};

// MENU DE ALTERAR ÁUDIOS E VÍDEOS

const alteradores = (prefix, sender) => {

// NÃO APAGUE ESSE ${prefix}, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa. 

return`

──────────────────────────────

🎥 **Alteradores de Áudio/Vídeo** 🎤

Usuário: @${sender.split("@")[0]}

──────────────────────────────

🎬 **Alterar Vídeos** 🎬

◈• ${prefix}Videolento (marca)
◈• ${prefix}Videorapido (marca)
◈• ${prefix}Videocontrario (marca)

──────────────────────────────

🔊 **Alterar Áudios** 🔊

◈• ${prefix}Audiolento (marca)
◈• ${prefix}Audiorapido (marca)
◈• ${prefix}Grave (marca)
◈• ${prefix}Grave2 (marca)
◈• ${prefix}Esquilo (marca)
◈• ${prefix}Estourar (marca)
◈• ${prefix}Bass (marca)
◈• ${prefix}Bass2 (marca)
◈• ${prefix}Vozmenino (marca)
◈• ${prefix}Audioreverse (marca)

──────────────────────────────

`;
};

// MENU PREMIUM 

const menuprem = (prefix, sender) => { 

// NÃO APAGUE ESSE ${prefix}, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa. 

return `

──────────────────────────────

💎 **Menu Premium** 💎

Usuário: @${sender.split("@")[0]}

──────────────────────────────

**Comandos Premium:**
◈• ADICIONE SEUS COMANDOS PREMIUM / VEJA O ${prefix}info cmdpremium

──────────────────────────────

`;
};

// MENU DE BRINCADEIRAS.. 

const brincadeiras = (prefix, sender) => {

// NÃO APAGUE ESSE ${prefix}, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa. 

return `​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​

──────────────────────────────

🎉 **Menu de Brincadeiras** 🎉

Usuário: @${sender.split("@")[0]}

──────────────────────────────

**Brincadeiras com Marcações:**

◈• ${prefix}Fakechat Mensagem (marque a mensagem de alguém)
◈• ${prefix}Golpe (marca (@))
◈• ${prefix}Casal (marca (@))
◈• ${prefix}Gay (marca (@))
◈• ${prefix}Feio (marca (@))
◈• ${prefix}Corno (marca (@))
◈• ${prefix}Vesgo (marca (@))
◈• ${prefix}Bebado (marca (@))
◈• ${prefix}Gostoso (marca (@))
◈• ${prefix}Gostosa (marca (@))
◈• ${prefix}Beijo (marca (@))
◈• ${prefix}Matar (marca (@))
◈• ${prefix}Tapa (marca (@))
◈• ${prefix}Chute (marca (@))
◈• ${prefix}Dogolpe (marca (@))
◈• ${prefix}Nazista (marca (@))

──────────────────────────────

**Rankings e Classificações:**

◈• ${prefix}Chance (fale algo)
◈• ${prefix}Casal
◈• ${prefix}Rankgay
◈• ${prefix}Rankgado
◈• ${prefix}Rankcorno
◈• ${prefix}Rankgostoso
◈• ${prefix}Rankgostosa
◈• ${prefix}Rankkengas
◈• ${prefix}Ranknazista
◈• ${prefix}Rankotakus
◈• ${prefix}Rankpau
◈• ${prefix}Rankgolpista

──────────────────────────────

`;
};

// MENU DE EFEITOS DE IMAGEM, MONTAGEM Tops Kkk

const efeitos = (prefix, sender) => {

// NÃO APAGUE ESSE ${prefix}, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa. 

return `​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​

──────────────────────────────

📸 **Menu de Efeitos** 📸

Usuário: @${sender.split("@")[0]}

──────────────────────────────

**Efeitos em Imagens:**

◈• ${prefix}Legenda (marcar)-(img)
◈• ${prefix}Procurado (marcar)-(img)
◈• ${prefix}Hitler (marcar)-(img)
◈• ${prefix}Preso (marcar)-(img)
◈• ${prefix}Lixo (marcar)-(img)
◈• ${prefix}Deletem (marcar)-(img)
◈• ${prefix}Morto (marcar)-(img)
◈• ${prefix}Lgbt (marcar)-(img)

──────────────────────────────

`;
};

module.exports = {
menu, adms, menudono, menulogos, alteradores, menuprem, brincadeiras, efeitos
}