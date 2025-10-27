import express from "express";
import clienteController from "../controllers/clienteController.js";
import autenticar from "../middlewares/autenticar.js"; // 👈 usa o mesmo middleware JWT

const router = express.Router();

// 🔐 Todas as rotas abaixo exigem autenticação
router.use(autenticar);

// ✅ CRUD de clientes
router.post("/", clienteController.cadastrarCliente);
router.get("/", clienteController.listarClientes);
router.get("/:id", clienteController.obterCliente);
router.put("/:id", clienteController.atualizarCliente);
router.delete("/:id", clienteController.deletarCliente);

export default router;


