"use strict";

const authService = require("../services/auth.service");
const ApiResponse = require("../utils/response");

class AuthController {
  async register(req, res) {
    try {
      // ✅ Ambil SEMUA field yang dikirim frontend, termasuk data pelatih
      const {
        nama,
        email,
        password,
        role,
        // field pelatih
        cabor_id,
        cabor,
        pengalaman,
        lisensi,
        prestasi,
        biaya,
        deskripsi,
        spesialis,
        domisili,
        pengalaman_melatih,
        harga_min,
        harga_max,
      } = req.body;

      if (!nama || !email || !password) {
        return ApiResponse.badRequest(
          res,
          "Nama, email, and password are required",
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ApiResponse.badRequest(res, "Invalid email format");
      }

      if (password.length < 6) {
        return ApiResponse.badRequest(
          res,
          "Password must be at least 6 characters",
        );
      }

      const validRoles = ["admin", "pelatih", "user"];
      if (role && !validRoles.includes(role)) {
        return ApiResponse.badRequest(
          res,
          "Invalid role. Must be admin, pelatih, or user",
        );
      }

      // ✅ Teruskan semua field ke service
      const user = await authService.register({
        nama,
        email,
        password,
        role,
        cabor_id,
        cabor,
        pengalaman,
        lisensi,
        prestasi,
        biaya,
        deskripsi,
        spesialis,
        domisili,
        pengalaman_melatih,
        harga_min,
        harga_max,
      });

      return ApiResponse.created(res, user, "User registered successfully");
    } catch (error) {
      if (error.message === "Email already registered") {
        return ApiResponse.badRequest(res, error.message);
      }
      console.error("Register error:", error);
      return ApiResponse.error(res, "Failed to register user");
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.badRequest(res, "Email and password are required");
      }

      const result = await authService.login({ email, password });
      return ApiResponse.success(res, result, "Login successful");
    } catch (error) {
      if (error.message === "Invalid email or password") {
        return ApiResponse.unauthorized(res, error.message);
      }
      console.error("Login error:", error);
      return ApiResponse.error(res, "Failed to login");
    }
  }

  async getProfile(req, res) {
    try {
      const user = await authService.getUserById(req.user.userId);
      return ApiResponse.success(res, user, "Profile retrieved successfully");
    } catch (error) {
      console.error("Get profile error:", error);
      return ApiResponse.error(res, "Failed to retrieve profile");
    }
  }
}

module.exports = new AuthController();
