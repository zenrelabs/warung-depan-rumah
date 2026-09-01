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
  if (status === "Diproses") return "bg-[#DCE7F1] text-[#2A5C8A]";
  if (status === "Selesai") return "bg-[#DDEBDC] text-[#3E7A46]";
  return "bg-[#F5DEDC] text-[#B23A34]";
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
      <h1 className="text-2xl font-semibold text-[#1F3A23] mb-1">Pesanan Saya</h1>
      <p className="text-sm text-[#6E5A47] mb-6">Riwayat pesanan di perangkat ini</p>

      {loading ? (
        <p className="text-sm text-[#6E5A47]">Memuat...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-[#6E5A47]">
          <div className="text-3xl mb-2">🧾</div>
          <p className="text-sm">Belum ada riwayat pesanan.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl shadow p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono font-semibold text-sm">{o.kode_pesanan}</span>
              <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + badgeClass(o.status)}>
                {o.status}
              </span>
            </div>
            <div className="text-xs text-[#6E5A47] mb-1">
              {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
            </div>
            <div className="text-xs text-[#6E5A47]">
              {rupiah(o.total)} · {fmtDate(o.created_at)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
