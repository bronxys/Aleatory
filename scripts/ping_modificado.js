// COMANDO PING MODIFICADO - BRONXYS BOT
// Substitua o case "ping" existente (linhas 8408-8435) por este código

        case "dados":
        case "ping":
          try {
            conn.sendMessage(from, { react: { text: "🖥️", key: info.key } });
            
            // Calcular métricas
            r = Date.now() / 1000 - info.messageTimestamp;
            uptime = process.uptime();
            
            // Horário de Brasília
            const horarioBrasilia = moment.tz("America/Sao_Paulo").format("HH:mm:ss");
            const dataBrasilia = moment.tz("America/Sao_Paulo").format("DD/MM/YYYY");
            
            // Consumo de RAM
            const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const totalMemory = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
            const percentMemory = ((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(1);
            
            // Consumo de CPU (aproximado baseado no uptime)
            const cpuUsage = (process.cpuUsage().user / 1000000).toFixed(2);
            
            // Texto do comando ping
            const mensagemPing = `
╭━━━━━━━━━━━━━━━━━━━━━━
┃ ⚡ *BRONXYS BOT - STATUS*
┃━━━━━━━━━━━━━━━━━━━━━━
┃
┃ 🤖 *STATUS:* Online ✅
┃ 🌐 *HOST:* bronxyshost.com
┃ 📍 *LOCALIZAÇÃO:* São Paulo, Brasil
┃
┃━━━━━━━━━━━━━━━━━━━━━━
┃ ⏰ *HORÁRIO DE BRASÍLIA*
┃━━━━━━━━━━━━━━━━━━━━━━
┃
┃ 🕐 *Hora:* ${horarioBrasilia}
┃ 📅 *Data:* ${dataBrasilia}
┃
┃━━━━━━━━━━━━━━━━━━━━━━
┃ 📊 *DESEMPENHO DO SISTEMA*
┃━━━━━━━━━━━━━━━━━━━━━━
┃
┃ 💾 *RAM:* ${usedMemory}MB / ${totalMemory}MB (${percentMemory}%)
┃ ⚙️ *CPU:* ${cpuUsage}s de processamento
┃ 🚀 *Velocidade:* ${String(r.toFixed(3))} segundos
┃ ⏱️ *Uptime:* ${kyun(uptime)}
┃
┃━━━━━━━━━━━━━━━━━━━━━━
┃ 👥 *EQUIPE DE DESENVOLVIMENTO*
┃━━━━━━━━━━━━━━━━━━━━━━
┃
┃ 🏆 *Team:* Equipe Bronxys
┃ 👤 *Usuário:* @${sender2}
┃
╰━━━━━━━━━━━━━━━━━━━━━━

🔔 *Junte-se ao nosso canal oficial!*
📱 Receba atualizações, novidades e suporte.`;

            // Botão para o canal do WhatsApp
            const botaoCanal = {
              text: mensagemPing,
              footer: "© 2025 Bronxys Bot - Todos os direitos reservados",
              buttons: [
                {
                  buttonId: "canal_bronxys",
                  buttonText: { displayText: "📢 Acessar Canal Bronxys" },
                  type: 1,
                },
              ],
              headerType: 4,
              imageMessage: await conn.prepareMessage(
                from,
                { url: "./logos/bronxys_ping.jpeg" },
                MessageType.image
              ).then((prepared) => prepared.message.imageMessage),
            };

            // Enviar mensagem com imagem e botão
            await conn.sendMessage(
              from,
              {
                image: { url: "./logos/bronxys_ping.jpeg" },
                caption: mensagemPing,
                mentions: [sender],
                buttons: [
                  {
                    buttonId: "1",
                    buttonText: { displayText: "📢 Acessar Canal Bronxys" },
                    type: 1,
                  },
                ],
                footer: "© 2025 Bronxys Bot",
              },
              { quoted: selo }
            );

            // Aguardar resposta do botão
            const collector = conn.ev.on("messages.upsert", async (m) => {
              const msg = m.messages[0];
              if (!msg.message) return;
              
              const selectedId = msg.message.buttonsResponseMessage?.selectedButtonId;
              
              if (selectedId === "1") {
                await conn.sendMessage(
                  from,
                  {
                    text: "🎉 *Obrigado por se juntar à Equipe Bronxys!*\n\n📱 Acesse nosso canal oficial:\n\n🔗 https://whatsapp.com/channel/0029Va9l48kHbFV6SQFKz93B\n\n✨ Fique por dentro de todas as novidades!",
                  },
                  { quoted: msg }
                );
              }
            });
            
          } catch (erro) {
            console.log("Erro no comando ping:", erro);
            conn.sendMessage(
              from,
              { text: "❌ Erro ao processar comando ping. Tente novamente." },
              { quoted: info }
            );
          }
          break;
