import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import heroImage from "../../assets/logo.jpeg";
import Galeri from "./Galeri";
import SkuadTim from "./SkuadTim";

function Home() {
  const [pemainAktif, setPemainAktif] = useState([]);
  const [pertandingan, setPertandingan] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(true); 
  const [pemainTerpilih, setPemainTerpilih] = useState(null);

  // STATE: Pencarian, Filter Umur, dan Paginasi
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUmur, setFilterUmur] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11; 

  // Reference untuk Fitur Navigasi Konten (Scroll Target)
  const skuadRef = useRef(null);
  const keunggulanRef = useRef(null);
  const galeriRef = useRef(null);
  const pelatihRef = useRef(null);
  const jadwalRef = useRef(null); 

  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // FUNGSI HITUNG KELOMPOK UMUR OTOMATIS
  const hitungKelompokUmur = (tanggalLahirString) => {
    if (!tanggalLahirString) return "U-? ";
    
    const birthDate = new Date(tanggalLahirString);
    const today = new Date(); // Tahun berjalan saat ini (2026)
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age <= 10) return "U-10";
    
    if (age <= 12) return "U-12";
    if (age <= 15) return "U-15";
    return `U-${age}`;
  };

  // FETCH DATA PEMAIN
  useEffect(() => {
    setLoading(true);
    fetch("/api/pemain")
      .then((res) => res.json())
      .then((data) => {
        const aktif = data.filter(
          (item) => item.status && item.status.trim().toLowerCase() === "aktif"
        );
        setPemainAktif(aktif);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetch pemain aktif:", err);
        setLoading(false);
      });
  }, []);

  // FETCH DATA PERTANDINGAN
  useEffect(() => {
    setLoadingMatch(true);
    fetch("/api/pertandingan") 
      .then((res) => res.json())
      .then((data) => {
        setPertandingan(data);
        setLoadingMatch(false);
      })
      .catch((err) => {
        console.log("Error fetch pertandingan:", err);
        setLoadingMatch(false);
      });
  }, []);

  const jadwalPertandingan = pertandingan;

