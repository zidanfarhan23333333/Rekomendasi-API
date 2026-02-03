"use strict";

const { KRITERIA } = require("../constants/ahpConstants.js");
const { hitungBobotAHP } = require("../services/ahp.service.js");

const getBobot = (req, res) => {
  const { bobotAHP } = hitungBobotAHP();

  const kriteria = KRITERIA.map((k, i) => ({
    kode: k.kode,
    nama: k.nama,
    tipe: k.tipe,
    bobot: parseFloat(bobotAHP[i].toFixed(4)),
  }));

  const jumlahBobot = parseFloat(
    bobotAHP.reduce((a, b) => a + b, 0).toFixed(4),
  );

  res.json({ kriteria, jumlahBobot });
};

const getKonsistensi = (req, res) => {
  const { lambdaMax, CI, CR, konsistensi } = hitungBobotAHP();

  res.json({
    lambdaMax: parseFloat(lambdaMax.toFixed(4)),
    CI: parseFloat(CI.toFixed(4)),
    CR: parseFloat(CR.toFixed(4)),
    konsistensi,
  });
};

module.exports = { getBobot, getKonsistensi };
