# Docker Local Development

## Prerequisites
- Docker Desktop or Docker Engine
- `.env.local` with Supabase keys

## Run Dev Container
```bash
docker compose -f docker/compose.yaml up --build
```

## Stop
```bash
docker compose down
```

The app will be available at `http://localhost:3000`.
