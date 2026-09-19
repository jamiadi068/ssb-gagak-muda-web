import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ManagePemain() {
  const [pemain, setPemain] = useState([]);
  const [pelatih, setPelatih] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // =========================
  // STATE MODAL PINDAH
  // =========================
  const [showPindahModal, setShowPindahModal] = useState(false);
  const [selectedPemain, setSelectedPemain] = useState(null);
  const [selectedPelatih, setSelectedPelatih] = useState("");
  const [loadingPindah, setLoadingPindah] = useState(false);

  // =========================
  // STATE EXPORT EXCEL
  // =========================
  const [loadingExport, setLoadingExport] = useState(false);

  const itemsPerPage = 10;

  // =========================
  // GET DATA PEMAIN
  // =========================
  const getData = async () => {
    try {
      const res = await axios.get("/api/pemain");
      setPemain(res.data);
    } catch (error) {
      console.error("Gagal mengambil data pemain:", error);
    }
  };

  // =========================
  // GET DATA PELATIH
  // =========================
  const getPelatih = async () => {
    try {
      const res = await axios.get("/api/pelatih");
      setPelatih(res.data);
    } catch (error) {
      console.error("Gagal mengambil data pelatih:", error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    getData();
    getPelatih();
  }, []);

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (window.confirm("Hapus pemain dari daftar aktif?")) {
      try {
        await axios.delete(`/api/pemain/${id}`);

        alert("Pemain berhasil dihapus");

        getData();
      } catch (error) {
        const errMsg =
          error.response?.data?.message || "Gagal menghapus";

        alert(errMsg);
      }
    }
  };

  // =========================
  // BUKA MODAL PINDAH
  // =========================
  const handleOpenPindah = (pemain) => {
    setSelectedPemain(pemain);
    setSelectedPelatih("");
    setShowPindahModal(true);
  };

  // =========================
  // TUTUP MODAL
  // =========================
  const handleClosePindah = () => {
    if (loadingPindah) return;

    setShowPindahModal(false);
    setSelectedPemain(null);
    setSelectedPelatih("");
  };

  // =========================
  // PINDAHKAN PEMAIN
  // =========================
  const handlePindahkan = async () => {
    if (!selectedPemain) {
      alert("Pemain belum dipilih");
      return;
    }

    if (!selectedPelatih) {
      alert("Silakan pilih pelatih tujuan");
      return;
    }

    const pelatihTujuan = pelatih.find(
      (item) => String(item.id) === String(selectedPelatih)
    );

    const konfirmasi = window.confirm(
      `Pindahkan pemain "${selectedPemain.nama}" ke pelatih "${pelatihTujuan?.nama || "pelatih tujuan"}"?`
    );

    if (!konfirmasi) return;

    try {
      setLoadingPindah(true);

      const res = await axios.put(
        `/api/pemain/${selectedPemain.id}/pindahkan`,
        {
          pelatih_id: Number(selectedPelatih),
        }
      );

      alert(
        res.data?.message || "Pemain berhasil dipindahkan"
      );

      setShowPindahModal(false);
      setSelectedPemain(null);
      setSelectedPelatih("");

      await getData();
    } catch (error) {
      console.error("Gagal memindahkan pemain:", error);

      const errMsg =
        error.response?.data?.message ||
        "Gagal memindahkan pemain";

      alert(errMsg);
    } finally {
      setLoadingPindah(false);
    }
  };

  // =========================
  // FORMAT TANGGAL TAMPILAN
  // =========================
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT TANGGAL EXCEL
  // =========================
  const formatDateExcel = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =========================
  // NILAI AMAN
  // =========================
  const safe = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return value;
  };

  // =========================
  // AUTO WIDTH KOLOM EXCEL
  // =========================
  const autoFitColumns = (worksheet) => {
    if (
      !worksheet ||
      !worksheet["!ref"]
    ) {
      return;
    }

    const range = XLSX.utils.decode_range(
      worksheet["!ref"]
    );

    const widths = [];

    for (
      let col = range.s.c;
      col <= range.e.c;
      col++
    ) {
      let maxLength = 10;

      for (
        let row = range.s.r;
        row <= range.e.r;
        row++
      ) {
        const cellAddress = XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

        const cell = worksheet[cellAddress];

        if (!cell || cell.v === undefined) {
          continue;
        }

        const value = String(cell.v);

        if (value.length > maxLength) {
          maxLength = value.length;
        }
      }

      widths.push({
        wch: Math.min(maxLength + 2, 45),
      });
    }

    worksheet["!cols"] = widths;
  };

  // =========================
  // EXPORT DATA MANAGEMENT
  // =========================
  const exportToExcel = async () => {
    if (loadingExport) return;

    try {
      setLoadingExport(true);

      // ==========================================
      // AMBIL SEMUA DATA DARI BACKEND
      // ==========================================
      const res = await axios.get(
        "/api/export/data-management"
      );

      const data = res.data;

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Gagal mengambil data export"
        );
      }

      // ==========================================
      // DATA UTAMA
      // ==========================================
      const dataPemain = data.data_pemain || [];
      const dataPelatih = data.data_pelatih || [];
      const pemainPelatih = data.pemain_pelatih || [];
      const kelompokPelatih =
        data.kelompok_umur_pelatih || [];
      const historiRaport =
        data.histori_raport || [];
      const akunSiswa = data.akun_siswa || [];
      const materiLatihan =
        data.materi_latihan || [];

      const statistik = data.statistik || {};

      const workbook = XLSX.utils.book_new();

      // ==================================================
      // SHEET 1 - RINGKASAN
      // ==================================================
      const ringkasanRows = [
        {
          Informasi: "Tanggal Export",
          Nilai: formatDateExcel(
            data.ringkasan?.tanggal_export
          ),
        },
        {
          Informasi: "Total Pemain",
          Nilai: data.ringkasan?.total_pemain || 0,
        },
        {
          Informasi: "Pemain Aktif",
          Nilai:
            data.ringkasan?.total_pemain_aktif || 0,
        },
        {
          Informasi: "Pemain Nonaktif",
          Nilai:
            data.ringkasan?.total_pemain_nonaktif || 0,
        },
        {
          Informasi: "Total Pelatih",
          Nilai: data.ringkasan?.total_pelatih || 0,
        },
        {
          Informasi: "Total Raport",
          Nilai: data.ringkasan?.total_raport || 0,
        },
        {
          Informasi: "Total Akun Siswa",
          Nilai:
            data.ringkasan?.total_akun_siswa || 0,
        },
        {
          Informasi: "Total Materi Latihan",
          Nilai:
            data.ringkasan?.total_materi || 0,
        },
        {
          Informasi: "Total Kelompok Pelatih",
          Nilai:
            data.ringkasan?.total_kelompok_pelatih ||
            0,
        },
      ];

      const wsRingkasan =
        XLSX.utils.json_to_sheet(
          ringkasanRows
        );

      autoFitColumns(wsRingkasan);

      XLSX.utils.book_append_sheet(
        workbook,
        wsRingkasan,
        "RINGKASAN"
      );

      // ==================================================
      // SHEET 1B - STATISTIK PEMAIN
      // ==================================================
      const statistikRows = [];

      statistikRows.push({
        Kategori: "JUMLAH PEMAIN PER KELOMPOK UMUR",
        Detail: "",
        Jumlah: "",
      });

      (
        statistik.pemain_per_kelompok_umur || []
      ).forEach((item) => {
        statistikRows.push({
          Kategori: "Kelompok Umur",
          Detail: safe(item.kelompok_umur),
          Jumlah: safe(item.jumlah_pemain),
        });
      });

      statistikRows.push({
        Kategori: "",
        Detail: "",
        Jumlah: "",
      });

      statistikRows.push({
        Kategori: "JUMLAH PEMAIN PER STATUS",
        Detail: "",
        Jumlah: "",
      });

      (
        statistik.pemain_per_status || []
      ).forEach((item) => {
        statistikRows.push({
          Kategori: "Status",
          Detail: safe(item.status),
          Jumlah: safe(item.jumlah),
        });
      });

      statistikRows.push({
        Kategori: "",
        Detail: "",
        Jumlah: "",
      });

      statistikRows.push({
        Kategori: "JUMLAH PEMAIN PER PELATIH",
        Detail: "",
        Jumlah: "",
      });

      (
        statistik.pemain_per_pelatih || []
      ).forEach((item) => {
        statistikRows.push({
          Kategori: "Pelatih",
          Detail: safe(item.nama_pelatih),
          Jumlah: safe(item.jumlah_pemain),
        });
      });

      const wsStatistik =
        XLSX.utils.json_to_sheet(
          statistikRows
        );

      autoFitColumns(wsStatistik);

      XLSX.utils.book_append_sheet(
        workbook,
        wsStatistik,
        "STATISTIK"
      );

      // ==================================================
      // SHEET 2 - DATA PEMAIN
      // ==================================================
      const pemainRows = dataPemain.map(
        (p, index) => ({
          No: index + 1,
          ID: safe(p.id),
          Nama: safe(p.nama),
          Email: safe(p.email),
          "Tempat Lahir": safe(
            p.tempat_lahir
          ),
          "Tanggal Lahir":
            formatDateExcel(
              p.tanggal_lahir
            ),
          "Asal Sekolah": safe(
            p.asal_sekolah
          ),
          Alamat: safe(p.alamat),
          "No HP": safe(p.no_hp),
          "Tanggal Pendaftaran":
            formatDateExcel(
              p.created_at
            ),
          "Tanggal Validasi":
            formatDateExcel(
              p.validated_at
            ),
          Validator: safe(
            p.validated_by
          ),
          "Tanggal Approved":
            formatDateExcel(
              p.approved_at
            ),
          Status: safe(p.status),
          "Kelompok Umur": safe(
            p.kelompok_umur
          ),
          "Pelatih ID": safe(
            p.pelatih_id
          ),
          "Nama Pelatih": safe(
            p.nama_pelatih
          ),
          "Email Pelatih": safe(
            p.email_pelatih
          ),
          "No HP Pelatih": safe(
            p.no_hp_pelatih
          ),
          Dokumen: safe(p.dokumen),
          "Foto Pemain": safe(
            p.foto_pemain
          ),
        })
      );

      const wsPemain =
        XLSX.utils.json_to_sheet(
          pemainRows
        );

      autoFitColumns(wsPemain);

      XLSX.utils.book_append_sheet(
        workbook,
        wsPemain,
        "DATA PEMAIN"
      );

      // ==================================================
      // SHEET 3 - DATA PELATIH
      // PASSWORD TIDAK DIAMBIL
      // ==================================================
      const pelatihRows = dataPelatih.map(
        (p, index) => ({
          No: index + 1,
          ID: safe(p.id),
          Nama: safe(p.nama),
          Lisensi: safe(p.lisensi),
          "No HP": safe(p.no_hp),
          Email: safe(p.email),
          Alamat: safe(p.alamat),
          Foto: safe(p.foto),
          "Tanggal Dibuat":
            formatDateExcel(
              p.created_at
            ),
        })
      );

      const wsPelatih =
        XLSX.utils.json_to_sheet(
          pelatihRows
        );

      autoFitColumns(wsPelatih);

      XLSX.utils.book_append_sheet(
        workbook,
        wsPelatih,
        "DATA PELATIH"
      );

      // ==================================================
      // SHEET 4 - PEMAIN & PELATIH
      // ==================================================
      const pemainPelatihRows =
        pemainPelatih.map(
          (p, index) => ({
            No: index + 1,
            "ID Pemain": safe(
              p.pemain_id
            ),
            "Nama Pemain": safe(
              p.nama_pemain
            ),
            "Email Pemain": safe(
              p.email_pemain
            ),
            "Kelompok Umur": safe(
              p.kelompok_umur
            ),
            Status: safe(
              p.status
            ),
            "ID Pelatih": safe(
              p.pelatih_id
            ),
            "Nama Pelatih": safe(
              p.nama_pelatih
            ),
            "Email Pelatih": safe(
              p.email_pelatih
            ),
            "No HP Pelatih": safe(
              p.no_hp_pelatih
            ),
            "Lisensi Pelatih": safe(
              p.lisensi_pelatih
            ),
          })
        );

      const wsPemainPelatih =
        XLSX.utils.json_to_sheet(
          pemainPelatihRows
        );

      autoFitColumns(
        wsPemainPelatih
      );

      XLSX.utils.book_append_sheet(
        workbook,
        wsPemainPelatih,
        "PEMAIN & PELATIH"
      );

      // ==================================================
      // SHEET 5 - KELOMPOK UMUR
      // ==================================================
      const kelompokRows =
        kelompokPelatih.map(
          (item, index) => ({
            No: index + 1,
            ID: safe(item.id),
            "Pelatih ID": safe(
              item.pelatih_id
            ),
            "Nama Pelatih": safe(
              item.nama_pelatih
            ),
            "Email Pelatih": safe(
              item.email_pelatih
            ),
            "Kelompok Umur": safe(
              item.kelompok_umur
            ),
            "Tanggal Dibuat":
              formatDateExcel(
                item.created_at
              ),
          })
        );

      const wsKelompok =
        XLSX.utils.json_to_sheet(
          kelompokRows
        );

      autoFitColumns(wsKelompok);

      XLSX.utils.book_append_sheet(
        workbook,
        wsKelompok,
        "KELOMPOK UMUR"
      );

      // ==================================================
      // SHEET 6 - HISTORI RAPORT
      // ==================================================
      const raportRows =
        historiRaport.map(
          (r, index) => ({
            No: index + 1,

            "ID Raport": safe(
              r.id_raport
            ),

            "ID Pemain": safe(
              r.pemain_id
            ),

            "Nama Pemain": safe(
              r.nama_pemain
            ),

            "Email Pemain": safe(
              r.email_pemain
            ),

            "Kelompok Umur Pemain":
              safe(
                r.kelompok_umur_pemain
              ),

            Periode: safe(
              r.periode
            ),

            Posisi: safe(
              r.posisi
            ),

            // =========================
            // TEKNIK MENYERANG
            // =========================
            Dribbling: safe(
              r.dribbling_feinting
            ),

            Passing: safe(
              r.passing
            ),

            "First Touch": safe(
              r.first_touch
            ),

            Shooting: safe(
              r.shooting
            ),

            Heading: safe(
              r.heading
            ),

            "Long Passing": safe(
              r.long_passing
            ),

            // =========================
            // TEKNIK BERTAHAN
            // =========================
            Clearance: safe(
              r.clearance
            ),

            Intercept: safe(
              r.intercept
            ),

            Tackling: safe(
              r.tackling
            ),

            // =========================
            // KONDISI FISIK
            // =========================
            Strength: safe(
              r.strength
            ),

            Endurance: safe(
              r.endurance
            ),

            Speed: safe(
              r.speed
            ),

            "Flexibility & Coordination":
              safe(
                r.flexibility_coordination
              ),

            // =========================
            // TAKTIKAL
            // =========================
            Menyerang: safe(
              r.menyerang
            ),

            Bertahan: safe(
              r.bertahan
            ),

            Transisi: safe(
              r.transisi
            ),

            // =========================
            // MENTAL & KARAKTER
            // =========================
            Disiplin: safe(
              r.disiplin
            ),

            "Kerja Keras": safe(
              r.kerja_keras
            ),

            "Percaya Diri": safe(
              r.percaya_diri
            ),

            "Tanggung Jawab": safe(
              r.tanggung_jawab
            ),

            Personality: safe(
              r.personality
            ),

            Komunikasi: safe(
              r.komunikasi
            ),

            // =========================
            // HASIL
            // =========================
            "Jumlah Parameter": safe(
              r.jumlah_parameter
            ),

            "Total Nilai": safe(
              r.total_nilai
            ),

            "Rata-rata": safe(
              r.rata_rata
            ),

            "Catatan Pelatih": safe(
              r.catatan_pelatih
            ),

            // =========================
            // PELATIH PEMBUAT RAPORT
            // =========================
            "ID Pelatih Pembuat": safe(
              r.pelatih_pembuat_id
            ),

            "Nama Pelatih Pembuat":
              safe(
                r.nama_pelatih_pembuat
              ),

            "Email Pelatih Pembuat":
              safe(
                r.email_pelatih_pembuat
              ),

            "Lisensi Pelatih Pembuat":
              safe(
                r.lisensi_pelatih_pembuat
              ),

            "Tanggal Dibuat":
              formatDateExcel(
                r.created_at
              ),

            "Tanggal Diupdate":
              formatDateExcel(
                r.updated_at
              ),
          })
        );

      const wsRaport =
        XLSX.utils.json_to_sheet(
          raportRows
        );

      autoFitColumns(wsRaport);

      XLSX.utils.book_append_sheet(
        workbook,
        wsRaport,
        "HISTORI RAPORT"
      );

      // ==================================================
      // SHEET 7 - AKUN SISWA
      // PASSWORD TIDAK DIAMBIL
      // ==================================================
      const akunRows =
        akunSiswa.map(
          (a, index) => ({
            No: index + 1,
            ID: safe(a.id),
            "ID Pemain": safe(
              a.pemain_id
            ),
            "Nama Pemain": safe(
              a.nama_pemain
            ),
            Email: safe(a.email),
            "Kelompok Umur": safe(
              a.kelompok_umur
            ),
            "Pelatih ID": safe(
              a.pelatih_id
            ),
            "Nama Pelatih": safe(
              a.nama_pelatih
            ),
            "Tanggal Dibuat":
              formatDateExcel(
                a.created_at
              ),
          })
        );

      const wsAkun =
        XLSX.utils.json_to_sheet(
          akunRows
        );

      autoFitColumns(wsAkun);

      XLSX.utils.book_append_sheet(
        workbook,
        wsAkun,
        "AKUN SISWA"
      );

      // ==================================================
      // SHEET 8 - MATERI LATIHAN
      // ==================================================
      const materiRows =
        materiLatihan.map(
          (m, index) => ({
            No: index + 1,
            ID: safe(m.id),
            Judul: safe(m.judul),
            Kategori: safe(
              m.kategori
            ),
            Tanggal:
              formatDateExcel(
                m.tanggal
              ),
            "Pelatih (Input)": safe(
              m.pelatih
            ),
            "Pelatih ID": safe(
              m.pelatih_id
            ),
            "Nama Pelatih": safe(
              m.nama_pelatih
            ),
            Durasi: safe(
              m.durasi
            ),
            Lokasi: safe(
              m.lokasi
            ),
            Deskripsi: safe(
              m.deskripsi
            ),
            "Tanggal Dibuat":
              formatDateExcel(
                m.created_at
              ),
            "File Materi": safe(
              m.file_materi
            ),
          })
        );

      const wsMateri =
        XLSX.utils.json_to_sheet(
          materiRows
        );

      autoFitColumns(wsMateri);

      XLSX.utils.book_append_sheet(
        workbook,
        wsMateri,
        "MATERI LATIHAN"
      );

      // ==================================================
      // GENERATE FILE EXCEL
      // ==================================================
      const excelBuffer =
        XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

      const blob = new Blob(
        [excelBuffer],
        {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }
      );

      saveAs(
        blob,
        "Data_Management_SSB_Gagak_Muda.xlsx"
      );

      alert(
        "Data Management SSB berhasil di-download"
      );
    } catch (error) {
      console.error(
        "GAGAL EXPORT DATA MANAGEMENT:",
        error
      );

      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat file Excel";

      alert(
        `Gagal download Excel:\n${errMsg}`
      );
    } finally {
      setLoadingExport(false);
    }
  };

  // =========================
  // FILTER
  // =========================
  const filteredPemain = pemain.filter((p) =>
    p.nama
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  );

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(
    filteredPemain.length /
      itemsPerPage
  );

  const currentItems =
    filteredPemain.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">

      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

        {/* =========================
            HEADER
        ========================= */}
        <div className="bg-indigo-700 p-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-center md:text-left">

            <h2 className="text-2xl font-bold text-white tracking-tight">
              DATA PEMAIN AKTIF
            </h2>

            <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mt-1">
              Total: {pemain.length} pemain
            </p>

          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Cari nama..."
              value={searchTerm}
              className="w-full md:w-64 px-4 py-2 rounded-lg bg-indigo-800 border border-indigo-500 text-white text-sm placeholder:text-indigo-300 focus:outline-none focus:bg-white focus:text-gray-900 transition-all"
              onChange={(e) => {
                setSearchTerm(
                  e.target.value
                );
                setCurrentPage(1);
              }}
            />

            {/* EXPORT EXCEL */}
            <button
              onClick={exportToExcel}
              disabled={loadingExport}
              className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all text-white ${
                loadingExport
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loadingExport
                ? "MENYIAPKAN EXCEL..."
                : "DOWNLOAD EXCEL"}
            </button>

            {/* BACK */}
            <Link
              to="/Dashboard"
              className="bg-white text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-md"
              title="Kembali"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

          </div>
        </div>

        {/* =========================
            TABLE
        ========================= */}
        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">

                <th className="px-6 py-4 w-1/4">
                  Info Pemain
                </th>

                <th className="px-6 py-4 w-1/4">
                  Kontak & Asal Sekolah
                </th>

                <th className="px-6 py-4 w-1/6 text-center">
                  Berkas Pendaftaran
                </th>

                <th className="px-6 py-4 w-1/6">
                  Validasi Pendaftaran
                </th>

                <th className="px-6 py-4 w-1/5">
                  Tanggal
                </th>

                <th className="px-6 py-4 text-center">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {currentItems.length > 0 ? (

                currentItems.map((p) => (

                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors"
                  >

                    {/* =========================
                        INFO PEMAIN
                    ========================= */}
                    <td className="px-6 py-3">

                      <div className="flex items-center gap-3">

                        <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold border border-indigo-200 uppercase">

                          {p.nama.charAt(0)}

                        </div>

                        <div>

                          <div className="font-bold text-gray-900 text-sm uppercase leading-tight">
                            {p.nama}
                          </div>

                          <div className="text-[10px] text-gray-400 italic font-medium">
                            {p.email}
                          </div>

                        </div>

                      </div>

                    </td>

                    {/* =========================
                        KONTAK
                    ========================= */}
                    <td className="px-6 py-3">

                      <div className="text-xs font-bold text-gray-700">
                        {p.no_hp || "-"}
                      </div>

                      <div className="text-[10px] text-indigo-500 font-bold uppercase truncate max-w-[150px]">
                        {p.asal_sekolah}
                      </div>

                    </td>

                    {/* =========================
                        BERKAS
                    ========================= */}
                    <td className="px-6 py-3 text-center">

                      <a
                        href={`/uploads/${p.dokumen}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-3 py-1 bg-gray-100 hover:bg-indigo-600 hover:text-white border border-gray-200 rounded text-[10px] font-bold transition-all"
                      >
                        LIHAT BERKAS
                      </a>

                    </td>

                    {/* =========================
                        VALIDASI
                    ========================= */}
                    <td className="px-6 py-3">

                      <div className="text-[10px] leading-tight">

                        <span className="text-gray-400 block uppercase font-bold">
                          Oleh:{" "}
                          {p.validated_by ||
                            "ADMIN"}
                        </span>

                        <span className="text-gray-700">
                          {formatDate(
                            p.approved_at ||
                              p.validated_at
                          )}
                        </span>

                      </div>

                    </td>

                    {/* =========================
                        TANGGAL
                    ========================= */}
                    <td className="px-6 py-3">

                      <div className="text-[10px] leading-tight">

                        <div className="mb-2">

                          <span className="block text-gray-400 uppercase font-bold">
                            Daftar
                          </span>

                          <span className="text-gray-700">
                            {formatDate(
                              p.created_at
                            )}
                          </span>

                        </div>

                        <div>

                          <span className="block text-green-500 uppercase font-bold">
                            Approved
                          </span>

                          <span className="text-gray-700">
                            {formatDate(
                              p.approved_at
                            )}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* =========================
                        AKSI
                    ========================= */}
                    <td className="px-6 py-3 text-center">

                      <div className="flex items-center justify-center gap-2">

                        {/* VIEW DETAIL */}
                        <Link
                          to={`/detail-pemain/${p.id}`}
                          className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="Lihat Detail Pemain"
                        >

                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />

                          </svg>

                        </Link>

                        {/* EDIT */}
                        <Link
                          to={`/edit-pemain/${p.id}`}
                          className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >

                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5h2m-1-1v2m-6 9l9-9 3 3-9 9H6v-3z"
                            />

                          </svg>

                        </Link>

                        {/* PINDAHKAN */}
                        <button
                          onClick={() =>
                            handleOpenPindah(p)
                          }
                          className="p-2 text-orange-500 hover:text-orange-700 transition-colors"
                          title="Pindahkan Pemain"
                        >

                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 7h10m0 0-3-3m3 3-3 3"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17 17H7m0 0 3 3m-3-3 3-3"
                            />

                          </svg>

                        </button>

                        {/* BUAT AKUN SISWA */}
                        <Link
                          to="/buat-akun"
                          className="p-2 text-green-500 hover:text-green-700 transition-colors"
                          title="Buat Akun Siswa"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </Link>

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            handleDelete(p.id)
                          }
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >

                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 01-1 1v3M4 7h16"
                            />

                          </svg>

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="px-10 py-16 text-center text-gray-400 text-xs font-bold uppercase italic"
                  >
                    Data tidak ditemukan
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =========================
            FOOTER
        ========================= */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Halaman{" "}
            {currentPage} dari{" "}
            {totalPages || 1}
          </p>

          <div className="flex gap-2">

            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    prev - 1
                )
              }
              className={`px-4 py-2 rounded text-[11px] font-black transition-all ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
            >
              SEBELUMNYA
            </button>

            <button
              disabled={
                currentPage ===
                  totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    prev + 1
                )
              }
              className={`px-4 py-2 rounded text-[11px] font-black transition-all ${
                currentPage ===
                    totalPages ||
                  totalPages === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
            >
              SELANJUTNYA
            </button>

          </div>

        </div>

      </div>

      {/* ==================================================
          MODAL PINDAHKAN PEMAIN
      ================================================== */}
      {showPindahModal &&
        selectedPemain && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

              {/* MODAL HEADER */}
              <div className="bg-orange-500 px-6 py-4">

                <h3 className="text-lg font-bold text-white">
                  PINDAHKAN PEMAIN
                </h3>

                <p className="text-orange-100 text-xs mt-1">
                  Pilih pelatih tujuan pemain
                </p>

              </div>

              {/* MODAL BODY */}
              <div className="p-6">

                {/* INFO PEMAIN */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-5">

                  <div className="text-xs text-gray-400 uppercase font-bold">
                    Pemain
                  </div>

                  <div className="text-base font-bold text-gray-900 uppercase mt-1">
                    {selectedPemain.nama}
                  </div>

                  <div className="flex gap-2 mt-2">

                    <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold">
                      {selectedPemain.kelompok_umur ||
                        "-"}
                    </span>

                    {selectedPemain.pelatih_id && (

                      <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold">
                        Pelatih ID:{" "}
                        {
                          selectedPemain.pelatih_id
                        }
                      </span>

                    )}

                  </div>

                </div>

                {/* SELECT PELATIH */}
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                  Pelatih Tujuan
                </label>

                <select
                  value={
                    selectedPelatih
                  }
                  onChange={(e) =>
                    setSelectedPelatih(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  disabled={
                    loadingPindah
                  }
                >

                  <option value="">
                    -- Pilih Pelatih Tujuan --
                  </option>

                  {pelatih.map(
                    (item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.nama}
                        {item.lisensi
                          ? ` - ${item.lisensi}`
                          : ""}
                      </option>

                    )
                  )}

                </select>

                {/* INFO */}
                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  Kelompok umur pemain
                  tidak akan berubah.
                  Hanya pelatih yang
                  menangani pemain yang
                  akan dipindahkan.
                </p>

                {/* BUTTON */}
                <div className="flex justify-end gap-3 mt-6">

                  <button
                    type="button"
                    onClick={
                      handleClosePindah
                    }
                    disabled={
                      loadingPindah
                    }
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                  >
                    BATAL
                  </button>

                  <button
                    type="button"
                    onClick={
                      handlePindahkan
                    }
                    disabled={
                      loadingPindah ||
                      !selectedPelatih
                    }
                    className={`px-4 py-2 rounded-lg text-white text-xs font-bold ${
                      loadingPindah ||
                      !selectedPelatih
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {loadingPindah
                      ? "MEMINDAHKAN..."
                      : "PINDAHKAN"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default ManagePemain;