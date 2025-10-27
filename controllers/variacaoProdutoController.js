import { pool } from "../bd.js";

// ✅ Cadastrar variação de produto
async function cadastrarVariacao(req, res) {
  const { idproduto, sku, tamanho, cor, tecido, quantidade } = req.body;

  if (!idproduto) {
    return res.status(400).json({ error: "O campo 'idproduto' é obrigatório." });
  }

  const sql = `
    INSERT INTO variacao_produto (idproduto, sku, tamanho, cor, tecido, quantidade)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    // 🔹 1️⃣ Inserir a variação
    const [result] = await pool.query(sql, [
      idproduto,
      sku || null,
      tamanho || null,
      cor || null,
      tecido || null,
      quantidade || 0,
    ]);

    const idvariacao = result.insertId;

    // 🔹 2️⃣ Se houver quantidade inicial, registrar movimentação de entrada
    if (quantidade > 0) {
      await pool.query(
        `
        INSERT INTO movimentacao_estoque (idvariacao, tipo, quantidade, motivo, data_mov)
        VALUES (?, 'entrada', ?, 'Entrada inicial da variação', NOW())
        `,
        [idvariacao, quantidade]
      );
    }

    // 🔹 3️⃣ Resposta final
    res.status(201).json({
      message: "✅ Variação cadastrada com sucesso!",
      idvariacao,
    });
  } catch (err) {
    console.error("❌ Erro ao cadastrar variação:", err);
    res.status(500).json({ error: "Erro ao cadastrar variação." });
  }
}

// ✅ Listar todas as variações (opcionalmente por produto)
async function listarVariacoes(req, res) {
  const { idproduto } = req.query;

  const sqlBase = `
    SELECT 
      vp.idvariacao,
      vp.idproduto,
      vp.sku,
      vp.tamanho,
      vp.cor,
      vp.tecido,
      vp.quantidade,
      p.nome AS nome_produto
    FROM variacao_produto vp
    LEFT JOIN produto p ON vp.idproduto = p.idproduto
  `;

  const sql = idproduto
    ? `${sqlBase} WHERE vp.idproduto = ? ORDER BY vp.idvariacao DESC`
    : `${sqlBase} ORDER BY vp.idvariacao DESC`;

  try {
    const [results] = await pool.query(sql, idproduto ? [idproduto] : []);
    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Erro ao listar variações:", err);
    res.status(500).json({ error: "Erro ao listar variações." });
  }
}

// ✅ Buscar variação por ID
async function obterVariacao(req, res) {
  const { id } = req.params;

  try {
    const [results] = await pool.query(
      "SELECT * FROM variacao_produto WHERE idvariacao = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: "Variação não encontrada." });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    console.error("❌ Erro ao buscar variação:", err);
    res.status(500).json({ error: "Erro ao buscar variação." });
  }
}

// ✅ Atualizar variação
async function atualizarVariacao(req, res) {
  const { id } = req.params;
  const { sku, tamanho, cor, tecido, quantidade } = req.body;

  const sql = `
    UPDATE variacao_produto
    SET sku = ?, tamanho = ?, cor = ?, tecido = ?, quantidade = ?
    WHERE idvariacao = ?
  `;

  try {
    const [result] = await pool.query(sql, [
      sku,
      tamanho,
      cor,
      tecido,
      quantidade,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variação não encontrada." });
    }

    res.status(200).json({ message: "✅ Variação atualizada com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao atualizar variação:", err);
    res.status(500).json({ error: "Erro ao atualizar variação." });
  }
}

// ✅ Excluir variação
async function deletarVariacao(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM variacao_produto WHERE idvariacao = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variação não encontrada." });
    }

    res.status(200).json({ message: "✅ Variação excluída com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao excluir variação:", err);
    res.status(500).json({ error: "Erro ao excluir variação." });
  }
}

// ✅ Atualizar quantidade (ex: ao vender produto)
async function atualizarQuantidade(req, res) {
  const { id } = req.params;
  const { quantidade } = req.body;

  if (quantidade == null) {
    return res.status(400).json({ error: "Informe a nova quantidade." });
  }

  const sql = `
    UPDATE variacao_produto
    SET quantidade = ?
    WHERE idvariacao = ?
  `;

  try {
    const [result] = await pool.query(sql, [quantidade, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variação não encontrada." });
    }

    res.status(200).json({ message: "✅ Quantidade atualizada com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao atualizar quantidade:", err);
    res.status(500).json({ error: "Erro ao atualizar quantidade." });
  }
}

export default {
  cadastrarVariacao,
  listarVariacoes,
  obterVariacao,
  atualizarVariacao,
  deletarVariacao,
  atualizarQuantidade,
};
