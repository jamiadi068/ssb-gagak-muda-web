import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function DetailPemain() {
  const { id } = useParams();

  const [pemain, setPemain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // AMBIL DETAIL PEMAIN
  // =========================
  useEffect(() => {
    const fetchDetailPemain = async () => {
      try {
        const res = await axios.get(
          `/api/pemain/${id}`
        );

        setPemain(res.data);
      } catch (err) {
        console.error("Gagal mengambil data detail:", err);

        setError(
          "Gagal memuat data pemain atau data tidak ditemukan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetailPemain();
  }, [id]);

  // =========================
  // FORMAT TANGGAL
  // =========================
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-indigo-700 font-bold text-lg animate-pulse">
          Memuat data pemain...
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error || !pemain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">

        <div className="bg-white p-6 rounded-2xl shadow-md text-center max-w-sm border border-gray-200">

          <div className="text-red-500 text-sm font-bold uppercase mb-2">
            Error
          </div>

          <p className="text-gray-600 text-sm mb-4">
            {error || "Pemain tidak ditemukan."}
          </p>

          <Link
            to="/dashboard"
            className="bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-indigo-800 transition-all"
          >
            KEMBALI KE DAFTAR
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

        {/* =====================================================
            HEADER DETAIL PEMAIN
        ===================================================== */}
        <div className="bg-indigo-700 p-6 flex items-center gap-4">

          {/* FOTO PEMAIN */}
          <div className="h-20 w-20 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border-2 border-indigo-300 overflow-hidden shrink-0 shadow-inner">

            {pemain.foto_pemain ? (

              <img
                src={`/uploads/${pemain.foto_pemain}`}
                alt={pemain.nama}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";

                  e.target.parentNode.innerText =
                    pemain.nama?.charAt(0).toUpperCase();
                }}
              />

            ) : (

              <span className="text-3xl font-black uppercase">
                {pemain.nama?.charAt(0)}
              </span>

            )}

          </div>

          {/* INFORMASI HEADER */}
          <div className="flex-1">

            {/* NAMA */}
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight leading-tight">
              {pemain.nama}
            </h2>

            {/* =========================
                ID PEMAIN & ID PELATIH
            ========================= */}
            <div className="flex flex-wrap items-center gap-2 mt-2">

              {/* ID PEMAIN */}
              <span className="bg-white/15 border border-white/20 text-white px-2 py-1 rounded-md text-[10px] font-bold">
                ID Pemain: {pemain.id}
              </span>

              {/* ID PELATIH */}
              <span className="bg-white/15 border border-white/20 text-white px-2 py-1 rounded-md text-[10px] font-bold">
                ID Pelatih: {pemain.pelatih_id || "-"}
              </span>

            </div>

            {/* STATUS & KELOMPOK UMUR */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">

              <p className="text-indigo-200 text-xs font-semibold tracking-wide uppercase">

                Status:

                <span className="text-green-300 font-bold ml-1">
                  {pemain.status || "AKTIF"}
                </span>

              </p>

              {pemain.kelompok_umur && (
                <>
                  <span className="text-indigo-400 text-xs">
                    •
                  </span>

                  <p className="text-indigo-200 text-xs font-semibold tracking-wide uppercase">

                    KU:

                    <span className="text-yellow-300 font-bold ml-1">
                      {pemain.kelompok_umur}
                    </span>

                  </p>
                </>
              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            ISI KONTEN / PROFIL
        ===================================================== */}
        <div className="p-6 md:p-8 space-y-6">

          {/* INFORMASI PRIBADI */}
          <h3 className="text-sm font-black text-indigo-700 uppercase tracking-wider border-b pb-2 border-gray-100">
            Informasi Pribadi & Kontak
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* EMAIL */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Email
              </span>

              <span className="text-sm font-medium text-gray-800">
                {pemain.email || "-"}
              </span>

            </div>

            {/* NO HP */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                No. Handphone / WA
              </span>

              <span className="text-sm font-bold text-gray-800">
                {pemain.no_hp || "-"}
              </span>

            </div>

            {/* TEMPAT TANGGAL LAHIR */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Tempat & Tanggal Lahir
              </span>

              <span className="text-sm font-medium text-gray-800">

                {pemain.tempat_lahir || "-"},{" "}
                {formatDate(pemain.tanggal_lahir)}

              </span>

            </div>

            {/* SEKOLAH */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Asal Sekolah
              </span>

              <span className="text-sm font-bold text-indigo-600 uppercase">
                {pemain.asal_sekolah || "-"}
              </span>

            </div>

            {/* ALAMAT */}
            <div className="md:col-span-2">

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Alamat Rumah
              </span>

              <span className="text-sm font-medium text-gray-700 block bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                {pemain.alamat || "-"}
              </span>

            </div>

          </div>

          {/* =====================================================
              STATUS BERKAS & VALIDASI
          ===================================================== */}
          <h3 className="text-sm font-black text-indigo-700 uppercase tracking-wider border-b pb-2 border-gray-100 pt-4">
            Status Berkas & Validasi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* TANGGAL PENDAFTARAN */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Tanggal Pendaftaran
              </span>

              <span className="text-sm font-medium text-gray-800">
                {formatDate(pemain.created_at)}
              </span>

            </div>

            {/* VALIDATOR */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Divalidasi Oleh
              </span>

              <span className="text-sm font-bold text-gray-800 uppercase">
                {pemain.validated_by || "ADMIN"}
              </span>

            </div>

            {/* APPROVED */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Tanggal Disetujui (Approved)
              </span>

              <span className="text-sm font-medium text-green-600 font-semibold">
                {formatDate(
                  pemain.approved_at ||
                  pemain.validated_at
                )}
              </span>

            </div>

            {/* DOKUMEN */}
            <div>

              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">
                Dokumen Fisik
              </span>

              <a
                href={`/uploads/${pemain.dokumen}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-1 px-4 py-2 bg-gray-100 hover:bg-indigo-600 hover:text-white border border-gray-200 rounded-lg text-xs font-bold transition-all uppercase"
              >
                Buka Lampiran Berkas ↗
              </a>

            </div>

          </div>

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">

          <Link
            to="/pemain"
            className="bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-700 hover:text-white px-5 py-2 rounded-xl text-xs font-black shadow-sm transition-all tracking-wider uppercase"
          >
            Kembali Ke Daftar
          </Link>

        </div>

      </div>

    </div>
  );
}

export default DetailPemain;