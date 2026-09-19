import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditMateri() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [listPelatih, setListPelatih] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      console.error("Gagal mengambil data pelatih:", err);
      alert("Gagal mengambil daftar pelatih");
    }
  };

  // ==================================================
  // AMBIL DATA MATERI
  // ==================================================
  const getMateri = async () => {
    try {
      setLoading(true);

      const url = `/api/materi/${id}`;
      const res = await axios.get(url);

      const data = res.data;

      setForm({
        judul: data.judul || "",
        kategori: data.kategori || "",
        tanggal: data.tanggal
          ? String(data.tanggal).substring(0, 10)
          : "",
        pelatih: data.nama_pelatih || data.pelatih || "",
        pelatih_id: data.pelatih_id || null,
        durasi: data.durasi || "",
        lokasi: data.lokasi || "",
        deskripsi: data.deskripsi || "",
      });
    } catch (err) {
      console.error("Gagal mengambil data materi:", err);

      alert(
        "Gagal mengambil data materi: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            err.message)
      );

      navigate("/materi");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD DATA
  // ==================================================
  useEffect(() => {
    getPelatih();
    getMateri();
  }, [id]);

  // ==================================================
  // HANDLE INPUT
  // ==================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================================================
  // PILIH PELATIH
  // ==================================================
  const handlePelatihChange = (e) => {
    const selectedId = e.target.value;

    const selectedPelatih = listPelatih.find(
      (p) => String(p.id) === String(selectedId)
    );

    setForm((prev) => ({
      ...prev,
      pelatih: selectedPelatih
        ? selectedPelatih.nama
        : "",
      pelatih_id: selectedPelatih
        ? selectedPelatih.id
        : null,
    }));
  };

  // ==================================================
  // UPDATE MATERI
  // ==================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.judul ||
      !form.kategori ||
      !form.tanggal ||
      !form.pelatih_id
    ) {
      alert(
        "Judul, Kategori, Tanggal, dan Pelatih wajib diisi!"
      );
      return;
    }

    setSaving(true);

    try {
      const dataUpdate = {
        judul: form.judul,
        kategori: form.kategori,
        tanggal: form.tanggal,
        pelatih_id: form.pelatih_id,
        durasi: form.durasi,
        lokasi: form.lokasi,
        deskripsi: form.deskripsi,
      };

      await axios.put(
        `/api/materi/${id}`,
        dataUpdate
      );

      alert("✅ Materi berhasil diperbarui!");

      navigate("/materi");
    } catch (err) {
      console.error("Gagal memperbarui materi:", err);

      alert(
        "❌ Gagal memperbarui materi: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            err.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>

          <p className="text-slate-500 font-semibold">
            Memuat data materi...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // FORM
  // ==================================================
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Edit Materi Latihan
            </h1>

            <p className="text-slate-500 mt-1">
              Perbarui materi latihan SSB Gagak Muda
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/materi")}
            className="bg-slate-200 hover:bg-slate-300 w-10 h-10 rounded-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
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
                value={form.pelatih_id || ""}
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
                    value={p.id}
                  >
                    {p.nama}
                    {p.lisensi
                      ? ` - ${p.lisensi}`
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
              />
            </div>

            {/* BUTTON */}
            <div className="md:col-span-2 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => navigate("/materi")}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-10 py-4 rounded-2xl font-bold"
              >
                {saving
                  ? "Menyimpan..."
                  : "💾 Simpan Perubahan"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default EditMateri;