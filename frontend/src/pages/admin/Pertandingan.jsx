import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Pertandingan() {
  const [pertandingan, setPertandingan] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 5;

  const getPertandinganData = async () => {
    try {
      const res = await axios.get("/api/pertandingan");
      setPertandingan(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPertandinganData();
  }, []);

  const handleHapusPertandingan = async (id) => {
    try {
      const confirm = window.confirm("Yakin ingin menghapus jadwal pertandingan ini?");
      if (!confirm) return;

      const res = await axios.delete(`/api/pertandingan/${id}`);
      alert(res.data.message || "Pertandingan berhasil dihapus");
      getPertandinganData(); // Refresh data
    } catch (err) {
      console.error("Error saat menghapus:", err);
      alert("Gagal menghapus pertandingan: " + (err.response?.data?.error || err.message));
    }
  };

  const handleKembaliDashboard = () => {
    navigate("/dashboard");
  };

  // Logic Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pertandingan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pertandingan.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-start">
      
      {/* MAIN CONTENT ONLY */}
      <main className="w-full max-w-6xl p-6 md:p-10 bg-white rounded-2xl shadow-sm border border-slate-200/70 relative">
        
        {/* TOMBOL KEMBALI KE DASHBOARD (✕) */}
        <button 
          onClick={handleKembaliDashboard}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/60 transition-all font-bold active:scale-95"
          title="Kembali ke Dashboard"
        >
          ✕
        </button>

        {/* HERO SECTION */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pr-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              ⚽ Kelola Jadwal Pertandingan
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">
              Lihat, pantau, dan manajemen seluruh jadwal pertandingan Gagak Muda Academy.
            </p>
          </div>
          <button 
            onClick={() => navigate("/tambah-pertandingan")} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 self-start sm:self-center"
          >
            + Tambah Jadwal Baru
          </button>
        </div>

        {/* TABEL PERTANDINGAN */}
        <div className="bg-white rounded-xl border border-slate-200/70 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              📅 Semua Agenda Pertandingan
            </h2>
            <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md text-xs uppercase">
              {pertandingan.length} Total Match
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Tim Lawan</th>
                  <th className="px-6 py-4">Jadwal & Waktu</th>
                  <th className="px-6 py-4">Lokasi / Stadion</th>
                  <th className="px-6 py-4 text-center">Tipe Kompetisi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚔️</span>
                        <p className="font-bold text-slate-900 text-sm uppercase leading-snug">{item.lawan}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="text-sm font-semibold text-slate-800">{item.tanggal}</p>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5 tracking-wide">{item.waktu} WIB</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="text-sm font-medium text-slate-600">{item.lokasi}</p>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                        item.tipe_pertandingan === "Liga" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                        item.tipe_pertandingan === "Turnamen" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                        "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {item.tipe_pertandingan}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/edit-pertandingan/${item.id}`)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          Edit ✏️
                        </button>
                        <button
                          onClick={() => handleHapusPertandingan(item.id)}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          Hapus 🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pertandingan.length === 0 && (
              <div className="p-20 text-center text-slate-400 text-sm font-medium italic bg-slate-50/20">
                📅 Belum ada agenda pertandingan yang dijadwalkan.
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {pertandingan.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs font-semibold text-slate-500">
                Menampilkan <span className="text-slate-800 font-bold">{indexOfFirstItem + 1}</span> - <span className="text-slate-800 font-bold">{Math.min(indexOfLastItem, pertandingan.length)}</span> dari <span className="text-slate-800 font-bold">{pertandingan.length}</span> data
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  &lt;&lt;
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1.5 text-xs font-extrabold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Selanjutnya
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Pertandingan;