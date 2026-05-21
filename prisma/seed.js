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
// Data seed — disesuaikan dengan schema.prisma
// ---------------------------------------------------------------------------

const KRITERIA = [
  { nama_kriteria: "Pengalaman", tipe: "benefit" },
  { nama_kriteria: "Prestasi", tipe: "benefit" },
  { nama_kriteria: "Biaya", tipe: "cost" },
];

const PELATIH = [
  {
    nama: "Ahmad Fauzi",
    cabang_olahraga: "Futsal",
    pengalaman: 8,
    prestasi: "Juara PON 2021",
    biaya: 300000,
    ketersediaan_waktu: "Senin-Jumat",
  },
  {
    nama: "Budi Setiawan",
    cabang_olahraga: "Futsal",
    pengalaman: 5,
    prestasi: "Juara Kota 2022",
    biaya: 200000,
    ketersediaan_waktu: "Senin-Sabtu",
  },
  {
    nama: "Cahyo Nugroho",
    cabang_olahraga: "Basket",
    pengalaman: 10,
    prestasi: "Medali SEA Games",
    biaya: 500000,
    ketersediaan_waktu: "Setiap hari",
  },
  {
    nama: "Deni Prayoga",
    cabang_olahraga: "Basket",
    pengalaman: 7,
    prestasi: "Juara Provinsi 2020",
    biaya: 350000,
    ketersediaan_waktu: "Senin-Jumat",
  },
  {
    nama: "Eko Prasetyo",
    cabang_olahraga: "Voli",
    pengalaman: 3,
    prestasi: "Juara Lokal 2023",
    biaya: 150000,
    ketersediaan_waktu: "Sabtu-Minggu",
  },
  {
    nama: "Fajar Maulana",
    cabang_olahraga: "Voli",
    pengalaman: 6,
    prestasi: "Juara Kabupaten 2021",
    biaya: 250000,
    ketersediaan_waktu: "Senin-Sabtu",
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Memulai seed...\n");

  // 1. Users
  console.log("1. Seeding users...");
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordUser = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ukm.ac.id" },
    update: {},
    create: {
      nama: "Administrator",
      email: "admin@ukm.ac.id",
      password: passwordAdmin,
      role: "admin",
    },
  });
  console.log(`   ✓ Admin : ${admin.email} (id: ${admin.user_id})`);

  const userBiasa = await prisma.user.upsert({
    where: { email: "mahasiswa@ukm.ac.id" },
    update: {},
    create: {
      nama: "Mahasiswa UKM",
      email: "mahasiswa@ukm.ac.id",
      password: passwordUser,
      role: "user",
    },
  });
  console.log(`   ✓ User  : ${userBiasa.email} (id: ${userBiasa.user_id})`);

  // 2. Kriteria
  console.log("\n2. Seeding kriteria...");
  const kriteriaIds = [];
  for (const k of KRITERIA) {
    // Tidak ada unique field selain kriteria_id, cek by nama dulu
    const existing = await prisma.kriteria.findFirst({
      where: { nama_kriteria: k.nama_kriteria },
    });
    let result;
    if (existing) {
      result = await prisma.kriteria.update({
        where: { kriteria_id: existing.kriteria_id },
        data: { tipe: k.tipe },
      });
    } else {
      result = await prisma.kriteria.create({ data: k });
    }
    kriteriaIds.push(result.kriteria_id);
    console.log(
      `   ✓ ${result.nama_kriteria} — ${result.tipe} (id: ${result.kriteria_id})`,
    );
  }

  // 3. Pelatih + NilaiPelatih
  console.log("\n3. Seeding pelatih...");
  for (const p of PELATIH) {
    const existing = await prisma.pelatih.findFirst({
      where: { nama: p.nama, cabang_olahraga: p.cabang_olahraga },
    });

    let pelatih;
    if (existing) {
      pelatih = await prisma.pelatih.update({
        where: { pelatih_id: existing.pelatih_id },
        data: p,
      });
    } else {
      pelatih = await prisma.pelatih.create({ data: p });
    }

    // NilaiPelatih: Pengalaman, Prestasi, Biaya (skala 1-5)
    // Konversi nilai numerik ke skala 1-5
    const pengalamanSkala =
      p.pengalaman >= 8
        ? 5
        : p.pengalaman >= 6
          ? 4
          : p.pengalaman >= 4
            ? 3
            : p.pengalaman >= 2
              ? 2
              : 1;
    const biayaSkala =
      p.biaya <= 150000
        ? 5
        : p.biaya <= 250000
          ? 4
          : p.biaya <= 350000
            ? 3
            : p.biaya <= 450000
              ? 2
              : 1;
    const prestasiSkala = p.prestasi.includes("SEA")
      ? 5
      : p.prestasi.includes("PON") || p.prestasi.includes("Provinsi")
        ? 4
        : p.prestasi.includes("Kabupaten") || p.prestasi.includes("Kota")
          ? 3
          : p.prestasi.includes("Lokal")
            ? 2
            : 1;

    const nilaiList = [pengalamanSkala, prestasiSkala, biayaSkala];

    for (let i = 0; i < kriteriaIds.length; i++) {
      const existing = await prisma.nilaiPelatih.findFirst({
        where: { pelatih_id: pelatih.pelatih_id, kriteria_id: kriteriaIds[i] },
      });
      if (existing) {
        await prisma.nilaiPelatih.update({
          where: { nilai_id: existing.nilai_id },
          data: { nilai: nilaiList[i] },
        });
      } else {
        await prisma.nilaiPelatih.create({
          data: {
            pelatih_id: pelatih.pelatih_id,
            kriteria_id: kriteriaIds[i],
            nilai: nilaiList[i],
          },
        });
      }
    }

    console.log(`   ✓ ${p.nama.padEnd(18)} | ${p.cabang_olahraga}`);
  }

  console.log("\nSeed selesai!");
  console.log("─".repeat(40));
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
