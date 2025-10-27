import { pool } from "../bd.js"; // 🔧 usa o mesmo pool do mysql2/promise

// ✅ Cadastrar fornecedor
async function cadastrarFornecedor(req, res) {
  const { nome, cnpj, telefone, email, endereco, observacoes } = req.body;

  if (!nome || nome.trim() === "") {
    return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
  }

  const sql = `
    INSERT INTO fornecedor (nome, cnpj, telefone, email, endereco, observacoes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(sql, [nome, cnpj, telefone, email, endereco, observacoes]);
    res.status(201).json({
      message: "✅ Fornecedor cadastrado com sucesso!",
      idfornecedor: result.insertId,
    });
  } catch (err) {
    console.error("❌ Erro ao cadastrar fornecedor:", err);
    res.status(500).json({ error: "Erro ao cadastrar fornecedor." });
  }
}

// ✅ Listar todos os fornecedores
async function listarFornecedores(req, res) {
  const sql = `
    SELECT 
      idfornecedor, 
      nome, 
      cnpj, 
      telefone, 
      email, 
      endereco, 
      observacoes,
      COALESCE(data_cadastro, NOW()) AS data_cadastro
    FROM fornecedor
    ORDER BY data_cadastro DESC
  `;

  try {
    const [results] = await pool.query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Erro ao listar fornecedores:", err);
    res.status(500).json({ error: "Erro ao listar fornecedores." });
  }
}

// ✅ Buscar fornecedor por ID
async function obterFornecedor(req, res) {
  const { id } = req.params;

  try {
    const [results] = await pool.query("SELECT * FROM fornecedor WHERE idfornecedor = ?", [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Fornecedor não encontrado." });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    console.error("❌ Erro ao buscar fornecedor:", err);
    res.status(500).json({ error: "Erro ao buscar fornecedor." });
  }
}

// ✅ Atualizar fornecedor
async function atualizarFornecedor(req, res) {
  const { id } = req.params;
  const { nome, cnpj, telefone, email, endereco, observacoes } = req.body;

  const sql = `
    UPDATE fornecedor
    SET nome = ?, cnpj = ?, telefone = ?, email = ?, endereco = ?, observacoes = ?
    WHERE idfornecedor = ?
  `;

  try {
    await pool.query(sql, [nome, cnpj, telefone, email, endereco, observacoes, id]);
    res.status(200).json({ message: "✅ Fornecedor atualizado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao atualizar fornecedor:", err);
    res.status(500).json({ error: "Erro ao atualizar fornecedor." });
  }
}

// ✅ Excluir fornecedor
async function deletarFornecedor(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM fornecedor WHERE idfornecedor = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Fornecedor não encontrado." });
    }
    res.status(200).json({ message: "✅ Fornecedor excluído com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao excluir fornecedor:", err);
    res.status(500).json({ error: "Erro ao excluir fornecedor." });
  }
}

// ✅ Ranking de fornecedores
async function rankingFornecedores(req, res) {
  const sql = `
    SELECT 
      f.idfornecedor, 
      f.nome, 
      COUNT(v.idvenda) AS total_vendas
    FROM fornecedor f
    LEFT JOIN vendas v ON f.idfornecedor = v.idfornecedor
    WHERE MONTH(v.data_venda) = MONTH(CURRENT_DATE())
      AND YEAR(v.data_venda) = YEAR(CURRENT_DATE())
    GROUP BY f.idfornecedor
    ORDER BY total_vendas DESC
    LIMIT 10
  `;

  try {
    const [results] = await pool.query(sql);
    const melhores = results.slice(0, 5);
    const piores = results.slice(-5).reverse();
    res.status(200).json({ melhores, piores });
  } catch (err) {
    console.error("❌ Erro ao buscar ranking:", err);
    res.status(500).json({ error: "Erro ao buscar ranking." });
  }
}

// 🔹 Exportação padrão (compatível com import default)
export default {
  cadastrarFornecedor,
  listarFornecedores,
  obterFornecedor,
  atualizarFornecedor,
  deletarFornecedor,
  rankingFornecedores,
};
