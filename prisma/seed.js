model Pelatih {
  pelatih_id        Int      @id @default(autoincrement())
  nama              String
  cabor_id          Int
  user_id           Int?     @unique
  pengalaman        Int
  lisensi           Int
  prestasi          Int
  biaya             Int
  status_verifikasi String   @default("pending")
  created_at        DateTime @default(now())
  deskripsi          String?
  spesialis          String?
  domisili           String?
  pengalaman_melatih String?
  harga_min          Int?
  harga_max          Int?

  // Relasi
  cabang           CabangOlahraga     @relation(...)
  user             User?              @relation(...)
  jadwal           Jadwal[]           // ✅ SATU BARIS SAJA
  nilai            NilaiPelatih[]
  pemesanan        Pemesanan[]
  hasilRekomendasi HasilRekomendasi[]

  @@map("pelatih")
}