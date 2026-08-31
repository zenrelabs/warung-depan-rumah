"use client"; // Wajib agar tombol bisa diklik
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export default function MenuPage() {
  const [daftarMenu, setDaftarMenu] = useState([]);
  const [keranjang, setKeranjang] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data menu dari Supabase
  useEffect(() => {
    async function ambilMenu() {
      const { data } = await supabase.from("menu").select("*");
      if (data) setDaftarMenu(data);
      setLoading(false);
    }
    ambilMenu();
  }, []);

  // Fungsi menambahkan menu ke keranjang
  const tambahKeranjang = (menu) => {
    setKeranjang([...keranjang, menu]);
  };

  // Menghitung total harga
  const totalHarga = keranjang.reduce((total, item) => total + item.harga, 0);
  const totalItem = keranjang.length;

  // Fungsi Checkout ke WhatsApp
  const checkoutWA = () => {
    let pesan = "Halo Warung Depan Rumah, saya ingin pesan:%0A%0A";
    keranjang.forEach((item, index) => {
      pesan += `${index + 1}. ${item.nama} - Rp ${item.harga.toLocaleString('id-ID')}%0A`;
    });
    pesan += `%0A*Total: Rp ${totalHarga.toLocaleString('id-ID')}*%0A%0ASilakan konfirmasi pesanan saya ya. Terima kasih!`;
    
    // Ganti dengan nomor WhatsApp Anda (format 62, tanpa 0 di depan)
    const urlWA = `https://wa.me/6282315271827?text=${pesan}`;
    window.open(urlWA, "_blank");
  };

  if (loading) {
    return <p className="text-center mt-10">Memuat menu...</p>;
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto pb-32">
      <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">Daftar Menu</h1>
      <p className="text-gray-600 text-center mb-8">Pilih menu favorinmu di bawah ini!</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {daftarMenu.map((menu) => (
          <div key={menu.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
            <div className="bg-green-50 h-32 flex items-center justify-center text-5xl">
              {menu.emoji}
            </div>
            <div className="p-3 flex flex-col flex-grow">
              <h3 className="font-bold text-gray-800 text-sm mb-1">{menu.nama}</h3>
              <span className={`text-xs font-semibold mb-2 ${menu.status === "Tersedia" ? "text-green-600" : "text-red-500"}`}>
                Stok: {menu.status}
              </span>
              <div className="mt-auto flex justify-between items-center">
                <span className="font-bold text-green-800 text-sm">Rp {menu.harga.toLocaleString('id-ID')}</span>
                <button 
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${menu.status === "Tersedia" ? "bg-green-700 text-white hover:bg-green-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                  disabled={menu.status === "Habis"}
                  onClick={() => tambahKeranjang(menu)}
                >
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Keranjang Mengambang (Floating Cart) */}
      {totalItem > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-100 p-4 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="text-green-800">
              <p className="font-bold text-lg">{totalItem} Item</p>
              <p className="text-sm">Total: Rp {totalHarga.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={checkoutWA}
                className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition shadow-md"
              >
                Checkout WA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}