"use strict";

const express = require("express");
const router = express.Router();
const {
  getNotifikasi,
  getUnread,
} = require("../controllers/notifikasicontroller.js");
const { authenticate } = require("../middleware/auth.middleware.js"); // sesuaikan nama middleware Anda

router.get("/", authenticate, getNotifikasi);
router.get("/unread-count", authenticate, getUnread);

module.exports = router;
