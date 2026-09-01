"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/lib/queries";
import type { Order } from "@/lib/types";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const todayCount = orders.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1F3A23] mb-1">Dashboard</h1>
      <p className="text-sm text-[#6E5A47] mb-6">Ringkasan hari ini</p>

      {loading ? (
        <p className="text-sm text-[#6E5A47]">Memuat data...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="text-xs font-bold text-[#6E5A47] mb-1">Pesanan Hari Ini</div>
            <div className="text-2xl font-mono font-bold text-[#1F3A23]">{todayCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="text-xs font-bold text-[#6E5A47] mb-1">Total Pesanan Tercatat</div>
            <div className="text-2xl font-mono font-bold text-[#1F3A23]">{orders.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="text-xs font-bold text-[#6E5A47] mb-1">Diproses</div>
            <div className="text-2xl font-mono font-bold text-[#1F3A23]">
              {orders.filter((o) => o.status === "Diproses").length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}