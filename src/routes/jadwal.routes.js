"use strict";

const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const {
  getMyJadwal,
  postJadwal,
  deleteJadwal,
  getJadwalByPelatihId,
} = require("../controllers/jadwalcontroller");

// ← Publik, tidak perlu login — HARUS di atas router.use(authenticate)
router.get("/publik/:pelatih_id", getJadwalByPelatihId);

// ← Private, hanya pelatih
router.use(authenticate, requireRole("pelatih"));
router.get("/", getMyJadwal);
router.post("/", postJadwal);
router.delete("/:id", deleteJadwal);

module.exports = router;
