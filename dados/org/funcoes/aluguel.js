/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║     SISTEMA DE ALUGUEL DE GRUPOS — BronxysBot v2.0      ║
 * ║    Módulo profissional com histórico, backup e pausar    ║
 * ╚══════════════════════════════════════════════════════════╝
 * 
 * Changelog v2.0:
 * - Corrigido: Scheduler lia config errada (nescessario.json → settings.json)
 * - Corrigido: Verificação agora a cada 15min (era 1h — contratos ficavam até 59min além do vencimento)
 * - Corrigido: plano_dias agora salva original + renovações separadamente
 * - Novo: Sistema de histórico (contratos encerrados/expirados são registrados)
 * - Novo: Backup automático antes de cada escrita
 * - Novo: Pausar/Retomar contratos
 * - Novo: Estatísticas completas
 * - Novo: Aviso 7 dias antes do vencimento
 * - Novo: Notificação ao responsável do grupo quando vence
 * - Novo: Busca inteligente multi-critério
 * - Novo: Edição de contrato existente
 */

const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

// ─── CAMINHOS ─────────────────────────────────────────────
const ARQUIVO = path.resolve("./dados/org/json/rg_aluguel.json");
const HISTORICO_PATH = path.resolve("./dados/org/json/aluguel_historico.json");
const BACKUP_PATH = path.resolve("./dados/org/json/rg_aluguel.backup.json");

// ─── FUNÇÕES DE LEITURA / ESCRITA COM BACKUP ──────────────

function _ensureFile(filePath, defaultContent = "[]") {
    try {
        if (!fs.existsSync(filePath)) {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, defaultContent);
        }
    } catch (e) {
        console.error(`[ALUGUEL] Erro ao criar arquivo ${filePath}:`, e.message);
    }
}

function _backup() {
    try {
        if (fs.existsSync(ARQUIVO)) {
            fs.copyFileSync(ARQUIVO, BACKUP_PATH);
        }
    } catch (e) {
        console.error("[ALUGUEL] Erro ao fazer backup:", e.message);
    }
}

function getAluguel() {
    try {
        _ensureFile(ARQUIVO);
        const raw = fs.readFileSync(ARQUIVO, "utf-8").trim();
        if (!raw || raw === "") return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("[ALUGUEL] Erro ao ler contratos:", e.message);
        // Tentar restaurar do backup
        try {
            if (fs.existsSync(BACKUP_PATH)) {
                const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, "utf-8"));
                if (Array.isArray(backup)) {
                    console.log("[ALUGUEL] Restaurado do backup!");
                    fs.writeFileSync(ARQUIVO, JSON.stringify(backup, null, 2));
                    return backup;
                }
            }
        } catch { }
        return [];
    }
}

function setAluguel(data) {
    _backup(); // Backup antes de qualquer escrita
    _ensureFile(ARQUIVO);
    fs.writeFileSync(ARQUIVO, JSON.stringify(data, null, 2));
}

// ─── HISTÓRICO ────────────────────────────────────────────

