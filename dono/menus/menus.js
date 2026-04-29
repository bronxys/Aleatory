const menu = (prefix, NomeDoBot, sender) => {
  return `
╭━━〔 💧 *MENU PRINCIPAL* 🔥 〕━━╮
┃ Usuário: @${sender.split("@")[0]}
┃ Bot: ${NomeDoBot}
┃ Dica: ${prefix}info [comando]
╰━━━━━━━━━━━━━━━━━━━╯

┄┄┄┄┄┄┄┄┄┄
'ㇱ〔 ⚙️ *CONFIGURAÇÕES* 〕'ㇱ
么〆 ${prefix}ping
么〆 ${prefix}configurar-bot
么〆 ${prefix}bronxys
么〆 ${prefix}tutorial
么〆 ${prefix}novidades
么〆 ${prefix}alugar

┄┄┄┄┄┄┄┄┄┄
'ㇱ〔 💻 *MENUS* 〕'ㇱ
么〆 ${prefix}menudono
么〆 ${prefix}menuadm
么〆 ${prefix}menupremium
么〆 ${prefix}menugold
么〆 ${prefix}menumidias
么〆 ${prefix}efeitos
么〆 ${prefix}logos
么〆 ${prefix}brincadeiras

┄┄┄┄┄┄┄┄┄┄
'ㇱ〔 👥 *MEMBROS* 〕'ㇱ
么〆 ${prefix}registrar
么〆 ${prefix}delregistro
么〆 ${prefix}perfil
么〆 ${prefix}inforegistrar
么〆 ${prefix}infoperfil
么〆 ${prefix}advertidos
么〆 ${prefix}mutados
么〆 ${prefix}infoadv
么〆 ${prefix}infomute
么〆 ${prefix}infobot
么〆 ${prefix}bug
么〆 ${prefix}sugestao
么〆 ${prefix}avalie
么〆 ${prefix}reagir
么〆 ${prefix}adms
么〆 ${prefix}convite
么〆 ${prefix}iniciar_forca
么〆 ${prefix}jogodavelha (@)
么〆 ${prefix}aleatory

┄┄┄┄┄┄┄┄┄┄
'ㇱ〔 📚 *INFORMAÇÕES* 〕'ㇱ
么〆 ${prefix}ping
么〆 ${prefix}gitdobot
么〆 ${prefix}rankativo
么〆 ${prefix}rankinativos
么〆 ${prefix}atividades
么〆 ${prefix}perfil
么〆 ${prefix}registrar
么〆 ${prefix}inforegistrar
么〆 ${prefix}infoperfil
么〆 ${prefix}advertidos
么〆 ${prefix}mutados
么〆 ${prefix}moedas
么〆 ${prefix}esporte_noticias
么〆 ${prefix}celular (ex: Xiaomi)
么〆 ${prefix}letramusica (ex: sad)
么〆 ${prefix}blocklist
么〆 ${prefix}brasileiraoa
么〆 ${prefix}brasileiraob
么〆 ${prefix}tempo (cidade)

┄┄┄┄┄┄┄┄┄┄
'ㇱ〔 ⚡ *COMANDOS BÁSICOS* 〕'ㇱ
么〆 ${prefix}gtts (linguagem+texto)
么〆 ${prefix}tagme
么〆 ${prefix}placaloli
么〆 ${prefix}tabela
么〆 ${prefix}simi
么〆 ${prefix}perfil / fazernick
么〆 ${prefix}metadinha
么〆 ${prefix}tomp3
么〆 ${prefix}notas
么〆 ${prefix}rvvisu
么〆 ${prefix}pergunta
么〆 ${prefix}gerarimagem
么〆 ${prefix}crimg
么〆 ${prefix}roubar
么〆 ${prefix}minha
么〆 ${prefix}signo
么〆 ${prefix}letra
么〆 ${prefix}aptoide_pesquisa
么〆 ${prefix}pesquisar
么〆 ${prefix}limpar
么〆 ${prefix}revelar

╭────────────────╮
> ${NomeDoBot} • ONLINE ✅
╰────────────────╯
`;
};

