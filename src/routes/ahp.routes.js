"use strict";

const express = require("express");
const router = express.Router();

const { getBobot, getKonsistensi } = require("../controllers/ahpcontroller.js");

router.get("/bobot", getBobot);
router.get("/konsistensi", getKonsistensi);

module.exports = router;
