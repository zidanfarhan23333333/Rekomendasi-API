"use strict";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database.js");
const jwtConfig = require("../config/jwt.js");

class AuthService {
  async register(userData) {
    const { nama, email, password, role } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: role || "user",
      },
      select: {
        user_id: true,
        nama: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
  }

  async login(credentials) {
    const { email, password } = credentials;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      console.log("USER FOUND:", user ? user.email : "null");

      if (!user) throw new Error("Invalid email or password");

      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("PASSWORD VALID:", isPasswordValid);

      if (!isPasswordValid) throw new Error("Invalid email or password");

      console.log("JWT SECRET:", jwtConfig.secret ? "ada" : "KOSONG");
      console.log("JWT EXPIRES:", jwtConfig.expiresIn);

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn },
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error("AUTH SERVICE LOGIN ERROR:", error.message);
      console.error("AUTH SERVICE LOGIN STACK:", error.stack);
      throw error;
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch {
      throw new Error("Invalid or expired token");
    }
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        nama: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) throw new Error("User not found");
    return user;
  }
}

module.exports = new AuthService();
