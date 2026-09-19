import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ProfilSiswa() {
  const navigate = useNavigate();

  const [pemain, setPemain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // AMBIL DATA PROFIL PEMAIN
  // ==================================================
  useEffect(() => {
    const loadProfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(userData);

        // KHUSUS SISWA
        if (user.role !== "siswa") {
          navigate("/");
          return;
        }

        const pemainId = user.pemain_id;

        if (!pemainId) {
          setError("Data pemain tidak ditemukan.");
          return;
        }

        console.log("Pemain ID:", pemainId);

        // ==================================================
        // AMBIL DATA PEMAIN
        // ==================================================
        const response = await api.get(
          `/pemain/${pemainId}`
        );

        console.log(
          "Data pemain:",
          response.data
        );

        setPemain(response.data);
      } catch (err) {
        console.error(
          "Gagal mengambil profil pemain:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data profil pemain."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfil();
  }, [navigate]);

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-slate-600 font-semibold">
            Memuat profil...
          </p>

        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================
  if (error || !pemain) {
    return (
      <div className="min-h-screen bg-slate-100 p-5">

        <div className="max-w-md mx-auto">

          <button
            onClick={() =>
              navigate("/dashboard-siswa")
            }
            className="mb-5 text-indigo-600 font-bold text-sm"
          >
            ← Kembali
          </button>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center">

            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
              !
            </div>

            <h2 className="text-lg font-black text-slate-900">
              Profil Tidak Ditemukan
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {error ||
                "Data pemain tidak tersedia."}
            </p>

            <button
              onClick={() =>
                navigate("/dashboard-siswa")
              }
              className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm"
            >
              Kembali ke Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // FORMAT TANGGAL
  // ==================================================
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    try {
      return new Date(
        tanggal
      ).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // ==================================================
  // FOTO PEMAIN
  // ==================================================

  const foto = pemain?.foto_pemain || null;

  // ==================================================
  // URL FOTO
  //
  // Jika database menyimpan:
  // 1757151234567.jpg
  //
  // otomatis menjadi:
  // http://localhost:5000/uploads/1757151234567.jpg
  //
  // Jika database sudah menyimpan URL lengkap,
  // URL tersebut langsung digunakan.
  // ==================================================

  const fotoUrl = foto
    ? foto.startsWith("http://") ||
      foto.startsWith("https://")
      ? foto
      : `/uploads/${foto}`
    : null;

  // ==================================================
  // RETURN
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 pb-10">

      <div className="max-w-md mx-auto px-5 pt-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center gap-3 mb-6">

          {/* TOMBOL KEMBALI */}

          <button
            onClick={() =>
              navigate("/dashboard-siswa")
            }
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-lg"
          >
            ←
          </button>

          {/* JUDUL */}

          <div>

            <h1 className="text-xl font-black">
              Profil Pemain
            </h1>

            <p className="text-xs text-slate-500">
              Informasi data pemain
            </p>

          </div>

        </div>

        {/* ==================================================
            PROFIL UTAMA
        ================================================== */}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

          {/* ==================================================
              HEADER PROFIL
          ================================================== */}

          <div className="bg-indigo-700 text-white p-6 text-center">

            {/* ==================================================
                FOTO PEMAIN
            ================================================== */}

            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 border-4 border-white/30 overflow-hidden flex items-center justify-center">

              {fotoUrl ? (

                <img
                  src={fotoUrl}
                  alt={
                    pemain.nama ||
                    "Foto Pemain"
                  }
                  className="w-full h-full object-cover"
                />

              ) : (

                <span className="text-3xl font-black">
                  {(pemain.nama || "P")
                    .charAt(0)
                    .toUpperCase()}
                </span>

              )}

            </div>

            {/* ==================================================
                NAMA PEMAIN
            ================================================== */}

            <h2 className="text-xl font-black mt-4">
              {pemain.nama ||
                "Nama Pemain"}
            </h2>

            {/* ==================================================
                KELOMPOK UMUR
            ================================================== */}

            <p className="text-indigo-200 text-sm mt-1">
              {pemain.kelompok_umur ||
                "-"}
            </p>

          </div>

          {/* ==================================================
              DATA PEMAIN
          ================================================== */}

          <div className="p-5 space-y-4">

            <p className="text-xs text-slate-400 uppercase font-bold">
              Informasi Pemain
            </p>

            {/* ID */}

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">

              <span className="text-sm text-slate-500">
                ID Pemain
              </span>

              <span className="font-bold text-slate-800">
                #{pemain.id || "-"}
              </span>

            </div>

            {/* NAMA */}

            <div className="flex justify-between items-start border-b border-slate-100 pb-3 gap-4">

              <span className="text-sm text-slate-500">
                Nama Lengkap
              </span>

              <span className="font-bold text-slate-800 text-right">
                {pemain.nama || "-"}
              </span>

            </div>

            {/* TANGGAL LAHIR */}

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">

              <span className="text-sm text-slate-500">
                Tanggal Lahir
              </span>

              <span className="font-bold text-slate-800 text-right">
                {formatTanggal(
                  pemain.tanggal_lahir
                )}
              </span>

            </div>

            {/* KELOMPOK UMUR */}

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">

              <span className="text-sm text-slate-500">
                Kelompok Umur
              </span>

              <span className="font-bold text-indigo-600">
                {pemain.kelompok_umur ||
                  "-"}
              </span>

            </div>

            {/* JENIS KELAMIN */}

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">

              <span className="text-sm text-slate-500">
                Jenis Kelamin
              </span>

              <span className="font-bold text-slate-800">
                {pemain.jenis_kelamin ||
                  "Laki-laki"}
              </span>

            </div>

            {/* ASAL SEKOLAH */}

            <div className="flex justify-between items-start border-b border-slate-100 pb-3 gap-4">

              <span className="text-sm text-slate-500">
                Asal Sekolah
              </span>

              <span className="font-bold text-slate-800 text-right max-w-[200px]">
                {pemain.asal_sekolah ||
                  "-"}
              </span>

            </div>

            {/* ALAMAT */}

            <div className="flex justify-between items-start border-b border-slate-100 pb-3 gap-4">

              <span className="text-sm text-slate-500">
                Alamat
              </span>

              <span className="font-bold text-slate-800 text-right max-w-[200px]">
                {pemain.alamat || "-"}
              </span>

            </div>

            {/* NOMOR TELEPON */}

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">

              <span className="text-sm text-slate-500">
                Nomor Telepon
              </span>

              <span className="font-bold text-slate-800 text-right">
                {pemain.no_hp ||
                  pemain.nomor_telepon ||
                  "-"}
              </span>

            </div>

            {/* NAMA ORANG TUA */}

            <div className="flex justify-between items-start gap-4">

              <span className="text-sm text-slate-500">
                Orang Tua / Wali
              </span>

              <span className="font-bold text-slate-800 text-right max-w-[200px]">
                {pemain.nama_orang_tua ||
                  pemain.nama_wali ||
                  "-"}
              </span>

            </div>

          </div>

        </div>

        {/* ==================================================
            AKSI
        ================================================== */}

        <div className="mt-5">

          <button
            onClick={() =>
              navigate("/raport-saya")
            }
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-bold text-sm shadow-sm transition"
          >
            Lihat Rapor Saya
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProfilSiswa;