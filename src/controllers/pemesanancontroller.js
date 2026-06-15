"use strict";

// src/controllers/pemesanan.controller.js

const {
  getAllPemesanan,
  getPemesananByUser,
  createPemesanan,
  updateStatusPemesanan,
  getStatsPemesanan,
} = require("../services/pemesanan.service.js");

const CODE_TO_STATUS = {
  VALIDATION: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
};

function handleError(res, err, label) {
  const status = CODE_TO_STATUS[err.code] || 500;
  if (status === 500) console.error(`[pemesananController] ${label}:`, err);
  return res.status(status).json({ error: err.message });
}

// ─── GET /api/admin/pemesanan — semua pemesanan (admin) ──────────────────────
const getAll = async (req, res) => {
  try {
    const data = await getAllPemesanan();
    const stats = await getStatsPemesanan();
    return res.status(200).json({ stats, data });
  } catch (err) {
    return handleError(res, err, "getAll");
  }
};

// ─── GET /api/user/bookings — pemesanan user sendiri ────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await getPemesananByUser(userId);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "getMyBookings");
  }
};

// ─── POST /api/user/booking — buat pemesanan baru ───────────────────────────
const createBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await createPemesanan(userId, req.body);
    return res.status(201).json({
      message: "Pemesanan berhasil dibuat, menunggu konfirmasi admin",
      data,
    });
  } catch (err) {
    return handleError(res, err, "createBooking");
  }
};

// ─── PATCH /api/admin/pemesanan/:id/status — update status (admin) ──────────
const updateStatus = async (req, res) => {
  try {
    const pemesananId = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(pemesananId)) {
      return res.status(400).json({ error: "ID pemesanan harus berupa angka" });
    }
    if (!status) {
      return res.status(400).json({ error: "Status wajib diisi" });
    }

    const data = await updateStatusPemesanan(pemesananId, status);

    // Pesan berbeda sesuai status
    const pesan = {
      konfirmasi:
        "Pemesanan dikonfirmasi dan email notifikasi telah dikirim ke user",
      dibatalkan:
        "Pemesanan ditolak dan email notifikasi telah dikirim ke user",
      pending: "Status pemesanan dikembalikan ke pending",
    };

    return res.status(200).json({
      message: pesan[status] || "Status pemesanan berhasil diupdate",
      data,
    });
  } catch (err) {
    return handleError(res, err, "updateStatus");
  }
};

module.exports = { getAll, getMyBookings, createBooking, updateStatus };
