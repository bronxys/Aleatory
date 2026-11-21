// ALEATORY BOT v9.0 — MENUS — Edição de Natal 🎄
// By Josival & M.Scheyot • bronxyshost.com

const menu = (prefix, NomeDoBot, sender) => {
  return `
╭─「 🎄 *ᴍᴇɴᴜ* ❄ 」─╮
│ 👤 @${sender.split("@")[0]}
│ 🤖 ${NomeDoBot} v9.0 🎄
│ 💡 ${prefix}info [cmd]
╰───────────╯

╭─「 🎄 ᴄᴏɴғɪɢs 」
│ 么 ${prefix}novidades
│ 么 ${prefix}bot
│ 么 ${prefix}duvida
│ 么 ${prefix}tutorial
│ 么 ${prefix}ping
│ 么 ${prefix}configurar-bot
│ 么 ${prefix}alugar
│ 么 ${prefix}menudono
│ 么 ${prefix}menuadm
│ 么 ${prefix}menupremium
│ 么 ${prefix}menugold
│ 么 ${prefix}menumidias
│ 么 ${prefix}efeitos
│ 么 ${prefix}logos
│ 么 ${prefix}brincadeiras
│ 么 ${prefix}alteradores
╰──────────╯
╭─「 ⛄ ᴍᴇᴍʙʀᴏs 」
│ 么 ${prefix}registrar
│ 么 ${prefix}perfil
│ 么 ${prefix}adms
│ 么 ${prefix}advertidos
│ 么 ${prefix}mutados
│ 么 ${prefix}votarban "@"
│ 么 ${prefix}resumo
│ 么 ${prefix}reagir
│ 么 ${prefix}convite
╰─────────╯

╭─「 🎅 ɪɴғᴏs 」
│ 么 ${prefix}rankativo
│ 么 ${prefix}rankinativos
│ 么 ${prefix}moedas
│ 么 ${prefix}esporte_noticias
│ 么 ${prefix}celular "modelo"
│ 么 ${prefix}letramusica
│ 么 ${prefix}tempo "cidade"
╰─────────╯

╭─「 ⛄ ᴄᴏᴍᴀɴᴅᴏs 」
│ 么 ${prefix}ia "pergunte"
│ 么 ${prefix}pesquisar
│ 么 ${prefix}play "música"
│ 么 ${prefix}sticker
│ 么 ${prefix}tiktok "link"
│ 么 ${prefix}gtts "texto"
│ 么 ${prefix}tagme
│ 么 ${prefix}signo
│ 么 ${prefix}pergunta
│ 么 ${prefix}revelar
│ 么 ${prefix}transcrever
╰─────────╯
> 🤖 ${NomeDoBot} v9.0 🎄 • ᴏɴʟɪɴᴇ ✅
  _bronxyshost.com_
`;
};

