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

      const menuList = await getMenu();
      setMenu(menuList);

      setLoading(false);
    }
    load();
  }, []);
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
    return orders.filter((o) => o.paid && o.status !== "Dibatalkan").reduce((sum, o) => sum + o.total, 0);
  }, [orders]);
  const trend7Days = useMemo(() => {
    const days: { label: string; date: Date; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const total = orders
        .filter((o) => o.paid && o.status !== "Dibatalkan" && isSameLocalDay(o.created_at, d))
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ label: DAY_LABELS[d.getDay()], date: d, total });
    }
    return days;
  }, [orders, today]);

  const omsetHariIni = useMemo(() => {
    if (trend7Days.length === 0) return 0;
    return trend7Days[trend7Days.length - 1].total;
  }, [trend7Days]);

  const omset7Hari = useMemo(() => {
    return trend7Days.reduce((sum, d) => sum + d.total, 0);
  }, [trend7Days]);
  const maxTrendValue = useMemo(
    () => Math.max(1, ...trend7Days.map((d) => d.total)),
    [trend7Days]
  );

  const menuTerlaris = useMemo(() => {
    return menu.filter((m) => m.rekomendasi);
  }, [menu]);

  if (loading) {
    return <div className="p-6 text-[var(--walnut)]">Memuat dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 text-[var(--walnut)]">
      <h1 className="font-display text-2xl font-bold text-[var(--forest)]">Dashboard</h1>

      {/* STAT BOXES */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">         <p className="text-xs text-[var(--walnut-soft)] mb-1">Pesanan Hari Ini</p>
          <p className="text-2xl font-bold font-mono text-[var(--forest)]">{todayCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">
          <p className="text-xs text-[var(--walnut-soft)] mb-1">Sedang Diproses</p>
          <p className="text-2xl font-bold font-mono text-[var(--amber)]">{processingCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">
          <p className="text-xs text-[var(--walnut-soft)] mb-1">Dibatalkan</p>
          <p className="text-2xl font-bold font-mono text-[var(--red)]">{cancelledCount}</p>
        </div>
      </section>

      {/* OMSET & TREN */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Omset</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-[var(--cream)] p-3">
            <p className="text-xs text-[var(--walnut-soft)] mb-1">Hari Ini</p>
            <p className="text-xl font-bold font-mono text-[var(--forest)]">{formatRupiah(omsetHariIni)}</p>
          </div>
          <div className="rounded-lg bg-[var(--cream)] p-3">
            <p className="text-xs text-[var(--walnut-soft)] mb-1">7 Hari Terakhir</p>
            <p className="text-xl font-bold font-mono text-[var(--rust)]">{formatRupiah(omset7Hari)}</p>
          </div>
          <div className="rounded-lg bg-[var(--cream)] p-3">
            <p className="text-xs text-[var(--walnut-soft)] mb-1">Semua Waktu</p>
            <p className="text-xl font-bold font-mono text-[var(--walnut)]">{formatRupiah(totalRevenue)}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-[var(--walnut-soft)] mb-2">Tren Omset 7 Hari Terakhir</p>
          <div className="flex items-end gap-2 h-32">
            {trend7Days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[var(--forest)] rounded-t-md min-h-[2px]"
                  style={{
                    height: `${Math.max(4, (d.total / maxTrendValue) * 100)}px`,
                  }}
                  title={formatRupiah(d.total)}
                />
                <span className="text-[10px] text-[var(--walnut-soft)]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENU TERLARIS */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Menu Rekomendasi / Terlaris</h2>
        {menuTerlaris.length === 0 ? (
          <p className="text-sm text-[var(--walnut-soft)]">Belum ada menu yang ditandai rekomendasi.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {menuTerlaris.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <span>{m.nama}</span>
                <span className="text-[var(--walnut-soft)] font-mono">{formatRupiah(m.harga)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5 PESANAN TERBARU */}
      <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--forest)]">5 Pesanan Terbaru</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[var(--walnut-soft)]">Belum ada pesanan.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-[var(--cream)] px-2 -mx-2 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{o.kode_pesanan} — {o.customer_name}</p>
                  <p className="text-xs text-[var(--walnut-soft)]">
                    {new Date(o.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    o.status === "Selesai"
                      ? "bg-[var(--green-tint)] text-[var(--green-ok)]"
                      : o.status === "Dibatalkan"
                      ? "bg-[var(--red-tint)] text-[var(--red)]"
                      : "bg-[var(--blue-tint)] text-[var(--blue)]"
                  }`}
                >
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MODAL DETAIL STRUK */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[var(--white)] rounded-xl max-w-sm w-full p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-mono text-[var(--forest)]">{selectedOrder.kode_pesanan}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[var(--walnut-soft)] text-sm"
              >
                Tutup
              </button>
            </div>
            <p className="text-sm">Pelanggan: {selectedOrder.customer_name}</p>
            {selectedOrder.phone && (
              <p className="text-sm">Telp: {selectedOrder.phone}</p>
            )}
            <div className="divide-y divide-[var(--line)] text-sm">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1.5">
                  <span>{it.qty}x {it.name}</span>
                  <span className="font-mono">{formatRupiah(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-[var(--forest)] pt-2 border-t border-[var(--line)]">
              <span>Total</span>
              <span className="font-mono">{formatRupiah(selectedOrder.total)}</span>
            </div>
            <p className="text-xs text-[var(--walnut-soft)]">
              {selectedOrder.payment_method} · {selectedOrder.paid ? "Lunas" : "Belum lunas"} · {selectedOrder.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}