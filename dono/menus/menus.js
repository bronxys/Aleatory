const menu = (prefix, NomeDoBot, sender) => {
  return `
╭─「 🌊 *ᴍᴇɴᴜ* 🔥 」─╮
│ 👤 @${sender.split("@")[0]}
│ 🤖 ${NomeDoBot}
│ 💡 ${prefix}info [cmd]
╰─────────────────╯

╭─「 ⚙️ *ᴄᴏɴғɪɢs* 」
│ 么 ${prefix}ping
│ 么 ${prefix}configurar-bot
│ 么 ${prefix}bronxys
│ 么 ${prefix}tutorial
│ 么 ${prefix}novidades
│ 么 ${prefix}alugar
╰──────────╯

╭─「 💻 *ᴍᴇɴᴜs* 」
│ 么 ${prefix}menudono
│ 么 ${prefix}menuadm
│ 么 ${prefix}menupremium
│ 么 ${prefix}menugold
│ 么 ${prefix}menumidias
│ 么 ${prefix}efeitos
│ 么 ${prefix}logos
│ 么 ${prefix}brincadeiras
╰──────────╯

╭─「 👥 *ᴍᴇᴍʙʀᴏs* 」
│ 么 ${prefix}registrar
│ 么 ${prefix}delregistro
│ 么 ${prefix}perfil
│ 么 ${prefix}inforegistrar
│ 么 ${prefix}infoperfil
│ 么 ${prefix}advertidos
│ 么 ${prefix}mutados
│ 么 ${prefix}infoadv
│ 么 ${prefix}infomute
│ 么 ${prefix}infobot
│ 么 ${prefix}bug
│ 么 ${prefix}sugestao
│ 么 ${prefix}avalie
│ 么 ${prefix}reagir
│ 么 ${prefix}adms
│ 么 ${prefix}convite
│ 么 ${prefix}iniciar_forca
│ 么 ${prefix}jogodavelha (@)
│ 么 ${prefix}aleatory
│ 么 ${prefix}resumo
╰──────────╯

╭─「 📚 *ɪɴғᴏs* 」
│ 么 ${prefix}rankativo
│ 么 ${prefix}rankinativos
│ 么 ${prefix}atividades
│ 么 ${prefix}moedas
│ 么 ${prefix}esporte_noticias
│ 么 ${prefix}celular (ex: Xiaomi)
│ 么 ${prefix}letramusica (ex: sad)
│ 么 ${prefix}blocklist
│ 么 ${prefix}brasileiraoa
│ 么 ${prefix}brasileiraob
│ 么 ${prefix}tempo (cidade)
╰──────────╯

╭─「 ⚡ *ᴄᴏᴍᴀɴᴅᴏs* 」
│ 么 ${prefix}gtts (idioma+texto)
│ 么 ${prefix}tagme
│ 么 ${prefix}placaloli
│ 么 ${prefix}tabela
│ 么 ${prefix}simi
│ 么 ${prefix}metadinha
│ 么 ${prefix}tomp3
│ 么 ${prefix}notas
│ 么 ${prefix}rvvisu
│ 么 ${prefix}pergunta
│ 么 ${prefix}gerarimagem
│ 么 ${prefix}crimg
│ 么 ${prefix}roubar
│ 么 ${prefix}minha
│ 么 ${prefix}signo
│ 么 ${prefix}letra
│ 么 ${prefix}aptoide_pesquisa
│ 么 ${prefix}pesquisar
│ 么 ${prefix}limpar
│ 么 ${prefix}revelar
╰──────────╯
> 🤖 *${NomeDoBot}* • ᴏɴʟɪɴᴇ ✅
`;
};

