import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Warung Depan Rumah",
  description: "Kuliner Rumahan, Rasa Profesional",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-[#FFF8E7] text-[#166534] min-h-screen flex flex-col">
        
        {/* Navbar Atas */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="font-bold text-lg md:text-xl text-green-800">
              Warung Depan Rumah
            </h1>
            <div className="flex space-x-4 text-sm md:text-base font-medium">
              {/* Perbaikan ada di 2 baris ini: gunakan <Link> dan </Link> */}
              <Link href="/menu" className="hover:text-green-600 cursor-pointer">Menu</Link>
              <Link href="/tentang" className="hover:text-green-600 cursor-pointer">Tentang</Link>
            </div>
          </div>
        </nav>

        {/* Isi Halaman */}
        <main className="flex-grow max-w-4xl mx-auto w-full">
          {children}
        </main>

      </body>
    </html>
  );
}