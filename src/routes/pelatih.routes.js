"use strict";

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const { authenticate, requireRole } = require("../middleware/auth.middleware");

const {
  postPelatih,
  getAllPelatih,
  getPelatihById,
  putPelatih,
  deletePelatih,
  patchVerifikasi,
} = require("../controllers/pelatihcontroller");

const {
  myProfile,
  updateProfile,
  myStats,
  myBookings,
  myJadwal,
} = require("../controllers/pelatihMyController");

// ── SEMUA ROUTE DENGAN PATH STATIS HARUS DI ATAS /:id ─────────────
// Jika tidak, Express akan menganggap "my-profile", "my-stats", dll
// sebagai nilai :id dan tidak akan masuk ke handler yang benar

router.get("/my-profile", authenticate, requireRole("pelatih"), myProfile);
router.put("/my-profile", authenticate, requireRole("pelatih"), updateProfile);
router.get("/my-stats", authenticate, requireRole("pelatih"), myStats);
router.get("/bookings", authenticate, requireRole("pelatih"), myBookings);
router.get("/my-jadwal", authenticate, requireRole("pelatih"), myJadwal);

// ⚠️  INI YANG PERLU DIPINDAH — my-foto harus di sini, bukan di bawah
router.post(
  "/my-foto",
  authenticate,
  requireRole("pelatih"),
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File foto wajib diupload" });
      }

      const fotoUrl = `/uploads/pelatih/${req.file.filename}`;
      const prisma = require("../config/database");

      const pelatih = await prisma.pelatih.findUnique({
        where: { user_id: req.user.userId },
      });

      if (!pelatih) {
        return res
          .status(404)
          .json({ error: "Profil pelatih tidak ditemukan" });
      }

      // Hapus foto lama kalau ada
      if (pelatih.foto) {
        const fs = require("fs");
        const oldPath = pelatih.foto.replace("/uploads", "uploads");
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const updated = await prisma.pelatih.update({
        where: { pelatih_id: pelatih.pelatih_id },
        data: { foto: fotoUrl },
      });

      return res.status(200).json({
        data: { foto: updated.foto },
        message: "Foto berhasil diupload",
      });
    } catch (err) {
      console.error("uploadFoto error:", err);
      return res.status(500).json({ error: "Gagal upload foto" });
    }
  },
);

// ── PUBLIC / ADMIN — route dengan :id di bawah semua route statis ──
router.get("/", getAllPelatih);
router.post("/", authenticate, postPelatih);
router.get("/:id", getPelatihById);
router.put("/:id", authenticate, putPelatih);
router.delete("/:id", authenticate, deletePelatih);
router.patch("/:id/verify", authenticate, patchVerifikasi);

module.exports = router;