const adms = (prefix, sender) => {
  return `
╭─『 🛡️ *ᴍᴇɴᴜ ᴀᴅᴍɪɴs* 』─╮
│ 👤 @${sender.split("@")[0]}
│ 💡 ${prefix}info [cmd]
╰─────────────────╯

╭─『 🔧 *ᴄᴏɴғɪɢs ɢᴇʀᴀɪs* 』
│ 〆 ${prefix}antistatus
│ 〆 ${prefix}autobaixar
│ 〆 ${prefix}x9
│ 〆 ${prefix}autofigu
│ 〆 ${prefix}antilink
│ 〆 ${prefix}antilink2
│ 〆 ${prefix}antiaudio
│ 〆 ${prefix}antiloc
│ 〆 ${prefix}antivideo
│ 〆 ${prefix}antifake
│ 〆 ${prefix}antilinkgp
│ 〆 ${prefix}antisticker
│ 〆 ${prefix}antiimg
│ 〆 ${prefix}advlink
│ 〆 ${prefix}advlinkgp
│ 〆 ${prefix}simih
│ 〆 ${prefix}simih2
│ 〆 ${prefix}sorteio
│ 〆 ${prefix}sorteionumeros
│ 〆 ${prefix}soadm
│ 〆 ${prefix}sorte
│ 〆 ${prefix}atividades
│ 〆 ${prefix}multiprefixo
│ 〆 ${prefix}prefixos
│ 〆 ${prefix}add_prefixo
│ 〆 ${prefix}tirar_prefixo
│ 〆 ${prefix}duelo
│ 〆 ${prefix}infoduelofig
│ 〆 ${prefix}Bloqcmd
│ 〆 ${prefix}so_adm
│ 〆 ${prefix}mute
│ 〆 ${prefix}desmute
│ 〆 ${prefix}mutados
│ 〆 ${prefix}blockcmd
│ 〆 ${prefix}unblockcmd
│ 〆 ${prefix}listblockcmd
│ 〆 ${prefix}blockcmdg
│ 〆 ${prefix}unblockcmdg
│ 〆 ${prefix}listblockcmdg
│ 〆 ${prefix}antinotafake
│ 〆 ${prefix}addnota
│ 〆 ${prefix}remover
│ 〆 ${prefix}listanota
│ 〆 ${prefix}antipalavrão
│ 〆 ${prefix}addpalavra
│ 〆 ${prefix}delpalavra
│ 〆 ${prefix}listapalavrão
│ 〆 ${prefix}addautoban
│ 〆 ${prefix}apresentar
│ 〆 ${prefix}digt
│ 〆 ${prefix}papof
│ 〆 ${prefix}limite
│ 〆 ${prefix}limiteflood
│ 〆 ${prefix}limitecaracteres
╰──────────╯

╭─『 👥 *ᴍᴇᴍʙʀᴏs* 』
│ 〆 ${prefix}mute
│ 〆 ${prefix}delmute
│ 〆 ${prefix}mutados
│ 〆 ${prefix}limparmute
│ 〆 ${prefix}infomute
│ 〆 ${prefix}adv
│ 〆 ${prefix}advertidos
│ 〆 ${prefix}deladv
│ 〆 ${prefix}deladv1
│ 〆 ${prefix}deladv2
│ 〆 ${prefix}limparadv
│ 〆 ${prefix}infoadv
│ 〆 ${prefix}deletar
│ 〆 ${prefix}perfil @
│ 〆 ${prefix}listanegra
│ 〆 ${prefix}tirardalista
│ 〆 ${prefix}listban
│ 〆 ${prefix}legenda_listanegra
│ 〆 ${prefix}infolistanegra
│ 〆 ${prefix}band
│ 〆 ${prefix}ban
│ 〆 ${prefix}kick
│ 〆 ${prefix}promover
│ 〆 ${prefix}rebaixar
│ 〆 ${prefix}d
╰──────────╯

╭─『 📋 *ɢʀᴜᴘᴏ* 』
│ 〆 ${prefix}aceitar
│ 〆 ${prefix}recusar
│ 〆 ${prefix}aviso
│ 〆 ${prefix}listaavisos
│ 〆 ${prefix}removeraviso
│ 〆 ${prefix}limparavisos
│ 〆 ${prefix}infoaviso
│ 〆 ${prefix}fechargp
│ 〆 ${prefix}abrirgp
│ 〆 ${prefix}listahorarios
│ 〆 ${prefix}delhorario
│ 〆 ${prefix}zerarhorarios
│ 〆 ${prefix}infofechargp
│ 〆 ${prefix}infoabrirgp
│ 〆 ${prefix}grupo
│ 〆 ${prefix}status
│ 〆 ${prefix}linkgp
│ 〆 ${prefix}grupoinfo
│ 〆 ${prefix}descgp
│ 〆 ${prefix}nomegp
│ 〆 ${prefix}legenda_estrangeiro
│ 〆 ${prefix}anotar
│ 〆 ${prefix}rm_aviso
│ 〆 ${prefix}rg_aviso
╰──────────╯

╭─『 🏷️ *ɪɴᴛᴇʀᴀᴄ̧ᴀ̃ᴏ* 』
│ 〆 ${prefix}Marcar
│ 〆 ${prefix}Marcar2
│ 〆 ${prefix}Hidetag
│ 〆 ${prefix}Ausente
│ 〆 ${prefix}voltei
╰──────────╯

╭─『 🚫 *ᴀɴᴛɪ-sᴘᴀᴍ* 』
│ 〆 ${prefix}limitarcomando
│ 〆 ${prefix}antipalavra
│ 〆 ${prefix}limpar
│ 〆 ${prefix}antispam
╰──────────╯

╭─『 🗒️ *ᴀɴᴏᴛᴀᴄ̧ᴏ̃ᴇs* 』
│ 〆 ${prefix}anotações
│ 〆 ${prefix}tabelagp
╰──────────╯`;
};

