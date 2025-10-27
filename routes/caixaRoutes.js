import express from "express";
import caixaController from "../controllers/caixaController.js";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

// 🔐 Todas exigem autenticação
router.use(autenticar);

// ✅ Registrar saída manual
router.post("/saida", caixaController.registrarSaida);

// ✅ Listar movimentações (com filtro ?inicio&fim)
router.get("/", caixaController.listarMovimentacoes);

// ✅ Obter saldo (com filtro opcional por período)
router.get("/saldo", caixaController.obterSaldo);

// ✅ Excluir uma movimentação do caixa
router.delete("/:idcaixa", caixaController.deletarMovimentacao);


export default router;

