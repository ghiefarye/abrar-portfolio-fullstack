import datetime
from functools import wraps

import bcrypt
import jwt
from flask import request, jsonify

import db


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_token(username: str) -> str:
    payload = {
        "username": username,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(hours=db.JWT_EXPIRES_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, db.JWT_SECRET, algorithm=db.JWT_ALGO)


def decode_token(token: str):
    return jwt.decode(token, db.JWT_SECRET, algorithms=[db.JWT_ALGO])


def get_token_from_request():
    # 1) httpOnly cookie (dipakai oleh admin panel Next.js)
    token = request.cookies.get("admin_token")
    if token:
        return token
    # 2) fallback: Authorization: Bearer <token>
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    return None


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({"error": "Belum login / token tidak ditemukan"}), 401
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Sesi login sudah kadaluarsa"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token tidak valid"}), 401
        request.admin_username = payload.get("username")
        return fn(*args, **kwargs)

    return wrapper
