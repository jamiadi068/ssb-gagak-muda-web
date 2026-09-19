import { useParams, Link } from "react-router-dom";

function DetailPelatih() {
  const { id } = useParams();

  const pelatih = [
    {
      id: "1",
      nama: "Coach Andi",
      jabatan: "Head Coach",
      lisensi: "A AFC",
      pengalaman: "10 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Berpengalaman melatih tim junior nasional.",
    },
    {
      id: "2",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "3",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "4",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "5",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "6",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "7",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "8",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "9",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
        {
      id: "10",
      nama: "Coach Budi",
      jabatan: "Assistant Coach",
      lisensi: "B AFC",
      pengalaman: "7 Tahun",
      foto: "https://i.pravatar.cc/400?img=2",
      deskripsi: "Spesialis strategi dan teknik dasar.",
    },
  ];

  const data = pelatih.find((p) => p.id === id);

  if (!data) {
    return <h1 className="text-center mt-10">Pelatih tidak ditemukan</h1>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow overflow-hidden">

        {/* FOTO */}
        <img
          src={data.foto}
          alt={data.nama}
          className="w-full h-80 object-cover"
        />

        {/* DETAIL */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{data.nama}</h1>
          <p className="text-gray-500 mb-4">{data.jabatan}</p>

          <div className="flex gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              Lisensi {data.lisensi}
            </span>

            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {data.pengalaman}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed">
            {data.deskripsi}
          </p>

          <Link to="/" className="inline-block mt-6 text-purple-700 hover:underline">
            ← Kembali
          </Link>
        </div>

      </div>
    </div>
  );
}

export default DetailPelatih;