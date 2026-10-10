
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// MIDDLEWARE GLOBAL
// ======================

const allowedOrigins = [
  "https://ssb-gagak-muda-web.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin, misalnya server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
  optionsSuccessStatus: 204,
};

// CORS harus dipasang sebelum semua routes
app.use(cors(corsOptions));

// Tangani preflight OPTIONS
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// STATIC FILES
// ======================

const uploadPath = path.join(__dirname, "uploads");

console.log("Upload Folder:", uploadPath);

app.use("/uploads", express.static(uploadPath));

// ======================
// ROUTES
// ======================

const authRoutes = require("./routes/authRoutes");
const pendaftaranRoutes = require("./routes/pendaftaranRoutes");
const pemainRoutes = require("./routes/pemainRoutes");
const pelatihRoutes = require("./routes/pelatihRoutes");
const materiRoutes = require("./routes/materiRoutes");
const pertandinganRoutes = require("./routes/pertandinganRoutes");
const pelatihKelompokRoutes = require("./routes/pelatihKelompok");
const raportRoutes = require("./routes/raport");
const gantiPasswordRoutes = require("./routes/gantiPassword");
const akunSiswaRoutes = require("./routes/akunSiswa");
const gantiPasswordSiswaRoutes = require("./routes/gantiPasswordSiswaRoutes");
const exportRoutes = require("./routes/exportRoutes");

app.use("/api/pelatih-kelompok", pelatihKelompokRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pendaftaran", pendaftaranRoutes);
app.use("/api/pemain", pemainRoutes);
app.use("/api/pelatih", pelatihRoutes);
app.use("/api/materi", materiRoutes);
app.use("/api/pertandingan", pertandinganRoutes);
app.use("/api/raport", raportRoutes);
app.use("/api/ganti-password", gantiPasswordRoutes);
app.use("/api/akun-siswa", akunSiswaRoutes);
app.use("/api/ganti-password-siswa", gantiPasswordSiswaRoutes);
app.use("/api/export", exportRoutes);

// ======================
// TEST ROUTE
// ======================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Gagak Muda Academy Running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ======================
// 404 HANDLER
// ======================

app.use((req, res) => {
  console.error("API route not found:", req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    method: req.method,
    path: req.originalUrl,
  });
});

// ======================
// ERROR HANDLER
// ======================

app.use((err, req, res, next) => {
  console.error("Backend error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin tidak diizinkan oleh CORS",
    });
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

// ======================
// START SERVER
// ======================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend berjalan di port ${PORT}`);
  });
}

module.exports = app;
