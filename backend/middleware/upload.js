const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================================================
// 📁 FOLDER UPLOAD
// ==================================================

const uploadDir = path.join(__dirname, "../uploads");

// ==================================================
// 🖥️ LOCAL DEVELOPMENT
// ==================================================
// Folder uploads tetap dibuat ketika menjalankan
// backend di komputer sendiri.

if (!process.env.VERCEL) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// ==================================================
// 📦 STORAGE
// ==================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (process.env.VERCEL) {
      // Vercel tidak mengizinkan penulisan permanen
      // ke folder project.
      cb(null, "/tmp");
    } else {
      cb(null, uploadDir);
    }
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      unique + path.extname(file.originalname)
    );
  },
});

// ==================================================
// 🚀 MULTER
// ==================================================

const upload = multer({
  storage,
});

module.exports = upload;