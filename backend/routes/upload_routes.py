import os
import uuid

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

import auth

upload_bp = Blueprint("upload_bp", __name__, url_prefix="/api/upload")

ALLOWED_IMAGE_EXT = {"png", "jpg", "jpeg", "webp", "gif"}
ALLOWED_DOC_EXT = {"pdf"}


def _ext(filename):
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _save(file_storage, folder, allowed_ext):
    filename = secure_filename(file_storage.filename)
    ext = _ext(filename)
    if ext not in allowed_ext:
        return None, f"Tipe file .{ext} tidak diizinkan"

    unique_name = f"{uuid.uuid4().hex}.{ext}"
    upload_root = current_app.config["UPLOAD_ROOT"]
    target_dir = os.path.join(upload_root, folder)
    os.makedirs(target_dir, exist_ok=True)
    target_path = os.path.join(target_dir, unique_name)
    file_storage.save(target_path)

    public_path = f"/uploads/{folder}/{unique_name}"
    return public_path, None


@upload_bp.post("/project-image")
@auth.login_required
def upload_project_image():
    if "file" not in request.files:
        return jsonify({"error": "File tidak ditemukan (field 'file')"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nama file kosong"}), 400

    path, err = _save(file, "projects", ALLOWED_IMAGE_EXT)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"src": path})


@upload_bp.post("/profile-image")
@auth.login_required
def upload_profile_image():
    if "file" not in request.files:
        return jsonify({"error": "File tidak ditemukan (field 'file')"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nama file kosong"}), 400

    path, err = _save(file, "profile", ALLOWED_IMAGE_EXT)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"src": path})


@upload_bp.post("/resume")
@auth.login_required
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "File tidak ditemukan (field 'file')"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nama file kosong"}), 400

    path, err = _save(file, "profile", ALLOWED_DOC_EXT)
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"src": path})
