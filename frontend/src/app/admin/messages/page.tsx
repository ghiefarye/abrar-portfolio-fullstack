"use client";

import { useEffect, useState } from "react";

import { deleteMessage, fetchMessages, markMessage } from "@/lib/api-client";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setMessages(await fetchMessages());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRead(id: number, isRead: boolean) {
    await markMessage(id, !isRead);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus pesan ini?")) return;
    await deleteMessage(id);
    await load();
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Pesan Masuk{" "}
        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
            {unreadCount} baru
          </span>
        )}
      </h1>
      <p className="mt-2 text-sm text-foreground/55">
        Pesan yang dikirim lewat form Contact di halaman utama.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-foreground/50">Memuat...</p>
      ) : messages.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/50">Belum ada pesan.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border px-5 py-4 ${
                m.isRead
                  ? "border-foreground/10"
                  : "border-foreground/25 bg-foreground/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {m.name}{" "}
                    {!m.isRead && (
                      <span className="ml-1 inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" />
                    )}
                  </p>
                  <p className="text-xs text-foreground/50">{m.email}</p>
                </div>
                <p className="shrink-0 text-xs text-foreground/40">
                  {m.createdAt ? new Date(m.createdAt).toLocaleString("id-ID") : ""}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/75">
                {m.message}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggleRead(m.id, m.isRead)}
                  className="rounded-lg border border-foreground/15 px-3.5 py-2 text-xs font-semibold"
                >
                  {m.isRead ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="rounded-lg border border-destructive/30 px-3.5 py-2 text-xs font-semibold text-destructive"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
