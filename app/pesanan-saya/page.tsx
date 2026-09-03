"use client";

import { useEffect, useState } from "react";
import { getOrdersByIds } from "@/lib/queries";
import { getMyOrderIds } from "@/lib/cart";
import type { Order } from "@/lib/types";

function rupiah(n: number) {
  return "Rp" + Math.round(n || 0).toLocaleString("id-ID");
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    ", " +
    dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

function badgeClass(status: Order["status"]) {
  if (status === "Diproses") return "bg-[var(--blue-tint)] text-[var(--blue)]";
  if (status === "Selesai") return "bg-[var(--green-tint)] text-[var(--green-ok)]";
  return "bg-[var(--red-tint)] text-[var(--red)]";
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getMyOrderIds();
    if (!ids.length) {
      setLoading(false);
      return;
    }
    getOrdersByIds(ids)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--forest-dark)] mb-1">Pesanan Saya</h1>
      <p className="text-sm text-[var(--walnut-soft)] mb-6">Riwayat pesanan di perangkat ini</p>

      {loading ? (
        <p className="text-sm text-[var(--walnut-soft)]">Memuat...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-[var(--walnut-soft)]">
          <div className="text-3xl mb-2">🧾</div>
          <p className="text-sm">Belum ada riwayat pesanan.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="bg-[var(--white)] rounded-2xl shadow p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono font-semibold text-sm">{o.kode_pesanan}</span>
              <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + badgeClass(o.status)}>
                {o.status}
              </span>
            </div>
            <div className="text-xs text-[var(--walnut-soft)] mb-1">
              {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
            </div>
            <div className="text-xs text-[var(--walnut-soft)]">
              {rupiah(o.total)} · {fmtDate(o.created_at)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
