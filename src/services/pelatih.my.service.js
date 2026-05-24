"use strict";

const prisma = require("../config/database.js");

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

const BOBOT = { pengalaman: 0.35, lisensi: 0.25, prestasi: 0.25, biaya: 0.15 };

async function getPelatihByUserId(userId) {
  const pelatih = await prisma.pelatih.findUnique({
    where: { user_id: userId },
    include: { cabang: { select: { nama_cabor: true } } },
  });

  if (!pelatih) {
    throw createError(
      "NOT_FOUND",
      "Profil pelatih tidak ditemukan untuk akun ini",
    );
  }

  return pelatih;
}

async function getMyProfile(userId) {
  return getPelatihByUserId(userId);
}

async function updateMyProfile(userId, payload) {
  const pelatih = await getPelatihByUserId(userId);
  const { nama, cabor_id, pengalaman, lisensi, prestasi, biaya } = payload;

  if (nama !== undefined && (typeof nama !== "string" || nama.trim() === "")) {
    throw createError("VALIDATION", "nama tidak boleh kosong");
  }

  const data = {};
  if (nama !== undefined) data.nama = nama.trim();
  if (cabor_id !== undefined) data.cabor_id = Number(cabor_id);
  if (pengalaman !== undefined) data.pengalaman = Number(pengalaman);
  if (lisensi !== undefined) data.lisensi = Number(lisensi);
  if (prestasi !== undefined) data.prestasi = Number(prestasi);
  if (biaya !== undefined) data.biaya = Number(biaya);

  return prisma.pelatih.update({
    where: { pelatih_id: pelatih.pelatih_id },
    data,
    include: { cabang: { select: { nama_cabor: true } } },
  });
}

async function getMyStats(userId) {
  const pelatih = await getPelatihByUserId(userId);
  const pid = pelatih.pelatih_id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalBooking, bookingBulanIni, semuaPelatih, siswaUnik] =
    await Promise.all([
      prisma.pemesanan.count({ where: { pelatih_id: pid } }),
      prisma.pemesanan.count({
        where: { pelatih_id: pid, tanggal: { gte: startOfMonth } },
      }),
      prisma.pelatih.findMany({
        where: { status_verifikasi: "terverifikasi" },
        select: {
          pelatih_id: true,
          pengalaman: true,
          lisensi: true,
          prestasi: true,
          biaya: true,
        },
      }),
      prisma.pemesanan.groupBy({
        by: ["user_id"],
        where: { pelatih_id: pid },
      }),
    ]);

  const max = {
    pengalaman: Math.max(...semuaPelatih.map((p) => p.pengalaman), 1),
    lisensi: Math.max(...semuaPelatih.map((p) => p.lisensi), 1),
    prestasi: Math.max(...semuaPelatih.map((p) => p.prestasi), 1),
    biaya: Math.max(...semuaPelatih.map((p) => p.biaya), 1),
  };

  const hitungSkor = (p) =>
    BOBOT.pengalaman * (p.pengalaman / max.pengalaman) +
    BOBOT.lisensi * (p.lisensi / max.lisensi) +
    BOBOT.prestasi * (p.prestasi / max.prestasi) +
    BOBOT.biaya * (p.biaya / max.biaya);

  const skorSemua = semuaPelatih
    .map((p) => ({ pelatih_id: p.pelatih_id, skor: hitungSkor(p) }))
    .sort((a, b) => b.skor - a.skor);

  const skorSaya = hitungSkor(pelatih);
  const rankingIdx = skorSemua.findIndex((p) => p.pelatih_id === pid);
  const ranking = rankingIdx >= 0 ? rankingIdx + 1 : "-";

  return {
    totalBooking,
    bookingBulanIni,
    pendapatan: 0,
    rating: 0,
    totalSiswa: siswaUnik.length,
    ranking,
    skorAHP: parseFloat(skorSaya.toFixed(4)),
    statusVerifikasi: pelatih.status_verifikasi,
    skorKomponen: {
      pengalaman: parseFloat((pelatih.pengalaman / max.pengalaman).toFixed(4)),
      lisensi: parseFloat((pelatih.lisensi / max.lisensi).toFixed(4)),
      prestasi: parseFloat((pelatih.prestasi / max.prestasi).toFixed(4)),
      biaya: parseFloat((pelatih.biaya / max.biaya).toFixed(4)),
    },
    pengalaman: pelatih.pengalaman,
    lisensi: pelatih.lisensi,
    prestasi: pelatih.prestasi,
    biaya: pelatih.biaya,
  };
}

async function getMyBookings(userId, filter = {}) {
  const pelatih = await getPelatihByUserId(userId);

  const where = { pelatih_id: pelatih.pelatih_id };
  if (filter.status) where.status = filter.status;

  const bookings = await prisma.pemesanan.findMany({
    where,
    orderBy: { tanggal: "desc" },
    take: filter.limit ? Number(filter.limit) : 20,
    include: {
      user: { select: { nama: true, email: true } },
      cabang: { select: { nama_cabor: true } },
    },
  });

  return bookings.map((b) => ({
    id: b.pemesanan_id,
    user: { nama: b.user.nama, email: b.user.email },
    cabor: b.cabang.nama_cabor,
    status: b.status,
    tanggal: b.tanggal.toISOString().split("T")[0],
    jam: b.tanggal.toTimeString().slice(0, 5),
    durasi: 1,
  }));
}

async function getMyJadwal(userId) {
  const pelatih = await getPelatihByUserId(userId);

  const bookings = await prisma.pemesanan.findMany({
    where: {
      pelatih_id: pelatih.pelatih_id,
      status: { in: ["pending", "konfirmasi"] },
      tanggal: { gte: new Date() },
    },
    orderBy: { tanggal: "asc" },
    take: 10,
    include: {
      user: { select: { nama: true } },
      cabang: { select: { nama_cabor: true } },
    },
  });

  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return bookings.map((b) => ({
    id: b.pemesanan_id,
    hari: HARI[b.tanggal.getDay()],
    jam: b.tanggal.toTimeString().slice(0, 5),
    lokasi: b.cabang.nama_cabor,
    status: b.status === "konfirmasi" ? "booked" : "available",
    atlet: b.user.nama,
  }));
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyStats,
  getMyBookings,
  getMyJadwal,
};
