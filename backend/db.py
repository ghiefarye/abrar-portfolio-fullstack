"""
db.py - Konfigurasi database terpusat.

Development lokal : pakai Laragon, semua nilai default di bawah.
Production (Railway): Railway inject env vars DB_HOST, DB_PORT, DB_USER,
                      DB_PASSWORD, DB_NAME, dan JWT_SECRET secara otomatis.

Pola auto-create: konek dulu ke MySQL TANPA nama database, jalankan
CREATE DATABASE IF NOT EXISTS, baru reconnect ke database itu.
"""

import os
import pymysql
from pymysql.cursors import DictCursor

# ------------------------------------------------------------------
# KONFIGURASI - baca dari environment variable, fallback ke nilai lokal
# ------------------------------------------------------------------
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", 3306))
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")   # default Laragon: kosong
DB_NAME = os.environ.get("DB_NAME", "db_portfolio")

# Secret untuk JWT admin login
JWT_SECRET = os.environ.get("JWT_SECRET", "ganti-dengan-secret-kamu-sendiri-sebelum-deploy")
JWT_ALGO = "HS256"
JWT_EXPIRES_HOURS = 24

# ------------------------------------------------------------------


def _connect_no_db():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True,
    )


def get_connection():
    """Konek langsung ke database db_portfolio."""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True,
    )


SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    """,
    """
    CREATE TABLE IF NOT EXISTS experiences (
        id VARCHAR(120) PRIMARY KEY,
        role VARCHAR(255),
        company VARCHAR(255),
        type VARCHAR(100),
        period VARCHAR(100),
        duration VARCHAR(100),
        summary TEXT,
        highlights JSON,
        image VARCHAR(255),
        image_alt VARCHAR(255),
        monogram VARCHAR(10),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    """,
    """
    CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(150) PRIMARY KEY,
        number VARCHAR(10),
        name VARCHAR(255),
        role VARCHAR(255),
        category VARCHAR(50),
        featured TINYINT(1) DEFAULT 0,
        experience_id VARCHAR(120),
        experience_label VARCHAR(255),
        summary TEXT,
        contributions JSON,
        impact_summary TEXT,
        impact_stats JSON,
        impacts JSON,
        highlights JSON,
        tech_stack JSON,
        link VARCHAR(255),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
    """,
    """
    CREATE TABLE IF NOT EXISTS project_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(150) NOT NULL,
        src VARCHAR(500),
        alt VARCHAR(255),
        label VARCHAR(255),
        description TEXT,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
    """,
    """
    CREATE TABLE IF NOT EXISTS site_settings (
        id INT PRIMARY KEY,
        site_url VARCHAR(255),
        name VARCHAR(255),
        short_name VARCHAR(255),
        role VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        language VARCHAR(10),
        locale VARCHAR(10),
        location_city VARCHAR(100),
        location_region VARCHAR(100),
        location_country VARCHAR(100),
        location_country_code VARCHAR(10),
        email VARCHAR(255),
        social_github VARCHAR(255),
        social_linkedin VARCHAR(255),
        social_instagram VARCHAR(255),
        project_archive VARCHAR(255),
        profile_image VARCHAR(255),
        resume_file VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    """,
    """
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    """,
]


def init_db():
    """Auto-create database (kalau belum ada) + semua tabel + default row."""
    conn = _connect_no_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                        f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    finally:
        conn.close()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            for stmt in SCHEMA_STATEMENTS:
                cur.execute(stmt)

            # Pastikan selalu ada 1 baris site_settings (id=1)
            cur.execute("SELECT COUNT(*) AS c FROM site_settings WHERE id = 1")
            if cur.fetchone()["c"] == 0:
                cur.execute(
                    """
                    INSERT INTO site_settings
                        (id, site_url, name, short_name, role, title, description,
                         language, locale, location_city, location_region,
                         location_country, location_country_code, email,
                         social_github, social_linkedin, social_instagram,
                         project_archive, profile_image, resume_file)
                    VALUES
                        (1, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                         %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        "https://abrarghifari.dev",
                        "Abrar Ghifari",
                        "Abrar Ghifari",
                        "Full-Stack Web Developer",
                        "Abrar Ghifari | Full-Stack Web Developer",
                        "Explore Abrar Ghifari's portfolio.",
                        "en",
                        "en_US",
                        "Jombang",
                        "East Java",
                        "Indonesia",
                        "ID",
                        "abrarghifari@example.com",
                        "https://github.com/abrarghifari",
                        "https://linkedin.com/in/abrarghifari",
                        "https://instagram.com/abrarghifari",
                        "https://abrarghifari.dev/projects",
                        "/uploads/profile/profile.jpg",
                        "/uploads/profile/resume.pdf",
                    ),
                )
    finally:
        conn.close()
