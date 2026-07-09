"use client";

import { useEffect, useState } from "react";

import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
  uploadProjectImage,
} from "@/lib/api-client";

interface ImageItem {
  src: string;
  alt: string;
  label: string;
  description: string;
}

interface ImpactStat {
  value: string;
  label: string;
}

interface ProjectFormState {
  id: string;
  number: string;
  name: string;
  role: string;
  category: string;
  featured: boolean;
  experienceId: string;
  experienceLabel: string;
  summary: string;
  contributions: string; // satu baris = satu item
  impactSummary: string;
  impactStats: ImpactStat[];
  impacts: string; // satu baris = satu item
  highlights: string; // satu baris = satu item
  techStack: string; // dipisah koma
  link: string;
  images: ImageItem[];
}

const EMPTY_FORM: ProjectFormState = {
  id: "",
  number: "",
  name: "",
  role: "",
  category: "fullstack",
  featured: false,
  experienceId: "",
  experienceLabel: "",
  summary: "",
  contributions: "",
  impactSummary: "",
  impactStats: [],
  impacts: "",
  highlights: "",
  techStack: "",
  link: "",
  images: [],
};

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function projectToForm(p: any): ProjectFormState {
  return {
    id: p.id,
    number: p.number ?? "",
    name: p.name ?? "",
    role: p.role ?? "",
    category: p.category ?? "fullstack",
    featured: Boolean(p.featured),
    experienceId: p.experienceId ?? "",
    experienceLabel: p.experienceLabel ?? "",
    summary: p.summary ?? "",
    contributions: (p.contributions ?? []).join("\n"),
    impactSummary: p.impactSummary ?? "",
    impactStats: p.impactStats ?? [],
    impacts: (p.impacts ?? []).join("\n"),
    highlights: (p.highlights ?? []).join("\n"),
    techStack: (p.techStack ?? []).join(", "),
    link: p.link ?? "",
    images: p.images ?? [],
  };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  async function loadProjects() {
    setLoading(true);
    try {
      setProjects(await fetchProjects());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function startCreate() {
    setEditing({ ...EMPTY_FORM });
    setError("");
  }

  function startEdit(p: any) {
    setEditing(projectToForm(p));
    setError("");
  }

  async function handleDelete(id: string) {
    if (!confirm(`Hapus project "${id}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    await deleteProject(id);
    await loadProjects();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");

    const payload = {
      id: editing.id.trim(),
      number: editing.number,
      name: editing.name,
      role: editing.role,
      category: editing.category,
      featured: editing.featured,
      experienceId: editing.experienceId || null,
      experienceLabel: editing.experienceLabel || null,
      summary: editing.summary,
      contributions: linesToArray(editing.contributions),
      impactSummary: editing.impactSummary,
      impactStats: editing.impactStats,
      impacts: linesToArray(editing.impacts),
      highlights: linesToArray(editing.highlights),
      techStack: editing.techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      link: editing.link || null,
      images: editing.images,
    };

    try {
      const isNew = !projects.some((p) => p.id === editing.id);
      if (isNew) {
        await createProject(payload);
      } else {
        await updateProject(editing.id, payload);
      }
      setEditing(null);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan project");
    } finally {
      setSaving(false);
    }
  }

  function updateImage(index: number, patch: Partial<ImageItem>) {
    if (!editing) return;
    const images = [...editing.images];
    images[index] = { ...images[index], ...patch };
    setEditing({ ...editing, images });
  }

  function removeImage(index: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      images: editing.images.filter((_, i) => i !== index),
    });
  }

  function addImageRow() {
    if (!editing) return;
    setEditing({
      ...editing,
      images: [
        ...editing.images,
        { src: "", alt: "", label: "", description: "" },
      ],
    });
  }

  async function handleImageUpload(index: number, file: File) {
    setUploadingIndex(index);
    try {
      const { src } = await uploadProjectImage(file);
      updateImage(index, { src });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadingIndex(null);
    }
  }

  function updateImpactStat(index: number, patch: Partial<ImpactStat>) {
    if (!editing) return;
    const stats = [...editing.impactStats];
    stats[index] = { ...stats[index], ...patch };
    setEditing({ ...editing, impactStats: stats });
  }

  function removeImpactStat(index: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      impactStats: editing.impactStats.filter((_, i) => i !== index),
    });
  }

  function addImpactStat() {
    if (!editing) return;
    setEditing({
      ...editing,
      impactStats: [...editing.impactStats, { value: "", label: "" }],
    });
  }

  if (editing) {
    const isNew = !projects.some((p) => p.id === editing.id);
    return (
      <div className="max-w-3xl">
        <button
          onClick={() => setEditing(null)}
          className="mb-6 text-sm text-foreground/50 hover:text-foreground"
        >
          ← Kembali ke daftar
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? "Tambah Project" : `Edit Project — ${editing.id}`}
        </h1>

        <form onSubmit={handleSave} className="mt-8 flex flex-col gap-5">
          <Field label="Slug / ID (unik, tanpa spasi)">
            <input
              required
              disabled={!isNew}
              value={editing.id}
              onChange={(e) => setEditing({ ...editing, id: e.target.value })}
              placeholder="contoh: sistem-inventaris-toko"
              className="input disabled:opacity-50"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nomor urut">
              <input
                value={editing.number}
                onChange={(e) =>
                  setEditing({ ...editing, number: e.target.value })
                }
                placeholder="01"
                className="input"
              />
            </Field>
            <Field label="Kategori">
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
                className="input"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Fullstack</option>
              </select>
            </Field>
          </div>

          <Field label="Nama Project">
            <input
              required
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="input"
            />
          </Field>

          <Field label="Role kamu di project ini">
            <input
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              placeholder="Fullstack Developer"
              className="input"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.featured}
              onChange={(e) =>
                setEditing({ ...editing, featured: e.target.checked })
              }
            />
            Tampilkan sebagai Featured Project di halaman utama
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Field label="ID Experience terkait (opsional)">
              <input
                value={editing.experienceId}
                onChange={(e) =>
                  setEditing({ ...editing, experienceId: e.target.value })
                }
                placeholder="petik-jombang"
                className="input"
              />
            </Field>
            <Field label="Label Experience terkait">
              <input
                value={editing.experienceLabel}
                onChange={(e) =>
                  setEditing({ ...editing, experienceLabel: e.target.value })
                }
                placeholder="PeTIK Jombang · Final Project"
                className="input"
              />
            </Field>
          </div>

          <Field label="Ringkasan / summary">
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

          <Field label="Kontribusi (1 baris = 1 poin)">
            <textarea
              rows={4}
              value={editing.contributions}
              onChange={(e) =>
                setEditing({ ...editing, contributions: e.target.value })
              }
              className="input resize-none"
            />
          </Field>

          <Field label="Ringkasan dampak / impact summary">
            <textarea
              rows={2}
              value={editing.impactSummary}
              onChange={(e) =>
                setEditing({ ...editing, impactSummary: e.target.value })
              }
              className="input resize-none"
            />
          </Field>

          <Field label="Statistik dampak (angka + label)">
            <div className="flex flex-col gap-2">
              {editing.impactStats.map((stat, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={stat.value}
                    onChange={(e) =>
                      updateImpactStat(idx, { value: e.target.value })
                    }
                    placeholder="100%"
                    className="input"
                  />
                  <input
                    value={stat.label}
                    onChange={(e) =>
                      updateImpactStat(idx, { label: e.target.value })
                    }
                    placeholder="Paperless"
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={() => removeImpactStat(idx)}
                    className="shrink-0 rounded-lg border border-destructive/30 px-3 text-sm text-destructive"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImpactStat}
                className="w-fit rounded-lg border border-foreground/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60"
              >
                + Tambah statistik
              </button>
            </div>
          </Field>

          <Field label="Dampak / impacts (1 baris = 1 poin)">
            <textarea
              rows={3}
              value={editing.impacts}
              onChange={(e) =>
                setEditing({ ...editing, impacts: e.target.value })
              }
              className="input resize-none"
            />
          </Field>

          <Field label="Highlights (1 baris = 1 poin)">
            <textarea
              rows={3}
              value={editing.highlights}
              onChange={(e) =>
                setEditing({ ...editing, highlights: e.target.value })
              }
              className="input resize-none"
            />
          </Field>

          <Field label="Tech stack (pisahkan dengan koma)">
            <input
              value={editing.techStack}
              onChange={(e) =>
                setEditing({ ...editing, techStack: e.target.value })
              }
              placeholder="Flask, MySQL, React"
              className="input"
            />
          </Field>

          <Field label="Link demo/live project (opsional)">
            <input
              value={editing.link}
              onChange={(e) => setEditing({ ...editing, link: e.target.value })}
              placeholder="https://..."
              className="input"
            />
          </Field>

          <Field label="Gambar project">
            <div className="flex flex-col gap-4">
              {editing.images.map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-foreground/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    {img.src && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-16 w-24 rounded-lg object-cover"
                      />
                    )}
                    <label className="cursor-pointer rounded-lg border border-foreground/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                      {uploadingIndex === idx ? "Mengupload..." : "Upload gambar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(idx, file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="ml-auto rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive"
                    >
                      Hapus gambar
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <input
                      value={img.label}
                      onChange={(e) =>
                        updateImage(idx, { label: e.target.value })
                      }
                      placeholder="Label (contoh: Dashboard Overview)"
                      className="input"
                    />
                    <input
                      value={img.alt}
                      onChange={(e) => updateImage(idx, { alt: e.target.value })}
                      placeholder="Alt text"
                      className="input"
                    />
                  </div>
                  <textarea
                    value={img.description}
                    onChange={(e) =>
                      updateImage(idx, { description: e.target.value })
                    }
                    placeholder="Deskripsi singkat gambar"
                    rows={2}
                    className="input mt-2 resize-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addImageRow}
                className="w-fit rounded-lg border border-foreground/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60"
              >
                + Tambah gambar
              </button>
            </div>
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-foreground px-6 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-background disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Project"}
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
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <button
          onClick={startCreate}
          className="rounded-full bg-foreground px-5 py-2.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-background"
        >
          + Tambah Project
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-foreground/50">Memuat...</p>
      ) : projects.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/50">
          Belum ada project. Klik &quot;Tambah Project&quot; untuk mulai.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-foreground/10 px-5 py-4"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-foreground/50">
                  {p.id} · {p.category} {p.featured ? "· Featured" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(p)}
                  className="rounded-lg border border-foreground/15 px-3.5 py-2 text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
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
