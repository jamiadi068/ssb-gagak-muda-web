import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RaportSiswa = () => {
  const navigate = useNavigate();

  const [pemain, setPemain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPemain = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          setError("Data login tidak ditemukan.");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);

        if (!parsedUser.id) {
          setError("ID pelatih tidak ditemukan pada data login.");
          setLoading(false);
          return;
        }

        console.log("ID Pelatih:", parsedUser.id);

        const response = await axios.get(
          `/api/pemain/pelatih/${parsedUser.id}`
        );

        console.log("Pemain yang ditangani pelatih:", response.data);

        setPemain(response.data);
      } catch (err) {
        console.error("Gagal mengambil pemain yang ditangani:", err);
        setError(
          err.response?.data?.message || "Gagal mengambil data pemain."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPemain();
  }, []);

  // Handler Navigasi Kembali ke Dashboard
  const handleKembali = () => {
    navigate("/dashboard-pelatih"); // Sesuaikan rute jika berbeda
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-700 font-medium">
            Memuat pemain yang ditangani...
          </p>
        </div>
      </div>
    );
  }

  // ================= ERROR STATE =================
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <p className="text-slate-800 text-lg font-semibold mb-6">{error}</p>
          <button
            onClick={handleKembali}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-xl transition shadow-md"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ================= MAIN CONTENT =================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER BAR & TOMBOL KEMBALI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={handleKembali}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              title="Kembali ke Dashboard Pelatih"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Dashboard</span>
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Raport Siswa
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Daftar pemain yang ditangani oleh pelatih yang sedang login.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200">
            Total {pemain.length} Siswa
          </span>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                  <th className="py-4 px-6 text-center w-16">No</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">Kelompok Umur</th>
                  <th className="py-4 px-6">Tanggal Lahir</th>
                  <th className="py-4 px-6">Posisi</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {pemain.length > 0 ? (
                  pemain.map((item, index) => {
                    const idPemain = item.id_pemain || item.id;
                    return (
                      <tr
                        key={idPemain || index}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4 px-6 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="py-4 px-6 font-extrabold text-slate-900">
                          {item.nama || "-"}
                        </td>

                        <td className="py-4 px-6">
                          {item.kelompok_umur ? (
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                              {item.kelompok_umur}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-slate-600">
                          {item.tanggal_lahir
                            ? new Date(item.tanggal_lahir).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>

                        <td className="py-4 px-6 text-slate-600 font-semibold">
                          {item.posisi || "-"}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() =>
                              navigate(`/buat-raport/${idPemain}`)
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm hover:shadow"
                          >
                            Buat Raport
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-slate-500"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">
                        📋
                      </div>
                      <p className="font-bold text-slate-700">
                        Belum Ada Pemain
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Belum ada pemain yang ditangani oleh pelatih ini.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RaportSiswa;