const menudono = (prefix, sender) => {
  return `
╭─〔 🔐 *ᴍᴇɴᴜ ᴅᴏɴᴏ* 〕─╮
│ 👤 @${sender.split("@")[0]}
│ 💡 ${prefix}info [cmd]
╰─────────────────╯

╭─〔 ⚙️ *ᴄᴏɴғɪɢs* 〕
│ 彡 ${prefix}configurar-bot
│ 彡 ${prefix}numero-dono
│ 彡 ${prefix}nick-dono
│ 彡 ${prefix}nome-bot
│ 彡 ${prefix}fotomenu
│ 彡 ${prefix}gifmenu
│ 彡 ${prefix}prefixo-bot
│ 彡 ${prefix}reiniciar
│ 彡 ${prefix}setprefixs
│ 彡 ${prefix}boton
│ 彡 ${prefix}botoff
│ 彡 ${prefix}bangp
│ 彡 ${prefix}unbangp
│ 彡 ${prefix}tempocmd
│ 彡 ${prefix}limitarcmd
│ 彡 ${prefix}limparcache
╰──────────╯

╭─〔 👑 *ᴘʀᴇᴍɪᴜᴍ / ɢʟᴏʙᴀʟ* 〕
│ 彡 ${prefix}addgold
│ 彡 ${prefix}cmdpremium
│ 彡 ${prefix}addpremium
│ 彡 ${prefix}delpremium
│ 彡 ${prefix}listapremium
│ 彡 ${prefix}addcmdpremium
│ 彡 ${prefix}delcmdpremium
│ 彡 ${prefix}alugar
│ 彡 ${prefix}alugarbot
│ 彡 ${prefix}alugados
│ 彡 ${prefix}alugado: <nome>
│ 彡 ${prefix}renovaraluguel
│ 彡 ${prefix}encerraraluguel
│ 彡 ${prefix}zeraraluguel
│ 彡 ${prefix}alertaaluguel
│ 彡 ${prefix}infoaluguel
╰──────────╯

╭─〔 📝 *ʀᴇɢɪsᴛʀᴏ* 〕
│ 彡 ${prefix}modoregistro
│ 彡 ${prefix}registrados
│ 彡 ${prefix}zerarregistros
│ 彡 ${prefix}inforegistro
│ 彡 ${prefix}aniversario
╰──────────╯

╭─〔 🧰 *sɪsᴛᴇᴍᴀ* 〕
│ 彡 ${prefix}status
│ 彡 ${prefix}bemvindo (foto)
│ 彡 ${prefix}bemvindo2
│ 彡 ${prefix}saiu (foto)
│ 彡 ${prefix}saiu2
│ 彡 ${prefix}legendabv (foto)
│ 彡 ${prefix}legendabv2
│ 彡 ${prefix}legendasaiu (foto)
│ 彡 ${prefix}legendasaiu2
│ 彡 ${prefix}fundobv
│ 彡 ${prefix}fundosaiu
│ 彡 ${prefix}infobemvindo
│ 彡 ${prefix}botoff
│ 彡 ${prefix}antipv
│ 彡 ${prefix}antipv2
│ 彡 ${prefix}antipv3
│ 彡 ${prefix}dononogrupo
│ 彡 ${prefix}antiligar
│ 彡 ${prefix}bcgp
│ 彡 ${prefix}status
│ 彡 ${prefix}visualizarmsg
│ 彡 ${prefix}idgrupo
│ 彡 ${prefix}bloquear
│ 彡 ${prefix}desbloc
│ 彡 ${prefix}blocklist
│ 彡 ${prefix}clonar
│ 彡 ${prefix}reviverqr
│ 彡 ${prefix}sermembro
│ 彡 ${prefix}seradm
│ 彡 ${prefix}limitec
│ 彡 ${prefix}mete
│ 彡 ${prefix}convite
│ 彡 ${prefix}entrar
│ 彡 ${prefix}recusar
│ 彡 ${prefix}idgrupo
│ 彡 ${prefix}recolherlink
│ 彡 ${prefix}listlinks
│ 彡 ${prefix}recolherlinkgp
│ 彡 ${prefix}zerarlinks
╰──────────╯`;
};

