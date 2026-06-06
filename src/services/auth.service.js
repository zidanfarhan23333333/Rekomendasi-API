"use strict";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database.js");
const jwtConfig = require("../config/jwt.js");

class AuthService {
  async register(userData) {
    const {
      nama,
      email,
      password,
      role,
      pengalaman,
      lisensi,
      prestasi,
      biaya,
      cabor,
      deskripsi,
      spesialis,
      domisili,
      pengalaman_melatih,
      harga_min,
      harga_max,
    } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { nama, email, password: hashedPassword, role: role || "user" },
      select: {
        user_id: true,
        nama: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (role === "pelatih") {
      const cabangOlahraga = cabor
        ? await prisma.cabangOlahraga.findFirst({
            where: { nama_cabor: { contains: cabor, mode: "insensitive" } },
          })
        : null;

      const cabang =
        cabangOlahraga || (await prisma.cabangOlahraga.findFirst());

      if (!cabang) {
        await prisma.user.delete({ where: { user_id: user.user_id } });
        throw new Error("Belum ada cabang olahraga. Hubungi admin.");
      }

      await prisma.pelatih.create({
        data: {
          nama,
          cabor_id: cabang.cabor_id,
          user_id: user.user_id,
          pengalaman: Number(pengalaman) || 1,
          lisensi: Number(lisensi) || 1,
          prestasi: Number(prestasi) || 1,
          biaya: Number(biaya) || 1,
          status_verifikasi: "pending",
          deskripsi: deskripsi || null,
          spesialis: spesialis || null,
          domisili: domisili || null,
          pengalaman_melatih: pengalaman_melatih || null,
          harga_min: harga_min ? Number(harga_min) : null,
          harga_max: harga_max ? Number(harga_max) : null,
        },
      });
    }

    return user;
  }

  async login(credentials) {
    const { email, password } = credentials;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid email or password");

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new Error("Invalid email or password");

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn },
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error("AUTH SERVICE LOGIN ERROR:", error.message);
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
