import express from "express";
import variacaoProdutoController from "../controllers/variacaoProdutoController.js";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

// 🔐 Requer autenticação
router.use(autenticar);

// ✅ CRUD de variações
router.post("/", variacaoProdutoController.cadastrarVariacao);
router.get("/", variacaoProdutoController.listarVariacoes);
router.get("/:id", variacaoProdutoController.obterVariacao);
router.put("/:id", variacaoProdutoController.atualizarVariacao);
router.delete("/:id", variacaoProdutoController.deletarVariacao);

// ✅ Atualização direta de estoque
router.patch("/:id/quantidade", variacaoProdutoController.atualizarQuantidade);

export default router;
