"use strict";

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const errorHandler = require("./middleware/error.handler.js");
const ahpRoutes = require("./routes/ahp.routes.js");
const rekomendasiRoutes = require("./routes/rekomendasi.routes.js");
const pelatihRoutes = require("./routes/pelatih.routes.js");
const caborRoutes = require("./routes/cabor.routes.js");
const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const userRoutes = require("./routes/user.routes.js");
const publicRoutes = require("./routes/public.routes.js");
const jadwalRoutes = require("./routes/jadwal.routes.js");

const app = express();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/ahp", ahpRoutes);
app.use("/api/rekomendasi", rekomendasiRoutes);
app.use("/api/jadwal", jadwalRoutes); // ← ganti prefix jadi /api/jadwal
app.use("/api/pelatih/jadwal", jadwalRoutes); // ← tetap ada untuk pelatih dashboard // ← HARUS di atas /api/pelatih
app.use("/api/pelatih", pelatihRoutes);
app.use("/api/cabor", caborRoutes);
app.use("/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/public", publicRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Route ${req.method} ${req.path} tidak ditemukan` });
});

app.use(errorHandler);

module.exports = app;
