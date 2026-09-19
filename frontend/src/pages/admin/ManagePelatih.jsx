import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ManagePelatih() {
  const navigate = useNavigate();

  const [pelatih, setPelatih] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // SEARCH
  const [searchQuery, setSearchQuery] = useState("");

  // KELOMPOK UMUR
  const [kelompokUmur, setKelompokUmur] = useState([]);

  const daftarKelompokUmur = [
    "U7", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16",
  ];

  // FORM
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    lisensi: "",
    no_hp: "",
    alamat: "",
  });

  const API = "/api/pelatih";

  // =====================================================
  // GET DATA PELATIH
  // =====================================================
  const fetchPelatih = async () => {
    try {
      const res = await axios.get(API);
      setPelatih(res.data);
    } catch (err) {
      console.error("Gagal mengambil data pelatih:", err);
    }
  };

  useEffect(() => {
    fetchPelatih();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // EDIT PELATIH
  // =====================================================
  const handleEdit = async (data) => {
    try {
      setForm({
        nama: data.nama || "",
        email: data.email || "",
        password: "",
        lisensi: data.lisensi || "",
        no_hp: data.no_hp || "",
        alamat: data.alamat || "",
      });

      setEditId(data.id || data._id);
      setEditMode(true);

      const res = await axios.get(
        `/api/pelatih-kelompok/${data.id || data._id}`
      );

      const kelompok = Array.isArray(res.data)
        ? res.data.map((item) => item.kelompok_umur).filter(Boolean)
        : [];

      setKelompokUmur(kelompok);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Gagal mengambil kelompok umur:", err);
      setKelompokUmur([]);
      alert("Data pelatih berhasil dibuka, tetapi kelompok umur gagal diambil.");
    }
  };

  // =====================================================
  // TOGGLE KELOMPOK UMUR
  // =====================================================
  const handleKelompokChange = (umur) => {
    setKelompokUmur((prev) =>
      prev.includes(umur)
        ? prev.filter((item) => item !== umur)
        : [...prev, umur]
    );
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setForm({
      nama: "",
      email: "",
      password: "",
      lisensi: "",
      no_hp: "",
      alamat: "",
    });

    setKelompokUmur([]);
    setEditMode(false);
    setEditId(null);
  };

  // =====================================================
  // SUBMIT TAMBAH / EDIT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama || !form.email || !form.lisensi) {
      alert("Nama, Email, dan Lisensi wajib diisi!");
      return;
    }

    if (!editMode && !form.password) {
      alert("Password wajib diisi untuk pelatih baru!");
      return;
    }

    if (kelompokUmur.length === 0) {
      alert("Pilih minimal satu kelompok umur yang ditangani pelatih!");
      return;
    }

    try {
      if (editMode) {
        const updateData = {
          ...form,
          kelompok_umur: kelompokUmur,
        };

        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }

        await axios.put(`${API}/${editId}`, updateData);
        alert("Data pelatih berhasil diupdate");
      } else {
        await axios.post(API, {
          ...form,
          kelompok_umur: kelompokUmur,
        });
        alert("Pelatih berhasil ditambahkan");
      }

      resetForm();
      await fetchPelatih();
    } catch (err) {
      console.error("Gagal menyimpan data pelatih:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Terjadi kesalahan pada data yang dikirim";
      alert(`Gagal menyimpan: ${msg}`);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pelatih ini?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      alert("Data pelatih berhasil dihapus");

      if (String(editId) === String(id)) {
        resetForm();
      }

      await fetchPelatih();
    } catch (err) {
      console.error("Gagal menghapus pelatih:", err);
      alert(err.response?.data?.message || "Gagal menghapus pelatih");
    }
  };

  // =====================================================
  // FILTER SEARCH
  // =====================================================
  const filteredPelatih = pelatih.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.nama && p.nama.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.lisensi && p.lisensi.toLowerCase().includes(query))
    );
  });

  // =====================================================
  // STYLES (iOS Style)
  // =====================================================
  const styles = {
    container: {
      padding: "24px 16px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#f2f2f7",
      minHeight: "100vh",
      color: "#000000",
      WebkitFontSmoothing: "antialiased",
    },

    card: {
      backgroundColor: "#ffffff",
      padding: "20px",
      borderRadius: "18px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      marginBottom: "24px",
    },

    inputGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "12px",
    },

    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },

    label: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#8e8e93",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginLeft: "4px",
    },

    input: {
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e5e5ea",
      backgroundColor: "#f2f2f7",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease",
    },

    searchInput: {
      padding: "12px 16px",
      borderRadius: "14px",
      border: "none",
      backgroundColor: "#e3e3e8",
      width: "100%",
      fontSize: "15px",
      outline: "none",
    },

    btnPrimary: {
      padding: "14px 20px",
      backgroundColor: "#007aff",
      color: "white",
      border: "none",
      borderRadius: "14px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "15px",
      boxShadow: "0 4px 12px rgba(0, 122, 255, 0.25)",
      transition: "transform 0.1s ease",
    },

    btnEdit: {
      padding: "8px 14px",
      backgroundColor: "#e5e5ea",
      color: "#007aff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      marginRight: "8px",
      fontWeight: "600",
      fontSize: "13px",
    },

    btnDelete: {
      padding: "8px 14px",
      backgroundColor: "#ff3b30",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
      boxShadow: "0 2px 8px rgba(255, 59, 48, 0.2)",
    },

    btnClose: {
      background: "#e5e5ea",
      color: "#8e8e93",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      cursor: "pointer",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
    },

    tableContainer: {
      backgroundColor: "#ffffff",
      borderRadius: "18px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      overflow: "hidden",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "white",
    },

    th: {
      backgroundColor: "#f9f9fb",
      textAlign: "left",
      padding: "14px 16px",
      borderBottom: "1px solid #e5e5ea",
      color: "#8e8e93",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    td: {
      padding: "16px",
      borderBottom: "1px solid #f2f2f7",
      fontSize: "14px",
      color: "#1c1c1e",
    },
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div style={styles.container}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#8e8e93" }}>
              SISTEM MANAJEMEN
            </span>
            <h1
              style={{
                color: "#000000",
                margin: 0,
                fontSize: "28px",
                fontWeight: "700",
                letterSpacing: "-0.5px",
              }}
            >
              Pelatih Tim ⚽
            </h1>
          </div>

          <button onClick={() => navigate("/dashboard")} style={styles.btnClose}>
            ✕
          </button>
        </div>

        {/* FORM CARD */}
        <div style={styles.card}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "16px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1c1c1e",
            }}
          >
            {editMode ? "✏️ Edit Pelatih" : "➕ Tambah Pelatih Baru"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nama Lengkap</label>
                <input
                  name="nama"
                  placeholder="John Doe"
                  value={form.nama}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="coach@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder={
                    editMode ? "Kosongkan jika tidak diubah" : "••••••••"
                  }
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Lisensi</label>
                <input
                  name="lisensi"
                  placeholder="Lisensi B AFC"
                  value={form.lisensi}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nomor HP</label>
                <input
                  name="no_hp"
                  placeholder="08123456789"
                  value={form.no_hp}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Alamat</label>
                <input
                  name="alamat"
                  placeholder="Kota / Alamat Singkat"
                  value={form.alamat}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* KELOMPOK UMUR */}
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                backgroundColor: "#f2f2f7",
                borderRadius: "14px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#3a3a3c",
                  marginBottom: "10px",
                }}
              >
                Kelompok Umur Yang Ditangani
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {daftarKelompokUmur.map((umur) => {
                  const isSelected = kelompokUmur.includes(umur);
                  return (
                    <button
                      key={umur}
                      type="button"
                      onClick={() => handleKelompokChange(umur)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        backgroundColor: isSelected ? "#007aff" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#1c1c1e",
                        boxShadow: isSelected
                          ? "0 2px 8px rgba(0, 122, 255, 0.3)"
                          : "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      {umur}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button type="submit" style={styles.btnPrimary}>
                {editMode ? "Simpan Perubahan" : "Tambah Pelatih"}
              </button>

              {editMode && (
                <button
                  type="button"
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: "#e5e5ea",
                    color: "#000000",
                    boxShadow: "none",
                  }}
                  onClick={resetForm}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SEARCH BAR */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="🔍 Cari pelatih..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* DATA TABLE */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Pelatih</th>
                <th style={styles.th}>Lisensi</th>
                <th style={styles.th}>Kontak</th>
                <th style={styles.th}>Alamat</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredPelatih.length > 0 ? (
                filteredPelatih.map((p) => (
                  <tr key={p.id || p._id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "600" }}>{p.nama}</div>
                      <div style={{ fontSize: "12px", color: "#8e8e93" }}>
                        {p.email}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          backgroundColor: "#e5f1ff",
                          color: "#007aff",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {p.lisensi || "-"}
                      </span>
                    </td>

                    <td style={styles.td}>{p.no_hp || "-"}</td>
                    <td style={styles.td}>{p.alamat || "-"}</td>

                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={styles.btnEdit}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(p.id || p._id)}
                        style={styles.btnDelete}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      color: "#8e8e93",
                      padding: "32px",
                    }}
                  >
                    {searchQuery
                      ? "Data pelatih tidak ditemukan."
                      : "Belum ada data pelatih."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default ManagePelatih;