"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daftarMenu, setDaftarMenu] = useState([]);
  const router = useRouter();

  // State untuk Form Tambah Menu
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState("Roti Maryam");
  const [emoji, setEmoji] = useState("🍔");
  const [tambahLoading, setTambahLoading] = useState(false);

  // Ambil data menu dari Supabase
  const ambilMenu = async () => {
    const { data } = await supabase.from("menu").select("*").order("id", { ascending: false });
    if (data) setDaftarMenu(data);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        setUser(session.user);
        setLoading(false);
        ambilMenu();
      }
    };
    checkUser();
  }, [router]);

  // Fungsi Tambah Menu
  const handleTambah = async (e) => {
    e.preventDefault();
    setTambahLoading(true);
    
    const { data, error } = await supabase.from("menu").insert([
      { nama, harga: Number(harga), kategori, emoji, status: "Tersedia" }
    ]).select();

    if (error) {
      alert("Gagal menambah menu: " + error.message);
    } else {
      setDaftarMenu([...data, ...daftarMenu]);
      setNama(""); setHarga("");
      alert("Menu berhasil ditambahkan!");
    }
    setTambahLoading(false);
  };

  // Fungsi Ubah Status (Tersedia/Habis)
  const toggleStatus = async (menu) => {
    const statusBaru = menu.status === "Tersedia" ? "Habis" : "Tersedia";
    
    // Update di Supabase
    await supabase.from("menu").update({ status: statusBaru }).eq("id", menu.id);
    
    // Update di Tampilan Web
    const updateTampilan = daftarMenu.map((m) => 
      m.id === menu.id ? { ...m, status: statusBaru } : m
    );
    setDaftarMenu(updateTampilan);
  };

  // Fungsi Hapus Menu
  const handleHapus = async (id) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    const { error } = await supabase.from("menu").delete().eq("id", id);
    if (!error) {
      setDaftarMenu(daftarMenu.filter((m) => m.id !== id));
    }
  };

  // Tombol Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-green-800">Dashboard Admin</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">
            Logout
          </button>
        </div>

        {/* Form Tambah Menu */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tambah Menu Baru</h2>
          <form onSubmit={handleTambah} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Nama Menu</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="Contoh: Roti Maryam Spesial" required />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Harga (Angka)</label>
              <input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="15000" required />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full p-2 border rounded-lg outline-none bg-white">
                <option>Roti Maryam</option>
                <option>Camilan</option>
                <option>Healthy Food</option>
                <option>Minuman</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Emoji Ikon</label>
              <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="🥞" />
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={tambahLoading} className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50">
                {tambahLoading ? "Menyimpan..." : "+ Tambah Menu"}
              </button>
            </div>

          </form>
        </div>

        {/* Daftar Menu Saat Ini */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Daftar Menu Saat Ini</h2>
          
          <div className="space-y-3">
            {daftarMenu.map((menu) => (
              <div key={menu.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{menu.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{menu.nama}</p>
                    <p className="text-xs text-gray-500">Rp {menu.harga.toLocaleString('id-ID')} - {menu.kategori}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(menu)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${menu.status === "Tersedia" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {menu.status}
                  </button>
                  <button 
                    onClick={() => handleHapus(menu.id)}
                    className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full hover:bg-gray-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}