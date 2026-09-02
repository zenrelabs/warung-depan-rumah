"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMenu, getSettings } from "@/lib/queries";
import { getCart, changeCartQty, type CartLine } from "@/lib/cart";
import type { MenuItem, Settings } from "@/lib/types";

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

export default function CustomerMenuPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cart, setCartState] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    Promise.all([getMenu(), getSettings()])
      .then(([m, s]) => {
        setMenu(m);
        setSettings(s);
      })
      .finally(() => setLoading(false));
    setCartState(getCart());
  }, []);

  const storeOpen = (settings.StoreOpen ?? "true").toLowerCase() === "true";
  const allowOutside = (settings.AllowOrderOutsideHours ?? "true").toLowerCase() !== "false";
  const canOrder = storeOpen || allowOutside;

  const categories = [
    "Semua",
    ...Array.from(new Set(menu.map((m) => m.kategori).filter(Boolean))),
  ] as string[];

  let visible = [...menu];
  if (category !== "Semua") visible = visible.filter((m) => m.kategori === category);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    visible = visible.filter((m) => (m.nama + " " + (m.deskripsi || "")).toLowerCase().includes(q));
  }

  function findMenu(id: number) {
    return menu.find((m) => m.id === id);
  }

  function changeQty(id: number, delta: number) {
    const next = changeCartQty(id, delta);
    setCartState(next);
  }

  const cartLines = cart
    .map((c) => ({ ...c, m: findMenu(c.id) }))
    .filter((c) => c.m) as { id: number; qty: number; m: MenuItem }[];

  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const total = cartLines.reduce((s, c) => s + c.m.harga * c.qty, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {!storeOpen && !allowOutside && (
        <div className="mb-4 text-sm bg-[#F5DEDC] text-[#B23A34] border border-[#B23A34]/30 rounded-lg px-4 py-2.5 font-semibold">
          ● Warung sedang tutup. Pesanan baru belum bisa diproses saat ini.
        </div>
      )}

      <div className="relative mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari menu..."
          className="w-full rounded-full border border-[#E4D9C2] px-4 py-2.5 pl-10 text-sm bg-white"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E5A47]">🔍</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
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
      ) : visible.length === 0 ? (
        <p className="text-sm text-[#6E5A47] text-center py-10">Menu tidak ditemukan.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {visible.map((m) => {
            const inCart = cart.find((c) => c.id === m.id);
            const soldout = m.status === "habis";
            return (
              <div
                key={m.id}
                className={"bg-white rounded-2xl shadow overflow-hidden flex flex-col " + (soldout ? "opacity-50" : "")}
              >
                <div className="h-28 bg-[#F1DCC7] flex items-center justify-center text-3xl relative overflow-hidden">
                  {m.rekomendasi && (
                    <span className="absolute top-2 left-2 bg-[#C1652F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Terlaris
                    </span>
                  )}
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

                <div className="p-3 flex flex-col gap-1 flex-1">
                  <span className="text-[10px] uppercase font-bold text-[#C1652F]">{m.kategori}</span>
                  <div className="font-display text-sm font-semibold leading-tight">{m.nama}</div>
                  <div className="text-xs text-[#6E5A47] flex-1">{m.deskripsi}</div>
                  <div className="mt-2 flex items-center justify-between pt-1">
                    <span className="font-mono text-sm font-semibold text-[#1F3A23]">{rupiah(m.harga)}</span>
                    {soldout || !canOrder ? (
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

      {totalQty > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-5 right-5 bg-[#C1652F] text-white font-bold text-sm rounded-full px-5 py-3 shadow-lg flex items-center gap-2 z-40"
        >
          🛒 Keranjang <span className="bg-white/25 rounded-full px-2 py-0.5">{totalQty}</span>
        </button>
      )}

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white flex flex-col">
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#E4D9C2]">
              <h3 className="font-semibold text-[#1F3A23]">Keranjang</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-[#6E5A47]">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cartLines.length === 0 ? (
                <div className="text-center py-16 text-[#6E5A47]">
                  <div className="text-3xl mb-2">🛒</div>
                  <p className="text-sm">Keranjang masih kosong.</p>
                </div>
              ) : (
                cartLines.map((c) => (
                  <div key={c.id} className="flex gap-3 py-3 border-b border-[#E4D9C2]">
                    <div className="w-11 h-11 rounded-lg bg-[#F1DCC7] flex items-center justify-center overflow-hidden text-lg flex-shrink-0">
                      {c.m.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.m.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        CAT_ICON[c.m.kategori || ""] || "🍽"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm font-bold">{c.m.nama}</div>
                      <div className="font-mono text-xs text-[#6E5A47]">{rupiah(c.m.harga)}</div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#DCE3D0] rounded-full px-1.5 py-1 h-fit">
                      <button
                        onClick={() => changeQty(c.id, -1)}
                        className="w-6 h-6 rounded-full bg-[#2F5233] text-white text-sm"
                      >
                        −
                      </button>
                      <span className="font-mono text-sm font-semibold w-4 text-center">{c.qty}</span>
                      <button
                        onClick={() => changeQty(c.id, 1)}
                        className="w-6 h-6 rounded-full bg-[#2F5233] text-white text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#E4D9C2]">
              <div className="flex justify-between items-center font-bold text-sm mb-3">
                <span>Total</span>
                <span className="font-mono text-[#C1652F]">{rupiah(total)}</span>
              </div>
              <button
                disabled={!cartLines.length}
                onClick={() => router.push("/menu/checkout")}
                className="w-full bg-[#C1652F] text-white font-semibold text-sm rounded-lg py-2.5 disabled:opacity-50"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