const adms = (prefix, sender) => {
  return `
╭─「 🎄 *ᴍᴇɴᴜ ᴀᴅᴍɪɴs* 🎄 」─╮
│ 👤 @${sender.split("@")[0]}
│ 💡 ${prefix}info [cmd]
╰─────────────────╯

╭─「 🎄 ᴄᴏᴍᴀɴᴅᴏs 」
│ 么 ${prefix}antilink
│ 么 ${prefix}antilink2
│ 么 ${prefix}antilinkgp
│ 么 ${prefix}antifake
│ 么 ${prefix}antiaudio
│ 么 ${prefix}antiloc
│ 么 ${prefix}antivideo
│ 么 ${prefix}antiimg
│ 么 ${prefix}antisticker
│ 么 ${prefix}antinotafake
│ 么 ${prefix}antipalavrão
│ 么 ${prefix}advlink
│ 么 ${prefix}advlinkgp
│ 么 ${prefix}adv "@"
│ 么 ${prefix}deladv "@"
│ 么 ${prefix}advertidos
│ 么 ${prefix}limparadv
│ 么 ${prefix}addpalavra "X"
│ 么 ${prefix}delpalavra "X"
│ 么 ${prefix}listapalavrão
│ 么 ${prefix}addnota
│ 么 ${prefix}listanota
│ 么 ${prefix}mute "@"
│ 么 ${prefix}delmute "@"
│ 么 ${prefix}mutados
│ 么 ${prefix}limparmute
│ 么 ${prefix}ban "@"
│ 么 ${prefix}kick "@"
│ 么 ${prefix}votarban "@"
│ 么 ${prefix}cancelarvoto
│ 么 ${prefix}statusvoto
│ 么 ${prefix}promover "@"
│ 么 ${prefix}rebaixar "@"
│ 么 ${prefix}listanegra
│ 么 ${prefix}tirardalista
│ 么 ${prefix}deletar
│ 么 ${prefix}addautoban
│ 么 ${prefix}aceitar
│ 么 ${prefix}recusar
│ 么 ${prefix}solicitacoes
│ 么 ${prefix}aviso "texto"
│ 么 ${prefix}listaavisos
│ 么 ${prefix}removeraviso
│ 么 ${prefix}limparavisos
│ 么 ${prefix}fechargp
│ 么 ${prefix}abrirgp
│ 么 ${prefix}listahorarios
│ 么 ${prefix}delhorario
│ 么 ${prefix}linkgp
│ 么 ${prefix}grupoinfo
│ 么 ${prefix}descgp "texto"
│ 么 ${prefix}nomegp "nome"
│ 么 ${prefix}anotar
│ 么 ${prefix}Marcar
│ 么 ${prefix}Hidetag
│ 么 ${prefix}Ausente
│ 么 ${prefix}voltei
│ 么 ${prefix}simih
│ 么 ${prefix}simih2
│ 么 ${prefix}soadm
│ 么 ${prefix}so_adm
│ 么 ${prefix}sorteio
│ 么 ${prefix}sorteionumeros
│ 么 ${prefix}autofigu
│ 么 ${prefix}autobaixar
│ 么 ${prefix}blockcmd "cmd"
│ 么 ${prefix}unblockcmd "cmd"
│ 么 ${prefix}blockcmdg "cmd"
│ 么 ${prefix}unblockcmdg "cmd"
│ 么 ${prefix}listblockcmd
│ 么 ${prefix}limparblockcmd
│ 么 ${prefix}limite
│ 么 ${prefix}limiteflood
│ 么 ${prefix}multiprefixo
│ 么 ${prefix}atividades
│ 么 ${prefix}x9
│ 么 ${prefix}antistatus
│ 么 ${prefix}duelo
╰──────────╯
> 🎄 ᴍᴇɴᴜ ᴀᴅᴍɪɴs • ᴀʟᴇᴀᴛᴏʀʏ 🎄
`;
};

const menudono = (prefix, sender) => {
  return `
╭─「 🎅 *ᴍᴇɴᴜ ᴅᴏɴᴏ* 🎅 」─╮
│ 👤 @${sender.split("@")[0]}
│ 💡 ${prefix}info [cmd]
╰─────────────────╯

╭─「 🎅 ᴄᴏᴍᴀɴᴅᴏs 」
│ 么 ${prefix}numero-dono
│ 么 ${prefix}nick-dono
│ 么 ${prefix}nome-bot
│ 么 ${prefix}fotomenu
│ 么 ${prefix}gifmenu
│ 么 ${prefix}configurar-bot
│ 么 ${prefix}prefixo-bot
│ 么 ${prefix}setprefixs
│ 么 ${prefix}reiniciar
│ 么 ${prefix}boton
│ 么 ${prefix}botoff
│ 么 ${prefix}iaaleatory
│ 么 ${prefix}iapv
│ 么 ${prefix}addpremium "@"
│ 么 ${prefix}delpremium "@"
│ 么 ${prefix}listapremium
│ 么 ${prefix}cmdpremium
│ 么 ${prefix}alugarbot
│ 么 ${prefix}alugados
│ 么 ${prefix}renovaraluguel
│ 么 ${prefix}encerraraluguel
│ 么 ${prefix}pausaraluguel
│ 么 ${prefix}retomaraluguel
│ 么 ${prefix}statsaluguel
│ 么 ${prefix}historicoaluguel
│ 么 ${prefix}status
│ 么 ${prefix}bemvindo
│ 么 ${prefix}saiu
│ 么 ${prefix}legendabv
│ 么 ${prefix}legendasaiu
│ 么 ${prefix}fundobv
│ 么 ${prefix}fundosaiu
│ 么 ${prefix}antipv
│ 么 ${prefix}antipv2
│ 么 ${prefix}antipv3
│ 么 ${prefix}antiligar
│ 么 ${prefix}bcgp "texto"
│ 么 ${prefix}divulgar "texto"
│ 么 ${prefix}divulgarflood [1-100] "texto"
│ 么 ${prefix}cancelardivulgar
│ 么 ${prefix}statusdivulgar
│ 么 ${prefix}novidadesgrupos
│ 么 ${prefix}visualizarmsg
│ 么 ${prefix}entrar "link"
│ 么 ${prefix}recusarconvite
│ 么 ${prefix}recolherlink
│ 么 ${prefix}listlinks
│ 么 ${prefix}bloquear "@"
│ 么 ${prefix}desbloc "@"
│ 么 ${prefix}nuke
│ 么 ${prefix}modoregistro
│ 么 ${prefix}registrados
│ 么 ${prefix}zerarregistros
│ 么 ${prefix}aniversario
╰──────────╯
> 🎅 ᴍᴇɴᴜ ᴅᴏɴᴏ • ᴀʟᴇᴀᴛᴏʀʏ 🎄
`;
};

