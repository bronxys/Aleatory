/**
 * simi.js - Motor de chat local usando dados/simi.json
 * O simih2 aprende as conversas dos membros dos grupos e
 * depois usa essas respostas aleatoriamente para conversar.
 * 
 * Fluxo de aprendizado:
 * 1. Toda mensagem de texto nos grupos é capturada
 * 2. Cada mensagem é associada como resposta à mensagem anterior
 *    (de outro membro) naquele grupo
 * 3. Quando alguém manda uma mensagem, o bot busca no banco
 *    e responde com algo que já aprendeu
 */

const fs = require("fs");
const path = require("path");

const SIMI_PATH = path.join(__dirname, "dados", "simi.json");

// Cache em memória
let simiDB = null;
let insertCount = 0;
const SAVE_INTERVAL = 5; // Salvar a cada 5 mensagens aprendidas (mais frequente)
const MAX_RESPONSES_PER_MSG = 15; // Limitar respostas por entrada para evitar arquivo gigante

function loadDB() {
    if (simiDB) return simiDB;
    try {
        if (fs.existsSync(SIMI_PATH)) {
            const raw = fs.readFileSync(SIMI_PATH, "utf-8");
            simiDB = JSON.parse(raw);
            if (!Array.isArray(simiDB)) simiDB = [];
        } else {
            simiDB = [];
        }
    } catch (e) {
        console.error("[SIMI] Erro ao carregar simi.json:", e.message);
        simiDB = [];
    }
    return simiDB;
}

function saveDB() {
    try {
        fs.writeFileSync(SIMI_PATH, JSON.stringify(simiDB, null, 2), "utf-8");
    } catch (e) {
        console.error("[SIMI] Erro ao salvar simi.json:", e.message);
    }
}

// Salvar ao fechar o processo para não perder dados
process.on("exit", () => {
    if (simiDB && insertCount > 0) saveDB();
});

// Salvar periodicamente (a cada 2 minutos) para não perder dados em crash
setInterval(() => {
    if (simiDB && insertCount > 0) {
        saveDB();
        insertCount = 0;
    }
}, 2 * 60 * 1000);

/**
 * Histórico das últimas mensagens por grupo
 */
const lastMessages = {};

/**
 * Normaliza texto para comparação:
 * - Lowercase
 * - Remove acentos
 * - Remove espaços extras
 */
function normalizeText(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}

/**
 * Insere/aprende uma nova mensagem no banco de dados.
 * Cada mensagem recebida é associada como resposta à mensagem anterior
 * de outro membro no grupo (aprendizado por conversação).
 */
