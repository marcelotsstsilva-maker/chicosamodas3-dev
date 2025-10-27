// controllers/usuarioController.js
import { pool } from "../bd.js";

export async function listarUsuarios(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM usuario");
    res.json({ sucesso: true, total: rows.length, usuarios: rows });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error.message);
    res.status(500).json({ sucesso: false, message: "Erro ao buscar usuários." });
  }
}
