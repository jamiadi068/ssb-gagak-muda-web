import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StatistikPelatih() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [pemain, setPemain] = useState([]);
  const [jumlahRaport, setJumlahRaport] = useState(0);
  const [rataRataRapor, setRataRataRapor] = useState(0);
  const [materi, setMateri] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // CEK LOGIN
  // ==================================================
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);

      setUser(parsedUser);

      fetchData(parsedUser);
    } catch (err) {
      console.error("ERROR LOGIN:", err);
      navigate("/login");
    }
  }, [navigate]);

  // ==================================================
  // FETCH SEMUA DATA
  // ==================================================
  const fetchData = async (parsedUser) => {
    try {
      setLoading(true);
      setError("");

      // ==================================================
      // PEMAIN YANG DITANGANI PELATIH
      // ==================================================
      const pemainRes = await axios.get(
        `/api/pemain/pelatih/${parsedUser.id}`
      );

      const daftarPemain = Array.isArray(pemainRes.data)
        ? pemainRes.data
        : [];

      setPemain(daftarPemain);

      // ==================================================
      // HITUNG RATA-RATA NILAI RAPOR
      // KHUSUS PEMAIN YANG DITANGANI PELATIH
      // ==================================================

      let totalNilai = 0;
      let jumlahRaporDenganNilai = 0;

      for (const pemainItem of daftarPemain) {
        try {
          const raportRes = await axios.get(
            `/api/raport/pemain/${pemainItem.id}`
          );

          const daftarRaport = Array.isArray(raportRes.data)
            ? raportRes.data
            : [];

          for (const raport of daftarRaport) {
            const rataRata = Number(raport.rata_rata);

            if (!isNaN(rataRata)) {
              totalNilai += rataRata;
              jumlahRaporDenganNilai++;
            }
          }
        } catch (err) {
          console.error(
            `Gagal mengambil rapor pemain ${pemainItem.nama}:`,
            err
          );
        }
      }

      const hasilRataRata =
        jumlahRaporDenganNilai > 0
          ? totalNilai / jumlahRaporDenganNilai
          : 0;

      setRataRataRapor(
        Number(hasilRataRata.toFixed(2))
      );

      // ==================================================
      // JUMLAH RAPORT
      // ==================================================
      try {
        const raportRes = await axios.get(
          `/api/raport/pelatih/${parsedUser.id}`
        );

        setJumlahRaport(
          Number(
            raportRes.data?.jumlah ||
              raportRes.data?.count ||
              0
          )
        );
      } catch (raportError) {
        console.error(
          "GAGAL FETCH RAPORT:",
          raportError
        );

        setJumlahRaport(0);
      }

      // ==================================================
      // MATERI
      // ==================================================
      try {
        const materiRes = await axios.get(
          "/api/materi"
        );

        const normalize = (value) =>
          String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        const namaPelatih = normalize(
          parsedUser.nama
        );

        const materiSaya = Array.isArray(
          materiRes.data
        )
          ? materiRes.data.filter((item) => {
              const namaDb = normalize(
                item.nama_pelatih
              );

              return (
                namaDb === namaPelatih ||
                namaPelatih.includes(namaDb)
              );
            })
          : [];

        setMateri(materiSaya);
      } catch (materiError) {
        console.error(
          "GAGAL FETCH MATERI:",
          materiError
        );

        setMateri([]);
      }
    } catch (err) {
      console.error(
        "GAGAL MENGAMBIL DATA STATISTIK:",
        err
      );

      setError(
        "Gagal mengambil data statistik. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // KELOMPOK UMUR
  // ==================================================
  const statistikKelompokUmur = pemain.reduce(
    (acc, item) => {
      const kelompok =
        item.kelompok_umur || "Tidak Ada";

      if (!acc[kelompok]) {
        acc[kelompok] = 0;
      }

      acc[kelompok]++;

      return acc;
    },
    {}
  );

  // ==================================================
  // TOTAL PEMAIN
  // ==================================================
  const totalPemain = pemain.length;

  // ==================================================
  // KELOMPOK UMUR ENTRIES
  // ==================================================
  const kelompokEntries = Object.entries(
    statistikKelompokUmur
  );

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Memuat statistik...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // UI
  // ==================================================
  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                navigate("/dashboard-pelatih")
              }
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Statistik Pelatih
              </h1>

              <p className="text-sm text-gray-500">
                Statistik perkembangan pemain dan aktivitas pelatih
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ERROR */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* ==================================================
            WELCOME
        ================================================== */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-sm">

          <p className="text-indigo-100 text-sm mb-1">
            Statistik Pelatih
          </p>

          <h2 className="text-2xl font-bold">
            {user?.nama || "Pelatih"}
          </h2>

          <p className="text-indigo-100 text-sm mt-2">
            Berikut ringkasan data pemain dan aktivitas Anda.
          </p>

        </div>

        {/* ==================================================
            STAT CARD
        ================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* ==================================================
              TOTAL PEMAIN
          ================================================== */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Pemain
                </p>

                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalPemain}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Pemain aktif yang Anda tangani
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
                👥
              </div>

            </div>

          </div>

          {/* ==================================================
              RAPORT
          ================================================== */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Rapor Selesai
                </p>

                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {jumlahRaport}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Rapor yang sudah dibuat
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                📄
              </div>

            </div>

          </div>

          {/* ==================================================
              MATERI
          ================================================== */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Materi Latihan
                </p>

                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {materi.length}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Materi yang Anda buat
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
                📚
              </div>

            </div>

          </div>

          {/* ==================================================
              RATA-RATA NILAI RAPOR
          ================================================== */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Rata-rata Nilai Rapor
                </p>

                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {rataRataRapor > 0
                    ? rataRataRapor.toFixed(2)
                    : "-"}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Rata-rata nilai pemain Anda
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                📊
              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            KELOMPOK UMUR
        ================================================== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Pemain Berdasarkan Kelompok Umur
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Distribusi pemain yang Anda tangani
              </p>
            </div>

            <div className="text-2xl">
              ⚽
            </div>

          </div>

          {kelompokEntries.length === 0 ? (

            <div className="text-center py-10 text-gray-400">
              Belum ada data pemain.
            </div>

          ) : (

            <div className="space-y-4">

              {kelompokEntries.map(
                ([kelompok, jumlah]) => {

                  const persentase =
                    totalPemain > 0
                      ? Math.round(
                          (jumlah / totalPemain) * 100
                        )
                      : 0;

                  return (
                    <div key={kelompok}>

                      <div className="flex items-center justify-between mb-2">

                        <div className="flex items-center gap-2">

                          <span className="font-bold text-gray-800">
                            {kelompok}
                          </span>

                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {jumlah} pemain
                          </span>

                        </div>

                        <span className="text-sm font-semibold text-indigo-600">
                          {persentase}%
                        </span>

                      </div>

                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${persentase}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* ==================================================
            RINGKASAN
        ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

          {/* ==================================================
              INFORMASI
          ================================================== */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Ringkasan
            </h2>

            <div className="space-y-3">

              <div className="flex items-center justify-between py-3 border-b border-gray-100">

                <span className="text-sm text-gray-500">
                  Pemain Aktif
                </span>

                <span className="font-bold text-gray-900">
                  {totalPemain}
                </span>

              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">

                <span className="text-sm text-gray-500">
                  Total Rapor
                </span>

                <span className="font-bold text-gray-900">
                  {jumlahRaport}
                </span>

              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">

                <span className="text-sm text-gray-500">
                  Rata-rata Nilai Rapor
                </span>

                <span className="font-bold text-indigo-600">
                  {rataRataRapor > 0
                    ? rataRataRapor.toFixed(2)
                    : "-"}
                </span>

              </div>

              <div className="flex items-center justify-between py-3">

                <span className="text-sm text-gray-500">
                  Materi Latihan
                </span>

                <span className="font-bold text-gray-900">
                  {materi.length}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              AKSES CEPAT
          ================================================== */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Akses Cepat
            </h2>

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  navigate("/pemain-saya")
                }
                className="p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition"
              >
                👥
                <br />
                Pemain Saya
              </button>

              <button
                onClick={() =>
                  navigate("/raport-siswa")
                }
                className="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold transition"
              >
                📄
                <br />
                Rapor Siswa
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default StatistikPelatih;