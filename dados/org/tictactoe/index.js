"use strict";

const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "db");
const DEFAULT_INACTIVITY_MS = 5 * 60 * 1000; // 5 minutos
const _gameTimers = new Map();

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getDbPath(session) {
  const safeSession = String(session || "").replace(/[\\/:*?"<>|]/g, "_");
  return path.join(DB_DIR, `${safeSession}.json`);
}

function stripDeviceAndDomain(jid) {
  if (!jid || typeof jid !== "string") return "";
  return jid.split("@")[0].split(":")[0].trim();
}

function normalizeBaseJid(jid) {
  if (!jid || typeof jid !== "string") return "";
  const [userPart, domain] = jid.split("@");
  const cleanUser = userPart.split(":")[0].trim();
  if (!cleanUser) return "";
  return domain ? `${cleanUser}@${domain}` : cleanUser;
}

/**
 * Coleta todos os identificadores conhecidos de um jogador (PN + LID + número puro)
 * para compatibilidade total com Baileys 7.x em grupos LID e PN.
 */
function resolvePlayerAliases(jid, altJid = null, groupMembers = []) {
  const ids = new Set();

  const add = (val) => {
    if (!val || typeof val !== "string") return;
    const base = normalizeBaseJid(val);
    const num = stripDeviceAndDomain(val);
    if (base) ids.add(base);
    if (num) ids.add(num);
  };

  add(jid);
  add(altJid);

  if (Array.isArray(groupMembers) && ids.size > 0) {
    for (const member of groupMembers) {
      if (!member || typeof member !== "object") continue;
      const candidates = [member.id, member.lid, member.phoneNumber, member.jid].filter(
        Boolean
      );
      const matches = candidates.some((c) => {
        const b = normalizeBaseJid(c);
        const n = stripDeviceAndDomain(c);
        return (b && ids.has(b)) || (n && ids.has(n));
      });
      if (matches) {
        candidates.forEach(add);
      }
    }
  }

  return Array.from(ids);
}

/**
 * Compara um jogador salvo no tabuleiro (X ou O + aliases LID/PN) com o remetente atual.
 */
function isSamePlayer(playerJid, playerAliases, sender, senderAlt = null, groupMembers = []) {
  const targetSet = new Set();
  if (playerJid) {
    const b = normalizeBaseJid(playerJid);
    const n = stripDeviceAndDomain(playerJid);
    if (b) targetSet.add(b);
    if (n) targetSet.add(n);
  }
  if (Array.isArray(playerAliases)) {
    for (const alias of playerAliases) {
      const b = normalizeBaseJid(alias);
      const n = stripDeviceAndDomain(alias);
      if (b) targetSet.add(b);
      if (n) targetSet.add(n);
    }
  }
  if (targetSet.size === 0) return false;

  const senderAliases = resolvePlayerAliases(sender, senderAlt, groupMembers);
  return senderAliases.some((id) => targetSet.has(id));
}

function saveGame(session, obj) {
  ensureDbDir();
  obj.updatedAt = Date.now();
  fs.writeFileSync(getDbPath(session), JSON.stringify(obj, null, 2));
  return obj;
}

/**
 * Lê o jogo ativo sem criar arquivos fantasma. Retorna null se não existir ou estiver corrompido.
 */
function getGame(session) {
  if (!session) return null;
  const dbPath = getDbPath(session);
  if (!fs.existsSync(dbPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed._matrix)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function createInitialMatrix() {
  return [
    ["1️⃣", "2️⃣", "3️⃣"],
    ["4️⃣", "5️⃣", "6️⃣"],
    ["7️⃣", "8️⃣", "9️⃣"],
  ];
}

function setGame(session) {
  ensureDbDir();
  const existing = getGame(session);
  if (existing) return existing;

  const now = Date.now();
  const objtic = {
    status: false,
    session,
    gameId: `${now}_${Math.random().toString(36).slice(2, 8)}`,
    turn: "X",
    X: null,
    O: null,
    XIds: [],
    OIds: [],
    isWin: false,
    winner: null,
    nine_push: [],
    _matrix: createInitialMatrix(),
    createdAt: now,
    updatedAt: now,
  };
  return saveGame(session, objtic);
}

function clearGameTimer(session) {
  const existing = _gameTimers.get(session);
  if (existing) {
    clearTimeout(existing);
    _gameTimers.delete(session);
  }
}

function deleteGame(session) {
  clearGameTimer(session);
  const dbPath = getDbPath(session);
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  } catch {
    // ignorar erro de remoção
  }
}

function scheduleGameExpiration(session, expectedGameId, onExpire, ttlMs = DEFAULT_INACTIVITY_MS) {
  clearGameTimer(session);
  const timer = setTimeout(() => {
    _gameTimers.delete(session);
    const current = getGame(session);
    if (!current) return;
    if (expectedGameId && current.gameId && current.gameId !== expectedGameId) return;
    deleteGame(session);
    if (typeof onExpire === "function") {
      Promise.resolve(onExpire(current)).catch(() => {});
    }
  }, ttlMs);
  if (typeof timer.unref === "function") timer.unref();
  _gameTimers.set(session, timer);
}

function checkWinnerSymbol(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 3) return false;
  const lines = [
    // Horizontais
    [matrix[0][0], matrix[0][1], matrix[0][2]],
    [matrix[1][0], matrix[1][1], matrix[1][2]],
    [matrix[2][0], matrix[2][1], matrix[2][2]],
    // Verticais
    [matrix[0][0], matrix[1][0], matrix[2][0]],
    [matrix[0][1], matrix[1][1], matrix[2][1]],
    [matrix[0][2], matrix[1][2], matrix[2][2]],
    // Diagonais
    [matrix[0][0], matrix[1][1], matrix[2][2]],
    [matrix[0][2], matrix[1][1], matrix[2][0]],
  ];

  for (const [a, b, c] of lines) {
    if ((a === "❌" || a === "⭕") && a === b && b === c) {
      return a;
    }
  }
  return false;
}

function move(x, y, session) {
  const moving = getGame(session);
  if (!moving) {
    return { status: false, code: "NO_GAME", message: "Nenhuma partida ativa encontrada." };
  }
  if (moving.isWin) {
    return {
      status: false,
      code: "GAME_OVER",
      message: "Esta partida já foi encerrada.",
    };
  }
  if (moving._matrix[x][y] === "❌" || moving._matrix[x][y] === "⭕") {
    return {
      status: false,
      code: "CELL_OCCUPIED",
      message: `A posição escolhida já está marcada com ${moving._matrix[x][y]}! Escolha outro número livre (1 a 9).`,
    };
  }

  const playedTurn = moving.turn;
  const symbol = playedTurn === "X" ? "❌" : "⭕";
  moving._matrix[x][y] = symbol;
  if (!Array.isArray(moving.nine_push)) moving.nine_push = [];
  moving.nine_push.push(symbol);
  moving.turn = playedTurn === "X" ? "O" : "X";

  const winSymbol = checkWinnerSymbol(moving._matrix);
  if (winSymbol === "❌" || winSymbol === "⭕") {
    moving.isWin = true;
    moving.winner = winSymbol === "❌" ? "X" : "O";
  } else if (moving.nine_push.length >= 9) {
    moving.isWin = true;
    moving.winner = "SERI";
  }

  saveGame(session, moving);
  return moving;
}

function validmove(number, session) {
  const n = Number(number);
  const coords = {
    1: [0, 0],
    2: [0, 1],
    3: [0, 2],
    4: [1, 0],
    5: [1, 1],
    6: [1, 2],
    7: [2, 0],
    8: [2, 1],
    9: [2, 2],
  };
  const pos = coords[n];
  if (!pos) {
    return {
      status: false,
      code: "INVALID_CELL",
      message: "Escolha um número válido de 1 a 9.",
    };
  }
  return move(pos[0], pos[1], session);
}

function renderBoard(matrix) {
  if (!Array.isArray(matrix) || matrix.length < 3) return "";
  return (
    `${matrix[0][0]}${matrix[0][1]}${matrix[0][2]}\n` +
    `${matrix[1][0]}${matrix[1][1]}${matrix[1][2]}\n` +
    `${matrix[2][0]}${matrix[2][1]}${matrix[2][2]}`
  );
}

/**
 * Remove arquivos corrompidos/fantasma (sem jogadores X/O ou criados fora de grupos).
 */
function cleanupCorruptedSessions() {
  ensureDbDir();
  let removed = 0;
  for (const file of fs.readdirSync(DB_DIR)) {
    if (!file.endsWith(".json")) continue;
    const full = path.join(DB_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(full, "utf8"));
      const isZombie =
        !file.endsWith("@g.us.json") ||
        !data ||
        !data.X ||
        !data.O ||
        !Array.isArray(data._matrix);
      if (isZombie) {
        fs.unlinkSync(full);
        removed++;
      }
    } catch {
      try {
        fs.unlinkSync(full);
        removed++;
      } catch {
        // ignorar
      }
    }
  }
  return removed;
}

module.exports = {
  DEFAULT_INACTIVITY_MS,
  getGame,
  setGame,
  saveGame,
  deleteGame,
  clearGameTimer,
  scheduleGameExpiration,
  resolvePlayerAliases,
  isSamePlayer,
  stripDeviceAndDomain,
  validmove,
  renderBoard,
  cleanupCorruptedSessions,
};
