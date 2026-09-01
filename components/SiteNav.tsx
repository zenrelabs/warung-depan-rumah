"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg md:text-xl text-green-800">
          Warung Depan Rumah
        </Link>
        <div className="flex space-x-4 text-sm md:text-base font-medium">
          <Link href="/menu" className="hover:text-green-600">
            Menu
          </Link>
          <Link href="/pesanan-saya" className="hover:text-green-600">
            Pesanan Saya
          </Link>
        </div>
      </div>
    </nav>
  );
}
