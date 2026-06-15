"use strict";

// src/services/email.service.js
// Service untuk kirim email notifikasi menggunakan Nodemailer

const nodemailer = require("nodemailer");

// ─── Buat transporter Nodemailer ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password Gmail (bukan password biasa)
  },
});

// ─── Verifikasi koneksi saat server start ────────────────────────────────────
transporter.verify((error) => {
  if (error) {
    console.error("[EmailService] Koneksi email gagal:", error.message);
  } else {
    console.log("[EmailService] Email service siap digunakan ✓");
  }
});

// ─── Template email konfirmasi pemesanan ─────────────────────────────────────
function templateKonfirmasi({
  namaUser,
  namaPelatih,
  cabor,
  tanggal,
  pemesanan_id,
}) {
  const tanggalFormatted = new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Konfirmasi Pemesanan</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 40px 40px 32px; text-align: center; }
    .logo { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 4px; }
    .logo span { color: #4ade80; }
    .logo-sub { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3); color: #4ade80; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 99px; margin-top: 20px; }
    .badge-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #0a0a0a; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #6e6e73; line-height: 1.6; margin-bottom: 28px; }
    .card { background: #f5f5f7; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .card-title { font-size: 11px; font-weight: 700; color: #aeaeb2; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e5ea; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 13px; color: #6e6e73; }
    .detail-value { font-size: 13px; font-weight: 600; color: #0a0a0a; }
    .status-badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 99px; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .info-box p { font-size: 13px; color: #15803d; line-height: 1.6; }
    .cta-btn { display: block; background: #0a0a0a; color: #ffffff; text-align: center; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 24px; border-radius: 12px; margin-bottom: 24px; }
    .footer { background: #f5f5f7; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #aeaeb2; line-height: 1.6; }
    .footer a { color: #0a0a0a; text-decoration: none; font-weight: 600; }
    @media (max-width: 600px) {
      .body, .footer { padding: 24px 20px; }
      .header { padding: 28px 20px 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="logo">Sport<span>Coach</span></div>
      <div class="logo-sub">Sistem Rekomendasi Pelatih</div>
      <div class="badge">
        <span class="badge-dot"></span>
        Pemesanan Dikonfirmasi
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <h2 class="greeting">Halo, ${namaUser}! 🎉</h2>
      <p class="subtitle">
        Pemesanan sesi latihan Anda telah <strong>dikonfirmasi</strong> oleh admin. 
        Berikut adalah detail pemesanan Anda:
      </p>

      <!-- Detail Card -->
      <div class="card">
        <div class="card-title">Detail Pemesanan</div>
        <div class="detail-row">
          <span class="detail-label">No. Pemesanan</span>
          <span class="detail-value">#${pemesanan_id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pelatih</span>
          <span class="detail-value">${namaPelatih}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cabang Olahraga</span>
          <span class="detail-value">${cabor}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tanggal</span>
          <span class="detail-value">${tanggalFormatted}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="status-badge">✓ Dikonfirmasi</span>
        </div>
      </div>

      <!-- Info box -->
      <div class="info-box">
        <p>
          💡 <strong>Langkah selanjutnya:</strong> Silakan hubungi pelatih untuk 
          koordinasi lokasi dan waktu latihan. Pembayaran dilakukan langsung kepada 
          pelatih setelah sesi selesai.
        </p>
      </div>

      <!-- CTA -->
      <a href="${process.env.APP_URL || "http://localhost:5173"}/user/riwayat" class="cta-btn">
        Lihat Jadwal Saya →
      </a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        Email ini dikirim otomatis oleh sistem SportCoach.<br />
        Jika Anda tidak merasa melakukan pemesanan ini, silakan 
        <a href="mailto:${process.env.EMAIL_USER}">hubungi kami</a>.
      </p>
      <p style="margin-top: 8px; color: #c8c8c8;">
        © ${new Date().getFullYear()} SportCoach. Sistem Rekomendasi Pelatih.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── Template email penolakan ─────────────────────────────────────────────────
function templateDitolak({ namaUser, namaPelatih, cabor, pemesanan_id }) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #2d1b1b 100%); padding: 40px 40px 32px; text-align: center; }
    .logo { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .logo span { color: #f87171; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.3); color: #f87171; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 99px; margin-top: 20px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #0a0a0a; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #6e6e73; line-height: 1.6; margin-bottom: 28px; }
    .card { background: #f5f5f7; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .card-title { font-size: 11px; font-weight: 700; color: #aeaeb2; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e5ea; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 13px; color: #6e6e73; }
    .detail-value { font-size: 13px; font-weight: 600; color: #0a0a0a; }
    .status-badge { display: inline-block; background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 99px; }
    .cta-btn { display: block; background: #0a0a0a; color: #ffffff; text-align: center; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 24px; border-radius: 12px; margin-bottom: 24px; }
    .footer { background: #f5f5f7; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #aeaeb2; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Sport<span>Coach</span></div>
      <div class="badge">✕ Pemesanan Ditolak</div>
    </div>
    <div class="body">
      <h2 class="greeting">Halo, ${namaUser}</h2>
      <p class="subtitle">
        Mohon maaf, pemesanan sesi latihan Anda <strong>tidak dapat dikonfirmasi</strong> 
        oleh admin. Anda dapat mencari pelatih lain yang tersedia.
      </p>
      <div class="card">
        <div class="card-title">Detail Pemesanan</div>
        <div class="detail-row">
          <span class="detail-label">No. Pemesanan</span>
          <span class="detail-value">#${pemesanan_id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pelatih</span>
          <span class="detail-value">${namaPelatih}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cabang Olahraga</span>
          <span class="detail-value">${cabor}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="status-badge">✕ Ditolak</span>
        </div>
      </div>
      <a href="${process.env.APP_URL || "http://localhost:5173"}/user/cari-pelatih" class="cta-btn">
        Cari Pelatih Lain →
      </a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SportCoach. Sistem Rekomendasi Pelatih.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── Fungsi kirim email konfirmasi ───────────────────────────────────────────
async function kirimEmailKonfirmasi({
  emailUser,
  namaUser,
  namaPelatih,
  cabor,
  tanggal,
  pemesanan_id,
}) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `SportCoach <${process.env.EMAIL_USER}>`,
      to: emailUser,
      subject: `✅ Pemesanan #${pemesanan_id} Dikonfirmasi - SportCoach`,
      html: templateKonfirmasi({
        namaUser,
        namaPelatih,
        cabor,
        tanggal,
        pemesanan_id,
      }),
    });

    console.log(`[EmailService] Email konfirmasi terkirim ke ${emailUser}`);
    return { success: true };
  } catch (error) {
    console.error(
      `[EmailService] Gagal kirim email ke ${emailUser}:`,
      error.message,
    );
    return { success: false, error: error.message };
  }
}

// ─── Fungsi kirim email penolakan ────────────────────────────────────────────
async function kirimEmailDitolak({
  emailUser,
  namaUser,
  namaPelatih,
  cabor,
  pemesanan_id,
}) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `SportCoach <${process.env.EMAIL_USER}>`,
      to: emailUser,
      subject: `❌ Pemesanan #${pemesanan_id} Tidak Dikonfirmasi - SportCoach`,
      html: templateDitolak({ namaUser, namaPelatih, cabor, pemesanan_id }),
    });

    console.log(`[EmailService] Email penolakan terkirim ke ${emailUser}`);
    return { success: true };
  } catch (error) {
    console.error(
      `[EmailService] Gagal kirim email ke ${emailUser}:`,
      error.message,
    );
    return { success: false, error: error.message };
  }
}

module.exports = {
  kirimEmailKonfirmasi,
  kirimEmailDitolak,
};
