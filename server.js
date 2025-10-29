// server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

import loginRoutes from "./routes/loginRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import fornecedorRoutes from "./routes/fornecedorRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import variacaoProdutoRoutes from "./routes/variacaoProdutoRoutes.js";
import fiadoRoutes from "./routes/fiadoRoutes.js";
import taxaCartaoRoutes from "./routes/taxaCartaoRoutes.js";
import vendaRoutes from "./routes/vendaRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import caixaRoutes from "./routes/caixaRoutes.js";
import sincronizarRoutes from "./routes/sincronizarRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Suas rotas principais
app.use("/login", loginRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/variacoes", variacaoProdutoRoutes);
app.use("/api/fiados", fiadoRoutes);
app.use("/api/taxas", taxaCartaoRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/relatorios", relatorioRoutes);
app.use("/api/caixa", caixaRoutes);
app.use("/api/sincronizar", sincronizarRoutes);


// 🔹 Teste de status
app.get("/", (req, res) => {
  res.json({ message: "✅ API Loja Roupas funcionando!" });
});

// ======================================================
// 📦 ROTAS DO BANCO LOCAL (Upload e Download de loja.db)
// ======================================================

// Criar pasta "uploads" se não existir
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, "loja.db")
});

const upload = multer({ storage });

// 📤 Receber banco do app
app.post("/api/banco/enviar", upload.single("file"), (req, res) => {
  console.log("📥 Banco recebido e salvo com sucesso!");
  res.json({ success: true, message: "Banco salvo com sucesso!" });
});

// 📥 Enviar banco para o app
app.get("/api/banco/baixar", (req, res) => {
  const bancoPath = path.join(uploadDir, "loja.db");
  if (!fs.existsSync(bancoPath)) {
    return res.status(404).json({ error: "Banco não encontrado" });
  }
  res.download(bancoPath, "loja.db");
});

// ======================================================

// 🔹 Tratamento de erro padrão
app.use((err, req, res, next) => {
  console.error("Erro interno:", err);
  res.status(500).json({ message: "Erro interno no servidor." });
});

// 🔹 Inicialização do servidor
const PORT = process.env.PORT || 3000; // Render define a porta automaticamente
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
