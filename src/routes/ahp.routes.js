"use strict";

const express = require("express");
const router = express.Router();

const {
  getBobot,
  getKonsistensi,
  getPeringkat,
} = require("../controllers/ahpcontroller.js");

router.get("/bobot", getBobot);
router.get("/konsistensi", getKonsistensi);
router.get("/peringkat", getPeringkat);

module.exports = router;
