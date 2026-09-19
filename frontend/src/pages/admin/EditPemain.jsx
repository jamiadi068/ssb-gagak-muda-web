import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditPemain() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    asal_sekolah: "",
    alamat: "",
    no_hp: "",
    foto_pemain: "", // Menyimpan nama file foto lama dari backend
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // GET DETAIL PEMAIN
  useEffect(() => {
    const getDetail = async () => {
      try {
        const res = await axios.get(`/api/pemain/${id}`);
        
        // Memformat tanggal agar bisa terbaca oleh <input type="date"> (YYYY-MM-DD)
        if (res.data.tanggal_lahir) {
          res.data.tanggal_lahir = res.data.tanggal_lahir.split("T")[0];
        }
        
        setForm(res.data);
        
        // Jika sudah ada foto sebelumnya, pasang sebagai preview awal
        if (res.data.foto_pemain) {
          setPreview(`/uploads/${res.data.foto_pemain}`);
        }
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data pemain");
      }
    };

    getDetail();
  }, [id]);

  // HANDLE INPUT TEKS
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE INPUT FILE (FOTO)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Membuat preview instan
    }
  };

  // SUBMIT EDIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // MENGGUNAKAN FORMDATA KARENA ADA FILE UPLOAD
    const formData = new FormData();
    formData.append("nama", form.nama);
    formData.append("email", form.email);
    formData.append("tempat_lahir", form.tempat_lahir);
    formData.append("tanggal_lahir", form.tanggal_lahir);
    formData.append("asal_sekolah", form.asal_sekolah);
    formData.append("alamat", form.alamat);
    formData.append("no_hp", form.no_hp);
    
    // Jika user memilih foto baru, lampirkan filenya
    if (selectedFile) {
      formData.append("foto", selectedFile); 
    }

    try {
      await axios.put(`/api/pemain/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Wajib dideklarasikan
        },
      });

      alert("Data dan foto pemain berhasil diupdate");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Gagal update data pemain");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-8">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">
          EDIT DATA & FOTO PEMAIN
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* UPLOAD FOTO SECTION */}
          <div className="md:col-span-2 flex flex-col items-center bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 mb-2">
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              Foto Profil Pemain
            </label>
            
            <div className="w-32 h-32 mb-3 rounded-full overflow-hidden bg-gray-200 border-2 border-indigo-500 shadow-inner flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Preview Pemain" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs font-bold uppercase">No Photo</span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {/* NAMA */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Nama</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-indigo-600"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-indigo-600"
              required
            />
          </div>

          {/* TEMPAT LAHIR */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Tempat Lahir</label>
            <input
              type="text"
              name="tempat_lahir"
              value={form.tempat_lahir}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-indigo-600"
              required
            />
          </div>

          {/* TANGGAL LAHIR */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Tanggal Lahir</label>
            <input
              type="date"
              name="tanggal_lahir"
              value={form.tanggal_lahir}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-indigo-600"
              required
            />
          </div>

          {/* ASAL SEKOLAH */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Asal Sekolah</label>
            <input
              type="text"
              name="asal_sekolah"
              value={form.asal_sekolah}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-indigo-600"
              required
            />
          </div>

          {/* NOMOR HP */}
          <div>
            <label className="block mb-2 text-sm font-semibold">Nomor HP</label>
            <input
              type="text"
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-indigo-600"
              required
            />
          </div>

          {/* ALAMAT */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-semibold">Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-indigo-600"
              rows="3"
              required
            />
          </div>

          {/* BUTTON */}
          <div className="md:col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold disabled:bg-indigo-400 transition-all shadow-md"
            >
              {loading ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg font-bold transition-all"
            >
              KEMBALI
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditPemain;