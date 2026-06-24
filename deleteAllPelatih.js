const p = require("./src/config/database");

async function clean() {
  try {
    const r1 = await p.hasilRekomendasi.deleteMany();
    console.log("✅ hasilRekomendasi deleted:", r1.count);

    const r2 = await p.pemesanan.deleteMany();
    console.log("✅ pemesanan deleted:", r2.count);

    const r3 = await p.nilaiPelatih.deleteMany();
    console.log("✅ nilaiPelatih deleted:", r3.count);

    const r4 = await p.jadwal.deleteMany();
    console.log("✅ jadwal deleted:", r4.count);

    const r5 = await p.pelatih.deleteMany();
    console.log("✅ pelatih deleted:", r5.count);

    console.log("🎉 Semua data pelatih berhasil dihapus!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await p.$disconnect();
  }
}

clean();
