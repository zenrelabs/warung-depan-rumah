'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSettings,
  setSetting,
  getMyProfile,
  getSalaries,
  paySalary,
} from "@/lib/queries";
import { uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { Settings, AdminProfile, Salary } from "@/lib/types";

const THEME_PRESETS: { label: string; value: string; swatch: string }[] = [
  { label: "Hijau", value: "hijau", swatch: "var(--forest)" },
  { label: "Coklat", value: "coklat", swatch: "var(--walnut-soft)" },
  { label: "Biru", value: "biru", swatch: "var(--blue)" },
  { label: "Merah", value: "merah", swatch: "var(--red)" },
  { label: "Ungu", value: "ungu", swatch: "var(--purple)" },
];

export default function PengaturanPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [namaToko, setNamaToko] = useState("");
  const [alamat, setAlamat] = useState("");
  const [wa, setWa] = useState("");
  const [ig, setIg] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [themeColor, setThemeColor] = useState("hijau");
  const [storeOpen, setStoreOpen] = useState(true);
  const [allowOutside, setAllowOutside] = useState(false);

  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [salariesLoading, setSalariesLoading] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const prof = await getMyProfile();
      setProfile(prof);

      const settings: Settings = await getSettings();
      setNamaToko(settings.StoreName || "");
      setAlamat(settings.StoreAddress || "");
      setWa(settings.StorePhone || "");
      setIg(settings.StoreIG || "");
      setLogoUrl(settings.StoreLogoUrl || "");
      setThemeColor(settings.ThemeColor || "hijau");
      setStoreOpen((settings.StoreOpen ?? "true").toLowerCase() === "true");
      setAllowOutside((settings.AllowOrderOutsideHours ?? "false").toLowerCase() === "true");

      if (prof?.role === "super") {
        setSalariesLoading(true);
        try {
          const list = await getSalaries();
          setSalaries(list);
        } finally {
          setSalariesLoading(false);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSaveIdentitas() {
    setSaving(true);
    setMessage(null);
    try {
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        setUploadingLogo(true);
        finalLogoUrl = await uploadImage(logoFile, "logo");
        setUploadingLogo(false);
      }
      await setSetting("StoreName", namaToko);
      await setSetting("StoreAddress", alamat);
      await setSetting("StorePhone", wa);
      await setSetting("StoreIG", ig);
      await setSetting("StoreLogoUrl", finalLogoUrl);
      setLogoUrl(finalLogoUrl);
      setLogoFile(null);
      setLogoPreview(null);
      setMessage("Identitas toko berhasil disimpan.");
    } catch (err) {
      console.error(err);
      setMessage("Gagal menyimpan identitas toko. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleThemeChange(value: string) {
    setThemeColor(value);
    try {
      await setSetting("ThemeColor", value);
      setMessage("Warna tema disimpan.");
    } catch (err) {
      console.error(err);
      setMessage("Gagal menyimpan warna tema.");
    }
  }

  async function handleToggleStoreOpen() {
    const next = !storeOpen;
    setStoreOpen(next);
    try {
      await setSetting("StoreOpen", String(next));
    } catch (err) {
      console.error(err);
      setStoreOpen(!next);
      setMessage("Gagal mengubah status buka/tutup.");
    }
  }

  async function handleToggleAllowOutside() {
    const next = !allowOutside;
    setAllowOutside(next);
    try {
      await setSetting("AllowOrderOutsideHours", String(next));
    } catch (err) {
      console.error(err);
      setAllowOutside(!next);
      setMessage("Gagal mengubah pengaturan jam operasional.");
    }
  }

  async function handlePaySalary(s: Salary) {
    setPayingId(s.id);
    try {
      await paySalary(s);
      setSalaries((prev) =>
        prev.map((x) =>
          x.id === s.id
            ? { ...x, sudah_dibayar: true, tanggal_bayar: new Date().toISOString() }
            : x
        )
      );
    } catch (err) {
      console.error(err);
      setMessage("Gagal menandai gaji sebagai dibayar.");
    } finally {
      setPayingId(null);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) {
    return <div className="p-6 text-[var(--walnut)]">Memuat pengaturan...</div>;
  }

  const isSuper = profile?.role === "super";

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-8 text-[var(--walnut)]">
      <h1 className="font-display text-2xl font-bold text-[var(--forest)]">Pengaturan</h1>

      {message && (
        <div className="rounded-lg border border-[var(--forest-tint)] bg-[var(--cream)] px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {/* IDENTITAS TOKO */}
      <section className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Identitas Toko</h2>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[var(--cream-alt)] overflow-hidden flex items-center justify-center border border-[var(--line)]">
            {logoPreview || logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview || logoUrl}
                alt="Logo toko"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-[var(--walnut-soft)]">Belum ada logo</span>
            )}
          </div>
          <label className="cursor-pointer text-sm font-medium text-[var(--rust)] hover:underline">
            {uploadingLogo ? "Mengupload..." : "Ganti logo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
              disabled={uploadingLogo}
            />
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Toko</label>
            <input
              type="text"
              value={namaToko}
              onChange={(e) => setNamaToko(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
            <input
              type="text"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="cth: 6282315271827"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input
              type="text"
              value={ig}
              onChange={(e) => setIg(e.target.value)}
              placeholder="cth: depan.rumah18"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--white)] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSaveIdentitas}
          disabled={saving}
          className="rounded-lg bg-[var(--forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--forest-dark)] disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Identitas"}
        </button>
      </section>

      {/* WARNA TEMA */}
      <section className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Warna Tema</h2>
        <div className="flex flex-wrap gap-3">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleThemeChange(preset.value)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                themeColor === preset.value
                  ? "border-[var(--forest)] bg-[var(--forest-tint)]"
                  : "border-[var(--line)] bg-[var(--white)]"
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: preset.swatch }}
              />
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {/* TOGGLES */}
      <section className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Status Operasional</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Warung sedang buka</p>
            <p className="text-xs text-[var(--walnut-soft)]">
              Kalau dimatikan, customer tidak bisa memesan.
            </p>
          </div>
          <button
            onClick={handleToggleStoreOpen}
            className={`w-12 h-7 rounded-full transition-colors ${
              storeOpen ? "bg-[var(--green-ok)]" : "bg-[var(--line)]"
            }`}
          >
            <span
              className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                storeOpen ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Izinkan pesan di luar jam operasional</p>
            <p className="text-xs text-[var(--walnut-soft)]">
              Kalau aktif, customer tetap bisa checkout walau warung ditandai tutup.
            </p>
          </div>
          <button
            onClick={handleToggleAllowOutside}
            className={`w-12 h-7 rounded-full transition-colors ${
              allowOutside ? "bg-[var(--green-ok)]" : "bg-[var(--line)]"
            }`}
          >
            <span
              className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                allowOutside ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* PENGGAJIAN - KHUSUS SUPER */}
      <section className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--white)] p-4 md:p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--forest)]">Penggajian</h2>
        {!isSuper ? (
          <p className="text-sm text-[var(--walnut-soft)]">🔒 khusus Super Admin</p>
        ) : salariesLoading ? (
          <p className="text-sm text-[var(--walnut-soft)]">Memuat data gaji...</p>
        ) : salaries.length === 0 ? (
          <p className="text-sm text-[var(--walnut-soft)]">Belum ada data gaji.</p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {salaries.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{s.nama}</p>
                  <p className="text-xs text-[var(--walnut-soft)] font-mono">
                    Rp {s.nominal.toLocaleString("id-ID")}
                    {s.sudah_dibayar && s.tanggal_bayar
                      ? ` · dibayar ${new Date(s.tanggal_bayar).toLocaleDateString("id-ID")}`
                      : ""}
                  </p>
                </div>
                {s.sudah_dibayar ? (
                  <span className="text-xs font-medium text-[var(--green-ok)]">✓ Sudah dibayar</span>
                ) : (
                  <button
                    onClick={() => handlePaySalary(s)}
                    disabled={payingId === s.id}
                    className="rounded-lg bg-[var(--rust)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--rust-dark)] disabled:opacity-60"
                  >
                    {payingId === s.id ? "Memproses..." : "Tandai Dibayar"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LOGOUT */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg border border-[var(--red)] px-4 py-2 text-sm font-medium text-[var(--red)] hover:bg-[var(--red-tint)]"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
