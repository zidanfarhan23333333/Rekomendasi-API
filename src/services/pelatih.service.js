"use strict";

const prisma = require("../config/database.js");

const STATUS_VALID = ["pending", "terverifikasi", "ditolak"];

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function validasiSkala(nilai, nama) {
  if (
    nilai === undefined ||
    !Number.isInteger(Number(nilai)) ||
    Number(nilai) < 1 ||
    Number(nilai) > 5
  ) {
    throw createError("VALIDATION", `${nama} wajib dan harus angka bulat 1-5`);
  }
}

function validasiPayload(payload) {
  const { nama, cabor_id, pengalaman, lisensi, prestasi, biaya } = payload;

  if (!nama || typeof nama !== "string" || nama.trim() === "") {
    throw createError("VALIDATION", "nama wajib dan harus berisi teks");
  }

  if (
    cabor_id === undefined ||
    !Number.isInteger(Number(cabor_id)) ||
    Number(cabor_id) < 1
  ) {
    throw createError(
      "VALIDATION",
      "cabor_id wajib dan harus angka bulat positif",
    );
  }

  validasiSkala(pengalaman, "pengalaman");
  validasiSkala(lisensi, "lisensi");
  validasiSkala(prestasi, "prestasi");
  validasiSkala(biaya, "biaya");
}

async function pastikanCabangAda(cabor_id) {
  const cabang = await prisma.cabangOlahraga.findUnique({
    where: { cabor_id },
  });
  if (!cabang) {
    throw createError(
      "NOT_FOUND",
      `Cabang olahraga dengan id ${cabor_id} tidak ditemukan`,
    );
  }
  return cabang;
}

const includeRelasi = {
  cabang: { select: { nama_cabor: true } },
  jadwal: {
    where: { status: "available" },
    orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
  },
};

async function tambahPelatih(payload) {
  validasiPayload(payload);
  await pastikanCabangAda(Number(payload.cabor_id));

  return prisma.pelatih.create({
    data: {
      nama: payload.nama.trim(),
      cabor_id: Number(payload.cabor_id),
      pengalaman: Number(payload.pengalaman),
      lisensi: Number(payload.lisensi),
      prestasi: Number(payload.prestasi),
      biaya: Number(payload.biaya),
      status_verifikasi: "pending",
    },
    include: includeRelasi,
  });
}

async function dapatkanSemua(filter = {}) {
  const where = {};
  if (filter.cabor_id !== undefined) {
    where.cabor_id = Number(filter.cabor_id);
  }

  return prisma.pelatih.findMany({
    where,
    orderBy: { pelatih_id: "asc" },
    include: includeRelasi,
  });
}

async function dapatkanById(pelatihId) {
  const pelatih = await prisma.pelatih.findUnique({
    where: { pelatih_id: pelatihId },
    include: includeRelasi,
  });

  if (!pelatih) {
    throw createError(
      "NOT_FOUND",
      `Pelatih dengan id ${pelatihId} tidak ditemukan`,
    );
  }

  return pelatih;
}

async function perbaruiPelatih(pelatihId, payload) {
  await dapatkanById(pelatihId);
  validasiPayload(payload);
  await pastikanCabangAda(Number(payload.cabor_id));

  return prisma.pelatih.update({
    where: { pelatih_id: pelatihId },
    data: {
      nama: payload.nama.trim(),
      cabor_id: Number(payload.cabor_id),
      pengalaman: Number(payload.pengalaman),
      lisensi: Number(payload.lisensi),
      prestasi: Number(payload.prestasi),
      biaya: Number(payload.biaya),
    },
    include: includeRelasi,
  });
}

async function hapusPelatih(pelatihId) {
  const pelatih = await prisma.pelatih.findUnique({
    where: { pelatih_id: pelatihId },
    include: {
      nilai: true,
      pemesanan: true,
      hasilRekomendasi: true,
    },
  });

  if (!pelatih) {
    throw createError(
      "NOT_FOUND",
      `Pelatih dengan id ${pelatihId} tidak ditemukan`,
    );
  }

  if (pelatih.nilai && pelatih.nilai.length > 0) {
    throw createError(
      "IN_USE",
      `Pelatih tidak dapat dihapus karena masih memiliki ${pelatih.nilai.length} nilai kriteria`,
    );
  }

  if (pelatih.pemesanan && pelatih.pemesanan.length > 0) {
    throw createError(
      "IN_USE",
      `Pelatih tidak dapat dihapus karena masih memiliki ${pelatih.pemesanan.length} pemesanan`,
    );
  }

  if (pelatih.hasilRekomendasi && pelatih.hasilRekomendasi.length > 0) {
    throw createError(
      "IN_USE",
      `Pelatih tidak dapat dihapus karena masih ada dalam ${pelatih.hasilRekomendasi.length} hasil rekomendasi`,
    );
  }

  await prisma.pelatih.delete({
    where: { pelatih_id: pelatihId },
  });

  return { pelatih_id: pelatihId };
}

async function verifikasiPelatih(pelatihId, status) {
  if (!STATUS_VALID.includes(status)) {
    throw createError(
      "VALIDATION",
      `status harus salah satu dari: ${STATUS_VALID.join(", ")}`,
    );
  }

  await dapatkanById(pelatihId);

  return prisma.pelatih.update({
    where: { pelatih_id: pelatihId },
    data: { status_verifikasi: status },
    include: includeRelasi,
  });
}

module.exports = {
  tambahPelatih,
  dapatkanSemua,
  dapatkanById,
  perbaruiPelatih,
  hapusPelatih,
  verifikasiPelatih,
};
