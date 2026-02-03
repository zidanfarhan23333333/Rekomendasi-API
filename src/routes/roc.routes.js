"use strict";

const express = require("express");
const router = express.Router();

const { getBobot, getRanking } = require("../controllers/roccontroller.js");

router.get("/bobot", getBobot);
router.get("/ranking", getRanking);

module.exports = router;
