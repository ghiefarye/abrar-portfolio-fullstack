import json

from flask import Blueprint, request, jsonify

import db
import auth

projects_bp = Blueprint("projects_bp", __name__, url_prefix="/api/projects")

JSON_FIELDS = [
    "contributions",
    "impact_stats",
    "impacts",
    "highlights",
    "tech_stack",
]


def _loads(value):
    if value is None:
        return None
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return None


def _row_to_project(row, images):
    return {
        "id": row["id"],
        "number": row["number"],
        "name": row["name"],
        "role": row["role"],
        "category": row["category"],
        "featured": bool(row["featured"]),
        "experienceId": row["experience_id"],
        "experienceLabel": row["experience_label"],
        "summary": row["summary"],
        "contributions": _loads(row["contributions"]) or [],
        "impactSummary": row["impact_summary"],
        "impactStats": _loads(row["impact_stats"]) or [],
        "impacts": _loads(row["impacts"]) or [],
        "highlights": _loads(row["highlights"]) or [],
        "techStack": _loads(row["tech_stack"]) or [],
        "images": images,
        "link": row["link"],
        "sortOrder": row["sort_order"],
    }


def _fetch_images(cur, project_id):
    cur.execute(
        "SELECT src, alt, label, description FROM project_images "
        "WHERE project_id = %s ORDER BY sort_order ASC, id ASC",
        (project_id,),
    )
    return cur.fetchall()


@projects_bp.get("")
def list_projects():
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC"
            )
            rows = cur.fetchall()
            result = []
            for row in rows:
                images = _fetch_images(cur, row["id"])
                result.append(_row_to_project(row, images))
        return jsonify(result)
    finally:
        conn.close()


@projects_bp.get("/<project_id>")
def get_project(project_id):
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "Project tidak ditemukan"}), 404
            images = _fetch_images(cur, project_id)
        return jsonify(_row_to_project(row, images))
    finally:
        conn.close()


def _save_images(cur, project_id, images):
    cur.execute("DELETE FROM project_images WHERE project_id = %s", (project_id,))
    for idx, img in enumerate(images or []):
        cur.execute(
            "INSERT INTO project_images (project_id, src, alt, label, description, sort_order) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (
                project_id,
                img.get("src"),
                img.get("alt", ""),
                img.get("label", ""),
                img.get("description", ""),
                idx,
            ),
        )


@projects_bp.post("")
@auth.login_required
def create_project():
    data = request.get_json(silent=True) or {}
    project_id = (data.get("id") or "").strip()
    if not project_id:
        return jsonify({"error": "id (slug) wajib diisi"}), 400

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM projects WHERE id = %s", (project_id,))
            if cur.fetchone():
                return jsonify({"error": "Slug/id project sudah dipakai"}), 409

            cur.execute(
                """
                INSERT INTO projects
                    (id, number, name, role, category, featured, experience_id,
                     experience_label, summary, contributions, impact_summary,
                     impact_stats, impacts, highlights, tech_stack, link, sort_order)
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    project_id,
                    data.get("number", ""),
                    data.get("name", ""),
                    data.get("role", ""),
                    data.get("category", "fullstack"),
                    1 if data.get("featured") else 0,
                    data.get("experienceId"),
                    data.get("experienceLabel"),
                    data.get("summary", ""),
                    json.dumps(data.get("contributions", [])),
                    data.get("impactSummary", ""),
                    json.dumps(data.get("impactStats", [])),
                    json.dumps(data.get("impacts", [])),
                    json.dumps(data.get("highlights", [])),
                    json.dumps(data.get("techStack", [])),
                    data.get("link"),
                    data.get("sortOrder", 0),
                ),
            )
            _save_images(cur, project_id, data.get("images", []))
        return jsonify({"message": "Project berhasil dibuat", "id": project_id}), 201
    finally:
        conn.close()


@projects_bp.put("/<project_id>")
@auth.login_required
def update_project(project_id):
    data = request.get_json(silent=True) or {}

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM projects WHERE id = %s", (project_id,))
            if not cur.fetchone():
                return jsonify({"error": "Project tidak ditemukan"}), 404

            cur.execute(
                """
                UPDATE projects SET
                    number = %s, name = %s, role = %s, category = %s, featured = %s,
                    experience_id = %s, experience_label = %s, summary = %s,
                    contributions = %s, impact_summary = %s, impact_stats = %s,
                    impacts = %s, highlights = %s, tech_stack = %s, link = %s,
                    sort_order = %s
                WHERE id = %s
                """,
                (
                    data.get("number", ""),
                    data.get("name", ""),
                    data.get("role", ""),
                    data.get("category", "fullstack"),
                    1 if data.get("featured") else 0,
                    data.get("experienceId"),
                    data.get("experienceLabel"),
                    data.get("summary", ""),
                    json.dumps(data.get("contributions", [])),
                    data.get("impactSummary", ""),
                    json.dumps(data.get("impactStats", [])),
                    json.dumps(data.get("impacts", [])),
                    json.dumps(data.get("highlights", [])),
                    json.dumps(data.get("techStack", [])),
                    data.get("link"),
                    data.get("sortOrder", 0),
                    project_id,
                ),
            )
            _save_images(cur, project_id, data.get("images", []))
        return jsonify({"message": "Project berhasil diupdate"})
    finally:
        conn.close()


@projects_bp.delete("/<project_id>")
@auth.login_required
def delete_project(project_id):
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM projects WHERE id = %s", (project_id,))
            if cur.rowcount == 0:
                return jsonify({"error": "Project tidak ditemukan"}), 404
        return jsonify({"message": "Project berhasil dihapus"})
    finally:
        conn.close()
