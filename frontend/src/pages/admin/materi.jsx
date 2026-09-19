import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Materi() {
  const navigate = useNavigate();

  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Deklarasikan itemsPerPage di sini (paling atas sebelum digunakan)
  const itemsPerPage = 10;

  // ==============================
  // AMBIL DATA MATERI
  // ==============================
  const getMateri = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "/api/materi"
      );

      setMateri(res.data);
      setCurrentPage(1);

    } catch (err) {
      console.error("Gagal mengambil data materi:", err);

      alert(
        "Gagal mengambil data materi: " +
          (err.response?.data?.message || err.message)
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMateri();
  }, []);

  // ==============================
  // PAGINATION (Baris 35 aman karena itemsPerPage sudah ada di atas)
  // ==============================
  const totalPages = Math.ceil(
    materi.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const displayedMateri = materi.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ==============================
  // HAPUS
  // ==============================
  const handleDelete = async (id) => {
    const yakin = window.confirm(
      "Yakin ingin menghapus materi ini?"
    );

    if (!yakin) return;

    try {
      await axios.delete(
        `/api/materi/${id}`
      );

      alert("✅ Materi berhasil dihapus");

      getMateri();

    } catch (err) {
      console.error("Gagal menghapus materi:", err);

      alert(
        "❌ Gagal menghapus materi: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // ==============================
  // FORMAT TANGGAL
  // ==============================
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ==============================
  // TAMPILAN
  // ==============================
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Kelola Materi
            </h1>
            <p className="text-slate-500 mt-1">
              Kelola materi latihan SSB Gagak Muda
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-xl font-bold"
            >
              ← Dashboard
            </button>

            <button
              onClick={() => navigate("/tambah-materi")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-md"
            >
              + Tambah Materi
            </button>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

          {/* HEADER TABLE */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                Daftar Materi
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Total {materi.length} materi
              </p>
            </div>

            <button
              onClick={getMateri}
              className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600"
            >
              🔄 Refresh
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-16 text-center">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-slate-500 font-semibold">
                Memuat data materi...
              </p>
            </div>
          ) : materi.length === 0 ? (
            /* DATA KOSONG */
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-slate-700">
                Belum ada materi
              </h3>
              <p className="text-slate-500 text-sm mt-1 mb-5">
                Silakan tambahkan materi latihan baru.
              </p>
              <button
                onClick={() => navigate("/tambah-materi")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
              >
                + Tambah Materi
              </button>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">
                        No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">
                        Judul Materi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">
                        Kategori
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">
                        Pelatih
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">
                        Durasi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase">
                        Lokasi
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {displayedMateri.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50"
                      >
                        {/* NO */}
                        <td className="px-6 py-4 text-sm font-bold text-slate-500">
                          {startIndex + index + 1}
                        </td>

                        {/* JUDUL */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">
                            {item.judul || "-"}
                          </p>
                          {item.deskripsi && (
                            <p className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                              {item.deskripsi}
                            </p>
                          )}
                        </td>

                        {/* KATEGORI */}
                        <td className="px-6 py-4">
                          <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg text-xs font-bold">
                            {item.kategori || "-"}
                          </span>
                        </td>

                        {/* TANGGAL */}
                        <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                          {formatTanggal(item.tanggal)}
                        </td>

                        {/* PELATIH */}
                        <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                          {item.nama_pelatih ||
                            item.pelatih ||
                            "-"}
                        </td>

                        {/* DURASI */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.durasi || "-"}
                        </td>

                        {/* LOKASI */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.lokasi || "-"}
                        </td>

                        {/* AKSI */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/edit-materi/${item.id}`
                                )
                              }
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Menampilkan{" "}
                    <b className="text-slate-700">
                      {startIndex + 1}
                    </b>
                    {" - "}
                    <b className="text-slate-700">
                      {Math.min(
                        startIndex + itemsPerPage,
                        materi.length
                      )}
                    </b>
                    {" dari "}
                    <b className="text-slate-700">
                      {materi.length}
                    </b>
                    {" materi"}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage(
                          currentPage - 1
                        )
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
                    >
                      ← Sebelumnya
                    </button>

                    <div className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
                      {currentPage} / {totalPages}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage(
                          currentPage + 1
                        )
                      }
                      disabled={
                        currentPage === totalPages
                      }
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
                    >
                      Berikutnya →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Materi;