"use strict";

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Data seed
// ---------------------------------------------------------------------------

const CABANG_OLAHRAGA = [
  { nama_cabor: "Futsal" },
  { nama_cabor: "Basket" },
  { nama_cabor: "Voli" },
];

const KRITERIA = [
  {
    kode: "C1",
    nama_kriteria: "Pengalaman",
    tipe: "benefit",
    // 1=<1 thn | 2=1-2 thn | 3=3-4 thn | 4=5-6 thn | 5=>6 thn
  },
  {
    kode: "C2",
    nama_kriteria: "Lisensi",
    tipe: "benefit",
    // 1=tidak ada | 2=non-resmi | 3=dasar | 4=menengah | 5=lanjutan/nasional
  },
  {
    kode: "C3",
    nama_kriteria: "Prestasi",
    tipe: "benefit",
    // 1=tidak ada | 2=lokal | 3=kab/kota | 4=provinsi | 5=nasional/internasional
  },
  {
    kode: "C4",
    nama_kriteria: "Biaya",
    tipe: "cost",
    // 5=sangat terjangkau | 4=terjangkau | 3=sedang | 2=mahal | 1=sangat mahal
  },
];

// Pelatih futsal — cabor_id di-resolve setelah upsert CabangOlahraga
// pengalaman | lisensi | prestasi | biaya  (semua skala 1-5)
const PELATIH_FUTSAL = [
  {
    nama: "Ahmad Fauzi",
    pengalaman: 5, // >6 tahun
    lisensi: 4,    // lisensi menengah
    prestasi: 4,   // prestasi provinsi
    biaya: 3,      // sedang
    status_verifikasi: "terverifikasi",
  },
  {
    nama: "Budi Setiawan",
    pengalaman: 4, // 5-6 tahun
    lisensi: 3,    // lisensi dasar
    prestasi: 3,   // prestasi kab/kota
    biaya: 4,      // terjangkau
    status_verifikasi: "terverifikasi",
  },
  {
    nama: "Cahyo Nugroho",
    pengalaman: 3, // 3-4 tahun
    lisensi: 5,    // lisensi nasional
    prestasi: 5,   // prestasi nasional
    biaya: 2,      // mahal
    status_verifikasi: "terverifikasi",
  },
  {
    nama: "Deni Prayoga",
    pengalaman: 5, // >6 tahun
    lisensi: 5,    // lisensi nasional
    prestasi: 4,   // prestasi provinsi
    biaya: 2,      // mahal
    status_verifikasi: "terverifikasi",
  },
  {
    nama: "Eko Prasetyo",
    pengalaman: 2, // 1-2 tahun
    lisensi: 2,    // sertifikat non-resmi
    prestasi: 2,   // prestasi lokal
    biaya: 5,      // sangat terjangkau
    status_verifikasi: "terverifikasi",
  },
  {
    nama: "Fajar Maulana",
    pengalaman: 4, // 5-6 tahun
    lisensi: 4,    // lisensi menengah
    prestasi: 3,   // prestasi kab/kota
    biaya: 3,      // sedang
    status_verifikasi: "terverifikasi",
  },
  {
    nama: "Gilang Ramadhan",
    pengalaman: 3, // 3-4 tahun
    lisensi: 3,    // lisensi dasar
    prestasi: 2,   // prestasi lokal
    biaya: 4,      // terjangkau
    status_verifikasi: "terverifikasi",
  },
  {
    nama: "Hendra Kurniawan",
    pengalaman: 5, // >6 tahun
    lisensi: 4,    // lisensi menengah
    prestasi: 5,   // prestasi nasional
    biaya: 1,      // sangat mahal
    status_verifikasi: "pending",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertCabang(data) {
  return prisma.cabangOlahraga.upsert({
    where: { nama_cabor: data.nama_cabor },
    update: {},
    create: data,
  });
}

async function upsertKriteria(data) {
  return prisma.kriteria.upsert({
    where: { kode: data.kode },
    update: { nama_kriteria: data.nama_kriteria, tipe: data.tipe },
    create: data,
  });
}

async function upsertUser(data) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: data,
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Memulai seed...\n");

  // 1. Cabang Olahraga
  console.log("1. Seeding cabang olahraga...");
  const cabangMap = {};
  for (const c of CABANG_OLAHRAGA) {
    const result = await upsertCabang(c);
    cabangMap[c.nama_cabor] = result.cabor_id;
    console.log(`   ✓ ${c.nama_cabor} (id: ${result.cabor_id})`);
  }

  // 2. Kriteria
  console.log("\n2. Seeding kriteria...");
  const kriteriaMap = {};
  for (const k of KRITERIA) {
    const result = await upsertKriteria(k);
    kriteriaMap[k.kode] = result.kriteria_id;
    console.log(`   ✓ ${k.kode} — ${k.nama_kriteria} (id: ${result.kriteria_id})`);
  }

  // 3. Users
  console.log("\n3. Seeding users...");
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordUser = await bcrypt.hash("user123", 10);

  const admin = await upsertUser({
    nama: "Administrator",
    email: "admin@ukm.ac.id",
    password: passwordAdmin,
    role: "admin",
  });
  console.log(`   ✓ Admin: ${admin.email} (id: ${admin.user_id})`);

  const userBiasa = await upsertUser({
    nama: "Mahasiswa UKM",
    email: "mahasiswa@ukm.ac.id",
    password: passwordUser,
    role: "user",
  });
  console.log(`   ✓ User:  ${userBiasa.email} (id: ${userBiasa.user_id})`);

  // 4. Pelatih + NilaiPelatih
  console.log("\n4. Seeding pelatih futsal...");
  const caborFutsalId = cabangMap["Futsal"];

  for (const p of PELATIH_FUTSAL) {
    // Cek apakah sudah ada (idempotent berdasarkan nama + cabor)
    const existing = await prisma.pelatih.findFirst({
      where: { nama: p.nama, cabor_id: caborFutsalId },
    });

    let pelatih;
    if (existing) {
      pelatih = await prisma.pelatih.update({
        where: { pelatih_id: existing.pelatih_id },
        data: {
          pengalaman: p.pengalaman,
          lisensi: p.lisensi,
          prestasi: p.prestasi,
          biaya: p.biaya,
          status_verifikasi: p.status_verifikasi,
        },
      });
    } else {
      pelatih = await prisma.pelatih.create({
        data: {
          nama: p.nama,
          cabor_id: caborFutsalId,
          pengalaman: p.pengalaman,
          lisensi: p.lisensi,
          prestasi: p.prestasi,
          biaya: p.biaya,
          status_verifikasi: p.status_verifikasi,
        },
      });
    }

    // Upsert NilaiPelatih — sinkron dengan nilai di tabel Pelatih
    const nilaiData = [
      { kode: "C1", nilai: p.pengalaman },
      { kode: "C2", nilai: p.lisensi },
      { kode: "C3", nilai: p.prestasi },
      { kode: "C4", nilai: p.biaya },
    ];

    for (const n of nilaiData) {
      await prisma.nilaiPelatih.upsert({
        where: {
          pelatih_id_kriteria_id: {
            pelatih_id: pelatih.pelatih_id,
            kriteria_id: kriteriaMap[n.kode],
          },
        },
        update: { nilai: n.nilai },
        create: {
          pelatih_id: pelatih.pelatih_id,
          kriteria_id: kriteriaMap[n.kode],
          nilai: n.nilai,
        },
      });
    }

    const statusLabel =
      p.status_verifikasi === "terverifikasi" ? "✓" : "⏳";
    console.log(
      `   ${statusLabel} ${p.nama.padEnd(18)} | ` +
        `C1=${p.pengalaman} C2=${p.lisensi} C3=${p.prestasi} C4=${p.biaya} ` +
        `| ${p.status_verifikasi}`,
    );
  }

  console.log("\nSeed selesai.");
  console.log("─".repeat(50));
  console.log("Akun tersedia:");
  console.log("  Admin : admin@ukm.ac.id     / admin123");
  console.log("  User  : mahasiswa@ukm.ac.id / user123");
}

main()
  .catch((e) => {
    console.error("Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
