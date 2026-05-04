-- AlterTable
ALTER TABLE "pelatih" ALTER COLUMN "status_verifikasi" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "jadwal_pelatih" (
    "jadwal_id" SERIAL NOT NULL,
    "pelatih_id" INTEGER NOT NULL,
    "hari" TEXT NOT NULL,
    "jam_mulai" TEXT NOT NULL,
    "jam_selesai" TEXT NOT NULL,
    "tersedia" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "jadwal_pelatih_pkey" PRIMARY KEY ("jadwal_id")
);

-- AddForeignKey
ALTER TABLE "jadwal_pelatih" ADD CONSTRAINT "jadwal_pelatih_pelatih_id_fkey" FOREIGN KEY ("pelatih_id") REFERENCES "pelatih"("pelatih_id") ON DELETE CASCADE ON UPDATE CASCADE;
