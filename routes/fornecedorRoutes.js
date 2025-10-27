// routes/fornecedorRoutes.js
import express from "express";
import fornecedorController from "../controllers/fornecedorController.js";
import autenticar from "../middlewares/autenticar.js"; // 👈 sem chaves!

const router = express.Router();

// 🔐 Todas as rotas abaixo exigem autenticação
router.use(autenticar);

// ✅ CRUD de fornecedores
router.post("/", fornecedorController.cadastrarFornecedor);
router.get("/", fornecedorController.listarFornecedores);
router.get("/:id", fornecedorController.obterFornecedor);
router.put("/:id", fornecedorController.atualizarFornecedor);
router.delete("/:id", fornecedorController.deletarFornecedor);

// ✅ Ranking mensal (melhores e piores)
router.get("/ranking/mes", fornecedorController.rankingFornecedores);

export default router;
