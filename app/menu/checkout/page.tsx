"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMenu, createOrder } from "@/lib/queries";
import { getCart, setCart, saveMyOrderId, type CartLine } from "@/lib/cart";
import type { MenuItem } from "@/lib/types";

function rupiah(n: number) {
  return "Rp" + Math.round(n || 0).toLocaleString("id-ID");
}

export default function CheckoutPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCartState] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCartState(getCart());
    getMenu()
      .then(setMenu)
      .finally(() => setLoading(false));
  }, []);

  function findMenu(id: number) {
    return menu.find((m) => m.id === id);
  }

  const cartLines = cart
    .map((c) => ({ ...c, m: findMenu(c.id) }))
    .filter((c) => c.m) as { id: number; qty: number; m: MenuItem }[];

  const total = cartLines.reduce((s, c) => s + c.m.harga * c.qty, 0);

  async function handleSubmit() {
    if (!name.trim()) {
      alert("Isi nama dulu, ya");
      return;
    }
    if (!cartLines.length) {
      alert("Keranjang kosong");
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerName: name.trim(),
        phone: phone.trim(),
        note: note.trim(),
        items: cartLines.map((c) => ({ id: c.m.id, name: c.m.nama, qty: c.qty, price: c.m.harga })),
        payment,
        paidNow: false,
      });
      saveMyOrderId(order.kode_pesanan);
      setCart([]);
      router.push(`/menu/receipt?id=${order.kode_pesanan}`);
    } catch (err) {
      alert("Gagal membuat pesanan: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && cartLines.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-3xl mb-3">🛒</div>
        <p className="text-sm text-[var(--walnut-soft)] mb-4">Keranjang kosong.</p>
        <button onClick={() => router.push("/menu")} className="text-[var(--rust)] font-semibold text-sm">
          ← Kembali ke menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--forest-dark)] mb-1">Checkout</h1>
      <p className="text-sm text-[var(--walnut-soft)] mb-6">Lengkapi data pesanan sebelum dikirim</p>

      <div className="bg-white rounded-2xl shadow p-5 mb-4">
        <div className="mb-3">
          <label className="block text-xs font-bold text-[var(--walnut-soft)] mb-1">Nama Pelanggan</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-bold text-[var(--walnut-soft)] mb-1">No. WA (opsional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-[var(--walnut-soft)] mb-1">Catatan (opsional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: tidak pedas"
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm min-h-[60px]"
          />
        </div>

        <label className="block text-xs font-bold text-[var(--walnut-soft)] mb-1.5">Metode Pembayaran</label>
        <div className="space-y-2">
          {["Cash", "Transfer Bank", "QRIS"].map((p) => (
            <label
              key={p}
              className={
                "flex items-start gap-2 border rounded-lg px-3 py-2.5 cursor-pointer " +
                (payment === p ? "border-[var(--rust)] bg-[var(--rust-tint)]" : "border-[var(--line)]")
              }
            >
              <input type="radio" checked={payment === p} onChange={() => setPayment(p)} className="mt-1" />
              <span>
                <span className="block text-sm font-semibold">{p}</span>
                <span className="block text-xs text-[var(--walnut-soft)]">
                  {p === "Cash" ? "Bayar di tempat saat ambil pesanan" : "Bayar sebelum diproses, tunjukkan bukti ke kasir"}
                </span>
              </span>
            </label>
          ))}
        </div>
        {payment === "QRIS" && (
          <div className="mt-3 flex flex-col items-center gap-2 border border-dashed border-[var(--line)] rounded-lg py-4">
            <div className="w-32 h-32 bg-[var(--cream-alt)] border border-[var(--line)] rounded-lg flex items-center justify-center text-[10px] text-[var(--walnut-soft)] text-center px-2">
              QR Code akan ditampilkan di sini
            </div>
            <span className="text-xs text-[var(--walnut-soft)]">Scan lalu tunjukkan bukti pembayaran ke kasir</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-5 mb-4">
        <h3 className="font-display text-sm font-semibold mb-3">Ringkasan Pesanan</h3>
        {cartLines.map((c) => (
          <div key={c.id} className="flex justify-between text-sm py-1.5 border-b border-dotted border-[var(--line)]">
            <span>
              {c.m.nama} ×{c.qty}
            </span>
            <span className="font-mono">{rupiah(c.m.harga * c.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center font-bold text-sm mt-3 pt-2">
          <span>Total</span>
          <span className="font-mono text-[var(--rust)]">{rupiah(total)}</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-[var(--rust)] text-white font-semibold text-sm rounded-lg py-2.5 disabled:opacity-50"
      >
        {submitting ? "Memproses..." : "Pesan Sekarang"}
      </button>
    </div>
  );
}
