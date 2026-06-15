"use strict";

const express = require("express");
const router = express.Router();

const {
  postRekomendasi,
  getRiwayat,
  getRankingGlobalHandler,
} = require("../controllers/rekomendasicontroller.js");

router.post("/", postRekomendasi);
router.get("/riwayat/:id", getRiwayat);
router.get("/ranking", getRankingGlobalHandler); // ← fixed path
module.exports = router;
