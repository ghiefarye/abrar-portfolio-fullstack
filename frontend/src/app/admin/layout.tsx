"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { getMe, logout } from "@/lib/api-client";

const NAV_ITEMS = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experiences", label: "Experience" },
  { href: "/admin/settings", label: "Profil & Settings" },
  { href: "/admin/messages", label: "Pesan Masuk" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => setUsername(res.username))
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await logout().catch(() => {});
    router.push("/login");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <p className="text-sm text-foreground/50">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col border-r border-foreground/10 px-6 py-8">
        <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-foreground/40">
          Admin Panel
        </p>
        <p className="mt-2 text-lg font-semibold">Abrar Ghifari</p>
        {username && (
          <p className="mt-0.5 text-xs text-foreground/45">
            Masuk sebagai {username}
          </p>
        )}

        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/65 hover:bg-foreground/8"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-8">
          <Link
            href="/"
            target="_blank"
            className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-foreground/55 hover:bg-foreground/8"
          >
            Lihat situs ↗
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-10 sm:px-12">
        {children}
      </main>
    </div>
  );
}
