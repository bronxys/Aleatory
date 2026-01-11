const menu = (prefix, NomeDoBot, sender) => {
  return `
╭━━⌈ 💠 𝗠𝗘𝗡𝗨 𝗣𝗥𝗜𝗡𝗖𝗜𝗣𝗔𝗟 💠 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
┃ 🤖 Bot: ${NomeDoBot}
┃ 💡 Dica: use ${prefix}info [comando]
╰━━━━━━━━━━━━━━━━━━╯

┌─「 ⚙️ 𝗖𝗢𝗡𝗙𝗜𝗚 𝗕𝗔́𝗦𝗜𝗖𝗔𝗦 」
│ 𒁂〆 ${prefix}ping
│ 𒁂〆 ${prefix}bronxys
│ 𒁂〆 ${prefix}configurar-bot
│ 𒁂〆 ${prefix}tutorial
└──────────────────

┌─「 💻 𝗠𝗘𝗡𝗨𝗦 𝗗𝗜𝗩𝗘𝗥𝗦𝗢𝗦 」
│ 𒁂〆 ${prefix}menudono
│ 𒁂〆 ${prefix}menuadm
│ 𒁂〆 ${prefix}menupremium
│ 𒁂〆 ${prefix}efeitosimg
│ 𒁂〆 ${prefix}logos
│ 𒁂〆 ${prefix}brincadeiras
│ 𒁂〆 ${prefix}menugold
└──────────────────

┌─「 👥 𝗠𝗘𝗠𝗕𝗥𝗢𝗦 」
│ 𒁂〆 ${prefix}infobot
│ 𒁂〆 ${prefix}bug
│ 𒁂〆 ${prefix}sugestao
│ 𒁂〆 ${prefix}avalie
│ 𒁂〆 ${prefix}reagir
│ 𒁂〆 ${prefix}adms
│ 𒁂〆 ${prefix}convite
└──────────────────

┌─「 📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗦 」
│ 𒁂〆 ${prefix}transcrever (áudio)
│ 𒁂〆 ${prefix}play / playdoc
│ 𒁂〆 ${prefix}play_video
│ 𒁂〆 ${prefix}tiktok
│ 𒁂〆 ${prefix}instagram
│ 𒁂〆 ${prefix}facebook
│ 𒁂〆 ${prefix}face_audio
│ 𒁂〆 ${prefix}tiktok_audio
│ 𒁂〆 ${prefix}insta_video
│ 𒁂〆 ${prefix}insta_audio
│ 𒁂〆 ${prefix}ytmp4
│ 𒁂〆 ${prefix}ytmp3
│ 𒁂〆 ${prefix}twitter_audio
│ 𒁂〆 ${prefix}twitter
│ 𒁂〆 ${prefix}playstore
│ 𒁂〆 ${prefix}ytsearch
│ 𒁂〆 ${prefix}tiktok / insta / face / X
│ 𒁂〆 ${prefix}spotify / kwai / threads / sound
│ 𒁂〆 ${prefix}amazon (ex: celular A13)
│ 𒁂〆 ${prefix}grupos (ex: Naruto)
│ 𒁂〆 ${prefix}mediafire
└──────────────────

┌─「 📚 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖̧𝗢̃𝗘𝗦 」
│ 𒁂〆 ${prefix}ping
│ 𒁂〆 ${prefix}gitdobot
│ 𒁂〆 ${prefix}rankativo
│ 𒁂〆 ${prefix}rankinativos
│ 𒁂〆 ${prefix}atividades
│ 𒁂〆 ${prefix}perfil
│ 𒁂〆 ${prefix}moedas
│ 𒁂〆 ${prefix}esporte_noticias
│ 𒁂〆 ${prefix}celular (ex: Xiaomi)
│ 𒁂〆 ${prefix}letramusica (ex: sad)
│ 𒁂〆 ${prefix}blocklist
└──────────────────

┌─「 🎮 𝗝𝗢𝗚𝗢𝗦 」
│ 𒁂〆 ${prefix}sistemgold
│ 𒁂〆 ${prefix}iniciar_forca
│ 𒁂〆 ${prefix}jogodavelha (@)
└──────────────────

┌─「 🎭 𝗙𝗜𝗚𝗨𝗥𝗜𝗡𝗛𝗔𝗦 」
│ 𒁂〆 ${prefix}sticker
│ 𒁂〆 ${prefix}fstiker
│ 𒁂〆 ${prefix}attp (texto)
│ 𒁂〆 ${prefix}sticker (foto)
│ 𒁂〆 ${prefix}toimg / togif (figu)
│ 𒁂〆 ${prefix}rename
│ 𒁂〆 ${prefix}figurinhas (ex: 5)
│ 𒁂〆 ${prefix}fig
│ 𒁂〆 ${prefix}figmeme
│ 𒁂〆 ${prefix}figanime
│ 𒁂〆 ${prefix}figcoreana
│ 𒁂〆 ${prefix}figraiva
│ 𒁂〆 ${prefix}figemoji
│ 𒁂〆 ${prefix}figroblox
│ 𒁂〆 ${prefix}figengracada
│ 𒁂〆 ${prefix}figdesenho
│ 𒁂〆 ${prefix}sfundo
│ 𒁂〆 ${prefix}roubar
│ 𒁂〆 ${prefix}emojimix
│ 𒁂〆 ${prefix}emoji
└──────────────────

┌─「 ⚡ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 𝗕𝗔́𝗦𝗜𝗖𝗢𝗦 」
│ 𒁂〆 ${prefix}gtts (linguagem+texto)
│ 𒁂〆 ${prefix}tagme
│ 𒁂〆 ${prefix}placaloli
│ 𒁂〆 ${prefix}tabela
│ 𒁂〆 ${prefix}simi
│ 𒁂〆 ${prefix}perfil / fazernick
│ 𒁂〆 ${prefix}metadinha
│ 𒁂〆 ${prefix}tomp3
│ 𒁂〆 ${prefix}notas
│ 𒁂〆 ${prefix}rvvisu
│ 𒁂〆 ${prefix}pergunta
│ 𒁂〆 ${prefix}crimg
│ 𒁂〆 ${prefix}roubar
│ 𒁂〆 ${prefix}minha
│ 𒁂〆 ${prefix}signo
│ 𒁂〆 ${prefix}letra
│ 𒁂〆 ${prefix}aptoide_pesquisa
│ 𒁂〆 ${prefix}pesquisar
│ 𒁂〆 ${prefix}limpar
└──────────────────

╭──────────────────╮
│ 💻 ${NomeDoBot} — seu assistente inteligente!
╰──────────────────╯`;
};

