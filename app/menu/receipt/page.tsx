"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrdersByIds, getSettings } from "@/lib/queries";
import type { Order, Settings } from "@/lib/types";

function rupiah(n: number) {
  return "Rp" + Math.round(n || 0).toLocaleString("id-ID");
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    ", " +
    dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

function statusStyle(status: string) {
  switch (status) {
    case "Selesai":
      return "bg-[#DDEBDC] text-[#3E7A46]";
    case "Dibatalkan":
      return "bg-[#F5DEDC] text-[#B23A34]";
    case "Diproses":
    default:
      return "bg-[#DCE7F1] text-[#2A5C8A]";
  }
}

function ReceiptContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([getOrdersByIds([id]), getSettings()])
      .then(([list, settingsData]) => {
        setOrder(list[0] || null);
        setSettings(settingsData);
      })
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

  const storeName = settings.StoreName || "Warung Depan Rumah";
  const storeAddress = settings.StoreAddress || "";
  const storePhone = settings.StorePhone || "";

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #struk-print, #struk-print * { visibility: visible; }
          #struk-print {
            position: absolute;
            top: 0;
            left: 0;
            width: 58mm;
            padding: 4mm;
            font-family: "Courier New", monospace;
            font-size: 10px;
            color: #000;
          }
          @page { size: 58mm auto; margin: 0; }
        }
      `}</style>

      <div className="no-print text-center mb-4">
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${statusStyle(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="no-print mb-4">
        <div className="bg-white rounded-t-2xl shadow-lg p-5 text-sm">
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
          <div className="flex justify-between font-display font-bold text-base">
            <span>Total</span>
            <span className="font-mono text-[#C1652F]">{rupiah(order.total)}</span>
          </div>
        </div>
        <div
          className="h-3 -mt-px"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, #F6EFE2 50%), linear-gradient(45deg, #F6EFE2 50%, transparent 50%)",
            backgroundSize: "16px 16px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "left top",
          }}
        />
      </div>

      <div className="no-print flex gap-3 mb-3">
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

      <button
        onClick={() => window.print()}
        className="no-print w-full text-center border border-[#2F5233] text-[#2F5233] rounded-lg py-2.5 text-sm font-semibold bg-white hover:bg-[#DCE3D0]"
      >
        🖨️ Cetak Struk
      </button>

      {/* AREA KHUSUS PRINT - tersembunyi di layar biasa, hanya muncul saat print */}
      <div id="struk-print" className="hidden print:block">
        <div className="text-center mb-2">
          <div className="font-bold">{storeName}</div>
          {storeAddress && <div>{storeAddress}</div>}
          {storePhone && <div>{storePhone}</div>}
        </div>
        <div>--------------------------------</div>
        <div>No: {order.kode_pesanan}</div>
        <div>{fmtDate(order.created_at)}</div>
        <div>Plgn: {order.customer_name}</div>
        <div>Bayar: {order.payment_method}</div>
        <div>--------------------------------</div>
        {order.items.map((it, i) => (
          <div key={i}>
            <div>{it.name}</div>
            <div className="flex justify-between">
              <span>{it.qty} x {rupiah(it.price)}</span>
              <span>{rupiah(it.price * it.qty)}</span>
            </div>
          </div>
        ))}
        <div>--------------------------------</div>
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{rupiah(order.total)}</span>
        </div>
        <div>--------------------------------</div>
        <div className="text-center mt-2">Terima kasih telah berbelanja!</div>
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
