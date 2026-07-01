"use strict";

const prisma = require("../config/database.js");
const bcrypt = require("bcryptjs");

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

async function getMyProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      nama: true,
      email: true,
      role: true,
      foto: true, // tambahkan kolom ini di schema jika ingin avatar custom
      created_at: true,
    },
  });
  if (!user) throw createError("NOT_FOUND", "User tidak ditemukan");
  return user;
}

async function updateMyProfile(userId, payload) {
  const { nama, email } = payload;
  const data = {};

  if (nama !== undefined) {
    if (!nama.trim())
      throw createError("VALIDATION", "Nama tidak boleh kosong");
    data.nama = nama.trim();
  }

  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      throw createError("VALIDATION", "Format email tidak valid");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.user_id !== userId) {
      throw createError("VALIDATION", "Email sudah digunakan akun lain");
    }
    data.email = email;
  }

  return prisma.user.update({
    where: { user_id: userId },
    data,
    select: { user_id: true, nama: true, email: true, role: true },
  });
}

async function changePassword(userId, oldPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw createError("VALIDATION", "Password baru minimal 6 karakter");
  }

  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) throw createError("NOT_FOUND", "User tidak ditemukan");

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) throw createError("VALIDATION", "Password lama salah");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { user_id: userId },
    data: { password: hashed },
  });

  return { message: "Password berhasil diubah" };
}

module.exports = { getMyProfile, updateMyProfile, changePassword };
