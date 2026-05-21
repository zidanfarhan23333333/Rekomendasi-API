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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid email or password");

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role }, // ✅ user_id
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
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
      where: { user_id: userId }, // ✅ user_id
      select: {
        user_id: true,
        nama: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true, // ✅ snake_case
      },
    });

    if (!user) throw new Error("User not found");
    return user;
  }
}

module.exports = new AuthService();
