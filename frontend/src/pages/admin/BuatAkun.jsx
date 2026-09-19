import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BuatAkun() {
  const navigate = useNavigate();

  const [pemain, setPemain] = useState([]);
  const [selectedPemain, setSelectedPemain] = useState("");
  const [searchPemain, setSearchPemain] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // GET PEMAIN BELUM PUNYA AKUN
  // =========================
  useEffect(() => {
    const getPemain = async () => {
      try {
        const res = await axios.get(
          "/api/akun-siswa/pemain-belum-akun"
        );

        setPemain(res.data);
      } catch (error) {
        console.error("Gagal mengambil data pemain:", error);
        alert("Gagal mengambil data pemain");
      }
    };

    getPemain();
  }, []);

  // =========================
  // FILTER + SORT A-Z
  // =========================
  const filteredPemain = pemain
    .filter((p) =>
      p.nama
        .toLowerCase()
        .includes(searchPemain.toLowerCase())
    )
    .sort((a, b) =>
      a.nama.localeCompare(b.nama)
    );

  // =========================
  // BUAT AKUN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPemain) {
      alert("Silakan pilih pemain");
      return;
    }

    if (!password) {
      alert("Password wajib diisi");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    const pemainTerpilih = pemain.find(
      (p) => String(p.id) === String(selectedPemain)
    );

    if (!pemainTerpilih) {
      alert("Data pemain tidak ditemukan");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/api/akun-siswa",
        {
          pemain_id: pemainTerpilih.id,
          email: pemainTerpilih.email,
          password: password,
        }
      );

      alert(
        res.data?.message ||
          "Akun siswa berhasil dibuat"
      );

      navigate("/Dashboard");

    } catch (error) {
      console.error(
        "Gagal membuat akun siswa:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Gagal membuat akun siswa"
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PEMAIN TERPILIH
  // =========================
  const pemainTerpilih = pemain.find(
    (p) => String(p.id) === String(selectedPemain)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="bg-green-600 px-6 py-5">

          <h2 className="text-xl font-bold text-white">
            BUAT AKUN SISWA
          </h2>

          <p className="text-green-100 text-xs mt-1">
            Buat akun login untuk pemain aktif
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6"
        >

          {/* =========================
              CARI PEMAIN
          ========================= */}
          <div className="mb-4">

            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Cari Pemain
            </label>

            <input
              type="text"
              value={searchPemain}
              onChange={(e) =>
                setSearchPemain(e.target.value)
              }
              placeholder="Ketik nama pemain..."
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />

          </div>

          {/* =========================
              PILIH PEMAIN
          ========================= */}
          <div className="mb-5">

            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Pilih Pemain
            </label>

            <select
              value={selectedPemain}
              onChange={(e) =>
                setSelectedPemain(e.target.value)
              }
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
            >

              <option value="">
                -- Pilih Pemain Aktif --
              </option>

              {filteredPemain.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.nama} - {p.email}
                </option>
              ))}

            </select>

          </div>

          {/* =========================
              EMAIL
          ========================= */}
          {pemainTerpilih && (

            <div className="mb-5">

              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                Email Login
              </label>

              <input
                type="text"
                value={pemainTerpilih.email || ""}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600"
              />

            </div>

          )}

          {/* =========================
              PASSWORD
          ========================= */}
          <div className="mb-6">

            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimal 6 karakter"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />

          </div>

          {/* =========================
              BUTTON
          ========================= */}
          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
            >
              BATAL
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
            >
              {loading
                ? "MEMBUAT..."
                : "BUAT AKUN"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default BuatAkun;