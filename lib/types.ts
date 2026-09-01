export type MenuItem = {
  id: number;
  nama: string;
  kategori: string | null;
  harga: number;
  deskripsi: string | null;
  status: "tersedia" | "habis";
  rekomendasi: boolean;
  foto: string | null;
  stok: number | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: number;
  kode_pesanan: string;
  customer_name: string;
  phone: string | null;
  note: string | null;
  items: OrderItem[];
  total: number;
  payment_method: string | null;
  paid: boolean;
  status: "Diproses" | "Selesai" | "Dibatalkan";
  bukti_bayar: string | null;
  invoice_url: string | null;
  created_at: string;
};

export type AdminProfile = {
  id: string;
  nama: string;
  role: "admin" | "super";
  created_at: string;
};

export type Expense = {
  id: number;
  kategori: string;
  nominal: number;
  keterangan: string | null;
  tanggal: string;
};

export type Salary = {
  id: number;
  nama: string;
  nominal: number;
  sudah_dibayar: boolean;
  tanggal_bayar: string | null;
};

export type Settings = {
  StoreOpen?: string;
  StoreName?: string;
  StoreAddress?: string;
  StorePhone?: string;
  StoreIG?: string;
  StoreLogoUrl?: string;
  ThemeColor?: string;
  AllowOrderOutsideHours?: string;
};