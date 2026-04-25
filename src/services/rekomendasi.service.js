"use strict";

const prisma = require("../config/database.js");
const { KRITERIA } = require("../constants/ahpConstants.js");
const { hitungBobotAHP } = require("./ahp.service.js");
const { normalisasi, hitungSkorAkhir } = require("./normalisasi.service.js");

function mapPelatihKeNilai(pelatih) {
  return [
    pelatih.pengalaman,
    pelatih.lisensi,
    pelatih.prestasi,
    pelatih.biaya,
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

  const pelatihArr = pelatihList.map((p) => ({
    pelatih_id: p.pelatih_id,
    nilai: mapPelatihKeNilai(p),
  }));

  const ahpResult = hitungBobotAHP();
  const tipeKriteria = KRITERIA.map((k) => k.tipe);
  const dataNormalisasi = normalisasi(pelatihArr, tipeKriteria);
  const hasil = hitungSkorAkhir(dataNormalisasi, ahpResult.bobotAHP);

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
