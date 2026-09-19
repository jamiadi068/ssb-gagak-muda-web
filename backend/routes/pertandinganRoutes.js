const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 1. POST: Tambah pertandingan baru
router.post("/", async (req, res) => {
  try {
    const { lawan, tanggal, waktu, lokasi, tipe_pertandingan } = req.body;

    if (!lawan || !tanggal || !waktu || !lokasi) {
      return res.status(400).json({
        error: "Semua data pertandingan wajib diisi!"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO pertandingan 
      (lawan, tanggal, waktu, lokasi, tipe_pertandingan) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
      `,
      [lawan, tanggal, waktu, lokasi, tipe_pertandingan || "Persahabatan"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan pertandingan" });
  }
});

// 2. GET: Ambil semua pertandingan
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pertandingan ORDER BY tanggal ASC, waktu ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data pertandingan" });
  }
});

// 3. GET (by ID): Ambil detail satu pertandingan (Dibutuhkan untuk halaman Edit)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM pertandingan WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pertandingan tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil detail pertandingan" });
  }
});

// 4. PUT: Update data pertandingan berdasarkan ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { lawan, tanggal, waktu, lokasi, tipe_pertandingan } = req.body;

    if (!lawan || !tanggal || !waktu || !lokasi) {
      return res.status(400).json({
        error: "Semua data pertandingan wajib diisi untuk memperbarui!"
      });
    }

    const result = await pool.query(
      `
      UPDATE pertandingan 
      SET lawan = $1, tanggal = $2, waktu = $3, lokasi = $4, tipe_pertandingan = $5 
      WHERE id = $6 
      RETURNING *
      `,
      [lawan, tanggal, waktu, lokasi, tipe_pertandingan, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pertandingan tidak ditemukan" });
    }

    res.json({ message: "Pertandingan berhasil diperbarui", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui data pertandingan" });
  }
});

// 5. DELETE: Hapus pertandingan berdasarkan ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM pertandingan WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pertandingan tidak ditemukan atau sudah dihapus" });
    }

    res.json({ message: "Pertandingan berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus pertandingan" });
  }
});

module.exports = router;