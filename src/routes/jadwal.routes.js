"use strict";

const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const {
  getMyJadwal,
  postJadwal,
  deleteJadwal,
} = require("../controllers/jadwalcontroller");

router.use(authenticate, requireRole("pelatih"));

router.get("/", getMyJadwal);
router.post("/", postJadwal);
router.delete("/:id", deleteJadwal);

module.exports = router;
