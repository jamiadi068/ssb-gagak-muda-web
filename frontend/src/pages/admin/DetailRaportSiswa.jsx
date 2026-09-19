import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import logo from "../../assets/logo_original.jpg";

function DetailRaportSiswa() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [raport, setRaport] = useState(null);
  const [pemain, setPemain] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD DETAIL RAPORT
  // ==================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userData);

        if (parsedUser.role !== "siswa") {
          navigate("/");
          return;
        }

        if (!id) {
          setError("ID rapor tidak ditemukan.");
          return;
        }

        console.log("=================================");
        console.log("DETAIL RAPORT ID:", id);

        // ==================================================
        // 1. AMBIL DETAIL RAPORT BERDASARKAN ID
        // ==================================================
        const raportResponse = await api.get(
          `/raport/${id}`
        );

        console.log(
          "DETAIL RAPORT:",
          raportResponse.data
        );

        if (!raportResponse.data) {
          setError("Data rapor tidak ditemukan.");
          return;
        }

        setRaport(raportResponse.data);

        // ==================================================
        // 2. AMBIL DATA PEMAIN
        // ==================================================
        const pemainId =
          raportResponse.data.pemain_id ||
          parsedUser.pemain_id;

        if (pemainId) {
          try {
            const pemainResponse = await api.get(
              `/pemain/${pemainId}`
            );

            console.log(
              "DATA PEMAIN:",
              pemainResponse.data
            );

            setPemain(pemainResponse.data);
          } catch (pemainError) {
            console.warn(
              "Data pemain tidak berhasil diambil:",
              pemainError
            );
          }
        }

      } catch (err) {
        console.error(
          "GAGAL MENGAMBIL DETAIL RAPORT:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Gagal mengambil detail rapor."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // ==================================================
  // DATA DIRI PEMAIN
  // ==================================================

  const namaPemain =
    pemain?.nama ||
    raport?.nama ||
    "Pemain";

  const idPemain =
    pemain?.id ||
    raport?.pemain_id ||
    "-";

  const tanggalLahir =
    pemain?.tanggal_lahir ||
    raport?.tanggal_lahir ||
    "-";

  const kelompokUmur =
    pemain?.kelompok_umur ||
    raport?.kelompok_umur ||
    "-";

  const jenisKelamin =
    pemain?.jenis_kelamin ||
    raport?.jenis_kelamin ||
    "Laki-laki";

  const asalSekolah =
    pemain?.asal_sekolah ||
    raport?.asal_sekolah ||
    "-";

  const alamat =
    pemain?.alamat ||
    raport?.alamat ||
    "-";

  const nomorTelepon =
    pemain?.no_hp ||
    pemain?.nomor_telepon ||
    raport?.no_hp ||
    "-";

  const orangTua =
    pemain?.nama_orang_tua ||
    pemain?.nama_wali ||
    raport?.nama_orang_tua ||
    "-";

  // ==================================================
  // NAMA PELATIH
  // ==================================================
  //
  // PENTING:
  // nama pelatih diambil dari RAPORT terlebih dahulu.
  // Jadi histori rapor lama tetap menggunakan pelatih
  // yang membuat rapor tersebut.
  //
  // ==================================================

  const namaPelatih =
    raport?.nama_pelatih ||
    raport?.namaPelatih ||
    pemain?.nama_pelatih ||
    pemain?.namaPelatih ||
    "-";

  // ==================================================
  // FORMAT POSITION
  // ==================================================

  const formatPosition = (position) => {
    if (!position) return "-";

    const positionMap = {
      GK: "Goalkeeper",

      CB: "Centre Back",
      LB: "Left Back",
      RB: "Right Back",

      LWB: "Left Wing Back",
      RWB: "Right Wing Back",

      DM: "Defensive Midfielder",
      CDM: "Defensive Midfielder",

      CM: "Central Midfielder",
      CAM: "Attacking Midfielder",
      AM: "Attacking Midfielder",

      LM: "Left Midfielder",
      RM: "Right Midfielder",

      LW: "Left Winger",
      RW: "Right Winger",

      CF: "Centre Forward",
      ST: "Striker",
      SS: "Second Striker",

      FW: "Forward",
      MF: "Midfielder",
      DF: "Defender",
    };

    const key = position
      .toString()
      .trim()
      .toUpperCase();

    return positionMap[key] || position;
  };

  const posisiPemain = formatPosition(
    raport?.posisi ||
      pemain?.posisi ||
      "-"
  );

  // ==================================================
  // FORMAT TANGGAL
  // ==================================================

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    try {
      return new Date(tanggal).toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };

  // ==================================================
  // GRADE
  // ==================================================

  const getGrade = (avgScore) => {
    const val = parseFloat(avgScore) || 0;

    if (val >= 4.5) {
      return {
        grade: 5,
        label: "Baik Sekali",
      };
    }

    if (val >= 3.5) {
      return {
        grade: 4,
        label: "Baik",
      };
    }

    if (val >= 2.5) {
      return {
        grade: 3,
        label: "Sedang",
      };
    }

    if (val >= 1.5) {
      return {
        grade: 2,
        label: "Kurang",
      };
    }

    if (val > 0) {
      return {
        grade: 1,
        label: "Kurang Sekali",
      };
    }

    return {
      grade: "-",
      label: "-",
    };
  };

  // ==================================================
  // DOWNLOAD / CETAK PDF
  // ==================================================

  const handleDownload = () => {
    const originalTitle = document.title;

    const tahunOtomatis =
      new Date().getFullYear();

    const namaSiswa = namaPemain
      ? namaPemain
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .trim()
      : "Siswa";

    const periodeVal =
      raport?.periode || "1";

    document.title =
      `Rapor_${namaSiswa}_Periode_${periodeVal}_${tahunOtomatis}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-3 text-slate-600 font-semibold text-sm">
            Memuat rapor...
          </p>

        </div>

      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error || !raport) {
    return (
      <div className="min-h-screen bg-slate-100 p-5 flex items-center justify-center">

        <div className="max-w-md w-full bg-white rounded-xl p-6 shadow-sm border border-slate-300 text-center">

          <div className="text-3xl mb-2">
            📄
          </div>

          <h2 className="text-base font-bold text-slate-900">
            Rapor Tidak Ditemukan
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {error || "Data rapor tidak tersedia."}
          </p>

          <button
            onClick={() =>
              navigate("/histori-raport-siswa")
            }
            className="mt-4 text-xs bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg"
          >
            ← Kembali ke Histori
          </button>

        </div>

      </div>
    );
  }

  // ==================================================
  // GRADE INFO
  // ==================================================

  const gradeInfo =
    getGrade(raport.rata_rata);

  // ==================================================
  // DATA PENILAIAN KIRI
  // ==================================================

  const kolomKiri = [
    {
      kategori: "TEKNIK MENYERANG",

      subtotal:
        raport.subtotal_teknik_menyerang,

      items: [
        [
          "dribbling_feinting",
          "Dribbling & Feinting",
        ],
        ["passing", "Passing"],
        ["first_touch", "First Touch"],
        ["shooting", "Shooting"],
        ["heading", "Heading"],
        ["long_passing", "Long Passing"],
      ],
    },

    {
      kategori: "TEKNIK BERTAHAN",

      subtotal:
        raport.subtotal_teknik_bertahan,

      items: [
        ["clearance", "Clearance"],
        ["intercept", "Intercept"],
        ["tackling", "Tackling"],
      ],
    },

    {
      kategori: "TAKTIKAL",

      subtotal:
        raport.subtotal_taktikal,

      items: [
        ["menyerang", "Menyerang"],
        ["bertahan", "Bertahan"],
        ["transisi", "Transisi"],
      ],
    },
  ];

  // ==================================================
  // DATA PENILAIAN KANAN
  // ==================================================

  const kolomKanan = [
    {
      kategori: "KONDISI FISIK",

      subtotal:
        raport.subtotal_kondisi_fisik,

      items: [
        ["strength", "Strength"],
        ["endurance", "Endurance"],
        ["speed", "Speed"],
        [
          "flexibility_coordination",
          "Flexibility & Coord.",
        ],
      ],
    },

    {
      kategori: "MENTAL & KARAKTER",

      subtotal:
        raport.subtotal_mental,

      items: [
        ["disiplin", "Disiplin"],
        ["kerja_keras", "Kerja Keras"],
        ["percaya_diri", "Percaya Diri"],
        [
          "tanggung_jawab",
          "Tanggung Jawab",
        ],
        ["personality", "Personality"],
        ["komunikasi", "Komunikasi"],
      ],
    },
  ];

  // ==================================================
  // RENDER KATEGORI
  // ==================================================

  const renderKategoriBlock =
    (listKategori) => (
      <div className="border-l border-t border-slate-400">

        {listKategori.map(
          (kategori) => (

            <div
              key={kategori.kategori}
            >

              {/* JUDUL KATEGORI */}

              <div className="grid grid-cols-[1fr_55px] bg-slate-100 border-r border-b border-slate-400">

                <div className="px-2 py-1.5 font-bold text-[10px] text-slate-800">
                  {kategori.kategori}
                </div>

                <div className="px-1 py-1.5 text-center font-bold text-[9px] text-indigo-700 border-l border-slate-400">
                  SUB
                </div>

              </div>

              {/* ITEM */}

              {kategori.items.map(
                ([key, label]) => (

                  <div
                    key={key}
                    className="grid grid-cols-[1fr_55px] border-r border-b border-slate-400 bg-white/80"
                  >

                    <div className="px-2 py-1 text-[9.5px] text-slate-700">
                      {label}
                    </div>

                    <div className="px-1 py-1 text-center font-bold text-[10px] text-indigo-700 border-l border-slate-400">
                      {raport[key] ?? "-"}
                    </div>

                  </div>

                )
              )}

              {/* SUBTOTAL */}

              <div className="grid grid-cols-[1fr_55px] border-r border-b border-slate-400 bg-indigo-50/80">

                <div className="px-2 py-1 text-[9px] font-bold text-slate-600 text-right">
                  Subtotal
                </div>

                <div className="px-1 py-1 text-center font-black text-[10px] text-indigo-700 border-l border-slate-400">
                  {kategori.subtotal ?? 0}
                </div>

              </div>

            </div>

          )
        )}

      </div>
    );

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 p-4 print:p-0 print:bg-white">

      {/* ==================================================
          PRINT STYLE
      ================================================== */}

      <style>{`

        @media print {

          @page {
            size: A4 portrait;
            margin: 5mm;
          }

          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            font-size: 10px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .raport-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .watermark {
            opacity: 0.15 !important;
          }

        }

      `}</style>

      {/* ==================================================
          ACTION BUTTON
      ================================================== */}

      <div className="max-w-3xl mx-auto mb-3 flex justify-between items-center no-print">

        <button
          onClick={() =>
            navigate("/histori-raport-siswa")
          }
          className="text-xs font-bold text-slate-600 hover:text-indigo-600"
        >
          ← Histori Rapor
        </button>

        <button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
        >
          📥 Download / Cetak PDF
        </button>

      </div>

      {/* ==================================================
          RAPORT PAGE
      ================================================== */}

      <div className="max-w-3xl mx-auto bg-white shadow-xl border border-slate-400 raport-page relative overflow-hidden">

        {/* ==================================================
            WATERMARK
        ================================================== */}

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">

          <img
            src={logo}
            alt="Watermark SSB Gagak Muda"
            className="watermark w-[430px] h-[430px] object-contain opacity-[0.13]"
          />

        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="relative z-10">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="border-b-2 border-indigo-800">

            <div className="grid grid-cols-[70px_1fr_130px] items-center">

              {/* LOGO */}

              <div className="p-2 flex justify-center">

                <img
                  src={logo}
                  alt="Logo SSB Gagak Muda"
                  className="w-12 h-12 object-contain"
                />

              </div>

              {/* JUDUL */}

              <div className="py-2">

                <p className="text-[9px] uppercase font-semibold text-indigo-600 tracking-wider">
                  SSB GAGAK MUDA
                </p>

                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  RAPOR PEMAIN
                </h1>

                <p className="text-[9px] text-slate-500 font-medium">
                  Lembar Evaluasi Perkembangan Pemain
                </p>

              </div>

              {/* PERIODE */}

              <div className="border-l border-slate-400 h-full flex flex-col justify-center items-center">

                <p className="text-[8px] text-slate-500 uppercase font-bold">
                  Periode
                </p>

                <p className="text-sm font-black text-indigo-700">
                  {raport.periode || "-"}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              DATA DIRI PEMAIN
          ================================================== */}

          <div className="border-b border-slate-400">

            <div className="bg-slate-100 border-b border-slate-400 px-2 py-1">

              <p className="text-[9px] font-black uppercase tracking-wider text-slate-700">
                DATA DIRI PEMAIN
              </p>

            </div>

            <div className="grid grid-cols-2">

              {/* KIRI */}

              <div className="border-r border-slate-400">

                {/* ID PEMAIN */}

                <div className="grid grid-cols-[110px_1fr] border-b border-slate-300">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    ID Pemain
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-bold">
                    #{idPemain}
                  </div>

                </div>

                {/* NAMA */}

                <div className="grid grid-cols-[110px_1fr] border-b border-slate-300">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    Nama Lengkap
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-bold">
                    {namaPemain}
                  </div>

                </div>

                {/* TANGGAL LAHIR */}

                <div className="grid grid-cols-[110px_1fr] border-b border-slate-300">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    Tanggal Lahir
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-semibold">
                    {formatTanggal(
                      tanggalLahir
                    )}
                  </div>

                </div>

                {/* KELOMPOK UMUR */}

                <div className="grid grid-cols-[110px_1fr]">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    Kelompok Umur
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-semibold">
                    {kelompokUmur}
                  </div>

                </div>

              </div>

              {/* KANAN */}

              <div>

                {/* JENIS KELAMIN */}

                <div className="grid grid-cols-[110px_1fr] border-b border-slate-300">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    Jenis Kelamin
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-semibold">
                    {jenisKelamin}
                  </div>

                </div>

                {/* ASAL SEKOLAH */}

                <div className="grid grid-cols-[110px_1fr] border-b border-slate-300">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    Asal Sekolah
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-semibold">
                    {asalSekolah}
                  </div>

                </div>

                {/* NOMOR TELEPON */}

                <div className="grid grid-cols-[110px_1fr] border-b border-slate-300">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    Nomor Telepon
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-semibold">
                    {nomorTelepon}
                  </div>

                </div>

                {/* ORANG TUA */}

                <div className="grid grid-cols-[110px_1fr]">

                  <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                    Orang Tua / Wali
                  </div>

                  <div className="px-2 py-1 text-[9.5px] font-semibold">
                    {orangTua}
                  </div>

                </div>

              </div>

            </div>

            {/* ALAMAT */}

            <div className="grid grid-cols-[110px_1fr] border-t border-slate-400">

              <div className="px-2 py-1 bg-slate-100 border-r border-slate-400 text-[9px] font-bold">
                Alamat
              </div>

              <div className="px-2 py-1 text-[9.5px] font-semibold">
                {alamat}
              </div>

            </div>

            {/* POSITION */}

            <div className="grid grid-cols-[110px_1fr] border-t border-slate-300">

              <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                Position
              </div>

              <div className="px-2 py-1 text-[9.5px] font-black text-indigo-700">
                {posisiPemain}
              </div>

            </div>

            {/* PELATIH */}

            <div className="grid grid-cols-[110px_1fr] border-t border-slate-300">

              <div className="px-2 py-1 bg-slate-100 border-r border-slate-300 text-[9px] font-bold">
                Pelatih
              </div>

              <div className="px-2 py-1 text-[9.5px] font-black text-indigo-700">
                {namaPelatih}
              </div>

            </div>

          </div>

          {/* ==================================================
              RINGKASAN NILAI
          ================================================== */}

          <div className="border-b border-slate-400">

            <div className="grid grid-cols-4">

              <div className="text-center border-r border-slate-400 py-1.5 bg-slate-50">

                <p className="text-[8px] text-slate-500 font-bold uppercase">
                  Total Nilai
                </p>

                <p className="text-sm font-black text-indigo-700">
                  {raport.total_nilai ?? 0}
                </p>

              </div>

              <div className="text-center border-r border-slate-400 py-1.5 bg-slate-50">

                <p className="text-[8px] text-slate-500 font-bold uppercase">
                  Rata-Rata
                </p>

                <p className="text-sm font-black text-indigo-700">
                  {raport.rata_rata ?? 0}
                </p>

              </div>

              <div className="text-center border-r border-slate-400 py-1.5 bg-slate-50">

                <p className="text-[8px] text-slate-500 font-bold uppercase">
                  Grade
                </p>

                <p className="text-sm font-black text-indigo-700">
                  {gradeInfo.grade}
                </p>

              </div>

              <div className="text-center py-1.5 bg-slate-50">

                <p className="text-[8px] text-slate-500 font-bold uppercase">
                  Predikat
                </p>

                <p className="text-[11px] font-black text-indigo-700">
                  {gradeInfo.label}
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              JUDUL EVALUASI
          ================================================== */}

          <div className="border-b border-slate-400 bg-indigo-700 text-white text-center py-1.5">

            <h2 className="text-[10px] font-black tracking-widest">
              LEMBAR EVALUASI PEMAIN SSB GAGAK MUDA
            </h2>

          </div>

          {/* ==================================================
              TABEL PENILAIAN
          ================================================== */}

          <div className="grid grid-cols-2">

            <div className="border-r border-slate-400">

              {renderKategoriBlock(
                kolomKiri
              )}

            </div>

            <div>

              {renderKategoriBlock(
                kolomKanan
              )}

            </div>

          </div>

          {/* ==================================================
              CATATAN PELATIH
          ================================================== */}

          <div className="border-t border-slate-400">

            <div className="bg-slate-100 border-b border-slate-400 px-2 py-1">

              <p className="text-[9px] font-black uppercase tracking-wider">
                Catatan Pelatih
              </p>

            </div>

            <div className="min-h-[55px] px-3 py-2 text-[9.5px] leading-relaxed bg-white/75">

              {raport.catatan_pelatih ||
                "Tidak ada catatan."}

            </div>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="grid grid-cols-2 border-t border-slate-400">

            <div className="px-2 py-1 text-[8px] text-slate-500">

              Dokumen evaluasi pemain SSB Gagak Muda

            </div>

            <div className="px-2 py-1 text-[8px] text-slate-500 text-right">

              Pelatih: {namaPelatih}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DetailRaportSiswa;