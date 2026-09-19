const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// ==================================================
// NORMALISASI KELOMPOK UMUR
// U7, U-7, u7 -> U7
// ==================================================
const normalizeKelompokUmur = (value) => {
  if (!value) return null;

  return value
    .toString()
    .trim()
    .toUpperCase()
    .replace(/-/g, "");
};

// ==================================================
// NORMALISASI ARRAY KELOMPOK UMUR
// ==================================================
const normalizeKelompokUmurArray = (kelompokUmur) => {
  if (!Array.isArray(kelompokUmur)) {
    return [];
  }

  return [
    ...new Set(
      kelompokUmur
        .map(normalizeKelompokUmur)
        .filter(Boolean)
    ),
  ];
};

// ==================================================
// GET SEMUA DATA PELATIH
// ==================================================
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        nama,
        email,
        lisensi,
        no_hp,
        alamat,
        foto,
        created_at
      FROM pelatih
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET PELATIH:", err);

    res.status(500).json({
      message: "Gagal mengambil data pelatih",
      error: err.message,
    });
  }
});

// ==================================================
// GET DETAIL PELATIH
// ==================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        id,
        nama,
        email,
        lisensi,
        no_hp,
        alamat,
        foto,
        created_at
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

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR DETAIL PELATIH:", err);

    res.status(500).json({
      message: "Gagal mengambil detail pelatih",
      error: err.message,
    });
  }
});

