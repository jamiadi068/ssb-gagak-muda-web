import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TambahPertandingan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lawan: "",
    tanggal: "",
    lokasi: "",
    tipe_pertandingan: "Liga",
  });

  // State terpisah untuk Jam dan Menit agar mudah dikontrol tanpa AM/PM browser
  const [jam, setJam] = useState("16");
  const [menit, setMenit] = useState("00");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Gabungkan jam dan menit menjadi format "HH:MM" (Misal: "16:00")
    const waktuFinal = `${jam}:${menit}`;

    const dataToSubmit = {
      ...formData,
      waktu: waktuFinal
    };

    try {
      await axios.post("/api/pertandingan", dataToSubmit);
      alert("Jadwal pertandingan berhasil ditambahkan!");
      navigate("/manage-pertandingan"); 
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan pertandingan");
    }
  };

  // Generate pilihan jam (00 - 23)
  const pilihanJam = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  // Generate pilihan menit (00 - 59)
  const pilihanMenit = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">🏆 Tambah Jadwal Pertandingan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tim Lawan</label>
            <input type="text" name="lawan" value={formData.lawan} onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" placeholder="Nama Klub Lawan" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bulan/tanggal/tahun</label>
              <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Waktu (WIB)</label>
              <div className="flex items-center gap-2">
                {/* Dropdown Jam 24 Jam */}
                <select 
                  value={jam} 
                  onChange={(e) => setJam(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white text-center font-semibold"
                >
                  {pilihanJam.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                
                <span className="font-bold text-slate-400">:</span>
                
                {/* Dropdown Menit */}
                <select 
                  value={menit} 
                  onChange={(e) => setMenit(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white text-center font-semibold"
                >
                  {pilihanMenit.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                
                <span className="text-xs font-bold text-slate-500 ml-1">WIB</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Lokasi / Stadion</label>
            <input type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" placeholder="Contoh: Stadion Utama GBK" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipe Kompetisi</label>
            <select name="tipe_pertandingan" value={formData.tipe_pertandingan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white">
              <option value="Liga">Liga</option>
              <option value="Turnamen">Turnamen</option>
              <option value="Persahabatan">Persahabatan</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => navigate("/manage-pertandingan")} className="w-1/2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all">Batal</button>
            <button type="submit" className="w-1/2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-md">Simpan Jadwal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TambahPertandingan;