function insert(type, info) {
    try {
        const from = info.key.remoteJid;
        const sender = info.key.participant || info.key.remoteJid;

        let text = "";
        if (type === "conversation") {
            text = info.message?.conversation || "";
        } else if (type === "extendedTextMessage") {
            text = info.message?.extendedTextMessage?.text || "";
        }

        // Ignorar mensagens muito curtas, vazias ou apenas emojis
        if (!text || text.trim().length < 2) return;
        text = text.trim();

        // Ignorar se parece ser um comando
        if (/^[!/.#]/.test(text)) return;

        // Ignorar links
        if (/https?:\/\//i.test(text)) return;

        // Ignorar mensagens muito longas (provavelmente copypasta)
        if (text.length > 300) return;

        const db = loadDB();

        // Se existe uma mensagem anterior neste grupo de OUTRO remetente,
        // registrar esta mensagem como resposta para aquela
        if (lastMessages[from] && lastMessages[from].sender !== sender) {
            const prevText = lastMessages[from].text;
            
            // Verificar se a mensagem anterior não é muito antiga (max 5 min)
            const timeDiff = Date.now() - (lastMessages[from].time || 0);
            if (timeDiff > 5 * 60 * 1000) {
                // Mensagem anterior muito antiga, apenas atualizar lastMessages
                lastMessages[from] = { text, sender, time: Date.now() };
                return;
            }

            const prevNorm = normalizeText(prevText);

            // Ignorar se a mensagem anterior era muito curta
            if (prevNorm.length < 2) {
                lastMessages[from] = { text, sender, time: Date.now() };
                return;
            }

            // Buscar se já existe entrada para a mensagem anterior
            let entry = db.find(
                (e) => e.msg && normalizeText(e.msg) === prevNorm
            );

            if (entry) {
                // Adicionar resposta se ainda não existe (evitar duplicatas)
                const textNorm = normalizeText(text);
                const exists = entry.messages.some(
                    (m) => normalizeText(m) === textNorm
                );
                if (!exists && entry.messages.length < MAX_RESPONSES_PER_MSG) {
                    entry.messages.push(text);
                    insertCount++;
                }
            } else {
                // Criar nova entrada
                db.push({ msg: prevText, messages: [text] });
                insertCount++;
            }

            // Salvar periodicamente
            if (insertCount >= SAVE_INTERVAL) {
                saveDB();
                insertCount = 0;
            }
        }

        // Guardar esta mensagem como a última do grupo
        lastMessages[from] = { text, sender, time: Date.now() };
    } catch (e) {
        console.error("[SIMI] Erro no insert:", e.message);
    }
}

/**
 * Busca uma resposta para a mensagem no banco de dados local.
 * 1. Busca exata
 * 2. Busca parcial (mensagens que contêm o texto)
 * 3. Busca por palavras-chave
 * 4. Resposta aleatória (último recurso, 20% de chance)
 */
function response(text) {
    if (!text || text.trim().length < 2) return null;

    const db = loadDB();
    if (!db || db.length === 0) return null;

    const normalized = normalizeText(text);
    if (!normalized || normalized.length < 2) return null;

    // Filtrar apenas entradas válidas com respostas
    const validEntries = db.filter(
        (e) => e.msg && e.messages && e.messages.length > 0
    );
    if (validEntries.length === 0) return null;

    // 1. Busca exata
    let entry = validEntries.find(
        (e) => normalizeText(e.msg) === normalized
    );

    if (entry) {
        return entry.messages[Math.floor(Math.random() * entry.messages.length)];
    }

    // 2. Busca parcial — o input está contido na msg ou vice-versa
    const partialMatches = validEntries.filter(
        (e) => {
            const msgNorm = normalizeText(e.msg);
            return msgNorm.length >= 3 &&
                (msgNorm.includes(normalized) || normalized.includes(msgNorm));
        }
    );

    if (partialMatches.length > 0) {
        const pick = partialMatches[Math.floor(Math.random() * partialMatches.length)];
        return pick.messages[Math.floor(Math.random() * pick.messages.length)];
    }

    // 3. Busca por palavras-chave (se o texto tiver 2+ palavras significativas)
    const words = normalized.split(/\s+/).filter((w) => w.length > 2);
    if (words.length >= 2) {
        const keywordMatches = validEntries.filter(
            (e) => {
                const msgNorm = normalizeText(e.msg);
                // Pelo menos 2 palavras devem coincidir para relevância
                const matchCount = words.filter((w) => msgNorm.includes(w)).length;
                return matchCount >= 2;
            }
        );

        if (keywordMatches.length > 0) {
            const pick = keywordMatches[Math.floor(Math.random() * keywordMatches.length)];
            return pick.messages[Math.floor(Math.random() * pick.messages.length)];
        }

        // Fallback: pelo menos 1 palavra coincide
        const singleKeyword = validEntries.filter(
            (e) => words.some((w) => normalizeText(e.msg).includes(w))
        );

        if (singleKeyword.length > 0) {
            const pick = singleKeyword[Math.floor(Math.random() * singleKeyword.length)];
            return pick.messages[Math.floor(Math.random() * pick.messages.length)];
        }
    }

    // 4. Resposta aleatória (30% de chance, para o bot parecer vivo)
    if (validEntries.length > 10 && Math.random() < 0.30) {
        const pick = validEntries[Math.floor(Math.random() * validEntries.length)];
        return pick.messages[Math.floor(Math.random() * pick.messages.length)];
    }

    return null;
}

/**
 * Retorna estatísticas do banco simi
 */
function getStats() {
    const db = loadDB();
    const totalEntries = db.length;
    const totalResponses = db.reduce((acc, e) => acc + (e.messages?.length || 0), 0);
    return { totalEntries, totalResponses };
}

module.exports = { insert, response, loadDB, saveDB, getStats };
