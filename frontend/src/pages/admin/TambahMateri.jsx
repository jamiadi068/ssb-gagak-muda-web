import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TambahMateri() {
  const navigate = useNavigate();

  // LIST PELATIH
  const [listPelatih, setListPelatih] = useState([]);
  const [loading, setLoading] = useState(false);

  // FILE MATERI
  const [fileMateri, setFileMateri] = useState(null);

  // FORM
  const [form, setForm] = useState({
    judul: "",
    kategori: "",
    tanggal: "",
    pelatih: "",
    pelatih_id: null,
    durasi: "",
    lokasi: "",
    deskripsi: "",
  });

  // ==================================================
  // AMBIL DATA PELATIH
  // ==================================================

  const getPelatih = async () => {
    try {
      const res = await axios.get(
        "/api/pelatih"
      );

      setListPelatih(res.data);
    } catch (err) {
      console.error(
        "Gagal mengambil data pelatih",
        err
      );

      alert("Gagal mengambil daftar pelatih");
    }
  };

  useEffect(() => {
    getPelatih();
  }, []);

  // ==================================================
  // HANDLE INPUT
  // ==================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==================================================
  // HANDLE PILIH PELATIH
  // ==================================================

  const handlePelatihChange = (e) => {
    const selectedNama = e.target.value;

    const selectedPelatih = listPelatih.find(
      (p) => p.nama === selectedNama
    );

    setForm({
      ...form,
      pelatih: selectedNama,
      pelatih_id: selectedPelatih
        ? selectedPelatih.id
        : null,
    });
  };

  // ==================================================
  // HANDLE UPLOAD FILE
  // ==================================================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setFileMateri(null);
      return;
    }

    // Format yang diperbolehkan
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "❌ Format file tidak diperbolehkan.\n\nHanya PDF, JPG, dan JPEG."
      );

      e.target.value = "";
      setFileMateri(null);

      return;
    }

    // Maksimal 10 MB
    if (file.size > 10 * 1024 * 1024) {
      alert(
        "❌ Ukuran file maksimal 10 MB."
      );

      e.target.value = "";
      setFileMateri(null);

      return;
    }

    setFileMateri(file);
  };

  // ==================================================
  // SUBMIT FORM
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.judul ||
      !form.kategori ||
      !form.tanggal ||
      !form.pelatih
    ) {
      return alert(
        "Judul, Kategori, Tanggal, dan Pelatih wajib diisi!"
      );
    }

    setLoading(true);

    try {
      // ==================================================
      // GUNAKAN FORMDATA
      // ==================================================

      const formData = new FormData();

      formData.append("judul", form.judul);
      formData.append("kategori", form.kategori);
      formData.append("tanggal", form.tanggal);
      formData.append(
        "pelatih_id",
        form.pelatih_id
      );
      formData.append("durasi", form.durasi);
      formData.append("lokasi", form.lokasi);
      formData.append(
        "deskripsi",
        form.deskripsi
      );

      // File hanya dikirim jika dipilih
      if (fileMateri) {
        formData.append(
          "file_materi",
          fileMateri
        );
      }

      await axios.post(
        "/api/materi",
        formData
      );

      alert(
        "✅ Materi berhasil ditambahkan!"
      );

      // Reset Form
      setForm({
        judul: "",
        kategori: "",
        tanggal: "",
        pelatih: "",
        pelatih_id: null,
        durasi: "",
        lokasi: "",
        deskripsi: "",
      });

      setFileMateri(null);

      // Reset input file
      const fileInput =
        document.getElementById(
          "file_materi"
        );

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (err) {
      console.error(
        "Gagal menambahkan materi:",
        err
      );

      alert(
        "❌ Gagal menambahkan materi: " +
          (
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message
          )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Tambah Materi Latihan
            </h1>

            <p className="text-slate-500 mt-1">
              Kelola materi latihan SSB Gagak Muda
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="bg-slate-200 hover:bg-slate-300 w-10 h-10 rounded-xl font-bold"
          >
            ✕
          </button>

        </div>

        {/* CARD */}

        <div className="bg-white rounded-3xl shadow-lg p-8">

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            {/* JUDUL */}

            <div>
              <label className="font-bold text-slate-700">
                Judul Materi
              </label>

              <input
                type="text"
                name="judul"
                value={form.judul}
                onChange={handleChange}
                placeholder="Contoh: Passing dan Crossing"
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* KATEGORI */}

            <div>
              <label className="font-bold text-slate-700">
                Kategori
              </label>

              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300"
                required
              >
                <option value="">
                  Pilih Kategori
                </option>

                <option value="Teknik">
                  Teknik
                </option>

                <option value="Fisik">
                  Fisik
                </option>

                <option value="Taktik">
                  Taktik
                </option>

                <option value="Mental">
                  Mental
                </option>

                <option value="Kiper">
                  Kiper
                </option>
              </select>
            </div>

            {/* TANGGAL */}

            <div>
              <label className="font-bold text-slate-700">
                Tanggal Latihan
              </label>

              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300"
                required
              />
            </div>

            {/* PELATIH */}

            <div>
              <label className="font-bold text-slate-700">
                Pilih Pelatih
              </label>

              <select
                name="pelatih"
                value={form.pelatih}
                onChange={handlePelatihChange}
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300"
                required
              >
                <option value="">
                  Pilih Pelatih
                </option>

                {listPelatih.map((p) => (
                  <option
                    key={p.id}
                    value={p.nama}
                  >
                    {p.nama}{" "}
                    {p.lisensi
                      ? `- ${p.lisensi}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* DURASI */}

            <div>
              <label className="font-bold text-slate-700">
                Durasi Latihan
              </label>

              <input
                type="text"
                name="durasi"
                value={form.durasi}
                onChange={handleChange}
                placeholder="Contoh: 90 Menit"
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300"
              />
            </div>

            {/* LOKASI */}

            <div>
              <label className="font-bold text-slate-700">
                Lokasi
              </label>

              <input
                type="text"
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="Lapangan Utama"
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300"
              />
            </div>

            {/* DESKRIPSI */}

            <div className="md:col-span-2">

              <label className="font-bold text-slate-700">
                Deskripsi Materi
              </label>

              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows="6"
                placeholder="Jelaskan materi latihan secara detail..."
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300"
              ></textarea>

            </div>

            {/* ==================================================
                UPLOAD FILE
            ================================================== */}

            <div className="md:col-span-2">

              <label className="font-bold text-slate-700">
                📎 File Materi
              </label>

              <input
                id="file_materi"
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={handleFileChange}
                className="w-full mt-2 p-4 rounded-2xl border border-slate-300 bg-slate-50"
              />

              <p className="text-xs text-slate-500 mt-2">
                Format yang diperbolehkan:
                PDF, JPG, JPEG. Maksimal 10 MB.
              </p>

              {/* FILE TERPILIH */}

              {fileMateri && (
                <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">

                  <p className="text-sm font-bold text-indigo-700">
                    📄 {fileMateri.name}
                  </p>

                  <p className="text-xs text-indigo-500 mt-1">
                    Ukuran:{" "}
                    {(
                      fileMateri.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>

                </div>
              )}

            </div>

            {/* SUBMIT */}

            <div className="md:col-span-2 flex justify-end">

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-10 py-4 rounded-2xl font-bold transition-all"
              >
                {loading
                  ? "Mengupload & Menyimpan..."
                  : "Simpan Materi"}
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default TambahMateri;