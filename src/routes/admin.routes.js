"use strict";

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");

// ⚠️ Tambahkan middleware auth kamu di sini setelah tahu path-nya
// Contoh: const { verifyToken } = require("../middleware/authMiddleware");
// router.use(verifyToken);

router.get("/stats", adminController.getStats.bind(adminController));
router.get("/users", adminController.getAllUsers.bind(adminController));
router.get("/bookings", adminController.getAllBookings.bind(adminController));
router.get("/cabor", adminController.getAllCabor.bind(adminController));
router.get("/ranking", adminController.getRanking.bind(adminController));
router.patch(
  "/pelatih/:id/verify",
  adminController.verifyPelatih.bind(adminController),
);

module.exports = router;