// MENU DE ADMINISTRADORES
const adms = (prefix, sender) => {
  return `
╭━━⌈ 🛠 𝗠𝗘𝗡𝗨 𝗔𝗗𝗠𝗜𝗡𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
┃ 💡 Dica: ${prefix}info [comando]
╰━━━━━━━━━━━━━━━━━━╯

┌─「 ⚙️ 𝗖𝗢𝗡𝗙𝗜𝗚 𝗚𝗘𝗥𝗔𝗜𝗦 」
│ ϟツ ${prefix}antistatus
│ ϟツ ${prefix}autobaixar
│ ϟツ ${prefix}x9
│ ϟツ ${prefix}autofigu
│ ϟツ ${prefix}antilink 
│ ϟツ ${prefix}antilink2
│ ϟツ ${prefix}antiaudio
│ ϟツ ${prefix}antiloc
│ ϟツ ${prefix}antivideo
│ ϟツ ${prefix}antifake
│ ϟツ ${prefix}antilinkgp
│ ϟツ ${prefix}antisticker
│ ϟツ ${prefix}antiimg
│ ϟツ ${prefix}advlink
│ ϟツ ${prefix}advlinkgp
│ ϟツ ${prefix}simih
│ ϟツ ${prefix}simih2
│ ϟツ ${prefix}sorteio
│ ϟツ ${prefix}sorteionumeros
│ ϟツ ${prefix}soadm
│ ϟツ ${prefix}sorte
│ ϟツ ${prefix}atividades
│ ϟツ ${prefix}multiprefixo
│ ϟツ ${prefix}prefixos
│ ϟツ ${prefix}add_prefixo
│ ϟツ ${prefix}tirar_prefixo
│ ϟツ ${prefix}duelo
│ ϟツ ${prefix}infoduelofig
│ ϟツ ${prefix}Bloqcmd
│ ϟツ ${prefix}so_adm
│ ϟツ ${prefix}mute
│ ϟツ ${prefix}desmute
│ ϟツ ${prefix}mutados
│ ϟツ ${prefix}blockcmd
│ ϟツ ${prefix}unblockcmd
│ ϟツ ${prefix}listblockcmd
│ ϟツ ${prefix}blockcmdg
│ ϟツ ${prefix}unblockcmdg
│ ϟツ ${prefix}listblockcmdg
│ ϟツ ${prefix}antinotafake
│ ϟツ ${prefix}addnota
│ ϟツ ${prefix}remover
│ ϟツ ${prefix}listanota
│ ϟツ ${prefix}antipalavrão
│ ϟツ ${prefix}addpalavra
│ ϟツ ${prefix}delpalavra
│ ϟツ ${prefix}listapalavrão
│ ϟツ ${prefix}addautoban
│ ϟツ ${prefix}apresentar
│ ϟツ ${prefix}digt
│ ϟツ ${prefix}papof
│ ϟツ ${prefix}limite
│ ϟツ ${prefix}limiteflood
│ ϟツ ${prefix}limitecaracteres
└──────────────────

┌─「 👥 𝗠𝗘𝗠𝗕𝗥𝗢𝗦 」
│ ϟツ ${prefix}mute
│ ϟツ ${prefix}delmute
│ ϟツ ${prefix}mutados
│ ϟツ ${prefix}limparmute
│ ϟツ ${prefix}infomute
│ ϟツ ${prefix}adv
│ ϟツ ${prefix}advertidos
│ ϟツ ${prefix}deladv
│ ϟツ ${prefix}deladv1
│ ϟツ ${prefix}deladv2
│ ϟツ ${prefix}limparadv
│ ϟツ ${prefix}infoadv
│ ϟツ ${prefix}deletar
│ ϟツ ${prefix}perfil @
│ ϟツ ${prefix}listanegra
│ ϟツ ${prefix}tirardalista
│ ϟツ ${prefix}listban
│ ϟツ ${prefix}legenda_listanegra
│ ϟツ ${prefix}infolistanegra
│ ϟツ ${prefix}band
│ ϟツ ${prefix}ban
│ ϟツ ${prefix}kick
│ ϟツ ${prefix}promover
│ ϟツ ${prefix}rebaixar
│ ϟツ ${prefix}d
└──────────────────

┌─「 📋 𝗚𝗥𝗨𝗣𝗢 」
│ ϟツ ${prefix}aceitar
│ ϟツ ${prefix}recusar
│ ϟツ ${prefix}aviso
│ ϟツ ${prefix}listaavisos
│ ϟツ ${prefix}removeraviso
│ ϟツ ${prefix}limparavisos
│ ϟツ ${prefix}infoaviso
│ ϟツ ${prefix}fechargp
│ ϟツ ${prefix}abrirgp
│ ϟツ ${prefix}listahorarios
│ ϟツ ${prefix}delhorario
│ ϟツ ${prefix}zerarhorarios
│ ϟツ ${prefix}infofechargp
│ ϟツ ${prefix}infoabrirgp
│ ϟツ ${prefix}grupo
│ ϟツ ${prefix}status
│ ϟツ ${prefix}linkgp
│ ϟツ ${prefix}grupoinfo
│ ϟツ ${prefix}descgp
│ ϟツ ${prefix}nomegp
│ ϟツ ${prefix}legenda_estrangeiro
│ ϟツ ${prefix}anotar
│ ϟツ ${prefix}rm_aviso
│ ϟツ ${prefix}rg_aviso
└──────────────────

┌─「 🏷 𝗜𝗡𝗧𝗘𝗥𝗔𝗖̧𝗔̃𝗢 」
│ ϟツ ${prefix}Marcar
│ ϟツ ${prefix}Marcar2
│ ϟツ ${prefix}Hidetag
│ ϟツ ${prefix}Ausente
│ ϟツ ${prefix}voltei
└──────────────────

┌─「 🚫 𝗔𝗡𝗧𝗜-𝗦𝗣𝗔𝗠 」
│ ϟツ ${prefix}limitarcomando
│ ϟツ ${prefix}antipalavra
│ ϟツ ${prefix}limpar
│ ϟツ ${prefix}antispam 
└──────────────────

┌─「 🗒 𝗔𝗡𝗢𝗧𝗔𝗖̧𝗢̃𝗘𝗦  」
│ ϟツ ${prefix}anotações
│ ϟツ ${prefix}tabelagp
└──────────────────`;
};

