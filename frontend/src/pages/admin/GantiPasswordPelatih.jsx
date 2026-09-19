import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GantiPasswordPelatih() {
  const navigate = useNavigate();

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] =
    useState("");

  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  // ==============================================
  // SIMPAN PASSWORD
  // ==============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPesan("");
    setError("");

    // ============================================
    // CEK LOGIN
    // ============================================

    const userData = localStorage.getItem("user");

    if (!userData) {
      setError(
        "Data login tidak ditemukan. Silakan login kembali."
      );
      return;
    }

    let user;

    try {
      user = JSON.parse(userData);
    } catch (err) {
      console.error(err);

      setError(
        "Data login tidak valid. Silakan login kembali."
      );

      return;
    }

    // ============================================
    // CEK ID PELATIH
    // ============================================

    if (!user.id) {
      setError("ID pelatih tidak ditemukan.");
      return;
    }

    // ============================================
    // VALIDASI
    // ============================================

    if (
      !passwordLama ||
      !passwordBaru ||
      !konfirmasiPassword
    ) {
      setError("Semua password wajib diisi.");
      return;
    }

    if (passwordBaru.length < 6) {
      setError(
        "Password baru minimal 6 karakter."
      );
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setError(
        "Konfirmasi password baru tidak sama."
      );
      return;
    }

    if (passwordLama === passwordBaru) {
      setError(
        "Password baru tidak boleh sama dengan password lama."
      );
      return;
    }

    // ============================================
    // PROSES
    // ============================================

    try {
      setLoading(true);

      const res = await axios.put(
        `/api/ganti-password/${user.id}`,
        {
          password_lama: passwordLama,
          password_baru: passwordBaru,
        }
      );

      setPesan(
        res.data.message ||
          "Password berhasil diubah."
      );

      // Kosongkan form
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");

      // Kembalikan tampilan password ke hidden
      setShowLama(false);
      setShowBaru(false);
      setShowKonfirmasi(false);

    } catch (err) {
      console.error(
        "Gagal mengganti password:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Gagal mengganti password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // KEMBALI
  // ==============================================

  const handleKembali = () => {
    navigate("/dashboard-pelatih");
  };

  // ==============================================
  // ICON MATA
  // ==============================================

  const EyeIcon = ({ open }) => {
    if (open) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.05.153.05.315 0 .478C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 002.036 12c1.387 4.168 5.324 6.678 9.964 6.678 1.805 0 3.48-.4 4.96-1.1"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.228 6.228A10.45 10.45 0 0112 5.322c4.64 0 8.577 2.51 9.964 6.678a10.5 10.5 0 01-4.064 5.023"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.228 6.228L3 3m3.228 3.228l12.544 12.544M9.9 9.9a3 3 0 104.2 4.2"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* ==========================================
            CARD
        ========================================== */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8">

          {/* ========================================
              HEADER
          ======================================== */}

          <div className="text-center mb-8">

            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🔑
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              Ganti Password
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Ubah password akun pelatih Anda
            </p>

          </div>

          {/* ========================================
              PESAN BERHASIL
          ======================================== */}

          {pesan && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
              ✅ {pesan}
            </div>
          )}

          {/* ========================================
              PESAN ERROR
          ======================================== */}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
              ❌ {error}
            </div>
          )}

          {/* ========================================
              FORM
          ======================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ======================================
                PASSWORD LAMA
            ====================================== */}

            <div>

              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password Lama
              </label>

              <div className="relative">

                <input
                  type={
                    showLama
                      ? "text"
                      : "password"
                  }
                  value={passwordLama}
                  onChange={(e) =>
                    setPasswordLama(
                      e.target.value
                    )
                  }
                  placeholder="Masukkan password lama"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowLama(
                      !showLama
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition"
                  aria-label={
                    showLama
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  <EyeIcon
                    open={showLama}
                  />
                </button>

              </div>

            </div>


            {/* ======================================
                PASSWORD BARU
            ====================================== */}

            <div>

              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password Baru
              </label>

              <div className="relative">

                <input
                  type={
                    showBaru
                      ? "text"
                      : "password"
                  }
                  value={passwordBaru}
                  onChange={(e) =>
                    setPasswordBaru(
                      e.target.value
                    )
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowBaru(
                      !showBaru
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition"
                  aria-label={
                    showBaru
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  <EyeIcon
                    open={showBaru}
                  />
                </button>

              </div>

              <p className="text-[11px] text-slate-400 mt-1">
                Minimal 6 karakter
              </p>

            </div>


            {/* ======================================
                KONFIRMASI PASSWORD
            ====================================== */}

            <div>

              <label className="block text-sm font-bold text-slate-700 mb-2">
                Konfirmasi Password Baru
              </label>

              <div className="relative">

                <input
                  type={
                    showKonfirmasi
                      ? "text"
                      : "password"
                  }
                  value={
                    konfirmasiPassword
                  }
                  onChange={(e) =>
                    setKonfirmasiPassword(
                      e.target.value
                    )
                  }
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowKonfirmasi(
                      !showKonfirmasi
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition"
                  aria-label={
                    showKonfirmasi
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  <EyeIcon
                    open={
                      showKonfirmasi
                    }
                  />
                </button>

              </div>

            </div>


            {/* ======================================
                SIMPAN
            ====================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 rounded-xl transition shadow-md"
            >
              {loading
                ? "Menyimpan..."
                : "🔐 Simpan Password"}
            </button>


            {/* ======================================
                KEMBALI
            ====================================== */}

            <button
              type="button"
              onClick={handleKembali}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition"
            >
              ← Kembali ke Dashboard
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default GantiPasswordPelatih;