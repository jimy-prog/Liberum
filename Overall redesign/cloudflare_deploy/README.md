# Liberum Cloudflare Deployment

This directory contains a separate deployment setup for running the current Liberum FastAPI app behind Cloudflare Tunnel without changing the main project files.

## Why this approach

The current project uses:

- FastAPI
- Jinja templates
- SQLite
- local uploads

That makes Cloudflare Tunnel the safest Cloudflare-based deployment path for now.

The app runs in Docker as the origin service, and `cloudflared` publishes it securely through your Cloudflare account.

## What is included

- separate Cloudflare entrypoint: `cloudflare_main.py`
- separate Docker image definition
- separate Docker Compose file
- automatic first-run copy of the current `teacher_admin.db` into `/app/data/liberum.db`
- automatic first-run copy of the old password hash into `liberum_auth_password.txt`

## Structure

- `cloudflare_main.py`: Cloudflare-specific app entrypoint
- `entrypoint.sh`: prepares persistent data on first container start
- `Dockerfile`: builds the Liberum image
- `docker-compose.yml`: runs the app plus Cloudflare Tunnel
- `.env.example`: environment variables required for deployment

## Prerequisites

1. A server or VPS where Docker and Docker Compose are installed
2. A Cloudflare account
3. A domain managed in Cloudflare
4. A Cloudflare Tunnel token

## Recommended setup in Cloudflare

1. Open Zero Trust dashboard
2. Create a Tunnel
3. Create a public hostname like `app.yourdomain.com`
4. Point that hostname to `http://liberum-app:8000`
5. Copy the tunnel token

## Deployment steps

1. Copy this project to your server
2. Go to `cloudflare_deploy`
3. Create `.env` from `.env.example`
4. Fill:
   - `SESSION_SECRET_KEY`
   - `DEFAULT_ADMIN_PASSWORD`
   - `CLOUDFLARE_TUNNEL_TOKEN`
5. Run:

```bash
docker compose up -d --build
```

## First boot behavior

On first start:

- if `/app/data/liberum.db` does not exist, the container copies `teacher_admin.db` into it
- if `liberum_auth_password.txt` does not exist, the container copies `auth_password.txt` into it

This preserves your current data and password state.

## Persistent data

Docker volumes are used for:

- database: `liberum_data`
- uploads: `liberum_uploads`
- backups: `liberum_backups`

## Local checks on the server

After deploy:

```bash
docker compose ps
docker compose logs -f liberum-app
docker compose logs -f cloudflared
```

You can also verify the app locally on the server:

```bash
curl http://127.0.0.1:8000/login
```

## Important note

This setup keeps the current monolith working as-is. Later, when we move to PostgreSQL and proper multi-user auth, this deployment can be upgraded without deleting the main app.
