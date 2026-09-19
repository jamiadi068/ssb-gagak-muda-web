const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==================================================
// GET KELOMPOK UMUR BERDASARKAN ID PELATIH
// ==================================================
router.get("/:pelatih_id", async (req, res) => {
  try {
    const { pelatih_id } = req.params;

    const result = await db.query(
      `
      SELECT kelompok_umur
      FROM pelatih_kelompok_umur
      WHERE pelatih_id = $1
      ORDER BY id ASC
      `,
      [pelatih_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("ERROR GET KELOMPOK UMUR:", err);

    res.status(500).json({
      message: "Gagal mengambil kelompok umur",
      error: err.message,
    });
  }
});


// ==================================================
// SIMPAN / UPDATE KELOMPOK UMUR PELATIH
// ==================================================
router.put("/:pelatih_id", async (req, res) => {
  try {
    const { pelatih_id } = req.params;
    const { kelompok_umur } = req.body;

    if (!Array.isArray(kelompok_umur)) {
      return res.status(400).json({
        message: "kelompok_umur harus berupa array",
      });
    }

    // Pastikan pelatih ada
    const cekPelatih = await db.query(
      "SELECT id FROM pelatih WHERE id = $1",
      [pelatih_id]
    );

    if (cekPelatih.rowCount === 0) {
      return res.status(404).json({
        message: "Pelatih tidak ditemukan",
      });
    }

    // Hapus kelompok umur lama
    await db.query(
      `
      DELETE FROM pelatih_kelompok_umur
      WHERE pelatih_id = $1
      `,
      [pelatih_id]
    );

    // Masukkan kelompok umur baru
    for (const umur of kelompok_umur) {
      await db.query(
        `
        INSERT INTO pelatih_kelompok_umur
        (pelatih_id, kelompok_umur)
        VALUES ($1, $2)
        ON CONFLICT (pelatih_id, kelompok_umur)
        DO NOTHING
        `,
        [pelatih_id, umur]
      );
    }

    res.json({
      message: "Kelompok umur berhasil diperbarui",
      kelompok_umur,
    });

  } catch (err) {
    console.error("ERROR UPDATE KELOMPOK UMUR:", err);

    res.status(500).json({
      message: "Gagal menyimpan kelompok umur",
      error: err.message,
    });
  }
});

module.exports = router;