"use strict";

const express = require("express");
const router = express.Router();

const {
  postPelatih,
  getAllPelatih,
  getPelatihById,
  putPelatih,
  deletePelatih,
  patchVerifikasi,
} = require("../controllers/pelatihcontroller.js");

router.post("/", postPelatih);
router.get("/", getAllPelatih);
router.get("/:id", getPelatihById);
router.put("/:id", putPelatih);
router.delete("/:id", deletePelatih);
router.patch("/:id/verifikasi", patchVerifikasi);

module.exports = router;
