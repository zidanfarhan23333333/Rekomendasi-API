"use strict";

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../services/user.profile.service.js");
const ApiResponse = require("../utils/response");

const CODE_TO_STATUS = { VALIDATION: 400, NOT_FOUND: 404 };

function handleError(res, err, label) {
  const status = CODE_TO_STATUS[err.code] || 500;
  if (status === 500) console.error(`[userProfileController] ${label}:`, err);
  return res.status(status).json({ error: err.message });
}

async function getProfile(req, res) {
  try {
    const data = await getMyProfile(req.user.userId);
    return ApiResponse.success(res, data, "Profile retrieved successfully");
  } catch (err) {
    return handleError(res, err, "getProfile");
  }
}

async function updateProfile(req, res) {
  try {
    const data = await updateMyProfile(req.user.userId, req.body);
    return ApiResponse.success(res, data, "Profile updated successfully");
  } catch (err) {
    return handleError(res, err, "updateProfile");
  }
}

async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const data = await changePassword(
      req.user.userId,
      oldPassword,
      newPassword,
    );
    return ApiResponse.success(res, data, "Password updated successfully");
  } catch (err) {
    return handleError(res, err, "updatePassword");
  }
}

module.exports = { getProfile, updateProfile, updatePassword };
