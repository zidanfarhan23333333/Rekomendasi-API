"use strict";

const {
  dapatkanRekomendasi,
  dapatkanRiwayat,
} = require("../services/rekomendasi.service.js");

const postRekomendasi = async (req, res) => {
  const { cabor_id, user_id } = req.body;

  if (!cabor_id || !user_id) {
    return res.status(400).json({
      error: "cabor_id dan user_id diperlukan",
    });
  }

  if (
    !Number.isInteger(Number(cabor_id)) ||
    !Number.isInteger(Number(user_id))
  ) {
    return res.status(400).json({
      error: "cabor_id dan user_id harus angka bulat",
    });
  }

  try {
    const result = await dapatkanRekomendasi({
      cabor_id: Number(cabor_id),
      user_id: Number(user_id),
    });

    return res.status(200).json(result);
  } catch (err) {
    if (err.code === "NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    console.error("[rekomendasiController] postRekomendasi:", err);
    return res.status(500).json({ error: "Gagal menghitung rekomendasi" });
  }
};

const getRiwayat = async (req, res) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "id harus angka" });
  }

  try {
    const riwayat = await dapatkanRiwayat(userId);
    return res.status(200).json({ riwayat });
  } catch (err) {
    console.error("[rekomendasiController] getRiwayat:", err);
    return res.status(500).json({ error: "Gagal mengambil riwayat" });
  }
};

module.exports = { postRekomendasi, getRiwayat };
