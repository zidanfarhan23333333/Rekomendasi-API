"use strict";

const { KRITERIA } = require("../constants/ahpConstants.js");
const { hitungBobotAHP } = require("../services/ahp.service.js");
const {
  tentukanRanking,
  hitungBobotROC,
} = require("../services/roc.service.js");

const getBobot = (req, res) => {
  const { bobotAHP } = hitungBobotAHP();
  const rankings = tentukanRanking(bobotAHP);
  const bobotROC = hitungBobotROC(KRITERIA.length, rankings);

  const kriteria = KRITERIA.map((k, i) => ({
    kode: k.kode,
    nama: k.nama,
    tipe: k.tipe,
    ranking: rankings[i],
    bobotROC: parseFloat(bobotROC[i].toFixed(4)),
  }));

  const jumlahBobot = parseFloat(
    bobotROC.reduce((a, b) => a + b, 0).toFixed(4),
  );

  res.json({ kriteria, jumlahBobot });
};

const getRanking = (req, res) => {
  const { bobotAHP } = hitungBobotAHP();
  const rankings = tentukanRanking(bobotAHP);

  // Gabungkan & sort ascending berdasarkan ranking
  const ranking = KRITERIA.map((k, i) => ({
    urutan: rankings[i],
    kode: k.kode,
    nama: k.nama,
    bobot_ahp: parseFloat(bobotAHP[i].toFixed(4)),
  })).sort((a, b) => a.urutan - b.urutan);

  res.json({ ranking });
};

module.exports = { getBobot, getRanking };
