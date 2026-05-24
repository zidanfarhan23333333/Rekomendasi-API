"use strict";

const express = require("express");
const router = express.Router();
const prisma = require("../config/database");
const ApiResponse = require("../utils/response");

// GET /api/public/cabor
router.get("/cabor", async (req, res) => {
  try {
    const cabors = await prisma.cabangOlahraga.findMany({
      select: { cabor_id: true, nama_cabor: true },
      orderBy: { nama_cabor: "asc" },
    });
    return ApiResponse.success(res, cabors, "Cabor retrieved successfully");
  } catch (error) {
    console.error("public cabor error:", error);
    return ApiResponse.error(res, "Failed to retrieve cabor");
  }
});

// GET /api/public/ranking
router.get("/ranking", async (req, res) => {
  try {
    const pelatih = await prisma.pelatih.findMany({
      where: { status_verifikasi: "terverifikasi" },
      include: { cabang: { select: { nama_cabor: true } } },
    });

    const bobot = {
      pengalaman: 0.35,
      lisensi: 0.25,
      prestasi: 0.25,
      biaya: 0.15,
    };

    const ranked = pelatih
      .map((p) => ({
        pelatih_id: p.pelatih_id,
        nama: p.nama,
        cabor: p.cabang?.nama_cabor || "-",
        pengalaman: p.pengalaman,
        lisensi: p.lisensi,
        prestasi: p.prestasi,
        biaya: p.biaya,
        skorAHP: parseFloat(
          (
            bobot.pengalaman * (p.pengalaman / 5) +
            bobot.lisensi * (p.lisensi / 5) +
            bobot.prestasi * (p.prestasi / 5) +
            bobot.biaya * (p.biaya / 5)
          ).toFixed(4),
        ),
      }))
      .sort((a, b) => b.skorAHP - a.skorAHP);

    return ApiResponse.success(
      res,
      { pelatih: ranked, bobot },
      "Ranking retrieved",
    );
  } catch (error) {
    console.error("public ranking error:", error);
    return ApiResponse.error(res, "Failed to retrieve ranking");
  }
});

// GET /api/public/bookings/:pelatihId — booking milik pelatih tertentu
router.get("/bookings/:pelatihId", async (req, res) => {
  try {
    const pelatihId = parseInt(req.params.pelatihId);
    if (isNaN(pelatihId)) return ApiResponse.error(res, "ID tidak valid");

    const bookings = await prisma.pemesanan.findMany({
      where: { pelatih_id: pelatihId },
      orderBy: { tanggal: "desc" },
      include: {
        user: { select: { nama: true } },
        cabang: { select: { nama_cabor: true } },
      },
    });

    const normalized = bookings.map((b) => ({
      booking_id: b.pemesanan_id,
      status: b.status,
      tanggal: b.tanggal,
      userName: b.user?.nama || "-",
      cabor: b.cabang?.nama_cabor || "-",
    }));

    return ApiResponse.success(res, normalized, "Bookings retrieved");
  } catch (error) {
    console.error("public bookings error:", error);
    return ApiResponse.error(res, "Failed to retrieve bookings");
  }
});

module.exports = router;
