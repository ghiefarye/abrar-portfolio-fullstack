"use client";

import { useEffect, useState } from "react";

import {
  createExperience,
  deleteExperience,
  fetchExperiences,
  updateExperience,
  uploadProjectImage,
} from "@/lib/api-client";

interface ExperienceForm {
  id: string;
  role: string;
  company: string;
  type: string;
  period: string;
  duration: string;
  summary: string;
  highlights: string; // 1 baris = 1 poin
  image: string;
  imageAlt: string;
  monogram: string;
}

const EMPTY_FORM: ExperienceForm = {
  id: "",
  role: "",
  company: "",
  type: "",
  period: "",
  duration: "",
  summary: "",
  highlights: "",
  image: "",
  imageAlt: "",
  monogram: "",
};

function toForm(e: any): ExperienceForm {
  return {
    id: e.id,
    role: e.role ?? "",
    company: e.company ?? "",
    type: e.type ?? "",
    period: e.period ?? "",
    duration: e.duration ?? "",
    summary: e.summary ?? "",
    highlights: (e.highlights ?? []).join("\n"),
    image: e.image ?? "",
    imageAlt: e.imageAlt ?? "",
    monogram: e.monogram ?? "",
  };
}

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ExperienceForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setExperiences(await fetchExperiences());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(`Hapus experience "${id}"?`)) return;
    await deleteExperience(id);
    await load();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");

    const payload = {
      id: editing.id.trim(),
      role: editing.role,
      company: editing.company,
      type: editing.type,
      period: editing.period,
      duration: editing.duration,
      summary: editing.summary,
      highlights: editing.highlights
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      image: editing.image || null,
      imageAlt: editing.imageAlt,
      monogram: editing.monogram,
    };

    try {
      const isNew = !experiences.some((exp) => exp.id === editing.id);
      if (isNew) {
        await createExperience(payload);
      } else {
        await updateExperience(editing.id, payload);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    if (!editing) return;
    setUploading(true);
    try {
      const { src } = await uploadProjectImage(file);
      setEditing({ ...editing, image: src });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  if (editing) {
    const isNew = !experiences.some((exp) => exp.id === editing.id);
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => setEditing(null)}
          className="mb-6 text-sm text-foreground/50 hover:text-foreground"
        >
          ← Kembali ke daftar
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? "Tambah Experience" : `Edit Experience — ${editing.id}`}
        </h1>

        <form onSubmit={handleSave} className="mt-8 flex flex-col gap-5">
          <Field label="Slug / ID (unik)">
            <input
              required
              disabled={!isNew}
              value={editing.id}
              onChange={(e) => setEditing({ ...editing, id: e.target.value })}
              placeholder="contoh: internship-startup-x"
              className="input disabled:opacity-50"
            />
          </Field>

          <Field label="Role / Jabatan">
            <input
              required
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              className="input"
            />
          </Field>

          <Field label="Institusi / Perusahaan">
            <input
              required
              value={editing.company}
              onChange={(e) =>
                setEditing({ ...editing, company: e.target.value })
              }
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipe (contoh: Education, Program, Internship)">
              <input
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Monogram (2-3 huruf, kalau tidak ada foto)">
              <input
                value={editing.monogram}
                onChange={(e) =>
                  setEditing({ ...editing, monogram: e.target.value })
                }
                maxLength={3}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Periode">
              <input
                value={editing.period}
                onChange={(e) =>
                  setEditing({ ...editing, period: e.target.value })
                }
                placeholder="2024 — Present"
                className="input"
              />
            </Field>
            <Field label="Durasi/status">
              <input
                value={editing.duration}
                onChange={(e) =>
                  setEditing({ ...editing, duration: e.target.value })
                }
                placeholder="Ongoing"
                className="input"
              />
            </Field>
          </div>

          <Field label="Ringkasan">
            <textarea
              required
              rows={3}
              value={editing.summary}
              onChange={(e) =>
                setEditing({ ...editing, summary: e.target.value })
              }
              className="input resize-none"
            />
          </Field>

          <Field label="Highlights (1 baris = 1 poin)">
            <textarea
              rows={4}
              value={editing.highlights}
              onChange={(e) =>
                setEditing({ ...editing, highlights: e.target.value })
              }
              className="input resize-none"
            />
          </Field>

          <Field label="Foto (opsional, kalau kosong pakai monogram)">
            <div className="flex items-center gap-3">
              {editing.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editing.image}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <label className="cursor-pointer rounded-lg border border-foreground/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                {uploading ? "Mengupload..." : "Upload foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </label>
              {editing.image && (
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, image: "" })}
                  className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive"
                >
                  Hapus foto
                </button>
              )}
            </div>
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-foreground px-6 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-background disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-foreground/15 px-6 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
            >
              Batal
            </button>
          </div>
        </form>

        <style jsx global>{`
          .input {
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid color-mix(in srgb, var(--foreground) 15%, transparent);
            background: transparent;
            padding: 0.6rem 0.9rem;
            font-size: 0.875rem;
            outline: none;
          }
          .input:focus {
            border-color: color-mix(in srgb, var(--foreground) 40%, transparent);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Experience</h1>
        <button
          onClick={() => setEditing({ ...EMPTY_FORM })}
          className="rounded-full bg-foreground px-5 py-2.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-background"
        >
          + Tambah Experience
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-foreground/50">Memuat...</p>
      ) : experiences.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/50">
          Belum ada experience.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between rounded-xl border border-foreground/10 px-5 py-4"
            >
              <div>
                <p className="font-semibold">{exp.role}</p>
                <p className="text-xs text-foreground/50">
                  {exp.company} · {exp.period}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(toForm(exp))}
                  className="rounded-lg border border-foreground/15 px-3.5 py-2 text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
        {label}
      </label>
      {children}
    </div>
  );
}
