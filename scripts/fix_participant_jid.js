/**
 * CORREÇÃO DE IDENTIFICAÇÃO DE PARTICIPANTES - BAILEYS 7.0+
 * 
 * Problema: LID (Local ID) retorna apenas fragmentos do número
 * Solução: Priorizar JID completo e extrair número corretamente
 */

/**
 * Extrai o JID completo do participante
 * Prioriza: id > phoneNumber > lid (como último recurso)
 * 
 * @param {Object|String} participant - Objeto do participante ou JID string
 * @returns {String} JID completo no formato numero@s.whatsapp.net
 */
function getParticipantJid(participant) {
  if (!participant) return '';
  
  // Se já é uma string, retornar diretamente
  if (typeof participant === 'string') {
    return participant;
  }
  
  // Se é um objeto, priorizar id e phoneNumber
  if (typeof participant === 'object' && participant !== null) {
    // 1. Prioridade: id (JID completo)
    if (participant.id && participant.id.includes('@')) {
      return participant.id;
    }
    
    // 2. Segunda opção: phoneNumber (geralmente é o JID completo)
    if (participant.phoneNumber && participant.phoneNumber.includes('@')) {
      return participant.phoneNumber;
    }
    
    // 3. Terceira opção: id sem @ (adicionar @s.whatsapp.net)
    if (participant.id) {
      return participant.id.includes('@') ? participant.id : `${participant.id}@s.whatsapp.net`;
    }
    
    // 4. Quarta opção: phoneNumber sem @ (adicionar @s.whatsapp.net)
    if (participant.phoneNumber) {
      return participant.phoneNumber.includes('@') 
        ? participant.phoneNumber 
        : `${participant.phoneNumber}@s.whatsapp.net`;
    }
    
    // 5. ÚLTIMO RECURSO: lid (precisa ser processado)
    if (participant.lid) {
      // LID vem no formato: "241 44324925037 4" (com espaços)
      // Precisamos remover espaços e usar apenas os dígitos
      const lidClean = String(participant.lid).replace(/\s+/g, '');
      return `${lidClean}@lid`;
    }
  }
  
  return String(participant);
}

/**
 * Extrai apenas o número do participante (sem @s.whatsapp.net)
 * 
 * @param {Object|String} participant - Objeto do participante ou JID string
 * @returns {String} Número do participante
 */
function getParticipantNumber(participant) {
  const jid = getParticipantJid(participant);
  
  if (!jid) return '';
  
  // Extrair número antes do @
  const number = String(jid).split('@')[0];
  
  // Remover espaços se houver (caso do LID)
  return number.replace(/\s+/g, '');
}

/**
 * Extrai número de um JID qualquer
 * 
 * @param {String} jid - JID no formato numero@s.whatsapp.net
 * @returns {String} Número extraído
 */
function extractNumber(jid) {
  if (!jid) return '';
  const number = String(jid).split('@')[0];
  return number.replace(/\s+/g, '');
}

/**
 * Verifica se um JID está em uma lista
 * 
 * @param {String} jid - JID para verificar
 * @param {Array} list - Lista de JIDs
 * @returns {Boolean} True se encontrado
 */
function isJidInList(jid, list) {
  if (!jid || !Array.isArray(list)) return false;
  const number = extractNumber(jid);
  return list.some(item => extractNumber(item) === number);
}

/**
 * Remove um JID de uma lista
 * 
 * @param {String} jid - JID para remover
 * @param {Array} list - Lista de JIDs
 * @returns {Array} Lista sem o JID
 */
function removeJidFromList(jid, list) {
  if (!jid || !Array.isArray(list)) return list;
  const number = extractNumber(jid);
  return list.filter(item => extractNumber(item) !== number);
}

// Exportar funções
module.exports = {
  getParticipantJid,
  getParticipantNumber,
  extractNumber,
  isJidInList,
  removeJidFromList
};

// Testes (comentados)
/*
// Teste 1: Participante com id completo
const p1 = { id: '5511999999999@s.whatsapp.net', lid: '241 44324925037 4' };
console.log('Teste 1:', getParticipantNumber(p1)); // Deve retornar: 5511999999999

// Teste 2: Participante apenas com lid
const p2 = { lid: '241 44324925037 4' };
console.log('Teste 2:', getParticipantNumber(p2)); // Deve retornar: 24144324925037 4 (sem espaços)

// Teste 3: String JID
const p3 = '5511999999999@s.whatsapp.net';
console.log('Teste 3:', getParticipantNumber(p3)); // Deve retornar: 5511999999999
*/
