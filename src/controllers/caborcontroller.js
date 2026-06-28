const caborService = require("../services/cabor.service");

exports.getAllCabor = async (req, res) => {
  try {
    const cabors = await caborService.getAllCabor();

    return res.status(200).json({
      success: true,
      message: "Data cabang olahraga berhasil diambil",
      data: cabors,
    });
  } catch (error) {
    console.error("Error di getAllCabor:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data cabang olahraga",
      data: null,
    });
  }
};

/**
 * GET /api/cabor/:id
 * Mengambil detail cabang olahraga berdasarkan ID
 */
exports.getCaborById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID harus berupa angka
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID cabang olahraga harus berupa angka",
        data: null,
      });
    }

    const cabor = await caborService.getCaborById(parseInt(id));

    if (!cabor) {
      return res.status(404).json({
        success: false,
        message: "Cabang olahraga tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data cabang olahraga berhasil diambil",
      data: cabor,
    });
  } catch (error) {
    console.error("Error di getCaborById:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data cabang olahraga",
      data: null,
    });
  }
};

/**
 * POST /api/cabor
 * Menambah cabang olahraga baru
 */
exports.createCabor = async (req, res) => {
  try {
    const { nama_cabor } = req.body;

    // Validasi: nama_cabor wajib diisi
    if (!nama_cabor || nama_cabor.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nama cabang olahraga wajib diisi",
        data: null,
      });
    }

    // Validasi: nama_cabor tidak boleh terlalu pendek
    if (nama_cabor.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Nama cabang olahraga minimal 3 karakter",
        data: null,
      });
    }

    const newCabor = await caborService.createCabor(nama_cabor.trim());

    return res.status(201).json({
      success: true,
      message: "Cabang olahraga berhasil ditambahkan",
      data: newCabor,
    });
  } catch (error) {
    console.error("Error di createCabor:", error);

    // Handle error nama cabor sudah ada (jika ada unique constraint)
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Nama cabang olahraga sudah terdaftar",
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambah cabang olahraga",
      data: null,
    });
  }
};

/**
 * PUT /api/cabor/:id
 * Mengupdate cabang olahraga
 */
exports.updateCabor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_cabor } = req.body;

    // Validasi ID harus berupa angka
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID cabang olahraga harus berupa angka",
        data: null,
      });
    }

    // Validasi: nama_cabor wajib diisi
    if (!nama_cabor || nama_cabor.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nama cabang olahraga wajib diisi",
        data: null,
      });
    }

    // Validasi: nama_cabor tidak boleh terlalu pendek
    if (nama_cabor.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Nama cabang olahraga minimal 3 karakter",
        data: null,
      });
    }

    const updatedCabor = await caborService.updateCabor(
      parseInt(id),
      nama_cabor.trim(),
    );

    if (!updatedCabor) {
      return res.status(404).json({
        success: false,
        message: "Cabang olahraga tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cabang olahraga berhasil diupdate",
      data: updatedCabor,
    });
  } catch (error) {
    console.error("Error di updateCabor:", error);

    // Handle error nama cabor sudah ada (jika ada unique constraint)
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Nama cabang olahraga sudah terdaftar",
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate cabang olahraga",
      data: null,
    });
  }
};

/**
 * DELETE /api/cabor/:id
 * Menghapus cabang olahraga
 */
exports.deleteCabor = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID harus berupa angka
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID cabang olahraga harus berupa angka",
        data: null,
      });
    }

    const result = await caborService.deleteCabor(parseInt(id));

    if (result.error === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Cabang olahraga tidak ditemukan",
        data: null,
      });
    }

    if (result.error === "IN_USE") {
      return res.status(409).json({
        success: false,
        message:
          result.detail ||
          "Cabang olahraga tidak dapat dihapus karena masih digunakan",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cabang olahraga berhasil dihapus",
      data: null,
    });
  } catch (error) {
    console.error("Error di deleteCabor:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus cabang olahraga",
      data: null,
    });
  }
};
