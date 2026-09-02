import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { MenuItem, Order, Settings, Expense, Salary, AdminProfile } from "@/lib/types";

/* ============ SETTINGS ============ */
export async function getSettings(): Promise<Settings> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw error;
  const obj: Settings = {};
  data.forEach((row) => {
    (obj as Record<string, string>)[row.key] = row.value ?? "";
  });
  return obj;
}

export async function setSetting(key: string, value: string) {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}

/* ============ MENU ============ */
export async function getMenu(): Promise<MenuItem[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("menu")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return data as MenuItem[];
}

export async function saveMenuItem(item: Partial<MenuItem>) {
  const supabase = createBrowserClient();
  if (item.id) {
    const { error } = await supabase
      .from("menu")
      .update({
        nama: item.nama,
        kategori: item.kategori,
        harga: item.harga,
        deskripsi: item.deskripsi,
        status: item.status,
        rekomendasi: item.rekomendasi,
        foto: item.foto || undefined,
        stok: item.stok,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("menu").insert({
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga,
      deskripsi: item.deskripsi,
      status: item.status || "tersedia",
      rekomendasi: item.rekomendasi || false,
      foto: item.foto || null,
      stok: item.stok,
    });
    if (error) throw error;
  }
}

export async function deleteMenuItem(id: number) {
  const supabase = createBrowserClient();
  const { error } = await supabase.from("menu").delete().eq("id", id);
  if (error) throw error;
}

export const DEFAULT_MENU_ITEMS = [
  // Healthy Food
  {
    nama: "Salad",
    kategori: "Healthy Food",
    harga: 22000,
    deskripsi: "Aneka sayuran segar seperti kol ungu, selada, wortel, timun, jagung, tomat, dengan protein telur dan ayam, dipadukan dengan dressing pilihan.",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Salad Roll",
    kategori: "Healthy Food",
    harga: 22000,
    deskripsi: "Aneka sayuran segar seperti kol ungu, selada, wortel, timun, jagung, tomat, dengan protein ayam, dibungkus dengan rice pepper dan dipadukan dengan dressing pilihan.",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },

  // Roti Maryam
  {
    nama: "Roti Maryam + Karih Ayam",
    kategori: "Roti Maryam",
    harga: 28000,
    deskripsi: "Roti maryam dipadukan dengan karih ayam dan acar timun.",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Roti Maryam Coklat Keju",
    kategori: "Roti Maryam",
    harga: 13000,
    deskripsi: "Roti maryam dipadukan dengan toping coklat keju.",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Roti Maryam Keju",
    kategori: "Roti Maryam",
    harga: 12000,
    deskripsi: "Roti maryam dipadukan dengan toping keju dan skm.",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Roti Maryam Manis",
    kategori: "Roti Maryam",
    harga: 10000,
    deskripsi: "Roti maryam dipadukan dengan toping manis glaze coklat/tiramisu.",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },

  // Camilan
  {
    nama: "Pisang Roll",
    kategori: "Camilan",
    harga: 12000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Pisang Nugget",
    kategori: "Camilan",
    harga: 12000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Tela-Tela",
    kategori: "Camilan",
    harga: 10000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Kentang Goreng",
    kategori: "Camilan",
    harga: 10000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },

  // Es Teh
  {
    nama: "Es Teh Tawar",
    kategori: "Es Teh",
    harga: 4000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Teh Manis",
    kategori: "Es Teh",
    harga: 5000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Teh Leci",
    kategori: "Es Teh",
    harga: 8000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Teh Lemon",
    kategori: "Es Teh",
    harga: 8000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Teh Vanila",
    kategori: "Es Teh",
    harga: 8000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Teh Jeruk Nipis",
    kategori: "Es Teh",
    harga: 8000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },

  // Es Susu
  {
    nama: "Es Susu Coklat",
    kategori: "Es Susu",
    harga: 13000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Susu Pisang",
    kategori: "Es Susu",
    harga: 13000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Susu Vanila",
    kategori: "Es Susu",
    harga: 13000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Susu Strawberry",
    kategori: "Es Susu",
    harga: 13000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Susu Coco Pandan",
    kategori: "Es Susu",
    harga: 12000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
  {
    nama: "Es Susu Kopi",
    kategori: "Es Susu",
    harga: 10000,
    deskripsi: "",
    status: "tersedia" as const,
    rekomendasi: false,
    stok: null,
    foto: null,
  },
];

export async function seedDefaultMenu(): Promise<number> {
  const supabase = createBrowserClient();
  const { data: existing, error: fetchErr } = await supabase.from("menu").select("nama");
  if (fetchErr) throw fetchErr;

  const existingNames = new Set((existing || []).map((item) => item.nama.toLowerCase().trim()));
  const toInsert = DEFAULT_MENU_ITEMS.filter((item) => !existingNames.has(item.nama.toLowerCase().trim()));

  if (toInsert.length === 0) return 0;

  const { error: insertErr } = await supabase.from("menu").insert(toInsert);
  if (insertErr) throw insertErr;

  return toInsert.length;
}

/* ============ ORDERS ============ */
export async function getOrders(): Promise<Order[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getOrdersByIds(ids: string[]): Promise<Order[]> {
  const supabase = createBrowserClient();
  const numericIds = ids.map((id) => Number(id.replace("ORD-", "")));
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .in("id", numericIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

type CreateOrderPayload = {
  customerName: string;
  phone?: string;
  note?: string;
  items: { id: number; name: string; qty: number; price: number }[];
  payment: string;
};

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const supabase = createBrowserClient();
  const total = payload.items.reduce((s, it) => s + it.price * it.qty, 0);

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: payload.customerName || "Pelanggan",
      phone: payload.phone || null,
      note: payload.note || null,
      items: payload.items,
      total,
      payment_method: payload.payment,
      paid: false,
      status: "Diproses",
    })
    .select()
    .single();
  if (error) throw error;

  await decrementStockForItems(payload.items);

  return data as Order;
}

async function decrementStockForItems(items: { id: number; qty: number }[]) {
  const supabase = createBrowserClient();
  for (const it of items) {
    const { data: menuRow } = await supabase
      .from("menu")
      .select("stok, status")
      .eq("id", it.id)
      .single();
    if (!menuRow || menuRow.stok === null) continue;
    const newStok = Math.max(0, Number(menuRow.stok) - it.qty);
    const updates: Partial<MenuItem> = { stok: newStok };
    if (newStok === 0 && menuRow.status === "tersedia") {
      updates.status = "habis";
    }
    await supabase.from("menu").update(updates).eq("id", it.id);
  }
}

export async function updateOrderStatus(id: number, status: Order["status"]) {
  const supabase = createBrowserClient();
  const updates: Partial<Order> = { status, paid: status === "Selesai" };
  const { error } = await supabase.from("orders").update(updates).eq("id", id);
  if (error) throw error;
}

/* ============ KEUANGAN ============ */
export async function getExpenses(): Promise<Expense[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("tanggal", { ascending: false });
  if (error) throw error;
  return data as Expense[];
}

export async function addExpense(kategori: string, nominal: number, keterangan: string) {
  const supabase = createBrowserClient();
  const { error } = await supabase.from("expenses").insert({ kategori, nominal, keterangan });
  if (error) throw error;
}

export async function getSalaries(): Promise<Salary[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from("salaries").select("*").order("nama");
  if (error) throw error;
  return data as Salary[];
}

export async function paySalary(salary: Salary) {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("salaries")
    .update({ sudah_dibayar: true, tanggal_bayar: new Date().toISOString() })
    .eq("id", salary.id);
  if (error) throw error;
  await addExpense("Gaji", salary.nominal, "Gaji " + salary.nama);
}

/* ============ ADMIN PROFILE ============ */
export async function getMyProfile(): Promise<AdminProfile | null> {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return null;
  return data as AdminProfile;
}

export async function deleteOrder(id: number) {
  const supabase = createBrowserClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}