"use strict";

const prisma = require("../config/database.js");

const STATUS_VALID = ["pending", "terverifikasi", "ditolak"];

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function validasiPayload(payload) {
  const { nama, cabor_id, pengalaman, sertifikat, biaya, ketersediaan_waktu } =
    payload;

  if (!nama || typeof nama !== "string" || nama.trim() === "") {
    w;
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

  if (
    pengalaman === undefined ||
    !Number.isInteger(Number(pengalaman)) ||
    Number(pengalaman) < 0
  ) {
    throw createError(
      "VALIDATION",
      "pengalaman wajib dan harus angka bulat >= 0",
    );
  }

  if (
    sertifikat === undefined ||
    !Number.isInteger(Number(sertifikat)) ||
    Number(sertifikat) < 0
  ) {
    throw createError(
      "VALIDATION",
      "sertifikat wajib dan harus angka bulat >= 0",
    );
  }

  if (
    biaya === undefined ||
    !Number.isInteger(Number(biaya)) ||
    Number(biaya) < 1
  ) {
    throw createError(
      "VALIDATION",
      "biaya wajib dan harus angka bulat positif",
    );
  }

  if (
    ketersediaan_waktu === undefined ||
    typeof ketersediaan_waktu !== "boolean"
  ) {
    throw createError(
      "VALIDATION",
      "ketersediaan_waktu wajib dan harus boolean (true/false)",
    );
  }
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

async function tambahPelatih(payload) {
  validasiPayload(payload);
  await pastikanCabangAda(Number(payload.cabor_id));

  return prisma.pelatih.create({
    data: {
      nama: payload.nama.trim(),
      cabor_id: Number(payload.cabor_id),
      pengalaman: Number(payload.pengalaman),
      sertifikat: Number(payload.sertifikat),
      biaya: Number(payload.biaya),
      ketersediaan_waktu: payload.ketersediaan_waktu,
      status_verifikasi: "pending",
    },
    include: {
      cabang: { select: { nama_cabor: true } },
    },
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
    include: {
      cabang: { select: { nama_cabor: true } },
    },
  });
}

async function dapatkanById(pelatihId) {
  const pelatih = await prisma.pelatih.findUnique({
    where: { pelatih_id: pelatihId },
    include: {
      cabang: { select: { nama_cabor: true } },
    },
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
      sertifikat: Number(payload.sertifikat),
      biaya: Number(payload.biaya),
      ketersediaan_waktu: payload.ketersediaan_waktu,
    },
    include: {
      cabang: { select: { nama_cabor: true } },
    },
  });
}

async function hapusPelatih(pelatihId) {
  await dapatkanById(pelatihId);

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
    include: {
      cabang: { select: { nama_cabor: true } },
    },
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