const menulogos = (prefix, sender) => {
  return `
╭─「 🎨 *ᴍᴇɴᴜ ʟᴏɢᴏs* 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 🖋️ *ᴇғᴇɪᴛᴏs ᴅᴇ ᴛᴇxᴛᴏ* 」
│ 乃 ${prefix}logos1 (texto)
╰──────────╯`;
};

const efeitos = (prefix, sender) => {
  return `
╭─「 🖼️ *ᴇғᴇɪᴛᴏs* 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 📸 *ɪᴍᴀɢᴇɴs* 」
│ 乃 ${prefix}legenda
│ 乃 ${prefix}procurado
│ 乃 ${prefix}preso
│ 乃 ${prefix}lixo
│ 乃 ${prefix}morto
│ 乃 ${prefix}deletem
│ 乃 ${prefix}lgbt
╰──────────╯`;
};

const brincadeiras = (prefix, sender) => {
  return `
╭─「 🎮 *ʙʀɪɴᴄᴀᴅᴇɪʀᴀs* 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 😂 *ᴍᴀʀᴄᴀᴄ̧ᴀ̃ᴏ* 」
│ 卄 ${prefix}golpe (@)
│ 卄 ${prefix}casal (@)
│ 卄 ${prefix}gay (@)
│ 卄 ${prefix}feio (@)
│ 卄 ${prefix}beijo (@)
│ 卄 ${prefix}tapa (@)
│ 卄 ${prefix}chance (@)
│ 卄 ${prefix}matar (@)
╰──────────╯

╭─「 🏆 *ʀᴀɴᴋs* 」
│ 卄 ${prefix}rankgay
│ 卄 ${prefix}rankcorno
│ 卄 ${prefix}rankgado
│ 卄 ${prefix}rankgostoso
│ 卄 ${prefix}rankgostosa
│ 卄 ${prefix}rankotakus
╰──────────╯

╭─「 🧠 *ǫᴜɪᴢ* 」
│ 卄 ${prefix}quiz
│ 卄 ${prefix}dica
│ 卄 ${prefix}revelar (adm)
│ 卄 ${prefix}cancelarquiz
╰──────────╯`;
};

const menuprem = (prefix, sender) => {
  return `
╭─「 💎 *ᴘʀᴇᴍɪᴜᴍ* 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 🌟 *ᴇxᴄʟᴜsɪᴠᴏs* 」
│ 丹 Consulte ${prefix}cmdpremium
╰──────────╯`;
};

const alteradores = (prefix, sender) => {
  return `
╭─「 🎧 *ᴀʟᴛᴇʀᴀᴅᴏʀᴇs* 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 🎥 *ᴠɪ́ᴅᴇᴏ* 」
│ 及 ${prefix}videolento
│ 及 ${prefix}videorapido
│ 及 ${prefix}videocontrario
╰──────────╯

╭─「 🔊 *ᴀ́ᴜᴅɪᴏ* 」
│ 及 ${prefix}audiolento
│ 及 ${prefix}audiorapido
│ 及 ${prefix}grave
│ 及 ${prefix}bass
│ 及 ${prefix}vozmenino
│ 及 ${prefix}esquilo
╰──────────╯`;
};

