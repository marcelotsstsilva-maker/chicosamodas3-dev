import express from "express";
import taxaCartaoController from "../controllers/taxaCartaoController.js";
import autenticar from "../middlewares/autenticar.js";

const router = express.Router();

// 🔐 Todas as rotas exigem autenticação
router.use(autenticar);

// ✅ CRUD de taxas de cartão
router.post("/", taxaCartaoController.cadastrarTaxa);
router.get("/", taxaCartaoController.listarTaxas);
router.get("/:id", taxaCartaoController.obterTaxa);
router.put("/:id", taxaCartaoController.atualizarTaxa);
router.delete("/:id", taxaCartaoController.deletarTaxa);

// 🧩 (Opcional) Filtro por tipo/canal — útil para o app
router.get("/filtrar/:tipo/:canal", async (req, res) => {
  const { tipo, canal } = req.params;

  try {
    const [rows] = await taxaCartaoController.filtrarPorTipoCanal(tipo, canal);
    res.status(200).json({ sucesso: true, taxas: rows });
  } catch (err) {
    console.error("❌ Erro ao filtrar taxas:", err);
    res.status(500).json({ sucesso: false, message: "Erro ao filtrar taxas." });
  }
});

export default router;
