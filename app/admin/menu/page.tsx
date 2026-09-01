"use client";

import { useEffect, useRef, useState } from "react";
import { getMenu, saveMenuItem, deleteMenuItem } from "@/lib/queries";
import { uploadImage } from "@/lib/storage";
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

type FormState = {
  id?: number;
  nama: string;
  kategori: string;
  harga: string;
  deskripsi: string;
  status: MenuItem["status"];
  rekomendasi: boolean;
  stok: string;
  foto: string;
};

const emptyForm: FormState = {
  nama: "",
  kategori: "",
  harga: "",
  deskripsi: "",
  status: "tersedia",
  rekomendasi: false,
  stok: "",
  foto: "",
};

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  function load() {
    setLoading(true);
    getMenu()
      .then(setMenu)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showForm && !dialog.open) {
      dialog.showModal();
    } else if (!showForm && dialog.open) {
      dialog.close();
    }
  }, [showForm]);

  const categories = Array.from(new Set(menu.map((m) => m.kategori).filter(Boolean))) as string[];

  function openAdd() {
    setForm(emptyForm);
    setPendingFile(null);
    setPreview("");
    setShowForm(true);
  }

  function openEdit(m: MenuItem) {
    setForm({
      id: m.id,
      nama: m.nama,
      kategori: m.kategori || "",
      harga: String(m.harga),
      deskripsi: m.deskripsi || "",
      status: m.status,
      rekomendasi: m.rekomendasi,
      stok: m.stok === null ? "" : String(m.stok),
      foto: m.foto || "",
    });
    setPendingFile(null);
    setPreview(m.foto || "");
    setShowForm(true);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!form.nama.trim() || !form.kategori.trim() || !form.harga) {
      alert("Nama, kategori, dan harga wajib diisi");
      return;
    }
    setSaving(true);
    try {
      let fotoUrl = form.foto;
      if (pendingFile) {
        fotoUrl = await uploadImage(pendingFile, "menu");
      }
      await saveMenuItem({
        id: form.id,
        nama: form.nama.trim(),
        kategori: form.kategori.trim(),
        harga: Number(form.harga) || 0,
        deskripsi: form.deskripsi.trim(),
        status: form.status,
        rekomendasi: form.rekomendasi,
        stok: form.stok === "" ? null : Number(form.stok),
        foto: fotoUrl,
      });
      setShowForm(false);
      load();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus menu ini secara permanen?")) return;
    try {
      await deleteMenuItem(id);
      load();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F3A23] mb-1">Kelola Menu</h1>
          <p className="text-sm text-[#6E5A47]">Tambah, ubah, atau tandai status menu</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#C1652F] text-white font-semibold text-sm rounded-lg px-4 py-2"
        >
          + Tambah Menu
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6E5A47]">Memuat...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-[#6E5A47] border-b border-[#E4D9C2]">
                <th className="p-3"></th>
                <th className="p-3">Nama</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Stok</th>
                <th className="p-3">Status</th>
                <th className="p-3">Rekomendasi</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {menu.map((m) => (
                <tr key={m.id} className="border-b border-[#E4D9C2] last:border-0">
                  <td className="p-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFD2BC] flex items-center justify-center overflow-hidden text-lg" style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}>
                      {m.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.foto} alt={m.nama} className="w-full h-full object-cover" />
                      ) : (
                        CAT_ICON[m.kategori || ""] || "🍽"
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold">{m.nama}</div>
                    <div className="text-xs text-[#6E5A47]">{m.deskripsi}</div>
                  </td>
                  <td className="p-3">{m.kategori}</td>
                  <td className="p-3 font-mono">{rupiah(m.harga)}</td>
                  <td className="p-3 font-mono">{m.stok === null ? "—" : m.stok}</td>
                  <td className="p-3">
                    <span
                      className={
                        "text-xs font-bold px-2.5 py-1 rounded-full " +
                        (m.status === "tersedia"
                          ? "bg-[#DDEBDC] text-[#3E7A46]"
                          : "bg-[#F5DEDC] text-[#B23A34]")
                      }
                    >
                      {m.status === "tersedia" ? "Tersedia" : "Habis"}
                    </span>
                  </td>
                  <td className="p-3">{m.rekomendasi ? "⭐" : "-"}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(m)} className="text-[#6E5A47] px-1">
                      ✎
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-[#6E5A47] px-1">
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setShowForm(false)}
        className="rounded-2xl p-0 w-full max-w-md backdrop:bg-black/40 m-auto"
      >
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#1F3A23]">
              {form.id ? "Edit Menu" : "Tambah Menu"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-[#6E5A47]">
              ✕
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[#6E5A47] mb-1">Foto Menu</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#F6EFE2] border border-dashed border-[#E4D9C2] flex items-center justify-center overflow-hidden text-2xl" style={{ width: 64, height: 64, minWidth: 64, minHeight: 64 }}>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  CAT_ICON[form.kategori] || "🍽"
                )}
              </div>
              <input type="file" accept="image/*" onChange={onFileChange} className="text-xs" />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#6E5A47] mb-1">Nama Menu</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-[#6E5A47] mb-1">Kategori</label>
              <input
                list="catList"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm"
                placeholder="Ketik/pilih kategori"
              />
              <datalist id="catList">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6E5A47] mb-1">Harga (Rp)</label>
              <input
                type="number"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
                className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-[#6E5A47] mb-1">Stok</label>
              <input
                type="number"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
                placeholder="Kosongkan jika tak dihitung"
                className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6E5A47] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as MenuItem["status"] })
                }
                className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm"
              >
                <option value="tersedia">Tersedia</option>
                <option value="habis">Habis Sementara</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#6E5A47] mb-1">Deskripsi</label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="w-full rounded-lg border border-[#E4D9C2] px-3 py-2 text-sm min-h-[64px]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold mb-5">
            <input
              type="checkbox"
              checked={form.rekomendasi}
              onChange={(e) => setForm({ ...form, rekomendasi: e.target.checked })}
            />
            Tandai sebagai rekomendasi/terlaris
          </label>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#E4D9C2]"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#C1652F] text-white disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}