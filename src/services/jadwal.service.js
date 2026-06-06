"use strict";

const prisma = require("../config/database.js");

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

async function getPelatihByUserId(userId) {
  const pelatih = await prisma.pelatih.findUnique({
    where: { user_id: userId },
  });
  if (!pelatih)
    throw createError("NOT_FOUND", "Profil pelatih tidak ditemukan");
  return pelatih;
}

async function getJadwal(userId) {
  const pelatih = await getPelatihByUserId(userId);
  return prisma.jadwal.findMany({
    where: { pelatih_id: pelatih.pelatih_id },
    orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
  });
}

async function tambahJadwal(userId, payload) {
  const { hari, jam_mulai, jam_selesai, lokasi } = payload;

  const hariValid = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];
  if (!hari || !hariValid.includes(hari))
    throw createError("VALIDATION", "Hari tidak valid");
  if (!jam_mulai) throw createError("VALIDATION", "Jam mulai wajib diisi");
  if (!jam_selesai) throw createError("VALIDATION", "Jam selesai wajib diisi");
  if (!lokasi || !lokasi.trim())
    throw createError("VALIDATION", "Lokasi wajib diisi");

  const pelatih = await getPelatihByUserId(userId);

  return prisma.jadwal.create({
    data: {
      pelatih_id: pelatih.pelatih_id,
      hari,
      jam_mulai,
      jam_selesai,
      lokasi: lokasi.trim(),
      status: "available",
    },
  });
}

async function hapusJadwal(userId, jadwalId) {
  const pelatih = await getPelatihByUserId(userId);
  const jadwal = await prisma.jadwal.findUnique({
    where: { jadwal_id: jadwalId },
  });

  if (!jadwal) throw createError("NOT_FOUND", "Jadwal tidak ditemukan");
  if (jadwal.pelatih_id !== pelatih.pelatih_id)
    throw createError("FORBIDDEN", "Bukan jadwal Anda");

  return prisma.jadwal.delete({ where: { jadwal_id: jadwalId } });
}

module.exports = { getJadwal, tambahJadwal, hapusJadwal };
