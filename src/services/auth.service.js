// Business logic for authentication
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const jwtConfig = require("../config/jwt");

class AuthService {
  /**
   * Register new user with role-based creation
   * @param {Object} userData - { email, password, role }
   * @returns {Object} Created user without password
   */
  async register(userData) {
    const { email, password, role } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "USER", // Default to USER if not specified
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // If role is PELATIH, create linked Pelatih record
    if (user.role === "PELATIH") {
      await prisma.pelatih.create({
        data: {
          userId: user.id,
          // Additional Pelatih fields can be added here
        },
      });
    }

    return user;
  }

  /**
   * Login user and generate JWT token
   * @param {Object} credentials - { email, password }
   * @returns {Object} { user, token }
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token with user payload
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
      },
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Verify JWT token
   * @param {string} token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Get user by ID (for token refresh/verification)
   * @param {number} userId
   * @returns {Object} User without password
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

module.exports = new AuthService();