function getHistorico() {
    try {
        _ensureFile(HISTORICO_PATH);
        const raw = fs.readFileSync(HISTORICO_PATH, "utf-8").trim();
        if (!raw || raw === "") return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function addHistorico(contrato, motivo = "expirado") {
    try {
        const historico = getHistorico();
        historico.push({
            ...contrato,
            motivo_encerramento: motivo,
            data_encerramento: moment().tz("America/Sao_Paulo").toISOString(),
            encerrado_ts: Math.floor(Date.now() / 1000),
        });
        // Manter últimos 100 registros
        while (historico.length > 100) historico.shift();
        fs.writeFileSync(HISTORICO_PATH, JSON.stringify(historico, null, 2));
    } catch (e) {
        console.error("[ALUGUEL] Erro ao salvar histórico:", e.message);
    }
}

// ─── BUSCA INTELIGENTE ────────────────────────────────────

function getAluguelByGrupo(groupId) {
    if (!groupId) return null;
    const lista = getAluguel();
    return lista.find(i => i.id_gp === groupId) || null;
}

function getAluguelByLink(link) {
    if (!link) return null;
    const lista = getAluguel();
    const code = link.split("chat.whatsapp.com/").pop()?.split("?")[0]?.trim();
    if (!code) return null;
    return lista.find(i => (i.link || "").includes(code)) || null;
}

/**
 * Busca inteligente — encontra contrato por ID, link, nome ou contato
 */
function buscarContrato(busca) {
    if (!busca) return null;
    const lista = getAluguel();
    const buscaTrim = busca.trim();

    // 1. Por ID exato do grupo
    if (buscaTrim.endsWith("@g.us")) {
        return lista.find(c => c.id_gp === buscaTrim) || null;
    }

    // 2. Por link do WhatsApp
    if (buscaTrim.includes("chat.whatsapp.com")) {
        const code = buscaTrim.split("chat.whatsapp.com/").pop()?.split("?")[0]?.trim();
        if (code) {
            const found = lista.find(c => c.link && c.link.includes(code));
            if (found) return found;
        }
    }

    // 3. Por nome do grupo (case insensitive, parcial)
    const buscaNorm = buscaTrim.toLowerCase();
    const porNome = lista.find(c =>
        c.nome_ && c.nome_.toLowerCase().includes(buscaNorm)
    );
    if (porNome) return porNome;

    // 4. Por nome/contato do responsável
    const porResp = lista.find(c =>
        (c.responsavel_nome && c.responsavel_nome.toLowerCase().includes(buscaNorm)) ||
        (c.responsavel_contato && c.responsavel_contato.includes(buscaTrim.replace(/\D/g, "")))
    );
    if (porResp) return porResp;

    // 5. Por índice numérico (1, 2, 3...)
    const idx = parseInt(buscaTrim);
    if (!isNaN(idx) && idx >= 1 && idx <= lista.length) {
        return lista[idx - 1];
    }

    return null;
}

// ─── ADICIONAR CONTRATO ───────────────────────────────────

function adicionarContrato({
    id_gp, nome_, link,
    responsavel_nome, responsavel_contato,
    plano_dias, valor, cadastrado_por
}) {
    const lista = getAluguel();

    // Verificar se já existe
    const idx = lista.findIndex(i => i.id_gp && i.id_gp === id_gp);
    const agora = moment().tz("America/Sao_Paulo");
    const vencTs = Math.floor(agora.clone().add(plano_dias, "days").valueOf() / 1000);
    const vencIso = agora.clone().add(plano_dias, "days").toISOString();

    const contrato = {
        id_gp: id_gp || "",
        nome_: nome_ || "Grupo Sem Nome",
        link: link || "",
        responsavel_nome: responsavel_nome || "Não informado",
        responsavel_contato: (responsavel_contato || "").replace(/\D/g, "") || "Não informado",
        data_aluguel: agora.toISOString(),
        vencimento: vencTs,
        vencimento_iso: vencIso,
        plano_dias_original: Number(plano_dias), // Plano original (sem renovações)
        plano_dias: Number(plano_dias),           // Total acumulado
        dias_renovados: 0,                        // Total de dias adicionados por renovação
        renovacoes: 0,                            // Quantidade de renovações
        valor: valor || "Não informado",
        aviso_7d_enviado: false,
        aviso_3d_enviado: false,
        aviso_1d_enviado: false,
        pausado: false,
        pausado_em: null,
        dias_restantes_ao_pausar: 0,
        cadastrado_por: cadastrado_por || "Dono",
        ultima_atualizacao: agora.toISOString(),
    };

    if (idx >= 0) {
        // Se já existe, mover o antigo pro histórico antes
        addHistorico(lista[idx], "substituido");
        lista[idx] = contrato;
    } else {
        lista.push(contrato);
    }

    setAluguel(lista);
    return contrato;
}

// ─── RENOVAR CONTRATO ────────────────────────────────────

function renovarContrato(id_gp, dias_extras, novoValor) {
    const lista = getAluguel();
    let idx = lista.findIndex(i => i.id_gp === id_gp);

    // Fallback: buscar por nome se ID não encontrar
    if (idx < 0 && id_gp) {
        idx = lista.findIndex(i =>
            i.nome_ && i.nome_.toLowerCase().trim() === id_gp.toLowerCase().trim()
        );
    }

    if (idx < 0) return false;

    const contrato = lista[idx];

    // Se pausado, retomar primeiro
    if (contrato.pausado) {
        contrato.pausado = false;
        contrato.pausado_em = null;
    }

    const agora = Math.floor(Date.now() / 1000);
    // Se já venceu, conta a partir de agora; se ainda ativo, adiciona sobre o vencimento atual
    const base = contrato.vencimento > agora ? contrato.vencimento : agora;
    const novoVenc = base + (dias_extras * 86400);
    const novoIso = moment.unix(novoVenc).tz("America/Sao_Paulo").toISOString();

    contrato.vencimento = novoVenc;
    contrato.vencimento_iso = novoIso;
    contrato.plano_dias += Number(dias_extras);
    contrato.dias_renovados = (contrato.dias_renovados || 0) + Number(dias_extras);
    contrato.renovacoes = (contrato.renovacoes || 0) + 1;
    contrato.aviso_7d_enviado = false;
    contrato.aviso_3d_enviado = false;
    contrato.aviso_1d_enviado = false;

    // Atualizar valor se fornecido
    if (novoValor && novoValor !== contrato.valor) {
        contrato.valor = novoValor;
    }

    contrato.ultima_atualizacao = moment().tz("America/Sao_Paulo").toISOString();

    lista[idx] = contrato;
    setAluguel(lista);
    return contrato;
}

// ─── PAUSAR / RETOMAR CONTRATO ───────────────────────────

function pausarContrato(busca) {
    const lista = getAluguel();
    const contrato = buscarContrato(busca);
    if (!contrato) return { error: "not_found" };
    if (contrato.pausado) return { error: "already_paused" };

    const idx = lista.findIndex(c =>
        c.id_gp === contrato.id_gp || (c.nome_ === contrato.nome_ && c.vencimento === contrato.vencimento)
    );
    if (idx < 0) return { error: "not_found" };

    const agora = Math.floor(Date.now() / 1000);
    const restante = contrato.vencimento - agora;

    if (restante <= 0) return { error: "expired" };

    lista[idx].pausado = true;
    lista[idx].pausado_em = moment().tz("America/Sao_Paulo").toISOString();
    lista[idx].dias_restantes_ao_pausar = Math.ceil(restante / 86400);
    lista[idx].ultima_atualizacao = moment().tz("America/Sao_Paulo").toISOString();

    setAluguel(lista);
    return { success: true, contrato: lista[idx] };
}

function retomarContrato(busca) {
    const lista = getAluguel();
    const contrato = buscarContrato(busca);
    if (!contrato) return { error: "not_found" };
    if (!contrato.pausado) return { error: "not_paused" };

    const idx = lista.findIndex(c =>
        c.id_gp === contrato.id_gp || (c.nome_ === contrato.nome_ && c.vencimento === contrato.vencimento)
    );
    if (idx < 0) return { error: "not_found" };

    const agora = Math.floor(Date.now() / 1000);
    const diasRestantes = lista[idx].dias_restantes_ao_pausar || 1;
    const novoVenc = agora + (diasRestantes * 86400);

    lista[idx].pausado = false;
    lista[idx].pausado_em = null;
    lista[idx].vencimento = novoVenc;
    lista[idx].vencimento_iso = moment.unix(novoVenc).tz("America/Sao_Paulo").toISOString();
    lista[idx].aviso_7d_enviado = false;
    lista[idx].aviso_3d_enviado = false;
    lista[idx].aviso_1d_enviado = false;
    lista[idx].ultima_atualizacao = moment().tz("America/Sao_Paulo").toISOString();

    setAluguel(lista);
    return { success: true, contrato: lista[idx] };
}

// ─── EDITAR CONTRATO ─────────────────────────────────────

function editarContrato(id_gp, campos) {
    const lista = getAluguel();
    const idx = lista.findIndex(i => i.id_gp === id_gp);
    if (idx < 0) return false;

    const permitidos = ["nome_", "link", "responsavel_nome", "responsavel_contato", "valor"];
    for (const [chave, valor] of Object.entries(campos)) {
        if (permitidos.includes(chave) && valor !== undefined && valor !== null) {
            lista[idx][chave] = valor;
        }
    }
    lista[idx].ultima_atualizacao = moment().tz("America/Sao_Paulo").toISOString();

    setAluguel(lista);
    return lista[idx];
}

// ─── REMOVER CONTRATO ────────────────────────────────────

function removerContrato(busca, motivo = "encerrado_manual") {
    const lista = getAluguel();
    let idx = -1;

    // 1. Buscar por id_gp exato
    if (busca) {
        idx = lista.findIndex(i => i.id_gp && i.id_gp === busca);
    }

    // 2. Fallback: buscar por link (código do convite)
    if (idx < 0 && busca && busca.includes("chat.whatsapp.com")) {
        const code = busca.split("chat.whatsapp.com/").pop()?.split("?")[0]?.trim();
        if (code) {
            idx = lista.findIndex(i => i.link && i.link.includes(code));
        }
    }

    // 3. Fallback: buscar por nome do grupo (case insensitive)
    if (idx < 0 && busca && !busca.endsWith("@g.us")) {
        const buscaNorm = busca.toLowerCase().trim();
        idx = lista.findIndex(i => i.nome_ && i.nome_.toLowerCase().trim() === buscaNorm);
    }

    // 4. Fallback: buscar por índice numérico
    if (idx < 0 && busca) {
        const numIdx = parseInt(busca);
        if (!isNaN(numIdx) && numIdx >= 1 && numIdx <= lista.length) {
            idx = numIdx - 1;
        }
    }

    if (idx < 0) return false;

    const removido = lista[idx];
    // Salvar no histórico antes de remover
    addHistorico(removido, motivo);

    lista.splice(idx, 1);
    setAluguel(lista);
    return removido;
}

// ─── FORMATAÇÃO PROFISSIONAL ─────────────────────────────

function formatarContrato(c, showFull = true) {
    const agora = Math.floor(Date.now() / 1000);
    const restante = c.pausado ? (c.dias_restantes_ao_pausar || 0) * 86400 : c.vencimento - agora;
    const diasRest = Math.max(0, Math.floor(restante / 86400));
    const horasRest = Math.max(0, Math.floor((restante % 86400) / 3600));

    let statusEmoji, statusTxt;
    if (c.pausado) {
        statusEmoji = "⏸️";
        statusTxt = `PAUSADO (${c.dias_restantes_ao_pausar || 0}d restantes)`;
    } else if (restante < 0) {
        statusEmoji = "🔴";
        statusTxt = "VENCIDO";
    } else if (diasRest <= 1) {
        statusEmoji = "🚨";
        statusTxt = `URGENTE — ${horasRest}h restantes`;
    } else if (diasRest <= 3) {
        statusEmoji = "🟡";
        statusTxt = `VENCENDO em ${diasRest}d ${horasRest}h`;
    } else if (diasRest <= 7) {
        statusEmoji = "🟠";
        statusTxt = `ATENÇÃO — ${diasRest}d restantes`;
    } else {
        statusEmoji = "🟢";
        statusTxt = `ATIVO — ${diasRest}d restantes`;
    }

    const dataAluguel = moment(c.data_aluguel).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");
    const dataVenc = c.pausado
        ? "⏸️ Pausado"
        : moment.unix(c.vencimento).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");

    if (!showFull) {
        return `│  ${statusEmoji} *${c.nome_}* — ${statusTxt}\n│  📅 Vence: ${dataVenc} │ 👤 ${c.responsavel_nome}`;
    }

    let renovInfo = "";
    if (c.renovacoes > 0) {
        renovInfo = `\n│  🔄 Renovações: ${c.renovacoes}x (+${c.dias_renovados || 0}d)`;
    }

    return `│  📋 *CONTRATO DE ALUGUEL*
├──────────────
│
│  ${statusEmoji} *Status:* ${statusTxt}
│
│  🏘️ *Grupo:* ${c.nome_}
│  🔗 *Link:* ${c.link || "Não informado"}
│  🆔 *ID:* ${c.id_gp || "Não informado"}
│
│  👤 *Responsável:* ${c.responsavel_nome}
│  📞 *Contato:* wa.me/${c.responsavel_contato}
│
│  📅 Alugado em: ${dataAluguel}
│  ⏳ Vence em: ${dataVenc}
│  📆 Plano original: ${c.plano_dias_original || c.plano_dias} dia(s)
│  📆 Total acumulado: ${c.plano_dias} dia(s)${renovInfo}
│  💰 Valor: ${c.valor}
│
│  🔧 _Cadastrado por:_ ${c.cadastrado_por}`;
}

// ─── ESTATÍSTICAS ────────────────────────────────────────

function getEstatisticas() {
    const lista = getAluguel();
    const historico = getHistorico();
    const agora = Math.floor(Date.now() / 1000);

    const ativos = lista.filter(c => !c.pausado && c.vencimento > agora);
    const vencidos = lista.filter(c => !c.pausado && c.vencimento <= agora);
    const pausados = lista.filter(c => c.pausado);
    const vencendo3d = lista.filter(c => {
        if (c.pausado) return false;
        const r = c.vencimento - agora;
        return r > 0 && r <= 3 * 86400;
    });
    const vencendo7d = lista.filter(c => {
        if (c.pausado) return false;
        const r = c.vencimento - agora;
        return r > 0 && r <= 7 * 86400;
    });

    // Calcular receita total
    let receitaTotal = 0;
    let receitaMes = 0;
    const inicioMes = moment().tz("America/Sao_Paulo").startOf("month").unix();

    [...lista, ...historico].forEach(c => {
        const val = parseFloat((c.valor || "0").replace(/[^\d.,]/g, "").replace(",", "."));
        if (!isNaN(val)) {
            receitaTotal += val;
            const tsAluguel = moment(c.data_aluguel).unix();
            if (tsAluguel >= inicioMes) receitaMes += val;
        }
    });

    const totalRenovacoes = lista.reduce((acc, c) => acc + (c.renovacoes || 0), 0);

    return {
        total: lista.length,
        ativos: ativos.length,
        vencidos: vencidos.length,
        pausados: pausados.length,
        vencendo3d: vencendo3d.length,
        vencendo7d: vencendo7d.length,
        historico_total: historico.length,
        renovacoes_total: totalRenovacoes,
        receita_total: receitaTotal.toFixed(2),
        receita_mes: receitaMes.toFixed(2),
    };
}

// ─── SCHEDULER DE VERIFICAÇÃO ────────────────────────────

function initAluguelScheduler(_ignoredConn, numerodono_ofc) {
    console.log("[ALUGUEL] Sistema de contratos v2.0 iniciado ✅");

    // ── Função auxiliar: verificar se a conexão está realmente ativa ──
    function _isConnReady() {
        try {
            const conn = global.conn;
            if (!conn || !conn.sendMessage) return false;
            if (conn.ws && conn.ws.readyState !== undefined && conn.ws.readyState !== 1) return false;
            return true;
        } catch {
            return false;
        }
    }

    // ── Enviar mensagem com retry ──
    async function _safeSend(jid, content, retries = 2) {
        const conn = global.conn;
        if (!conn || !conn.sendMessage) return false;
        for (let i = 0; i <= retries; i++) {
            try {
                await conn.sendMessage(jid, content);
                return true;
            } catch (e) {
                if (i < retries) {
                    await new Promise(r => setTimeout(r, 2000 * (i + 1)));
                } else {
                    console.error(`[ALUGUEL] Falha ao enviar para ${jid}:`, e.message);
                    return false;
                }
            }
        }
        return false;
    }

    async function verificar() {
        if (!_isConnReady()) return;

        const lista = getAluguel();
        const agora = Math.floor(Date.now() / 1000);
        let alterou = false;
        const donoJid = numerodono_ofc + "@s.whatsapp.net";

        for (let i = 0; i < lista.length; i++) {
            const c = lista[i];

            // Ignorar contratos pausados
            if (c.pausado) continue;

            const restante = c.vencimento - agora;
            const dias7 = 7 * 86400;
            const dias3 = 3 * 86400;
            const dias1 = 86400;

            try {
                const dataVenc = moment.unix(c.vencimento).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");
                const diasRest = Math.floor(restante / 86400);
                const horasRest = Math.floor((restante % 86400) / 3600);

                // ── Aviso 7 dias antes ──────────────────────────────────
                if (!c.aviso_7d_enviado && restante > 0 && restante <= dias7 && restante > dias3) {
                    c.aviso_7d_enviado = true;
                    alterou = true;
                    await _safeSend(donoJid, {
                        text: `│\n│  📢 *VENCIMENTO EM ${diasRest} DIAS*\n├──────────────\n│\n│  🏘️ *${c.nome_}*\n│  ⏳ Vence: *${dataVenc}*\n│  👤 ${c.responsavel_nome}\n│  📞 wa.me/${c.responsavel_contato}\n│  💰 Valor: ${c.valor}\n│\n├──────────────\n│  💡 *!renovaraluguel ${c.nome_}*`
                    });

                    // Notificar o responsável também (aviso suave)
                    if (c.responsavel_contato && c.responsavel_contato !== "Não informado") {
                        const respJid7 = c.responsavel_contato.replace(/\D/g, "") + "@s.whatsapp.net";
                        await _safeSend(respJid7, {
                            text: `│\n│  📢 *LEMBRETE*\n├──────────────\n│\n│  Olá ${c.responsavel_nome}! 👋\n│\n│  O contrato do bot no grupo\n│  *${c.nome_}* vence em\n│  *${diasRest} dia(s)*.\n│\n│  📅 Vencimento: ${dataVenc}\n│\n│  Deseja renovar? Fale com o dono:\n│  📞 wa.me/${numerodono_ofc}\n├──────────────\n│  _Mensagem automática do bot._`
                        });
                    }
                }

                // ── Aviso 3 dias antes ──────────────────────────────────
                if (!c.aviso_3d_enviado && restante > 0 && restante <= dias3) {
                    c.aviso_3d_enviado = true;
                    alterou = true;
                    await _safeSend(donoJid, {
                        text: `│\n│  ⚠️ *VENCIMENTO EM ${diasRest}d ${horasRest}h*\n├──────────────\n│\n│  🏘️ *${c.nome_}*\n│  ⏳ Vence: *${dataVenc}*\n│  👤 ${c.responsavel_nome}\n│  📞 wa.me/${c.responsavel_contato}\n│  💰 Valor: ${c.valor}\n│\n├──────────────\n│  💡 *!renovaraluguel* (no grupo)\n│  💡 *!renovaraluguel ${c.nome_}* (PV)`
                    });

                    // Notificar o responsável também
                    if (c.responsavel_contato && c.responsavel_contato !== "Não informado") {
                        const respJid = c.responsavel_contato.replace(/\D/g, "") + "@s.whatsapp.net";
                        await _safeSend(respJid, {
                            text: `│\n│  ⚠️ *AVISO DE VENCIMENTO*\n├──────────────\n│\n│  Olá ${c.responsavel_nome}! 👋\n│\n│  O contrato do bot no grupo\n│  *${c.nome_}* vence em\n│  *${diasRest} dia(s)*.\n│\n│  📅 Vencimento: ${dataVenc}\n│\n│  Para renovar, entre em contato:\n│  📞 wa.me/${numerodono_ofc}\n├──────────────\n│  _Mensagem automática do bot._`
                        });
                    }
                }

                // ── Aviso 1 dia antes ───────────────────────────────────
                if (!c.aviso_1d_enviado && restante > 0 && restante <= dias1) {
                    c.aviso_1d_enviado = true;
                    alterou = true;
                    await _safeSend(donoJid, {
                        text: `│\n│  🚨 *ALERTA: VENCE EM ${horasRest}h!*\n├──────────────\n│\n│  🏘️ *${c.nome_}*\n│  ⏳ Vence: *${dataVenc}*\n│  👤 ${c.responsavel_nome}\n│  📞 wa.me/${c.responsavel_contato}\n│  💰 Valor: ${c.valor}\n│\n├──────────────\n│  ❗ *!renovaraluguel* (no grupo)\n│  ❗ *!renovaraluguel ${c.nome_}* (PV)`
                    });

                    // Alerta URGENTE ao responsável
                    if (c.responsavel_contato && c.responsavel_contato !== "Não informado") {
                        const respJid1d = c.responsavel_contato.replace(/\D/g, "") + "@s.whatsapp.net";
                        await _safeSend(respJid1d, {
                            text: `│\n│  🚨 *ALERTA URGENTE!*\n├──────────────\n│\n│  ${c.responsavel_nome}, o contrato\n│  do grupo *${c.nome_}* vence\n│  em *${horasRest} hora(s)!*\n│\n│  📅 Vencimento: ${dataVenc}\n│\n│  ❗ O bot será *removido* ao vencer.\n│  Para renovar, fale com o dono:\n│  📞 wa.me/${numerodono_ofc}\n├──────────────\n│  _Mensagem automática do bot._`
                        });
                    }
                }

                // ── Venceu ──────────────────────────────────────────────
                if (restante <= 0) {
                    const dataAluguel = moment(c.data_aluguel).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm");

                    // Avisa o dono
                    await _safeSend(donoJid, {
                        text: `│\n│  🔴 *ALUGUEL ENCERRADO*\n├──────────────\n│\n│  🏘️ *${c.nome_}*\n│  🔗 ${c.link || "Sem link"}\n│  👤 ${c.responsavel_nome}\n│  📞 wa.me/${c.responsavel_contato}\n│\n│  📅 Alugado: ${dataAluguel}\n│  ⏳ Venceu: ${dataVenc}\n│  💰 Valor: ${c.valor}\n│  🔄 Renovações: ${c.renovacoes || 0}x\n│\n├──────────────\n│  🚪 _Bot saindo do grupo..._`
                    });

                    // Avisa o grupo antes de sair
                    if (c.id_gp) {
                        await _safeSend(c.id_gp, {
                            text: `│\n│  ⏰ *ALUGUEL ENCERRADO*\n├──────────────\n│\n│  O contrato expirou e o bot irá sair.\n│\n│  Para renovar ou recontratar:\n│  📞 wa.me/${numerodono_ofc}\n│\n│  Obrigado por usar nossos serviços! 🚀`
                        });
                    }

                    // Notificar responsável
                    if (c.responsavel_contato && c.responsavel_contato !== "Não informado") {
                        const respJid = c.responsavel_contato.replace(/\D/g, "") + "@s.whatsapp.net";
                        await _safeSend(respJid, {
                            text: `│\n│  ⏰ *CONTRATO ENCERRADO*\n├──────────────\n│\n│  Olá ${c.responsavel_nome}! 👋\n│\n│  O contrato do grupo *${c.nome_}*\n│  expirou e o bot foi removido.\n│\n│  Para renovar:\n│  📞 wa.me/${numerodono_ofc}\n├──────────────\n│  _Mensagem automática do bot._`
                        });
                    }

                    // Sai do grupo
                    if (c.id_gp) {
                        try {
                            await global.conn.groupLeave(c.id_gp);
                            console.log(`[ALUGUEL] Bot saiu do grupo: ${c.nome_} (${c.id_gp})`);
                        } catch (e) {
                            console.error("[ALUGUEL] Erro ao sair do grupo:", e.message);
                        }
                    }

                    // Salvar no histórico e remover
                    addHistorico(c, "expirado");
                    lista.splice(i, 1);
                    i--;
                    alterou = true;
                }
            } catch (itemErr) {
                console.error("[ALUGUEL] Erro ao processar contrato:", itemErr.message);
            }
        }

        if (alterou) {
            try { setAluguel(lista); } catch (e) {
                console.error("[ALUGUEL] Erro ao salvar:", e.message);
            }
        }
    }

    // Primeira verificação após 10s (dar tempo pro socket conectar)
    setTimeout(() => {
        verificar().catch(e => console.error("[ALUGUEL] Erro na primeira verificação:", e.message));
    }, 10000);

    // Verificar a cada 15 MINUTOS (antes era 1h — contratos ficavam ativo até 59min após vencimento)
    setInterval(() => verificar().catch(e => console.error("[ALUGUEL] Erro no scheduler:", e.message)), 15 * 60 * 1000);
}

// ── ZERAR TODOS OS CONTRATOS ─────────────────────────────
function zerarAluguel() {
    const lista = getAluguel();
    // Salvar todos no histórico antes de zerar
    lista.forEach(c => addHistorico(c, "zerado_manual"));
    setAluguel([]);
}

module.exports = {
    getAluguel,
    setAluguel,
    getAluguelByGrupo,
    getAluguelByLink,
    buscarContrato,
    adicionarContrato,
    renovarContrato,
    removerContrato,
    formatarContrato,
    initAluguelScheduler,
    zerarAluguel,
    // Novos v2.0
    pausarContrato,
    retomarContrato,
    editarContrato,
    getHistorico,
    getEstatisticas,
};
