const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================================================
// 📁 FOLDER UPLOAD MATERI
// ==================================================

const uploadDir = path.join(__dirname, "../uploads/materi");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ==================================================
// ⚙️ KONFIGURASI MULTER
// ==================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const namaFile = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    cb(
      null,
      `${Date.now()}-${namaFile}${ext}`
    );
  },
});

// ==================================================
// 🔐 VALIDASI FILE
// PDF / JPG / JPEG
// ==================================================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
  ];

  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
  ];

  const ext = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak diperbolehkan. Hanya PDF, JPG, dan JPEG."
      )
    );
  }
};

// ==================================================
// 📦 MULTER
// Maksimal 10 MB
// ==================================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ==================================================
// 📥 GET MATERI BERDASARKAN ID
// ==================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        materi.*,
        pelatih.nama AS nama_pelatih,
        pelatih.lisensi
      FROM materi
      LEFT JOIN pelatih
        ON materi.pelatih_id = pelatih.id
      WHERE materi.id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Materi tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(
      "❌ GET MATERI BY ID ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==================================================
// 📥 GET ALL MATERI
// ==================================================

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        materi.*,
        pelatih.nama AS nama_pelatih,
        pelatih.lisensi
      FROM materi
      LEFT JOIN pelatih 
        ON materi.pelatih_id = pelatih.id
      ORDER BY materi.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(
      "❌ GET MATERI ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==================================================
// 📤 POST MATERI + UPLOAD FILE
// ==================================================

router.post(
  "/",
  upload.single("file_materi"),
  async (req, res) => {
    try {
      const {
        judul,
        kategori,
        tanggal,
        pelatih_id,
        durasi,
        lokasi,
        deskripsi,
      } = req.body;

      // Validasi field wajib
      if (
        !judul ||
        !kategori ||
        !tanggal ||
        !pelatih_id
      ) {
        return res.status(400).json({
          error: "Field wajib belum lengkap",
        });
      }

      // Cek pelatih
      const cekPelatih = await db.query(
        "SELECT id FROM pelatih WHERE id = $1",
        [pelatih_id]
      );

      if (cekPelatih.rowCount === 0) {
        return res.status(400).json({
          error:
            "Pelatih tidak valid / tidak ditemukan",
        });
      }

      // Path file
      let fileMateri = null;

      if (req.file) {
        fileMateri =
          `/uploads/materi/${req.file.filename}`;
      }

      // Simpan materi
      const result = await db.query(
        `
        INSERT INTO materi
        (
          judul,
          kategori,
          tanggal,
          pelatih_id,
          durasi,
          lokasi,
          deskripsi,
          file_materi
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          judul,
          kategori,
          tanggal,
          pelatih_id,
          durasi,
          lokasi,
          deskripsi,
          fileMateri,
        ]
      );

      res.json({
        message:
          "Materi berhasil ditambahkan",
        data: result.rows[0],
      });
    } catch (err) {
      console.error(
        "❌ POST MATERI ERROR:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ==================================================
// ✏️ PUT UPDATE MATERI
// ==================================================

router.put(
  "/:id",
  upload.single("file_materi"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        judul,
        kategori,
        tanggal,
        pelatih_id,
        durasi,
        lokasi,
        deskripsi,
      } = req.body;

      if (
        !judul ||
        !kategori ||
        !tanggal ||
        !pelatih_id
      ) {
        return res.status(400).json({
          error:
            "Field wajib tidak boleh kosong",
        });
      }

      // Cek pelatih
      const cekPelatih = await db.query(
        "SELECT id FROM pelatih WHERE id = $1",
        [pelatih_id]
      );

      if (cekPelatih.rowCount === 0) {
        return res.status(400).json({
          error: "Pelatih tidak valid",
        });
      }

      // Ambil file lama
      const materiLama = await db.query(
        "SELECT file_materi FROM materi WHERE id = $1",
        [id]
      );

      if (materiLama.rowCount === 0) {
        return res.status(404).json({
          message: "Materi tidak ditemukan",
        });
      }

      let fileMateri =
        materiLama.rows[0].file_materi;

      // Kalau upload file baru
      if (req.file) {
        fileMateri =
          `/uploads/materi/${req.file.filename}`;
      }

      const result = await db.query(
        `
        UPDATE materi
        SET
          judul = $1,
          kategori = $2,
          tanggal = $3,
          pelatih_id = $4,
          durasi = $5,
          lokasi = $6,
          deskripsi = $7,
          file_materi = $8
        WHERE id = $9
        RETURNING *
        `,
        [
          judul,
          kategori,
          tanggal,
          pelatih_id,
          durasi,
          lokasi,
          deskripsi,
          fileMateri,
          id,
        ]
      );

      res.json({
        message:
          "Materi berhasil diperbarui",
        data: result.rows[0],
      });
    } catch (err) {
      console.error(
        "❌ UPDATE MATERI ERROR:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ==================================================
// 🗑️ DELETE MATERI
// ==================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil file
    const materi = await db.query(
      "SELECT file_materi FROM materi WHERE id = $1",
      [id]
    );

    if (materi.rowCount === 0) {
      return res.status(404).json({
        message: "Materi tidak ditemukan",
      });
    }

    const fileMateri =
      materi.rows[0].file_materi;

    // Hapus database
    await db.query(
      "DELETE FROM materi WHERE id = $1",
      [id]
    );

    // Hapus file fisik
    if (fileMateri) {
      const filePath = path.join(
        __dirname,
        "..",
        fileMateri
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      message: "Materi berhasil dihapus",
    });
  } catch (err) {
    console.error(
      "❌ DELETE MATERI ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==================================================
// ❌ ERROR HANDLER UPLOAD
// ==================================================

router.use((err, req, res, next) => {
  console.error(
    "❌ UPLOAD ERROR:",
    err
  );

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error:
          "Ukuran file maksimal 10 MB",
      });
    }

    return res.status(400).json({
      error: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message,
    });
  }

  next();
});

module.exports = router;