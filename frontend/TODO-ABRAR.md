# TODO — Sebelum Deploy

File ini berisi daftar aset & data placeholder yang perlu Anda ganti sebelum portofolio ini siap dipakai.

## 1. Wajib diganti (site tidak akan tampil benar tanpa ini)

- [ ] **`public/profile.jpg`** — ganti dengan foto profil asli (rasio potret, disarankan 900×1200px atau lebih).
- [ ] **`public/resume.pdf`** — ganti dengan CV asli Anda.
- [ ] **`src/lib/site.ts`** — bagian `social` (github, linkedin, instagram) masih pakai URL tebakan
      `github.com/abrarghifari`, dll. Ganti dengan username asli Anda.
- [ ] Email placeholder `abrarghifari@example.com` muncul di 2 tempat:
      - `src/sections/hero-section.tsx` (link mailto ikon amplop)
      - `src/sections/contact-section.tsx` (email besar di footer)
      Ganti dengan email aktif Anda.

## 2. Sangat disarankan diganti

- [ ] **`public/projects/sppd-puskesmas/*.png`** — 3 gambar saat ini adalah placeholder abu-abu
      bertuliskan "PLACEHOLDER". Ganti dengan screenshot asli aplikasi SPPD:
      - `dashboard.png`
      - `form-pengajuan.png`
      - `detail-riwayat.png`
      (Bisa ganti nama file & path-nya asal disesuaikan juga di `src/data/projects.json`.)
- [ ] **`src/data/experiences.json`** — field `"period"` untuk PeTIK Jombang masih ditulis
      `"2024 — Present"` (tebakan). Sesuaikan dengan tanggal mulai Anda yang sebenarnya.
- [ ] Foto/logo untuk kartu Journey (PeTIK Jombang, Google Student Ambassador, Telkom University)
      saat ini `image: null` sehingga otomatis pakai fallback monogram (PJ / GSA / TU) — sudah
      terlihat rapi apa adanya, tapi jika Anda punya foto/logo yang representatif, tambahkan file
      ke `public/` dan isi field `"image"` di `experiences.json`.

## 3. Opsional

- [ ] **`siteConfig.url`** di `src/lib/site.ts` — masih `https://abrarghifari.dev` (placeholder).
      Ganti setelah Anda punya domain, atau ganti ke URL Vercel default.
- [ ] Tambah proyek lain jika ada (struktur sudah mendukung banyak proyek — lihat contoh
      di `src/data/projects.json`, cukup duplikasi objeknya).
- [ ] Sertifikasi individual (Dicoding, Google for Education, dll.) saat ini dirangkum sebagai
      `highlights` di dalam kartu Journey "Google Student Ambassador" dan "PeTIK Jombang".
      Jika ingin tiap sertifikat tampil sebagai kartu terpisah, beri tahu saya — saya bisa
      membuatkan section "Certifications" baru.

## Cara menjalankan secara lokal

```bash
pnpm install   # atau npm install
pnpm dev       # atau npm run dev
```

Buka http://localhost:3000
