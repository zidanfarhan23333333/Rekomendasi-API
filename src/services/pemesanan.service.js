"use strict";

// src/services/pemesanan.service.js
// Service pemesanan dengan notifikasi email otomatis

const prisma = require("../config/database.js");
const {
  kirimEmailKonfirmasi,
  kirimEmailDitolak,
} = require("./email.service.js");

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

// ─── Get semua pemesanan (admin) ─────────────────────────────────────────────
async function getAllPemesanan() {
  return prisma.pemesanan.findMany({
    orderBy: { tanggal: "desc" },
    include: {
      user: { select: { user_id: true, nama: true, email: true } },
      pelatih: { select: { pelatih_id: true, nama: true } },
      cabang: { select: { cabor_id: true, nama_cabor: true } },
    },
  });
}

// ─── Get pemesanan by user ────────────────────────────────────────────────────
async function getPemesananByUser(userId) {
  return prisma.pemesanan.findMany({
    where: { user_id: userId },
    orderBy: { tanggal: "desc" },
    include: {
      pelatih: { select: { pelatih_id: true, nama: true } },
      cabang: { select: { cabor_id: true, nama_cabor: true } },
    },
  });
}

// ─── Create pemesanan ─────────────────────────────────────────────────────────
async function createPemesanan(userId, payload) {
  const { pelatih_id, cabor_id, tanggal, catatan } = payload;

  if (!pelatih_id || !cabor_id || !tanggal) {
    throw createError(
      "VALIDATION",
      "pelatih_id, cabor_id, dan tanggal wajib diisi",
    );
  }

  // Cek pelatih ada dan terverifikasi
  const pelatih = await prisma.pelatih.findUnique({
    where: { pelatih_id: Number(pelatih_id) },
  });
  if (!pelatih) throw createError("NOT_FOUND", "Pelatih tidak ditemukan");
  if (pelatih.status_verifikasi !== "terverifikasi") {
    throw createError("FORBIDDEN", "Pelatih belum terverifikasi");
  }

  return prisma.pemesanan.create({
    data: {
      user_id: userId,
      pelatih_id: Number(pelatih_id),
      cabor_id: Number(cabor_id),
      tanggal: new Date(tanggal),
      status: "pending",
      ...(catatan && { catatan }),
    },
    include: {
      pelatih: { select: { nama: true } },
      cabang: { select: { nama_cabor: true } },
    },
  });
}

// ─── Update status pemesanan (admin) ──────────────────────────────────────────
async function updateStatusPemesanan(pemesananId, status) {
  const STATUS_VALID = ["pending", "konfirmasi", "dibatalkan"];
  if (!STATUS_VALID.includes(status)) {
    throw createError(
      "VALIDATION",
      `Status harus salah satu dari: ${STATUS_VALID.join(", ")}`,
    );
  }

  // Ambil pemesanan dengan relasi user, pelatih, cabor
  const pemesanan = await prisma.pemesanan.findUnique({
    where: { pemesanan_id: pemesananId },
    include: {
      user: { select: { nama: true, email: true } },
      pelatih: { select: { nama: true } },
      cabang: { select: { nama_cabor: true } },
    },
  });

  if (!pemesanan) {
    throw createError("NOT_FOUND", "Pemesanan tidak ditemukan");
  }

  // Update status di database
  const updated = await prisma.pemesanan.update({
    where: { pemesanan_id: pemesananId },
    data: { status },
    include: {
      user: { select: { nama: true, email: true } },
      pelatih: { select: { nama: true } },
      cabang: { select: { nama_cabor: true } },
    },
  });

  // ─── Kirim email notifikasi sesuai status ─────────────────────────────────
  const emailPayload = {
    emailUser: pemesanan.user.email,
    namaUser: pemesanan.user.nama,
    namaPelatih: pemesanan.pelatih?.nama || "-",
    cabor: pemesanan.cabang?.nama_cabor || "-",
    tanggal: pemesanan.tanggal,
    pemesanan_id: pemesananId,
  };

  if (status === "konfirmasi") {
    // Kirim email konfirmasi (fire and forget — tidak block response)
    kirimEmailKonfirmasi(emailPayload).catch((err) =>
      console.error(
        "[pemesananService] Gagal kirim email konfirmasi:",
        err.message,
      ),
    );
  } else if (status === "dibatalkan") {
    // Kirim email penolakan
    kirimEmailDitolak(emailPayload).catch((err) =>
      console.error(
        "[pemesananService] Gagal kirim email penolakan:",
        err.message,
      ),
    );
  }

  return updated;
}

// ─── Stats pemesanan (admin dashboard) ───────────────────────────────────────
async function getStatsPemesanan() {
  const [total, dikonfirmasi, menunggu, selesai] = await Promise.all([
    prisma.pemesanan.count(),
    prisma.pemesanan.count({ where: { status: "konfirmasi" } }),
    prisma.pemesanan.count({ where: { status: "pending" } }),
    prisma.pemesanan.count({ where: { status: "selesai" } }),
  ]);

  return { total, dikonfirmasi, menunggu, selesai };
}

module.exports = {
  getAllPemesanan,
  getPemesananByUser,
  createPemesanan,
  updateStatusPemesanan,
  getStatsPemesanan,
};
