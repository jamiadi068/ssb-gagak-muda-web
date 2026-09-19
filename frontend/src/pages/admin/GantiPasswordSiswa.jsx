import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function GantiPasswordSiswa() {
  const navigate = useNavigate();

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] =
    useState("");

  const [showPasswordLama, setShowPasswordLama] =
    useState(false);

  const [showPasswordBaru, setShowPasswordBaru] =
    useState(false);

  const [showKonfirmasiPassword, setShowKonfirmasiPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  // ==================================================
  // HANDLE SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPesan("");
    setError("");

    // ==========================================
    // AMBIL USER LOGIN
    // ==========================================

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
      setError(
        "Data login tidak valid. Silakan login kembali."
      );
      return;
    }

    // ==========================================
    // PASTIKAN AKUN SISWA
    // ==========================================

    if (user.role !== "siswa") {
      setError("Akun tidak valid.");
      return;
    }

    if (!user.id) {
      setError("ID akun siswa tidak ditemukan.");
      return;
    }

    // ==========================================
    // VALIDASI
    // ==========================================

    if (
      !passwordLama ||
      !passwordBaru ||
      !konfirmasiPassword
    ) {
      setError("Semua field wajib diisi.");
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
        "Konfirmasi password tidak sama."
      );
      return;
    }

    if (passwordLama === passwordBaru) {
      setError(
        "Password baru tidak boleh sama dengan password lama."
      );
      return;
    }

    // ==========================================
    // GANTI PASSWORD
    // ==========================================

    try {
      setLoading(true);

      const response = await api.put(
        `/ganti-password-siswa/${user.id}`,
        {
          password_lama: passwordLama,
          password_baru: passwordBaru,
        }
      );

      setPesan(
        response.data?.message ||
          "Password berhasil diubah."
      );

      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");

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

  // ==================================================
  // COMPONENT INPUT PASSWORD
  // ==================================================

  const PasswordInput = ({
    label,
    value,
    onChange,
    showPassword,
    setShowPassword,
    placeholder,
  }) => {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>

        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />

          {/* SHOW / HIDE PASSWORD */}

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition"
            aria-label={
              showPassword
                ? "Sembunyikan password"
                : "Tampilkan password"
            }
          >
            {showPassword ? (
              /* MATA TERBUKA */

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

            ) : (
              /* MATA TERTUTUP */

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
            )}
          </button>

        </div>
      </div>
    );
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 font-sans px-5 py-6">

      <div className="max-w-md mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="flex items-center mb-6">

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard-siswa")
            }
            className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xl text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition shrink-0"
            aria-label="Kembali"
          >
            ←
          </button>

          {/* TITLE */}

          <div className="ml-3">

            <p className="text-xs text-slate-500 font-medium">
              Akun Siswa
            </p>

            <h1 className="text-xl font-black text-slate-900">
              Ganti Password
            </h1>

          </div>

        </header>


        {/* ==================================================
            CARD
        ================================================== */}

        <div className="bg-white rounded-[26px] shadow-sm border border-slate-200 p-5">

          {/* ==================================================
              ICON
          ================================================== */}

          <div className="flex justify-center mb-5">

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
              🔑
            </div>

          </div>


          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div className="text-center mb-6">

            <h2 className="text-lg font-black text-slate-900">
              Ubah Password Akun
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Masukkan password lama dan buat password baru.
            </p>

          </div>


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {pesan && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              {pesan}
            </div>
          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}


          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* PASSWORD LAMA */}

            <PasswordInput
              label="Password Lama"
              value={passwordLama}
              onChange={(e) =>
                setPasswordLama(
                  e.target.value
                )
              }
              showPassword={
                showPasswordLama
              }
              setShowPassword={
                setShowPasswordLama
              }
              placeholder="Masukkan password lama"
            />


            {/* PASSWORD BARU */}

            <PasswordInput
              label="Password Baru"
              value={passwordBaru}
              onChange={(e) =>
                setPasswordBaru(
                  e.target.value
                )
              }
              showPassword={
                showPasswordBaru
              }
              setShowPassword={
                setShowPasswordBaru
              }
              placeholder="Masukkan password baru"
            />

            <p className="text-[11px] text-slate-400 -mt-2">
              Minimal 6 karakter
            </p>


            {/* KONFIRMASI PASSWORD */}

            <PasswordInput
              label="Konfirmasi Password Baru"
              value={
                konfirmasiPassword
              }
              onChange={(e) =>
                setKonfirmasiPassword(
                  e.target.value
                )
              }
              showPassword={
                showKonfirmasiPassword
              }
              setShowPassword={
                setShowKonfirmasiPassword
              }
              placeholder="Ulangi password baru"
            />


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold transition shadow-sm"
            >
              {loading
                ? "Menyimpan..."
                : "Ganti Password"}
            </button>

          </form>

        </div>


        {/* ==================================================
            INFO
        ================================================== */}

        <div className="mt-4 px-4 text-center">

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pastikan password baru mudah diingat
            tetapi tidak mudah ditebak oleh orang lain.
          </p>

        </div>

      </div>

    </div>
  );
}

export default GantiPasswordSiswa;