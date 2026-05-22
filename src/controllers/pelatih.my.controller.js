"use strict";

const {
  getMyProfile,
  updateMyProfile,
  getMyStats,
  getMyBookings,
  getMyJadwal,
} = require("../services/pelatih.my.service.js");

const CODE_TO_STATUS = {
  VALIDATION: 400,
  NOT_FOUND: 404,
};

function handleError(res, err, label) {
  const status = CODE_TO_STATUS[err.code] || 500;
  if (status === 500) console.error(`[pelatihMyController] ${label}:`, err);
  return res.status(status).json({ error: err.message });
}

// GET /pelatih/my-profile
const myProfile = async (req, res) => {
  try {
    const data = await getMyProfile(req.user.userId);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "myProfile");
  }
};

// PUT /pelatih/my-profile
const updateProfile = async (req, res) => {
  try {
    const data = await updateMyProfile(req.user.userId, req.body);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "updateProfile");
  }
};

// GET /pelatih/my-stats
const myStats = async (req, res) => {
  try {
    const data = await getMyStats(req.user.userId);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "myStats");
  }
};

// GET /pelatih/bookings
const myBookings = async (req, res) => {
  try {
    const data = await getMyBookings(req.user.userId, req.query);
    return res.status(200).json({ data: { bookings: data } });
  } catch (err) {
    return handleError(res, err, "myBookings");
  }
};

// GET /pelatih/my-jadwal
const myJadwal = async (req, res) => {
  try {
    const data = await getMyJadwal(req.user.userId);
    return res.status(200).json({ data });
  } catch (err) {
    return handleError(res, err, "myJadwal");
  }
};

module.exports = {
  myProfile,
  updateProfile,
  myStats,
  myBookings,
  myJadwal,
};
