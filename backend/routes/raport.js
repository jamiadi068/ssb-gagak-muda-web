const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// =====================================================
// GET RAPORT BERDASARKAN PEMAIN
// =====================================================
router.get("/pemain/:pemainId", async (req, res) => {
  try {
    const { pemainId } = req.params;

    const result = await pool.query(
      `
      SELECT
        r.*,

        -- DATA PEMAIN
        p.nama,
        p.email,
        p.tempat_lahir,
        p.tanggal_lahir,
        p.kelompok_umur,
        p.asal_sekolah,

        -- DATA PELATIH PEMBUAT RAPORT
        pel.nama AS nama_pelatih

      FROM raport r

      INNER JOIN pemain p
        ON r.pemain_id = p.id

      LEFT JOIN pelatih pel
        ON r.pelatih_id = pel.id

      WHERE r.pemain_id = $1

      ORDER BY r.created_at DESC
      `,
      [pemainId]
    );

    // =================================================
    // HITUNG SUBTOTAL DAN TOTAL
    // =================================================

    const data = result.rows.map((raport) => {

      // A. TEKNIK MENYERANG
      const subtotalTeknikMenyerang =
        Number(raport.dribbling_feinting || 0) +
        Number(raport.passing || 0) +
        Number(raport.first_touch || 0) +
        Number(raport.shooting || 0) +
        Number(raport.heading || 0) +
        Number(raport.long_passing || 0);

      // B. TEKNIK BERTAHAN
      const subtotalTeknikBertahan =
        Number(raport.clearance || 0) +
        Number(raport.intercept || 0) +
        Number(raport.tackling || 0);

      // C. KONDISI FISIK
      const subtotalKondisiFisik =
        Number(raport.strength || 0) +
        Number(raport.endurance || 0) +
        Number(raport.speed || 0) +
        Number(raport.flexibility_coordination || 0);

      // D. TAKTIKAL
      const subtotalTaktikal =
        Number(raport.menyerang || 0) +
        Number(raport.bertahan || 0) +
        Number(raport.transisi || 0);

      // E. MENTAL
      const subtotalMental =
        Number(raport.disiplin || 0) +
        Number(raport.kerja_keras || 0) +
        Number(raport.percaya_diri || 0) +
        Number(raport.tanggung_jawab || 0) +
        Number(raport.personality || 0) +
        Number(raport.komunikasi || 0);

      // TOTAL NILAI
      const totalNilai =
        subtotalTeknikMenyerang +
        subtotalTeknikBertahan +
        subtotalKondisiFisik +
        subtotalTaktikal +
        subtotalMental;

      // JUMLAH PARAMETER
      const jumlahParameter = 22;

      // RATA-RATA
      const rataRata =
        jumlahParameter > 0
          ? Number((totalNilai / jumlahParameter).toFixed(2))
          : 0;

      return {
        ...raport,

        subtotal_teknik_menyerang: subtotalTeknikMenyerang,
        subtotal_teknik_bertahan: subtotalTeknikBertahan,
        subtotal_kondisi_fisik: subtotalKondisiFisik,
        subtotal_taktikal: subtotalTaktikal,
        subtotal_mental: subtotalMental,

        total_nilai: totalNilai,
        jumlah_parameter: jumlahParameter,
        rata_rata: rataRata,
      };
    });

    res.status(200).json(data);

  } catch (err) {
    console.error("GET RAPORT PEMAIN ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil raport pemain",
      error: err.message,
    });
  }
});


// =====================================================
// GET JUMLAH RAPORT SELESAI BERDASARKAN PELATIH
// =====================================================
router.get("/pelatih/:pelatihId", async (req, res) => {
  try {
    const { pelatihId } = req.params;

    const result = await pool.query(
      `
      SELECT COUNT(r.id_raport) AS jumlah
      FROM raport r

      INNER JOIN pemain p
        ON r.pemain_id = p.id

      INNER JOIN pelatih_kelompok_umur pku
        ON REPLACE(UPPER(TRIM(p.kelompok_umur)), '-', '')
         = REPLACE(UPPER(TRIM(pku.kelompok_umur)), '-', '')

      WHERE pku.pelatih_id = $1
        AND LOWER(TRIM(p.status)) = 'aktif'
      `,
      [pelatihId]
    );

    res.status(200).json({
      jumlah: Number(result.rows[0].jumlah) || 0,
    });

  } catch (err) {
    console.error("GET JUMLAH RAPORT PELATIH ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil jumlah raport pelatih",
      error: err.message,
    });
  }
});