// MENU DE ADMINISTRADORES
const adms = (prefix, sender) => {
  return `
╭━━⌈ 🛠 𝗠𝗘𝗡𝗨 𝗔𝗗𝗠𝗜𝗡𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
┃ 💡 Dica: ${prefix}info [comando]
╰━━━━━━━━━━━━━━━━━━╯

┌─「 ⚙️ 𝗖𝗢𝗡𝗙𝗜𝗚 𝗚𝗘𝗥𝗔𝗜𝗦 」
│ 𒁂〆 ${prefix}autobaixar
│ 𒁂〆 ${prefix}x9
│ 𒁂〆 ${prefix}autofigu
│ 𒁂〆 ${prefix}antilink
│ 𒁂〆 ${prefix}antiaudio
│ 𒁂〆 ${prefix}antiloc
│ 𒁂〆 ${prefix}antivideo
│ 𒁂〆 ${prefix}antifake
│ 𒁂〆 ${prefix}antilinkgp
│ 𒁂〆 ${prefix}antisticker
│ 𒁂〆 ${prefix}antiimg
│ 𒁂〆 ${prefix}advlink
│ 𒁂〆 ${prefix}advlinkgp
│ 𒁂〆 ${prefix}simih
│ 𒁂〆 ${prefix}sorteio
│ 𒁂〆 ${prefix}sorteionumeros
│ 𒁂〆 ${prefix}sorte
│ 𒁂〆 ${prefix}atividades
│ 𒁂〆 ${prefix}multiprefixo
│ 𒁂〆 ${prefix}prefixos
│ 𒁂〆 ${prefix}add_prefixo
│ 𒁂〆 ${prefix}tirar_prefixo
│ 𒁂〆 ${prefix}duelo
│ 𒁂〆 ${prefix}Bloqcmd
│ 𒁂〆 ${prefix}so_adm
│ 𒁂〆 ${prefix}mute
│ 𒁂〆 ${prefix}desmute
│ 𒁂〆 ${prefix}mutados
│ 𒁂〆 ${prefix}blockcmd
│ 𒁂〆 ${prefix}unblockcmd
│ 𒁂〆 ${prefix}listblockcmd
│ 𒁂〆 ${prefix}blockcmdg
│ 𒁂〆 ${prefix}unblockcmdg
│ 𒁂〆 ${prefix}listblockcmdg
│ 𒁂〆 ${prefix}antinotafake
│ 𒁂〆 ${prefix}addnota
│ 𒁂〆 ${prefix}remover
│ 𒁂〆 ${prefix}listanota
│ 𒁂〆 ${prefix}antipalavrão
│ 𒁂〆 ${prefix}addpalavra
│ 𒁂〆 ${prefix}delpalavra
│ 𒁂〆 ${prefix}listapalavrão
│ 𒁂〆 ${prefix}addautoban
│ 𒁂〆 ${prefix}apresentar
│ 𒁂〆 ${prefix}digt
│ 𒁂〆 ${prefix}papof
│ 𒁂〆 ${prefix}limite
│ 𒁂〆 ${prefix}limiteflood
│ 𒁂〆 ${prefix}limitecaracteres
└──────────────────

┌─「 👥 𝗠𝗘𝗠𝗕𝗥𝗢𝗦 」
│ 𒁂〆 ${prefix}listanegra
│ 𒁂〆 ${prefix}tirardalista
│ 𒁂〆 ${prefix}listban
│ 𒁂〆 ${prefix}advertir
│ 𒁂〆 ${prefix}band
│ 𒁂〆 ${prefix}ban
│ 𒁂〆 ${prefix}kick
│ 𒁂〆 ${prefix}promover
│ 𒁂〆 ${prefix}rebaixar
│ 𒁂〆 ${prefix}d
└──────────────────

┌─「 📋 𝗚𝗥𝗨𝗣𝗢 」
│ 𒁂〆 ${prefix}grupo
│ 𒁂〆 ${prefix}status
│ 𒁂〆 ${prefix}linkgp
│ 𒁂〆 ${prefix}grupoinfo
│ 𒁂〆 ${prefix}descgp
│ 𒁂〆 ${prefix}nomegp
│ 𒁂〆 ${prefix}legenda_estrangeiro
│ 𒁂〆 ${prefix}anotar
│ 𒁂〆 ${prefix}rm_aviso
│ 𒁂〆 ${prefix}rg_aviso
└──────────────────

┌─「 🏷 𝗜𝗡𝗧𝗘𝗥𝗔𝗖̧𝗔̃𝗢 」
│ 𒁂〆 ${prefix}Marcar
│ 𒁂〆 ${prefix}Marcar2
│ 𒁂〆 ${prefix}Hidetag
│ 𒁂〆 ${prefix}Ausente
│ 𒁂〆 ${prefix}voltei
└──────────────────

┌─「 🚫 𝗔𝗡𝗧𝗜-𝗦𝗣𝗔𝗠 」
│ 𒁂〆 ${prefix}limitarcomando
│ 𒁂〆 ${prefix}antipalavra
│ 𒁂〆 ${prefix}limpar
└──────────────────

┌─「 🗒 𝗔𝗡𝗢𝗧𝗔𝗖̧𝗢̃𝗘𝗦  」
│ 𒁂〆 ${prefix}anotações
│ 𒁂〆 ${prefix}tabelagp
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
│ 𒁂〆 ${prefix}configurar-bot
│ 𒁂〆 ${prefix}numero-dono
│ 𒁂〆 ${prefix}nick-dono
│ 𒁂〆 ${prefix}nome-bot
│ 𒁂〆 ${prefix}fotomenu
│ 𒁂〆 ${prefix}prefixo-bot
│ 𒁂〆 ${prefix}reiniciar
│ 𒁂〆 ${prefix}setprefixs
│ 𒁂〆 ${prefix}boton
│ 𒁂〆 ${prefix}botoff
│ 𒁂〆 ${prefix}bangp
│ 𒁂〆 ${prefix}unbangp
│ 𒁂〆 ${prefix}tempocmd
│ 𒁂〆 ${prefix}limitarcmd
└──────────────────

┌─「 👑 𝗣𝗥𝗘𝗠𝗜𝗨𝗠/𝗚𝗟𝗢𝗕𝗔𝗟 」
│ 𒁂〆 ${prefix}addgold
│ 𒁂〆 ${prefix}cmdpremium
│ 𒁂〆 ${prefix}addpremium
│ 𒁂〆 ${prefix}listaaluguel
│ 𒁂〆 ${prefix}aluguel_global
│ 𒁂〆 ${prefix}renovar_aluguel
│ 𒁂〆 ${prefix}rg_aluguel
│ 𒁂〆 ${prefix}rm_aluguel
└──────────────────

┌─「 🧰 𝗙𝗨𝗡𝗖̧𝗢̃𝗘𝗦 𝗗𝗢 𝗦𝗜𝗦𝗧𝗘𝗠𝗔 」
│ 𒁂〆 ${prefix}status
│ 𒁂〆 ${prefix}bemvindo (foto)
│ 𒁂〆 ${prefix}bemvindo2
│ 𒁂〆 ${prefix}legendabv
│ 𒁂〆 ${prefix}legendabv2
│ 𒁂〆 ${prefix}legendasaiu (foto)
│ 𒁂〆 ${prefix}legendasaiu2
│ 𒁂〆 ${prefix}botoff
│ 𒁂〆 ${prefix}antipv
│ 𒁂〆 ${prefix}antipv2
│ 𒁂〆 ${prefix}antipv3
│ 𒁂〆 ${prefix}dononogrupo
│ 𒁂〆 ${prefix}antiligar
│ 𒁂〆 ${prefix}bcgp
│ 𒁂〆 ${prefix}status
│ 𒁂〆 ${prefix}visualizarmsg
│ 𒁂〆 ${prefix}idgrupo
│ 𒁂〆 ${prefix}bloquear
│ 𒁂〆 ${prefix}desbloc
│ 𒁂〆 ${prefix}blocklist
│ 𒁂〆 ${prefix}clonar
│ 𒁂〆 ${prefix}reviverqr
│ 𒁂〆 ${prefix}sermembro
│ 𒁂〆 ${prefix}seradm
│ 𒁂〆 ${prefix}limitec
│ 𒁂〆 ${prefix}mete
│ 𒁂〆 ${prefix}convite
│ 𒁂〆 ${prefix}entrar
│ 𒁂〆 ${prefix}recusar
│ 𒁂〆 ${prefix}idgrupo
│ 𒁂〆 ${prefix}recolherlink
│ 𒁂〆 ${prefix}listlinks
│ 𒁂〆 ${prefix}recolherlinkgp
│ 𒁂〆 ${prefix}zerarlinks
└──────────────────`;
};

