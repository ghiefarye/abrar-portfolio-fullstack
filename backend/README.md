# Backend — Portfolio (Flask + MySQL)

Backend REST API untuk portfolio Abrar Ghifari. Menyediakan CRUD untuk
Projects, Experience, Site Settings (profil/bio), dan inbox pesan Contact,
plus login admin dengan JWT.

## 1. Persiapan

1. Jalankan **Laragon** dan pastikan MySQL aktif (port default `3306`).
2. Buka `db.py`, sesuaikan `DB_HOST` / `DB_USER` / `DB_PASSWORD` kalau
   kredensial Laragon kamu berbeda dari default (`root` / password kosong).
   Database `db_portfolio` akan **dibuat otomatis** saat backend dijalankan
   pertama kali — tidak perlu bikin manual di HeidiSQL/phpMyAdmin.

## 2. Install dependency

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt --break-system-packages
```

## 3. Seed data awal (sekali saja)

Membuat akun admin default + mengisi data Projects & Experience yang
sebelumnya ada di `projects.json` / `experiences.json` supaya tidak hilang.

```bash
python seed.py
```

Setelah ini kamu akan punya akun admin:

```
username: admin
password: admin123
```

**Wajib ganti password ini setelah login pertama kali** (lewat halaman
admin, atau langsung update hash di tabel `admin_users`).

## 4. Jalankan backend

```bash
python app.py
```

Backend akan berjalan di `http://localhost:5000`.
Endpoint kesehatan: `http://localhost:5000/api/health`

## 5. Jalankan bersama frontend (1 link)

Frontend Next.js sudah dikonfigurasi (`next.config.ts`) untuk meneruskan
semua request `/api/*` dan `/uploads/*` ke `http://localhost:5000` lewat
**rewrites**. Jadi kamu tetap cukup buka satu alamat di browser:

- `http://localhost:3000` — halaman utama (public)
- `http://localhost:3000/login` — login admin
- `http://localhost:3000/admin` — dashboard admin (CRUD)

Browser tidak pernah langsung menyentuh port 5000; Next.js dev server yang
meneruskannya di belakang layar. Jalankan **dua terminal**:

```bash
# terminal 1
cd backend && python app.py

# terminal 2
cd frontend && npm run dev
```

## Struktur Endpoint API

| Method | Endpoint                       | Auth | Keterangan                        |
|--------|--------------------------------|------|------------------------------------|
| POST   | /api/auth/login                | -    | Login admin, set cookie JWT        |
| POST   | /api/auth/logout               | -    | Hapus cookie                       |
| GET    | /api/auth/me                   | ✔    | Cek sesi admin aktif                |
| GET    | /api/projects                  | -    | List semua project (public)        |
| GET    | /api/projects/<id>              | -    | Detail 1 project                   |
| POST   | /api/projects                  | ✔    | Tambah project                     |
| PUT    | /api/projects/<id>               | ✔    | Update project                     |
| DELETE | /api/projects/<id>               | ✔    | Hapus project                      |
| GET    | /api/experiences                | -    | List semua experience (public)     |
| POST   | /api/experiences                | ✔    | Tambah experience                  |
| PUT    | /api/experiences/<id>            | ✔    | Update experience                  |
| DELETE | /api/experiences/<id>             | ✔    | Hapus experience                   |
| GET    | /api/settings                  | -    | Ambil profil/bio/site config       |
| PUT    | /api/settings                  | ✔    | Update profil/bio/site config      |
| POST   | /api/contact                   | -    | Kirim pesan dari form Contact      |
| GET    | /api/messages                  | ✔    | List pesan masuk                   |
| PATCH  | /api/messages/<id>                | ✔    | Tandai dibaca/belum                |
| DELETE | /api/messages/<id>                 | ✔    | Hapus pesan                        |
| POST   | /api/upload/project-image      | ✔    | Upload gambar project              |
| POST   | /api/upload/profile-image      | ✔    | Upload foto profil                 |
| POST   | /api/upload/resume             | ✔    | Upload CV (PDF)                    |

Semua endpoint yang butuh Auth membaca cookie `admin_token` (httpOnly),
otomatis terkirim oleh browser setelah login lewat halaman `/login`.
