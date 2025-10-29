import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import https from "https";

const router = express.Router();

// ======================================================
// 🗂️ Configurações de pasta e versão
// ======================================================
const uploadDir = path.resolve("./uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const versaoBanco = 5; // ⬅️ número da versão atual do banco
const nomeBanco = `loja_v${versaoBanco}.db`; // ⬅️ nome do arquivo de banco
const bancoPath = path.join(uploadDir, nomeBanco);

// ======================================================
// 📥 Baixar banco do GitHub automaticamente (caso não exista)
// ======================================================
if (!fs.existsSync(bancoPath)) {
  console.log("⚠️ Banco não encontrado localmente. Baixando do GitHub...");

  const url = "https://raw.githubusercontent.com/SEU_USUARIO/seu-repo/main/backend-loja/uploads/loja_v5.db"; 
  // ⬆️ substitua pelo link bruto correto do seu GitHub

  const file = fs.createWriteStream(bancoPath);
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log("✅ Banco baixado com sucesso para:", bancoPath);
      });
    } else {
      console.error("❌ Falha ao baixar banco. Status:", response.statusCode);
    }
  }).on("error", (err) => {
    console.error("❌ Erro ao tentar baixar banco:", err.message);
  });
}

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
  if (!fs.existsSync(bancoPath)) {
    return res.status(404).json({ error: "Banco ainda não disponível" });
  }
  console.log("📤 Enviando banco para o app...");
  res.download(bancoPath, "loja.db");
});

// ======================================================
// 🔢 Verificar versão atual do banco
// ======================================================
router.get("/versao", (req, res) => {
  res.json({
    versao: versaoBanco,
    arquivo: nomeBanco,
    atualizadoEm: fs.existsSync(bancoPath)
      ? fs.statSync(bancoPath).mtime
      : null
  });
});

export default router;