// MENU DE LOGOS
const menulogos = (prefix, sender) => {
  return `
╭━━⌈ 🎨 𝗠𝗘𝗡𝗨 𝗗𝗘 𝗟𝗢𝗚𝗢𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

🖋 Efeitos de Texto:
  𒁂〆 ${prefix}logos1 (texto)
──────────────────`;
};

// MENU DE EFEITOS
const efeitos = (prefix, sender) => {
  return `
╭━━⌈ 🖼 𝗘𝗙𝗘𝗜𝗧𝗢𝗦 𝗗𝗘 𝗜𝗠𝗔𝗚𝗘𝗠 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

📸 Aplicar em imagens marcadas:
  𒁂〆 ${prefix}legenda
  𒁂〆 ${prefix}procurado
  𒁂〆 ${prefix}preso
  𒁂〆 ${prefix}lixo
  𒁂〆 ${prefix}morto
  𒁂〆 ${prefix}deletem
  𒁂〆 ${prefix}lgbt
──────────────────`;
};

// MENU DE BRINCADEIRAS
const brincadeiras = (prefix, sender) => {
  return `
╭━━⌈ 🎉 𝗕𝗥𝗜𝗡𝗖𝗔𝗗𝗘𝗜𝗥𝗔𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

😂 Comandos com marcação:
  𒁂〆 ${prefix}golpe (@)
  𒁂〆 ${prefix}casal (@)
  𒁂〆 ${prefix}gay (@)
  𒁂〆 ${prefix}feio (@)
  𒁂〆 ${prefix}beijo (@)
  𒁂〆 ${prefix}tapa (@)
  𒁂〆 ${prefix}chance (@) 
  𒁂〆 ${prefix}matar (@)

🏆 Ranks e Diversão:
  𒁂〆 ${prefix}rankgay
  𒁂〆 ${prefix}rankcorno
  𒁂〆 ${prefix}rankgado
  𒁂〆 ${prefix}rankgostoso
  𒁂〆 ${prefix}rankgostosa
  𒁂〆 ${prefix}rankotakus
──────────────────`;
};

// MENU PREMIUM
const menuprem = (prefix, sender) => {
  return `
╭━━⌈ 💎 𝗠𝗘𝗡𝗨 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

🌟 Comandos Exclusivos:
  𒁂〆 Consulte ${prefix}cmdpremium
──────────────────`;
};

// MENU ALTERADORES
const alteradores = (prefix, sender) => {
  return `
╭━━⌈ 🎧 𝗔𝗟𝗧𝗘𝗥𝗔𝗗𝗢𝗥𝗘𝗦 ⌋━━╮
┃ 👤 Usuário: @${sender.split("@")[0]}
╰━━━━━━━━━━━━━━━━━━╯

🎥 Vídeo:
  𒁂〆 ${prefix}videolento
  𒁂〆 ${prefix}videorapido
  𒁂〆 ${prefix}videocontrario

🔊 Áudio:
  𒁂〆 ${prefix}audiolento
  𒁂〆 ${prefix}audiorapido
  𒁂〆 ${prefix}grave
  𒁂〆 ${prefix}bass
  𒁂〆 ${prefix}vozmenino
  𒁂〆 ${prefix}esquilo
──────────────────`;
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
};
