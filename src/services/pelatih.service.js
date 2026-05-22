"use strict";

const prisma = require("../config/database.js");

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

async function tambahPelatih(body) {
  const { nama, cabor_id, pengalaman, lisensi, prestasi, biaya, user_id } =
    body;

  if (!nama || !cabor_id || pengalaman == null || lisensi == null || prestasi == null || biaya == null) {
    throw createError(
      "VALIDATION",
      "nama, cabor_id, pengalaman, lisensi, prestasi, biaya wajib diisi",
    );
  }

  return prisma.pelatih.create({
    data: {
      nama: String(nama).trim(),
      cabor_id: Number(cabor_id),
      pengalaman: Number(pengalaman),
      lisensi: Number(lisensi),
      prestasi: Number(prestasi),
      biaya: Number(biaya),
      status_verifikasi: "pending",
      ...(user_id ? { user_id: Number(user_id) } : {}),
    },
    include: { cabang: { select: { nama_cabor: true } } },
  });
}

async function dapatkanSemua(filter = {}) {
  const where = {};

  if (filter.cabor_id) {
    const id = Number(filter.cabor_id);
    if (!Number.isInteger(id) || id < 1)
      throw createError("VALIDATION", "cabor_id harus angka positif");
    where.cabor_id = id;
  }

  if (filter.status_verifikasi) {
    where.status_verifikasi = filter.status_verifikasi;
  }

  return prisma.pelatih.findMany({
    where,
    orderBy: { created_at: "desc" },
    include: { cabang: { select: { nama_cabor: true } } },
  });
}

async function dapatkanById(id) {
  if (!Number.isInteger(id) || id < 1)
    throw createError("VALIDATION", "id harus angka positif");

  const pelatih = await prisma.pelatih.findUnique({
    where: { pelatih_id: id },
    include: { cabang: { select: { nama_cabor: true } } },
  });

  if (!pelatih) throw createError("NOT_FOUND", "Pelatih tidak ditemukan");

  return pelatih;
}

async function perbaruiPelatih(id, body) {
  if (!Number.isInteger(id) || id < 1)
    throw createError("VALIDATION", "id harus angka positif");

  const existing = await prisma.pelatih.findUnique({
    where: { pelatih_id: id },
  });
  if (!existing) throw createError("NOT_FOUND", "Pelatih tidak ditemukan");

  const data = {};
  if (body.nama !== undefined) data.nama = String(body.nama).trim();
  if (body.cabor_id !== undefined) data.cabor_id = Number(body.cabor_id);
  if (body.pengalaman !== undefined) data.pengalaman = Number(body.pengalaman);
  if (body.lisensi !== undefined) data.lisensi = Number(body.lisensi);
  if (body.prestasi !== undefined) data.prestasi = Number(body.prestasi);
  if (body.biaya !== undefined) data.biaya = Number(body.biaya);
  if (body.status_verifikasi !== undefined)
    data.status_verifikasi = body.status_verifikasi;

  return prisma.pelatih.update({
    where: { pelatih_id: id },
    data,
    include: { cabang: { select: { nama_cabor: true } } },
  });
}

async function hapusPelatih(id) {
  if (!Number.isInteger(id) || id < 1)
    throw createError("VALIDATION", "id harus angka positif");

  const existing = await prisma.pelatih.findUnique({
    where: { pelatih_id: id },
  });
  if (!existing) throw createError("NOT_FOUND", "Pelatih tidak ditemukan");

  return prisma.pelatih.delete({ where: { pelatih_id: id } });
}

async function verifikasiPelatih(id, status) {
  if (!Number.isInteger(id) || id < 1)
    throw createError("VALIDATION", "id harus angka positif");

  const validStatus = ["terverifikasi", "ditolak", "pending"];
  if (!status || !validStatus.includes(status))
    throw createError(
      "VALIDATION",
      "status harus 'terverifikasi', 'ditolak', atau 'pending'",
    );

  const existing = await prisma.pelatih.findUnique({
    where: { pelatih_id: id },
  });
  if (!existing) throw createError("NOT_FOUND", "Pelatih tidak ditemukan");

  return prisma.pelatih.update({
    where: { pelatih_id: id },
    data: { status_verifikasi: status },
    include: { cabang: { select: { nama_cabor: true } } },
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
