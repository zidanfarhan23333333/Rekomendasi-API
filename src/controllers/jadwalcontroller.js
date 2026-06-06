"use strict";

const {
  getJadwal,
  tambahJadwal,
  hapusJadwal,
} = require("../services/jadwal.service.js");

const CODE_TO_STATUS = { VALIDATION: 400, NOT_FOUND: 404, FORBIDDEN: 403 };

function handleError(res, err, label) {
  const status = CODE_TO_STATUS[err.code] || 500;
  if (status === 500) console.error(`[jadwalController] ${label}:`, err);
  return res.status(status).json({ error: err.message });
}

const getMyJadwal = async (req, res) => {
  try {
    const data = await getJadwal(req.user.userId);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "getMyJadwal");
  }
};

const postJadwal = async (req, res) => {
  try {
    const data = await tambahJadwal(req.user.userId, req.body);
    return res.status(201).json({ data });
  } catch (err) {
    return handleError(res, err, "postJadwal");
  }
};

const deleteJadwal = async (req, res) => {
  try {
    await hapusJadwal(req.user.userId, Number(req.params.id));
    return res.status(200).json({ message: "Jadwal dihapus" });
  } catch (err) {
    return handleError(res, err, "deleteJadwal");
  }
};

module.exports = { getMyJadwal, postJadwal, deleteJadwal };
