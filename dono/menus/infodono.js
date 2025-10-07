const infodono = (prefix, numerodn, NomeDoBot, sender) => {

// NÃO APAGUE ESSE ${NickDono} nem 
//${numerodn} nem ${NomeDoBot} nem ${prefix} só se quiser apagar completo, não coloque nada ${dentro assim} ISSO SÃO DEFINIÇÕES QUE ESTÁ PUXANDO DO settings.json, da pasta dono, só pode altera a base de tudo, menos as definições, só se quiser apagar a definição completa.

return`

╔════════════════════════════════╗
║        ⚡ 𝐈𝐍𝐅𝐎 𝐃𝐎 𝐃𝐎𝐍𝐎 ⚡        ║
╚════════════════════════════════╝

╔═ Solicitação
║ • Usuário: @${sender.split("@")[0]}
╚════════════════════════════════╝

╔═ 👑 𝐃𝐎𝐍𝐎
║ • WhatsApp: wa.me/${numerodn}
╚════════════════════════════════╝

╔═ 🤖 𝐈𝐍𝐅𝐎 𝐃𝐎 𝐁𝐎𝐓
║ • Prefixo: ${prefix}
║ • Nome: ${NomeDoBot}
╚════════════════════════════════╝
`
}

exports.infodono = infodono