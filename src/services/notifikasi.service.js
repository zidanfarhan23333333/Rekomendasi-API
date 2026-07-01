"use strict";

const prisma = require("../config/database.js");

async function getMyNotifikasi(userId, limit = 10) {
  const bookings = await prisma.pemesanan.findMany({
    where: { user_id: userId },
    orderBy: { tanggal: "desc" },
    take: limit,
    include: {
      pelatih: { select: { nama: true } },
      cabang: { select: { nama_cabor: true } },
    },
  });

  return bookings.map((b) => ({
    id: b.pemesanan_id,
    title: pesanNotif(b.status, b.pelatih?.nama),
    cabor: b.cabang?.nama_cabor,
    status: b.status,
    waktu: b.tanggal,
    dibaca: false,
  }));
}

function pesanNotif(status, namaPelatih) {
  const map = {
    pending: `Booking ke ${namaPelatih} sedang menunggu konfirmasi`,
    konfirmasi: `Booking dengan ${namaPelatih} dikonfirmasi`,
    dibatalkan: `Booking dengan ${namaPelatih} dibatalkan`,
    selesai: `Sesi latihan dengan ${namaPelatih} telah selesai`,
  };
  return map[status] || `Update booking dengan ${namaPelatih}`;
}

async function getUnreadCount(userId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.pemesanan.count({
    where: {
      user_id: userId,
      tanggal: { gte: since },
    },
  });
  return count;
}

module.exports = { getMyNotifikasi, getUnreadCount };
