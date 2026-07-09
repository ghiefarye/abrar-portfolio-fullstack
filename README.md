# Portfolio Abrar Ghifari — Fullstack (Next.js + Flask + MySQL)

Backend CRUD sudah ditambahkan ke portfolio kamu. Sekarang **satu alamat**
melayani semuanya:

- `http://localhost:3000` → halaman utama (public, datanya live dari database)
- `http://localhost:3000/login` → login admin
- `http://localhost:3000/admin` → dashboard admin (CRUD Projects, Experience,
  Profil/Settings, dan Pesan Masuk dari form Contact)

Browser **tidak pernah** menyentuh port 5000 secara langsung — Next.js
meneruskan (rewrites) semua panggilan `/api/*` dan `/uploads/*` ke backend
Flask di belakang layar. Jadi dari sisi user, memang cuma ada 1 link.

## Struktur folder

```
abrar-portfolio-fullstack/
├── backend/     ← Flask + MySQL (lihat backend/README.md)
└── frontend/    ← Next.js portfolio (yang tadinya kamu upload, sudah dimodifikasi)
```

## Cara menjalankan (WAJIB 2 langkah, 2 terminal)

### 1. Backend (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt --break-system-packages

python seed.py                 # sekali saja: bikin admin + isi data lama
python app.py                  # jalan di http://localhost:5000
```

Pastikan Laragon (MySQL) sudah aktif sebelum ini. Database `db_portfolio`
dibuat otomatis, tidak perlu bikin manual.

Login default setelah seeding:
```
username: admin
password: admin123
```
**Ganti password ini lewat halaman admin setelah login pertama kali** kalau
sudah ada fitur ganti password, atau update manual di tabel `admin_users`
untuk sekarang (fitur ganti password belum ada di versi ini — kasih tahu
saya kalau mau saya tambahkan).

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev                    # jalan di http://localhost:3000
```

Buka `http://localhost:3000` — semua konten (Projects, Experience, foto
profil, dsb) sekarang datang dari database, bukan file JSON statis lagi.

## Yang berubah dari project asli

- **Data source**: `src/data/projects.json` & `experiences.json` tidak
  dipakai lagi untuk render (isinya sudah dipindah ke MySQL lewat
  `backend/seed.py`). File-nya masih ada di folder tapi tidak diimpor.
- **`src/lib/api.ts`** (baru) — fetch data dari Flask untuk Server
  Component (`page.tsx`, `/projects`, `/projects/[slug]`, `sitemap.ts`).
- **`src/lib/api-client.ts`** (baru) — fetch dari browser untuk login,
  admin CRUD, upload gambar, dan submit form Contact.
- **`next.config.ts`** — ditambah `rewrites()` supaya `/api/*` dan
  `/uploads/*` diteruskan ke Flask.
- **`src/middleware.ts`** (baru) — redirect ke `/login` kalau belum login
  dan mencoba akses `/admin/*`.
- **`src/app/login/`, `src/app/admin/*`** (baru) — halaman login & admin
  dashboard.
- **HeroSection, ContactSection, ExperienceSection, ProjectsSection** —
  sekarang menerima data lewat props (dari database) alih-alih hardcode /
  import JSON statis. Contact section juga sekarang punya form beneran
  (sebelumnya cuma link mailto).
- **`src/app/projects/page.tsx` & `[slug]/page.tsx`** — fetch dari API,
  jadi `dynamic = "force-dynamic"` (selalu data terbaru, tidak di-cache
  statis saat build).

## Keterbatasan yang perlu kamu tahu

- Ini setup **development lokal**. Untuk production (VPS/deploy), kredensial
  di `backend/db.py` dan `JWT_SECRET` wajib diganti, dan cookie
  `secure=True` perlu diaktifkan (lihat komentar di `auth_routes.py`).
- Belum ada halaman "ganti password admin" di UI — kalau perlu, beri tahu
  saya, gampang ditambahkan.
- Upload gambar disimpan di folder lokal `backend/uploads/`, bukan cloud
  storage. Cukup untuk pemakaian lokal/VPS kecil.
