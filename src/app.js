"use strict";

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

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
const pemesananRoutes = require("./routes/pemesanan.routes.js");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://frontend-red-nu-66.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/ahp", ahpRoutes);
app.use("/api/rekomendasi", rekomendasiRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/pelatih/jadwal", jadwalRoutes);
app.use("/api/pelatih", pelatihRoutes);
app.use("/api/cabor", caborRoutes);
app.use("/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/public", publicRoutes);
app.use("/api", pemesananRoutes);

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
