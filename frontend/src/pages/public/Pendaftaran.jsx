import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

function Pendaftaran() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    asal_sekolah: "",
    alamat: "",
    no_hp: "",
    dokumen: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("nama", form.nama);
    formData.append("email", form.email);
    formData.append("tempat_lahir", form.tempat_lahir);
    formData.append("tanggal_lahir", form.tanggal_lahir);
    formData.append("asal_sekolah", form.asal_sekolah);
    formData.append("alamat", form.alamat);
    formData.append("no_hp", form.no_hp);

    if (form.dokumen) {
      formData.append("dokumen", form.dokumen);
    }

    try {
      const res = await axios.post(
        "/api/pendaftaran",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("✅ " + res.data.message);
      setForm({
        nama: "", email: "", tempat_lahir: "", tanggal_lahir: "",
        asal_sekolah: "", alamat: "", no_hp: "", dokumen: null,
      });
      e.target.reset();
      navigate("/"); // Otomatis kembali ke Home setelah sukses
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert("❌ " + (error.response?.data?.error || "Gagal mengirim pendaftaran"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#5a0000] py-8 px-4 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Pola Cetakan Batik Tradisional Subtil pada Background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/batik.png")`,
          backgroundRepeat: "repeat"
        }}
      ></div>

      {/* Efek Cahaya Pijar Emas di Latar Belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* KARTU FORMULIR UTAMA */}
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl relative z-10 overflow-hidden border-t-8 border-amber-500 transform transition-all"
        style={{ padding: "32px 24px" }}
      >
        {/* Tombol Tutup / Kembali (X) dengan Efek Putar Garuda */}
        <Link 
          to="/" 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center font-bold text-lg transition-all duration-300 hover:rotate-90"
        >
          &times;
        </Link>

        {/* HEADER KARTU */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full mb-3">
            <span className="w-2.5 h-1.5 bg-red-600 rounded-sm"></span>
            <span className="w-2.5 h-1.5 bg-white border border-slate-300 rounded-sm"></span>
            <span className="text-[10px] font-black tracking-widest text-red-800 uppercase ml-1">GAGAK MUDA ACADEMY</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight">
            Formulir <span className="text-red-600">Pendaftaran</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Isi data calon pemain dengan lengkap untuk divalidasi oleh tim kepelatihan.
          </p>
        </div>

        {/* FORMULIR INPUT */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* NAMA LENGKAP */}
          <div className="form-group">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Nama Lengkap Pemain</label>
            <input
              type="text"
              name="nama"
              placeholder="Contoh: Pratama Arhan"
              value={form.nama}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-900"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Alamat Email Aktif</label>
            <input
              type="email"
              name="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-900"
              required
            />
          </div>

          {/* TEMPAT & TANGGAL LAHIR (GRID) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Tempat Lahir</label>
              <input
                type="text"
                name="tempat_lahir"
                placeholder="Kota/Kabupaten"
                value={form.tempat_lahir}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-900"
                required
              />
            </div>
            <div className="form-group">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Tanggal Lahir</label>
              <input
                type="date"
                name="tanggal_lahir"
                value={form.tanggal_lahir}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-900"
                required
              />
            </div>
          </div>

          {/* ASAL SEKOLAH */}
          <div className="form-group">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Asal Instansi Sekolah</label>
            <input
              type="text"
              name="asal_sekolah"
              placeholder="Contoh: SMP Negeri 1 Jakarta"
              value={form.asal_sekolah}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-900"
              required
            />
          </div>

          {/* ALAMAT RUMAH */}
          <div className="form-group">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Alamat Rumah Lengkap</label>
            <textarea
              name="alamat"
              rows="2"
              placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, dan kecamatan..."
              value={form.alamat}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-900 resize-none"
              required
            />
          </div>

          {/* NOMOR WHATSAPP */}
          <div className="form-group">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">No. HP / WhatsApp Orang Tua</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none"></span>
              <input
                type="tel"
                name="no_hp"
                placeholder=""
                value={form.no_hp}
                onChange={handleChange}
                className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-red-100 font-medium text-slate-900"
                required
              />
            </div>
          </div>

          {/* UNGGAH DOKUMEN (KK / AKTE) */}
          <div className="form-group">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Dokumen Pendukung (KK / Akte Kelahiran)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/50 transition duration-200">
              <input
                type="file"
                name="dokumen"
                onChange={handleChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>

          {/* TOMBOL SUBMIT (KIRIM DATA) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-black py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-lg ${
              isSubmitting 
                ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:scale-[1.02] active:scale-[0.99] shadow-red-900/20"
            }`}
          >
            {isSubmitting ? "Sedang Mengirim..." : "Kirim Pendaftaran"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Pendaftaran;