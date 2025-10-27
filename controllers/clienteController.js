import { pool } from "../bd.js"; // 🔧 usa o mesmo pool do mysql2/promise

// ✅ Cadastrar cliente
async function cadastrarCliente(req, res) {
  const { nome, telefone, email, endereco } = req.body;

  if (!nome || nome.trim() === "") {
    return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
  }

  const sql = `
    INSERT INTO cliente (nome, telefone, email, endereco)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(sql, [nome, telefone, email, endereco]);
    res.status(201).json({
      message: "✅ Cliente cadastrado com sucesso!",
      idcliente: result.insertId,
    });
  } catch (err) {
    console.error("❌ Erro ao cadastrar cliente:", err);
    res.status(500).json({ error: "Erro ao cadastrar cliente." });
  }
}

// ✅ Listar todos os clientes
async function listarClientes(req, res) {
  const sql = `
    SELECT 
      idcliente,
      nome,
      telefone,
      email,
      endereco,
      COALESCE(data_cadastro, NOW()) AS data_cadastro
    FROM cliente
    ORDER BY data_cadastro DESC
  `;

  try {
    const [results] = await pool.query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Erro ao listar clientes:", err);
    res.status(500).json({ error: "Erro ao listar clientes." });
  }
}

// ✅ Buscar cliente por ID
async function obterCliente(req, res) {
  const { id } = req.params;

  try {
    const [results] = await pool.query("SELECT * FROM cliente WHERE idcliente = ?", [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    console.error("❌ Erro ao buscar cliente:", err);
    res.status(500).json({ error: "Erro ao buscar cliente." });
  }
}

// ✅ Atualizar cliente
async function atualizarCliente(req, res) {
  const { id } = req.params;
  const { nome, telefone, email, endereco } = req.body;

  if (!nome || nome.trim() === "") {
    return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
  }

  const sql = `
    UPDATE cliente
    SET nome = ?, telefone = ?, email = ?, endereco = ?
    WHERE idcliente = ?
  `;

  try {
    const [result] = await pool.query(sql, [nome, telefone, email, endereco, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }
    res.status(200).json({ message: "✅ Cliente atualizado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao atualizar cliente:", err);
    res.status(500).json({ error: "Erro ao atualizar cliente." });
  }
}

// ✅ Excluir cliente
async function deletarCliente(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM cliente WHERE idcliente = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }
    res.status(200).json({ message: "✅ Cliente excluído com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao excluir cliente:", err);
    res.status(500).json({ error: "Erro ao excluir cliente." });
  }
}

// 🔹 Exportação padrão
export default {
  cadastrarCliente,
  listarClientes,
  obterCliente,
  atualizarCliente,
  deletarCliente,
};
