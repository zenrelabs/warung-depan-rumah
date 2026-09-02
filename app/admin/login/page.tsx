"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Email atau password salah.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="font-display text-2xl font-semibold text-[var(--forest-dark)] mb-1">
          Masuk sebagai Admin
        </h1>
        <p className="text-sm text-[var(--walnut-soft)] mb-6">
          Warung Depan Rumah — E-Kasir
        </p>

        {error && (
          <div className="mb-4 text-sm text-[var(--red)] bg-[var(--red-tint)] border border-[var(--red)]/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--walnut-soft)] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--walnut-soft)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--forest)] text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}