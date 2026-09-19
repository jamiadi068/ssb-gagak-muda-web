import { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/logo.jpeg";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ================= SHOW PASSWORD =================
  const [showPassword, setShowPassword] = useState(false);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  // ================= HANDLE LOGIN =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await api.post(
        "/auth/login",
        form
      );

      const { token, user } = res.data;

      console.log("LOGIN SUCCESS:", res.data);

      // ================= SIMPAN LOGIN =================
      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "role",
        user.role
      );

      // ================= NOTIFIKASI =================
      await Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: `Selamat datang ${user.nama} 👋`,
        timer: 1800,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#1e293b",
      });

      // ================= REDIRECT ROLE =================
      const role = user.role
        ?.toLowerCase()
        .trim();

      if (role.includes("admin")) {

        navigate("/dashboard");

      } else if (role.includes("pelatih")) {

        navigate("/dashboard-pelatih");

      } else if (role.includes("siswa")) {

        navigate("/dashboard-siswa");

      } else {

        navigate("/");

      }

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text:
          err.response?.data?.message ||
          "Email atau password salah!",
        confirmButtonColor: "#4f46e5",
      });

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 px-4">

      {/* CARD LOGIN */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

        {/* LOGO */}
        <div className="text-center mb-8">

          <Link to="/">

            <img
              src={logo}
              alt="Gagak Muda"
              className="w-20 h-20 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
            />

          </Link>

          <h1 className="text-3xl font-black mt-4">
            Gagak Muda
          </h1>

          <p className="text-gray-200 mt-1">
            Login ke Dashboard
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}
          <div>

            <label className="block mb-2 font-semibold">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-2xl bg-white/20 border border-white/30 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-white"
            />

          </div>

          {/* PASSWORD */}
          <div>

            <label className="block mb-2 font-semibold">
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-4 pr-14 rounded-2xl bg-white/20 border border-white/30 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-white"
              />

              {/* SHOW / HIDE PASSWORD */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-white hover:text-gray-200 transition"
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-indigo-700 font-black py-4 rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >

            {loading
              ? "Loading..."
              : "Masuk"}

          </button>

        </form>

        {/* BACK */}
        <div className="text-center mt-6">

          <Link
            to="/"
            className="text-gray-200 hover:text-white transition"
          >
            ← Kembali ke Website
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;