"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Layers, LayoutDashboard, ListMusic, LogOut, Menu, Music2, X } from "lucide-react";
import type { UserDTO } from "@/lib/types";
import { api, ToastProvider } from "./ui";

const nav = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/canciones", label: "Canciones", icon: ListMusic },
  { href: "/dashboard/popurris", label: "Popurrís", icon: Layers },
];

const ROLE: Record<string, string> = { pianista: "Pianista", vocalista: "Vocalista", director: "Director" };

export default function DashboardShell({ user, children }: { user: UserDTO; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    await api("/api/auth/logout", "POST").catch(() => {});
    router.push("/");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const content = (
    <div className="flex h-full flex-col bg-indigo-950 text-indigo-100">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Music2 className="h-5 w-5 text-amber-300" />
          </span>
          Alabanza Manager
        </Link>
        <button className="rounded-lg p-1 lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white/15 text-white" : "text-indigo-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <n.icon className={`h-5 w-5 ${active ? "text-amber-300" : ""}`} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-2xl bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-400 text-sm font-semibold text-indigo-950">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-indigo-300">{ROLE[user.role] ?? user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          disabled={leaving}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" /> {leaving ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen lg:pl-64">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{content}</aside>

        {/* mobile */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Abrir menú" className="rounded-lg p-2 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <span className="flex items-center gap-2 font-semibold text-slate-900">
            <Music2 className="h-5 w-5 text-indigo-600" /> Alabanza Manager
          </span>
          <span className="w-9" />
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
            <div className="relative h-full w-72 max-w-[85%]">{content}</div>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
