const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ============================================================
// EXPORT DATA MANAGEMENT SSB
// GET /api/export/data-management
//
// Catatan keamanan:
// - PASSWORD PEMAIN tidak ada di tabel pemain
// - PASSWORD PELATIH TIDAK DIAMBIL
// - PASSWORD AKUN SISWA TIDAK DIAMBIL
// ============================================================

router.get("/data-management", async (req, res) => {
  try {
    console.log("==============================================");
    console.log("MEMULAI EXPORT DATA MANAGEMENT SSB...");
    console.log("==============================================");

    // ========================================================
    // 1. DATA PEMAIN
    // ========================================================
    const pemainResult = await db.query(`
      SELECT
        p.id,
        p.nama,
        p.email,
        p.tempat_lahir,
        p.tanggal_lahir,
        p.asal_sekolah,
        p.alamat,
        p.no_hp,
        p.created_at,
        p.dokumen,
        p.status,
        p.validated_at,
        p.validated_by,
        p.approved_at,
        p.kelompok_umur,
        p.foto_pemain,
        p.pelatih_id,
        pl.nama AS nama_pelatih,
        pl.email AS email_pelatih,
        pl.no_hp AS no_hp_pelatih
      FROM pemain p
      LEFT JOIN pelatih pl
        ON p.pelatih_id = pl.id
      ORDER BY p.nama ASC
    `);

    // ========================================================
    // 2. DATA PELATIH
    // PASSWORD TIDAK DIAMBIL
    // ========================================================
    const pelatihResult = await db.query(`
      SELECT
        id,
        nama,
        lisensi,
        no_hp,
        alamat,
        foto,
        created_at,
        email
      FROM pelatih
      ORDER BY nama ASC
    `);

    // ========================================================
    // 3. PEMAIN & PELATIH
    // RELASI PEMAIN DENGAN PELATIH SAAT INI
    // ========================================================
    const pemainPelatihResult = await db.query(`
      SELECT
        p.id AS pemain_id,
        p.nama AS nama_pemain,
        p.email AS email_pemain,
        p.kelompok_umur,
        p.status,

        pl.id AS pelatih_id,
        pl.nama AS nama_pelatih,
        pl.email AS email_pelatih,
        pl.no_hp AS no_hp_pelatih,
        pl.lisensi AS lisensi_pelatih

      FROM pemain p
      LEFT JOIN pelatih pl
        ON p.pelatih_id = pl.id

      ORDER BY
        pl.nama ASC NULLS LAST,
        p.nama ASC
    `);

    // ========================================================
    // 4. KELOMPOK UMUR PELATIH
    // ========================================================
    const kelompokResult = await db.query(`
      SELECT
        pku.id,
        pku.pelatih_id,
        pl.nama AS nama_pelatih,
        pl.email AS email_pelatih,
        pku.kelompok_umur,
        pku.created_at
      FROM pelatih_kelompok_umur pku
      LEFT JOIN pelatih pl
        ON pku.pelatih_id = pl.id
      ORDER BY
        pl.nama ASC,
        pku.kelompok_umur ASC
    `);

    // ========================================================
    // 5. HISTORI RAPORT
    //
    // PENTING:
    // raport.pelatih_id digunakan sebagai pelatih PEMBUAT RAPORT
    //
    // Jadi meskipun pemain sudah pindah pelatih,
    // raport lama tetap menunjukkan pelatih yang membuatnya.
    // ========================================================
    const raportResult = await db.query(`
      SELECT
        r.id_raport,
        r.pemain_id,

        p.nama AS nama_pemain,
        p.email AS email_pemain,
        p.kelompok_umur AS kelompok_umur_pemain,

        r.periode,
        r.posisi,

        r.dribbling_feinting,
        r.passing,
        r.first_touch,
        r.shooting,
        r.heading,
        r.long_passing,

        r.clearance,
        r.intercept,
        r.tackling,

        r.strength,
        r.endurance,
        r.speed,
        r.flexibility_coordination,

        r.menyerang,
        r.bertahan,
        r.transisi,

        r.disiplin,
        r.kerja_keras,
        r.percaya_diri,
        r.tanggung_jawab,
        r.personality,
        r.komunikasi,

        r.catatan_pelatih,

        r.pelatih_id AS pelatih_pembuat_id,
        pl.nama AS nama_pelatih_pembuat,
        pl.email AS email_pelatih_pembuat,
        pl.lisensi AS lisensi_pelatih_pembuat,

        r.created_at,
        r.updated_at

      FROM raport r

      LEFT JOIN pemain p
        ON r.pemain_id = p.id

      LEFT JOIN pelatih pl
        ON r.pelatih_id = pl.id

      ORDER BY
        p.nama ASC,
        r.created_at DESC
    `);

    // ========================================================
    // HITUNG NILAI RAPORT
    //
    // 22 PARAMETER
    // ========================================================
    const raport = raportResult.rows.map((r) => {
      const nilai = [
        r.dribbling_feinting,
        r.passing,
        r.first_touch,
        r.shooting,
        r.heading,
        r.long_passing,
        r.clearance,
        r.intercept,
        r.tackling,
        r.strength,
        r.endurance,
        r.speed,
        r.flexibility_coordination,
        r.menyerang,
        r.bertahan,
        r.transisi,
        r.disiplin,
        r.kerja_keras,
        r.percaya_diri,
        r.tanggung_jawab,
        r.personality,
        r.komunikasi,
      ];

      const nilaiValid = nilai.filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          !Number.isNaN(Number(item))
      );

      const totalNilai = nilaiValid.reduce(
        (total, item) => total + Number(item),
        0
      );

      const rataRata =
        nilaiValid.length > 0
          ? Number((totalNilai / nilaiValid.length).toFixed(2))
          : 0;

      return {
        ...r,
        jumlah_parameter: nilaiValid.length,
        total_nilai: totalNilai,
        rata_rata: rataRata,
      };
    });

    // ========================================================
    // 6. AKUN SISWA
    //
    // PASSWORD SENGAJA TIDAK DIAMBIL
    // ========================================================
    const akunResult = await db.query(`
      SELECT
        a.id,
        a.pemain_id,
        p.nama AS nama_pemain,
        p.kelompok_umur,
        p.pelatih_id,
        pl.nama AS nama_pelatih,
        a.email,
        a.created_at
      FROM akun_siswa a

      LEFT JOIN pemain p
        ON a.pemain_id = p.id

      LEFT JOIN pelatih pl
        ON p.pelatih_id = pl.id

      ORDER BY
        p.nama ASC
    `);

    // ========================================================
    // 7. MATERI LATIHAN
    // ========================================================
    const materiResult = await db.query(`
      SELECT
        m.id,
        m.judul,
        m.kategori,
        m.tanggal,
        m.pelatih,
        m.durasi,
        m.lokasi,
        m.deskripsi,
        m.created_at,
        m.pelatih_id,
        pl.nama AS nama_pelatih,
        m.file_materi
      FROM materi m

      LEFT JOIN pelatih pl
        ON m.pelatih_id = pl.id

      ORDER BY
        m.tanggal DESC NULLS LAST,
        m.created_at DESC
    `);

    // ========================================================
    // 8. RINGKASAN
    // ========================================================

    // Jumlah pemain per kelompok umur
    const kelompokPemainResult = await db.query(`
      SELECT
        COALESCE(kelompok_umur, 'BELUM ADA') AS kelompok_umur,
        COUNT(*)::integer AS jumlah_pemain
      FROM pemain
      GROUP BY kelompok_umur
      ORDER BY kelompok_umur ASC
    `);

    // Jumlah pemain berdasarkan status
    const statusPemainResult = await db.query(`
      SELECT
        COALESCE(status, 'BELUM ADA') AS status,
        COUNT(*)::integer AS jumlah
      FROM pemain
      GROUP BY status
      ORDER BY status ASC
    `);

    // Jumlah pemain per pelatih
    const pemainPerPelatihResult = await db.query(`
      SELECT
        COALESCE(pl.nama, 'BELUM ADA PELATIH') AS nama_pelatih,
        COUNT(p.id)::integer AS jumlah_pemain
      FROM pemain p
      LEFT JOIN pelatih pl
        ON p.pelatih_id = pl.id
      GROUP BY pl.id, pl.nama
      ORDER BY pl.nama ASC NULLS LAST
    `);

    // ========================================================
    // RINGKASAN UTAMA
    // ========================================================
    const ringkasan = {
      tanggal_export: new Date(),

      total_pemain: pemainResult.rows.length,

      total_pemain_aktif: pemainResult.rows.filter(
        (p) =>
          p.status &&
          p.status.toLowerCase().trim() === "aktif"
      ).length,

      total_pemain_nonaktif: pemainResult.rows.filter(
        (p) =>
          !p.status ||
          p.status.toLowerCase().trim() !== "aktif"
      ).length,

      total_pelatih: pelatihResult.rows.length,

      total_raport: raport.length,

      total_akun_siswa: akunResult.rows.length,

      total_materi: materiResult.rows.length,

      total_kelompok_pelatih:
        kelompokResult.rows.length,
    };

    // ========================================================
    // RESPONSE
    // ========================================================
    const response = {
      success: true,

      export_info: {
        nama_file:
          "Data_Management_SSB_Gagak_Muda.xlsx",

        tanggal_export: new Date(),

        keterangan:
          "Export seluruh data management SSB tanpa password.",
      },

      ringkasan,

      data_pemain: pemainResult.rows,

      data_pelatih: pelatihResult.rows,

      pemain_pelatih: pemainPelatihResult.rows,

      kelompok_umur_pelatih: kelompokResult.rows,

      histori_raport: raport,

      akun_siswa: akunResult.rows,

      materi_latihan: materiResult.rows,

      statistik: {
        pemain_per_kelompok_umur:
          kelompokPemainResult.rows,

        pemain_per_status:
          statusPemainResult.rows,

        pemain_per_pelatih:
          pemainPerPelatihResult.rows,
      },
    };

    console.log("==============================================");
    console.log("EXPORT DATA MANAGEMENT BERHASIL");
    console.log(
      `Pemain      : ${ringkasan.total_pemain}`
    );
    console.log(
      `Pelatih     : ${ringkasan.total_pelatih}`
    );
    console.log(
      `Raport      : ${ringkasan.total_raport}`
    );
    console.log(
      `Akun Siswa  : ${ringkasan.total_akun_siswa}`
    );
    console.log(
      `Materi      : ${ringkasan.total_materi}`
    );
    console.log(
      `Kelompok    : ${ringkasan.total_kelompok_pelatih}`
    );
    console.log("==============================================");

    return res.status(200).json(response);

  } catch (err) {
    console.error(
      "=============================================="
    );
    console.error(
      "EXPORT DATA MANAGEMENT ERROR:"
    );
    console.error(err);
    console.error(
      "=============================================="
    );

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data management SSB",
      error: err.message,
    });
  }
});

module.exports = router;