const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Cabang Olahraga — pakai upsert supaya tidak duplikat
  const cabors = await Promise.all([
    prisma.cabangOlahraga.upsert({
      where: { nama_cabor: "Badminton" },
      update: {},
      create: { nama_cabor: "Badminton" },
    }),
    prisma.cabangOlahraga.upsert({
      where: { nama_cabor: "Renang" },
      update: {},
      create: { nama_cabor: "Renang" },
    }),
    prisma.cabangOlahraga.upsert({
      where: { nama_cabor: "Sepak Bola" },
      update: {},
      create: { nama_cabor: "Sepak Bola" },
    }),
    prisma.cabangOlahraga.upsert({
      where: { nama_cabor: "Basket" },
      update: {},
      create: { nama_cabor: "Basket" },
    }),
    prisma.cabangOlahraga.upsert({
      where: { nama_cabor: "Voli" },
      update: {},
      create: { nama_cabor: "Voli" },
    }),
  ]);

  console.log("✅ Cabang olahraga selesai");

  // Users — pakai upsert supaya tidak duplikat
  const adminPass = await bcrypt.hash("admin123", 10);
  const userPass = await bcrypt.hash("user123", 10);
  const pelatihPass = await bcrypt.hash("pelatih123", 10);

  await prisma.user.upsert({
    where: { email: "admin@ukm.ac.id" },
    update: {},
    create: {
      nama: "Administrator",
      email: "admin@ukm.ac.id",
      password: adminPass,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "mahasiswa@ukm.ac.id" },
    update: {},
    create: {
      nama: "Mahasiswa UKM",
      email: "mahasiswa@ukm.ac.id",
      password: userPass,
      role: "user",
    },
  });

  const userFarkhan = await prisma.user.upsert({
    where: { email: "Farhan23@gmail.com" },
    update: {},
    create: {
      nama: "Farkhan",
      email: "Farhan23@gmail.com",
      password: pelatihPass,
      role: "pelatih",
    },
  });

  const userPelatih = await prisma.user.upsert({
    where: { email: "pelatih@gmail.com" },
    update: {},
    create: {
      nama: "Pelatih",
      email: "pelatih@gmail.com",
      password: pelatihPass,
      role: "pelatih",
    },
  });

  console.log("✅ Users selesai");

  // Pelatih — cek dulu sebelum create
  const existingFarkhan = await prisma.pelatih.findUnique({
    where: { user_id: userFarkhan.user_id },
  });
  if (!existingFarkhan) {
    await prisma.pelatih.create({
      data: {
        nama: "Farkhan",
        cabor_id: cabors[0].cabor_id,
        user_id: userFarkhan.user_id,
        pengalaman: 4,
        lisensi: 3,
        prestasi: 4,
        biaya: 3,
        status_verifikasi: "terverifikasi",
      },
    });
  }

  const existingPelatih = await prisma.pelatih.findUnique({
    where: { user_id: userPelatih.user_id },
  });
  if (!existingPelatih) {
    await prisma.pelatih.create({
      data: {
        nama: "Pelatih Badminton",
        cabor_id: cabors[0].cabor_id,
        user_id: userPelatih.user_id,
        pengalaman: 5,
        lisensi: 4,
        prestasi: 5,
        biaya: 2,
        status_verifikasi: "terverifikasi",
      },
    });
  }

  // Pelatih tanpa user_id
  await prisma.pelatih.createMany({
    data: [
      {
        nama: "Pelatih Renang",
        cabor_id: cabors[1].cabor_id,
        pengalaman: 3,
        lisensi: 3,
        prestasi: 3,
        biaya: 4,
        status_verifikasi: "terverifikasi",
      },
      {
        nama: "Pelatih Sepak Bola",
        cabor_id: cabors[2].cabor_id,
        pengalaman: 4,
        lisensi: 5,
        prestasi: 4,
        biaya: 3,
        status_verifikasi: "pending",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Pelatih selesai");
  console.log("🎉 Seed selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