// ==================================================
// TAMBAH DATA PELATIH
// ==================================================
router.post("/", async (req, res) => {
  const client = await db.connect();

  try {
    const {
      nama,
      email,
      password,
      lisensi,
      no_hp,
      alamat,
      kelompok_umur,
    } = req.body;

    // ==============================================
    // VALIDASI
    // ==============================================
    if (!nama || !email || !password || !lisensi) {
      return res.status(400).json({
        message: "Nama, Email, Password, dan Lisensi wajib diisi",
      });
    }

    const kelompok = normalizeKelompokUmurArray(
      kelompok_umur
    );

    if (kelompok.length === 0) {
      return res.status(400).json({
        message:
          "Minimal satu kelompok umur harus dipilih",
      });
    }

    // ==============================================
    // CEK EMAIL
    // ==============================================
    const cekEmail = await db.query(
      "SELECT id FROM pelatih WHERE email = $1",
      [email]
    );

    if (cekEmail.rows.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    // ==============================================
    // HASH PASSWORD
    // ==============================================
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==============================================
    // TRANSACTION
    // ==============================================
    await client.query("BEGIN");

    // ==============================================
    // INSERT PELATIH
    // ==============================================
    const result = await client.query(
      `
      INSERT INTO pelatih
      (
        nama,
        email,
        password,
        lisensi,
        no_hp,
        alamat
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        nama,
        email,
        lisensi,
        no_hp,
        alamat
      `,
      [
        nama,
        email,
        hashedPassword,
        lisensi,
        no_hp,
        alamat,
      ]
    );

    const pelatihBaru = result.rows[0];

    // ==============================================
    // INSERT KELOMPOK UMUR
    // ==============================================
    for (const umur of kelompok) {
      await client.query(
        `
        INSERT INTO pelatih_kelompok_umur
        (
          pelatih_id,
          kelompok_umur
        )
        VALUES ($1, $2)
        `,
        [pelatihBaru.id, umur]
      );
    }

    await client.query("COMMIT");

    console.log(
      "✅ Pelatih berhasil dibuat:",
      pelatihBaru.nama
    );

    console.log(
      "✅ Kelompok umur:",
      kelompok
    );

    res.status(201).json({
      message:
        "Data pelatih dan kelompok umur berhasil ditambahkan",
      data: pelatihBaru,
      kelompok_umur: kelompok,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(
      "ERROR INSERT PELATIH:",
      err
    );

    res.status(500).json({
      message:
        "Gagal menambahkan data pelatih",
      error: err.message,
    });
  } finally {
    client.release();
  }
});

// ==================================================
// UPDATE DATA PELATIH
// ==================================================
router.put("/:id", async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;

    const {
      nama,
      email,
      password,
      lisensi,
      no_hp,
      alamat,
      kelompok_umur,
    } = req.body;

    // ==============================================
    // VALIDASI
    // ==============================================
    if (!nama || !email || !lisensi) {
      return res.status(400).json({
        message:
          "Nama, Email, dan Lisensi wajib diisi",
      });
    }

    const kelompok =
      normalizeKelompokUmurArray(
        kelompok_umur
      );

    if (kelompok.length === 0) {
      return res.status(400).json({
        message:
          "Minimal satu kelompok umur harus dipilih",
      });
    }

    // ==============================================
    // CEK PELATIH
    // ==============================================
    const cekPelatih = await db.query(
      "SELECT id FROM pelatih WHERE id = $1",
      [id]
    );

    if (cekPelatih.rows.length === 0) {
      return res.status(404).json({
        message: "Pelatih tidak ditemukan",
      });
    }

    // ==============================================
    // CEK EMAIL
    // ==============================================
    const cekEmail = await db.query(
      `
      SELECT id
      FROM pelatih
      WHERE email = $1
      AND id <> $2
      `,
      [email, id]
    );

    if (cekEmail.rows.length > 0) {
      return res.status(400).json({
        message:
          "Email sudah digunakan oleh pelatih lain",
      });
    }

    // ==============================================
    // MULAI TRANSACTION
    // ==============================================
    await client.query("BEGIN");

    let result;

    // ==============================================
    // JIKA PASSWORD DIUBAH
    // ==============================================
    if (
      password &&
      password.trim() !== ""
    ) {
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      result = await client.query(
        `
        UPDATE pelatih
        SET
          nama = $1,
          email = $2,
          password = $3,
          lisensi = $4,
          no_hp = $5,
          alamat = $6
        WHERE id = $7
        RETURNING
          id,
          nama,
          email,
          lisensi,
          no_hp,
          alamat
        `,
        [
          nama,
          email,
          hashedPassword,
          lisensi,
          no_hp,
          alamat,
          id,
        ]
      );
    }

    // ==============================================
    // JIKA PASSWORD TIDAK DIUBAH
    // ==============================================
    else {
      result = await client.query(
        `
        UPDATE pelatih
        SET
          nama = $1,
          email = $2,
          lisensi = $3,
          no_hp = $4,
          alamat = $5
        WHERE id = $6
        RETURNING
          id,
          nama,
          email,
          lisensi,
          no_hp,
          alamat
        `,
        [
          nama,
          email,
          lisensi,
          no_hp,
          alamat,
          id,
        ]
      );
    }

    // ==============================================
    // HAPUS MAPPING LAMA
    // ==============================================
    await client.query(
      `
      DELETE FROM pelatih_kelompok_umur
      WHERE pelatih_id = $1
      `,
      [id]
    );

    // ==============================================
    // INSERT MAPPING BARU
    // ==============================================
    for (const umur of kelompok) {
      await client.query(
        `
        INSERT INTO pelatih_kelompok_umur
        (
          pelatih_id,
          kelompok_umur
        )
        VALUES ($1, $2)
        `,
        [id, umur]
      );
    }

    await client.query("COMMIT");

    res.json({
      message:
        "Data pelatih dan kelompok umur berhasil diupdate",
      data: result.rows[0],
      kelompok_umur: kelompok,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(
      "ERROR UPDATE PELATIH:",
      err
    );

    res.status(500).json({
      message:
        "Gagal mengupdate data pelatih",
      error: err.message,
    });
  } finally {
    client.release();
  }
});

// ==================================================
// DELETE DATA PELATIH
// ==================================================
router.delete("/:id", async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // ==============================================
    // HAPUS MAPPING KELOMPOK UMUR DULU
    // ==============================================
    await client.query(
      `
      DELETE FROM pelatih_kelompok_umur
      WHERE pelatih_id = $1
      `,
      [id]
    );

    // ==============================================
    // HAPUS PELATIH
    // ==============================================
    const result = await client.query(
      `
      DELETE FROM pelatih
      WHERE id = $1
      RETURNING id, nama
      `,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message:
          "Pelatih tidak ditemukan",
      });
    }

    await client.query("COMMIT");

    res.json({
      message:
        "Data pelatih dan kelompok umur berhasil dihapus",
      data: result.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(
      "ERROR DELETE PELATIH:",
      err
    );

    res.status(500).json({
      message:
        "Gagal menghapus data pelatih",
      error: err.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;