// MENU DO DONO
const menudono = (prefix, sender) => {
  return `
╭━━⌈ 🔐 𝗠𝗘𝗡𝗨 𝗗𝗢 𝗗𝗢𝗡𝗢 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
┃ 💡 Use ${prefix}info [comando]
╰━━━━━━━━━━━━━━━━━━╯

┌─「 ⚙️ 𝗣𝗥𝗜𝗡𝗖𝗜𝗣𝗔𝗜𝗦 𝗖𝗢𝗡𝗙𝗜𝗚𝗦 」
│ ϟツ ${prefix}configurar-bot
│ ϟツ ${prefix}numero-dono
│ ϟツ ${prefix}nick-dono
│ ϟツ ${prefix}nome-bot
│ ϟツ ${prefix}fotomenu
│ ϟツ ${prefix}gifmenu
│ ϟツ ${prefix}prefixo-bot
│ ϟツ ${prefix}reiniciar
│ ϟツ ${prefix}setprefixs
│ ϟツ ${prefix}boton
│ ϟツ ${prefix}botoff
│ ϟツ ${prefix}bangp
│ ϟツ ${prefix}unbangp
│ ϟツ ${prefix}tempocmd
│ ϟツ ${prefix}limitarcmd
│ ϟツ ${prefix}limparcache
└──────────────────

┌─「 👑 𝗣𝗥𝗘𝗠𝗜𝗨𝗠/𝗚𝗟𝗢𝗕𝗔𝗟 」
│ ϟツ ${prefix}addgold
│ ϟツ ${prefix}cmdpremium
│ ϟツ ${prefix}addpremium
│ ϟツ ${prefix}delpremium
│ ϟツ ${prefix}listapremium
│ ϟツ ${prefix}addcmdpremium
│ ϟツ ${prefix}delcmdpremium
│ ϟツ ${prefix}alugar
│ ϟツ ${prefix}alugarbot
│ ϟツ ${prefix}alugados
│ ϟツ ${prefix}alugado: <nome>
│ ϟツ ${prefix}renovaraluguel
│ ϟツ ${prefix}encerraraluguel
│ ϟツ ${prefix}zeraraluguel
│ ϟツ ${prefix}alertaaluguel
│ ϟツ ${prefix}infoaluguel
└──────────────────

┌─「 📝 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗢 」
│ ϟツ ${prefix}modoregistro
│ ϟツ ${prefix}registrados
│ ϟツ ${prefix}zerarregistros
│ ϟツ ${prefix}inforegistro
│ ϟツ ${prefix}aniversario
└──────────────────

┌─「 🧰 𝗙𝗨𝗡𝗖̧𝗢̃𝗘𝗦 𝗗𝗢 𝗦𝗜𝗦𝗧𝗘𝗠𝗔 」
│ ϟツ ${prefix}status
│ ϟツ ${prefix}bemvindo (foto)
│ ϟツ ${prefix}bemvindo2
│ ϟツ ${prefix}saiu (foto)
│ ϟツ ${prefix}saiu2 
│ ϟツ ${prefix}legendabv (foto)
│ ϟツ ${prefix}legendabv2
│ ϟツ ${prefix}legendasaiu (foto)
│ ϟツ ${prefix}legendasaiu2
│ ϟツ ${prefix}fundobv
│ ϟツ ${prefix}fundosaiu
│ ϟツ ${prefix}infobemvindo
│ ϟツ ${prefix}botoff
│ ϟツ ${prefix}antipv
│ ϟツ ${prefix}antipv2
│ ϟツ ${prefix}antipv3
│ ϟツ ${prefix}dononogrupo
│ ϟツ ${prefix}antiligar
│ ϟツ ${prefix}bcgp
│ ϟツ ${prefix}status
│ ϟツ ${prefix}visualizarmsg
│ ϟツ ${prefix}idgrupo
│ ϟツ ${prefix}bloquear
│ ϟツ ${prefix}desbloc
│ ϟツ ${prefix}blocklist
│ ϟツ ${prefix}clonar
│ ϟツ ${prefix}reviverqr
│ ϟツ ${prefix}sermembro
│ ϟツ ${prefix}seradm
│ ϟツ ${prefix}limitec
│ ϟツ ${prefix}mete
│ ϟツ ${prefix}convite
│ ϟツ ${prefix}entrar
│ ϟツ ${prefix}recusar
│ ϟツ ${prefix}idgrupo
│ ϟツ ${prefix}recolherlink
│ ϟツ ${prefix}listlinks
│ ϟツ ${prefix}recolherlinkgp
│ ϟツ ${prefix}zerarlinks
└──────────────────`;
};

