import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BuatRaport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pemain, setPemain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    periode: "",
    posisi: "",
    dribbling_feinting: "",
    passing: "",
    first_touch: "",
    shooting: "",
    heading: "",
    long_passing: "",
    clearance: "",
    intercept: "",
    tackling: "",
    strength: "",
    endurance: "",
    speed: "",
    flexibility_coordination: "",
    menyerang: "",
    bertahan: "",
    transisi: "",
    disiplin: "",
    kerja_keras: "",
    percaya_diri: "",
    tanggung_jawab: "",
    personality: "",
    komunikasi: "",
    catatan_pelatih: "",
  });

  // =========================
  // AMBIL DATA PEMAIN
  // =========================
  useEffect(() => {
    const fetchPemain = async () => {
      try {
        const response = await axios.get(
          `/api/pemain/${id}`
        );
        setPemain(response.data);
      } catch (error) {
        console.error("Gagal mengambil data pemain:", error);
        alert("Gagal mengambil data pemain.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPemain();
    }
  }, [id]);

  // =========================
  // HANDLE CHANGE FORM
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // HANDLE RATING
  // =========================
  const handleRatingChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value.toString(),
    }));
  };

  // =========================
  // SKEMA PENILAIAN
  // =========================
  const penilaian = [
    {
      bagian: "A. TEKNIK MENYERANG",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      items: [
        ["dribbling_feinting", "Dribbling & Feinting"],
        ["passing", "Passing"],
        ["first_touch", "First Touch"],
        ["shooting", "Shooting"],
        ["heading", "Heading"],
        ["long_passing", "Long Passing"],
      ],
    },
    {
      bagian: "B. TEKNIK BERTAHAN",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      items: [
        ["clearance", "Clearance"],
        ["intercept", "Intercept"],
        ["tackling", "Tackling"],
      ],
    },
    {
      bagian: "C. KONDISI FISIK",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      items: [
        ["strength", "Strength"],
        ["endurance", "Endurance"],
        ["speed", "Speed"],
        ["flexibility_coordination", "Flexibility / Coordination"],
      ],
    },
    {
      bagian: "D. TAKTIKAL",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      items: [
        ["menyerang", "Taktik Menyerang"],
        ["bertahan", "Taktik Bertahan"],
        ["transisi", "Transisi Permainan"],
      ],
    },
    {
      bagian: "E. MENTAL & KARAKTER",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
      items: [
        ["disiplin", "Disiplin"],
        ["kerja_keras", "Kerja Keras"],
        ["percaya_diri", "Percaya Diri"],
        ["tanggung_jawab", "Rasa Tanggung Jawab"],
        ["personality", "Kepribadian"],
        ["komunikasi", "Komunikasi Lapangan"],
      ],
    },
  ];

  // =========================
  // HITUNG SUBTOTAL
  // =========================
  const hitungSubtotal = (items) => {
    return items.reduce((total, [name]) => {
      return total + (Number(form[name]) || 0);
    }, 0);
  };

  // =========================
  // HITUNG TOTAL
  // =========================
  const totalNilai = penilaian.reduce((total, section) => {
    return total + hitungSubtotal(section.items);
  }, 0);

  const maksimalNilai = penilaian.reduce((total, section) => {
    return total + section.items.length * 5;
  }, 0);

  // =========================
  // HITUNG JUMLAH PARAMETER
  // =========================
  const jumlahTerisi = penilaian.reduce((total, section) => {
    return (
      total +
      section.items.filter(([name]) => form[name] !== "").length
    );
  }, 0);

  const jumlahParameter = penilaian.reduce((total, section) => {
    return total + section.items.length;
  }, 0);

  // =========================
  // SUBMIT FORM
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();


  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "pelatih" || !user.id) {
    alert("Data pelatih tidak ditemukan. Silakan login kembali.");
    return;
  }
    if (!form.posisi) {
      alert("Silakan pilih posisi pemain terlebih dahulu.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        "/api/raport",
        {
          pemain_id: pemain.id,
          pelatih_id: user.id,
          periode: form.periode,
          posisi: form.posisi,

          dribbling_feinting: form.dribbling_feinting,
          passing: form.passing,
          first_touch: form.first_touch,
          shooting: form.shooting,
          heading: form.heading,
          long_passing: form.long_passing,
          clearance: form.clearance,
          intercept: form.intercept,
          tackling: form.tackling,
          strength: form.strength,
          endurance: form.endurance,
          speed: form.speed,
          flexibility_coordination: form.flexibility_coordination,
          menyerang: form.menyerang,
          bertahan: form.bertahan,
          transisi: form.transisi,
          disiplin: form.disiplin,
          kerja_keras: form.kerja_keras,
          percaya_diri: form.percaya_diri,
          tanggung_jawab: form.tanggung_jawab,
          personality: form.personality,
          komunikasi: form.komunikasi,
          catatan_pelatih: form.catatan_pelatih,
        }
      );

      console.log("Raport berhasil disimpan:", response.data);

      alert("✅ Raport berhasil disimpan ke database!");

      navigate("/raport-siswa");
    } catch (error) {
      console.error("Gagal menyimpan raport:", error);

      alert(
        error.response?.data?.message ||
          "❌ Gagal menyimpan raport."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>

          <p className="text-slate-600 font-medium">
            Memuat data pemain...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // PEMAIN TIDAK DITEMUKAN
  // =========================
  if (!pemain) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>

          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Pemain tidak ditemukan
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            Data pemain dengan ID tersebut tidak dapat diakses
            atau telah dihapus.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN
  // =========================
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">

            <div>
              <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                SSB Gagak Muda
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Lembar Evaluasi Pemain
              </h1>

              <p className="text-slate-400 text-sm mt-1">
                Isi parameter kemampuan teknis, fisik,
                dan mental pemain secara obyektif.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-right self-start sm:self-auto">
              <span className="text-xs text-slate-300 block">
                Periode
              </span>

              <span className="font-bold text-sm text-indigo-200">
                {form.periode || "Belum dipilih"}
              </span>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* PROFIL PEMAIN */}
        {/* ========================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">

          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Informasi Pemain
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="block text-xs font-medium text-slate-400 mb-0.5">
                ID Pemain
              </span>

              <span className="font-bold text-slate-800 text-sm">
                #{pemain.id}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="block text-xs font-medium text-slate-400 mb-0.5">
                Nama Lengkap
              </span>

              <span className="font-bold text-slate-800 text-sm truncate block">
                {pemain.nama || "-"}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="block text-xs font-medium text-slate-400 mb-0.5">
                Kelompok Umur
              </span>

              <span className="font-bold text-indigo-600 text-sm">
                {pemain.kelompok_umur || "-"}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="block text-xs font-medium text-slate-400 mb-0.5">
                Tanggal Lahir
              </span>

              <span className="font-bold text-slate-800 text-sm">
                {pemain.tanggal_lahir
                  ? new Date(
                      pemain.tanggal_lahir
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>

          {/* ========================= */}
          {/* PERIODE */}
          {/* ========================= */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Periode Raport{" "}
              <span className="text-rose-500">*</span>
            </label>

            <select
              name="periode"
              value={form.periode}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
            >
              <option value="">
                -- Pilih Periode Raport --
              </option>

              <option value="Periode 1 / 2026">
                Periode 1 / 2026
              </option>

              <option value="Periode 2 / 2026">
                Periode 2 / 2026
              </option>
            </select>
          </div>

          {/* ========================= */}
          {/* POSISI */}
          {/* ========================= */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Posisi Utama{" "}
              <span className="text-rose-500">*</span>
            </label>

            <select
              name="posisi"
              value={form.posisi}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
            >
              <option value="">
                -- Pilih Posisi Pemain --
              </option>

              <optgroup label="Kiper">
                <option value="GK">
                  GK - Goalkeeper
                </option>
              </optgroup>

              <optgroup label="Lini Belakang">
                <option value="CB">
                  CB - Center Back
                </option>

                <option value="LB">
                  LB - Left Back
                </option>

                <option value="RB">
                  RB - Right Back
                </option>
              </optgroup>

              <optgroup label="Lini Tengah">
                <option value="CM">
                  CM - Central Midfielder
                </option>

                <option value="LM">
                  LM - Left Midfielder
                </option>

                <option value="RM">
                  RM - Right Midfielder
                </option>

                <option value="AM">
                  AM - Attacking Midfielder
                </option>
              </optgroup>

              <optgroup label="Lini Depan">
                <option value="LW">
                  LW - Left Winger
                </option>

                <option value="RW">
                  RW - Right Winger
                </option>

                <option value="ST">
                  ST - Striker
                </option>

                <option value="CF">
                  CF - Center Forward
                </option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* ========================= */}
        {/* LEGENDA */}
        {/* ========================= */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-900">

          <span className="font-bold uppercase tracking-wider text-indigo-950">
            Skala Penilaian:
          </span>

          <div className="flex flex-wrap items-center gap-2 font-medium">

            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              1 - Kurang Sekali
            </span>

            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              2 - Kurang
            </span>

            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              3 - Sedang
            </span>

            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              4 - Baik
            </span>

            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs text-indigo-700 font-bold">
              5 - Baik Sekali
            </span>
          </div>
        </div>

        {/* ========================= */}
        {/* PROGRESS PENILAIAN */}
        {/* ========================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">
              Progress Penilaian
            </span>

            <span className="text-sm font-black text-indigo-600">
              {jumlahTerisi} / {jumlahParameter}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{
                width: `${
                  jumlahParameter > 0
                    ? (jumlahTerisi / jumlahParameter) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Pastikan seluruh parameter sudah dinilai sebelum
            menyimpan raport.
          </p>
        </div>

        {/* ========================= */}
        {/* SECTION PENILAIAN */}
        {/* ========================= */}
        {penilaian.map((section) => {
          const subtotal = hitungSubtotal(section.items);
          const maksimal = section.items.length * 5;

          return (
            <div
              key={section.bagian}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* HEADER SECTION */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">

                <h2 className="text-base font-bold text-slate-800">
                  {section.bagian}
                </h2>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${section.badgeColor}`}
                >
                  {section.items.length} Parameter
                </span>
              </div>

              {/* ITEM PENILAIAN */}
              <div className="p-6 divide-y divide-slate-100">

                {section.items.map(
                  ([name, label], index) => {
                    const currentValue = form[name];

                    return (
                      <div
                        key={name}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          index === 0
                            ? "pb-4"
                            : index ===
                              section.items.length - 1
                            ? "pt-4"
                            : "py-4"
                        }`}
                      >

                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>

                          <span className="font-medium text-slate-700 text-sm">
                            {label}
                          </span>
                        </div>

                        {/* SKOR */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">

                          {[1, 2, 3, 4, 5].map(
                            (val) => {
                              const isSelected =
                                currentValue ===
                                val.toString();

                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() =>
                                    handleRatingChange(
                                      name,
                                      val
                                    )
                                  }
                                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center border ${
                                    isSelected
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* ========================= */}
              {/* SUBTOTAL */}
              {/* ========================= */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Subtotal
                  </p>

                  <p className="text-sm font-bold text-slate-700 mt-1">
                    {section.bagian.replace(
                      /^[A-Z]\.\s*/,
                      ""
                    )}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Maksimal {maksimal} poin
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">
                    {subtotal}
                  </span>

                  <span className="text-sm font-semibold text-slate-400">
                    {" "}
                    / {maksimal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ========================= */}
        {/* TOTAL NILAI */}
        {/* ========================= */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white shadow-md">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                Total Nilai Keseluruhan
              </p>

              <h2 className="text-xl font-black mt-1">
                Hasil Evaluasi Pemain
              </h2>

              <p className="text-indigo-200 text-xs mt-1">
                Akumulasi seluruh parameter penilaian
              </p>
            </div>

            <div className="text-right">
              <span className="text-4xl font-black">
                {totalNilai}
              </span>

              <span className="text-lg font-semibold text-indigo-200">
                {" "}
                / {maksimalNilai}
              </span>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* CATATAN PELATIH */}
        {/* ========================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">

          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Catatan & Evaluasi Pelatih
          </h2>

          <p className="text-xs text-slate-500 mb-4">
            Berikan masukan konstruktif mengenai kelebihan
            maupun aspek yang perlu ditingkatkan oleh pemain.
          </p>

          <textarea
            name="catatan_pelatih"
            value={form.catatan_pelatih}
            onChange={handleChange}
            rows="4"
            placeholder="Contoh: Pemain memiliki penguasaan bola yang sangat baik, namun perlu meningkatkan komunikasi saat transisi bertahan..."
            className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none resize-none"
          />
        </div>

        {/* ========================= */}
        {/* TOMBOL AKSI */}
        {/* ========================= */}
        <div className="flex items-center justify-end gap-3 pt-4">

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-sm transition disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Menyimpan...
              </>
            ) : (
              "Simpan Raport"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuatRaport;

