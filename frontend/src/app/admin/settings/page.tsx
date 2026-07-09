"use client";

import { useEffect, useState } from "react";

import {
  fetchSettings,
  updateCredentials,
  updateSettings,
  uploadProfileImage,
  uploadResume,
} from "@/lib/api-client";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [credentialsForm, setCredentialsForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [credentialsSaved, setCredentialsSaved] = useState("");
  const [credentialsError, setCredentialsError] = useState("");

  useEffect(() => {
    fetchSettings()
      .then(setForm)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateSettings(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    try {
      const { src } = await uploadProfileImage(file);
      setForm({ ...form, profileImage: src });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleResumeUpload(file: File) {
    setUploadingResume(true);
    try {
      const { src } = await uploadResume(file);
      setForm({ ...form, resumeFile: src });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadingResume(false);
    }
  }

  async function handleCredentialsSave(e: React.FormEvent) {
    e.preventDefault();
    setCredentialsError("");
    setCredentialsSaved("");

    const { currentPassword, newUsername, newPassword, confirmNewPassword } =
      credentialsForm;

    if (!newUsername.trim() && !newPassword) {
      setCredentialsError("Isi username baru dan/atau password baru");
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      setCredentialsError("Konfirmasi password baru tidak cocok");
      return;
    }

    setSavingCredentials(true);
    try {
      const res = await updateCredentials({
        currentPassword,
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword || undefined,
      });
      setCredentialsSaved(`Berhasil! Username sekarang: ${res.username}`);
      setCredentialsForm({
        currentPassword: "",
        newUsername: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      setCredentialsError(
        err instanceof Error ? err.message : "Gagal mengubah kredensial",
      );
    } finally {
      setSavingCredentials(false);
    }
  }

  if (loading || !form) {
    return <p className="text-sm text-foreground/50">Memuat...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Profil &amp; Settings
      </h1>
      <p className="mt-2 text-sm text-foreground/55">
        Konten ini dipakai di Hero section, footer Contact, dan metadata SEO
        halaman utama.
      </p>

      <form onSubmit={handleSave} className="mt-8 flex flex-col gap-5">
        <Field label="Nama lengkap">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Nama pendek (ditampilkan di hero, contoh: 'Abrar Ghifari')">
          <input
            value={form.shortName}
            onChange={(e) => setForm({ ...form, shortName: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Role / Jabatan">
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Email kontak">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Kota">
            <input
              value={form.location.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: { ...form.location, city: e.target.value },
                })
              }
              className="input"
            />
          </Field>
          <Field label="Provinsi/Region">
            <input
              value={form.location.region}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: { ...form.location, region: e.target.value },
                })
              }
              className="input"
            />
          </Field>
        </div>

        <Field label="GitHub URL">
          <input
            value={form.social.github}
            onChange={(e) =>
              setForm({ ...form, social: { ...form.social, github: e.target.value } })
            }
            className="input"
          />
        </Field>
        <Field label="LinkedIn URL">
          <input
            value={form.social.linkedin}
            onChange={(e) =>
              setForm({
                ...form,
                social: { ...form.social, linkedin: e.target.value },
              })
            }
            className="input"
          />
        </Field>
        <Field label="Instagram URL">
          <input
            value={form.social.instagram}
            onChange={(e) =>
              setForm({
                ...form,
                social: { ...form.social, instagram: e.target.value },
              })
            }
            className="input"
          />
        </Field>

        <Field label="Deskripsi singkat (untuk SEO)">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
          />
        </Field>

        <Field label="Foto profil">
          <div className="flex items-center gap-3">
            {form.profileImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.profileImage}
                alt=""
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <label className="cursor-pointer rounded-lg border border-foreground/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">
              {uploadingPhoto ? "Mengupload..." : "Upload foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
              />
            </label>
          </div>
        </Field>

        <Field label="CV / Resume (PDF)">
          <div className="flex items-center gap-3">
            {form.resumeFile && (
              <a
                href={form.resumeFile}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline text-foreground/60"
              >
                Lihat CV saat ini
              </a>
            )}
            <label className="cursor-pointer rounded-lg border border-foreground/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">
              {uploadingResume ? "Mengupload..." : "Upload CV"}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeUpload(file);
                }}
              />
            </label>
          </div>
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && (
          <p className="text-sm text-emerald-600">
            Tersimpan! Refresh halaman utama untuk melihat perubahan.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-fit rounded-full bg-foreground px-6 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-background disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      <hr className="my-10 border-foreground/10" />

      <h2 className="text-xl font-semibold tracking-tight">Akun Admin</h2>
      <p className="mt-2 text-sm text-foreground/55">
        Ganti username dan/atau password login admin. Password saat ini wajib
        diisi untuk konfirmasi.
      </p>

      <form
        onSubmit={handleCredentialsSave}
        className="mt-6 flex flex-col gap-5"
      >
        <Field label="Password saat ini">
          <input
            type="password"
            value={credentialsForm.currentPassword}
            onChange={(e) =>
              setCredentialsForm({
                ...credentialsForm,
                currentPassword: e.target.value,
              })
            }
            className="input"
            autoComplete="current-password"
          />
        </Field>

        <Field label="Username baru (opsional)">
          <input
            value={credentialsForm.newUsername}
            onChange={(e) =>
              setCredentialsForm({
                ...credentialsForm,
                newUsername: e.target.value,
              })
            }
            className="input"
            autoComplete="username"
          />
        </Field>

        <Field label="Password baru (opsional, min. 6 karakter)">
          <input
            type="password"
            value={credentialsForm.newPassword}
            onChange={(e) =>
              setCredentialsForm({
                ...credentialsForm,
                newPassword: e.target.value,
              })
            }
            className="input"
            autoComplete="new-password"
          />
        </Field>

        <Field label="Konfirmasi password baru">
          <input
            type="password"
            value={credentialsForm.confirmNewPassword}
            onChange={(e) =>
              setCredentialsForm({
                ...credentialsForm,
                confirmNewPassword: e.target.value,
              })
            }
            className="input"
            autoComplete="new-password"
          />
        </Field>

        {credentialsError && (
          <p className="text-sm text-destructive">{credentialsError}</p>
        )}
        {credentialsSaved && (
          <p className="text-sm text-emerald-600">{credentialsSaved}</p>
        )}

        <button
          type="submit"
          disabled={savingCredentials}
          className="mt-2 w-fit rounded-full bg-foreground px-6 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-background disabled:opacity-50"
        >
          {savingCredentials ? "Menyimpan..." : "Ganti Kredensial"}
        </button>
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
