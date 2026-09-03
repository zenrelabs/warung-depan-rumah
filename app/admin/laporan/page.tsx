'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMyProfile, getOrders, getExpenses, addExpense } from "@/lib/queries";
import type { AdminProfile, Order, Expense } from "@/lib/types";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function isSameMonth(isoString: string, ref: Date) {
  const d = new Date(isoString);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function isSameDay(isoString: string, ref: Date) {
  const d = new Date(isoString);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const LAPORAN_BULANAN_MULAI = new Date(2026, 8, 1);

function monthLabel(d: Date) {
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
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
  const [activeTab, setActiveTab] = useState<"harian" | "bulanan">("harian");

  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const isSuper = profile?.role === "super";

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

  const paidOrders = useMemo(
    () => orders.filter((o) => o.paid && o.status !== "Dibatalkan"),
    [orders]
  );
  const totalOmset = useMemo(
    () => paidOrders.reduce((sum, o) => sum + o.total, 0),
    [paidOrders]
  );
  const jumlahTransaksi = paidOrders.length;

  const last7Days = useMemo(() => [6, 5, 4, 3, 2, 1, 0].map((n) => daysAgo(n)), []);
  const dayRevenue = useMemo(
    () =>
      last7Days.map((d) =>
        paidOrders
          .filter((o) => isSameDay(o.created_at, d))
          .reduce((sum, o) => sum + o.total, 0)
      ),
    [paidOrders, last7Days]
  );
  const maxDayRevenue = Math.max(...dayRevenue, 1);
  const totalOmset7Hari = dayRevenue.reduce((a, b) => a + b, 0);
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
    () => expenses.filter((e) => isSameMonth(e.tanggal, now)),
    [expenses, now]
  );
  const totalExpensesBulanIni = useMemo(
    () => expensesThisMonth.reduce((sum, e) => sum + e.nominal, 0),
    [expensesThisMonth]
  );
  const labaBulanIni = omsetBulanIni - totalExpensesBulanIni;

  const monthOptions = useMemo(() => {
    const opts: Date[] = [];
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    let cur = new Date(LAPORAN_BULANAN_MULAI);
    while (cur <= end) {
      opts.push(new Date(cur));
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return opts.reverse();
  }, [now]);

  const ordersSelectedMonth = useMemo(
    () => paidOrders.filter((o) => isSameMonth(o.created_at, selectedMonth)),
    [paidOrders, selectedMonth]
  );
  const omsetSelectedMonth = useMemo(
    () => ordersSelectedMonth.reduce((sum, o) => sum + o.total, 0),
    [ordersSelectedMonth]
  );
  const expensesSelectedMonth = useMemo(
    () => expenses.filter((e) => isSameMonth(e.tanggal, selectedMonth)),
    [expenses, selectedMonth]
  );
  const totalExpensesSelectedMonth = useMemo(
    () => expensesSelectedMonth.reduce((sum, e) => sum + e.nominal, 0),
    [expensesSelectedMonth]
  );
  const labaSelectedMonth = omsetSelectedMonth - totalExpensesSelectedMonth;
  const menuTerlarisSelectedMonth = useMemo(() => {
    const counter: Record<string, number> = {};
    ordersSelectedMonth.forEach((o) => {
      o.items.forEach((it) => {
        counter[it.name] = (counter[it.name] || 0) + it.qty;
      });
    });
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [ordersSelectedMonth]);

  const prevMonthDate = useMemo(
    () => new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    [selectedMonth]
  );
  const hasPrevMonthData = prevMonthDate >= LAPORAN_BULANAN_MULAI;
  const omsetPrevMonth = useMemo(
    () =>
      hasPrevMonthData
        ? paidOrders
            .filter((o) => isSameMonth(o.created_at, prevMonthDate))
            .reduce((sum, o) => sum + o.total, 0)
        : 0,
    [paidOrders, prevMonthDate, hasPrevMonthData]
  );
  const omsetPerubahanPersen =
    hasPrevMonthData && omsetPrevMonth > 0
      ? Math.round(((omsetSelectedMonth - omsetPrevMonth) / omsetPrevMonth) * 100)
      : null;

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
    return <div className="p-6 text-[var(--walnut)]">Memuat laporan...</div>;
  }

  if (!isSuper) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-3">
        <p className="text-4xl">🔒</p>
        <h1 className="font-display text-xl font-bold text-[var(--forest)]">
          Khusus Super Admin
        </h1>
        <p className="text-sm text-[var(--walnut-soft)]">
          Halaman Laporan hanya bisa diakses oleh Super Admin. Data omset harian dan menu
          terlaris tetap bisa dilihat lewat Dashboard.
        </p>
        <Link
          href="/admin"
          className="inline-block mt-2 text-sm font-semibold text-[var(--rust)] hover:underline"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-[var(--walnut)]">
      <h1 className="font-display text-3xl font-bold text-[var(--forest-dark)] tracking-tight">Laporan</h1>
      <div className="flex gap-1 rounded-xl bg-[var(--cream-alt)] p-1 w-fit">
        <button
          onClick={() => setActiveTab("harian")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            activeTab === "harian" ? "bg-[var(--forest)] text-white" : "text-[var(--walnut-soft)]"
          }`}
        >
          Harian
        </button>
        <button
          onClick={() => setActiveTab("bulanan")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            activeTab === "bulanan" ? "bg-[var(--forest)] text-white" : "text-[var(--walnut-soft)]"
          }`}
        >
          Bulanan
        </button>
      </div>

      {activeTab === "harian" && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">
              <p className="text-xs text-[var(--walnut-soft)] mb-1">Total Omset (semua waktu)</p>
              <p className="text-2xl font-bold font-mono text-[var(--forest)]">{formatRupiah(totalOmset)}</p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">
              <p className="text-xs text-[var(--walnut-soft)] mb-1">Jumlah Transaksi</p>
              <p className="text-2xl font-bold font-mono text-[var(--forest)]">{jumlahTransaksi}</p>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Omset per Hari</h2>
              <span className="text-xs text-[var(--walnut-soft)]">7 hari terakhir · {formatRupiah(totalOmset7Hari)}</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-[140px] pt-2">
              {dayRevenue.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-[var(--walnut-soft)]">
                    {v > 0 ? Math.round(v / 1000) + "k" : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-[var(--rust)]"
                    style={{ height: `${Math.max(4, (v / maxDayRevenue) * 100)}px` }}
                    title={formatRupiah(v)}
                  />
                  <span className="text-[10px] font-semibold text-[var(--walnut-soft)] uppercase">
                    {last7Days[i].toLocaleDateString("id-ID", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Menu Terlaris (Top 5)</h2>
            {menuTerlaris.length === 0 ? (
              <p className="text-sm text-[var(--walnut-soft)]">Belum ada data penjualan.</p>
            ) : (
              <ol className="divide-y divide-[var(--line)]">
                {menuTerlaris.map(([nama, qty], idx) => (
                  <li key={nama} className="flex items-center justify-between py-2 text-sm">
                    <span>{idx + 1}. {nama}</span>
                    <span className="text-[var(--walnut-soft)]">{qty} terjual</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-2">
            <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Laba Bulan Ini</h2>
            <div className="flex justify-between text-sm">
              <span>Omset bulan ini</span>
              <span className="font-mono">{formatRupiah(omsetBulanIni)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pengeluaran bulan ini (termasuk gaji)</span>
              <span className="font-mono">{formatRupiah(totalExpensesBulanIni)}</span>
            </div>
            <div className="flex justify-between font-bold text-[var(--forest)] pt-2 border-t border-[var(--line)]">
              <span>Laba bersih</span>
              <span className="font-mono">{formatRupiah(labaBulanIni)}</span>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Keuangan Bulan Ini</h2>
              <button
                onClick={() => setShowAddExpense((v) => !v)}
                className="text-sm font-medium text-[var(--rust)] hover:underline"
              >
                {showAddExpense ? "Batal" : "+ Tambah Pengeluaran"}
              </button>
            </div>

            {showAddExpense && (
              <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--cream)] p-3">
                <input
                  type="text"
                  placeholder="Kategori (mis: Belanja Bahan)"
                  value={expKategori}
                  onChange={(e) => setExpKategori(e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Nominal"
                  value={expNominal}
                  onChange={(e) => setExpNominal(e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Keterangan (opsional)"
                  value={expKeterangan}
                  onChange={(e) => setExpKeterangan(e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm"
                />
                <button
                  onClick={handleAddExpense}
                  disabled={savingExpense}
                  className="w-full rounded-lg bg-[var(--forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--forest-dark)] disabled:opacity-60"
                >
                  {savingExpense ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-2">Pemasukan ({paidOrdersThisMonth.length} transaksi)</p>
              {paidOrdersThisMonth.length === 0 ? (
                <p className="text-xs text-[var(--walnut-soft)]">Belum ada pemasukan bulan ini.</p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {paidOrdersThisMonth.map((o) => (
                    <li key={o.id} className="flex justify-between py-1.5 text-sm">
                      <span>{o.kode_pesanan} — {o.customer_name}</span>
                      <span className="text-[var(--green-ok)] font-mono">+{formatRupiah(o.total)}</span>
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
                <p className="text-xs text-[var(--walnut-soft)]">Belum ada pengeluaran bulan ini.</p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {expensesThisMonth.map((e) => (
                    <li key={e.id} className="flex justify-between py-1.5 text-sm">
                      <span>{e.kategori}{e.keterangan ? ` — ${e.keterangan}` : ""}</span>
                      <span className="text-[var(--red)] font-mono">-{formatRupiah(e.nominal)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === "bulanan" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-3">
            <label className="text-xs text-[var(--walnut-soft)] block mb-1">Pilih bulan</label>
            <select
              value={selectedMonth.toISOString()}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm font-medium"
            >
              {monthOptions.map((m) => (
                <option key={m.toISOString()} value={m.toISOString()}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">
              <p className="text-xs text-[var(--walnut-soft)] mb-1">Omset {monthLabel(selectedMonth)}</p>
              <p className="text-xl font-bold font-mono text-[var(--forest)]">{formatRupiah(omsetSelectedMonth)}</p>
              {omsetPerubahanPersen !== null ? (
                <p className={`text-xs font-semibold mt-1 ${omsetPerubahanPersen >= 0 ? "text-[var(--green-ok)]" : "text-[var(--red)]"}`}>
                  {omsetPerubahanPersen >= 0 ? "▲" : "▼"} {Math.abs(omsetPerubahanPersen)}% dari {monthLabel(prevMonthDate)}
                </p>
              ) : (
                <p className="text-xs text-[var(--walnut-soft)] mt-1">Belum ada data bulan sebelumnya untuk dibandingkan.</p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">
              <p className="text-xs text-[var(--walnut-soft)] mb-1">Laba {monthLabel(selectedMonth)}</p>
              <p className="text-xl font-bold font-mono text-[var(--forest)]">{formatRupiah(labaSelectedMonth)}</p>
              <p className="text-xs text-[var(--walnut-soft)] mt-1">Pengeluaran: {formatRupiah(totalExpensesSelectedMonth)}</p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4">
              <p className="text-xs text-[var(--walnut-soft)] mb-1">Jumlah Transaksi</p>
              <p className="text-xl font-bold font-mono text-[var(--forest)]">{ordersSelectedMonth.length}</p>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Menu Terlaris — {monthLabel(selectedMonth)}</h2>
            {menuTerlarisSelectedMonth.length === 0 ? (
              <p className="text-sm text-[var(--walnut-soft)]">Belum ada data penjualan bulan ini.</p>
            ) : (
              <ol className="divide-y divide-[var(--line)]">
                {menuTerlarisSelectedMonth.map(([nama, qty], idx) => (
                  <li key={nama} className="flex items-center justify-between py-2 text-sm">
                    <span>{idx + 1}. {nama}</span>
                    <span className="text-[var(--walnut-soft)]">{qty} terjual</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Rincian Keuangan — {monthLabel(selectedMonth)}</h2>
            <div>
              <p className="text-sm font-medium mb-2">Pemasukan ({ordersSelectedMonth.length} transaksi)</p>
              {ordersSelectedMonth.length === 0 ? (
                <p className="text-xs text-[var(--walnut-soft)]">Tidak ada pemasukan bulan ini.</p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {ordersSelectedMonth.map((o) => (
                    <li key={o.id} className="flex justify-between py-1.5 text-sm">
                      <span>{o.kode_pesanan} — {o.customer_name}</span>
                      <span className="text-[var(--green-ok)] font-mono">+{formatRupiah(o.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Pengeluaran ({expensesSelectedMonth.length} item)</p>
              {expensesSelectedMonth.length === 0 ? (
                <p className="text-xs text-[var(--walnut-soft)]">Tidak ada pengeluaran bulan ini.</p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {expensesSelectedMonth.map((e) => (
                    <li key={e.id} className="flex justify-between py-1.5 text-sm">
                      <span>{e.kategori}{e.keterangan ? ` — ${e.keterangan}` : ""}</span>
                      <span className="text-[var(--red)] font-mono">-{formatRupiah(e.nominal)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-[var(--walnut-soft)] italic">
              Catatan: tombol tambah pengeluaran ada di tab "Harian" — pengeluaran baru selalu tercatat untuk bulan berjalan.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
