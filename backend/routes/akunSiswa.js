const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

// ==================================================
// BUAT AKUN SISWA
// ADMIN MEMBUAT AKUN DARI PEMAIN YANG SUDAH AKTIF
// ==================================================
router.post("/", async (req, res) => {
  try {
    const { pemain_id, email, password } = req.body;

    // =========================
    // VALIDASI INPUT
    // =========================
    if (!pemain_id || !email || !password) {
      return res.status(400).json({
        message: "Pemain, email, dan password wajib diisi",
      });
    }

    // =========================
    // CEK PEMAIN
    // =========================
    const pemainResult = await db.query(
      `
      SELECT id, nama, email, status
      FROM pemain
      WHERE id = $1
      `,
      [pemain_id]
    );

    if (pemainResult.rows.length === 0) {
      return res.status(404).json({
        message: "Pemain tidak ditemukan",
      });
    }

    const pemain = pemainResult.rows[0];

    // =========================
    // HANYA PEMAIN AKTIF
    // =========================
    if (
      !pemain.status ||
      pemain.status.toLowerCase().trim() !== "aktif"
    ) {
      return res.status(400).json({
        message: "Akun hanya dapat dibuat untuk pemain yang aktif",
      });
    }

    // =========================
    // CEK APAKAH SUDAH PUNYA AKUN
    // =========================
    const akunResult = await db.query(
      `
      SELECT id
      FROM akun_siswa
      WHERE pemain_id = $1
      `,
      [pemain_id]
    );

    if (akunResult.rows.length > 0) {
      return res.status(400).json({
        message: "Pemain ini sudah memiliki akun siswa",
      });
    }

    // =========================
    // CEK EMAIL
    // =========================
    const emailResult = await db.query(
      `
      SELECT id
      FROM akun_siswa
      WHERE LOWER(email) = LOWER($1)
      `,
      [email]
    );

    if (emailResult.rows.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    // =========================
    // HASH PASSWORD
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // SIMPAN AKUN SISWA
    // =========================
    const result = await db.query(
      `
      INSERT INTO akun_siswa
        (pemain_id, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        id,
        pemain_id,
        email,
        created_at
      `,
      [pemain_id, email, hashedPassword]
    );

    // =========================
    // BERHASIL
    // =========================
    return res.status(201).json({
      message: "Akun siswa berhasil dibuat",
      akun: {
        id: result.rows[0].id,
        pemain_id: result.rows[0].pemain_id,
        email: result.rows[0].email,
        nama: pemain.nama,
        created_at: result.rows[0].created_at,
      },
    });

  } catch (err) {
    console.error("BUAT AKUN SISWA ERROR:", err);

    return res.status(500).json({
      message: "Gagal membuat akun siswa",
      error: err.message,
    });
  }
});

// ==================================================
// GET PEMAIN AKTIF YANG BELUM MEMILIKI AKUN SISWA
// ==================================================
router.get("/pemain-belum-akun", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        p.id,
        p.nama,
        p.email,
        p.status,
        p.kelompok_umur,
        p.pelatih_id
      FROM pemain p
      LEFT JOIN akun_siswa a
        ON a.pemain_id = p.id
      WHERE
        LOWER(TRIM(p.status)) = 'aktif'
        AND a.id IS NULL
      ORDER BY p.nama ASC
      `
    );

    res.status(200).json(result.rows);

  } catch (err) {
    console.error(
      "GET PEMAIN BELUM PUNYA AKUN ERROR:",
      err
    );

    res.status(500).json({
      message: "Gagal mengambil pemain yang belum memiliki akun",
      error: err.message,
    });
  }
});

module.exports = router;