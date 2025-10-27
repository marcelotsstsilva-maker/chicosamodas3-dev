const db = require("../bd");

async function listarEstoque(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM estoque");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar estoque" });
  }
}

module.exports = { listarEstoque };
