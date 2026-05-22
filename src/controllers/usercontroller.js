"use strict";
const prisma = require("../config/database.js");
const ApiResponse = require("../utils/response.js");
const pelatihService = require("../services/pelatih.service.js");

class UserController {
  /**
   * GET /user/me
   * Return the logged-in user's profile
   */
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

      if (!user) {
        return ApiResponse.notFound(res, "User not found");
      }

      return ApiResponse.success(res, user, "Profile retrieved successfully");
    } catch (error) {
      console.error("getProfile error:", error);
      return ApiResponse.error(res, "Failed to retrieve profile");
    }
  }

  /**
   * GET /user/pelatih
   * List verified trainers, optionally filtered by cabor_id
   */
  async listPelatih(req, res) {
    try {
      const filter = {};
      if (req.query.cabor_id) {
        const caborId = Number(req.query.cabor_id);
        if (!Number.isInteger(caborId) || caborId < 1) {
          return ApiResponse.badRequest(
            res,
            "cabor_id must be a positive integer",
          );
        }
        filter.cabor_id = caborId;
      }

      const semua = await pelatihService.dapatkanSemua(filter);

      // Users only see verified trainers
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

  /**
   * GET /user/pelatih/:id
   * Get a single verified trainer's detail
   */
  async getPelatihById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return ApiResponse.badRequest(res, "Invalid pelatih id");
      }

      const pelatih = await pelatihService.dapatkanById(id);

      if (pelatih.status_verifikasi !== "terverifikasi") {
        return ApiResponse.notFound(res, "Pelatih not found");
      }

      return ApiResponse.success(
        res,
        pelatih,
        "Pelatih retrieved successfully",
      );
    } catch (error) {
      if (error.code === "NOT_FOUND") {
        return ApiResponse.notFound(res, error.message);
      }
      console.error("getPelatihById error:", error);
      return ApiResponse.error(res, "Failed to retrieve pelatih");
    }
  }
}

module.exports = new UserController();
