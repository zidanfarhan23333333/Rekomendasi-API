/*
  Warnings:

  - You are about to drop the column `cabor_id` on the `HasilRekomendasi` table. All the data in the column will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[kriteria_id]` on the table `BobotRoc` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nama_cabor]` on the table `CabangOlahraga` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kode]` on the table `Kriteria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sertifikat` to the `Pelatih` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `ketersediaan_waktu` on the `Pelatih` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `cabor_id` to the `Pemesanan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HasilRekomendasi" DROP CONSTRAINT "HasilRekomendasi_cabor_id_fkey";

-- DropForeignKey
ALTER TABLE "HasilRekomendasi" DROP CONSTRAINT "HasilRekomendasi_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Pemesanan" DROP CONSTRAINT "Pemesanan_pelatih_id_fkey";

-- DropForeignKey
ALTER TABLE "Pemesanan" DROP CONSTRAINT "Pemesanan_user_id_fkey";

-- AlterTable
ALTER TABLE "HasilRekomendasi" DROP COLUMN "cabor_id";

-- AlterTable
ALTER TABLE "Pelatih" ADD COLUMN     "sertifikat" INTEGER NOT NULL,
DROP COLUMN "ketersediaan_waktu",
ADD COLUMN     "ketersediaan_waktu" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Pemesanan" ADD COLUMN     "cabor_id" INTEGER NOT NULL,
ALTER COLUMN "pelatih_id" DROP NOT NULL;

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BobotRoc_kriteria_id_key" ON "BobotRoc"("kriteria_id");

-- CreateIndex
CREATE UNIQUE INDEX "CabangOlahraga_nama_cabor_key" ON "CabangOlahraga"("nama_cabor");

-- CreateIndex
CREATE UNIQUE INDEX "Kriteria_kode_key" ON "Kriteria"("kode");

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_cabor_id_fkey" FOREIGN KEY ("cabor_id") REFERENCES "CabangOlahraga"("cabor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "Pelatih"("pelatih_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilRekomendasi" ADD CONSTRAINT "HasilRekomendasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
