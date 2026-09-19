import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "../pages/public/Login";
import Home from "../pages/public/Home";
import Pendaftaran from "../pages/public/Pendaftaran";

import DashboardSuperAdmin from "../pages/admin/DashboardSuperAdmin";
import ManagePemain from "../pages/admin/ManagePemain";
import EditPemain from "../pages/admin/EditPemain";
import ManagePelatih from "../pages/admin/ManagePelatih";
import TambahMateri from "../pages/admin/TambahMateri";
import DashboardPelatih from "../pages/admin/DashboardPelatih";
import DetailPelatih from "../pages/public/DetailPelatih";
import DetailPemain from "../pages/admin/DetailPemain";
import Materi from "../pages/admin/Materi";
import EditMateri from "../pages/admin/EditMateri";
import PemainSaya from "../pages/admin/PemainSaya";
import RaportSiswa from "../pages/admin/RaportSiswa";
import BuatRaport from "../pages/admin/BuatRaport";
import GantiPasswordPelatih from "../pages/admin/GantiPasswordPelatih";
import DashboardSiswa from "../pages/admin/DashboardSiswa";
import BuatAkun from "../pages/admin/BuatAkun";
import RaportSaya from "../pages/admin/RaportSaya";
import ProfilSiswa from "../pages/admin/ProfilSiswa";
import GantiPasswordSiswa from "../pages/admin/GantiPasswordSiswa";
import HistoriRaportSiswa from "../pages/admin/HistoriRaportSiswa";
import DetailRaportSiswa from "../pages/admin/DetailRaportSiswa";
import StatistikPelatih from "../pages/admin/StatistikPelatih";


import ProtectedRoute from "../routes/ProtectedRoute";


// ===============================
// MANAJEMEN PERTANDINGAN
// ===============================
import Pertandingan from "../pages/admin/Pertandingan";
import TambahPertandingan from "../pages/admin/TambahPertandingan";
import EditPertandingan from "../pages/admin/EditPertandingan";


// ===============================
// GLOBAL LOADING
// ===============================
import Loading from "../components/Loading";


// =====================================================
// KOMPONEN ROUTE + GLOBAL LOADING
// =====================================================
function AppContent() {

  const location = useLocation();

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    // Aktifkan loading setiap kali URL berubah
    setLoading(true);

    // Berikan waktu agar animasi loading terlihat
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);


    // Bersihkan timer jika route berubah lagi
    return () => {
      clearTimeout(timer);
    };

  }, [location.pathname, location.search]);


  return (
    <>
      {/* ===============================
          GLOBAL LOADING
      =============================== */}
      {loading && <Loading />}


      {/* ===============================
          SEMUA ROUTE
      =============================== */}
      <Routes>

        {/* ===============================
            RUTE PUBLIK
        =============================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/pendaftaran"
          element={<Pendaftaran />}
        />

        <Route
          path="/pelatih/:id"
          element={<DetailPelatih />}
        />


        {/* ===============================
            RUTE TERPROTEKSI
        =============================== */}

        <Route element={<ProtectedRoute />}>

          {/* ===============================
              ADMIN & SUPER ADMIN
          =============================== */}

          <Route
            path="/dashboard"
            element={<DashboardSuperAdmin />}
          />
          <Route
  path="/pemain-saya"
  element={<PemainSaya />}
/>
          <Route
            path="/pemain"
            element={<ManagePemain />}
          />

          <Route
            path="/manage-pemain"
            element={<ManagePemain />}
          />
          <Route
  path="/profil-siswa"
  element={<ProfilSiswa />}
/>
          <Route
            path="/edit-pemain/:id"
            element={<EditPemain />}
          />

          <Route
            path="/manage-pelatih"
            element={<ManagePelatih />}
          />

          <Route
            path="/materi"
            element={<Materi />}
          />

          <Route
            path="/tambah-materi"
            element={<TambahMateri />}
          />

          <Route
            path="/detail-pemain/:id"
            element={<DetailPemain />}
          />
          
          <Route
            path="/edit-materi/:id"
            element={<EditMateri />}
          />

          {/* ===============================
              MANAJEMEN PERTANDINGAN
          =============================== */}

          <Route
            path="/manage-pertandingan"
            element={<Pertandingan />}
          />

          <Route
            path="/tambah-pertandingan"
            element={<TambahPertandingan />}
          />

          <Route
            path="/edit-pertandingan/:id"
            element={<EditPertandingan />}
          />


          {/* ===============================
              PELATIH
          =============================== */}
          <Route path="/raport-siswa" element={<RaportSiswa />} />
            <Route
              path="/buat-raport/:id"
              element={<BuatRaport />}
            />
          <Route
            path="/dashboard-pelatih"
            element={<DashboardPelatih />}
          />
          <Route
            path="/ganti-password"
            element={<GantiPasswordPelatih />}
          />
          <Route path="/statistik" element={<StatistikPelatih />} />
        
          <Route
  path="/ganti-password-siswa"
  element={<GantiPasswordSiswa />}
/>

          <Route
            path="/dashboard-siswa"
            element={<DashboardSiswa />}
          />
        </Route>
          <Route
  path="/buat-akun"
  element={<BuatAkun />}
/>
<Route
  path="/raport-saya"
  element={<RaportSaya />}
/>
<Route
  path="/raport-saya/:id"
  element={<DetailRaportSiswa />}
/>
<Route
  path="/histori-raport-siswa"
  element={<HistoriRaportSiswa />}
/>
      </Routes>

    </>
  );
}


// =====================================================
// APP ROUTES
// =====================================================
function AppRoutes() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );

}


export default AppRoutes;