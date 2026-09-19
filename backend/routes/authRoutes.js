const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

// LOGIN ADMIN & PELATIH
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ================= LOGIN ADMIN =================
    const adminResult = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];

      const match = await bcrypt.compare(password, admin.password);

      if (match) {
        return res.json({
          token: "dummy-token-admin",
          user: {
            id: admin.id,
            role: "admin",
            nama: admin.nama,
            email: admin.email,
          },
        });
      }
    }

    // ================= LOGIN PELATIH =================
    const pelatihResult = await db.query(
      "SELECT * FROM pelatih WHERE email = $1",
      [email]
    );

    if (pelatihResult.rows.length > 0) {
      const pelatih = pelatihResult.rows[0];

      const match = await bcrypt.compare(
        password,
        pelatih.password
      );

      if (match) {
        return res.json({
          token: "dummy-token-pelatih",
          user: {
            id: pelatih.id,
            role: "pelatih",
            nama: pelatih.nama,
            email: pelatih.email,
            lisensi: pelatih.lisensi,
          },
        });
      }
    }
    // ================= LOGIN SISWA =================
const siswaResult = await db.query(
  `
  SELECT
    a.id,
    a.pemain_id,
    a.email,
    a.password,
    p.nama,
    p.kelompok_umur,
    p.foto_pemain,
    p.pelatih_id,
    p.status,
    pelatih.nama AS nama_pelatih
  FROM akun_siswa a
  INNER JOIN pemain p
    ON a.pemain_id = p.id
  LEFT JOIN pelatih
    ON p.pelatih_id = pelatih.id
  WHERE LOWER(a.email) = LOWER($1)
  `,
  [email]
);

if (siswaResult.rows.length > 0) {
  const siswa = siswaResult.rows[0];

  // PEMAIN HARUS MASIH AKTIF
  if (
    !siswa.status ||
    siswa.status.toLowerCase().trim() !== "aktif"
  ) {
    return res.status(401).json({
      message: "Akun siswa tidak aktif",
    });
  }

  // CEK PASSWORD
  const match = await bcrypt.compare(
    password,
    siswa.password
  );

  if (match) {
    return res.json({
      token: "dummy-token-siswa",
      user: {
        id: siswa.id,
        pemain_id: siswa.pemain_id,
        role: "siswa",
        nama: siswa.nama,
        email: siswa.email,
        kelompok_umur: siswa.kelompok_umur,
        foto_pemain: siswa.foto_pemain,
        pelatih_id: siswa.pelatih_id,
        nama_pelatih: siswa.nama_pelatih,
      },
    });
  }
}
    // ================= LOGIN GAGAL =================
    return res.status(401).json({
      message: "Email atau password salah",
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;