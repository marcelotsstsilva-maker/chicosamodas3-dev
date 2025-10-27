// routes/loginRoutes.js
import express from "express";
import { fazerLogin } from "../controllers/loginController.js";

const router = express.Router();

router.post("/", fazerLogin);

export default router;
