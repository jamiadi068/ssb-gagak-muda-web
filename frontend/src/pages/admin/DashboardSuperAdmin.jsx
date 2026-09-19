import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function DashboardSuperAdmin() {
  const navigate = useNavigate();
  const [pendaftaran, setPendaftaran] = useState([]);
  
  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getData = async () => {
    try {
      const res = await axios.get("/api/pendaftaran");
      setPendaftaran(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleValidasi = async (id, status) => {
    try {
      const confirm = window.confirm(`Yakin ingin mengubah status menjadi ${status}?`);
      if (!confirm) return;

      const res = await axios.put(
        `/api/pendaftaran/${id}`,
        {
          status: status,
          admin: "Admin Gagak Muda",
        }
      );

      alert(res.data.message || "Status berhasil diperbarui");
      getData();
    } catch (err) {
      console.error("Error Validasi:", err.response?.data || err.message);
      alert("Gagal melakukan validasi: " + (err.response?.data?.error || err.message));
    }
  };

  // Logic Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pendaftaran.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pendaftaran.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-slate-950 to-slate-900 text-white flex flex-col p-6 shadow-2xl shrink-0">
        
{/* LOGO & NAMA ACADEMY */}
<div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-800">
  <span className="text-2xl bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/30">⚽</span>
  <div>
    <h2 className="text-lg font-black tracking-wider uppercase" style={{ color: "#ffffff" }}>
      Gagak <span className="text-emerald-400">Muda</span>
    </h2>
    <p className="text-[10px] font-extrabold text-cyan-400 tracking-widest uppercase mt-0.5">
      ACADEMY
    </p>
  </div>
</div>
        {/* NAVIGASI MENU */}
        <nav className="flex flex-col gap-1.5 flex-1">
          <button className="flex items-center gap-3 text-left bg-indigo-600 text-white p-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20">
            <span className="text-sm">📊</span>
            Dashboard
          </button>

          <button
            onClick={() => navigate("/pemain")}
            className="flex items-center gap-3 text-left text-slate-400 hover:text-white hover:bg-slate-800/60 p-3 rounded-xl font-semibold transition-all"
          >
            <span className="text-sm">🏃‍♂️</span>
            Kelola Pemain
          </button>

          <button
            onClick={() => navigate("/manage-pelatih")}
            className="flex items-center gap-3 text-left text-slate-400 hover:text-white hover:bg-slate-800/60 p-3 rounded-xl font-semibold transition-all"
          >
            <span className="text-sm">📋</span>
            Kelola Pelatih
          </button>

          <button
            onClick={() => navigate("/materi")}
            className="flex items-center gap-3 text-left text-slate-400 hover:text-white hover:bg-slate-800/60 p-3 rounded-xl font-semibold transition-all"
          >
            <span className="text-sm">📚</span>
            Tambah Materi
          </button>

          <button
            onClick={() => navigate("/manage-pertandingan")}
            className="flex items-center gap-3 text-left text-slate-400 hover:text-white hover:bg-slate-800/60 p-3 rounded-xl font-semibold transition-all"
          >
            <span className="text-sm">🏆</span>
            Kelola Pertandingan
          </button>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white p-3 rounded-xl font-bold transition-all border border-rose-500/20 hover:border-transparent active:scale-[0.98]"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* HEADER UTAMA (HERO SECTION) */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Dashboard Admin
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">
              Pantau dan validasi alur pendaftaran siswa baru secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Super Admin Gaga
              </p>
            </div>
          </div>
        </div>

        {/* STATISTIK CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Pendaftaran</h3>
              <p className="text-3xl font-black mt-1 text-slate-900">{pendaftaran.length}</p>
            </div>
            <span className="text-3xl bg-slate-100 p-3 rounded-xl">📩</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 border-l-4 border-l-amber-500 flex items-center justify-between">
            <div>
              <h3 className="text-amber-600 font-bold text-xs uppercase tracking-widest">Antrean Pending</h3>
              <p className="text-3xl font-black mt-1 text-amber-600">
                {pendaftaran.filter(p => p.status === "pending").length}
              </p>
            </div>
            <span className="text-3xl bg-amber-50 p-3 rounded-xl">⏳</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div>
              <h3 className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Disetujui</h3>
              <p className="text-3xl font-black mt-1 text-emerald-600">
                {pendaftaran.filter(p => p.status === "approved").length}
              </p>
            </div>
            <span className="text-3xl bg-emerald-50 p-3 rounded-xl">✅</span>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              📂 Antrean Validasi Berkas
            </h2>
            <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md text-xs uppercase">
              {pendaftaran.filter(p => p.status === "pending").length} Alur Baru
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Data Profil Pemain</th>
                  <th className="px-6 py-4">asal sekolah & kontak</th>
                  <th className="px-6 py-4 text-center">Status Verifikasi</th>
                  <th className="px-6 py-4 text-center">Tindakan Mandiri</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4.5">
                      <p className="font-bold text-slate-900 text-sm uppercase leading-snug">{item.nama}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{item.email || "tidak-ada@email.com"}</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="text-sm font-semibold text-indigo-600/90 uppercase">{item.asal_sekolah || "-"}</p>
                      <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">{item.no_hp || "-"}</p>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                        item.status === "approved" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        item.status === "rejected" ? "bg-rose-100 text-rose-700 border border-rose-200" :
                        "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      {item.status === "pending" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleValidasi(item.id, "approved")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-500/10 active:scale-95"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleValidasi(item.id, "rejected")}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shadow-rose-500/10 active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 text-slate-400">
                          <span className="text-xs font-bold uppercase tracking-wider italic">Selesai</span>
                          <span className="text-xs">🔒</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pendaftaran.length === 0 && (
              <div className="p-20 text-center text-slate-400 text-sm font-medium italic bg-slate-50/20">
                📭 Belum ada data pendaftaran yang masuk ke sistem.
              </div>
            )}
          </div>

          {/* TOMBOL NAVIGASI PAGINATION */}
          {pendaftaran.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs font-semibold text-slate-500">
                Menampilkan <span className="text-slate-800 font-bold">{indexOfFirstItem + 1}</span> - <span className="text-slate-800 font-bold">{Math.min(indexOfLastItem, pendaftaran.length)}</span> dari <span className="text-slate-800 font-bold">{pendaftaran.length}</span> data
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Halaman Pertama"
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
                  title="Halaman Terakhir"
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

export default DashboardSuperAdmin;