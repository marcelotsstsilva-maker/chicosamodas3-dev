import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// 🔹 Criar pasta "uploads" se não existir
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 🔹 Configurar armazenamento do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, "loja.db")
});
const upload = multer({ storage });

// ======================================================
// 📤 Enviar banco do app → servidor
// ======================================================
router.post("/enviar", upload.single("file"), (req, res) => {
  console.log("📥 Banco recebido do app e salvo em uploads/loja.db");
  res.json({ success: true, message: "Banco recebido e salvo com sucesso!" });
});

// ======================================================
// 📥 Baixar banco do servidor → app
// ======================================================
router.get("/baixar", (req, res) => {
  const bancoPath = path.join(uploadDir, "loja.db");
  if (!fs.existsSync(bancoPath)) {
    return res.status(404).json({ error: "Banco ainda não disponível" });
  }
  console.log("📤 Enviando banco para o app...");
  res.download(bancoPath, "loja.db");
});

export default router;
