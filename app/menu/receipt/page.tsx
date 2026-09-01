"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrdersByIds } from "@/lib/queries";
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

function ReceiptContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getOrdersByIds([id])
      .then((list) => setOrder(list[0] || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-sm text-[#6E5A47] py-16">Memuat...</p>;

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-[#6E5A47] mb-4">Pesanan tidak ditemukan.</p>
        <Link href="/menu" className="text-[#C1652F] font-semibold text-sm">
          ← Kembali ke menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-4">
        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F3E6C4] text-[#B5811E]">
          Menunggu Diproses
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 mb-4 text-sm">
        <div className="border-t border-dashed border-[#E4D9C2] my-3" />
        <div className="flex justify-between mb-1">
          <span className="text-[#6E5A47]">No. Pesanan</span>
          <span className="font-mono font-bold">{order.kode_pesanan}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-[#6E5A47]">Tanggal</span>
          <span>{fmtDate(order.created_at)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-[#6E5A47]">Pelanggan</span>
          <span>{order.customer_name}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-[#6E5A47]">Pembayaran</span>
          <span>{order.payment_method}</span>
        </div>
        <div className="border-t border-dashed border-[#E4D9C2] my-3" />
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between mb-1">
            <span>
              {it.name} ×{it.qty}
            </span>
            <span className="font-mono">{rupiah(it.price * it.qty)}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-[#E4D9C2] my-3" />
        <div className="flex justify-between font-bold text-base font-sans">
          <span>Total</span>
          <span className="font-mono text-[#C1652F]">{rupiah(order.total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/pesanan-saya"
          className="flex-1 text-center border border-[#E4D9C2] rounded-lg py-2.5 text-sm font-semibold bg-white"
        >
          Lihat Pesanan Saya
        </Link>
        <Link
          href="/menu"
          className="flex-1 text-center bg-[#C1652F] text-white rounded-lg py-2.5 text-sm font-semibold"
        >
          Pesan Lagi
        </Link>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-[#6E5A47] py-16">Memuat...</p>}>
      <ReceiptContent />
    </Suspense>
  );
}
