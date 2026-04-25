# Sistem Rekomendasi Pelatih — API Documentation

API Backend untuk Sistem Rekomendasi Pelatih Olahraga menggunakan metode **AHP (Analytical Hierarchy Process)**. Sistem ini membantu memilih pelatih terbaik berdasarkan empat kriteria: Pengalaman, Lisensi, Prestasi, dan Biaya.

---

## Daftar Isi

- [Instalasi & Setup](#instalasi--setup)
- [Environment Variables](#environment-variables)
- [Menjalankan Server](#menjalankan-server)
- [Skala Penilaian Kriteria](#skala-penilaian-kriteria)
- [Alur Metode AHP](#alur-metode-ahp)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [Pelatih](#pelatih)
  - [AHP](#ahp-analytical-hierarchy-process)
  - [Rekomendasi](#rekomendasi)
- [Error Handling](#error-handling)
- [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)

---

## Instalasi & Setup

### Prerequisites
- Node.js v18 atau lebih tinggi
- PostgreSQL
- npm

### Langkah Instalasi

**1. Clone repository**
```bash
git clone <repository-url>
cd sistem-rekomendasi-pelatih
```

**2. Install dependencies**
```bash
npm install
```

**3. Buat file `.env`** (lihat bagian [Environment Variables](#environment-variables))

**4. Jalankan migrasi database**
```bash
npx prisma migrate deploy
npx prisma generate
```

---

## Environment Variables

Buat file `.env` di root project:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/nama_database?schema=public
```

| Variable | Keterangan | Contoh |
|---|---|---|
| `PORT` | Port server (default: 3000) | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:secret@localhost:5432/rekomendasi_db` |

---

## Menjalankan Server

```bash
# Development (auto-restart dengan nodemon)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:3000`

---

## Skala Penilaian Kriteria

Semua nilai kriteria menggunakan **skala integer 1–5**. Nilai dikirim saat membuat atau memperbarui data pelatih.

### C1 — Pengalaman

| Nilai | Keterangan |
|---|---|
| `1` | < 1 Tahun |
| `2` | 1–2 Tahun |
| `3` | 3–4 Tahun |
| `4` | 5–6 Tahun |
| `5` | > 6 Tahun |

### C2 — Lisensi

| Nilai | Keterangan |
|---|---|
| `1` | Tidak memiliki lisensi |
| `2` | Sertifikat pelatihan non-resmi |
| `3` | Lisensi dasar |
| `4` | Lisensi tingkat menengah |
| `5` | Lisensi tingkat lanjutan / nasional |

### C3 — Prestasi

| Nilai | Keterangan |
|---|---|
| `1` | Tidak memiliki prestasi |
| `2` | Prestasi tingkat lokal |
| `3` | Prestasi tingkat kabupaten / kota |
| `4` | Prestasi tingkat provinsi |
| `5` | Prestasi tingkat nasional / internasional |

### C4 — Biaya *(cost criteria — semakin kecil semakin mahal)*

| Nilai | Keterangan |
|---|---|
| `5` | Sangat terjangkau |
| `4` | Terjangkau |
| `3` | Sedang |
| `2` | Mahal |
| `1` | Sangat mahal |

> **Catatan:** Biaya adalah *cost criteria*. Nilai `5` berarti biaya sangat terjangkau (lebih baik). Normalisasi dilakukan dengan formula `(max - val) / range` sehingga pelatih dengan biaya terjangkau mendapat skor normalisasi lebih tinggi.

---

## Alur Metode AHP

Sistem menggunakan AHP untuk menentukan bobot setiap kriteria, kemudian menghitung skor akhir setiap pelatih.

```
Matriks Perbandingan Berpasangan (4×4)
            ↓
Hitung Geometric Mean per baris
            ↓
Normalisasi → Bobot AHP (w₁, w₂, w₃, w₄)
            ↓
Uji Konsistensi: λ_max → CI → CR
  CR ≤ 0.1 → Konsisten ✓
            ↓
Normalisasi nilai pelatih (min-max per kriteria)
  benefit: (val - min) / range
  cost:    (max - val) / range
            ↓
Skor Akhir = Σ (nilai_normalisasi[i] × bobot_AHP[i])
            ↓
Perankingan pelatih (skor tertinggi = peringkat 1)
```

### Matriks Perbandingan Berpasangan

|  | C1 Pengalaman | C2 Lisensi | C3 Prestasi | C4 Biaya |
|---|---|---|---|---|
| **C1 Pengalaman** | 1 | 3 | 5 | 7 |
| **C2 Lisensi** | 1/3 | 1 | 4 | 3 |
| **C3 Prestasi** | 1/5 | 1/4 | 1 | 1/2 |
| **C4 Biaya** | 1/7 | 1/3 | 2 | 1 |

> Nilai di atas berdasarkan wawancara dengan pengurus UKM Olahraga UNIMMA.

---

## API Endpoints

**Base URL:** `http://localhost:3000/api`

---

### Health Check

#### `GET /api/health`

Mengecek status server.

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-25T10:30:00.000Z"
}
```

---

### Pelatih

#### `GET /api/pelatih`

Mendapatkan semua data pelatih.

**Query Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `cabor_id` | integer | Tidak | Filter berdasarkan cabang olahraga |

**Response `200`:**
```json
{
  "pelatih": [
    {
      "pelatih_id": 1,
      "nama": "Budi Santoso",
      "cabor_id": 1,
      "pengalaman": 4,
      "lisensi": 3,
      "prestasi": 3,
      "biaya": 4,
      "status_verifikasi": "terverifikasi",
      "created_at": "2026-04-20T08:00:00.000Z",
      "cabang": {
        "nama_cabor": "Futsal"
      }
    }
  ]
}
```

---

#### `GET /api/pelatih/:id`

Mendapatkan detail satu pelatih berdasarkan ID.

**Path Parameter:** `id` — integer, ID pelatih

**Response `200`:**
```json
{
  "pelatih": {
    "pelatih_id": 1,
    "nama": "Budi Santoso",
    "cabor_id": 1,
    "pengalaman": 4,
    "lisensi": 3,
    "prestasi": 3,
    "biaya": 4,
    "status_verifikasi": "terverifikasi",
    "created_at": "2026-04-20T08:00:00.000Z",
    "cabang": {
      "nama_cabor": "Futsal"
    }
  }
}
```

**Response `404`:**
```json
{
  "error": "Pelatih dengan id 99 tidak ditemukan"
}
```

---

#### `POST /api/pelatih`

Mendaftarkan pelatih baru. Status verifikasi otomatis `pending`.

**Request Body:**
```json
{
  "nama": "Budi Santoso",
  "cabor_id": 1,
  "pengalaman": 4,
  "lisensi": 3,
  "prestasi": 3,
  "biaya": 4
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `nama` | string | Ya | Nama lengkap pelatih |
| `cabor_id` | integer | Ya | ID cabang olahraga |
| `pengalaman` | integer 1–5 | Ya | Lihat [Skala C1](#c1--pengalaman) |
| `lisensi` | integer 1–5 | Ya | Lihat [Skala C2](#c2--lisensi) |
| `prestasi` | integer 1–5 | Ya | Lihat [Skala C3](#c3--prestasi) |
| `biaya` | integer 1–5 | Ya | Lihat [Skala C4](#c4--biaya-cost-criteria--semakin-kecil-semakin-mahal) |

**Response `201`:**
```json
{
  "pelatih": {
    "pelatih_id": 2,
    "nama": "Budi Santoso",
    "cabor_id": 1,
    "pengalaman": 4,
    "lisensi": 3,
    "prestasi": 3,
    "biaya": 4,
    "status_verifikasi": "pending",
    "created_at": "2026-04-25T10:00:00.000Z",
    "cabang": {
      "nama_cabor": "Futsal"
    }
  }
}
```

**Response `400` — Validasi gagal:**
```json
{
  "error": "lisensi wajib dan harus angka bulat 1-5"
}
```

**Response `404` — Cabang tidak ditemukan:**
```json
{
  "error": "Cabang olahraga dengan id 99 tidak ditemukan"
}
```

---

#### `PUT /api/pelatih/:id`

Memperbarui seluruh data pelatih.

**Path Parameter:** `id` — integer, ID pelatih

**Request Body:** sama seperti `POST /api/pelatih`

**Response `200`:**
```json
{
  "pelatih": {
    "pelatih_id": 1,
    "nama": "Budi Santoso Updated",
    "cabor_id": 1,
    "pengalaman": 5,
    "lisensi": 4,
    "prestasi": 4,
    "biaya": 3,
    "status_verifikasi": "terverifikasi",
    "cabang": {
      "nama_cabor": "Futsal"
    }
  }
}
```

---

#### `DELETE /api/pelatih/:id`

Menghapus data pelatih.

**Path Parameter:** `id` — integer, ID pelatih

**Response `200`:**
```json
{
  "pelatih_id": 1
}
```

---

#### `PATCH /api/pelatih/:id/verifikasi`

Memperbarui status verifikasi pelatih.

**Path Parameter:** `id` — integer, ID pelatih

**Request Body:**
```json
{
  "status": "terverifikasi"
}
```

| Nilai `status` | Keterangan |
|---|---|
| `pending` | Menunggu verifikasi (default saat daftar) |
| `terverifikasi` | Pelatih disetujui, bisa masuk rekomendasi |
| `ditolak` | Pelatih ditolak |

**Response `200`:**
```json
{
  "pelatih": {
    "pelatih_id": 1,
    "nama": "Budi Santoso",
    "status_verifikasi": "terverifikasi",
    "cabang": {
      "nama_cabor": "Futsal"
    }
  }
}
```

**Response `400`:**
```json
{
  "error": "status harus salah satu dari: pending, terverifikasi, ditolak"
}
```

---

### AHP (Analytical Hierarchy Process)

#### `GET /api/ahp/bobot`

Menampilkan bobot setiap kriteria hasil perhitungan AHP.

**Response `200`:**
```json
{
  "kriteria": [
    { "kode": "C1", "nama": "Pengalaman", "tipe": "benefit", "bobot": 0.5571 },
    { "kode": "C2", "nama": "Lisensi",    "tipe": "benefit", "bobot": 0.2633 },
    { "kode": "C3", "nama": "Prestasi",   "tipe": "benefit", "bobot": 0.0714 },
    { "kode": "C4", "nama": "Biaya",      "tipe": "cost",    "bobot": 0.1082 }
  ],
  "jumlahBobot": 1.0
}
```

---

#### `GET /api/ahp/konsistensi`

Menampilkan hasil uji konsistensi matriks perbandingan berpasangan.

**Response `200`:**
```json
{
  "lambdaMax": 4.1215,
  "CI": 0.0405,
  "CR": 0.045,
  "konsistensi": "konsisten"
}
```

| Field | Keterangan |
|---|---|
| `lambdaMax` | Nilai eigen maksimum (λ_max) |
| `CI` | Consistency Index = (λ_max − n) / (n − 1) |
| `CR` | Consistency Ratio = CI / RI |
| `konsistensi` | `"konsisten"` jika CR ≤ 0.1, `"tidak konsisten"` jika CR > 0.1 |

---

#### `GET /api/ahp/peringkat`

Menampilkan kriteria diurutkan dari bobot tertinggi ke terendah (prioritas kriteria).

**Response `200`:**
```json
{
  "peringkat": [
    { "urutan": 1, "kode": "C1", "nama": "Pengalaman", "tipe": "benefit", "bobot": 0.5571 },
    { "urutan": 2, "kode": "C2", "nama": "Lisensi",    "tipe": "benefit", "bobot": 0.2633 },
    { "urutan": 3, "kode": "C4", "nama": "Biaya",      "tipe": "cost",    "bobot": 0.1082 },
    { "urutan": 4, "kode": "C3", "nama": "Prestasi",   "tipe": "benefit", "bobot": 0.0714 }
  ]
}
```

---

### Rekomendasi

#### `POST /api/rekomendasi`

Menghitung dan menyimpan rekomendasi pelatih untuk satu cabang olahraga. Hanya pelatih dengan `status_verifikasi = "terverifikasi"` yang masuk perhitungan.

**Request Body:**
```json
{
  "cabor_id": 1,
  "user_id": 2
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `cabor_id` | integer | Ya | ID cabang olahraga |
| `user_id` | integer | Ya | ID user yang meminta rekomendasi |

**Response `200`:**
```json
{
  "meta": {
    "ahp": {
      "kriteria": [
        { "kode": "C1", "nama": "Pengalaman", "tipe": "benefit", "bobot": 0.5571 },
        { "kode": "C2", "nama": "Lisensi",    "tipe": "benefit", "bobot": 0.2633 },
        { "kode": "C3", "nama": "Prestasi",   "tipe": "benefit", "bobot": 0.0714 },
        { "kode": "C4", "nama": "Biaya",      "tipe": "cost",    "bobot": 0.1082 }
      ],
      "CR": 0.045,
      "konsistensi": "konsisten"
    }
  },
  "rekomendasi": [
    { "peringkat": 1, "pelatih_id": 3, "nama_pelatih": "Andi Wijaya",   "skor_akhir": 0.8712 },
    { "peringkat": 2, "pelatih_id": 1, "nama_pelatih": "Budi Santoso",  "skor_akhir": 0.6430 },
    { "peringkat": 3, "pelatih_id": 2, "nama_pelatih": "Citra Dewi",    "skor_akhir": 0.4215 }
  ]
}
```

**Response `400` — Parameter kurang:**
```json
{
  "error": "cabor_id dan user_id diperlukan"
}
```

**Response `404` — Tidak ada pelatih terverifikasi:**
```json
{
  "error": "Tidak ada pelatih terverifikasi di cabang ini"
}
```

> **Catatan:** Setiap pemanggilan endpoint ini menyimpan hasil ke tabel `hasilrekomendasi`. Riwayat dapat diambil melalui endpoint riwayat di bawah.

---

#### `GET /api/rekomendasi/riwayat/:id`

Mengambil riwayat semua rekomendasi yang pernah dibuat untuk satu user, diurutkan dari terbaru.

**Path Parameter:** `id` — integer, ID user

**Response `200`:**
```json
{
  "riwayat": [
    {
      "rekomendasi_id": 5,
      "user_id": 2,
      "pelatih_id": 3,
      "skor_akhir": 0.8712,
      "peringkat": 1,
      "tanggal": "2026-04-25T10:00:00.000Z",
      "pelatih": {
        "nama": "Andi Wijaya",
        "cabor_id": 1
      }
    },
    {
      "rekomendasi_id": 4,
      "user_id": 2,
      "pelatih_id": 1,
      "skor_akhir": 0.6430,
      "peringkat": 2,
      "tanggal": "2026-04-25T10:00:00.000Z",
      "pelatih": {
        "nama": "Budi Santoso",
        "cabor_id": 1
      }
    }
  ]
}
```

---

## Error Handling

### HTTP Status Codes

| Kode | Situasi |
|---|---|
| `200` | Request berhasil |
| `201` | Resource berhasil dibuat |
| `400` | Request tidak valid (validasi gagal, parameter salah tipe) |
| `404` | Resource tidak ditemukan |
| `500` | Kesalahan server internal |

### Format Error

Semua error mengembalikan objek JSON dengan field `error`:

```json
{
  "error": "Pesan error yang menjelaskan masalahnya"
}
```

### Contoh Error per Endpoint

| Endpoint | Kondisi | Status | Pesan |
|---|---|---|---|
| `GET /api/pelatih/:id` | ID bukan angka | `400` | `"id harus angka"` |
| `GET /api/pelatih/:id` | ID tidak ada | `404` | `"Pelatih dengan id X tidak ditemukan"` |
| `POST /api/pelatih` | Field kurang / salah tipe | `400` | `"lisensi wajib dan harus angka bulat 1-5"` |
| `POST /api/pelatih` | cabor_id tidak ada | `404` | `"Cabang olahraga dengan id X tidak ditemukan"` |
| `PATCH /pelatih/:id/verifikasi` | status tidak valid | `400` | `"status harus salah satu dari: ..."` |
| `POST /api/rekomendasi` | Parameter kurang | `400` | `"cabor_id dan user_id diperlukan"` |
| `POST /api/rekomendasi` | Tidak ada pelatih | `404` | `"Tidak ada pelatih terverifikasi di cabang ini"` |

---

## Database Schema

### Tabel `pelatih`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `pelatih_id` | INT PK | Auto-increment |
| `nama` | VARCHAR | Nama pelatih |
| `cabor_id` | INT FK | Referensi ke `cabangolahraga` |
| `pengalaman` | INT | Skala 1–5 |
| `lisensi` | INT | Skala 1–5 |
| `prestasi` | INT | Skala 1–5 |
| `biaya` | INT | Skala 1–5 (cost) |
| `status_verifikasi` | VARCHAR | `pending` / `terverifikasi` / `ditolak` |
| `created_at` | TIMESTAMP | Default now() |

### Tabel `kriteria`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `kriteria_id` | INT PK | Auto-increment |
| `kode` | VARCHAR UNIQUE | C1, C2, C3, C4 |
| `nama_kriteria` | VARCHAR | Nama kriteria |
| `tipe` | VARCHAR | `benefit` atau `cost` |

### Tabel `hasilrekomendasi`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `rekomendasi_id` | INT PK | Auto-increment |
| `user_id` | INT FK | Referensi ke `user` |
| `pelatih_id` | INT FK | Referensi ke `pelatih` |
| `skor_akhir` | FLOAT | Skor hasil perhitungan AHP (0–1) |
| `peringkat` | INT | Urutan dari skor tertinggi |
| `tanggal` | TIMESTAMP | Default now() |

### Tabel Lainnya

| Tabel | Keterangan |
|---|---|
| `user` | Data pengguna sistem (role: admin / user) |
| `cabangolahraga` | Daftar cabang olahraga |
| `nilaipelatih` | Nilai pelatih per kriteria (opsional, untuk referensi DB) |
| `pemesanan` | Data pemesanan jasa pelatih |

---

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | PostgreSQL |
| ORM | Prisma v7 |
| Metode DSS | AHP (Analytical Hierarchy Process) |
