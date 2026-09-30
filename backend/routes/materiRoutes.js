const express = require("express");
const router = express.Router();
const db = require("../config/db");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================================================
// 📁 KONFIGURASI UPLOAD
// ==================================================

const isVercel = !!process.env.VERCEL;

// Local:
// D:/gagakmuda_rekruitment/backend/uploads/materi
//
// Vercel:
// /tmp/materi
const uploadDir = isVercel
  ? "/tmp/materi"
  : path.join(__dirname, "../uploads/materi");

// Buat folder hanya jika dijalankan secara local
if (!isVercel) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
      recursive: true,
    });
  }
}

// ==================================================
// 📦 STORAGE
// ==================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder /tmp/materi tersedia di Vercel
    if (isVercel && !fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const filename =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, filename);
  },
});

// ==================================================
// 🔎 FILTER FILE
// ==================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "File hanya boleh PDF, JPG, atau JPEG"
      )
    );
  }
};

// ==================================================
// 🚀 MULTER
// ==================================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
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
// 📥 GET MATERI BERDASARKAN PELATIH
// ==================================================

router.get(
  "/pelatih/:pelatihId",
  async (req, res) => {
    try {
      const { pelatihId } = req.params;

      const result = await db.query(
        `
        SELECT
          materi.*,
          pelatih.nama AS nama_pelatih,
          pelatih.lisensi
        FROM materi
        LEFT JOIN pelatih
          ON materi.pelatih_id = pelatih.id
        WHERE materi.pelatih_id = $1
        ORDER BY materi.id DESC
        `,
        [pelatihId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(
        "❌ GET MATERI PELATIH ERROR:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

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
// ➕ TAMBAH MATERI
// ==================================================

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    try {
      const {
        judul,
        kategori,
        tanggal,
        pelatih_id,
      } = req.body;

      // Validasi data wajib
      if (
        !judul ||
        !kategori ||
        !tanggal ||
        !pelatih_id
      ) {
        if (req.file) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res.status(400).json({
          message:
            "Judul, kategori, tanggal, dan pelatih wajib diisi",
        });
      }

      // Cek pelatih
      const pelatihResult =
        await db.query(
          `
          SELECT id
          FROM pelatih
          WHERE id = $1
          `,
          [pelatih_id]
        );

      if (
        pelatihResult.rowCount === 0
      ) {
        if (req.file) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res.status(404).json({
          message:
            "Pelatih tidak ditemukan",
        });
      }

      // Nama file
      const file = req.file
        ? req.file.filename
        : null;

      const result = await db.query(
        `
        INSERT INTO materi
        (
          judul,
          kategori,
          tanggal,
          file,
          pelatih_id
        )
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          judul,
          kategori,
          tanggal,
          file,
          pelatih_id,
        ]
      );

      res.status(201).json({
        message:
          "Materi berhasil ditambahkan",
        data: result.rows[0],
      });
    } catch (err) {
      console.error(
        "❌ POST MATERI ERROR:",
        err
      );

      if (req.file) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ==================================================
// ✏️ UPDATE MATERI
// ==================================================

router.put(
  "/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        judul,
        kategori,
        tanggal,
        pelatih_id,
      } = req.body;

      // Validasi
      if (
        !judul ||
        !kategori ||
        !tanggal ||
        !pelatih_id
      ) {
        if (req.file) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res.status(400).json({
          message:
            "Judul, kategori, tanggal, dan pelatih wajib diisi",
        });
      }

      // Ambil data materi lama
      const oldResult =
        await db.query(
          `
          SELECT *
          FROM materi
          WHERE id = $1
          `,
          [id]
        );

      if (oldResult.rowCount === 0) {
        if (req.file) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res.status(404).json({
          message:
            "Materi tidak ditemukan",
        });
      }

      // Cek pelatih
      const pelatihResult =
        await db.query(
          `
          SELECT id
          FROM pelatih
          WHERE id = $1
          `,
          [pelatih_id]
        );

      if (
        pelatihResult.rowCount === 0
      ) {
        if (req.file) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res.status(404).json({
          message:
            "Pelatih tidak ditemukan",
        });
      }

      const oldMateri =
        oldResult.rows[0];

      let fileName =
        oldMateri.file;

      // Jika upload file baru
      if (req.file) {
        fileName =
          req.file.filename;

        // Hapus file lama
        if (
          oldMateri.file &&
          !isVercel
        ) {
          const oldFilePath =
            path.join(
              uploadDir,
              oldMateri.file
            );

          if (
            fs.existsSync(
              oldFilePath
            )
          ) {
            fs.unlink(
              oldFilePath,
              () => {}
            );
          }
        }
      }

      const result = await db.query(
        `
        UPDATE materi
        SET
          judul = $1,
          kategori = $2,
          tanggal = $3,
          file = $4,
          pelatih_id = $5
        WHERE id = $6
        RETURNING *
        `,
        [
          judul,
          kategori,
          tanggal,
          fileName,
          pelatih_id,
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
        "❌ PUT MATERI ERROR:",
        err
      );

      if (req.file) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ==================================================
// 🗑️ DELETE MATERI
// ==================================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      // Ambil data file terlebih dahulu
      const oldResult =
        await db.query(
          `
          SELECT file
          FROM materi
          WHERE id = $1
          `,
          [id]
        );

      if (oldResult.rowCount === 0) {
        return res.status(404).json({
          message:
            "Materi tidak ditemukan",
        });
      }

      const fileName =
        oldResult.rows[0].file;

      // Hapus dari database
      await db.query(
        `
        DELETE FROM materi
        WHERE id = $1
        `,
        [id]
      );

      // Hapus file fisik
      if (
        fileName &&
        !isVercel
      ) {
        const filePath =
          path.join(
            uploadDir,
            fileName
          );

        if (
          fs.existsSync(filePath)
        ) {
          fs.unlink(
            filePath,
            (err) => {
              if (err) {
                console.error(
                  "❌ GAGAL HAPUS FILE:",
                  err
                );
              }
            }
          );
        }
      }

      res.json({
        message:
          "Materi berhasil dihapus",
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
  }
);

// ==================================================
// ⚠️ ERROR HANDLER MULTER
// ==================================================

router.use(
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message:
          "Upload file gagal",
        error: err.message,
      });
    }

    if (err) {
      return res.status(400).json({
        message:
          err.message ||
          "Terjadi kesalahan",
      });
    }

    next();
  }
);

module.exports = router;