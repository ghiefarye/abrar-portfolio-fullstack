"""
seed.py - Jalankan sekali setelah setup database untuk:
1. Membuat akun admin default
2. Mengisi data Projects & Experience dari file JSON lama (biar tidak hilang)

Cara pakai:
    python seed.py
"""

import json

import db
import auth

DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin123"  # WAJIB diganti setelah login pertama!

PROJECTS_SEED = [
    {
        "id": "sppd-puskesmas-pulolor",
        "number": "01",
        "name": "Aplikasi SPPD Puskesmas Pulolor",
        "role": "Fullstack Developer",
        "category": "fullstack",
        "featured": True,
        "experienceId": "petik-jombang",
        "experienceLabel": "PeTIK Jombang · Final Project",
        "summary": (
            "Sistem digital untuk menyederhanakan proses administrasi Surat "
            "Perintah Perjalanan Dinas (SPPD) di Puskesmas Pulolor, Jombang — "
            "menggantikan alur manual berbasis kertas dengan pengajuan, "
            "approval, dan pelacakan status secara digital."
        ),
        "contributions": [
            "Merancang alur kerja digital menggantikan proses SPPD manual berbasis kertas",
            "Mengembangkan sistem end-to-end mulai dari database, backend, hingga antarmuka pengguna",
            "Mendesain dashboard admin dan pegawai dengan tampilan bersih dan mudah dipahami",
            "Melakukan deployment ke VPS dengan Nginx sebagai reverse proxy dan konfigurasi systemd service",
            "Mengintegrasikan AI (Google Gemini, Trae AI) dalam proses optimasi kode dan UI/UX",
        ],
        "impactSummary": (
            "Mendigitalkan proses administrasi perjalanan dinas yang sebelumnya "
            "manual, mempercepat approval dan mengurangi risiko dokumen hilang."
        ),
        "impactStats": [
            {"value": "1", "label": "Puskesmas"},
            {"value": "100%", "label": "Paperless"},
        ],
        "impacts": [
            "Mengurangi waktu pemrosesan pengajuan SPPD dari manual menjadi digital",
            "Mempermudah pelacakan status dan riwayat perjalanan dinas pegawai",
            "Menyediakan dokumentasi digital yang terpusat dan mudah diaudit",
        ],
        "highlights": [
            "Form pengajuan SPPD digital dengan validasi otomatis",
            "Dashboard status dan riwayat perjalanan dinas",
            "Sistem approval bertingkat",
            "Deployment production-ready dengan Nginx reverse proxy",
        ],
        "techStack": [
            "Laravel",
            "PHP",
            "MySQL",
            "Bootstrap",
            "Tailwind CSS",
            "Nginx",
            "Gunicorn",
            "VPS Deployment",
        ],
        "images": [
            {
                "src": "/projects/sppd-puskesmas/dashboard.png",
                "alt": "SPPD dashboard overview",
                "label": "Dashboard Overview",
                "description": "Ringkasan pengajuan, status persetujuan, dan riwayat perjalanan dinas.",
            },
            {
                "src": "/projects/sppd-puskesmas/form-pengajuan.png",
                "alt": "SPPD submission form",
                "label": "Form Pengajuan",
                "description": "Form digital untuk pengajuan Surat Perintah Perjalanan Dinas.",
            },
            {
                "src": "/projects/sppd-puskesmas/detail-riwayat.png",
                "alt": "SPPD history and detail view",
                "label": "Riwayat & Detail",
                "description": "Halaman detail dan pelacakan status setiap pengajuan SPPD.",
            },
        ],
        "link": None,
    }
]

