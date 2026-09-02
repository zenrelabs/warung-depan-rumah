"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/lib/queries";
import type { AdminProfile } from "@/lib/types";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Pesanan Baru", href: "/admin/pos", icon: "🛒" },
  { label: "Pesanan", href: "/admin/orders", icon: "📋" },
  { label: "Menu", href: "/admin/menu", icon: "🍲" },
  { label: "Laporan", href: "/admin/laporan", icon: "📈" },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: "⚙️" },
];

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

  const isSuper = profile.role === "super";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6EFE2]">
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-[#FFFDF8] border-r border-[#E4D9C2] p-5 flex-col">
        <div className="mb-5 pb-5 border-b border-[#E4D9C2]">
          <div className="font-display font-semibold text-base text-[#1F3A23] leading-tight">
            Warung Depan Rumah
          </div>
          <div className="text-[11px] tracking-wide uppercase text-[#C1652F] font-bold">
            E-Kasir Admin
          </div>
        </div>

        <span
          className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full w-fit mb-4 ${
            isSuper ? "bg-[#E6DEEF] text-[#6A4E8C]" : "bg-[#DCE7F1] text-[#2A5C8A]"
          }`}
        >
          {isSuper ? "Super Admin" : "Admin"}
        </span>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  active
                    ? "bg-[#2F5233] text-white"
                    : "text-[#6E5A47] hover:bg-[#EFE4CD]"
                }`}
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E4D9C2] pt-3 mt-2">
          <p className="text-xs text-[#6E5A47] mb-2">
            Masuk sebagai <br />
            <b className="text-[#3B2A1E]">{profile.nama}</b>
          </p>
          <button
            onClick={handleLogout}
            className="text-left text-sm font-semibold text-[#B23A34] px-3 py-2 rounded-lg hover:bg-[#F5DEDC] w-full"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* KONTEN */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 overflow-y-auto">{children}</main>

      {/* BOTTOM NAV - MOBILE */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#FFFDF8] border-t border-[#E4D9C2] flex justify-around py-2 px-1 z-30">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-lg ${
                active ? "bg-[#DCE3D0] text-[#1F3A23]" : "text-[#6E5A47]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}