const menugold = (prefix, sender) => {
  return `
╭─『 🪙 *sɪsᴛᴇᴍᴀ ɢᴏʟᴅ* 』─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─『 💰 *sᴀʟᴅᴏ* 』
│ 丂 ${prefix}gold
│ 丂 ${prefix}statusgold
│ 丂 ${prefix}rankgold
╰──────────╯

╭─『 🎰 *ᴊᴏɢᴏs* 』
│ 丂 ${prefix}cassino
│ 丂 ${prefix}roletadasorte
│ 丂 ${prefix}quiznumero
│ 丂 ${prefix}apostargold
│ 丂 ${prefix}bolaogold <v>
│ 丂 ${prefix}pescargold
│ 丂 ${prefix}duelo @user
╰──────────╯

╭─『 🥷 *ᴄʀɪᴍᴇ* 』
│ 丂 ${prefix}roubargold @user
│ 丂 ${prefix}vingancagold @user
│ 丂 ${prefix}enviarcachaca @user
╰──────────╯

╭─『 🤝 *ᴇᴄᴏɴᴏᴍɪᴀ* 』
│ 丂 ${prefix}doargold @user/valor
│ 丂 ${prefix}minerar_gold
│ 丂 ${prefix}trabalhar
│ 丂 ${prefix}emprestargold @user/valor
╰──────────╯

╭─『 🛒 *ʟᴏᴊᴀ* 』
│ 丂 ${prefix}comprar vingancagold
│ 丂 ${prefix}comprar cachaca
│ 丂 ${prefix}comprar escudo
╰──────────╯

╭─『 ⚙️ *ᴀᴅᴍɪɴ* 』
│ 丂 ${prefix}modogold 1/0
│ 丂 ${prefix}addgold @user/valor
│ 丂 ${prefix}tirargold @user/valor
│ 💡 ${prefix}infogold
╰──────────╯`;
};

const menumidias = (prefix, sender) => {
  return `
╭─〘 📀 *ᴍᴇɴᴜ ᴍɪ́ᴅɪᴀs* 🎬 〙─╮
│ 👤 @${sender.split("@")[0]}
│ 💡 ${prefix}info [cmd]
╰─────────────────╯

╭─〘 📥 *ᴅᴏᴡɴʟᴏᴀᴅs* 〙
│ 乂 ${prefix}transcrever (áudio)
│ 乂 ${prefix}play / playdoc
│ 乂 ${prefix}play_video
│ 乂 ${prefix}tiktok
│ 乂 ${prefix}instagram
│ 乂 ${prefix}facebook
│ 乂 ${prefix}face_audio
│ 乂 ${prefix}tiktok_audio
│ 乂 ${prefix}insta_video
│ 乂 ${prefix}insta_audio
│ 乂 ${prefix}ytmp4
│ 乂 ${prefix}ytmp3
│ 乂 ${prefix}twitter
│ 乂 ${prefix}twitter_audio
│ 乂 ${prefix}playstore
│ 乂 ${prefix}ytsearch
│ 乂 ${prefix}spotify
│ 乂 ${prefix}kwai
│ 乂 ${prefix}threads
│ 乂 ${prefix}sound
│ 乂 ${prefix}amazon (ex: celular)
│ 乂 ${prefix}grupos (ex: Naruto)
│ 乂 ${prefix}mediafire
╰──────────╯

╭─〘 🎭 *ғɪɢᴜʀɪɴʜᴀs* 〙
│ 乂 ${prefix}sticker
│ 乂 ${prefix}fstiker
│ 乂 ${prefix}attp (texto)
│ 乂 ${prefix}sticker (foto)
│ 乂 ${prefix}toimg / togif (figu)
│ 乂 ${prefix}rename
│ 乂 ${prefix}figurinhas (ex: 5)
│ 乂 ${prefix}fig
│ 乂 ${prefix}figmeme
│ 乂 ${prefix}figanime
│ 乂 ${prefix}figcoreana
│ 乂 ${prefix}figraiva
│ 乂 ${prefix}figemoji
│ 乂 ${prefix}figroblox
│ 乂 ${prefix}figengracada
│ 乂 ${prefix}figdesenho
│ 乂 ${prefix}sfundo
│ 乂 ${prefix}roubar
│ 乂 ${prefix}emojimix
│ 乂 ${prefix}emoji
╰──────────╯
> 📀 *ᴍɪ́ᴅɪᴀs* • ᴏɴʟɪɴᴇ ✅
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
