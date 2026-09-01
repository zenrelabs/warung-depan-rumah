"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSettings } from "@/lib/queries";
import type { Settings } from "@/lib/types";

export default function HomePage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const isOpen = settings.StoreOpen !== "false";

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-[#1F3A23] mb-3">
        {settings.StoreName || "Warung Depan Rumah"}
      </h1>
      <p className="text-base md:text-lg text-[#6E5A47] mb-8">
        Kuliner Rumahan, Rasa Profesional
      </p>

      {!loading && (
        <div
          className={
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 " +
            (isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")
          }
        >
          <div>● {isOpen ? "Sedang Buka" : "Sedang Tutup"}</div>
        </div>
      )}

      <div>
        <Link
          href="/menu"
          className="inline-block bg-[#C1652F] text-white font-semibold px-8 py-3 rounded-full shadow hover:bg-[#a95423] transition"
        >
          Lihat Menu
        </Link>
      </div>

      {!loading && settings.StoreAddress && (
        <div className="mt-10 text-sm text-[#6E5A47] space-y-1">
          <p>{settings.StoreAddress}</p>
          {settings.StorePhone && <p>{settings.StorePhone}</p>}
        </div>
      )}
    </div>
  );
}