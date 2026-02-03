"use strict";

const prisma = require("../config/database.js");
const { KRITERIA } = require("../constants/ahpConstants.js");
const { hitungBobotAHP } = require("./ahp.service.js");
const { normalisasi, hitungSkorAkhir } = require("./normalisasi.service.js");
const { tentukanRanking, hitungBobotROC } = require("./roc.service.js");

function mapPelatihKeNilai(pelatih) {
  return [
    pelatih.pengalaman,
    pelatih.sertifikat,
    pelatih.biaya,
    pelatih.ketersediaan_waktu ? 1 : 0,
  ];
}

async function dapatkanRekomendasi({ cabor_id, user_id }) {
  const pelatihList = await prisma.pelatih.findMany({
    where: {
      cabor_id,
      status_verifikasi: "terverifikasi",
    },
    select: {
      pelatih_id: true,
      nama: true,
      pengalaman: true,
      sertifikat: true,
      biaya: true,
      ketersediaan_waktu: true,
    },
  });

  if (pelatihList.length === 0) {
    const err = new Error("Tidak ada pelatih terverifikasi di cabang ini");
    err.code = "NOT_FOUND";
    throw err;
  }

  const pelatihArr = pelatihList.map((p) => ({
    pelatih_id: p.pelatih_id,
    nilai: mapPelatihKeNilai(p),
  }));

  const ahpResult = hitungBobotAHP();
  const rankings = tentukanRanking(ahpResult.bobotAHP);

  const n = KRITERIA.length;
  const bobotROC = hitungBobotROC(n, rankings);

  const tipeKriteria = KRITERIA.map((k) => k.tipe);
  const dataNormalisasi = normalisasi(pelatihArr, tipeKriteria);
  const hasil = hitungSkorAkhir(dataNormalisasi, bobotROC);

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

  const namaMap = new Map(pelatihList.map((p) => [p.pelatih_id, p.nama]));

  const rekomendasi = hasil.map((item) => ({
    peringkat: item.peringkat,
    pelatih_id: item.pelatih_id,
    nama_pelatih: namaMap.get(item.pelatih_id),
    skor_akhir: item.skor_akhir,
  }));

  const meta = {
    ahp: {
      bobotAHP: ahpResult.bobotAHP.map((v) => parseFloat(v.toFixed(4))),
      CR: parseFloat(ahpResult.CR.toFixed(4)),
      konsistensi: ahpResult.konsistensi,
    },
    roc: {
      rankings,
      bobotROC: bobotROC.map((v) => parseFloat(v.toFixed(4))),
    },
  };

  return { meta, rekomendasi };
}

async function dapatkanRiwayat(userId) {
  return prisma.hasilRekomendasi.findMany({
    where: { user_id: userId },
    orderBy: { tanggal: "desc" },
    include: {
      pelatih: {
        select: { nama: true, cabor_id: true },
      },
    },
  });
}

module.exports = { dapatkanRekomendasi, dapatkanRiwayat };
