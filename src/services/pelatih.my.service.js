"use strict";

const prisma = require("../config/database.js");
const { hitungBobotAHP } = require("../services/ahp.service"); // ✅ sama dengan adminController

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

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
  const {
    nama,
    cabor_id,
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
  } = payload;

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
  if (deskripsi !== undefined) data.deskripsi = deskripsi || null;
  if (spesialis !== undefined) data.spesialis = spesialis || null;
  if (domisili !== undefined) data.domisili = domisili || null;
  if (pengalaman_melatih !== undefined)
    data.pengalaman_melatih = pengalaman_melatih || null;
  if (harga_min !== undefined)
    data.harga_min = harga_min ? Number(harga_min) : null;
  if (harga_max !== undefined)
    data.harga_max = harga_max ? Number(harga_max) : null;

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

  // ✅ Pakai bobot dari hitungBobotAHP() — konsisten dengan adminController & chart
  const { bobotAHP } = hitungBobotAHP();
  const bobot = {
    pengalaman: bobotAHP[0],
    lisensi: bobotAHP[1],
    prestasi: bobotAHP[2],
    biaya: bobotAHP[3],
  };

  const maxVal = (key) => Math.max(...semuaPelatih.map((p) => p[key]), 1);
  const max = {
    pengalaman: maxVal("pengalaman"),
    lisensi: maxVal("lisensi"),
    prestasi: maxVal("prestasi"),
    biaya: maxVal("biaya"),
  };

  // ✅ Biaya diinvert: lebih murah = lebih baik (sama dengan adminController)
  const hitungSkor = (p) =>
    bobot.pengalaman * (p.pengalaman / max.pengalaman) +
    bobot.lisensi * (p.lisensi / max.lisensi) +
    bobot.prestasi * (p.prestasi / max.prestasi) +
    bobot.biaya * (1 - p.biaya / max.biaya);

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
    // Komponen skor untuk progress bar (sudah terbobot)
    skorKomponen: {
      pengalaman: parseFloat(
        (bobot.pengalaman * (pelatih.pengalaman / max.pengalaman)).toFixed(4),
      ),
      lisensi: parseFloat(
        (bobot.lisensi * (pelatih.lisensi / max.lisensi)).toFixed(4),
      ),
      prestasi: parseFloat(
        (bobot.prestasi * (pelatih.prestasi / max.prestasi)).toFixed(4),
      ),
      biaya: parseFloat(
        (bobot.biaya * (1 - pelatih.biaya / max.biaya)).toFixed(4),
      ),
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
