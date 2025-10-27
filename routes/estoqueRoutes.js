const express = require("express");
const router = express.Router();
const { listarEstoque } = require("../controllers/estoqueController");

router.get("/", listarEstoque);

module.exports = router;
