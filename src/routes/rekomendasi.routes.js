"use strict";

const express = require("express");
const router = express.Router();

const {
  postRekomendasi,
  getRiwayat,
} = require("../controllers/rekomendasicontroller.js");

router.post("/", postRekomendasi);
router.get("/riwayat/:id", getRiwayat);

module.exports = router;
