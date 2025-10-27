import express from "express";
import produtoController from "../controllers/produtoController.js";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

// 🔐 Todas as rotas exigem autenticação
router.use(autenticar);

// ✅ CRUD de produtos
router.post("/", produtoController.cadastrarProduto);
router.get("/", produtoController.listarProdutos);
router.get("/:id", produtoController.obterProduto);
router.put("/:id", produtoController.atualizarProduto);
router.delete("/:id", produtoController.deletarProduto);

export default router;
