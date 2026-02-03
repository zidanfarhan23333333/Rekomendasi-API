"use strict";

function normalisasi(pelatihArr, tipeKriteria) {
  const jumlahKriteria = tipeKriteria.length;

  // cari min & max per kolom
  const mins = new Array(jumlahKriteria).fill(Infinity);
  const maxs = new Array(jumlahKriteria).fill(-Infinity);

  pelatihArr.forEach(({ nilai }) => {
    nilai.forEach((val, i) => {
      if (val < mins[i]) mins[i] = val;
      if (val > maxs[i]) maxs[i] = val;
    });
  });

  // normalisasi masing-masing pelatih
  return pelatihArr.map(({ pelatih_id, nilai }) => {
    const normalized = nilai.map((val, i) => {
      const range = maxs[i] - mins[i];
      if (range === 0) return 1;

      return tipeKriteria[i] === "cost"
        ? (maxs[i] - val) / range
        : (val - mins[i]) / range;
    });

    return { pelatih_id, normalized };
  });
}

function hitungSkorAkhir(dataSimulasi, bobotROC) {
  const hasil = dataSimulasi.map(({ pelatih_id, normalized }) => {
    const skor = normalized.reduce((sum, val, i) => sum + val * bobotROC[i], 0);
    return { pelatih_id, skor_akhir: parseFloat(skor.toFixed(4)) };
  });

  // sort descending skor → assign peringkat
  hasil.sort((a, b) => b.skor_akhir - a.skor_akhir);
  hasil.forEach((item, idx) => {
    item.peringkat = idx + 1;
  });

  return hasil;
}

module.exports = { normalisasi, hitungSkorAkhir };
