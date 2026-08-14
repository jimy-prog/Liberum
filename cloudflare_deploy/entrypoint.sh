#!/bin/sh
set -eu

mkdir -p /app/database_tenants /app/backups /app/uploads /app/static

if [ ! -f /app/database_tenants/liberum.db ] && [ -f /app/teacher_admin.db ]; then
  cp /app/teacher_admin.db /app/database_tenants/liberum.db
  echo "[Liberum] Seeded /app/database_tenants/liberum.db from existing teacher_admin.db"
fi

if [ ! -f /app/database_tenants/master.db ] && [ -f /app/master.db ]; then
  cp /app/master.db /app/database_tenants/master.db
  echo "[Liberum] Seeded /app/database_tenants/master.db from existing master.db"
fi

if [ ! -f /app/database_tenants/liberum_auth_password.txt ] && [ -f /app/auth_password.txt ]; then
  cp /app/auth_password.txt /app/database_tenants/liberum_auth_password.txt
  echo "[Liberum] Seeded liberum_auth_password.txt from existing auth_password.txt"
fi

exec "$@"
