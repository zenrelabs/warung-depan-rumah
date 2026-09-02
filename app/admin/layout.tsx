"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile, getSettings, getOrders } from "@/lib/queries";
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
  const [storeOpen, setStoreOpen] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

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
    getSettings().then((s) => {
      setStoreOpen((s.StoreOpen ?? "true").toLowerCase() === "true");
    });
    getOrders().then((orders) => {
      setPendingOrdersCount(orders.filter((o) => o.status === "Diproses").length);
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] text-[var(--walnut-soft)]">
        Memuat...
      </div>
    );
  }

  if (!profile) return null;

  const isSuper = profile.role === "super";
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--cream)]">
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-[var(--white)] border-r border-[var(--line)] p-5 flex-col">
        <div className="mb-5 pb-5 border-b border-[var(--line)]">
          <div className="font-display font-semibold text-base text-[var(--forest-dark)] leading-tight">
            Warung Depan Rumah
          </div>
          <div className="text-[11px] tracking-wide uppercase text-[var(--rust)] font-bold">
            E-Kasir Admin
          </div>
        </div>

        <span
          className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full w-fit mb-2 ${
            storeOpen ? "bg-[var(--green-tint)] text-[var(--green-ok)]" : "bg-[var(--red-tint)] text-[var(--red)]"
          }`}
        >
          {storeOpen ? "● Buka" : "● Tutup"}
        </span>

        <span
          className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full w-fit mb-4 ${
            isSuper ? "bg-[var(--purple-tint)] text-[var(--purple)]" : "bg-[var(--blue-tint)] text-[var(--blue)]"
          }`}
        >
          {isSuper ? "Super Admin" : "Admin"}
        </span>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const showBadge = item.href === "/admin/orders" && pendingOrdersCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  active
                    ? "bg-[var(--forest)] text-white"
                    : "text-[var(--walnut-soft)] hover:bg-[var(--cream-alt)]"
                }`}
              >
                <span className="w-5 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span
                    className={`text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
                      active ? "bg-white/30 text-white" : "bg-[var(--rust)] text-white"
                    }`}
                  >
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--line)] pt-3 mt-2">
          <p className="text-xs text-[var(--walnut-soft)] mb-2">
            Masuk sebagai <br />
            <b className="text-[var(--walnut)]">{profile.nama}</b>
          </p>
          <button
            onClick={handleLogout}
            className="text-left text-sm font-semibold text-[var(--red)] px-3 py-2 rounded-lg hover:bg-[var(--red-tint)] w-full"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* KONTEN */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 overflow-y-auto">{children}</main>

      {/* BOTTOM NAV - MOBILE */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[var(--white)] border-t border-[var(--line)] flex justify-around py-2 px-1 z-30">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const showBadge = item.href === "/admin/orders" && pendingOrdersCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-lg ${
                active ? "bg-[var(--forest-tint)] text-[var(--forest-dark)]" : "text-[var(--walnut-soft)]"
              }`}
            >
              <span className="relative">
                <span className="text-base leading-none">{item.icon}</span>
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[var(--rust)] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 leading-none">
                    {pendingOrdersCount}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}