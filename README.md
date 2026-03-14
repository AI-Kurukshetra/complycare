# ComplyCare

AI-assisted HIPAA compliance and healthcare security management platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Overview

ComplyCare is a multi-workstream compliance application for healthcare organizations that need to manage HIPAA readiness, operational risk, employee training, audit evidence, and security oversight from one place.

The app combines:

- compliance dashboards
- training and policy workflows
- document and evidence handling
- governance and risk tracking
- AI-powered insight endpoints

## Core Product Areas

### Operations
- compliance command center
- documents and evidence workflows
- reporting and audit preparation
- incident and task visibility

### Security
- vulnerability and regulatory monitoring
- access control visibility
- IoT inventory tracking
- breach and security insight tooling

### Governance
- policy gap analysis
- vendor and assessment workflows
- organizational compliance views

### Training
- employee training library
- module player and completion tracking
- admin views for reminders and assignments
- certificate generation

### Insights and AI
- risk prediction
- breach cost estimation
- policy gap detection
- compliance chat support

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase SSR and Supabase JS
- Vitest and Testing Library
- Docker for local and production container workflows

## Requirements

- Node.js 20+
- npm
- a Supabase project with URL, anon key, and service role key

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your local env file from the example:

```bash
cp .env.example .env.local
```

3. Fill in the required values in `.env.local`.

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

Unauthenticated users are routed to the landing and auth flows first. Authenticated users without an organization are routed to setup.

## Environment Variables

The project uses a single template file: `.env.example`.

### Development

1. Copy `.env.example` to `.env.local`.
2. Add your development or shared environment values.
3. Run the app with `npm run dev`.

### Production

1. Do not commit a real production env file.
2. Add the same variables from `.env.example` to your deployment platform or secret manager.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
4. Set Anthropic variables only if AI routes should be enabled.

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Optional AI Variables

```env
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
ANTHROPIC_VERSION=
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests with coverage output |

## Testing

Run the full test suite:

```bash
npm run test
```

Run lint:

```bash
npm run lint
```

Run coverage:

```bash
npm run test:coverage
```

## Docker

### Development

```bash
docker compose -f docker/compose.yaml up --build
```

This expects `.env.local` to exist.

### Production Build

```bash
docker build -f docker/Dockerfile --target runner -t complycare-web .
docker run --rm -p 3000:3000 --env-file .env.local complycare-web
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/landing` | marketing landing page |
| `/login` | sign in |
| `/signup` | registration |
| `/setup` | organization onboarding |
| `/` | compliance command center |
| `/operations` | operations workflows |
| `/security` | security dashboards |
| `/governance` | governance dashboards |
| `/insights` | AI-assisted insights |
| `/reports` | reporting views |
| `/documents` | document management |
| `/calendar` | compliance calendar |
| `/training` | training library |
| `/training/admin` | training administration |
| `/portfolio` | portfolio and scaling views |
| `/scale` | scale dashboard |
| `/lab` | experimental features |
| `/settings/team` | team management |
| `/api/health` | health check endpoint |

## Project Structure

```text
src/app/                 App Router routes and layouts
src/components/          shared UI and feature components
src/components/ui/       reusable UI primitives
src/hooks/               client-side feature hooks
src/lib/                 pure logic and utilities
src/services/            Supabase-backed service functions
src/types/               shared TypeScript types
src/utils/supabase/      Supabase client helpers
public/                  static assets
supabase/                local config and SQL migrations
docker/                  container build and compose assets
docs/                    planning and product documents
```

## Supabase Notes

- Public client access uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Admin and server-side workflows use `SUPABASE_SERVICE_ROLE_KEY`.
- Keep the service role key out of client-rendered code and out of committed files.
- Migrations live in `supabase/migrations`.

## Deployment Notes

- Set environment variables in your hosting platform before the first deploy.
- Apply Supabase migrations to the target project before relying on production data paths.
- Enable AI features only after `ANTHROPIC_API_KEY` is configured.
- Use `npm run build` locally before deployment if you want a quick preflight check.

## Additional Docs

- `docs/user-guide.md` for the browser user guide (all pages and how to use them)
- `docs/prd.md` for the original product scope
- `docs/plan.md` for implementation planning
- `docs/docker.md` for local Docker usage

## Security Reminder

Do not commit `.env.local`, production secrets, service role keys, certificates, or private key files. Keep `.env.example` as documentation only.
