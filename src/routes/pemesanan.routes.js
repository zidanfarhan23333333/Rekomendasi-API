"use strict";

// src/routes/pemesanan.routes.js

const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const {
  getAll,
  getMyBookings,
  createBooking,
  updateStatus,
} = require("../controllers/pemesanancontroller");

// ─── User routes ──────────────────────────────────────────────────────────────
// GET /api/user/bookings — ambil booking milik user yang login
router.get("/user/bookings", authenticate, requireRole("user"), getMyBookings);

// POST /api/user/booking — buat booking baru
router.post("/user/booking", authenticate, requireRole("user"), createBooking);

// ─── Admin routes ─────────────────────────────────────────────────────────────
// GET /api/admin/pemesanan — semua pemesanan
router.get("/admin/pemesanan", authenticate, requireRole("admin"), getAll);

// PATCH /api/admin/pemesanan/:id/status — konfirmasi atau tolak
// Body: { "status": "konfirmasi" } atau { "status": "dibatalkan" }
router.patch(
  "/admin/pemesanan/:id/status",
  authenticate,
  requireRole("admin"),
  updateStatus,
);

module.exports = router;
