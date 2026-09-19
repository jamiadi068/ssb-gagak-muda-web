import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // Jika token tidak ada, redirect secara otomatis ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada, izinkan akses ke rute anak (admin)
  return <Outlet />;
}

export default ProtectedRoute;