const menulogos = (prefix, sender) => {
  return `
╭─「 ✨ *ᴍᴇɴᴜ ʟᴏɢᴏs* ✨ 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 🎄 ᴇғᴇɪᴛᴏs 」
│ 么 ${prefix}logos1 "texto"
╰──────────╯
> ✨ ᴍᴇɴᴜ ʟᴏɢᴏs • ᴀʟᴇᴀᴛᴏʀʏ ❄
`;
};

const efeitos = (prefix, sender) => {
  return `
╭─「 ❄ *ᴍᴇɴᴜ ᴇғᴇɪᴛᴏs* ❄ 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 ❄ ɪᴍᴀɢᴇɴs 」
│ 么 ${prefix}legenda
│ 么 ${prefix}procurado
│ 么 ${prefix}preso
│ 么 ${prefix}lixo
│ 么 ${prefix}morto
│ 么 ${prefix}deletem
│ 么 ${prefix}lgbt
╰──────────╯
> ❄ ᴍᴇɴᴜ ᴇғᴇɪᴛᴏs • ᴀʟᴇᴀᴛᴏʀʏ ⛄
`;
};

const brincadeiras = (prefix, sender) => {
  return `
╭─「 ⛄ *ʙʀɪɴᴄᴀᴅᴇɪʀᴀs* ⛄ 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 ⛄ ᴄᴏᴍᴀɴᴅᴏs 」
│ 么 ${prefix}casal "@"
│ 么 ${prefix}beijo "@"
│ 么 ${prefix}tapa "@"
│ 么 ${prefix}matar "@"
│ 么 ${prefix}chance "@"
│ 么 ${prefix}golpe "@"
│ 么 ${prefix}gay "@"
│ 么 ${prefix}feio "@"
│ 么 ${prefix}rankgay
│ 么 ${prefix}rankcorno
│ 么 ${prefix}rankgado
│ 么 ${prefix}rankgostoso
│ 么 ${prefix}rankgostosa
│ 么 ${prefix}rankotakus
│ 么 ${prefix}quiz
│ 么 ${prefix}dica
│ 么 ${prefix}iniciar_forca
│ 么 ${prefix}jogodavelha "@"
╰──────────╯
> ⛄ ʙʀɪɴᴄᴀᴅᴇɪʀᴀs • ᴀʟᴇᴀᴛᴏʀʏ 🎄
`;
};

const menuprem = (prefix, sender) => {
  return `
╭─「 🎁 *ᴍᴇɴᴜ ᴘʀᴇᴍɪᴜᴍ* 🎁 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 🎅 ᴇxᴄʟᴜsɪᴠᴏs 」
│ 么 ${prefix}cmdpremium
│ 么 _Comandos exclusivos VIP_
╰──────────╯
> 🎁 ᴍᴇɴᴜ ᴘʀᴇᴍɪᴜᴍ • ᴀʟᴇᴀᴛᴏʀʏ ❄
`;
};

const alteradores = (prefix, sender) => {
  return `
╭─「 🔔 *ᴀʟᴛᴇʀᴀᴅᴏʀᴇs* 🔔 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 🎄 ᴄᴏᴍᴀɴᴅᴏs 」
│ 么 ${prefix}videolento
│ 么 ${prefix}videorapido
│ 么 ${prefix}videocontrario
│ 么 ${prefix}audiolento
│ 么 ${prefix}audiorapido
│ 么 ${prefix}grave
│ 么 ${prefix}bass
│ 么 ${prefix}vozmenino
│ 么 ${prefix}esquilo
╰──────────╯
> 🔔 ᴀʟᴛᴇʀᴀᴅᴏʀᴇs • ᴀʟᴇᴀᴛᴏʀʏ ❄
`;
};

