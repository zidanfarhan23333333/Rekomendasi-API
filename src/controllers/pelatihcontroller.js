"use strict";

const {
  tambahPelatih,
  dapatkanSemua,
  dapatkanById,
  perbaruiPelatih,
  hapusPelatih,
  verifikasiPelatih,
} = require("../services/pelatih.service.js");

const CODE_TO_STATUS = {
  VALIDATION: 400,
  NOT_FOUND: 404,
};

function handleError(res, err, label) {
  const status = CODE_TO_STATUS[err.code] || 500;
  if (status === 500) console.error(`[pelatihController] ${label}:`, err);
  return res.status(status).json({ error: err.message });
}

const postPelatih = async (req, res) => {
  try {
    const data = await tambahPelatih(req.body);
    return res.status(201).json({ data });
  } catch (err) {
    return handleError(res, err, "postPelatih");
  }
};

const getAllPelatih = async (req, res) => {
  try {
    const data = await dapatkanSemua(req.query);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "getAllPelatih");
  }
};

const getPelatihById = async (req, res) => {
  try {
    const data = await dapatkanById(Number(req.params.id));
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "getPelatihById");
  }
};

const putPelatih = async (req, res) => {
  try {
    const data = await perbaruiPelatih(Number(req.params.id), req.body);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "putPelatih");
  }
};

const deletePelatih = async (req, res) => {
  try {
    const data = await hapusPelatih(Number(req.params.id));
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "deletePelatih");
  }
};

const patchVerifikasi = async (req, res) => {
  try {
    const data = await verifikasiPelatih(
      Number(req.params.id),
      req.body.status,
    );
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "patchVerifikasi");
  }
};

module.exports = {
  postPelatih,
  getAllPelatih,
  getPelatihById,
  putPelatih,
  deletePelatih,
  patchVerifikasi,
};
