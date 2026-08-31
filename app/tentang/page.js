export default function TentangPage() {
  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      
      {/* Judul Halaman */}
      <h1 className="text-3xl font-bold text-green-800 text-center mb-2">
        Tentang Warung Depan Rumah
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Kuliner Rumahan, Rasa Profesional
      </p>

      {/* Cerita Singkat */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-green-100">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Cerita Kami</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Warung Depan Rumah adalah usaha kuliner rumahan yang lahir dari kecintaan 
          kami dalam mengolah makanan sehat dan lezat. Mulai dari Roti Maryam spesial, 
          camilan renyah seperti pisang nugget dan tela-tela, hingga Healthy Food untuk 
          kamu yang sedang diet. Semua dibuat fresh setiap hari dengan bahan berkualitas 
          dan penuh kehangatan ala rumahan.
        </p>
      </div>

      {/* Info Lokasi & Jam Buka */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Alamat */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3">📍 Alamat Lokasi</h2>
          <p className="text-gray-600 text-sm mb-4">
            Jl. Brigjen H. Hasan Basri no. 18, <br/>
            Desa Batuah
          </p>
          {/* Tombol Buka di Google Maps */}
          <a 
            href="https://www.google.com/maps/search/?api=1&query=Jl.+Brigjen+H.+Hasan+Basri+no.+18,+Desa+Batuah" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition"
          >
            Buka di Google Maps
          </a>
        </div>

        {/* Jam Operasional */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3">⏰ Jam Operasional</h2>
          <ul className="text-gray-600 text-sm space-y-1">
            <li className="flex justify-between"><span>Senin - Jumat</span> <span>10:00 - 22:00</span></li>
            <li className="flex justify-between"><span>Sabtu - Minggu</span> <span>10:00 - 23:00</span></li>
          </ul>
        </div>

      </div>

      {/* Peta Lokasi (Embed Google Maps) */}
      <div className="bg-white rounded-2xl shadow-md p-2 border border-green-100 mb-6 overflow-hidden">
        <div className="w-full h-64 rounded-xl overflow-hidden">
          <iframe
            src="https://www.google.com/maps?q=Jl.+Brigjen+H.+Hasan+Basri,+Desa+Batuah&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Kontak & Sosial Media */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100 text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Hubungi Kami</h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a 
            href="https://wa.me/6282315271827" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
          >
            <span>📱</span> Chat WhatsApp
          </a>
          <a 
            href="https://instagram.com/depan.rumah18" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            <span>📸</span> @depan.rumah18
          </a>
        </div>
      </div>

    </div>
  );
}