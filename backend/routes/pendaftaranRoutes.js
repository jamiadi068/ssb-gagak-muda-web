const express = require("express");
const router = express.Router();
const db = require("../config/db");
const upload = require("../middleware/upload");
const { hitungKelompokUmur } = require("./umur");

// ==================
// NORMALISASI KELOMPOK UMUR
// ==================
const normalizeKelompokUmur = (value) => {
  if (!value) return null;

  return value
    .toString()
    .trim()
    .toUpperCase()
    .replace(/-/g, "");
};

// ==================
// 📥 GET SEMUA DATA PENDAFTARAN
// ==================
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM pendaftaran ORDER BY id DESC"
    );

    console.log("📊 DATA DB:", result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR GET:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==================
// 📤 INSERT PENDAFTARAN
// ==================
router.post("/", upload.single("dokumen"), async (req, res) => {
  try {
    const {
      nama,
      email,
      tempat_lahir,
      tanggal_lahir,
      asal_sekolah,
      alamat,
      no_hp,
    } = req.body;

    const dokumen = req.file ? req.file.filename : null;

    console.log("📤 DATA MASUK:", req.body);

    if (!nama || !tanggal_lahir) {
      return res.status(400).json({
        error: "Nama dan tanggal lahir wajib diisi",
      });
    }

    await db.query(
      `
      INSERT INTO pendaftaran
      (
        nama,
        email,
        tempat_lahir,
        tanggal_lahir,
        asal_sekolah,
        alamat,
        no_hp,
        dokumen,
        status,
        created_at
      )
      VALUES
      (
        $1, $2, $3, $4, $5, $6, $7, $8,
        'pending',
        NOW()
      )
      `,
      [
        nama,
        email,
        tempat_lahir,
        tanggal_lahir,
        asal_sekolah,
        alamat,
        no_hp,
        dokumen,
      ]
    );

    res.json({
      message: "Pendaftaran berhasil disimpan",
    });
  } catch (err) {
    console.error("❌ ERROR INSERT:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==================
// ✅ VALIDASI PENDAFTARAN
// ==================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin } = req.body;

    // =========================
    // AMBIL DATA PENDAFTARAN
    // =========================
    const dataAsli = await db.query(
      "SELECT * FROM pendaftaran WHERE id = $1",
      [id]
    );

    const p = dataAsli.rows[0];

    if (!p) {
      return res.status(404).json({
        message: "Data pendaftaran tidak ditemukan",
      });
    }

    // =========================
    // UPDATE STATUS PENDAFTARAN
    // =========================
    await db.query(
      `
      UPDATE pendaftaran
      SET
        status = $1,
        validated_at = NOW(),
        validated_by = $2
      WHERE id = $3
      `,
      [
        status,
        admin || "admin",
        id,
      ]
    );

    // =================================================
    // JIKA APPROVED → MASUK KE TABEL PEMAIN
    // =================================================
    if (status === "approved") {

      // =========================
      // CEK EMAIL PEMAIN
      // =========================
      const cekPemain = await db.query(
        "SELECT * FROM pemain WHERE email = $1",
        [p.email]
      );

      if (cekPemain.rows.length === 0) {

        // =========================
        // HITUNG KELOMPOK UMUR
        // =========================
        const kelompokUmurRaw =
          hitungKelompokUmur(p.tanggal_lahir);

        const kelompokUmur =
          normalizeKelompokUmur(kelompokUmurRaw);

        console.log(
          "👤 PEMAIN:",
          p.nama
        );

        console.log(
          "🎂 TANGGAL LAHIR:",
          p.tanggal_lahir
        );

        console.log(
          "⚽ KELOMPOK UMUR:",
          kelompokUmur
        );

        if (!kelompokUmur) {
          return res.status(400).json({
            error: "Kelompok umur gagal dihitung",
          });
        }

        // =========================
        // CEK APAKAH KELOMPOK
        // SUDAH PUNYA PELATIH
        // =========================
        const cekPelatih = await db.query(
          `
          SELECT
            pku.id,
            pku.pelatih_id,
            pku.kelompok_umur,
            p.nama AS nama_pelatih,
            p.email AS email_pelatih
          FROM pelatih_kelompok_umur pku
          INNER JOIN pelatih p
            ON p.id = pku.pelatih_id
          WHERE REPLACE(UPPER(pku.kelompok_umur), '-', '') = $1
          LIMIT 1
          `,
          [kelompokUmur]
        );

        // =========================
        // INSERT PEMAIN
        // =========================
        await db.query(
          `
          INSERT INTO pemain
          (
            nama,
            email,
            tempat_lahir,
            tanggal_lahir,
            asal_sekolah,
            alamat,
            no_hp,
            dokumen,
            kelompok_umur,
            status,
            validated_at,
            validated_by,
            created_at,
            approved_at
          )
          VALUES
          (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            'Aktif',
            NOW(),
            $10,
            $11,
            NOW()
          )
          `,
          [
            p.nama,
            p.email,
            p.tempat_lahir,
            p.tanggal_lahir,
            p.asal_sekolah,
            p.alamat,
            p.no_hp,
            p.dokumen,
            kelompokUmur,
            admin || "admin",
            p.created_at,
          ]
        );

        // =========================
        // INFORMASI PELATIH
        // =========================
        if (cekPelatih.rows.length > 0) {
          const pelatih = cekPelatih.rows[0];

          console.log(
            `✅ ${p.nama} (${kelompokUmur}) masuk kelompok pelatih ${pelatih.nama_pelatih}`
          );
        } else {
          console.log(
            `⚠️ ${p.nama} (${kelompokUmur}) belum memiliki pelatih`
          );
        }
      } else {

        console.log(
          `ℹ️ Pemain dengan email ${p.email} sudah ada`
        );
      }
    }

    // =========================
    // RESPONSE
    // =========================
    let message = "";

    if (status === "approved") {
      message =
        "Pendaftaran disetujui & pemain masuk ke daftar pemain";
    } else if (status === "rejected") {
      message = "Pendaftaran ditolak";
    } else {
      message = "Status pendaftaran berhasil diperbarui";
    }

    res.json({
      message,
    });

  } catch (err) {
    console.error("❌ ERROR VALIDASI:", err);

    res.status(500).json({
      error: "Gagal memproses validasi: " + err.message,
    });
  }
});

module.exports = router;