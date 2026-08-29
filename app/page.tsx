import Link from "next/link";
export default function Home() {
  return (
    <div className="px-4 py-8 flex flex-col items-center">

      {/* Judul Utama (Hero) */}
      <div className="text-center mb-10 mt-6">
        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-3">
          Warung Depan Rumah
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Kuliner Rumahan, Rasa Profesional
        </p>
        <Link href="/menu" className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition shadow-md">
          Lihat Menu
        </Link>
      </div>

      {/* Card Info Toko */}
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md border border-green-100">
        
        {/* Status Buka / Tutup */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-bold text-green-700 text-lg">Buka Sekarang</span>
        </div>

        {/* Detail Informasi */}
        <div className="text-center space-y-2 text-gray-600 text-sm">
          <p>⏰ Jam Buka: 10:00 - 22:00 WIB</p>
          <p>📍 Jl. Brigjen H. Hasan Basri no. 18, Desa Batuah</p>
          <p>📱 WhatsApp: +62 823 1527 1827</p>
          <p>📸 Instagram: @depan.rumah18</p>
        </div>

      </div>

    </div>
  );
}