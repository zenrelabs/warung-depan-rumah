'use client';

import { useEffect, useMemo, useState } from "react";
import { getMyProfile, getOrders, getMenu } from "@/lib/queries";
import type { AdminProfile, Order, MenuItem } from "@/lib/types";

function isSameLocalDay(isoString: string, ref: Date) {
  const d = new Date(isoString);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const prof = await getMyProfile();
      setProfile(prof);

      const allOrders = await getOrders();
      setOrders(allOrders);

      if (prof?.role === "super") {
        const menuList = await getMenu();
        setMenu(menuList);
      }
      setLoading(false);
    }
    load();
  }, []);

  const isSuper = profile?.role === "super";
  const today = useMemo(() => new Date(), []);

  const todayCount = useMemo(
    () => orders.filter((o) => isSameLocalDay(o.created_at, today)).length,
    [orders, today]
  );
  const processingCount = useMemo(
    () => orders.filter((o) => o.status === "Diproses").length,
    [orders]
  );
  const cancelledCount = useMemo(
    () => orders.filter((o) => o.status === "Dibatalkan").length,
    [orders]
  );
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const totalRevenue = useMemo(() => {
    if (!isSuper) return 0;
    return orders.filter((o) => o.paid).reduce((sum, o) => sum + o.total, 0);
  }, [orders, isSuper]);

  const trend7Days = useMemo(() => {
    if (!isSuper) return [];
    const days: { label: string; date: Date; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const total = orders
        .filter((o) => o.paid && isSameLocalDay(o.created_at, d))
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ label: DAY_LABELS[d.getDay()], date: d, total });
    }
    return days;
  }, [orders, isSuper, today]);

  const maxTrendValue = useMemo(
    () => Math.max(1, ...trend7Days.map((d) => d.total)),
    [trend7Days]
  );

  const menuTerlaris = useMemo(
    () => (isSuper ? menu.filter((m) => m.rekomendasi) : []),
    [menu, isSuper]
  );

  if (loading) {
    return <div className="p-6 text-[#3B2A1E]">Memuat dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 text-[#3B2A1E]">
      <h1 className="text-2xl font-bold text-[#2F5233]">Dashboard</h1>

      {/* STAT BOXES - SEMUA ROLE */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4">
          <p className="text-xs text-[#6E5A47] mb-1">Pesanan Hari Ini</p>
          <p className="text-2xl font-bold text-[#2F5233]">{todayCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4">
          <p className="text-xs text-[#6E5A47] mb-1">Sedang Diproses</p>
          <p className="text-2xl font-bold text-[#B5811E]">{processingCount}</p>
        </div>
        <div className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4">
          <p className="text-xs text-[#6E5A47] mb-1">Dibatalkan</p>
          <p className="text-2xl font-bold text-[#B23A34]">{cancelledCount}</p>
        </div>
      </section>

      {/* KHUSUS SUPER: REVENUE & TREN */}
      <section className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4 md:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#2F5233]">Omset</h2>
        {!isSuper ? (
          <p className="text-sm text-[#6E5A47]">🔒 khusus Super Admin</p>
        ) : (
          <>
            <div>
              <p className="text-xs text-[#6E5A47] mb-1">Total Revenue (semua waktu)</p>
              <p className="text-3xl font-bold text-[#2F5233]">{formatRupiah(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6E5A47] mb-2">Tren Omset 7 Hari Terakhir</p>
              <div className="flex items-end gap-2 h-32">
                {trend7Days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#2F5233] rounded-t-md min-h-[2px]"
                      style={{
                        height: `${Math.max(4, (d.total / maxTrendValue) * 100)}px`,
                      }}
                      title={formatRupiah(d.total)}
                    />
                    <span className="text-[10px] text-[#6E5A47]">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* KHUSUS SUPER: MENU TERLARIS */}
      <section className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4 md:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#2F5233]">Menu Rekomendasi / Terlaris</h2>
        {!isSuper ? (
          <p className="text-sm text-[#6E5A47]">🔒 khusus Super Admin</p>
        ) : menuTerlaris.length === 0 ? (
          <p className="text-sm text-[#6E5A47]">Belum ada menu yang ditandai rekomendasi.</p>
        ) : (
          <ul className="divide-y divide-[#E4D9C2]">
            {menuTerlaris.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <span>{m.nama}</span>
                <span className="text-[#6E5A47]">{formatRupiah(m.harga)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5 PESANAN TERBARU - SEMUA ROLE */}
      <section className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4 md:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#2F5233]">5 Pesanan Terbaru</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[#6E5A47]">Belum ada pesanan.</p>
        ) : (
          <ul className="divide-y divide-[#E4D9C2]">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-[#F6EFE2] px-2 -mx-2 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{o.kode_pesanan} — {o.customer_name}</p>
                  <p className="text-xs text-[#6E5A47]">
                    {new Date(o.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    o.status === "Selesai"
                      ? "bg-[#DDEBDC] text-[#3E7A46]"
                      : o.status === "Dibatalkan"
                      ? "bg-[#F5DEDC] text-[#B23A34]"
                      : "bg-[#F3E6C4] text-[#B5811E]"
                  }`}
                >
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MODAL DETAIL STRUK - div sederhana, konten pendek jadi tidak perlu <dialog> */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#FFFDF8] rounded-xl max-w-sm w-full p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2F5233]">{selectedOrder.kode_pesanan}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#6E5A47] text-sm"
              >
                Tutup
              </button>
            </div>
            <p className="text-sm">Pelanggan: {selectedOrder.customer_name}</p>
            {selectedOrder.phone && (
              <p className="text-sm">Telp: {selectedOrder.phone}</p>
            )}
            <div className="divide-y divide-[#E4D9C2] text-sm">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1.5">
                  <span>{it.qty}x {it.name}</span>
                  <span>{formatRupiah(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-[#2F5233] pt-2 border-t border-[#E4D9C2]">
              <span>Total</span>
              <span>{formatRupiah(selectedOrder.total)}</span>
            </div>
            <p className="text-xs text-[#6E5A47]">
              {selectedOrder.payment_method} · {selectedOrder.paid ? "Lunas" : "Belum lunas"} · {selectedOrder.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}