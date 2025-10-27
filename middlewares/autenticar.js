// middlewares/autenticar.js
import jwt from "jsonwebtoken";

export const SECRET = "chave-super-secreta-448201";

export default function autenticar(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ sucesso: false, message: "Token não fornecido." });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(403).json({ sucesso: false, message: "Token inválido ou expirado." });
  }
}
