import { pool } from "../bd.js";

// ✅ Cadastrar produto (com registro opcional de entrada no estoque)
async function cadastrarProduto(req, res) {
  const {
    codigo,
    idfornecedor,
    nome,
    descricao,
    categoria,
    genero,
    preco_custo,
    preco_venda,
    ativo,
    data_cadastro,
    quantidade_inicial = 0, // 🔹 Novo campo opcional
  } = req.body;

  if (!codigo?.trim()) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'código' é obrigatório." });
  }

  if (!nome?.trim()) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'nome' é obrigatório." });
  }

  if (!idfornecedor) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'fornecedor' é obrigatório." });
  }

  const sqlProduto = `
    INSERT INTO produto (
      codigo, idfornecedor, nome, descricao, categoria, genero, 
      preco_custo, preco_venda, ativo, data_cadastro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    // 🔹 1️⃣ Inserir o produto
    const [result] = await pool.query(sqlProduto, [
      codigo,
      idfornecedor,
      nome,
      descricao || null,
      categoria || null,
      genero || null,
      preco_custo || 0,
      preco_venda || 0,
      ativo ? 1 : 0,
      data_cadastro || new Date(),
    ]);

    const idproduto = result.insertId;

    // 🔹 2️⃣ Se tiver quantidade inicial, registrar movimentação de entrada
    if (quantidade_inicial > 0) {
      await pool.query(
        `
        INSERT INTO movimentacao_estoque (idvariacao, tipo, quantidade, motivo, data_mov)
        VALUES (?, 'entrada', ?, ?, NOW())
        `,
        [idproduto, quantidade_inicial, "Estoque inicial do produto"]
      );
    }

    res.status(201).json({
      sucesso: true,
      message: "✅ Produto cadastrado com sucesso!",
      idproduto,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        sucesso: false,
        message: "❌ Já existe um produto com esse código.",
      });
    }
    console.error("❌ Erro ao cadastrar produto:", err.sqlMessage || err);
    res
      .status(500)
      .json({ sucesso: false, message: "Erro ao cadastrar produto." });
  }
}

// ✅ Listar todos os produtos (com total de estoque e data_cadastro)
async function listarProdutos(req, res) {
  const sql = `
    SELECT 
      p.idproduto,
      p.codigo,
      p.nome,
      p.categoria,
      p.genero,
      p.preco_venda,
      p.ativo,
      COALESCE(SUM(vp.quantidade), 0) AS total_estoque,
      p.data_cadastro
    FROM produto p
    LEFT JOIN variacao_produto vp ON p.idproduto = vp.idproduto
    GROUP BY p.idproduto
    ORDER BY p.data_cadastro DESC
  `;

  try {
    const [results] = await pool.query(sql);
    res.status(200).json({ sucesso: true, produtos: results });
  } catch (err) {
    console.error("❌ Erro ao listar produtos:", err.sqlMessage || err);
    res
      .status(500)
      .json({ sucesso: false, message: "Erro ao listar produtos." });
  }
}

// ✅ Buscar produto por ID (com variações e data_cadastro)
async function obterProduto(req, res) {
  const { id } = req.params;

  try {
    const [produtos] = await pool.query(
      "SELECT * FROM produto WHERE idproduto = ?",
      [id]
    );

    if (!produtos.length) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Produto não encontrado." });
    }

    const produto = produtos[0];
    const [variacoes] = await pool.query(
      "SELECT * FROM variacao_produto WHERE idproduto = ?",
      [id]
    );

    res.status(200).json({ sucesso: true, produto, variacoes });
  } catch (err) {
    console.error("❌ Erro ao buscar produto:", err.sqlMessage || err);
    res
      .status(500)
      .json({ sucesso: false, message: "Erro ao buscar produto." });
  }
}

// ✅ Atualizar produto (mantendo data_cadastro intacta)
async function atualizarProduto(req, res) {
  const { id } = req.params;
  const {
    codigo,
    idfornecedor,
    nome,
    descricao,
    categoria,
    genero,
    preco_custo,
    preco_venda,
    ativo,
    data_cadastro,
  } = req.body;

  if (!codigo?.trim()) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'código' é obrigatório." });
  }

  if (!nome?.trim()) {
    return res
      .status(400)
      .json({ sucesso: false, message: "O campo 'nome' é obrigatório." });
  }

  const sql = `
    UPDATE produto
    SET codigo = ?, idfornecedor = ?, nome = ?, descricao = ?, categoria = ?, genero = ?, 
        preco_custo = ?, preco_venda = ?, ativo = ?, data_cadastro = ?
    WHERE idproduto = ?
  `;

  try {
    const [result] = await pool.query(sql, [
      codigo,
      idfornecedor || null,
      nome,
      descricao || null,
      categoria || null,
      genero || null,
      preco_custo || 0,
      preco_venda || 0,
      ativo ? 1 : 0,
      data_cadastro || new Date(),
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Produto não encontrado." });
    }

    res
      .status(200)
      .json({ sucesso: true, message: "✅ Produto atualizado com sucesso!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        sucesso: false,
        message: "❌ Já existe um produto com esse código.",
      });
    }
    console.error("❌ Erro ao atualizar produto:", err.sqlMessage || err);
    res
      .status(500)
      .json({ sucesso: false, message: "Erro ao atualizar produto." });
  }
}

// ✅ Excluir produto (com remoção das variações associadas)
async function deletarProduto(req, res) {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM variacao_produto WHERE idproduto = ?", [id]);
    const [result] = await pool.query(
      "DELETE FROM produto WHERE idproduto = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Produto não encontrado." });
    }

    res.status(200).json({
      sucesso: true,
      message: "✅ Produto e variações excluídos com sucesso!",
    });
  } catch (err) {
    console.error("❌ Erro ao excluir produto:", err.sqlMessage || err);
    res.status(500).json({
      sucesso: false,
      message: "Erro ao excluir produto e variações.",
    });
  }
}

export default {
  cadastrarProduto,
  listarProdutos,
  obterProduto,
  atualizarProduto,
  deletarProduto,
};
