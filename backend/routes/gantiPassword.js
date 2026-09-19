const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// ==================================================
// GANTI PASSWORD PELATIH
// PUT /api/ganti-password/:id
// ==================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password_lama, password_baru } = req.body;

    // ==============================================
    // VALIDASI INPUT
    // ==============================================
    if (!password_lama || !password_baru) {
      return res.status(400).json({
        message: "Password lama dan password baru wajib diisi",
      });
    }

    // ==============================================
    // VALIDASI PASSWORD BARU
    // ==============================================
    if (password_baru.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter",
      });
    }

    // ==============================================
    // AMBIL PASSWORD PELATIH
    // ==============================================
    const result = await db.query(
      `
      SELECT id, password
      FROM pelatih
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Pelatih tidak ditemukan",
      });
    }

    const pelatih = result.rows[0];

    // ==============================================
    // CEK PASSWORD LAMA
    // ==============================================
    const passwordCocok = await bcrypt.compare(
      password_lama,
      pelatih.password
    );

    if (!passwordCocok) {
      return res.status(400).json({
        message: "Password lama salah",
      });
    }

    // ==============================================
    // HASH PASSWORD BARU
    // ==============================================
    const hashedPassword = await bcrypt.hash(
      password_baru,
      10
    );

    // ==============================================
    // UPDATE PASSWORD
    // ==============================================
    await db.query(
      `
      UPDATE pelatih
      SET password = $1
      WHERE id = $2
      `,
      [hashedPassword, id]
    );

    // ==============================================
    // BERHASIL
    // ==============================================
    res.json({
      message: "Password berhasil diubah",
    });

  } catch (err) {
    console.error(
      "ERROR GANTI PASSWORD PELATIH:",
      err
    );

    res.status(500).json({
      message: "Gagal mengganti password",
      error: err.message,
    });
  }
});

module.exports = router;