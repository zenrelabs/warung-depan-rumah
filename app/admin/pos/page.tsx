"use client";

import { useEffect, useState } from "react";
import { getMenu, createOrder } from "@/lib/queries";
import type { MenuItem } from "@/lib/types";

const CAT_ICON: Record<string, string> = {
  "Roti Maryam": "🫓",
  Camilan: "🍟",
  "Es Teh": "🥤",
  "Es Susu": "🥛",
  "Healthy Food": "🥗",
};

function rupiah(n: number) {
  return "Rp" + Math.round(n || 0).toLocaleString("id-ID");
}

type CartLine = { id: number; qty: number };

export default function AdminPosPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [paidNow, setPaidNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    getMenu()
      .then(setMenu)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Semua", ...Array.from(new Set(menu.map((m) => m.kategori).filter(Boolean)))] as string[];

  const visibleMenu = category === "Semua" ? menu : menu.filter((m) => m.kategori === category);

  function findMenu(id: number) {
    return menu.find((m) => m.id === id);
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter((c) => c.id !== id);
        return prev.map((c) => (c.id === id ? { ...c, qty: newQty } : c));
      }
      if (delta > 0) return [...prev, { id, qty: 1 }];
      return prev;
    });
  }

  const cartLines = cart
    .map((c) => ({ ...c, m: findMenu(c.id) }))
    .filter((c) => c.m) as { id: number; qty: number; m: MenuItem }[];

  const total = cartLines.reduce((s, c) => s + c.m.harga * c.qty, 0);

  async function handleSubmit() {
    if (!cartLines.length) {
      alert("Pilih minimal 1 menu dulu");
      return;
    }
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const order = await createOrder({
        customerName: customerName.trim() || "Pelanggan",
        phone: phone.trim(),
        items: cartLines.map((c) => ({ id: c.m.id, name: c.m.nama, qty: c.qty, price: c.m.harga })),
        payment,
        paidNow,
      });
      setSuccessMsg(`Pesanan ${order.kode_pesanan} berhasil dibuat`);
      setCart([]);
      setCustomerName("");
      setPhone("");
      getMenu().then(setMenu);
    } catch (err) {
      alert("Gagal membuat pesanan: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#1F3A23] mb-1">Pesanan Baru</h1>
        <p className="text-sm text-[#6E5A47]">Pilih menu untuk pelanggan yang sedang memesan</p>
      </div>

      {successMsg && (
        <div className="mb-5 text-sm text-[#3E7A46] bg-[#DDEBDC] border border-[#3E7A46]/30 rounded-lg px-4 py-2.5 font-semibold">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        <div>
          <div className="flex gap-2 flex-wrap mb-4">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "px-4 py-2 rounded-full text-xs font-bold border " +
                  (category === c
                    ? "bg-[#2F5233] border-[#2F5233] text-white"
                    : "bg-white border-[#E4D9C2] text-[#6E5A47]")
                }
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-[#6E5A47]">Memuat menu...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {visibleMenu.map((m) => {
                const inCart = cart.find((c) => c.id === m.id);
                const soldout = m.status === "habis";
                return (
                  <div
                    key={m.id}
                    className={"bg-white rounded-2xl shadow overflow-hidden flex flex-col " + (soldout ? "opacity-45" : "")}
                  >
                    <div className="h-24 bg-[#F1DCC7] flex items-center justify-center text-3xl relative overflow-hidden">
                      {m.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.foto} alt={m.nama} className="w-full h-full object-cover" />
                      ) : (
                        CAT_ICON[m.kategori || ""] || "🍽"
                      )}
                      {soldout && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-[#B23A34] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 flex-1">
                      <span className="text-[10px] uppercase font-bold text-[#C1652F]">{m.kategori}</span>
                      <div className="font-display text-sm font-semibold text-[#3B2A1E] leading-tight">{m.nama}</div>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <span className="font-mono text-sm font-semibold text-[#1F3A23]">{rupiah(m.harga)}</span>
                        {soldout ? (
                          <button disabled className="w-8 h-8 rounded-full bg-[#E4D9C2] text-[#6E5A47]">
                            +
                          </button>
                        ) : inCart ? (
                          <div className="flex items-center gap-2 bg-[#DCE3D0] rounded-full px-1.5 py-1">
                            <button
                              onClick={() => changeQty(m.id, -1)}
                              className="w-6 h-6 rounded-full bg-[#2F5233] text-white text-sm"
                            >
                              −
                            </button>
                            <span className="font-mono text-sm font-semibold w-4 text-center">{inCart.qty}</span>
                            <button
                              onClick={() => changeQty(m.id, 1)}
                              className="w-6 h-6 rounded-full bg-[#2F5233] text-white text-sm"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => changeQty(m.id, 1)}
                            className="w-8 h-8 rounded-full bg-[#C1652F] text-white text-lg leading-none"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-5 sticky top-0">
          <h3 className="font-display text-base font-semibold text-[#1F3A23] mb-3">Pesanan Saat Ini</h3>

          {cartLines.length === 0 ? (
            <p className="text-sm text-[#6E5A47] mb-4">Belum ada item dipilih.</p>
          ) : (
            <div className="mb-4">
              {cartLines.map((c) => (
                <div key={c.id} className="flex justify-between text-sm py-1.5 border-b border-dotted border-[#E4D9C2]">
                  <span>
                    {c.m.nama} ×{c.qty}
                  </span>
                  <span className="font-mono">{rupiah(c.m.harga * c.qty)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center font-bold text-sm mb-4 pt-1">
            <span>Total</span>
            <span className="font-mono text-[#C1652F]">{rupiah(total)}</span>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#6E5A47] mb-1">Nama Pelanggan (opsional)</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Bu Rina"
              className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-bold text-[#6E5A47] mb-1">No. WA (opsional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm"
            />
          </div>

          <label className="block text-xs font-bold text-[#6E5A47] mb-1.5">Metode Pembayaran</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {["Cash", "Transfer Bank", "QRIS"].map((p) => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                className={
                  "px-3 py-1.5 rounded-full text-xs font-bold border " +
                  (payment === p
                    ? "bg-[#2F5233] border-[#2F5233] text-white"
                    : "bg-white border-[#E4D9C2] text-[#6E5A47]")
                }
              >
                {p}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold mb-4">
            <input type="checkbox" checked={paidNow} onChange={(e) => setPaidNow(e.target.checked)} />
            Tandai lunas sekarang
          </label>

          <button
            onClick={handleSubmit}
            disabled={submitting || !cartLines.length}
            className="w-full bg-[#C1652F] text-white font-semibold text-sm rounded-lg py-2.5 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : "Buat Pesanan"}
          </button>
          {cartLines.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="w-full mt-2 border border-[#E4D9C2] text-[#6E5A47] font-semibold text-sm rounded-lg py-2.5"
            >
              Kosongkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}