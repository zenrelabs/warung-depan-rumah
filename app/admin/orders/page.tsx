"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, markOrderPaidWithProof } from "@/lib/queries";
import { uploadImage } from "@/lib/storage";
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [markingPaid, setMarkingPaid] = useState(false);

  function load() {
    setLoading(true);
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id: number, status: Order["status"]) {
    try {
      await updateOrderStatus(id, status);
      load();
    } catch (err) {
      alert("Gagal update status: " + (err as Error).message);
    }
  }

  function openMarkPaid(order: Order) {
    setDetailOrder(order);
    setProofFile(null);
    setProofPreview("");
  }

  function onProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  async function handleMarkPaid() {
    if (!detailOrder) return;
    setMarkingPaid(true);
    try {
      let buktiUrl: string | null = null;
      if (proofFile) {
        buktiUrl = await uploadImage(proofFile, "bukti-bayar");
      }
      await markOrderPaidWithProof(detailOrder.id, buktiUrl);
      setDetailOrder(null);
      load();
    } catch (err) {
      alert("Gagal menandai lunas: " + (err as Error).message);
    } finally {
      setMarkingPaid(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--forest-dark)] mb-1">Riwayat Pesanan</h1>
        <p className="text-sm text-[var(--walnut-soft)]">Semua transaksi yang tercatat</p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--walnut-soft)]">Memuat...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-[var(--walnut-soft)]">Belum ada pesanan.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase text-[var(--walnut-soft)] border-b border-[var(--line)]">
                <th className="p-3 font-mono">ID</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Item</th>
                <th className="p-3">Total</th>
                <th className="p-3">Bayar</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--line)] last:border-0">
                  <td
                    className="p-3 font-mono text-[var(--rust)] cursor-pointer"
                    onClick={() => openMarkPaid(o)}
                  >
                    {o.kode_pesanan}
                  </td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3 text-xs">
                    {o.items.map((it) => `${it.name} ×${it.qty}`).join(", ")}
                  </td>
                  <td className="p-3 font-mono">{rupiah(o.total)}</td>
                  <td className="p-3">
                    {o.payment_method}
                    {o.paid ? (
                      <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--green-tint)] text-[var(--green-ok)]">
                        Lunas
                      </span>
                    ) : (
                      <button
                        onClick={() => openMarkPaid(o)}
                        className="ml-2 text-xs font-semibold border border-[var(--line)] rounded-full px-2.5 py-0.5"
                      >
                        Tandai Lunas
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as Order["status"])}
                      className={"text-xs font-bold rounded-full px-2.5 py-1 border-0 " + badgeClass(o.status)}
                    >
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/40 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailOrder(null);
          }}
        >
          <div className="min-h-full flex items-start justify-center p-5">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md my-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg font-semibold text-[var(--forest-dark)]">Struk Pesanan</h3>
                <button onClick={() => setDetailOrder(null)} className="text-[var(--walnut-soft)]">
                  ✕
                </button>
              </div>

              <div className="text-sm space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-[var(--walnut-soft)]">No. Pesanan</span>
                  <span className="font-mono">{detailOrder.kode_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--walnut-soft)]">Tanggal</span>
                  <span>{fmtDate(detailOrder.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--walnut-soft)]">Pelanggan</span>
                  <span>{detailOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--walnut-soft)]">Pembayaran</span>
                  <span>
                    {detailOrder.payment_method} {detailOrder.paid ? "(Lunas)" : "(Belum Lunas)"}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-[var(--line)] py-3 mb-3">
                {detailOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span>
                      {it.name} ×{it.qty}
                    </span>
                    <span className="font-mono">{rupiah(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm mb-4">
                <span>Total</span>
                <span className="font-mono text-[var(--forest-dark)]">{rupiah(detailOrder.total)}</span>
              </div>

              {!detailOrder.paid && (
                <div className="border-t border-[var(--line)] pt-4">
                  <label className="block text-xs font-bold text-[var(--walnut-soft)] mb-2">
                    Lampirkan bukti bayar (opsional)
                  </label>
                  <input type="file" accept="image/*" onChange={onProofChange} className="text-xs mb-2" />
                  {proofPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proofPreview} alt="" className="w-24 h-24 object-cover rounded-lg mb-3" />
                  )}
                  <button
                    onClick={handleMarkPaid}
                    disabled={markingPaid}
                    className="w-full bg-[var(--forest)] text-white font-semibold text-sm rounded-lg py-2.5 disabled:opacity-50"
                  >
                    {markingPaid ? "Memproses..." : "Tandai Lunas"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}