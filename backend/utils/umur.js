const hitungKelompokUmur = (tanggalLahir) => {
  const today = new Date();
  const birth = new Date(tanggalLahir);

  let umur = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  // Potong umur 1 tahun jika belum berulang tahun di tahun ini
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    umur--;
  }

  // Distribusi Kelompok Umur yang Benar dan Akurat
  if (umur >= 6 && umur <= 7) return "U7";
  if (umur >= 8 && umur <= 9) return "U9";
  if (umur >= 10 && umur <= 11) return "U11"; // Anak umur 10 & 11 tahun wajib masuk sini
  if (umur >= 12 && umur <= 13) return "U13";
  if (umur >= 14 && umur <= 15) return "U15";

  return null;
};

module.exports = { hitungKelompokUmur };