// MENU DE LOGOS
const menulogos = (prefix, sender) => {
  return `
╭━━⌈ 🎨 𝗠𝗘𝗡𝗨 𝗗𝗘 𝗟𝗢𝗚𝗢𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

🖋 Efeitos de Texto:
  ϟツ ${prefix}logos1 (texto)
──────────────────`;
};

// MENU DE EFEITOS
const efeitos = (prefix, sender) => {
  return `
╭━━⌈ 🖼 𝗘𝗙𝗘𝗜𝗧𝗢𝗦 𝗗𝗘 𝗜𝗠𝗔𝗚𝗘𝗠 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

📸 Aplicar em imagens marcadas:
  ϟツ ${prefix}legenda
  ϟツ ${prefix}procurado
  ϟツ ${prefix}preso
  ϟツ ${prefix}lixo
  ϟツ ${prefix}morto
  ϟツ ${prefix}deletem
  ϟツ ${prefix}lgbt
──────────────────`;
};

// MENU DE BRINCADEIRAS
const brincadeiras = (prefix, sender) => {
  return `
╭━━⌈ 🎉 𝗕𝗥𝗜𝗡𝗖𝗔𝗗𝗘𝗜𝗥𝗔𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

😂 Comandos com marcação:
  ϟツ ${prefix}golpe (@)
  ϟツ ${prefix}casal (@)
  ϟツ ${prefix}gay (@)
  ϟツ ${prefix}feio (@)
  ϟツ ${prefix}beijo (@)
  ϟツ ${prefix}tapa (@)
  ϟツ ${prefix}chance (@) 
  ϟツ ${prefix}matar (@)

🏆 Ranks e Diversão:
  ϟツ ${prefix}rankgay
  ϟツ ${prefix}rankcorno
  ϟツ ${prefix}rankgado
  ϟツ ${prefix}rankgostoso
  ϟツ ${prefix}rankgostosa
  ϟツ ${prefix}rankotakus
──────────────────`;
};

// MENU PREMIUM
const menuprem = (prefix, sender) => {
  return `
╭━━⌈ 💎 𝗠𝗘𝗡𝗨 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

🌟 Comandos Exclusivos:
  ϟツ Consulte ${prefix}cmdpremium
──────────────────`;
};

// MENU ALTERADORES
const alteradores = (prefix, sender) => {
  return `
╭━━⌈ 🎧 𝗔𝗟𝗧𝗘𝗥𝗔𝗗𝗢𝗥𝗘𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

🎥 Vídeo:
  ϟツ ${prefix}videolento
  ϟツ ${prefix}videorapido
  ϟツ ${prefix}videocontrario

🔊 Áudio:
  ϟツ ${prefix}audiolento
  ϟツ ${prefix}audiorapido
  ϟツ ${prefix}grave
  ϟツ ${prefix}bass
  ϟツ ${prefix}vozmenino
  ϟツ ${prefix}esquilo
──────────────────`;
};

