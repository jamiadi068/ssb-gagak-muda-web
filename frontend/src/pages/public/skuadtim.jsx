import React, { useMemo, useState, useEffect } from "react";

export default function SkuadTim({ pemain = [], skuadRef, onLihatProfil }) {
  const [search, setSearch] = useState("");
  const [filterUmur, setFilterUmur] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  const LIST_KELOMPOK_UMUR = [
    "Semua",
    "U-7",
    "U-8",
    "U-9",
    "U-10",
    "U-11",
    "U-12",
    "U-13",
    "U-14",
    "U-15",
     "U-16",
  ];

  // Reset ke halaman 1 setiap kali filter atau kata kunci pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterUmur]);

  // ============================================================
  // HELPER: HITUNG KELOMPOK UMUR DARI TANGGAL LAHIR / TEKS
  // ============================================================
  const getKelompokUmur = (player) => {
    if (player.kelompok_umur) {
      return player.kelompok_umur.toString().trim();
    }

    const tglLahirStr = player.tanggal_lahir || player.tgl_lahir;
    if (tglLahirStr) {
      const birthDate = new Date(tglLahirStr);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return `U-${age}`;
      }
    }

    return "";
  };

  const normalizeUmur = (val) => {
    if (!val) return "";
    return val.toString().toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  // ============================================================
  // FILTER SEMUA PEMAIN SESUAI SEARCH & KELOMPOK UMUR
  // ============================================================
  const allFilteredPemain = useMemo(() => {
    return pemain.filter((player) => {
      const nama = player.nama_pemain || player.nama || "";
      const kelompokStr = getKelompokUmur(player);

      const cocokSearch = nama
        .toLowerCase()
        .includes(search.toLowerCase());

      const normalizedFilter = normalizeUmur(filterUmur);
      const normalizedPlayerUmur = normalizeUmur(kelompokStr);

      const cocokUmur =
        filterUmur === "Semua" ||
        normalizedPlayerUmur === normalizedFilter;

      return cocokSearch && cocokUmur;
    });
  }, [pemain, search, filterUmur]);

  // ============================================================
  // PAGINASI (MEMOTONG DATA 12 PER HALAMAN)
  // ============================================================
  const totalPages = Math.ceil(allFilteredPemain.length / ITEMS_PER_PAGE);

  const pemainFiltered = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredPemain.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allFilteredPemain, currentPage]);

  // Handler Ganti Halaman (scroll halus ke atas grid)
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (skuadRef && skuadRef.current) {
      skuadRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ============================================================
  // FALLBACK FOTO
  // ============================================================
  const getFoto = (player) => {
    if (!player.foto_pemain) return null;

    if (
      player.foto_pemain.startsWith("http://") ||
      player.foto_pemain.startsWith("https://")
    ) {
      return player.foto_pemain;
    }


    return `/uploads/${player.foto_pemain}`;
  };

  const handleResetFilter = () => {
    setSearch("");
    setFilterUmur("Semua");
  };

  return (
    <section
      ref={skuadRef}
      className="bg-slate-50/80 py-12 md:py-20 border-y border-slate-200/80 scroll-mt-6"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* HEADER SECTION */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 text-red-600 font-bold text-xl mb-3 shadow-sm border border-red-200/50">
            🦅
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Skuad <span className="text-red-600">Tim</span>
          </h2>

          <div className="h-1.5 w-16 bg-red-600 mx-auto rounded-full mt-2.5"></div>

          <p className="max-w-2xl mx-auto mt-3 text-sm md:text-base text-slate-500 leading-relaxed font-medium">
            Talenta muda binaan akademi Gagak Muda yang siap bersinar di lapangan hijau.
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 md:p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-center">

            {/* SEARCH INPUT */}
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama pemain..."
                className="w-full pl-11 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* FILTER KELOMPOK UMUR */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-0.5">
              {LIST_KELOMPOK_UMUR.map((umur) => {
                const isSelected = filterUmur === umur;

                return (
                  <button
                    key={umur}
                    onClick={() => setFilterUmur(umur)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? "bg-red-600 text-white shadow-sm ring-2 ring-red-600/20"
                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                    }`}
                  >
                    {umur}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* JUMLAH STATUS PEMAIN */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            Menampilkan <span className="text-slate-900 font-bold">{pemainFiltered.length}</span> dari <span className="text-slate-900 font-bold">{allFilteredPemain.length}</span> pemain {filterUmur !== "Semua" ? `(${filterUmur})` : ""}
          </p>

          {(search || filterUmur !== "Semua") && (
            <button
              onClick={handleResetFilter}
              className="text-xs font-bold text-red-600 hover:text-red-700 transition"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* GRID PEMAIN / EMPTY STATE */}
        {pemainFiltered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {pemainFiltered.map((player, index) => {
                const foto = getFoto(player);
                const kelompokDisplay = getKelompokUmur(player);

                return (
                  <div
                    key={player.id_pemain || player.id || index}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* FOTO & BADGE */}
                    <div className="relative aspect-[4/4.5] bg-slate-100 overflow-hidden">
                      {foto ? (
                        <img
                          src={foto}
                          alt={player.nama_pemain || player.nama || "Pemain"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}

                      {/* FALLBACK IMAGE */}
                      <div
                        className={`${
                          foto ? "hidden" : "flex"
                        } absolute inset-0 items-center justify-center flex-col text-slate-400 bg-slate-100`}
                      >
                        <svg className="w-12 h-12 text-slate-300 mb-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Foto Belum Ada
                        </span>
                      </div>

                      {/* BADGE KELOMPOK UMUR */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-red-600/90 backdrop-blur-md text-white rounded-lg text-[10px] font-black shadow-sm tracking-wide">
                          {kelompokDisplay || "Pemain"}
                        </span>
                      </div>
                    </div>

                    {/* DATA PEMAIN */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-bold text-sm md:text-base text-slate-900 leading-snug line-clamp-2 min-h-[40px] group-hover:text-red-600 transition-colors">
                          {player.nama_pemain || player.nama || "Nama Pemain"}
                        </h3>

                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                            Asal Sekolah
                          </p>
                          <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                            {player.asal_sekolah || "-"}
                          </p>
                        </div>
                      </div>

                      {/* TOMBOL PROFIL */}
                      <button
                        onClick={() => onLihatProfil && onLihatProfil(player)}
                        className="w-full mt-4 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 group/btn"
                      >
                        <span>Lihat Profil</span>
                        <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONTROL PAGINASI (SEBELUMNYA / SELANJUTNYA) */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {/* TOMBOL SEBELUMNYA */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentPage === 1
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Sebelumnya</span>
                </button>

                {/* NOMOR HALAMAN */}
                <div className="flex items-center gap-1.5 mx-1">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNum = index + 1;
                    const isActive = pageNum === currentPage;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* TOMBOL SELANJUTNYA */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentPage === totalPages
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm"
                  }`}
                >
                  <span>Selanjutnya</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <h3 className="font-black text-slate-900 text-lg">
              Pemain Tidak Ditemukan
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Tidak ada data pemain yang cocok dengan kata kunci{" "}
              {search && <span className="font-bold text-slate-800">"{search}"</span>}{" "}
              {filterUmur !== "Semua" && (
                <span>
                  pada kelompok umur <span className="font-bold text-slate-800">{filterUmur}</span>
                </span>
              )}.
            </p>

            <button
              onClick={handleResetFilter}
              className="mt-6 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
}