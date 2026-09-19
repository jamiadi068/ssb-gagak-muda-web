function hitungKelompokUmur(tanggalLahirString) {
  if (!tanggalLahirString) return null;

  const birthDate = new Date(tanggalLahirString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age <= 7) return "U7";
  if (age <= 9) return "U9";
  if (age <= 10) return "U10";
  if (age <= 11) return "U11";
  if (age <= 12) return "U12";
  if (age <= 13) return "U13";
  if (age <= 14) return "U14";
  if (age <= 15) return "U15";
  if (age <= 16) return "U16";
  
  return `U${age}`;
}

module.exports = {
  hitungKelompokUmur,
};