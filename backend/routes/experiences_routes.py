import json

from flask import Blueprint, request, jsonify

import db
import auth

experiences_bp = Blueprint("experiences_bp", __name__, url_prefix="/api/experiences")


def _loads(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return []


def _row_to_experience(row):
    return {
        "id": row["id"],
        "role": row["role"],
        "company": row["company"],
        "type": row["type"],
        "period": row["period"],
        "duration": row["duration"],
        "summary": row["summary"],
        "highlights": _loads(row["highlights"]),
        "image": row["image"],
        "imageAlt": row["image_alt"],
        "monogram": row["monogram"],
        "sortOrder": row["sort_order"],
    }


@experiences_bp.get("")
def list_experiences():
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM experiences ORDER BY sort_order ASC, created_at ASC"
            )
            rows = cur.fetchall()
        return jsonify([_row_to_experience(r) for r in rows])
    finally:
        conn.close()


@experiences_bp.get("/<exp_id>")
def get_experience(exp_id):
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM experiences WHERE id = %s", (exp_id,))
            row = cur.fetchone()
        if not row:
            return jsonify({"error": "Experience tidak ditemukan"}), 404
        return jsonify(_row_to_experience(row))
    finally:
        conn.close()


@experiences_bp.post("")
@auth.login_required
def create_experience():
    data = request.get_json(silent=True) or {}
    exp_id = (data.get("id") or "").strip()
    if not exp_id:
        return jsonify({"error": "id (slug) wajib diisi"}), 400

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM experiences WHERE id = %s", (exp_id,))
            if cur.fetchone():
                return jsonify({"error": "Slug/id experience sudah dipakai"}), 409

            cur.execute(
                """
                INSERT INTO experiences
                    (id, role, company, type, period, duration, summary,
                     highlights, image, image_alt, monogram, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    exp_id,
                    data.get("role", ""),
                    data.get("company", ""),
                    data.get("type", ""),
                    data.get("period", ""),
                    data.get("duration", ""),
                    data.get("summary", ""),
                    json.dumps(data.get("highlights", [])),
                    data.get("image"),
                    data.get("imageAlt", ""),
                    data.get("monogram", ""),
                    data.get("sortOrder", 0),
                ),
            )
        return jsonify({"message": "Experience berhasil dibuat", "id": exp_id}), 201
    finally:
        conn.close()


@experiences_bp.put("/<exp_id>")
@auth.login_required
def update_experience(exp_id):
    data = request.get_json(silent=True) or {}

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM experiences WHERE id = %s", (exp_id,))
            if not cur.fetchone():
                return jsonify({"error": "Experience tidak ditemukan"}), 404

            cur.execute(
                """
                UPDATE experiences SET
                    role = %s, company = %s, type = %s, period = %s, duration = %s,
                    summary = %s, highlights = %s, image = %s, image_alt = %s,
                    monogram = %s, sort_order = %s
                WHERE id = %s
                """,
                (
                    data.get("role", ""),
                    data.get("company", ""),
                    data.get("type", ""),
                    data.get("period", ""),
                    data.get("duration", ""),
                    data.get("summary", ""),
                    json.dumps(data.get("highlights", [])),
                    data.get("image"),
                    data.get("imageAlt", ""),
                    data.get("monogram", ""),
                    data.get("sortOrder", 0),
                    exp_id,
                ),
            )
        return jsonify({"message": "Experience berhasil diupdate"})
    finally:
        conn.close()


@experiences_bp.delete("/<exp_id>")
@auth.login_required
def delete_experience(exp_id):
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM experiences WHERE id = %s", (exp_id,))
            if cur.rowcount == 0:
                return jsonify({"error": "Experience tidak ditemukan"}), 404
        return jsonify({"message": "Experience berhasil dihapus"})
    finally:
        conn.close()
