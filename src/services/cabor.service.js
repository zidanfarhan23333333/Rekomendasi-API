const prisma = require("../config/database");

/**
 * Mengambil semua cabang olahraga
 * @returns {Promise<Array>} Array of cabang olahraga
 */
exports.getAllCabor = async () => {
  try {
    const cabors = await prisma.cabangOlahraga.findMany({
      orderBy: {
        cabor_id: "asc",
      },
    });
    return cabors;
  } catch (error) {
    console.error("Error di service getAllCabor:", error);
    throw error;
  }
};

/**
 * Mengambil cabang olahraga berdasarkan ID
 * @param {number} caborId - ID cabang olahraga
 * @returns {Promise<Object|null>} Cabang olahraga atau null jika tidak ditemukan
 */
exports.getCaborById = async (caborId) => {
  try {
    const cabor = await prisma.cabangOlahraga.findUnique({
      where: {
        cabor_id: caborId,
      },
    });
    return cabor;
  } catch (error) {
    console.error("Error di service getCaborById:", error);
    throw error;
  }
};

/**
 * Menambah cabang olahraga baru
 * @param {string} namaCabor - Nama cabang olahraga
 * @returns {Promise<Object>} Cabang olahraga yang baru dibuat
 */
exports.createCabor = async (namaCabor) => {
  try {
    const newCabor = await prisma.cabangOlahraga.create({
      data: {
        nama_cabor: namaCabor,
      },
    });
    return newCabor;
  } catch (error) {
    console.error("Error di service createCabor:", error);
    throw error;
  }
};

/**
 * Mengupdate cabang olahraga
 * @param {number} caborId - ID cabang olahraga
 * @param {string} namaCabor - Nama cabang olahraga baru
 * @returns {Promise<Object|null>} Cabang olahraga yang diupdate atau null jika tidak ditemukan
 */
exports.updateCabor = async (caborId, namaCabor) => {
  try {
    // Cek apakah cabor ada
    const existingCabor = await prisma.cabangOlahraga.findUnique({
      where: {
        cabor_id: caborId,
      },
    });

    if (!existingCabor) {
      return null;
    }

    // Update cabor
    const updatedCabor = await prisma.cabangOlahraga.update({
      where: {
        cabor_id: caborId,
      },
      data: {
        nama_cabor: namaCabor,
      },
    });

    return updatedCabor;
  } catch (error) {
    console.error("Error di service updateCabor:", error);
    throw error;
  }
};

/**
 * Menghapus cabang olahraga
 * @param {number} caborId - ID cabang olahraga
 * @returns {Promise<Object>} Object dengan status penghapusan
 */
exports.deleteCabor = async (caborId) => {
  try {
    // Cek apakah cabor ada dengan include relasi untuk pengecekan
    const existingCabor = await prisma.cabangOlahraga.findUnique({
      where: {
        cabor_id: caborId,
      },
      include: {
        pelatih: true,
        pemesanan: true,
      },
    });

    if (!existingCabor) {
      return { error: "NOT_FOUND" };
    }

    // Cek apakah cabor masih digunakan oleh pelatih
    if (existingCabor.pelatih && existingCabor.pelatih.length > 0) {
      return {
        error: "IN_USE",
        detail: `Cabang olahraga masih digunakan oleh ${existingCabor.pelatih.length} pelatih`,
      };
    }

    // Cek apakah cabor masih digunakan dalam pemesanan
    if (existingCabor.pemesanan && existingCabor.pemesanan.length > 0) {
      return {
        error: "IN_USE",
        detail: `Cabang olahraga masih digunakan dalam ${existingCabor.pemesanan.length} pemesanan`,
      };
    }

    // Hapus cabor jika tidak ada relasi
    await prisma.cabangOlahraga.delete({
      where: {
        cabor_id: caborId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error di service deleteCabor:", error);
    throw error;
  }
};
