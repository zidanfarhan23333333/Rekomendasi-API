"use strict";
const prisma = require("../config/database.js");
const ApiResponse = require("../utils/response.js");
const pelatihService = require("../services/pelatih.service.js");

class UserController {
  // ── GET /api/user/me ──────────────────────────────────────────────────────
  async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: req.user.userId },
        select: {
          user_id: true,
          nama: true,
          email: true,
          role: true,
          created_at: true,
        },
      });
      if (!user) return ApiResponse.notFound(res, "User not found");
      return ApiResponse.success(res, user, "Profile retrieved successfully");
    } catch (error) {
      console.error("getProfile error:", error);
      return ApiResponse.error(res, "Failed to retrieve profile");
    }
  }

  // ── GET /api/user/pelatih ─────────────────────────────────────────────────
  async listPelatih(req, res) {
    try {
      const filter = {};
      if (req.query.cabor_id) {
        const caborId = Number(req.query.cabor_id);
        if (!Number.isInteger(caborId) || caborId < 1)
          return ApiResponse.badRequest(
            res,
            "cabor_id must be a positive integer",
          );
        filter.cabor_id = caborId;
      }
      const semua = await pelatihService.dapatkanSemua(filter);
      const terverifikasi = semua.filter(
        (p) => p.status_verifikasi === "terverifikasi",
      );
      return ApiResponse.success(
        res,
        terverifikasi,
        "Pelatih retrieved successfully",
      );
    } catch (error) {
      console.error("listPelatih error:", error);
      return ApiResponse.error(res, "Failed to retrieve pelatih");
    }
  }

  // ── GET /api/user/pelatih/:id ─────────────────────────────────────────────
  async getPelatihById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1)
        return ApiResponse.badRequest(res, "Invalid pelatih id");
      const pelatih = await pelatihService.dapatkanById(id);
      if (pelatih.status_verifikasi !== "terverifikasi")
        return ApiResponse.notFound(res, "Pelatih not found");
      return ApiResponse.success(
        res,
        pelatih,
        "Pelatih retrieved successfully",
      );
    } catch (error) {
      if (error.code === "NOT_FOUND")
        return ApiResponse.notFound(res, error.message);
      console.error("getPelatihById error:", error);
      return ApiResponse.error(res, "Failed to retrieve pelatih");
    }
  }

  // ── GET /api/user/bookings ────────────────────────────────────────────────
  async getBookings(req, res) {
    try {
      const userId = req.user.userId;
      const { status, limit = 20 } = req.query;

      const where = { user_id: userId };
      if (status) where.status = status;

      const bookings = await prisma.pemesanan.findMany({
        where,
        orderBy: { tanggal: "desc" },
        take: Number(limit),
        include: {
          pelatih: {
            select: {
              pelatih_id: true,
              nama: true,
              cabang: { select: { nama_cabor: true } },
            },
          },
          cabang: { select: { nama_cabor: true } },
        },
      });

      return ApiResponse.success(
        res,
        { bookings },
        "Bookings retrieved successfully",
      );
    } catch (error) {
      console.error("getBookings error:", error);
      return ApiResponse.error(res, "Failed to retrieve bookings");
    }
  }

  // ── POST /api/user/booking ────────────────────────────────────────────────
  async createBooking(req, res) {
    try {
      const userId = req.user.userId;
      const { pelatih_id, cabor_id, tanggal, catatan } = req.body;

      if (!pelatih_id || !cabor_id || !tanggal) {
        return ApiResponse.badRequest(
          res,
          "pelatih_id, cabor_id, dan tanggal wajib diisi",
        );
      }

      // Pastikan pelatih ada dan terverifikasi
      const pelatih = await prisma.pelatih.findUnique({
        where: { pelatih_id: Number(pelatih_id) },
      });
      if (!pelatih || pelatih.status_verifikasi !== "terverifikasi") {
        return ApiResponse.notFound(
          res,
          "Pelatih tidak ditemukan atau belum terverifikasi",
        );
      }

      // Pastikan cabor ada
      const cabor = await prisma.cabangOlahraga.findUnique({
        where: { cabor_id: Number(cabor_id) },
      });
      if (!cabor) {
        return ApiResponse.notFound(res, "Cabang olahraga tidak ditemukan");
      }

      const booking = await prisma.pemesanan.create({
        data: {
          user_id: userId,
          pelatih_id: Number(pelatih_id),
          cabor_id: Number(cabor_id),
          status: "pending",
          tanggal: new Date(tanggal),
        },
        include: {
          pelatih: {
            select: { nama: true, cabang: { select: { nama_cabor: true } } },
          },
          cabang: { select: { nama_cabor: true } },
        },
      });

      return res
        .status(201)
        .json({ data: booking, message: "Booking berhasil dibuat" });
    } catch (error) {
      console.error("createBooking error:", error);
      return ApiResponse.error(res, "Failed to create booking");
    }
  }

  // ── GET /api/user/stats ───────────────────────────────────────────────────
  async getStats(req, res) {
    try {
      const userId = req.user.userId;

      const [totalBooking, bookingAktif, totalPengeluaran] = await Promise.all([
        prisma.pemesanan.count({ where: { user_id: userId } }),
        prisma.pemesanan.count({
          where: { user_id: userId, status: { in: ["pending", "konfirmasi"] } },
        }),
        // Tidak ada kolom harga di Pemesanan — kembalikan 0
        Promise.resolve(0),
      ]);

      // Hitung pelatih unik yang pernah dibooking (sebagai "favorit" proxy)
      const pelatihUnik = await prisma.pemesanan.groupBy({
        by: ["pelatih_id"],
        where: { user_id: userId, pelatih_id: { not: null } },
      });

      return ApiResponse.success(
        res,
        {
          totalBooking,
          bookingAktif,
          pelatihFavorit: pelatihUnik.length,
          totalPengeluaran,
        },
        "Stats retrieved successfully",
      );
    } catch (error) {
      console.error("getStats error:", error);
      return ApiResponse.error(res, "Failed to retrieve stats");
    }
  }
}

module.exports = new UserController();
