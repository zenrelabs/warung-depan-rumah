'use client';

import { useEffect, useMemo, useState } from "react";
import { getMyProfile, getOrders, getExpenses, addExpense } from "@/lib/queries";
import type { AdminProfile, Order, Expense } from "@/lib/types";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function isSameMonth(isoString: string, ref: Date) {
  const d = new Date(isoString);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export default function LaporanPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expKategori, setExpKategori] = useState("");
  const [expNominal, setExpNominal] = useState("");
  const [expKeterangan, setExpKeterangan] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);

  const isSuper = profile?.role === "super";
  const now = useMemo(() => new Date(), []);

  async function loadAll() {
    const prof = await getMyProfile();
    setProfile(prof);

    const allOrders = await getOrders();
    setOrders(allOrders);

    if (prof?.role === "super") {
      const expList = await getExpenses();
      setExpenses(expList);
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadAll();
      setLoading(false);
    }
    init();
  }, []);

  const paidOrders = useMemo(() => orders.filter((o) => o.paid), [orders]);
  const totalOmset = useMemo(
    () => paidOrders.reduce((sum, o) => sum + o.total, 0),
    [paidOrders]
  );
  const jumlahTransaksi = paidOrders.length;

  const menuTerlaris = useMemo(() => {
    const counter: Record<string, number> = {};
    paidOrders.forEach((o) => {
      o.items.forEach((it) => {
        counter[it.name] = (counter[it.name] || 0) + it.qty;
      });
    });
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [paidOrders]);

  const paidOrdersThisMonth = useMemo(
    () => paidOrders.filter((o) => isSameMonth(o.created_at, now)),
    [paidOrders, now]
  );
  const omsetBulanIni = useMemo(
    () => paidOrdersThisMonth.reduce((sum, o) => sum + o.total, 0),
    [paidOrdersThisMonth]
  );
  const expensesThisMonth = useMemo(
    () => (isSuper ? expenses.filter((e) => isSameMonth(e.tanggal, now)) : []),
    [expenses, isSuper, now]
  );
  const totalExpensesBulanIni = useMemo(
    () => expensesThisMonth.reduce((sum, e) => sum + e.nominal, 0),
    [expensesThisMonth]
  );
  const labaBulanIni = omsetBulanIni - totalExpensesBulanIni;

  async function handleAddExpense() {
    const nominalNum = Number(expNominal);
    if (!expKategori.trim() || !nominalNum || nominalNum <= 0) {
      alert("Isi kategori dan nominal pengeluaran dengan benar.");
      return;
    }
    setSavingExpense(true);
    try {
      await addExpense(expKategori.trim(), nominalNum, expKeterangan.trim());
      setExpKategori("");
      setExpNominal("");
      setExpKeterangan("");
      setShowAddExpense(false);
      setRefreshing(true);
      const expList = await getExpenses();
      setExpenses(expList);
      setRefreshing(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengeluaran. Coba lagi.");
    } finally {
      setSavingExpense(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-[#3B2A1E]">Memuat laporan...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 text-[#3B2A1E]">
      <h1 className="font-display text-2xl font-bold text-[#2F5233]">Laporan</h1>

      {/* SEMUA ROLE: TOTAL OMSET & TRANSAKSI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4">
          <p className="text-xs text-[#6E5A47] mb-1">Total Omset (semua waktu)</p>
          <p className="text-2xl font-bold font-mono text-[#2F5233]">{formatRupiah(totalOmset)}</p>
        </div>
        <div className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4">
          <p className="text-xs text-[#6E5A47] mb-1">Jumlah Transaksi</p>
          <p className="text-2xl font-bold font-mono text-[#2F5233]">{jumlahTransaksi}</p>
        </div>
      </section>

      {/* SEMUA ROLE: MENU TERLARIS */}
      <section className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4 md:p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold text-[#2F5233]">Menu Terlaris (Top 5)</h2>
        {menuTerlaris.length === 0 ? (
          <p className="text-sm text-[#6E5A47]">Belum ada data penjualan.</p>
        ) : (
          <ol className="divide-y divide-[#E4D9C2]">
            {menuTerlaris.map(([nama, qty], idx) => (
              <li key={nama} className="flex items-center justify-between py-2 text-sm">
                <span>{idx + 1}. {nama}</span>
                <span className="text-[#6E5A47]">{qty} terjual</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* KHUSUS SUPER: LABA BULAN INI */}
      <section className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4 md:p-6 space-y-2">
        <h2 className="font-display text-lg font-semibold text-[#2F5233]">Laba Bulan Ini</h2>
        {!isSuper ? (
          <p className="text-sm text-[#6E5A47]">🔒 khusus Super Admin</p>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span>Omset bulan ini</span>
              <span className="font-mono">{formatRupiah(omsetBulanIni)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pengeluaran bulan ini (termasuk gaji)</span>
              <span className="font-mono">{formatRupiah(totalExpensesBulanIni)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#2F5233] pt-2 border-t border-[#E4D9C2]">
              <span>Laba bersih</span>
              <span className="font-mono">{formatRupiah(labaBulanIni)}</span>
            </div>
          </>
        )}
      </section>

      {/* KHUSUS SUPER: DAFTAR KEUANGAN BULAN INI */}
      <section className="rounded-xl border border-[#E4D9C2] bg-[#FFFDF8] p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#2F5233]">Keuangan Bulan Ini</h2>
          {isSuper && (
            <button
              onClick={() => setShowAddExpense((v) => !v)}
              className="text-sm font-medium text-[#C1652F] hover:underline"
            >
              {showAddExpense ? "Batal" : "+ Tambah Pengeluaran"}
            </button>
          )}
        </div>

        {!isSuper ? (
          <p className="text-sm text-[#6E5A47]">🔒 khusus Super Admin</p>
        ) : (
          <>
            {showAddExpense && (
              <div className="space-y-2 rounded-lg border border-[#E4D9C2] bg-[#F6EFE2] p-3">
                <input
                  type="text"
                  placeholder="Kategori (mis: Belanja Bahan)"
                  value={expKategori}
                  onChange={(e) => setExpKategori(e.target.value)}
                  className="w-full rounded-lg border border-[#E4D9C2] bg-white px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Nominal"
                  value={expNominal}
                  onChange={(e) => setExpNominal(e.target.value)}
                  className="w-full rounded-lg border border-[#E4D9C2] bg-white px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Keterangan (opsional)"
                  value={expKeterangan}
                  onChange={(e) => setExpKeterangan(e.target.value)}
                  className="w-full rounded-lg border border-[#E4D9C2] bg-white px-3 py-2 text-sm"
                />
                <button
                  onClick={handleAddExpense}
                  disabled={savingExpense}
                  className="w-full rounded-lg bg-[#2F5233] px-4 py-2 text-sm font-medium text-white hover:bg-[#1F3A23] disabled:opacity-60"
                >
                  {savingExpense ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Pemasukan ({paidOrdersThisMonth.length} transaksi)</p>
              {paidOrdersThisMonth.length === 0 ? (
                <p className="text-xs text-[#6E5A47]">Belum ada pemasukan bulan ini.</p>
              ) : (
                <ul className="divide-y divide-[#E4D9C2]">
                  {paidOrdersThisMonth.map((o) => (
                    <li key={o.id} className="flex justify-between py-1.5 text-sm">
                      <span>{o.kode_pesanan} — {o.customer_name}</span>
                      <span className="text-[#3E7A46] font-mono">+{formatRupiah(o.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">
                Pengeluaran ({expensesThisMonth.length} item) {refreshing && "· memuat ulang..."}
              </p>
              {expensesThisMonth.length === 0 ? (
                <p className="text-xs text-[#6E5A47]">Belum ada pengeluaran bulan ini.</p>
              ) : (
                <ul className="divide-y divide-[#E4D9C2]">
                  {expensesThisMonth.map((e) => (
                    <li key={e.id} className="flex justify-between py-1.5 text-sm">
                      <span>{e.kategori}{e.keterangan ? ` — ${e.keterangan}` : ""}</span>
                      <span className="text-[#B23A34] font-mono">-{formatRupiah(e.nominal)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
