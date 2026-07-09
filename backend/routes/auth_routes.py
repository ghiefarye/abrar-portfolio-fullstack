from flask import Blueprint, request, jsonify, make_response

import db
import auth

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

COOKIE_KWARGS = dict(
    httponly=True,
    samesite="Lax",
    secure=False,  # set True kalau sudah pakai HTTPS di production
    path="/",
)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Username dan password wajib diisi"}), 400

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
                (username,),
            )
            row = cur.fetchone()
    finally:
        conn.close()

    if not row or not auth.verify_password(password, row["password_hash"]):
        return jsonify({"error": "Username atau password salah"}), 401

    token = auth.create_token(row["username"])
    resp = make_response(
        jsonify({"message": "Login berhasil", "username": row["username"]})
    )
    resp.set_cookie(
        "admin_token", token, max_age=db.JWT_EXPIRES_HOURS * 3600, **COOKIE_KWARGS
    )
    return resp


@auth_bp.post("/logout")
def logout():
    resp = make_response(jsonify({"message": "Logout berhasil"}))
    resp.set_cookie("admin_token", "", max_age=0, **COOKIE_KWARGS)
    return resp


@auth_bp.get("/me")
@auth.login_required
def me():
    return jsonify({"username": request.admin_username})


@auth_bp.put("/credentials")
@auth.login_required
def update_credentials():
    data = request.get_json(silent=True) or {}
    current_password = data.get("currentPassword") or ""
    new_username = (data.get("newUsername") or "").strip()
    new_password = data.get("newPassword") or ""

    if not current_password:
        return jsonify({"error": "Password saat ini wajib diisi"}), 400
    if new_password and len(new_password) < 6:
        return jsonify({"error": "Password baru minimal 6 karakter"}), 400

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
                (request.admin_username,),
            )
            row = cur.fetchone()

            if not row or not auth.verify_password(current_password, row["password_hash"]):
                return jsonify({"error": "Password saat ini salah"}), 401

            updates = []
            params = []

            if new_username and new_username != row["username"]:
                cur.execute(
                    "SELECT id FROM admin_users WHERE username = %s AND id != %s",
                    (new_username, row["id"]),
                )
                if cur.fetchone():
                    return jsonify({"error": "Username sudah dipakai"}), 409
                updates.append("username = %s")
                params.append(new_username)

            if new_password:
                updates.append("password_hash = %s")
                params.append(auth.hash_password(new_password))

            if not updates:
                return jsonify({"error": "Tidak ada perubahan untuk disimpan"}), 400

            params.append(row["id"])
            cur.execute(
                f"UPDATE admin_users SET {', '.join(updates)} WHERE id = %s",
                params,
            )

        final_username = new_username if new_username else row["username"]
    finally:
        conn.close()

    token = auth.create_token(final_username)
    resp = make_response(
        jsonify({"message": "Kredensial berhasil diupdate", "username": final_username})
    )
    resp.set_cookie(
        "admin_token", token, max_age=db.JWT_EXPIRES_HOURS * 3600, **COOKIE_KWARGS
    )
    return resp
