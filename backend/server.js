const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

// ======================
// MIDDLEWARE GLOBAL
// ======================

app.use(cors());
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

app.use("/api/pelatih-kelompok",pelatihKelompokRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pendaftaran", pendaftaranRoutes);
app.use("/api/pemain", pemainRoutes);
app.use("/api/pelatih", pelatihRoutes);
app.use("/api/materi", materiRoutes);
app.use("/api/pertandingan", pertandinganRoutes);
app.use("/api/raport", raportRoutes);
app.use("/api/ganti-password", gantiPasswordRoutes);
app.use("/api/akun-siswa", akunSiswaRoutes);
app.use("/api/ganti-password-siswa",gantiPasswordSiswaRoutes);
app.use("/api/export", exportRoutes);

// ======================
// TEST ROUTE
// ======================

app.get("/", (req, res) => {
  res.send("Backend Gagak Muda Academy Running 🚀");
});

// ======================
// START SERVER
// ======================

app.listen(PORT, () => {
  console.log(`🚀 Server running smoothly on port ${PORT}`);
});