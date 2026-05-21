"use strict";

const {
  RANDOM_INDEX,
  CR_THRESHOLD,
  PAIRWISE_MATRIX,
} = require("../constants/ahpConstants.js");

function hitungBobotAHP(matrix = PAIRWISE_MATRIX) {
  const n = matrix.length;

  // 1. Jumlah tiap kolom
  const jumlahKolom = Array(n).fill(0);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) jumlahKolom[j] += matrix[i][j];

  // 2. Normalisasi: bagi tiap elemen dengan jumlah kolomnya
  const normalized = matrix.map((row) =>
    row.map((val, j) => val / jumlahKolom[j]),
  );

  // 3. Bobot = rata-rata baris dari matriks ternormalisasi
  const bobotAHP = normalized.map((row) => row.reduce((a, b) => a + b, 0) / n);

  // 4. Hitung λ_max: (A × W) / W lalu rata-rata
  const Ax = matrix.map((row) =>
    row.reduce((sum, val, j) => sum + val * bobotAHP[j], 0),
  );
  const lambdaMax = Ax.reduce((sum, val, i) => sum + val / bobotAHP[i], 0) / n;

  // 5. CI dan CR
  const CI = (lambdaMax - n) / (n - 1);
  const RI = RANDOM_INDEX[n] ?? 0.9;
  const CR = CI / RI;

  return {
    bobotAHP,
    lambdaMax,
    CI,
    CR,
    konsistensi: CR <= CR_THRESHOLD ? "konsisten" : "tidak konsisten",
  };
}

module.exports = { hitungBobotAHP };
