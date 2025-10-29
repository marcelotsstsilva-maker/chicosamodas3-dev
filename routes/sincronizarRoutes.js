import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// ======================================================
// 🗂️ Configurações de pasta e versão
// ======================================================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const versaoBanco = 5; // ⬅️ número da versão atual do banco
const nomeBanco = `loja_v${versaoBanco}.db`; // ⬅️ nome do arquivo de banco

// ======================================================
// 💾 Configurar armazenamento do Multer
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, nomeBanco)
});
const upload = multer({ storage });

// ======================================================
// 📤 Enviar banco do app → servidor
// ======================================================
router.post("/enviar", upload.single("file"), (req, res) => {
  console.log("📥 Banco recebido do app e salvo em uploads/" + nomeBanco);
  res.json({ success: true, message: "Banco recebido e salvo com sucesso!" });
});

// ======================================================
// 📥 Baixar banco do servidor → app
// ======================================================
router.get("/baixar", (req, res) => {
  const bancoPath = path.join(uploadDir, nomeBanco);
  if (!fs.existsSync(bancoPath)) {
    return res.status(404).json({ error: "Banco ainda não disponível" });
  }
  console.log("📤 Enviando banco para o app...");
  res.download(bancoPath, "loja.db"); // o app sempre recebe como loja.db
});

// ======================================================
// 🔢 Verificar versão atual do banco
// ======================================================
router.get("/versao", (req, res) => {
  res.json({
    versao: versaoBanco,
    arquivo: nomeBanco,
    atualizadoEm: fs.existsSync(path.join(uploadDir, nomeBanco))
      ? fs.statSync(path.join(uploadDir, nomeBanco)).mtime
      : null
  });
});

export default router;
