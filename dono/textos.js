// TOMEM CUIDADO, UMA VIRGULA, ATÉ UM ACENTO ERRADO PODE CAUSAR ERRO, SALVE ANTES DE ALTERAR PARA EVITAR PROBLEMAS.

const TEXTOS_GERAL = {
  MENSAGEM_DE_SO_USAR_EM_GRUPO: `> 🫵🏻 Ô seu fresquinho este comando só deve ser utilizado em grupos, rala daqui pnc do carai 🖕🏿🤬`,

  MENSAGEM_DE_SO_DONO_USAR_COMANDOS: `> 🫵🏻 eii. este comando é apenas para o meu dono utilizar :(`,

  MENSAGEM_DE_SO_ADM_CONSEGUIR_USAR_X_COMANDO: `> somente Admin pode utilizar este comando rsrs...`,

  MENSAGEM_DE_QUANDO_O_BOT_NAO_E_ADM: `> 🫵🏻 Ô Bot precisa ser Admiro do grupo para utilizar este comando.🫡`,

  // O #prefixo# é padrão para mostrar o prefixo do bot.

  MENSAGEM_DE_SO_QUANDO_MODO_BRINCADEIRA_FOR_ATIVO: `Este comando so pode ser utilizado com o comando #prefixo#modobrincadeira ativado, para desativar só basta usar o comando novamente 🥱`,

  MENSAGENS_DE_AGUARDE: [
    "⏳ Segura que tá quase pronto… Scheyot tá supervisionando cada detalhe! 🚀",
    "😂 Rafael digitando mais rápido que internet de restaurante 🤣",
    "🎵 ‘I’m gonna take my horse to the old town road’… já já vem! 🎶",
    "💡 Pensando… Luanna tá resolvendo o enigma da vez 🧩",
    "😎 Aguenta firme! Josival criou o bot e Scheyot confere ✌️",
    "🔥 Quase lá, só um segundo… Scheyot tá garantindo que não travar 🎺",
    "💬 Digitando rápido, Josival quase pulou da cadeira 😏",
    "🎵 ‘Hit me baby one more time’… só mais um instante 🎶",
    "😂 Segura a emoção… quase igual meme do gato surpreso 😹",
    "⏳ Tá chegando! bronxyshost.com tá dando aquele boost 💨",
    "💥 Preparando surpresa… Scheyot tá revisando tudo 🍦",
    "💡 Pensando na jogada perfeita, Luanna ativou o modo ninja 🥷",
    "😎 Quase pronto! Rafael tá finalizando os ajustes ✌️",
    "🎵 ‘Don’t stop me now’… Scheyot dá o aval 🎶",
    "😂 Segura, quase igual piada de tio no churrasco 😏",
    "⏳ Aguarda só mais um pouco… Josival tá de olho ⏱️",
    "💬 Digitando… Scheyot tá conferindo ⚡",
    "🎵 ‘Can’t stop the feeling’… vem coisa boa! 🎶",
    "💡 Ideia maluca ativada… parece pizza de sushi, mas tá funcionando 🍕🍣",
    "😎 Já quase liberado… bronxyshost.com acelerando 🚀",
    "🔥 Luanna agilizando… Scheyot conferindo ⚡",
    "😂 Segura que vem… parecido com meme do cachorro no skate 🐶🛹",
    "⏳ Só mais um instante, Josival tá supervisionando ⏱️",
    "🎵 ‘Shape of you’… já já vem! 🎶",
    "💬 Digitando rápido… Scheyot tá rindo no fundo 😏",
    "💥 Preparando surpresa, quase igual bolo que nunca quebra 🎂",
    "💡 Ideia brilhante ativada… Scheyot aprovou 🎨",
    "😎 Quase liberado… Rafael tá no teclado insano ✌️",
    "🎵 ‘Levitating’… aguenta aí! 🎶",
    "😂 Segura que vem… quase igual o Wi-Fi do vizinho 😹",
    "⏳ bronxyshost.com tá no suporte, Scheyot supervisiona 🚀",
    "💬 Digitando… Luanna tá concentrada ⚡",
    "🎵 ‘Uptown Funk’… Scheyot confere! 🎶",
    "💡 Ideia maluca ativada… parece sorvete de bacon 🍦🥓",
    "😎 Quase lá… Josival tá supervisionando ✌️",
    "🔥 Preparando resposta… Josival tá atento! ⚡",
    "😂 Segura, quase igual meme do bebê dançando 🍼💃",
    "⏳ Só mais um instante, Rafael tá revisando ⏱️",
    "💬 Digitando rápido… bronxyshost.com tá ajudando ⚡",
    "🎵 ‘All the single ladies’… Scheyot conferindo! 🎶",
    "💡 Pensamento estratégico ativado… parece trocadilho sem sentido 😏",
    "😎 Quase liberado… Luanna tá agilizando ✌️",
    "🔥 Preparando resposta especial… Josival tá atento 😎",
    "😂 Segura que vem… quase igual pizza de café ☕🍕",
    "⏳ Aguarda só mais um pouco, Josival tá de olho ⏱️",
    "💬 Digitando… bronxyshost.com tá acelerando ⚡",
    "🎵 ‘Happy’… já já tá pronto! 🎶",
    "💡 Ideia divertida… Scheyot tá conferindo 🐱🎧",
    "😎 Quase lá, Rafael tá finalizando ajustes ✌️",
    "🔥 Preparando… Josival revisando! ⚡",
    "😂 Segura, quase igual abacaxi no hambúrguer 🍍🍔",
    "⏳ Aguarda só mais um pouco, Luanna tá na função ⏱️",
    "💬 Digitando… quase pronto ⚡",
    "🎵 ‘Don’t start now’… vem coisa boa! 🎶",
    "😂 Segura, quase igual meme do cachorro que cai da cama 🐶🛏️",
    "💥 Quase liberado 🚀",
    "💡 Ideia ativada… parece pizza com chocolate 🍕🍫",
    "😎 Tá chegando! ✌️",
    "⏳ Só mais um instante ⏱️",
    "💬 Digitando rápido ⚡",
    "🎵 ‘Savage love’… vem coisa boa! 🎶",
    "😂 Segura, quase igual meme do gato pianista 😹🎹",
    "🔥 Quase liberado 🚀",
    "💡 Pensamento estratégico… quase igual trocadilho ruim 😏",
    "😎 Já já tá pronto! ✌️",
    "⏳ Aguarda só mais um pouco ⏱️",
    "💬 Digitando… segura ⚡",
    "🎵 ‘Memories’… já já vem! 🎶",
    "😂 Relaxa, quase igual meme do bebê com limão 😆🍋",
    "💥 Quase liberado 🚀",
    "💡 Pensamento ativado… parece meme que ninguém entende 😹",
    "😎 Quase lá! ✌️",
    "⏳ Aguarda só mais um instante ⏱️",
    "💬 Digitando rápido ⚡",
    "🎵 ‘Levitating’… vem coisa boa! 🎶",
    "😂 Segura que tá chegando 😏",
    "🔥 Quase liberado 🚀",
    "💡 Ideia estratégica… Josival tá conferindo 🧠",
    "😎 Já já sai! ✌️",
    "⏳ Aguenta só mais um pouco ⏱️",
    "💬 Digitando… Luanna tá agilizando ⚡",
    "😂 Rafael digitando tão rápido que parece meme de internet 1Gbps ⚡",
    "😎 Scheyot supervisionando a bagunça, quase lá! ✌️",
    "🎵 ‘Watermelon sugar’… já já vem! 🍉🎶",
    "💡 Bronxyshost.com dando aquele turbo no processo 🚀",
    "😂 Segura… quase igual meme do gato hacker 😹💻",
    "🔥 Luanna agilizando a resposta, quase pronto! ⚡",
    "😎 Rafael conferindo a brincadeira 😏",
    "⏳ Josival tá de olho na situação ⏱️",
    "💬 Digitando… Scheyot conferindo ⚡",
    "🎵 ‘Blinding lights’… quase pronto! 🎶",
    "😂 Segura que vem… meme do bebê com óculos de sol 🍼😎",
    "💥 Quase liberado 🚀",
    "💡 Ideia ativada… parece pizza com sushi 🍕🍣",
    "😎 Quase lá! ✌️",
    "⏳ Aguarda só mais um instante ⏱️",
    "💬 Digitando rápido ⚡",
    "🎵 ‘Don’t stop me now’… vem coisa boa! 🎶",
    "😂 Segura, quase igual meme do bebê dançando 🍼💃",
    "🔥 Quase liberado 🚀",
    "💡 Ideia divertida… Josival tá conferindo 🧠",
    "😎 Já quase pronto! ✌️",
    "⏳ Aguarda só mais um pouco ⏱️",
    "💬 Digitando… Luanna tá agilizando ⚡",
  ],

  // LINK DA IMAGEM DO COMANDO DE CASAL
  LINK_COMANDO_CASAL: "https://xatimg.com/image/K88c2BkQwlcF.jpg",

  // TEXTO DO COMANDO DE CASAL // O #porcentagem# vai puxar de 0 a 100.
  TEXTO_COMANDO_CASAL: `🌟 Casal do grupo com ॐ #porcentagem# ✨ de chance pra da certo 😏:`,

  // PALAVRAS QUE SÃO PROIBIDAS DO SIMIH FALAR.
  PALAVRAS_PROIBIDA_DE_O_SIMI_FALAR: [
    "porra",
    "carai",
    "caralho",
    "buceta",
    "bct",
    "teu cu",
    "meu pau",
    "minha chibata",
    "pika",
    "seu cu",
    "sexo",
    "gozar",
    "gozei",
  ],

  COMANDO_BAN_MENSAGEM: `#usuario# 𝘾𝘼𝙄 𝙁𝙊𝙍𝘼 🏌🏻‍♂️`,

  COMANDO_PROMOVEU_MENSAGEM: `#usuario# Foi promovido para adm, agora bora mostrar serviços 🤦`,

  COMANDO_REBAIXOU_MENSAGEM: `#usuario# Foi Rebaixado para [ MEMBRO COMUM ] Chora não, Coleguinha 🥹`,

  // QUISER QUE O ANTI LINK, ENVIE MENSAGEM, SÓ MUDAR O 0 PARA A MENSAGEM DE REMOÇÃO, OU ENTÃO, DEIXA 0, SE QUISER DEIXAR SEM MENSAGEM, SÓ VOLTAR PRO 0 DENOVO.
  TEXTO_REMOCAO_ANTI_LINK: `🤺_𝘼𝙦𝙪𝙞 𝙣𝙖‌𝙤 𝙥𝙤𝙙𝙚 𝙢𝙖𝙣𝙙𝙖𝙧 ~(𝗟𝗜𝗡𝗞𝘀)~ 𝙣𝙖‌𝙤 𝙡𝙚𝙪 𝙖𝙨 𝙍𝙚𝙜𝙧𝙖𝙨 🤔`,

  LIMITE_CARACTERES_MSG:
    "🏌🏻‍♂️_𝙑𝙖𝙯𝙖 𝙙𝙖𝙦𝙪𝙞 𝘾𝙖𝙧𝙣𝙞𝙘̧𝙖!  𝙇𝙚𝙧 𝙖 𝙥𝙤𝙧𝙧𝙖 𝙙𝙖𝙨 𝙍𝙚𝙜𝙧𝙖𝙨  𝙦𝙪𝙖𝙣𝙙𝙤 𝙚𝙣𝙩𝙧𝙖𝙧 𝙚𝙢 𝙂𝙧𝙪𝙥𝙤𝙨_🤺",

  LISTA_NEGRA_GLOBAL_MENSAGEM:
    "🫵🏻 𝙊𝙡𝙝𝙖 𝙦𝙪𝙚𝙢 𝙙𝙚𝙪 𝙖𝙨 𝘾𝙖𝙧𝙖𝙨 𝙥𝙤𝙧 𝙖𝙦𝙪𝙞.  𝘼𝙦𝙪𝙞 𝙫𝙤𝙘𝙚̂ 𝙣𝙖̃𝙤 𝙫𝙖𝙞 𝙗𝙖𝙜𝙪𝙣𝙘̧𝙖 𝙣𝙖̃𝙤!  𝙎𝙞𝙣𝙩𝙖 𝙤 𝙥𝙤𝙙𝙚𝙧 𝙙𝙤 𝘽𝙖𝙣 🤬\n🤺_𝗩𝗔𝗭𝗔 𝗖𝗔𝗕𝗔𝗖̧𝗢_🏌",

  MENSAGEM_GRUPO_ABRIU:
    "🚨>𝗚𝗥𝗨𝗣𝗢 𝗔𝗕𝗘𝗥𝗧𝗢<🚨\n𝘽𝙤𝙧𝙖 𝙛𝙤𝙛𝙤𝙘𝙖𝙧 𝙜𝙖𝙡𝙚𝙧𝙖 𝙛𝙖𝙡𝙖𝙧 𝙙𝙖 𝙫𝙞𝙙𝙖 𝙙𝙤𝙨 𝙫𝙞𝙯𝙞𝙣𝙝𝙤𝙨 😏",

  MENSAGEM_GRUPO_FECHOU:
    "❌𝗚𝗥𝗨𝗣𝗢 𝗙𝗘𝗖𝗛𝗔𝗗𝗢❌\n𝙋𝙤𝙧 𝙝𝙤𝙟𝙚 𝙗𝙖𝙨𝙩𝙖, 𝙨𝙚𝙪𝙨 𝙛𝙤𝙛𝙤𝙦𝙪𝙚𝙞𝙧𝙤𝙨 𝙫𝙖̃𝙤 𝙙𝙤𝙧𝙢𝙞𝙧 𝙖𝙩𝙚́ 𝙖𝙢𝙖𝙣𝙝𝙖̃ 🥱",
};

exports.TEXTOS_GERAL = TEXTOS_GERAL;
