// COMANDOS DE RANKING CORRIGIDOS - SUPORTE A LID
// Este arquivo contém exemplos de como os comandos de ranking devem ser estruturados

// ========== EXEMPLO 1: RANKCORNO ==========
case "rankcorno":
case "rankcornos":
  if (!isGroup) return reply(Res_SoGrupo);
  if (!isModobn) return reply(Res_SoModoBN);
  if (!groupMembers || groupMembers.length === 0) {
    return reply("❌ Não foi possível obter a lista de membros do grupo.");
  }
  
  ABC = `RANK DOS 5 MAIS CORNO DO GRUPO 🐂\n\n`;
  const selectedMembers = [];
  
  for (var i = 0; i < 5; i++) {
    const randomParticipant = groupMembers[Math.floor(Math.random() * groupMembers.length)];
    const participantId = getParticipantId(randomParticipant);
    
    if (participantId) {
      // Extrair apenas o número/ID antes do @
      const participantNumber = participantId.split('@')[0];
      ABC += `${Math.floor(Math.random() * 100)}% @${participantNumber}\n\n`;
      selectedMembers.push(participantId); // Adicionar ID completo para menções
    }
  }
  
  // Enviar com menções corretas
  conn.sendMessage(
    from,
    { 
      image: { url: rnkcorno }, 
      caption: ABC.trim(), 
      mentions: selectedMembers 
    }
  );
  break;

// ========== EXEMPLO 2: RANKGAY ==========
case "rankgay":
case "rankgays":
  if (!isGroup) return reply(Res_SoGrupo);
  if (!isModobn) return reply(Res_SoModoBN);
  if (!groupMembers || groupMembers.length === 0) {
    return reply("❌ Não foi possível obter a lista de membros do grupo.");
  }
  
  ABC = `*🤖RANK DOS 5 MAIS GAYS DO GRUPO [ ${groupName} ]🏳️‍🌈*\n\n`;
  const selectedMembersGay = [];
  
  for (var i = 0; i < 5; i++) {
    const randomParticipant = groupMembers[Math.floor(Math.random() * groupMembers.length)];
    const participantId = getParticipantId(randomParticipant);
    
    if (participantId) {
      const participantNumber = participantId.split('@')[0];
      ABC += `${Math.floor(Math.random() * 100)}% @${participantNumber}\n\n`;
      selectedMembersGay.push(participantId);
    }
  }
  
  conn.sendMessage(
    from,
    { 
      image: { url: rnkgay }, 
      caption: ABC.trim(), 
      mentions: selectedMembersGay 
    }
  );
  break;

// ========== OBSERVAÇÕES IMPORTANTES ==========
/*
1. SEMPRE usar getParticipantId() para obter o ID completo
2. Usar .split('@')[0] apenas para EXIBIR na mensagem
3. Passar o array de IDs COMPLETOS no parâmetro mentions
4. NÃO usar parseInt() com LID - isso quebra as menções
5. O formato correto é: numero@s.whatsapp.net ou lid@lid
*/
