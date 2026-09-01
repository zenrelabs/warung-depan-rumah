"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/lib/queries";
import type { AdminProfile } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    getMyProfile().then((p) => {
      setProfile(p);
      setLoading(false);
      if (!p) router.push("/admin/login");
    });
  }, [isLoginPage]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6EFE2] text-[#6E5A47]">
        Memuat...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen flex bg-[#F6EFE2]">
      <aside className="w-56 bg-white border-r border-[#E4D9C2] p-5 flex flex-col">
        <div className="mb-6">
          <div className="font-semibold text-[#1F3A23]">Warung Depan Rumah</div>
          <div className="text-xs text-[#C1652F] font-bold uppercase">E-Kasir Admin</div>
        </div>
        <div className="text-xs mb-4 px-2 py-1 rounded-full inline-block bg-[#DCE3D0] text-[#1F3A23] font-bold w-fit">
          {profile.role === "super" ? "Super Admin" : "Admin"}
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <a href="/admin" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#EFE4CD]">
            Dashboard
          </a>
          <a href="/admin/pos" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#EFE4CD]">
            Pesanan Baru
          </a>
          <a href="/admin/orders" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#EFE4CD]">
            Riwayat Pesanan
          </a>
          <a href="/admin/menu" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#EFE4CD]">
            Menu
          </a>
          <a href="/admin/laporan" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#EFE4CD]">
            Laporan
          </a>
          <a href="/admin/pengaturan" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#EFE4CD]">
            Pengaturan
          </a>
        </nav>
        <div className="text-xs text-[#6E5A47] mb-2">
          Masuk sebagai <br />
          <b className="text-[#3B2A1E]">{profile.nama}</b>
        </div>
        <button
          onClick={handleLogout}
          className="text-left text-sm font-semibold text-red-600 px-3 py-2 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}