// LOGIKA FILTER DAN PENCARIAN PEMAIN
  const filteredPemain = (() => {
    const hasilFilter = pemainAktif.filter((pemain) => {
      const cocokNama = pemain.nama?.toLowerCase().includes(searchQuery.toLowerCase());
      const kategoriUmur = hitungKelompokUmur(pemain.tanggal_lahir);
      
      if (filterUmur === "Semua") {
        return cocokNama;
      } else if (filterUmur === "Lainnya") {
        return cocokNama && !["U-10", "U-12", "U-15"].includes(kategoriUmur);
      } else {
        return cocokNama && kategoriUmur === filterUmur;
      }
    });

    // Jika filter yang dipilih adalah "Semua", batasi maksimal 12 data
    if (filterUmur === "Semua") {
      return hasilFilter.slice(0, 12);
    }

    return hasilFilter;
  })();
  

  // LOGIKA PAGINASI
  const totalPages = Math.ceil(filteredPemain.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPemainList = filteredPemain.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (umur) => {
    setFilterUmur(umur);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-100 selection:text-red-900 scroll-smooth">
      
      {/* =========================================================================
          HERO SECTION (RESPONSIVE SPLIT LAYOUT + INFORMASI JADWAL)
          ========================================================================= */}
      <section className="relative min-h-screen w-full flex flex-col lg:flex-row bg-[#8b0000] overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none z-10"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/batik.png")`,
            backgroundRepeat: "repeat"
          }}
        ></div>

        {/* SISI ATAS/KIRI: Konten Teks & Jadwal */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative z-20 bg-gradient-to-b lg:bg-gradient-to-r from-[#5a0000] via-[#8b0000]/95 to-[#990000] pt-16 lg:pt-16">
          <div className="mb-6 lg:mb-0">
            <span className="inline-block py-1 px-3 mb-3 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 rounded-full backdrop-blur-sm">
              OFFICIAL WEBSITE 🇮🇩
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              SSB Gagak Muda <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-white block mt-1 text-xl sm:text-3xl md:text-4xl lg:text-5xl">
                PEMBINAAN SEPAK BOLA USIA DINI
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-red-100 mt-3 max-w-md leading-relaxed opacity-90">
              Membentuk karakter kesatria, mengasah talenta lokal, dan mencetak talenta emas bermental juara demi lambang Garuda di dada.
            </p>

            {/* BLOCK JADWAL */}
            <div className="mt-6 p-4 bg-black/20 border border-white/10 rounded-2xl backdrop-blur-sm max-w-md">
              <h4 className="text-amber-400 font-black text-xs tracking-wider uppercase mb-2.5 flex items-center gap-1.5">
                <span>🗓️</span> Jadwal Latihan dan Training
              </h4>
              <div className="grid grid-cols-2 gap-3 text-white">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] font-bold text-red-300 uppercase tracking-wide mb-1">Jadwal Latihan</p>
                  <p className="text-xs font-extrabold text-slate-100 leading-relaxed">
                    Selasa 16:00 WIB <br />
                    Kamis 16:00 WIB <br />
                    Minggu 09:00 WIB
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] font-bold text-amber-300 uppercase tracking-wide mb-1">Jadwal Training</p>
                  <p className="text-xs font-extrabold text-slate-100 leading-relaxed">
                    Kamis 16:00 WIB <br />
                    (Free Training)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
              <Link to="/pendaftaran" className="w-full sm:w-auto">
                <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-red-950 font-black px-6 py-3.5 rounded-xl shadow-xl hover:scale-105 transition-all text-xs tracking-wider border border-amber-400/30">
                  DAFTAR SEKARANG
                </button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-white hover:text-red-900 transition-all text-xs tracking-wider">
                  PORTAL TIM
                </button>
              </Link>
            </div>
          </div>

          {/* MENU NAVIGASI ISI KONTEN */}
          <div className="mt-8 border-t border-white/10 pt-4">
            <p className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mb-3">Menu Akademi</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button onClick={() => scrollToSection(skuadRef)} className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-xl text-left text-white transition group">
                <span className="text-base sm:text-lg text-amber-400">🦅</span>
                <div>
                  <h4 className="text-[11px] font-bold group-hover:text-amber-400 transition">SKUAD TIM</h4>
                  <p className="text-[9px] text-red-200/60 hidden sm:block">Data pemain aktif</p>
                </div>
              </button>
              <button onClick={() => scrollToSection(jadwalRef)} className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-xl text-left text-white transition group">
                <span className="text-base sm:text-lg text-amber-400">🗓️</span>
                <div>
                  <h4 className="text-[11px] font-bold group-hover:text-amber-400 transition">JADWAL</h4>
                  <p className="text-[9px] text-red-200/60 hidden sm:block">Match Day Terdekat</p>
                </div>
              </button>
              <button onClick={() => scrollToSection(galeriRef)} className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-xl text-left text-white transition group">
                <span className="text-base sm:text-lg text-amber-400">🏆</span>
                <div>
                  <h4 className="text-[11px] font-bold group-hover:text-amber-400 transition">GALERI</h4>
                  <p className="text-[9px] text-red-200/60 hidden sm:block">Galeri prestasi</p>
                </div>
              </button>
              <button onClick={() => scrollToSection(pelatihRef)} className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-xl text-left text-white transition group">
                <span className="text-base sm:text-lg text-amber-400">👔</span>
                <div>
                  <h4 className="text-[11px] font-bold group-hover:text-amber-400 transition">OFFICIAL</h4>
                  <p className="text-[9px] text-red-200/60 hidden sm:block">Staf kepelatihan</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* SISI BAWAH/KANAN: Gambar Hero Utama */}
        <div className="w-full lg:w-1/2 h-48 sm:h-72 lg:h-auto relative z-5 flex-1 min-h-[250px] lg:min-h-0">
          <div className="absolute inset-0 bg-cover bg-center no-repeat" style={{ backgroundImage: `url(${heroImage})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#8b0000] lg:from-[#990000] via-transparent to-transparent"></div>
        </div>
      </section>
{/* =========================================================================
          SECTION JADWAL PERTANDINGAN (SESUAI DATABASE)
          ========================================================================= */}
      <section ref={jadwalRef} className="max-w-6xl mx-auto px-4 py-12 md:py-20 bg-slate-100 rounded-3xl my-10 scroll-mt-6">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">
            Up Coming
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            Jadwal Pertandingan
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Agenda pertandingan mendatang tim SSB Gagak Muda
          </p>
          <div className="h-1 w-14 bg-gradient-to-r from-red-600 to-amber-500 mx-auto rounded-full mt-3"></div>
        </div>

        {loadingMatch ? (
          <div className="text-center py-12 text-slate-400 text-sm">Memuat jadwal pertandingan...</div>
        ) : pertandingan.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
            Belum ada jadwal pertandingan aktif saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pertandingan.map((match) => (
              <div 
                key={match.id} 
                className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Info Tipe Pertandingan & Waktu */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 text-[11px] md:text-xs text-slate-500 font-medium">
                  <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px]">
                    {match.tipe_pertandingan || "Persahabatan"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    🗓️ {new Date(match.tanggal).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} - {match.waktu?.substring(0, 5)} WIB
                  </span>
                </div>

                {/* Tampilan Visual Match (Gagak Muda VS Lawan) */}
                <div className="grid grid-cols-3 items-center my-2">
                  {/* Tim Home (SSB Gagak Muda) */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center p-2 border border-red-100 shadow-sm">
                      <span className="font-black text-red-700 text-sm md:text-base uppercase">
                        SSB
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-xs md:text-sm mt-2 tracking-tight uppercase">
                      GAGAK MUDA
                    </span>
                  </div>

                  {/* VS & Lokasi */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-900 text-amber-400 font-black px-3 py-1 rounded-lg text-xs tracking-widest uppercase border border-slate-800 shadow-sm">
                      VS
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-500 mt-2 font-bold text-center line-clamp-2">
                      📍 {match.lokasi}
                    </span>
                  </div>

                  {/* Tim Away (Lawan dari DB) */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center p-2 border border-slate-200 shadow-inner">
                      <span className="font-black text-slate-400 text-base md:text-xl uppercase">
                        {match.lawan?.substring(0, 2)}
                      </span>
                    </div>
                    <span className="font-extrabold text-red-600 text-xs md:text-sm mt-2 tracking-tight line-clamp-2 uppercase">
                      {match.lawan}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
        <SkuadTim
  skuadRef={skuadRef}
  pemain={pemainAktif}
  onLihatProfil={(player) => setPemainTerpilih(player)}
/>

      {/* POP-UP DETAIL PROFIL */}
      {pemainTerpilih && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPemainTerpilih(null)}></div>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl relative border-t-4 border-red-600 z-10 max-h-[90vh] overflow-y-auto transform transition-all animate-slide-up">
            <button onClick={() => setPemainTerpilih(null)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition">✕</button>

            <div className="text-center mb-4">
              <div className="w-24 h-32 bg-slate-100 border-2 border-red-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm overflow-hidden">
                {pemainTerpilih.foto_pemain ? (
                  <img 
                    src={`/uploads/${pemainTerpilih.foto_pemain}`} 
                    alt={pemainTerpilih.nama} 
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-red-600 uppercase">
                    {pemainTerpilih.nama ? pemainTerpilih.nama.charAt(0) : "?"}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight uppercase px-4 truncate">{pemainTerpilih.nama}</h3>
              <p className="text-[10px] font-bold text-red-700 bg-red-50 inline-block px-2.5 py-0.5 rounded-full mt-1 border border-red-100">
                Skuad {hitungKelompokUmur(pemainTerpilih.tanggal_lahir)}
              </p>
            </div>

            <div className="space-y-2.5 text-[11px] md:text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center border-b border-slate-50 pb-1"><span className="text-slate-400">Email</span><span className="font-semibold text-slate-900 truncate max-w-[180px]">{pemainTerpilih.email || "-"}</span></div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-1"><span className="text-slate-400">Tempat Lahir</span><span className="font-semibold text-slate-900">{pemainTerpilih.tempat_lahir || "-"}</span></div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-1">
                <span className="text-slate-400">Tanggal Lahir</span>
                <span className="font-semibold text-slate-900">
                  {pemainTerpilih.tanggal_lahir ? new Date(pemainTerpilih.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-1"><span className="text-slate-400">WhatsApp</span><span className="font-semibold text-slate-900">{pemainTerpilih.no_hp || "-"}</span></div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-1"><span className="text-slate-400">Asal Sekolah</span><span className="font-semibold text-slate-900 truncate max-w-[180px]">{pemainTerpilih.asal_sekolah || "-"}</span></div>
              <div className="pt-0.5">
                <span className="text-slate-400 block mb-1">Alamat Rumah</span>
                <p className="text-gray-700 bg-gray-50 p-2 rounded-lg text-[10px] border border-slate-200/60 leading-relaxed italic max-h-20 overflow-y-auto">
                  {pemainTerpilih.alamat || "Alamat belum diisi."}
                </p>
              </div>
            </div>
            <button onClick={() => setPemainTerpilih(null)} className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md uppercase transition">Tutup Profil</button>
          </div>
        </div>
      )}
          <Galeri galeriRef={galeriRef} />

      {/* =========================================================================
          SECTION 4: TIM OFFICIAL / KEPELATIHAN
          ========================================================================= */}
      <section ref={pelatihRef} className="max-w-6xl mx-auto px-4 py-12 md:py-24 scroll-mt-6">
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-4xl font-black text-slate-900 mb-1.5 tracking-tight uppercase">
            Staf <span className="text-red-600">Kepelatihan</span>
          </h2>
          <div className="h-1 w-14 bg-red-600 mx-auto rounded-full mt-2"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { nama: "Coach Head", jabatan: "Pelatih Utama (Lisensi B)", icon: "👔" },
            { nama: "Coach Assistant", jabatan: "Asisten Pelatih (Lisensi C)", icon: "📋" },
            { nama: "Coach GK", jabatan: "Pelatih Kiper", icon: "🧤" }
          ].map((staff, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">{staff.icon}</div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg uppercase">{staff.nama}</h3>
              <p className="text-xs md:text-sm text-red-600 font-medium mt-1">{staff.jabatan}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          FOOTER SECTION
          ========================================================================= */}
      <footer className="bg-slate-900 text-white py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs md:text-sm font-medium opacity-70">
            &copy; 2026 SSB Gagak Muda Bintaro. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default Home;