// server.js
import express from "express";
import cors from "cors";

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

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Suas rotas
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

// 🔹 Teste de status
app.get("/", (req, res) => {
  res.json({ message: "✅ API Loja Roupas funcionando!" });
});

// 🔹 Tratamento de erro padrão
app.use((err, req, res, next) => {
  console.error("Erro interno:", err);
  res.status(500).json({ message: "Erro interno no servidor." });
});

// ⚠️ ALTERAÇÃO IMPORTANTE AQUI 👇
const PORT = process.env.PORT || 3000; // Render define a porta automaticamente
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
