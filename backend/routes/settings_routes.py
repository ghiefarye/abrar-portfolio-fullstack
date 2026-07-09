from flask import Blueprint, request, jsonify

import db
import auth

settings_bp = Blueprint("settings_bp", __name__, url_prefix="/api/settings")


def _row_to_settings(row):
    return {
        "siteUrl": row["site_url"],
        "name": row["name"],
        "shortName": row["short_name"],
        "role": row["role"],
        "title": row["title"],
        "description": row["description"],
        "language": row["language"],
        "locale": row["locale"],
        "location": {
            "city": row["location_city"],
            "region": row["location_region"],
            "country": row["location_country"],
            "countryCode": row["location_country_code"],
        },
        "email": row["email"],
        "social": {
            "github": row["social_github"],
            "linkedin": row["social_linkedin"],
            "instagram": row["social_instagram"],
        },
        "projectArchive": row["project_archive"],
        "profileImage": row["profile_image"],
        "resumeFile": row["resume_file"],
    }


@settings_bp.get("")
def get_settings():
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM site_settings WHERE id = 1")
            row = cur.fetchone()
        return jsonify(_row_to_settings(row))
    finally:
        conn.close()


@settings_bp.put("")
@auth.login_required
def update_settings():
    data = request.get_json(silent=True) or {}
    location = data.get("location", {}) or {}
    social = data.get("social", {}) or {}

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE site_settings SET
                    site_url = %s, name = %s, short_name = %s, role = %s, title = %s,
                    description = %s, language = %s, locale = %s,
                    location_city = %s, location_region = %s, location_country = %s,
                    location_country_code = %s, email = %s,
                    social_github = %s, social_linkedin = %s, social_instagram = %s,
                    project_archive = %s, profile_image = %s, resume_file = %s
                WHERE id = 1
                """,
                (
                    data.get("siteUrl", ""),
                    data.get("name", ""),
                    data.get("shortName", ""),
                    data.get("role", ""),
                    data.get("title", ""),
                    data.get("description", ""),
                    data.get("language", "en"),
                    data.get("locale", "en_US"),
                    location.get("city", ""),
                    location.get("region", ""),
                    location.get("country", ""),
                    location.get("countryCode", ""),
                    data.get("email", ""),
                    social.get("github", ""),
                    social.get("linkedin", ""),
                    social.get("instagram", ""),
                    data.get("projectArchive", ""),
                    data.get("profileImage"),
                    data.get("resumeFile"),
                ),
            )
        return jsonify({"message": "Pengaturan berhasil diupdate"})
    finally:
        conn.close()
