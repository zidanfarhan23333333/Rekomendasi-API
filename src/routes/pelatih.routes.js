"use strict";

const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");

const {
  postPelatih,
  getAllPelatih,
  getPelatihById,
  putPelatih,
  deletePelatih,
  patchVerifikasi,
} = require("../controllers/pelatihcontroller");

const {
  myProfile,
  updateProfile,
  myStats,
  myBookings,
  myJadwal,
} = require("../controllers/pelatihMyController");

// ── PELATIH PRIVATE — harus di atas /:id ──────────────────────────
router.get("/my-profile", authenticate, requireRole("pelatih"), myProfile);
router.put("/my-profile", authenticate, requireRole("pelatih"), updateProfile);
router.get("/my-stats", authenticate, requireRole("pelatih"), myStats);
router.get("/bookings", authenticate, requireRole("pelatih"), myBookings);
router.get("/my-jadwal", authenticate, requireRole("pelatih"), myJadwal);

// ── PUBLIC / ADMIN ─────────────────────────────────────────────────
router.get("/", getAllPelatih);
router.post("/", authenticate, postPelatih);
router.get("/:id", getPelatihById);
router.put("/:id", authenticate, putPelatih);
router.delete("/:id", authenticate, deletePelatih);
router.patch("/:id/verify", authenticate, patchVerifikasi);

module.exports = router;
