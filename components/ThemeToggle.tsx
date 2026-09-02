"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setTheme(stored === "dark" ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  const isAdminPage = pathname?.startsWith("/admin") && pathname !== "/admin/login";

  return (
    <button
      onClick={toggleTheme}
      title="Ganti mode terang/gelap"
      className={`fixed left-3.5 z-50 w-10 h-10 rounded-full bg-[var(--white)] border border-[var(--line)] shadow-md flex items-center justify-center text-lg ${
        isAdminPage ? "bottom-[76px] md:bottom-3.5" : "bottom-3.5"
      }`}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
