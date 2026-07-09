from flask import Blueprint, request, jsonify

import db
import auth

messages_bp = Blueprint("messages_bp", __name__, url_prefix="/api")


@messages_bp.post("/contact")
def submit_contact():
    """Endpoint publik dipanggil dari form Contact di halaman utama."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()
    subject = (data.get("subject") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Nama, email, dan pesan wajib diisi"}), 400

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO contact_messages (name, email, subject, message) "
                "VALUES (%s, %s, %s, %s)",
                (name, email, subject, message),
            )
        return jsonify({"message": "Pesan berhasil dikirim, terima kasih!"}), 201
    finally:
        conn.close()


@messages_bp.get("/messages")
@auth.login_required
def list_messages():
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM contact_messages ORDER BY created_at DESC")
            rows = cur.fetchall()
        return jsonify(
            [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "email": r["email"],
                    "subject": r["subject"],
                    "message": r["message"],
                    "isRead": bool(r["is_read"]),
                    "createdAt": r["created_at"].isoformat()
                    if r["created_at"]
                    else None,
                }
                for r in rows
            ]
        )
    finally:
        conn.close()


@messages_bp.patch("/messages/<int:msg_id>")
@auth.login_required
def mark_message(msg_id):
    data = request.get_json(silent=True) or {}
    is_read = 1 if data.get("isRead", True) else 0

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE contact_messages SET is_read = %s WHERE id = %s",
                (is_read, msg_id),
            )
            if cur.rowcount == 0:
                return jsonify({"error": "Pesan tidak ditemukan"}), 404
        return jsonify({"message": "Status pesan diupdate"})
    finally:
        conn.close()


@messages_bp.delete("/messages/<int:msg_id>")
@auth.login_required
def delete_message(msg_id):
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM contact_messages WHERE id = %s", (msg_id,))
            if cur.rowcount == 0:
                return jsonify({"error": "Pesan tidak ditemukan"}), 404
        return jsonify({"message": "Pesan berhasil dihapus"})
    finally:
        conn.close()
