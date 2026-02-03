"use strict";

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const errorHandler = require("./middleware/error.handler.js");
const ahpRoutes = require("./routes/ahp.routes.js");
const rocRoutes = require("./routes/roc.routes.js");
const rekomendasiRoutes = require("./routes/rekomendasi.routes.js");
const pelatihRoutes = require("./routes/pelatih.routes.js");

const app = express();

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use("/api/ahp", ahpRoutes);
app.use("/api/roc", rocRoutes);
app.use("/api/rekomendasi", rekomendasiRoutes);
app.use("/api/pelatih", pelatihRoutes);

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
