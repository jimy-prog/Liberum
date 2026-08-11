import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

APP_NAME = os.getenv("APP_NAME", "Liberum")
APP_TAGLINE = os.getenv("APP_TAGLINE", "English Learning Platform")
OWNER_USERNAME = os.getenv("OWNER_USERNAME", "owner")
OWNER_EMAIL = os.getenv("OWNER_EMAIL", "owner@liberum.local")
OWNER_FULL_NAME = os.getenv("OWNER_FULL_NAME", "Liberum Owner")

DEFAULT_DB_FILENAME = "liberum.db"
LEGACY_DB_FILENAME = "teacher_admin.db"

# Firebase
FIREBASE_CREDENTIALS_PATH = os.path.join(BASE_DIR, "firebase-service-account.json")

_db_env = os.getenv("DATABASE_URL", "").strip()
if os.getenv("RENDER"):
    DATA_DIR = Path("/data")
elif os.getenv("IS_DOCKER") == "true":
    DATA_DIR = Path("/app/data")
else:
    DATA_DIR = BASE_DIR

# Migrate old filenames to Liberum on persistent disk if they exist
if DATA_DIR.exists():
    old_db = DATA_DIR / "lexora.db"
    new_db = DATA_DIR / "liberum.db"
    if old_db.exists() and not new_db.exists():
        try:
            os.rename(old_db, new_db)
            print(f"Migrated persistent database filename: {old_db} -> {new_db}")
        except Exception as e:
            print(f"Error migrating database name: {e}")
            
    old_pw = DATA_DIR / "lexora_auth_password.txt"
    new_pw = DATA_DIR / "liberum_auth_password.txt"
    if old_pw.exists() and not new_pw.exists():
        try:
            os.rename(old_pw, new_pw)
            print(f"Migrated persistent password filename: {old_pw} -> {new_pw}")
        except Exception as e:
            print(f"Error migrating password filename: {e}")

_db_env = os.getenv("DATABASE_URL", "").strip()
if _db_env:
    DATABASE_URL = _db_env
    DATABASE_FILE = None
else:
    liberum_db = DATA_DIR / DEFAULT_DB_FILENAME
    legacy_db = DATA_DIR / LEGACY_DB_FILENAME
    active_db = liberum_db if liberum_db.exists() or not legacy_db.exists() else legacy_db
    DATABASE_FILE = active_db
    DATABASE_URL = f"sqlite:///{active_db}"

SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "liberum-dev-secret-change-me")
SESSION_COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "liberum_session")

DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "change-me")

PASSWORD_FILE = DATA_DIR / "liberum_auth_password.txt"
LEGACY_PASSWORD_FILE = DATA_DIR / "auth_password.txt"

BACKUP_DIR = DATA_DIR / "backups"
STATIC_DIR = BASE_DIR / "static"
UPLOADS_DIR = DATA_DIR / "uploads"

LOG_FILENAME = os.getenv("APP_LOG_FILENAME", "liberum.log")

# Email Authentication Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "mail.liberum.uz")
SMTP_PORT = os.getenv("SMTP_PORT", "465")
SMTP_USER = os.getenv("SMTP_USER", "main@liberum.uz")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