// =====================================================
// GET DETAIL RAPORT
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        r.*,

        -- DATA PEMAIN
        p.nama,
        p.email,
        p.tempat_lahir,
        p.tanggal_lahir,
        p.kelompok_umur,
        p.asal_sekolah,

        -- DATA PELATIH PEMBUAT RAPORT
        pel.nama AS nama_pelatih

      FROM raport r

      INNER JOIN pemain p
        ON r.pemain_id = p.id

      LEFT JOIN pelatih pel
        ON r.pelatih_id = pel.id

      WHERE r.id_raport = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Raport tidak ditemukan",
      });
    }

    const raport = result.rows[0];

    // =================================================
    // SUBTOTAL
    // =================================================

    const subtotalTeknikMenyerang =
      Number(raport.dribbling_feinting || 0) +
      Number(raport.passing || 0) +
      Number(raport.first_touch || 0) +
      Number(raport.shooting || 0) +
      Number(raport.heading || 0) +
      Number(raport.long_passing || 0);

    const subtotalTeknikBertahan =
      Number(raport.clearance || 0) +
      Number(raport.intercept || 0) +
      Number(raport.tackling || 0);

    const subtotalKondisiFisik =
      Number(raport.strength || 0) +
      Number(raport.endurance || 0) +
      Number(raport.speed || 0) +
      Number(raport.flexibility_coordination || 0);

    const subtotalTaktikal =
      Number(raport.menyerang || 0) +
      Number(raport.bertahan || 0) +
      Number(raport.transisi || 0);

    const subtotalMental =
      Number(raport.disiplin || 0) +
      Number(raport.kerja_keras || 0) +
      Number(raport.percaya_diri || 0) +
      Number(raport.tanggung_jawab || 0) +
      Number(raport.personality || 0) +
      Number(raport.komunikasi || 0);

    const totalNilai =
      subtotalTeknikMenyerang +
      subtotalTeknikBertahan +
      subtotalKondisiFisik +
      subtotalTaktikal +
      subtotalMental;

    const rataRata = Number((totalNilai / 22).toFixed(2));

    res.status(200).json({
      ...raport,

      subtotal_teknik_menyerang: subtotalTeknikMenyerang,
      subtotal_teknik_bertahan: subtotalTeknikBertahan,
      subtotal_kondisi_fisik: subtotalKondisiFisik,
      subtotal_taktikal: subtotalTaktikal,
      subtotal_mental: subtotalMental,

      total_nilai: totalNilai,
      jumlah_parameter: 22,
      rata_rata: rataRata,
    });

  } catch (err) {
    console.error("GET DETAIL RAPORT ERROR:", err);

    res.status(500).json({
      message: "Gagal mengambil detail raport",
      error: err.message,
    });
  }
});


// =====================================================
// CREATE RAPORT
// =====================================================
router.post("/", async (req, res) => {
  try {
    const {
      pemain_id,
      pelatih_id,
      periode,
      posisi,

      dribbling_feinting,
      passing,
      first_touch,
      shooting,
      heading,
      long_passing,

      clearance,
      intercept,
      tackling,

      strength,
      endurance,
      speed,
      flexibility_coordination,

      menyerang,
      bertahan,
      transisi,

      disiplin,
      kerja_keras,
      percaya_diri,
      tanggung_jawab,
      personality,
      komunikasi,

      catatan_pelatih,
    } = req.body;


    // =================================================
    // VALIDASI PEMAIN
    // =================================================

    const pemainCheck = await pool.query(
      `
      SELECT id, nama
      FROM pemain
      WHERE id = $1
      `,
      [pemain_id]
    );

    if (pemainCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Pemain tidak ditemukan",
      });
    }


    // =================================================
    // VALIDASI PELATIH
    // =================================================

    const pelatihCheck = await pool.query(
      `
      SELECT id, nama
      FROM pelatih
      WHERE id = $1
      `,
      [pelatih_id]
    );

    if (pelatihCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Pelatih tidak ditemukan",
      });
    }


    // =================================================
    // SIMPAN RAPORT
    // =================================================

    const result = await pool.query(
      `
      INSERT INTO raport (
        pemain_id,
        pelatih_id,
        periode,
        posisi,

        dribbling_feinting,
        passing,
        first_touch,
        shooting,
        heading,
        long_passing,

        clearance,
        intercept,
        tackling,

        strength,
        endurance,
        speed,
        flexibility_coordination,

        menyerang,
        bertahan,
        transisi,

        disiplin,
        kerja_keras,
        percaya_diri,
        tanggung_jawab,
        personality,
        komunikasi,

        catatan_pelatih
      )

      VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23, $24, $25, $26,
        $27
      )

      RETURNING *
      `,
      [
        pemain_id,
        pelatih_id,
        periode || "Periode 1 / 2026",
        posisi,

        dribbling_feinting,
        passing,
        first_touch,
        shooting,
        heading,
        long_passing,

        clearance,
        intercept,
        tackling,

        strength,
        endurance,
        speed,
        flexibility_coordination,

        menyerang,
        bertahan,
        transisi,

        disiplin,
        kerja_keras,
        percaya_diri,
        tanggung_jawab,
        personality,
        komunikasi,

        catatan_pelatih,
      ]
    );

    res.status(201).json({
      message: "Raport berhasil disimpan",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("CREATE RAPORT ERROR:", err);

    res.status(500).json({
      message: "Gagal menyimpan raport",
      error: err.message,
    });
  }
});


// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;