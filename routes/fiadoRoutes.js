import express from "express";
import fiadoController from "../controllers/fiadoController.js";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

router.use(autenticar);

router.post("/", fiadoController.cadastrarFiado);
router.get("/", fiadoController.listarFiados);
router.get("/:id", fiadoController.obterFiado);

// ✅ Coloque as rotas específicas antes das genéricas
router.put("/parcelas/:idparcela", fiadoController.atualizarParcela);
router.put("/:id/status", fiadoController.atualizarStatusFiado);
router.put("/:id", fiadoController.atualizarFiado);
router.delete("/:id", fiadoController.deletarFiado);

export default router;
