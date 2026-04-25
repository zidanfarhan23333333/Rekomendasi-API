-- Migration: update_criteria_ahp
-- Perubahan kriteria: hapus sertifikat & ketersediaan_waktu, tambah lisensi & prestasi
-- Hapus tabel bobotroc (ROC dihapus, full AHP)

-- Hapus tabel bobotroc
DROP TABLE IF EXISTS "bobotroc";

-- Hapus kolom lama dari tabel pelatih
ALTER TABLE "pelatih" DROP COLUMN IF EXISTS "sertifikat";
ALTER TABLE "pelatih" DROP COLUMN IF EXISTS "ketersediaan_waktu";

-- Tambah kolom baru ke tabel pelatih (skala 1-5)
ALTER TABLE "pelatih" ADD COLUMN "lisensi" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "pelatih" ADD COLUMN "prestasi" INTEGER NOT NULL DEFAULT 1;

-- Hapus default setelah migrasi (kolom baru tidak lagi butuh default)
ALTER TABLE "pelatih" ALTER COLUMN "lisensi" DROP DEFAULT;
ALTER TABLE "pelatih" ALTER COLUMN "prestasi" DROP DEFAULT;
