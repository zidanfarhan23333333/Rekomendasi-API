// rekomendasi.service.js

"use strict";

const prisma = require("../config/database.js");
const { KRITERIA } = require("../constants/ahpConstants.js");
const { hitungBobotAHP } = require("./ahp.service.js");

function mapPelatihKeNilai(p) {
  return [p.pengalaman, p.lisensi, p.prestasi, p.biaya];
}

async function dapatkanRekomendasi({ cabor_id, user_id }) {
  const pelatihList = await prisma.pelatih.findMany({
    where: { cabor_id, status_verifikasi: "terverifikasi" },
    select: {
      pelatih_id: true,
      nama: true,
      pengalaman: true,
      lisensi: true,
      prestasi: true,
      biaya: true,
    },
  });

  if (pelatihList.length === 0) {
    const err = new Error("Tidak ada pelatih terverifikasi di cabang ini");
    err.code = "NOT_FOUND";
    throw err;
  }

  const ahpResult = hitungBobotAHP();

  const hasil = pelatihList.map((p) => {
    const nilai = mapPelatihKeNilai(p);
    const skor =
      nilai[0] * ahpResult.bobotAHP[0] +
      nilai[1] * ahpResult.bobotAHP[1] +
      nilai[2] * ahpResult.bobotAHP[2] +
      nilai[3] * ahpResult.bobotAHP[3];

    return {
      pelatih_id: p.pelatih_id,
      nama_pelatih: p.nama,
      skor_akhir: parseFloat(skor.toFixed(4)),
    };
  });

  hasil.sort((a, b) => b.skor_akhir - a.skor_akhir);
  hasil.forEach((item, idx) => {
    item.peringkat = idx + 1;
  });

  await Promise.all(
    hasil.map((item) =>
      prisma.hasilRekomendasi.create({
        data: {
          user_id,
          pelatih_id: item.pelatih_id,
          skor_akhir: item.skor_akhir,
          peringkat: item.peringkat,
        },
      }),
    ),
  );

  const meta = {
    ahp: {
      kriteria: KRITERIA.map((k, i) => ({
        kode: k.kode,
        nama: k.nama,
        tipe: k.tipe,
        bobot: parseFloat(ahpResult.bobotAHP[i].toFixed(4)),
      })),
      CR: parseFloat(ahpResult.CR.toFixed(4)),
      konsistensi: ahpResult.konsistensi,
    },
  };

  return { meta, rekomendasi: hasil };
}

async function dapatkanRiwayat(user_id) {
  return prisma.hasilRekomendasi.findMany({
    where: { user_id },
    orderBy: { tanggal: "desc" },
    include: {
      pelatih: {
        select: { nama: true, cabor_id: true },
      },
    },
  });
}

async function getRankingGlobal() {
  const pelatihList = await prisma.pelatih.findMany({
    where: { status_verifikasi: "terverifikasi" },
    select: {
      pelatih_id: true,
      nama: true,
      pengalaman: true,
      lisensi: true,
      prestasi: true,
      biaya: true,
      cabang: { select: { nama_cabor: true } },
    },
  });

  if (pelatihList.length === 0) return [];

  const { bobotAHP } = hitungBobotAHP();

  const hasil = pelatihList
    .map((p) => ({
      pelatih_id: p.pelatih_id,
      nama: p.nama,
      cabor: p.cabang?.nama_cabor || "",
      skor: parseFloat(
        (
          p.pengalaman * bobotAHP[0] +
          p.lisensi * bobotAHP[1] +
          p.prestasi * bobotAHP[2] +
          p.biaya * bobotAHP[3]
        ).toFixed(4),
      ),
    }))
    .sort((a, b) => b.skor - a.skor)
    .map((item, idx) => ({ ...item, peringkat: idx + 1 }));

  return hasil;
}

// ✅ Hanya satu module.exports, lengkap dengan getRankingGlobal
module.exports = { dapatkanRekomendasi, dapatkanRiwayat, getRankingGlobal };
