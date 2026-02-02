-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "CabangOlahraga" (
    "cabor_id" SERIAL NOT NULL,
    "nama_cabor" TEXT NOT NULL,

    CONSTRAINT "CabangOlahraga_pkey" PRIMARY KEY ("cabor_id")
);

-- CreateTable
CREATE TABLE "Pelatih" (
    "pelatih_id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "cabor_id" INTEGER NOT NULL,
    "pengalaman" INTEGER NOT NULL,
    "biaya" INTEGER NOT NULL,
    "ketersediaan_waktu" TEXT NOT NULL,
    "status_verifikasi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pelatih_pkey" PRIMARY KEY ("pelatih_id")
);

-- CreateTable
CREATE TABLE "Kriteria" (
    "kriteria_id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama_kriteria" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("kriteria_id")
);

-- CreateTable
CREATE TABLE "BobotRoc" (
    "roc_id" SERIAL NOT NULL,
    "kriteria_id" INTEGER NOT NULL,
    "peringkat" INTEGER NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BobotRoc_pkey" PRIMARY KEY ("roc_id")
);

-- CreateTable
CREATE TABLE "NilaiPelatih" (
    "nilai_id" SERIAL NOT NULL,
    "pelatih_id" INTEGER NOT NULL,
    "kriteria_id" INTEGER NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NilaiPelatih_pkey" PRIMARY KEY ("nilai_id")
);

-- CreateTable
CREATE TABLE "HasilRekomendasi" (
    "rekomendasi_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pelatih_id" INTEGER NOT NULL,
    "cabor_id" INTEGER NOT NULL,
    "skor_akhir" DOUBLE PRECISION NOT NULL,
    "peringkat" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HasilRekomendasi_pkey" PRIMARY KEY ("rekomendasi_id")
);

-- CreateTable
CREATE TABLE "Pemesanan" (
    "pemesanan_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pelatih_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pemesanan_pkey" PRIMARY KEY ("pemesanan_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NilaiPelatih_pelatih_id_kriteria_id_key" ON "NilaiPelatih"("pelatih_id", "kriteria_id");

-- AddForeignKey
ALTER TABLE "Pelatih" ADD CONSTRAINT "Pelatih_cabor_id_fkey" FOREIGN KEY ("cabor_id") REFERENCES "CabangOlahraga"("cabor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BobotRoc" ADD CONSTRAINT "BobotRoc_kriteria_id_fkey" FOREIGN KEY ("kriteria_id") REFERENCES "Kriteria"("kriteria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiPelatih" ADD CONSTRAINT "NilaiPelatih_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "Pelatih"("pelatih_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiPelatih" ADD CONSTRAINT "NilaiPelatih_kriteria_id_fkey" FOREIGN KEY ("kriteria_id") REFERENCES "Kriteria"("kriteria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilRekomendasi" ADD CONSTRAINT "HasilRekomendasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilRekomendasi" ADD CONSTRAINT "HasilRekomendasi_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "Pelatih"("pelatih_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilRekomendasi" ADD CONSTRAINT "HasilRekomendasi_cabor_id_fkey" FOREIGN KEY ("cabor_id") REFERENCES "CabangOlahraga"("cabor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "Pelatih"("pelatih_id") ON DELETE RESTRICT ON UPDATE CASCADE;
