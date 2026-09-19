const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// ==================================================
// GANTI PASSWORD SISWA
// PUT /api/ganti-password-siswa/:id
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
    // AMBIL PASSWORD AKUN SISWA
    // ==============================================
    const result = await db.query(
      `
      SELECT id, pemain_id, password
      FROM akun_siswa
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Akun siswa tidak ditemukan",
      });
    }

    const siswa = result.rows[0];

    // ==============================================
    // CEK PASSWORD LAMA
    // ==============================================
    const passwordCocok = await bcrypt.compare(
      password_lama,
      siswa.password
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
      UPDATE akun_siswa
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
      "ERROR GANTI PASSWORD SISWA:",
      err
    );

    res.status(500).json({
      message: "Gagal mengganti password",
      error: err.message,
    });
  }
});

module.exports = router;