import express from "express";
import {
  getResumoMensal,
  relatorioClientes,
  relatorioProdutos,
  relatorioEstoque,
  relatorioFornecedores,
  relatorioPorAno, // ✅ novo controller
  relatorioFluxoCaixa, // 👈 novo import
} from "../controllers/relatorioController.js";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

router.use(autenticar);

// ✅ Rotas existentes
router.get("/resumo-mensal", getResumoMensal);
router.get("/clientes", relatorioClientes);
router.get("/produtos", relatorioProdutos);
router.get("/estoque", relatorioEstoque);
router.get("/fornecedores", relatorioFornecedores);

// ✅ Nova rota — Relatório por Ano
router.get("/ano", relatorioPorAno);

// ✅ Nova rota — Fluxo de Caixa Anual
router.get("/fluxo-caixa", relatorioFluxoCaixa);

export default router;
