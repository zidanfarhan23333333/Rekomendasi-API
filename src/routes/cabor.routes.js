"use strict";

const express = require("express");
const router = express.Router();
const caborController = require("../controllers/caborcontroller");

// GET /api/cabor - Ambil semua cabang olahraga
router.get("/", caborController.getAllCabor);

// GET /api/cabor/:id - Ambil detail cabang olahraga berdasarkan ID
router.get("/:id", caborController.getCaborById);

// POST /api/cabor - Tambah cabang olahraga baru
router.post("/", caborController.createCabor);

// PUT /api/cabor/:id - Update cabang olahraga
router.put("/:id", caborController.updateCabor);

// DELETE /api/cabor/:id - Hapus cabang olahraga
router.delete("/:id", caborController.deleteCabor);

module.exports = router;
