#!/bin/sh
set -eu

mkdir -p /app/data /app/backups /app/uploads /app/static

if [ ! -f /app/data/liberum.db ] && [ -f /app/teacher_admin.db ]; then
  cp /app/teacher_admin.db /app/data/liberum.db
  echo "[Liberum] Seeded /app/data/liberum.db from existing teacher_admin.db"
fi

if [ ! -f /app/liberum_auth_password.txt ] && [ -f /app/auth_password.txt ]; then
  cp /app/auth_password.txt /app/liberum_auth_password.txt
  echo "[Liberum] Seeded liberum_auth_password.txt from existing auth_password.txt"
fi

exec "$@"