// MENU GOLD
const menugold = (prefix, sender) => {
  return `│
│  🪙 *SISTEMA GOLD & ECONOMIA*
├──────────────
│
│  💰 *SALDO E STATUS*
│  🪙 ${prefix}gold ─ Ver seu saldo
│  📊 ${prefix}statusgold ─ Status completo
│  🏆 ${prefix}rankgold ─ Top 10 mais ricos
│
│  🎮 *JOGOS E APOSTAS*
│  🎰 ${prefix}cassino ─ Aposte na roleta
│  🎡 ${prefix}roletadasorte ─ Gire a roleta
│  🔢 ${prefix}quiznumero ─ Adivinhe o número
│  🎲 ${prefix}apostargold ─ Aposte seu gold
│  🎟️ ${prefix}bolaogold <v> ─ Bolão (Custa V)
│  🎣 ${prefix}pescargold ─ Pesque tesouros
│  ⚔️ ${prefix}duelo @user ─ Duelo 1v1
│
│  🥷 *CRIME E INTERAÇÃO*
│  💀 ${prefix}roubargold @user ─ Tentar roubar
│  ⚔️ ${prefix}vingancagold @user ─ Vingança
│  🍻 ${prefix}enviarcachaca @user ─ Dar bebida
│
│  🤝 *AJUDA E ECONOMIA*
│  💝 ${prefix}doargold @user/valor ─ Doar
│  ⛏️ ${prefix}minerar_gold ─ Minerar ouro
│  💼 ${prefix}trabalhar ─ Trabalhe e ganhe
│  🏦 ${prefix}emprestargold @user/valor ─ Agiota
│
│  🛒 *LOJA DO BOT*
│  ⚔️ ${prefix}comprar vingancagold ─ 50G
│  🍻 ${prefix}comprar cachaca ─ 50G
│  🛡️ ${prefix}comprar escudo ─ 50G
│
│  ⚙️ *ADMINISTRAÇÃO*
│  🔧 ${prefix}modogold 1/0 ─ Ligar/Desligar
│  ➕ ${prefix}addgold @user/valor
│  ➖ ${prefix}tirargold @user/valor
│
├──────────────
│  💡 *DICA:* Digite ${prefix}infogold
│  👤 *@${sender.split("@")[0]}*
`;
};

// MENU DE MÍDIAS (Downloads + Figurinhas)
const menumidias = (prefix, sender) => {
  return `
╭━━〔 📀 *MENU MÍDIAS* 🎬 〕━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
┃ 💡 Dica: ${prefix}info [comando]
╰━━━━━━━━━━━━━━━━━━━╯

┄┄┄┄┄┄┄┄┄┄
'ㇱ〔 📥 *DOWNLOADS* 〕'ㇱ
么〆 ${prefix}transcrever (áudio)
么〆 ${prefix}play / playdoc
么〆 ${prefix}play_video
么〆 ${prefix}tiktok
么〆 ${prefix}instagram
么〆 ${prefix}facebook
么〆 ${prefix}face_audio
么〆 ${prefix}tiktok_audio
么〆 ${prefix}insta_video
么〆 ${prefix}insta_audio
么〆 ${prefix}ytmp4
么〆 ${prefix}ytmp3
么〆 ${prefix}twitter
么〆 ${prefix}twitter_audio
么〆 ${prefix}playstore
么〆 ${prefix}ytsearch
么〆 ${prefix}tiktok / insta / face / X
么〆 ${prefix}spotify / kwai / threads / sound
么〆 ${prefix}amazon (ex: celular A13)
么〆 ${prefix}grupos (ex: Naruto)
么〆 ${prefix}mediafire

┄┄┄┄┄┄┄┄┄┄
'ㇱ〔 🎭 *FIGURINHAS* 〕'ㇱ
么〆 ${prefix}sticker
么〆 ${prefix}fstiker
么〆 ${prefix}attp (texto)
么〆 ${prefix}sticker (foto)
么〆 ${prefix}toimg / togif (figu)
么〆 ${prefix}rename
么〆 ${prefix}figurinhas (ex: 5)
么〆 ${prefix}fig
么〆 ${prefix}figmeme
么〆 ${prefix}figanime
么〆 ${prefix}figcoreana
么〆 ${prefix}figraiva
么〆 ${prefix}figemoji
么〆 ${prefix}figroblox
么〆 ${prefix}figengracada
么〆 ${prefix}figdesenho
么〆 ${prefix}sfundo
么〆 ${prefix}roubar
么〆 ${prefix}emojimix
么〆 ${prefix}emoji

╭────────────────╮
> 📀 *MENU MÍDIAS* ✅
╰────────────────╯
`;
};

module.exports = {
  menu,
  adms,
  menudono,
  menulogos,
  alteradores,
  menuprem,
  brincadeiras,
  efeitos,
  menugold,
  menumidias,
};
