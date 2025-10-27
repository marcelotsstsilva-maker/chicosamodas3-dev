import { pool } from "../bd.js";

// ✅ Cadastrar taxa (corrigido)
export async function cadastrarTaxa(req, res) {
  try {
    const { tipo, canal, parcelas, percentual, observacao } = req.body;

    // 🔹 Normaliza
    const tipoLimpo = tipo.trim().toLowerCase();
    const canalLimpo = canal.trim().toLowerCase();

    // 🔍 Verifica se já existe taxa igual
    const [existe] = await pool.query(
      "SELECT idtaxa FROM taxa_cartao WHERE tipo = ? AND canal = ? AND parcelas = ?",
      [tipoLimpo, canalLimpo, parcelas]
    );

    if (existe.length > 0) {
      return res.status(400).json({
        sucesso: false,
        message: "❌ Já existe uma taxa para esse tipo, canal e número de parcelas.",
      });
    }

    // 💾 Insere nova taxa
    await pool.query(
      "INSERT INTO taxa_cartao (tipo, canal, parcelas, percentual, observacao, data_atualizacao) VALUES (?, ?, ?, ?, ?, NOW())",
      [tipoLimpo, canalLimpo, parcelas, percentual, observacao || ""]
    );

    res.json({ sucesso: true, message: "✅ Taxa cadastrada com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar taxa:", error);
    res.status(500).json({ sucesso: false, message: "Erro ao cadastrar taxa." });
  }
}

// ✅ Listar taxas
export async function listarTaxas(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM taxa_cartao ORDER BY tipo, canal, parcelas"
    );

    res.json({
      sucesso: true,
      taxas: rows,
    });
  } catch (error) {
    console.error("Erro ao listar taxas:", error);
    res.status(500).json({
      sucesso: false,
      message: "Erro ao listar taxas.",
    });
  }
}


// ✅ Obter taxa por ID
async function obterTaxa(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM taxa_cartao WHERE idtaxa = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        sucesso: false,
        message: "Taxa não encontrada.",
      });
    }

    res.status(200).json({ sucesso: true, taxa: rows[0] });
  } catch (err) {
    console.error("❌ Erro ao buscar taxa:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao buscar taxa." });
  }
}

// ✅ Atualizar taxa
async function atualizarTaxa(req, res) {
  const { id } = req.params;
  const { tipo, canal, parcelas, percentual, observacao } = req.body;

  if (!tipo || !["debito", "credito"].includes(tipo)) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'tipo' deve ser 'debito' ou 'credito'." });
  }

  if (!canal || !["maquineta", "celular"].includes(canal)) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'canal' deve ser 'maquineta' ou 'celular'." });
  }

  if (!parcelas || parcelas < 1 || parcelas > 12) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'parcelas' deve estar entre 1 e 12." });
  }

  if (percentual == null || isNaN(percentual)) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'percentual' é obrigatório e deve ser numérico." });
  }

  const sql = `
    UPDATE taxa_cartao
    SET tipo = ?, canal = ?, parcelas = ?, percentual = ?, observacao = ?, data_atualizacao = NOW()
    WHERE idtaxa = ?
  `;

  try {
    const [result] = await pool.query(sql, [
      tipo,
      canal,
      parcelas,
      percentual,
      observacao || null,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Taxa não encontrada." });
    }

    res.status(200).json({
      sucesso: true,
      message: "✅ Taxa atualizada com sucesso!",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        sucesso: false,
        message: "❌ Já existe uma taxa para esse tipo, canal e número de parcelas.",
      });
    }
    console.error("❌ Erro ao atualizar taxa:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao atualizar taxa." });
  }
}

// ✅ Excluir taxa
async function deletarTaxa(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM taxa_cartao WHERE idtaxa = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Taxa não encontrada." });
    }

    res.status(200).json({
      sucesso: true,
      message: "✅ Taxa excluída com sucesso!",
    });
  } catch (err) {
    console.error("❌ Erro ao excluir taxa:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao excluir taxa." });
  }
}

// ✅ Filtrar taxas por tipo e canal (nova função)
async function filtrarPorTipoCanal(tipo, canal) {
  if (!["debito", "credito"].includes(tipo) || !["maquineta", "celular"].includes(canal)) {
    throw new Error("Tipo ou canal inválido.");
  }

  const sql = `
    SELECT idtaxa, tipo, canal, parcelas, percentual, observacao, data_atualizacao
    FROM taxa_cartao
    WHERE tipo = ? AND canal = ?
    ORDER BY parcelas ASC
  `;

  return pool.query(sql, [tipo, canal]);
}

export default {
  cadastrarTaxa,
  listarTaxas,
  obterTaxa,
  atualizarTaxa,
  deletarTaxa,
  filtrarPorTipoCanal, // 🔹 nova função exportada
};
