"use strict";

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const { authenticate } = require("../middleware/auth.middleware");

const {
  getProfile,
  updateProfile,
  updatePassword,
} = require("../controllers/userProfileController.js");

router.get("/my-profile", authenticate, getProfile);
router.put("/my-profile", authenticate, updateProfile);
router.put("/my-password", authenticate, updatePassword);

// ✅ Upload foto profil user — pola sama persis dengan upload foto pelatih
router.post(
  "/my-foto",
  authenticate,
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File foto wajib diupload" });
      }

      const fotoUrl = `/uploads/user/${req.file.filename}`;
      const prisma = require("../config/database");

      const user = await prisma.user.findUnique({
        where: { user_id: req.user.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      // Hapus foto lama kalau ada
      if (user.foto) {
        const fs = require("fs");
        const oldPath = user.foto.replace("/uploads", "uploads");
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const updated = await prisma.user.update({
        where: { user_id: user.user_id },
        data: { foto: fotoUrl },
      });

      return res.status(200).json({
        data: { foto: updated.foto },
        message: "Foto berhasil diupload",
      });
    } catch (err) {
      console.error("uploadFotoUser error:", err);
      return res.status(500).json({ error: "Gagal upload foto" });
    }
  },
);

module.exports = router;
