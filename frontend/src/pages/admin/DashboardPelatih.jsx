import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DashboardPelatih() {
  const navigate = useNavigate();

  const [materi, setMateri] = useState([]);
  const [pemain, setPemain] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jumlahRaport, setJumlahRaport] = useState(0);

  // ================= NORMALIZER =================
  const normalize = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();

  // ================= CEK LOGIN =================
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userData);

        // SIMPAN DATA USER LOGIN
        setUser(parsedUser);

        // AMBIL PEMAIN SESUAI ID PELATIH
        await fetchPemain(parsedUser.id);

        // AMBIL MATERI SESUAI NAMA PELATIH
        await fetchMateri(parsedUser.nama);

        // AMBIL JUMLAH RAPORT SESUAI ID PELATIH
        await fetchJumlahRaport(parsedUser.id);
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memuat dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [navigate]);

  // ================= FETCH PEMAIN =================
  const fetchPemain = async (idPelatih) => {
    try {
      const res = await axios.get(
        `/api/pemain/pelatih/${idPelatih}`
      );

      setPemain(res.data);
    } catch (err) {
      console.error("Gagal mengambil pemain saya:", err);
      setPemain([]);
    }
  };

  // ================= FETCH JUMLAH RAPORT =================
  const fetchJumlahRaport = async (idPelatih) => {
    try {
      const res = await axios.get(
        `/api/raport/pelatih/${idPelatih}`
      );

      setJumlahRaport(res.data.jumlah || 0);
    } catch (err) {
      console.error("Gagal mengambil jumlah raport:", err);
      setJumlahRaport(0);
    }
  };

  // ================= FETCH MATERI =================
  const fetchMateri = async (namaPelatih) => {
    try {
      const res = await axios.get(
        "/api/materi"
      );

      // FILTER MATERI SESUAI PELATIH
      const filtered = res.data.filter((m) => {
        const dbPelatih = normalize(m.nama_pelatih);
        const loginPelatih = normalize(namaPelatih);

        return (
          dbPelatih === loginPelatih ||
          loginPelatih.includes(dbPelatih)
        );
      });

      setMateri(filtered);
    } catch (err) {
      console.error("Gagal mengambil materi:", err);
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ==================================================
  // URL FILE MATERI
  // ==================================================
  const getFileUrl = (file) => {
    if (!file) return "";

    // Kalau sudah berupa URL lengkap
    if (
      file.startsWith("http://") ||
      file.startsWith("https://")
    ) {
      return file;
    }

    // Kalau database menyimpan:
    // /uploads/materi/nama-file.pdf
    if (file.startsWith("/")) {
      return file;
    }

    // Kalau database hanya menyimpan nama file:
    // nama-file.pdf
    return `/uploads/materi/${file}`;
  };

  // ================= NAMA FILE =================
  const getFileName = (file) => {
    if (!file) return "";

    return file.split("/").pop();
  };

  // ==================================================
  // DOWNLOAD FILE MATERI
  // ==================================================
  const handleDownload = async (file) => {
    try {
      if (!file) {
        alert("File materi tidak tersedia");
        return;
      }

      const url = getFileUrl(file);

      console.log("DOWNLOAD FILE:", url);

      const response = await axios.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = getFileName(file);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Gagal download materi:", err);

      alert(
        "File materi gagal didownload. Pastikan file masih tersedia."
      );
    }
  };

  // ================= CEK PDF =================
  const isPdf = (file) => {
    if (!file) return false;

    return file.toLowerCase().endsWith(".pdf");
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>

          <p className="mt-4 text-slate-700 font-medium">
            Memuat dashboard pelatih...
          </p>

        </div>
      </div>
    );
  }

  // ================= ERROR =================
  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

        <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">

          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>

          <p className="text-slate-800 text-lg font-semibold mb-6">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl transition shadow-md"
          >
            Coba Lagi
          </button>

        </div>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm gap-4">

          <div className="flex items-center gap-4">

            {/* FOTO / INISIAL */}
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              {user?.nama
                ? user.nama.charAt(0).toUpperCase()
                : "P"}
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Dashboard Pelatih
              </h1>

              <p className="text-slate-600 text-sm mt-0.5">
                Selamat datang kembali,{" "}
                <strong className="text-indigo-600 font-bold">
                  {user?.nama || "-"}
                </strong>{" "}
                👋
              </p>

              {/* ================= ID PELATIH ================= */}
              <div className="mt-2">

                <span className="inline-flex items-center bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                  👨‍🏫 Pelatih ID:{" "}
                  <span className="ml-1 font-black">
                    {user?.id ?? "-"}
                  </span>
                </span>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* GANTI PASSWORD */}
            <button
              onClick={() => navigate("/ganti-password")}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-xl text-sm font-bold transition"
            >
              <span>🔑</span>
              Ganti Password
            </button>

            {/* KELUAR */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a6 6 0 01-3 3H6a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 013 3v1"
                />
              </svg>

              Keluar
            </button>

          </div>

        </header>

        {/* ================= STATS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* TOTAL MATERI */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">

            <p className="text-slate-500 text-sm font-semibold">
              Total Materi Saya
            </p>

            <div className="flex items-baseline justify-between mt-3">

              <span className="text-4xl font-black text-slate-900">
                {materi.length}
              </span>

              <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                Modul
              </span>

            </div>

          </div>

          {/* PEMAIN */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">

            <p className="text-slate-500 text-sm font-semibold">
              Siswa Terdaftar
            </p>

            <div className="flex items-baseline justify-between mt-3">

              <span className="text-4xl font-black text-slate-900">
                {pemain.length}
              </span>

              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Aktif
              </span>

            </div>

          </div>

          {/* RAPORT */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">

            <p className="text-slate-500 text-sm font-semibold">
              Rapor Selesai
            </p>

            <div className="flex items-baseline justify-between mt-3">

              <span className="text-4xl font-black text-slate-900">
                {jumlahRaport}
              </span>

              <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                Rapor Selesai
              </span>

            </div>

          </div>

        </section>

        {/* ================= QUICK ACCESS ================= */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Akses Cepat Fitur Pelatih
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* PEMAIN */}
            <button
              onClick={() => navigate("/pemain-saya")}
              className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-300 transition group text-left shadow-sm"
            >

              <div className="flex items-center gap-3.5">

                <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
                  👥
                </div>

                <div>

                  <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-700 transition">
                    Pemain Saya
                  </h3>

                  <p className="text-xs text-slate-600">
                    Daftar & data pemain
                  </p>

                </div>

              </div>

              <span className="text-indigo-400 text-xl">
                →
              </span>

            </button>

            {/* RAPORT */}
            <button
              onClick={() => navigate("/raport-siswa")}
              className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition group text-left shadow-sm"
            >

              <div className="flex items-center gap-3.5">

                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
                  📄
                </div>

                <div>

                  <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                    Rapor Siswa
                  </h3>

                  <p className="text-xs text-slate-600">
                    Evaluasi & nilai perkembangan
                  </p>

                </div>

              </div>

              <span className="text-emerald-400 text-xl">
                →
              </span>

            </button>

            {/* STATISTIK */}
            <button
              onClick={() => navigate("/statistik")}
              className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100 hover:border-amber-300 transition group text-left shadow-sm"
            >

              <div className="flex items-center gap-3.5">

                <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
                  📊
                </div>

                <div>

                  <h3 className="font-extrabold text-slate-900 group-hover:text-amber-700 transition">
                    Statistik
                  </h3>

                  <p className="text-xs text-slate-600">
                    Grafik & analisa tim
                  </p>

                </div>

              </div>

              <span className="text-amber-400 text-xl">
                →
              </span>

            </button>

          </div>

        </section>

        {/* ================= LIST MATERI ================= */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Materi Latihan Saya
              </h2>

              <p className="text-slate-500 text-xs mt-1">
                Daftar program dan kurikulum yang Anda kelola
              </p>

            </div>

            <span className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
              Total: {materi.length} Materi
            </span>

          </div>

          {materi.length > 0 ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {materi.map((m) => (

                <div
                  key={m.id}
                  className="bg-slate-50 hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-200 rounded-2xl p-6 flex flex-col justify-between transition group shadow-sm hover:shadow-md"
                >

                  <div>

                    {/* TOP BADGE */}
                    <div className="flex justify-between items-center mb-4">

                      <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-lg text-xs font-bold">
                        {m.kategori}
                      </span>

                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(m.tanggal).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>

                    </div>

                    {/* JUDUL */}
                    <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition">
                      {m.judul}
                    </h3>

                    {/* DESKRIPSI */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {m.deskripsi || "Tidak ada deskripsi materi."}
                    </p>

                    {/* FILE MATERI */}
                    {m.file_materi ? (

                      <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200">

                        <div className="flex items-center gap-3 mb-3">

                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">
                            {isPdf(m.file_materi)
                              ? "📄"
                              : "🖼️"}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-xs font-bold text-slate-500">
                              FILE MATERI
                            </p>

                            <p className="text-sm font-bold text-slate-800 truncate">
                              {getFileName(m.file_materi)}
                            </p>

                          </div>

                        </div>

                        <div className="grid grid-cols-2 gap-2">

                          {/* LIHAT */}
                          <a
                            href={getFileUrl(m.file_materi)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition"
                          >
                            👁️ Lihat
                          </a>

                          {/* DOWNLOAD */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(m.file_materi)
                            }
                            className="text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs font-bold transition"
                          >
                            ⬇️ Download
                          </button>

                        </div>

                      </div>

                    ) : (

                      <div className="mb-6 p-3 bg-slate-100 rounded-xl border border-dashed border-slate-300">

                        <p className="text-xs text-slate-400 text-center">
                          📎 Tidak ada file materi
                        </p>

                      </div>

                    )}

                  </div>

                  {/* INFO FOOTER */}
                  <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-slate-500 font-medium">
                        ⏱ Durasi
                      </span>

                      <span className="font-bold text-slate-900 text-right">
                        {m.durasi || "-"}
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-slate-500 font-medium">
                        📍 Lokasi
                      </span>

                      <span className="font-bold text-slate-900 text-right">
                        {m.lokasi || "-"}
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-slate-500 font-medium">
                        👨‍🏫 Pelatih
                      </span>

                      <span className="font-bold text-indigo-700 text-right">
                        {m.nama_pelatih || "-"}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">

              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-slate-200">
                📚
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                Belum Ada Materi
              </h3>

              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                Materi latihan khusus untuk Anda belum dipublikasikan oleh Administrator.
              </p>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default DashboardPelatih;