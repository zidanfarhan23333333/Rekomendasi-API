"use strict";

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseUploadDir = path.join(__dirname, "../uploads");

const folders = {
  user: path.join(baseUploadDir, "user"),
  pelatih: path.join(baseUploadDir, "pelatih"),
};

Object.values(folders).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isUser = req.baseUrl.includes("/user");
    const dir = isUser ? folders.user : folders.pelatih;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const isUser = req.baseUrl.includes("/user");
    const prefix = isUser ? "user" : "pelatih";
    const nama = `${prefix}-${Date.now()}${ext}`;
    cb(null, nama);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP"),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
