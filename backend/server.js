const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

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
    // Izinkan request tanpa origin
    // contoh: Postman / server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("Not allowed by CORS")
    );
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

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

// ======================
// STATIC FILES
// ======================

const uploadPath = path.join(__dirname, "uploads");

console.log("📁 Upload Folder:", uploadPath);

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

app.use(
  "/api/pelatih-kelompok",
  pelatihKelompokRoutes
);

app.use("/api/auth", authRoutes);
app.use("/api/pendaftaran", pendaftaranRoutes);
app.use("/api/pemain", pemainRoutes);
app.use("/api/pelatih", pelatihRoutes);
app.use("/api/materi", materiRoutes);
app.use("/api/pertandingan", pertandinganRoutes);
app.use("/api/raport", raportRoutes);
app.use("/api/ganti-password", gantiPasswordRoutes);
app.use("/api/akun-siswa", akunSiswaRoutes);

app.use(
  "/api/ganti-password-siswa",
  gantiPasswordSiswaRoutes
);

app.use("/api/export", exportRoutes);

// ======================
// TEST ROUTE
// ======================

app.get("/", (req, res) => {
  res.send(
    "Backend Gagak Muda Academy Running 🚀"
  );
});

// ======================
// START SERVER
// ======================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running smoothly on port ${PORT}`
    );
  });
}

module.exports = app;