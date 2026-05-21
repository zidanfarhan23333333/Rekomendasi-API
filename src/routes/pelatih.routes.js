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

const {
  myProfile,
  updateProfile,
  myStats,
  myBookings,
  myJadwal,
} = require("../controllers/pelatih.my.controller.js");

const { authenticate } = require("../middleware/auth.middleware.js");

router.get("/my-profile", authenticate, myProfile);
router.put("/my-profile", authenticate, updateProfile);
router.get("/my-stats", authenticate, myStats);
router.get("/bookings", authenticate, myBookings);
router.get("/my-jadwal", authenticate, myJadwal);

router.post("/", postPelatih);
router.get("/", getAllPelatih);
router.get("/:id", getPelatihById);
router.put("/:id", putPelatih);
router.delete("/:id", deletePelatih);
router.patch("/:id/verifikasi", patchVerifikasi);

module.exports = router;
