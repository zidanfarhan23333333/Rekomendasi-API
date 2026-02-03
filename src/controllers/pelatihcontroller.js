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
    const pelatih = await tambahPelatih(req.body);
    return res.status(201).json({ pelatih });
  } catch (err) {
    return handleError(res, err, "postPelatih");
  }
};

const getAllPelatih = async (req, res) => {
  try {
    const filter = {};
    if (req.query.cabor_id !== undefined) {
      filter.cabor_id = req.query.cabor_id;
    }

    const pelatih = await dapatkanSemua(filter);
    return res.status(200).json({ pelatih });
  } catch (err) {
    return handleError(res, err, "getAllPelatih");
  }
};

const getPelatihById = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "id harus angka" });
  }

  try {
    const pelatih = await dapatkanById(id);
    return res.status(200).json({ pelatih });
  } catch (err) {
    return handleError(res, err, "getPelatihById");
  }
};

const putPelatih = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "id harus angka" });
  }

  try {
    const pelatih = await perbaruiPelatih(id, req.body);
    return res.status(200).json({ pelatih });
  } catch (err) {
    return handleError(res, err, "putPelatih");
  }
};

const deletePelatih = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "id harus angka" });
  }

  try {
    const result = await hapusPelatih(id);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err, "deletePelatih");
  }
};

const patchVerifikasi = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "id harus angka" });
  }

  if (!req.body.status) {
    return res.status(400).json({ error: "status diperlukan" });
  }

  try {
    const pelatih = await verifikasiPelatih(id, req.body.status);
    return res.status(200).json({ pelatih });
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
