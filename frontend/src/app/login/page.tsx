"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-foreground/45">
          Admin Panel
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
          Login
        </h1>
        <p className="mt-3 text-sm text-foreground/55">
          Masuk untuk mengelola konten portfolio (Projects, Experience,
          Profil, dan pesan masuk).
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Username
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-foreground/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-foreground/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground/40"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-foreground px-5 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