const menugold = (prefix, sender) => {
  return `
╭─「 ⭐ *sɪsᴛᴇᴍᴀ ɢᴏʟᴅ* ⭐ 」─╮
│ 👤 @${sender.split("@")[0]}
╰─────────────────╯

╭─「 🎄 ᴄᴏᴍᴀɴᴅᴏs 」
│ 么 ${prefix}gold
│ 么 ${prefix}statusgold
│ 么 ${prefix}rankgold
│ 么 ${prefix}cassino
│ 么 ${prefix}roletadasorte
│ 么 ${prefix}quiznumero
│ 么 ${prefix}apostargold
│ 么 ${prefix}bolaogold
│ 么 ${prefix}pescargold
│ 么 ${prefix}duelo "@"
│ 么 ${prefix}roubargold "@"
│ 么 ${prefix}vingancagold "@"
│ 么 ${prefix}enviarcachaca "@"
│ 么 ${prefix}doargold "@"/valor
│ 么 ${prefix}minerar_gold
│ 么 ${prefix}trabalhar
│ 么 ${prefix}emprestargold "@"/valor
│ 么 ${prefix}comprar vingancagold
│ 么 ${prefix}comprar cachaca
│ 么 ${prefix}comprar escudo
╰──────────╯
> ⭐ sɪsᴛᴇᴍᴀ ɢᴏʟᴅ • ᴀʟᴇᴀᴛᴏʀʏ 🎄
`;
};

const menumidias = (prefix, sender) => {
  return `
╭─「 🎁 *ᴍᴇɴᴜ ᴍɪ́ᴅɪᴀs* 🎁 」─╮
│ 👤 @${sender.split("@")[0]}
│ 💡 ${prefix}info [cmd]
╰─────────────────╯

╭─「 🎁 ᴄᴏᴍᴀɴᴅᴏs 」
│ 么 ${prefix}play "música"
│ 么 ${prefix}playdoc "música"
│ 么 ${prefix}play_video
│ 么 ${prefix}tiktok "link"
│ 么 ${prefix}tiktok_audio "link"
│ 么 ${prefix}instagram "link"
│ 么 ${prefix}insta_audio "link"
│ 么 ${prefix}facebook "link"
│ 么 ${prefix}face_audio "link"
│ 么 ${prefix}ytmp3 "link"
│ 么 ${prefix}ytmp4 "link"
│ 么 ${prefix}twitter "link"
│ 么 ${prefix}twitter_audio
│ 么 ${prefix}spotify "link"
│ 么 ${prefix}ytsearch "busca"
│ 么 ${prefix}kwai "link"
│ 么 ${prefix}threads "link"
│ 么 ${prefix}sound "nome"
│ 么 ${prefix}playstore "app"
│ 么 ${prefix}amazon "produto"
│ 么 ${prefix}mediafire "link"
│ 么 ${prefix}transcrever •áudio•
│ 么 ${prefix}sticker
│ 么 ${prefix}fstiker
│ 么 ${prefix}attp "texto"
│ 么 ${prefix}toimg
│ 么 ${prefix}togif
│ 么 ${prefix}rename "nome"
│ 么 ${prefix}roubar
│ 么 ${prefix}figurinhas "qtd"
│ 么 ${prefix}fig
│ 么 ${prefix}figmeme
│ 么 ${prefix}figanime
│ 么 ${prefix}figcoreana
│ 么 ${prefix}figraiva
│ 么 ${prefix}figemoji
│ 么 ${prefix}figroblox
│ 么 ${prefix}figengracada
│ 么 ${prefix}figdesenho
│ 么 ${prefix}sfundo
│ 么 ${prefix}emojimix "😀+😈"
│ 么 ${prefix}emoji "😀"
│ 么 ${prefix}audiolento
│ 么 ${prefix}audiorapido
│ 么 ${prefix}grave
│ 么 ${prefix}bass
│ 么 ${prefix}videolento
│ 么 ${prefix}videorapido
╰──────────╯
> 🎁 ᴍᴇɴᴜ ᴍɪ́ᴅɪᴀs • ᴀʟᴇᴀᴛᴏʀʏ ⛄
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
