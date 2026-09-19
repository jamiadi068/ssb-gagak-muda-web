import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function HistoriRaportSiswa() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [pemain, setPemain] = useState(null);
  const [raport, setRaport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // FORMAT POSISI
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


  // ==================================================
  // FORMAT TANGGAL
  // ==================================================
  const formatTanggal = (tanggal) => {
    if (!tanggal) {
      return "-";
    }

    try {
      return new Date(tanggal).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };


  // ==================================================
  // FORMAT JAM
  // ==================================================
  const formatJam = (tanggal) => {
    if (!tanggal) {
      return "";
    }

    try {
      return new Date(tanggal).toLocaleTimeString(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };


  // ==================================================
  // LOAD DATA
  // ==================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        // ==============================================
        // CEK LOGIN
        // ==============================================
        if (!token || !userData) {
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);

        // ==============================================
        // ID PEMAIN
        // ==============================================
        const pemainId = parsedUser.pemain_id;

        if (!pemainId) {
          setError("Data pemain tidak ditemukan.");
          return;
        }

        // ==============================================
        // AMBIL DATA PEMAIN
        // ==============================================
        try {
          const pemainResponse = await api.get(
            `/pemain/${pemainId}`
          );

          console.log(
            "DATA PEMAIN HISTORI:",
            pemainResponse.data
          );

          setPemain(pemainResponse.data);

        } catch (err) {
          console.error(
            "Gagal mengambil data pemain:",
            err
          );
        }


        // ==============================================
        // AMBIL SEMUA RAPORT
        // ==============================================
        const raportResponse = await api.get(
          `/raport/pemain/${pemainId}`
        );

        console.log(
          "DATA HISTORI RAPORT:",
          raportResponse.data
        );

        if (Array.isArray(raportResponse.data)) {

          setRaport(raportResponse.data);

        } else {

          setRaport([]);

        }

      } catch (err) {

        console.error(
          "Gagal mengambil histori raport:",
          err
        );

        setError(
          "Gagal mengambil histori raport."
        );

      } finally {

        setLoading(false);

      }
    };

    loadData();

  }, [navigate]);


  // ==================================================
  // KEMBALI
  // ==================================================
  const handleBack = () => {
    navigate("/dashboard-siswa");
  };


  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-slate-600 font-semibold">
            Memuat histori rapor...
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
    "-";


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
  // RENDER
  // ==================================================
  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 font-sans pb-10">

      <div className="max-w-md mx-auto min-h-screen">


        {/* ==================================================
            HEADER
        ================================================== */}
        <header className="px-5 pt-7 pb-5">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={handleBack}
              className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xl hover:bg-slate-50 active:scale-95 transition"
            >
              ←
            </button>

            <div className="flex-1">

              <p className="text-xs text-slate-500 font-medium">
                SSB Gagak Muda
              </p>

              <h1 className="text-xl font-black text-slate-900">
                Histori Rapor
              </h1>

            </div>

            <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-sm">
              {getInitial()}
            </div>

          </div>

        </header>


        {/* ==================================================
            IDENTITAS SISWA
        ================================================== */}
        <section className="px-5">

          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[28px] p-5 text-white shadow-xl">

            <p className="text-indigo-200 text-[10px] uppercase tracking-wider font-bold">
              Pemain
            </p>

            <h2 className="text-xl font-black mt-1">
              {nama}
            </h2>

            <div className="flex items-center gap-2 mt-3">

              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
                {kelompokUmur}
              </span>

              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
                {raport.length} Rapor
              </span>

            </div>

          </div>

        </section>


        {/* ==================================================
            ERROR
        ================================================== */}
        {error && (

          <section className="px-5 mt-5">

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-semibold">
              {error}
            </div>

          </section>

        )}


        {/* ==================================================
            TIDAK ADA RAPOR
        ================================================== */}
        {!error && raport.length === 0 && (

          <section className="px-5 mt-7">

            <div className="bg-white rounded-[26px] p-8 border border-slate-200 shadow-sm text-center">

              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto">
                📄
              </div>

              <h2 className="font-black text-slate-900 mt-4">
                Belum Ada Rapor
              </h2>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Belum ada rapor yang dibuat oleh pelatih
                untuk pemain ini.
              </p>

            </div>

          </section>

        )}


        {/* ==================================================
            HISTORI RAPOR
        ================================================== */}
        {raport.length > 0 && (

          <section className="px-5 mt-7">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-black text-slate-900">
                  Riwayat Evaluasi
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Seluruh rapor pemain
                </p>

              </div>

              <div className="text-xs font-bold text-indigo-600">
                {raport.length} Rapor
              </div>

            </div>


            {/* ==================================================
                TIMELINE
            ================================================== */}
            <div className="relative">


              {/* GARIS TIMELINE */}

              <div className="absolute left-[18px] top-3 bottom-3 w-[2px] bg-indigo-100"></div>


              <div className="space-y-6">

                {raport.map((item, index) => {

                  const namaPelatih =
                    item.nama_pelatih ||
                    "-";

                  const rataRata =
                    Number(item.rata_rata || 0);

                  const posisi =
                    formatPosisi(
                      item.posisi
                    );

                  const isLatest =
                    index === 0;


                  return (

                    <div
                      key={item.id_raport}
                      className="relative pl-11"
                    >

                      {/* ==========================================
                          TITIK TIMELINE
                      ========================================== */}

                      <div
                        className={`absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center border-4 border-[#f2f2f7] shadow-sm ${
                          isLatest
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-indigo-600"
                        }`}
                      >
                        📄
                      </div>


                      {/* ==========================================
                          CARD RAPOR
                      ========================================== */}

                      <div
                        className={`bg-white rounded-[26px] p-5 border shadow-sm ${
                          isLatest
                            ? "border-indigo-200 shadow-indigo-100"
                            : "border-slate-200"
                        }`}
                      >

                        {/* HEADER CARD */}

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            {isLatest && (

                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wide mb-2">
                                Rapor Terbaru
                              </span>

                            )}

                            <h3 className="font-black text-slate-900 text-base">
                              {item.periode || "Periode Rapor"}
                            </h3>

                            <p className="text-xs text-slate-400 mt-1">
                              {formatTanggal(item.created_at)}
                              {" • "}
                              {formatJam(item.created_at)}
                            </p>

                          </div>


                          {/* NILAI */}

                          <div className="text-right shrink-0">

                            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
                              Nilai
                            </p>

                            <p className="text-2xl font-black text-indigo-600 leading-none mt-1">
                              {rataRata.toFixed(2)}
                            </p>

                          </div>

                        </div>


                        {/* ==========================================
                            INFO RAPOR
                        ========================================== */}

                        <div className="grid grid-cols-2 gap-3 mt-5">


                          {/* PELATIH */}

                          <div className="bg-slate-50 rounded-2xl p-3">

                            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
                              Pelatih
                            </p>

                            <p className="text-sm font-extrabold text-slate-800 mt-1 truncate">
                              {namaPelatih}
                            </p>

                          </div>


                          {/* POSISI */}

                          <div className="bg-slate-50 rounded-2xl p-3">

                            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
                              Posisi
                            </p>

                            <p className="text-sm font-extrabold text-slate-800 mt-1 truncate">
                              {posisi}
                            </p>

                          </div>

                        </div>


                        {/* ==========================================
                            CATATAN PELATIH
                        ========================================== */}

                        {item.catatan_pelatih && (

                          <div className="mt-4">

                            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-1">
                              Catatan Pelatih
                            </p>

                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">

                              <p className="text-xs text-slate-700 leading-relaxed">
                                {item.catatan_pelatih}
                              </p>

                            </div>

                          </div>

                        )}


                        {/* ==========================================
                            DETAIL RAPOR
                        ========================================== */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/raport-saya/${item.id_raport}`
                            )
                          }
                          className="w-full mt-5 bg-indigo-600 text-white rounded-2xl py-3.5 text-sm font-black hover:bg-indigo-700 active:scale-[0.98] transition"
                        >
                          Lihat Detail Rapor →
                        </button>

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          </section>

        )}


        {/* ==================================================
            FOOTER
        ================================================== */}
        <section className="px-5 mt-8 pb-5">

          <button
            type="button"
            onClick={handleBack}
            className="w-full bg-white border border-slate-200 text-slate-600 rounded-[22px] py-4 font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
          >
            ← Kembali ke Dashboard
          </button>

        </section>

      </div>

    </div>
  );
}

export default HistoriRaportSiswa;