import os

from flask import Flask, send_from_directory
from flask_cors import CORS

import db
from routes.auth_routes import auth_bp
from routes.projects_routes import projects_bp
from routes.experiences_routes import experiences_bp
from routes.settings_routes import settings_bp
from routes.messages_routes import messages_bp
from routes.upload_routes import upload_bp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")

app = Flask(__name__)
app.config["UPLOAD_ROOT"] = UPLOAD_ROOT

# CORS: izinkan localhost (dev) + domain Vercel (production)
# Set env var ALLOWED_ORIGINS di Railway dengan nilai domain Vercel kamu
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")]
CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

app.register_blueprint(auth_bp)
app.register_blueprint(projects_bp)
app.register_blueprint(experiences_bp)
app.register_blueprint(settings_bp)
app.register_blueprint(messages_bp)
app.register_blueprint(upload_bp)


@app.before_request
def _ensure_db():
    # Lazy init sekali di request pertama (aman dipanggil berkali-kali,
    # semua statement pakai IF NOT EXISTS).
    if not getattr(app, "_db_ready", False):
        db.init_db()
        app._db_ready = True


@app.get("/uploads/<path:filepath>")
def serve_upload(filepath):
    return send_from_directory(UPLOAD_ROOT, filepath)


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    with app.app_context():
        db.init_db()
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
