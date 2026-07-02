"use strict";

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isUser = req.baseUrl.includes("/user");
    const folder = isUser ? "sportcoach/user" : "sportcoach/pelatih";
    const prefix = isUser ? "user" : "pelatih";
    return {
      folder,
      public_id: `${prefix}-${Date.now()}`,
      resource_type: "image",
    };
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

const upload = multer({ storage, fileFilter });

module.exports = { upload, cloudinary };