EXPERIENCES_SEED = [
    {
        "id": "petik-jombang",
        "role": "Software Development Student",
        "company": "PeTIK Jombang · Jurusan Pengembangan Perangkat Lunak",
        "type": "Education",
        "period": "2024 — Present",
        "duration": "Ongoing",
        "summary": (
            "Menempuh pendidikan di jurusan Pengembangan Perangkat Lunak (PPL), "
            "membangun fondasi full-stack web development dari perancangan "
            "antarmuka hingga sistem backend production-ready."
        ),
        "highlights": [
            "Full-stack curriculum: PHP, Laravel, MySQL",
            "Final Project Web Design — Certificate of Appreciation (PeTIK x YBM PLN)",
            "Membangun Aplikasi SPPD untuk Puskesmas Pulolor",
            "Deployment ke VPS dengan Nginx & systemd",
        ],
        "image": None,
        "imageAlt": "Abrar Ghifari during his studies at PeTIK Jombang",
        "monogram": "PJ",
    },
    {
        "id": "google-student-ambassador",
        "role": "Active Participant",
        "company": "Google Student Ambassador 2026",
        "type": "Program",
        "period": "2026",
        "duration": "Ongoing",
        "summary": (
            "Terpilih sebagai peserta aktif program Google Student Ambassador, "
            "memperluas wawasan teknologi AI dan cloud serta membangun jaringan "
            "profesional di tingkat nasional."
        ),
        "highlights": [
            'Certificate of Attendance — Workshop "Work Smarter, Not Harder"',
            "Siswa Tersertifikasi Gemini (Tingkat Universitas)",
            "Akselerasi Karier dan Produktivitas dengan Gemini",
            "Belajar Dasar Cloud dan Gen AI di AWS",
        ],
        "image": None,
        "imageAlt": "Abrar Ghifari as a Google Student Ambassador",
        "monogram": "GSA",
    },
    {
        "id": "telkom-university",
        "role": "Incoming Informatics Engineering Student",
        "company": "Telkom University, Bandung",
        "type": "Target",
        "period": "2026 — Onward",
        "duration": "Planned",
        "summary": (
            "Berencana melanjutkan studi ke jurusan Teknik Informatika di "
            "Telkom University untuk memperdalam fondasi keilmuan di bidang "
            "teknologi informasi."
        ),
        "highlights": [
            "Memperdalam fondasi computer science",
            "Riset dan pengembangan software berskala besar",
            "Memperluas jaringan profesional di Bandung",
            "Melanjutkan proyek open-source & AI-assisted development",
        ],
        "image": None,
        "imageAlt": "Telkom University Bandung, Abrar Ghifari's planned university",
        "monogram": "TU",
    },
]


def seed_admin(cur):
    cur.execute(
        "SELECT COUNT(*) AS c FROM admin_users WHERE username = %s",
        (DEFAULT_ADMIN_USERNAME,),
    )
    if cur.fetchone()["c"] > 0:
        print(f"[skip] Admin '{DEFAULT_ADMIN_USERNAME}' sudah ada.")
        return

    cur.execute(
        "INSERT INTO admin_users (username, password_hash) VALUES (%s, %s)",
        (DEFAULT_ADMIN_USERNAME, auth.hash_password(DEFAULT_ADMIN_PASSWORD)),
    )
    print(
        f"[ok] Admin dibuat -> username: {DEFAULT_ADMIN_USERNAME} / "
        f"password: {DEFAULT_ADMIN_PASSWORD} (GANTI SEGERA setelah login!)"
    )


def seed_experiences(cur):
    for idx, exp in enumerate(EXPERIENCES_SEED):
        cur.execute("SELECT id FROM experiences WHERE id = %s", (exp["id"],))
        if cur.fetchone():
            print(f"[skip] Experience '{exp['id']}' sudah ada.")
            continue
        cur.execute(
            """
            INSERT INTO experiences
                (id, role, company, type, period, duration, summary,
                 highlights, image, image_alt, monogram, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                exp["id"],
                exp["role"],
                exp["company"],
                exp["type"],
                exp["period"],
                exp["duration"],
                exp["summary"],
                json.dumps(exp["highlights"]),
                exp["image"],
                exp["imageAlt"],
                exp["monogram"],
                idx,
            ),
        )
        print(f"[ok] Experience '{exp['id']}' ditambahkan.")


def seed_projects(cur):
    for idx, p in enumerate(PROJECTS_SEED):
        cur.execute("SELECT id FROM projects WHERE id = %s", (p["id"],))
        if cur.fetchone():
            print(f"[skip] Project '{p['id']}' sudah ada.")
            continue
        cur.execute(
            """
            INSERT INTO projects
                (id, number, name, role, category, featured, experience_id,
                 experience_label, summary, contributions, impact_summary,
                 impact_stats, impacts, highlights, tech_stack, link, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                p["id"],
                p["number"],
                p["name"],
                p["role"],
                p["category"],
                1 if p["featured"] else 0,
                p["experienceId"],
                p["experienceLabel"],
                p["summary"],
                json.dumps(p["contributions"]),
                p["impactSummary"],
                json.dumps(p["impactStats"]),
                json.dumps(p["impacts"]),
                json.dumps(p["highlights"]),
                json.dumps(p["techStack"]),
                p["link"],
                idx,
            ),
        )
        for img_idx, img in enumerate(p["images"]):
            cur.execute(
                "INSERT INTO project_images (project_id, src, alt, label, description, sort_order) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (
                    p["id"],
                    img["src"],
                    img["alt"],
                    img["label"],
                    img["description"],
                    img_idx,
                ),
            )
        print(f"[ok] Project '{p['id']}' ditambahkan.")


def main():
    print("Menyiapkan database...")
    db.init_db()

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            seed_admin(cur)
            seed_experiences(cur)
            seed_projects(cur)
    finally:
        conn.close()

    print("\nSelesai! Jalankan backend dengan: python app.py")


if __name__ == "__main__":
    main()
