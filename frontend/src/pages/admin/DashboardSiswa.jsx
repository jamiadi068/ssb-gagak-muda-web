import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function DashboardSiswa() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [pemain, setPemain] = useState(null);
  const [raport, setRaport] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // CEK LOGIN + AMBIL DATA PEMAIN + RAPORT
  // ==================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);

        const pemainId = parsedUser.pemain_id;

        if (!pemainId) {
          console.warn("Pemain ID tidak ditemukan");
          return;
        }

        // ==================================================
        // 1. AMBIL DATA PEMAIN
        // ==================================================
        try {
          const pemainResponse = await api.get(
            `/pemain/${pemainId}`
          );

          console.log(
            "DATA PEMAIN:",
            pemainResponse.data
          );

          setPemain(pemainResponse.data);
        } catch (err) {
          console.error(
            "Gagal mengambil data pemain:",
            err
          );
        }

        // ==================================================
        // 2. AMBIL DATA RAPORT
        // POSISI DIAMBIL DARI RAPORT TERBARU
        // ==================================================
        try {
          const raportResponse = await api.get(
            `/raport/pemain/${pemainId}`
          );

          console.log(
            "DATA RAPORT:",
            raportResponse.data
          );

          if (
            Array.isArray(raportResponse.data) &&
            raportResponse.data.length > 0
          ) {
            setRaport(raportResponse.data[0]);
          }
        } catch (err) {
          console.error(
            "Gagal mengambil data raport:",
            err
          );
        }
      } catch (err) {
        console.error(
          "Gagal membaca data siswa:",
          err
        );

        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // ==================================================
  // LOGOUT
  // ==================================================
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-slate-600 font-semibold">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // DATA SISWA
  // ==================================================

  const nama =
    pemain?.nama ||
    user?.nama ||
    "Siswa";

  const kelompokUmur =
    pemain?.kelompok_umur ||
    pemain?.kelompokUmur ||
    user?.kelompok_umur ||
    user?.kelompokUmur ||
    "-";

  // ==================================================
  // POSISI
  //
  // PRIORITAS:
  // 1. POSISI DARI RAPORT TERBARU
  // 2. POSISI DARI DATA PEMAIN
  // 3. POSISI DARI USER
  // ==================================================

  const posisi =
    raport?.posisi ||
    pemain?.posisi ||
    pemain?.position ||
    user?.posisi ||
    user?.position ||
    "-";

  // ==================================================
  // KONVERSI POSISI
  // ==================================================

  const formatPosisi = (value) => {
    if (!value || value === "-") {
      return "-";
    }

    const posisiMap = {
      GK: "Goalkeeper",

      CB: "Centre Back",
      LB: "Left Back",
      RB: "Right Back",

      LWB: "Left Wing Back",
      RWB: "Right Wing Back",

      CDM: "Defensive Midfielder",

      CM: "Central Midfielder",

      CAM: "Attacking Midfielder",

      AM: "Attacking Midfielder",

      LM: "Left Midfielder",
      RM: "Right Midfielder",

      LW: "Left Winger",
      RW: "Right Winger",

      CF: "Centre Forward",

      ST: "Striker",

      SS: "Second Striker",

      FW: "Forward",

      MF: "Midfielder",

      DF: "Defender",
    };

    const key = String(value)
      .trim()
      .toUpperCase();

    return posisiMap[key] || value;
  };

  const posisiLengkap =
    formatPosisi(posisi);

  // ==================================================
  // NAMA PELATIH
  // ==================================================

  const namaPelatih =
    pemain?.nama_pelatih ||
    pemain?.namaPelatih ||
    user?.nama_pelatih ||
    user?.namaPelatih ||
    "-";

  // ==================================================
  // FOTO PEMAIN
  // ==================================================

  const foto =
    pemain?.foto_pemain ||
    pemain?.foto ||
    user?.foto ||
    user?.foto_pemain ||
    null;

  // ==================================================
  // URL FOTO
  //
  // Jika database hanya menyimpan nama file:
  // contoh:
  // 1757151234567.jpg
  //
  // maka otomatis menjadi:
  // http://localhost:5000/uploads/1757151234567.jpg
  //
  // Kalau sudah berupa URL lengkap, langsung digunakan.
  // ==================================================

  const fotoUrl = foto
    ? foto.startsWith("http://") ||
      foto.startsWith("https://")
      ? foto
      : `/uploads/${foto}`
    : null;

  // ==================================================
  // INITIAL
  // ==================================================

  const getInitial = () => {
    if (!nama) return "S";

    return nama
      .charAt(0)
      .toUpperCase();
  };

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 font-sans pb-28">

      {/* ==================================================
          MOBILE APP CONTAINER
      ================================================== */}

      <div className="max-w-md mx-auto min-h-screen bg-[#f2f2f7]">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="px-5 pt-8 pb-5">

          <div className="flex items-center justify-between">

            {/* PROFIL */}

            <div className="flex items-center gap-3">

              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={nama}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                  {getInitial()}
                </div>
              )}

              <div>

                <p className="text-xs text-slate-500 font-medium">
                  Selamat datang 👋
                </p>

                <h1 className="text-lg font-black text-slate-900">
                  {nama}
                </h1>

              </div>

            </div>

            {/* NOTIFICATION */}

            <button
              type="button"
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200"
            >
              🔔
            </button>

          </div>

        </header>

        {/* ==================================================
            HERO CARD
        ================================================== */}

        <section className="px-5">

          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl">

            {/* DECORATION */}

            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>

            <div className="absolute -right-16 bottom-[-50px] w-44 h-44 bg-white/5 rounded-full"></div>

            <div className="relative">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                    Pemain SSB Gagak Muda
                  </p>

                  <h2 className="text-2xl font-black mt-1">
                    {nama}
                  </h2>

                </div>

                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl">
                  ⚽
                </div>

              </div>

              {/* INFO */}

              <div className="grid grid-cols-2 gap-3 mt-7">

                {/* KELOMPOK */}

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">

                  <p className="text-indigo-200 text-[10px] uppercase font-bold">
                    Kelompok
                  </p>

                  <p className="text-lg font-black mt-0.5">
                    {kelompokUmur}
                  </p>

                </div>

                {/* POSISI */}

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">

                  <p className="text-indigo-200 text-[10px] uppercase font-bold">
                    Posisi
                  </p>

                  <p className="text-lg font-black mt-0.5">
                    {posisiLengkap}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            STATUS PELATIH
        ================================================== */}

        <section className="px-5 mt-5">

          <div className="bg-white rounded-[26px] p-5 border border-slate-200 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                  👨‍🏫
                </div>

                <div>

                  <p className="text-xs text-slate-500 font-medium">
                    Pelatih Saya
                  </p>

                  <p className="font-extrabold text-slate-900">
                    {namaPelatih}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-1.5">

                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

                <span className="text-xs text-emerald-600 font-bold">
                  Aktif
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            MENU UTAMA
        ================================================== */}

        <section className="px-5 mt-7">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-black text-slate-900">
              Menu Saya
            </h2>

            <span className="text-xs text-slate-400 font-medium">
              SSB Gagak Muda
            </span>

          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* RAPOR */}

            <button
              type="button"
              onClick={() => navigate("/raport-saya")}
              className="text-left bg-white rounded-[26px] p-5 border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.98] transition"
            >

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-4">
                📄
              </div>

              <h3 className="font-black text-slate-900">
                Rapor Saya
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Lihat hasil evaluasi dan perkembangan
              </p>

              <div className="mt-4 text-emerald-600 text-xs font-bold">
                Lihat Rapor →
              </div>

            </button>

            {/* PROFIL */}

            <button
              type="button"
              onClick={() => navigate("/profil-siswa")}
              className="text-left bg-white rounded-[26px] p-5 border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.98] transition"
            >

              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-4">
                👤
              </div>

              <h3 className="font-black text-slate-900">
                Profil Saya
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Data pribadi dan informasi pemain
              </p>

              <div className="mt-4 text-amber-600 text-xs font-bold">
                Lihat Profil →
              </div>

            </button>

          </div>

        </section>

        {/* ==================================================
            LOGOUT
        ================================================== */}

        <section className="px-5 mt-7">

          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-white border border-red-200 text-red-600 rounded-[22px] py-4 font-bold text-sm shadow-sm hover:bg-red-50 active:scale-[0.99] transition"
          >
            🚪 Keluar dari Akun
          </button>

        </section>

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">

          <div className="max-w-md mx-auto">

            <nav className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[26px] shadow-2xl px-3 py-2">

              <div className="grid grid-cols-3">

                {/* RAPOR */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/histori-raport-siswa")
                  }
                  className="flex flex-col items-center justify-center py-2 text-slate-400 hover:text-indigo-600 transition"
                >

                  <span className="text-xl">
                    📄
                  </span>

                  <span className="text-[10px] font-bold mt-1">
                    Histori rapor
                  </span>

                </button>

                {/* PROFIL */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/profil-siswa")
                  }
                  className="flex flex-col items-center justify-center py-2 text-slate-400 hover:text-indigo-600 transition"
                >

                  <span className="text-xl">
                    👤
                  </span>

                  <span className="text-[10px] font-bold mt-1">
                    Profil
                  </span>

                </button>

                {/* GANTI PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/ganti-password-siswa")
                  }
                  className="flex flex-col items-center justify-center py-2 text-slate-400 hover:text-indigo-600 transition"
                >

                  <span className="text-xl">
                    🔑
                  </span>

                  <span className="text-[10px] font-bold mt-1">
                    Ganti Password
                  </span>

                </button>

              </div>

            </nav>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DashboardSiswa;