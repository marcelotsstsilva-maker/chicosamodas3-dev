import { pool } from "../bd.js";

// ✅ Registrar uma saída manual (retirada, despesa, ajuste, etc)
async function registrarSaida(req, res) {
  const { origem, descricao, valor, observacao } = req.body;

  if (!valor || valor <= 0) {
    return res.status(400).json({
      sucesso: false,
      message: "O valor da saída é obrigatório e deve ser maior que zero.",
    });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query(
      `INSERT INTO caixa (tipo, origem, descricao, valor, observacao, data_movimento)
       VALUES ('saida', ?, ?, ?, ?, NOW())`,
      [origem || "retirada", descricao || "Saída de caixa", valor, observacao || null]
    );

    await conn.commit();

    res.status(201).json({
      sucesso: true,
      message: "✅ Saída registrada com sucesso!",
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao registrar saída:", err.sqlMessage || err);
    res.status(500).json({
      sucesso: false,
      message: "Erro ao registrar saída.",
    });
  } finally {
    conn.release();
  }
}

// ✅ Listar movimentações do caixa (com filtro opcional por período)
async function listarMovimentacoes(req, res) {
  // 🔹 Compatível com ?inicio=2025-10-01&fim=2025-10-31
  const { inicio, fim } = req.query;

  let sql = `
    SELECT 
      idcaixa, tipo, origem, descricao, valor, data_movimento, idvenda, observacao
    FROM caixa
    WHERE 1=1
  `;
  const params = [];

  if (inicio) {
    sql += " AND DATE(data_movimento) >= ?";
    params.push(inicio);
  }
  if (fim) {
    sql += " AND DATE(data_movimento) <= ?";
    params.push(fim);
  }

  sql += " ORDER BY data_movimento DESC";

  try {
    const [rows] = await pool.query(sql, params);
    res.status(200).json({ sucesso: true, movimentacoes: rows });
  } catch (err) {
    console.error("❌ Erro ao listar movimentações:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao listar movimentações." });
  }
}

// ✅ Obter saldo atual do caixa (ou filtrado por período)
async function obterSaldo(req, res) {
  const { inicio, fim } = req.query;

  let sql = `
    SELECT 
      SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) -
      SUM(CASE WHEN tipo='saida' THEN valor ELSE 0 END) AS saldo_atual
    FROM caixa
    WHERE 1=1
  `;
  const params = [];

  if (inicio) {
    sql += " AND DATE(data_movimento) >= ?";
    params.push(inicio);
  }
  if (fim) {
    sql += " AND DATE(data_movimento) <= ?";
    params.push(fim);
  }

  try {
    const [rows] = await pool.query(sql, params);
    const saldoAtual = rows[0].saldo_atual || 0;

    res.status(200).json({ sucesso: true, saldo: saldoAtual });
  } catch (err) {
    console.error("❌ Erro ao obter saldo:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao obter saldo do caixa." });
  }
}

// ✅ Deletar uma movimentação (saída ou entrada)
async function deletarMovimentacao(req, res) {
  const { idcaixa } = req.params;

  if (!idcaixa) {
    return res.status(400).json({ sucesso: false, message: "ID da movimentação é obrigatório." });
  }

  try {
    const [resultado] = await pool.query("DELETE FROM caixa WHERE idcaixa = ?", [idcaixa]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, message: "Movimentação não encontrada." });
    }

    res.status(200).json({
      sucesso: true,
      message: "✅ Movimentação excluída com sucesso!",
    });
  } catch (err) {
    console.error("❌ Erro ao deletar movimentação:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao excluir movimentação do caixa." });
  }
}

// ✅ Relatório: Fluxo de Caixa Anual
async function fluxoCaixaAnual(req, res) {
  const { ano } = req.query;
  const anoFiltro = ano || new Date().getFullYear();

  try {
    // 🔹 Agrupar entradas e saídas por mês
    const [rows] = await pool.query(
      `
      SELECT 
        MONTH(data_movimento) AS mes,
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) AS entradas,
        SUM(CASE WHEN tipo='saida' THEN valor ELSE 0 END) AS saidas,
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE -valor END) AS saldo
      FROM caixa
      WHERE YEAR(data_movimento) = ?
      GROUP BY MONTH(data_movimento)
      ORDER BY mes
      `,
      [anoFiltro]
    );

    // 🔹 Converter número do mês para nome
    const nomesMeses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const meses = rows.map(r => ({
      nome: nomesMeses[r.mes - 1],
      entradas: Number(r.entradas) || 0,
      saidas: Number(r.saidas) || 0,
      saldo: Number(r.saldo) || 0,
    }));

    // 🔹 Totais do ano
    const totalEntradas = meses.reduce((acc, m) => acc + m.entradas, 0);
    const totalSaidas = meses.reduce((acc, m) => acc + m.saidas, 0);
    const saldoFinal = totalEntradas - totalSaidas;

    res.status(200).json({
      sucesso: true,
      ano: anoFiltro,
      totalEntradas,
      totalSaidas,
      saldoFinal,
      meses
    });

  } catch (err) {
    console.error("❌ Erro ao gerar fluxo de caixa anual:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao gerar fluxo de caixa anual." });
  }
}


export default {
  registrarSaida,
  listarMovimentacoes,
  obterSaldo,
  deletarMovimentacao, // 👈 adiciona aqui
  fluxoCaixaAnual, // 👈 não esquece este!
};