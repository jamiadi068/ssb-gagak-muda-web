import React, { useEffect, useState } from "react";

// ============================================================
// DAFTAR FOTO GALERI
// ============================================================
const RAW_GALLERY = [
  {
    id: 1,
    filename: "RAYYAN GAGAK MUDA 2.jpeg",
    title: "Rayyan - Gagak Muda",
  },
  {
    id: 2,
    filename: "SSB GAGAK MUDA-88.jpg",
    title: "Dokumentasi Kegiatan 88",
  },
  {
    id: 3,
    filename: "SSB GAGAK MUDA-114.jpg",
    title: "Dokumentasi Kegiatan 114",
  },
  {
    id: 4,
    filename: "SSB GAGAK MUDA-138.jpg",
    title: "Dokumentasi Kegiatan 138",
  },
  {
    id: 5,
    filename: "SSB GAGAK MUDA-146.jpg",
    title: "Dokumentasi Kegiatan 146",
  },
  {
    id: 6,
    filename: "SSB GAGAK MUDA-171.jpg",
    title: "Dokumentasi Kegiatan 171",
  },
  {
    id: 7,
    filename: "SSB GAGAK MUDA-1252.jpg",
    title: "Dokumentasi Kegiatan 1252",
  },
];

// ============================================================
// URL FOTO
// Menggunakan URL relatif agar bisa melalui Vite Proxy
// ============================================================
const GALLERY_IMAGES = RAW_GALLERY.map((item) => ({
  ...item,
  src: encodeURI(`/uploads/galeri/${item.filename}`),
}));

// ============================================================
// KOMPONEN GALERI
// ============================================================
export default function Galeri({ galeriRef }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ==========================================================
  // AUTO SLIDER SETIAP 3,5 DETIK
  // ==========================================================
  useEffect(() => {
    if (isPaused || GALLERY_IMAGES.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex + 1) % GALLERY_IMAGES.length
      );
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // ==========================================================
  // TOMBOL SEBELUMNYA
  // ==========================================================
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? GALLERY_IMAGES.length - 1
        : prev - 1
    );
  };

  // ==========================================================
  // TOMBOL BERIKUTNYA
  // ==========================================================
  const handleNext = () => {
    setCurrentIndex(
      (prev) =>
        (prev + 1) % GALLERY_IMAGES.length
    );
  };

  return (
    <section
      ref={galeriRef}
      className="bg-gradient-to-b from-red-50/40 via-white to-red-50/30 py-12 md:py-20 border-y border-red-100/60 scroll-mt-6"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">
            Galeri{" "}
            <span className="text-red-600">Tim</span>
          </h2>

          <div className="h-1.5 w-16 bg-red-600 mx-auto rounded-full"></div>

          <p className="text-sm md:text-base text-slate-500 mt-4">
            Dokumentasi kegiatan dan perjalanan SSB Gagak Muda.
          </p>
        </div>

        {/* =====================================================
            SLIDER
        ====================================================== */}
        <div
          className="relative max-w-4xl mx-auto group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >

          {/* DISPLAY BOX */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-2xl">

            {GALLERY_IMAGES.map((item, index) => {
              const isActive = index === currentIndex;

              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    isActive
                      ? "opacity-100 z-10 scale-100"
                      : "opacity-0 z-0 scale-105 pointer-events-none"
                  }`}
                >

                  {/* FOTO */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;

                      e.currentTarget.src =
                        `https://placehold.co/1200x600/e2e8f0/475569?text=${encodeURIComponent(
                          item.title
                        )}`;
                    }}
                  />

                  {/* GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                  {/* INFORMASI FOTO */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">

                    <span className="inline-block px-3 py-1 bg-red-600/90 text-white text-xs font-semibold rounded-full mb-2 backdrop-blur-sm">
                      Dokumentasi #{item.id}
                    </span>

                    <h3 className="text-lg md:text-2xl font-bold tracking-tight">
                      {item.title}
                    </h3>

                  </div>
                </div>
              );
            })}

            {/* =================================================
                TOMBOL PREVIOUS
            ================================================== */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-slate-900 backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg active:scale-95"
              aria-label="Previous Slide"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* =================================================
                TOMBOL NEXT
            ================================================== */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-slate-900 backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg active:scale-95"
              aria-label="Next Slide"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

          </div>

          {/* ===================================================
              DOTS NAVIGATION
          ==================================================== */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {GALLERY_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-red-600 shadow-sm"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}