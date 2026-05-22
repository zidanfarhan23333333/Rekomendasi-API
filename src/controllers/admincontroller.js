"use strict";

const prisma = require("../config/database");
const ApiResponse = require("../utils/response");

class AdminController {
  async getAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          user_id: true,
          nama: true,
          email: true,
          role: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      });
      return ApiResponse.success(res, users, "Users retrieved successfully");
    } catch (error) {
      console.error("getAllUsers error:", error);
      return ApiResponse.error(res, "Failed to retrieve users");
    }
  }

  async getStats(req, res) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalUser,
        totalPelatih,
        pelatihAktif,
        totalBooking,
        bookingBulanIni,
        pendingVerifikasi,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.pelatih.count(),
        prisma.pelatih.count({ where: { status_verifikasi: "terverifikasi" } }),
        prisma.pemesanan.count(),
        // Pakai "tanggal" sesuai schema Pemesanan (bukan created_at)
        prisma.pemesanan.count({ where: { tanggal: { gte: startOfMonth } } }),
        prisma.pelatih.count({ where: { status_verifikasi: "pending" } }),
      ]);

      return ApiResponse.success(
        res,
        {
          totalUser,
          totalPelatih,
          pelatihAktif,
          totalBooking,
          bookingBulanIni,
          pendingVerifikasi,
          totalRevenue: 0, // Pemesanan tidak punya kolom harga
          satisfactionRate: 0, // Belum ada tabel ulasan
        },
        "Stats retrieved successfully",
      );
    } catch (error) {
      console.error("getStats error:", error);
      return ApiResponse.error(res, "Failed to retrieve stats");
    }
  }

  async getAllBookings(req, res) {
    try {
      const { search = "", page = 1, limit = 8 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = search
        ? {
            OR: [
              { user: { nama: { contains: search, mode: "insensitive" } } },
              { pelatih: { nama: { contains: search, mode: "insensitive" } } },
              { status: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [total, bookings] = await Promise.all([
        prisma.pemesanan.count({ where }),
        prisma.pemesanan.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { tanggal: "desc" },
          include: {
            user: { select: { nama: true, email: true } },
            pelatih: { select: { nama: true } },
            cabang: { select: { nama_cabor: true } },
          },
        }),
      ]);

      const normalized = bookings.map((b) => ({
        booking_id: b.pemesanan_id,
        status: b.status,
        tanggal: b.tanggal,
        userName: b.user?.nama || "-",
        pelatihNama: b.pelatih?.nama || "-",
        cabor: b.cabang?.nama_cabor || "-",
      }));

      return ApiResponse.success(
        res,
        {
          bookings: normalized,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Bookings retrieved successfully",
      );
    } catch (error) {
      console.error("getAllBookings error:", error);
      return ApiResponse.error(res, "Failed to retrieve bookings");
    }
  }

  async getAllCabor(req, res) {
    try {
      const cabors = await prisma.cabangOlahraga.findMany({
        include: {
          _count: { select: { pelatih: true } },
        },
        orderBy: { nama_cabor: "asc" },
      });

      const normalized = cabors.map((c) => ({
        id: c.cabor_id,
        cabor_id: c.cabor_id,
        name: c.nama_cabor,
        nama_cabor: c.nama_cabor,
        count: c._count.pelatih,
      }));

      return ApiResponse.success(
        res,
        normalized,
        "Cabor retrieved successfully",
      );
    } catch (error) {
      console.error("getAllCabor error:", error);
      return ApiResponse.error(res, "Failed to retrieve cabor");
    }
  }

  async getRanking(req, res) {
    try {
      const pelatih = await prisma.pelatih.findMany({
        where: { status_verifikasi: "terverifikasi" },
        include: {
          cabang: { select: { nama_cabor: true } },
        },
      });

      const bobot = {
        pengalaman: 0.35,
        lisensi: 0.25,
        prestasi: 0.25,
        biaya: 0.15,
      };

      const maxVal = (arr, key) =>
        Math.max(...arr.map((p) => p[key] || 0)) || 1;

      const maxPengalaman = maxVal(pelatih, "pengalaman");
      const maxLisensi = maxVal(pelatih, "lisensi");
      const maxPrestasi = maxVal(pelatih, "prestasi");
      const maxBiaya = maxVal(pelatih, "biaya");

      const ranked = pelatih
        .map((p) => {
          const skorAHP =
            bobot.pengalaman * ((p.pengalaman || 0) / maxPengalaman) +
            bobot.lisensi * ((p.lisensi || 0) / maxLisensi) +
            bobot.prestasi * ((p.prestasi || 0) / maxPrestasi) +
            bobot.biaya * (1 - (p.biaya || 0) / maxBiaya);

          return {
            pelatih_id: p.pelatih_id,
            nama: p.nama,
            cabor: p.cabang?.nama_cabor || "-",
            pengalaman: p.pengalaman || 0,
            lisensi: p.lisensi || 0,
            prestasi: p.prestasi || 0,
            biaya: p.biaya || 0,
            skorAHP: parseFloat(skorAHP.toFixed(4)),
            status_verifikasi: p.status_verifikasi,
          };
        })
        .sort((a, b) => b.skorAHP - a.skorAHP);

      return ApiResponse.success(
        res,
        {
          pelatih: ranked,
          bobot,
        },
        "Ranking retrieved successfully",
      );
    } catch (error) {
      console.error("getRanking error:", error);
      return ApiResponse.error(res, "Failed to retrieve ranking");
    }
  }

  async verifyPelatih(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatus = ["terverifikasi", "ditolak"];
      if (!status || !validStatus.includes(status)) {
        return ApiResponse.badRequest(
          res,
          "Status harus 'terverifikasi' atau 'ditolak'",
        );
      }

      const pelatihId = parseInt(id);
      if (isNaN(pelatihId))
        return ApiResponse.badRequest(res, "ID pelatih tidak valid");

      const existing = await prisma.pelatih.findUnique({
        where: { pelatih_id: pelatihId },
      });
      if (!existing)
        return ApiResponse.notFound(res, "Pelatih tidak ditemukan");

      const updated = await prisma.pelatih.update({
        where: { pelatih_id: pelatihId },
        data: { status_verifikasi: status },
        select: {
          pelatih_id: true,
          nama: true,
          status_verifikasi: true,
          cabang: { select: { nama_cabor: true } },
        },
      });

      return ApiResponse.success(
        res,
        updated,
        `Pelatih berhasil ${status === "terverifikasi" ? "diverifikasi" : "ditolak"}`,
      );
    } catch (error) {
      console.error("verifyPelatih error:", error);
      return ApiResponse.error(res, "Failed to update verification status");
    }
  }
}

module.exports = new AdminController();
