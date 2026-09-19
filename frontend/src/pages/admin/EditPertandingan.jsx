import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditPertandingan() {
  const { id } = useParams(); // Mengambil ID pertandingan dari URL rute
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    lawan: "",
    tanggal: "",
    waktu: "",
    lokasi: "",
    tipe_pertandingan: "Liga",
  });
  const [loading, setLoading] = useState(true);

  // Ambil data pertandingan yang lama saat halaman dimuat
  useEffect(() => {
    const fetchPertandingan = async () => {
      try {
        const response = await axios.get(`/api/pertandingan/${id}`);
        const data = response.data;
        
        // Format tanggal ke YYYY-MM-DD agar bisa terbaca oleh <input type="date">
        if (data.tanggal) {
          data.tanggal = data.tanggal.split("T")[0];
        }
        
        setFormData({
          lawan: data.lawan || "",
          tanggal: data.tanggal || "",
          waktu: data.waktu || "",
          lokasi: data.lokasi || "",
          tipe_pertandingan: data.tipe_pertandingan || "Liga",
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil rincian data pertandingan");
        navigate("/manage-pertandingan");
      }
    };

    fetchPertandingan();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/pertandingan/${id}`, formData);
      alert("Jadwal pertandingan berhasil diperbarui!");
      navigate("/manage-pertandingan"); // Navigasi kembali ke daftar pertandingan
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui pertandingan");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-slate-500 font-semibold animate-pulse">Memuat data pertandingan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">📝 Edit Jadwal Pertandingan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tim Lawan</label>
            <input 
              type="text" 
              name="lawan" 
              value={formData.lawan} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" 
              placeholder="Nama Klub Lawan" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tanggal</label>
              <input 
                type="date" 
                name="tanggal" 
                value={formData.tanggal} 
                onChange={handleChange} 
                required 
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Waktu (WIB)</label>
              <input 
                type="time" 
                name="waktu" 
                value={formData.waktu} 
                onChange={handleChange} 
                required 
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Lokasi / Stadion</label>
            <input 
              type="text" 
              name="lokasi" 
              value={formData.lokasi} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" 
              placeholder="Contoh: Stadion Utama GBK" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipe Kompetisi</label>
            <select 
              name="tipe_pertandingan" 
              value={formData.tipe_pertandingan} 
              onChange={handleChange} 
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white"
            >
              <option value="Liga">Liga</option>
              <option value="Turnamen">Turnamen</option>
              <option value="Persahabatan">Persahabatan</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => navigate("/manage-pertandingan")} 
              className="w-1/2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="w-1/2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
            >
              Perbarui Jadwal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPertandingan;