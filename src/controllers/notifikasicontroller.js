"use strict";

const {
  getMyNotifikasi,
  getUnreadCount,
} = require("../services/notifikasi.service.js");
const ApiResponse = require("../utils/response");

async function getNotifikasi(req, res) {
  try {
    const userId = req.user.userId;
    const data = await getMyNotifikasi(userId, Number(req.query.limit) || 10);
    return ApiResponse.success(res, data, "Notifikasi retrieved successfully");
  } catch (error) {
    console.error("getNotifikasi error:", error);
    return ApiResponse.error(res, "Failed to retrieve notifikasi");
  }
}

async function getUnread(req, res) {
  try {
    const userId = req.user.userId;
    const count = await getUnreadCount(userId);
    return ApiResponse.success(res, { count }, "Unread count retrieved");
  } catch (error) {
    console.error("getUnread error:", error);
    return ApiResponse.error(res, "Failed to retrieve unread count");
  }
}

module.exports = { getNotifikasi, getUnread };
