// routes/usuarioRoutes.js
import express from "express";
import autenticar from "../middlewares/autenticar.js";
import { listarUsuarios } from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/protegido", autenticar, (req, res) => {
  res.json({ sucesso: true, message: "Acesso permitido!", usuario: req.usuario });
});

router.get("/", autenticar, listarUsuarios);

export default router;
