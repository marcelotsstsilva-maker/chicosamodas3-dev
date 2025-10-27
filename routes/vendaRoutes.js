import express from "express";
import vendaController from "../controllers/vendaController.js";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

// 🔐 Todas as rotas exigem autenticação
router.use(autenticar);

// ✅ CRUD de vendas
router.post("/", vendaController.cadastrarVenda);
router.get("/", vendaController.listarVendas);
router.get("/:id", vendaController.obterVenda);
router.delete("/:id", vendaController.deletarVenda);

// ✅ Listar vendas por ano (para tela "Minhas Vendas")
router.get("/ano/:ano", vendaController.listarVendasPorAno);

export default router;
