// HTTP request handlers for authentication
const authService = require("../services/auth.service");
const ApiResponse = require("../utils/response");

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { email, password, role } = req.body;

      // Validation
      if (!email || !password) {
        return ApiResponse.badRequest(res, "Email and password are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ApiResponse.badRequest(res, "Invalid email format");
      }

      // Password strength validation (minimum 6 characters)
      if (password.length < 6) {
        return ApiResponse.badRequest(
          res,
          "Password must be at least 6 characters",
        );
      }

      // Role validation (only ADMIN, PELATIH, USER allowed)
      const validRoles = ["ADMIN", "PELATIH", "USER"];
      if (role && !validRoles.includes(role)) {
        return ApiResponse.badRequest(
          res,
          "Invalid role. Must be ADMIN, PELATIH, or USER",
        );
      }

      // Create user
      const user = await authService.register({ email, password, role });

      return ApiResponse.created(res, user, "User registered successfully");
    } catch (error) {
      if (error.message === "Email already registered") {
        return ApiResponse.badRequest(res, error.message);
      }
      console.error("Register error:", error);
      return ApiResponse.error(res, "Failed to register user");
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return ApiResponse.badRequest(res, "Email and password are required");
      }

      // Authenticate user
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

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req, res) {
    try {
      // req.user is set by auth middleware
      const user = await authService.getUserById(req.user.userId);

      return ApiResponse.success(res, user, "Profile retrieved successfully");
    } catch (error) {
      console.error("Get profile error:", error);
      return ApiResponse.error(res, "Failed to retrieve profile");
    }
  }
}

module.exports = new AuthController();
