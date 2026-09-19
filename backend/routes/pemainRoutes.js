const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================
// MULTER CONFIG
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ======================
// GET ALL PEMAIN
// ======================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM pemain
      ORDER BY id ASC
      `
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET ALL PEMAIN ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil data pemain",
      error: err.message,
    });
  }
});

// ======================
// GET PEMAIN SAYA BERDASARKAN PELATIH
// HANYA PEMAIN AKTIF
//
// PRIORITAS:
// 1. pemain.pelatih_id
// 2. Sistem lama berdasarkan kelompok umur
// ======================
router.get("/pelatih/:pelatihId", async (req, res) => {
  try {
    const { pelatihId } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.*,
        pku.kelompok_umur AS kelompok_pelatih
      FROM pemain p

      LEFT JOIN pelatih_kelompok_umur pku
        ON REPLACE(UPPER(TRIM(p.kelompok_umur)), '-', '')
         = REPLACE(UPPER(TRIM(pku.kelompok_umur)), '-', '')
        AND pku.pelatih_id = $1

      WHERE
        LOWER(TRIM(p.status)) = 'aktif'
        AND (
          p.pelatih_id = $1

          OR (
            p.pelatih_id IS NULL
            AND pku.pelatih_id = $1
          )
        )

      ORDER BY p.nama ASC
      `,
      [pelatihId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET PEMAIN SAYA ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil pemain pelatih",
      error: err.message,
    });
  }
});

// ======================
// GET DETAIL PEMAIN
// ======================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM pemain
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Pemain tidak ditemukan",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("GET DETAIL ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil detail pemain",
      error: err.message,
    });
  }
});

// ======================
// UPDATE PEMAIN + FOTO
// ======================
router.put("/:id", upload.single("foto"), async (req, res) => {
  try {
    console.log("========== UPDATE PEMAIN ==========");

    const {
      nama,
      email,
      tempat_lahir,
      tanggal_lahir,
      asal_sekolah,
      alamat,
      no_hp,
    } = req.body;

    let result;

    // =========================
    // UPDATE + FOTO BARU
    // =========================
    if (req.file) {
      result = await pool.query(
        `
        UPDATE pemain
        SET
          nama = $1,
          email = $2,
          tempat_lahir = $3,
          tanggal_lahir = $4,
          asal_sekolah = $5,
          alamat = $6,
          no_hp = $7,
          foto_pemain = $8
        WHERE id = $9
        RETURNING *
        `,
        [
          nama,
          email,
          tempat_lahir,
          tanggal_lahir,
          asal_sekolah,
          alamat,
          no_hp,
          req.file.filename,
          req.params.id,
        ]
      );
    }

    // =========================
    // UPDATE TANPA FOTO
    // =========================
    else {
      result = await pool.query(
        `
        UPDATE pemain
        SET
          nama = $1,
          email = $2,
          tempat_lahir = $3,
          tanggal_lahir = $4,
          asal_sekolah = $5,
          alamat = $6,
          no_hp = $7
        WHERE id = $8
        RETURNING *
        `,
        [
          nama,
          email,
          tempat_lahir,
          tanggal_lahir,
          asal_sekolah,
          alamat,
          no_hp,
          req.params.id,
        ]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Pemain tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Data pemain berhasil diupdate",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      message: "Gagal mengupdate data pemain",
      error: err.message,
    });
  }
});

// ======================
// DELETE PEMAIN
// ======================
router.delete("/:id", async (req, res) => {
  try {
    // =========================
    // AMBIL DATA PEMAIN
    // =========================
    const data = await pool.query(
      `
      SELECT *
      FROM pemain
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (data.rows.length === 0) {
      return res.status(404).json({
        message: "Pemain tidak ditemukan di database",
      });
    }

    const pemain = data.rows[0];

    // =========================
    // HAPUS FILE FISIK
    // =========================
    const filesToDelete = [
      pemain.foto_pemain,
      pemain.dokumen,
    ];

    filesToDelete.forEach((fileName) => {
      if (!fileName) return;

      const filePath = path.join(
        process.cwd(),
        "uploads",
        fileName
      );

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);

          console.log(
            `Berhasil menghapus file: ${fileName}`
          );
        }
      } catch (fileError) {
        console.error(
          `Gagal menghapus file ${fileName}:`,
          fileError.message
        );
      }
    });

    // =========================
    // HAPUS DATA DATABASE
    // =========================
    await pool.query(
      "DELETE FROM pemain WHERE id = $1",
      [req.params.id]
    );

    res.status(200).json({
      message: "Pemain berhasil dihapus",
    });
  } catch (err) {
    console.error("DELETE ROUTE ERROR:", err);

    res.status(500).json({
      message:
        "Gagal menghapus data: " + err.message,
    });
  }
});

// ======================
// PINDAHKAN PEMAIN KE PELATIH
// KHUSUS SUPERADMIN
// ======================
router.put("/:id/pindahkan", async (req, res) => {
  try {
    const { id } = req.params;
    const { pelatih_id } = req.body;

    // =========================
    // VALIDASI PELATIH
    // =========================
    if (!pelatih_id) {
      return res.status(400).json({
        message: "Pelatih tujuan wajib dipilih",
      });
    }

    // =========================
    // CEK PEMAIN
    // =========================
    const pemainCheck = await pool.query(
      `
      SELECT
        id,
        nama,
        kelompok_umur,
        pelatih_id
      FROM pemain
      WHERE id = $1
      `,
      [id]
    );

    if (pemainCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Pemain tidak ditemukan",
      });
    }

    // =========================
    // CEK PELATIH
    // =========================
    const pelatihCheck = await pool.query(
      `
      SELECT
        id,
        nama
      FROM pelatih
      WHERE id = $1
      `,
      [pelatih_id]
    );

    if (pelatihCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Pelatih tujuan tidak ditemukan",
      });
    }

    // =========================
    // PINDAHKAN PEMAIN
    //
    // kelompok_umur TIDAK DIUBAH
    // =========================
    const result = await pool.query(
      `
      UPDATE pemain
      SET pelatih_id = $1
      WHERE id = $2
      RETURNING *
      `,
      [pelatih_id, id]
    );

    res.status(200).json({
      message: "Pemain berhasil dipindahkan",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("PINDAH PEMAIN ERROR:", err);

    res.status(500).json({
      message: "Gagal memindahkan pemain",
      error: err.message,
    });
  }
});

module.exports = router;