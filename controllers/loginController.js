// controllers/loginController.js
import { pool } from "../bd.js";
import jwt from "jsonwebtoken";
import { SECRET } from "../middlewares/autenticar.js";

export async function fazerLogin(req, res) {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ sucesso: false, message: "Usuário e senha são obrigatórios." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuario WHERE usuario = ? AND senha = ?",
      [usuario, senha]
    );

    if (rows.length === 0) {
      return res.status(401).json({ sucesso: false, message: "Usuário ou senha inválidos." });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.idusuario, nome: user.nome, usuario: user.usuario },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso!",
      token,
      dados: {
        id: user.idusuario,
        nome: user.nome,
        usuario: user.usuario,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    res.status(500).json({ sucesso: false, message: "Erro interno do servidor." });
  }
}
