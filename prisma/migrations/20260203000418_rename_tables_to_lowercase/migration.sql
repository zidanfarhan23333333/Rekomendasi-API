/*
  Warnings:

  - You are about to drop the `BobotRoc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CabangOlahraga` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HasilRekomendasi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kriteria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NilaiPelatih` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pelatih` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pemesanan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BobotRoc" DROP CONSTRAINT "BobotRoc_kriteria_id_fkey";

-- DropForeignKey
ALTER TABLE "HasilRekomendasi" DROP CONSTRAINT "HasilRekomendasi_pelatih_id_fkey";

-- DropForeignKey
ALTER TABLE "HasilRekomendasi" DROP CONSTRAINT "HasilRekomendasi_user_id_fkey";

-- DropForeignKey
ALTER TABLE "NilaiPelatih" DROP CONSTRAINT "NilaiPelatih_kriteria_id_fkey";

-- DropForeignKey
ALTER TABLE "NilaiPelatih" DROP CONSTRAINT "NilaiPelatih_pelatih_id_fkey";

-- DropForeignKey
ALTER TABLE "Pelatih" DROP CONSTRAINT "Pelatih_cabor_id_fkey";

-- DropForeignKey
ALTER TABLE "Pemesanan" DROP CONSTRAINT "Pemesanan_cabor_id_fkey";

-- DropForeignKey
ALTER TABLE "Pemesanan" DROP CONSTRAINT "Pemesanan_pelatih_id_fkey";

-- DropForeignKey
ALTER TABLE "Pemesanan" DROP CONSTRAINT "Pemesanan_user_id_fkey";

-- DropTable
DROP TABLE "BobotRoc";

-- DropTable
DROP TABLE "CabangOlahraga";

-- DropTable
DROP TABLE "HasilRekomendasi";

-- DropTable
DROP TABLE "Kriteria";

-- DropTable
DROP TABLE "NilaiPelatih";

-- DropTable
DROP TABLE "Pelatih";

-- DropTable
DROP TABLE "Pemesanan";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "cabangolahraga" (
    "cabor_id" SERIAL NOT NULL,
    "nama_cabor" TEXT NOT NULL,

    CONSTRAINT "cabangolahraga_pkey" PRIMARY KEY ("cabor_id")
);

-- CreateTable
CREATE TABLE "pelatih" (
    "pelatih_id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "cabor_id" INTEGER NOT NULL,
    "pengalaman" INTEGER NOT NULL,
    "sertifikat" INTEGER NOT NULL,
    "biaya" INTEGER NOT NULL,
    "ketersediaan_waktu" BOOLEAN NOT NULL,
    "status_verifikasi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pelatih_pkey" PRIMARY KEY ("pelatih_id")
);

-- CreateTable
CREATE TABLE "kriteria" (
    "kriteria_id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama_kriteria" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,

    CONSTRAINT "kriteria_pkey" PRIMARY KEY ("kriteria_id")
);

-- CreateTable
CREATE TABLE "bobotroc" (
    "roc_id" SERIAL NOT NULL,
    "kriteria_id" INTEGER NOT NULL,
    "peringkat" INTEGER NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "bobotroc_pkey" PRIMARY KEY ("roc_id")
);

-- CreateTable
CREATE TABLE "nilaipelatih" (
    "nilai_id" SERIAL NOT NULL,
    "pelatih_id" INTEGER NOT NULL,
    "kriteria_id" INTEGER NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "nilaipelatih_pkey" PRIMARY KEY ("nilai_id")
);

-- CreateTable
CREATE TABLE "pemesanan" (
    "pemesanan_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cabor_id" INTEGER NOT NULL,
    "pelatih_id" INTEGER,
    "status" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pemesanan_pkey" PRIMARY KEY ("pemesanan_id")
);

-- CreateTable
CREATE TABLE "hasilrekomendasi" (
    "rekomendasi_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pelatih_id" INTEGER NOT NULL,
    "skor_akhir" DOUBLE PRECISION NOT NULL,
    "peringkat" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hasilrekomendasi_pkey" PRIMARY KEY ("rekomendasi_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cabangolahraga_nama_cabor_key" ON "cabangolahraga"("nama_cabor");

-- CreateIndex
CREATE UNIQUE INDEX "kriteria_kode_key" ON "kriteria"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "bobotroc_kriteria_id_key" ON "bobotroc"("kriteria_id");

-- CreateIndex
CREATE UNIQUE INDEX "nilaipelatih_pelatih_id_kriteria_id_key" ON "nilaipelatih"("pelatih_id", "kriteria_id");

-- AddForeignKey
ALTER TABLE "pelatih" ADD CONSTRAINT "pelatih_cabor_id_fkey" FOREIGN KEY ("cabor_id") REFERENCES "cabangolahraga"("cabor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bobotroc" ADD CONSTRAINT "bobotroc_kriteria_id_fkey" FOREIGN KEY ("kriteria_id") REFERENCES "kriteria"("kriteria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilaipelatih" ADD CONSTRAINT "nilaipelatih_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "pelatih"("pelatih_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilaipelatih" ADD CONSTRAINT "nilaipelatih_kriteria_id_fkey" FOREIGN KEY ("kriteria_id") REFERENCES "kriteria"("kriteria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanan" ADD CONSTRAINT "pemesanan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanan" ADD CONSTRAINT "pemesanan_cabor_id_fkey" FOREIGN KEY ("cabor_id") REFERENCES "cabangolahraga"("cabor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanan" ADD CONSTRAINT "pemesanan_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "pelatih"("pelatih_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasilrekomendasi" ADD CONSTRAINT "hasilrekomendasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasilrekomendasi" ADD CONSTRAINT "hasilrekomendasi_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "pelatih"("pelatih_id") ON DELETE RESTRICT ON UPDATE CASCADE;
