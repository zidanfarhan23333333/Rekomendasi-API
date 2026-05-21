"use strict";

const { PrismaClient } = require("@prisma/client");
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
      if (isNaN(pelatihId)) {
        return ApiResponse.badRequest(res, "ID pelatih tidak valid");
      }

      const existing = await prisma.pelatih.findUnique({
        where: { pelatih_id: pelatihId },
      });

      if (!existing) {
        return ApiResponse.notFound(res, "Pelatih tidak ditemukan");
      }

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
