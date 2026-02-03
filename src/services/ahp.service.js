"use strict";

const { RANDOM_INDEX } = require("../constants/ahpConstants.js");
const { CR_THRESHOLD } = require("../constants/ahpConstants.js");
const { PAIRWISE_MATRIX } = require("../constants/ahpConstants.js");

function hitungBobotAHP(matrix = PAIRWISE_MATRIX) {
  const n = matrix.length;

  const geoMean = matrix.map((baris) => {
    const produk = baris.reduce((acc, val) => acc * val, 1);
    return Math.pow(produk, 1 / n);
  });

  const jumlah = geoMean.reduce((a, b) => a + b, 0);
  const bobotAHP = geoMean.map((val) => val / jumlah);

  //   a) Ax = matrix × bobot
  const Ax = matrix.map((baris) =>
    baris.reduce((sum, val, j) => sum + val * bobotAHP[j], 0),
  );

  //   b) λ_max = mean( Ax[i] / bobot[i] )
  const lambdaMax = Ax.reduce((sum, val, i) => sum + val / bobotAHP[i], 0) / n;

  //   c) CI  =  (λ_max − n) / (n − 1)
  const CI = (lambdaMax - n) / (n - 1);

  //   d) CR  =  CI / RI
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
