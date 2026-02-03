"use strict";

const KRITERIA = Object.freeze([
  { kode: "C1", nama: "Pengalaman", tipe: "benefit" },
  { kode: "C2", nama: "Prestasi/Sertifikat", tipe: "benefit" },
  { kode: "C3", nama: "Biaya", tipe: "cost" },
  { kode: "C4", nama: "Ketersediaan Waktu", tipe: "benefit" },
]);

// Matriks
const PAIRWISE_MATRIX = Object.freeze([
  [1, 3, 5, 7],
  [1 / 3, 1, 4, 3],
  [1 / 5, 1 / 4, 1, 1 / 2],
  [1 / 4, 1 / 3, 2, 1],
]);

const RANDOM_INDEX = Object.freeze({
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
});

// Threshold =
const CR_THRESHOLD = 0.1;

module.exports = {
  KRITERIA,
  PAIRWISE_MATRIX,
  RANDOM_INDEX,
  CR_THRESHOLD,
};
