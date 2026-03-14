# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` contains App Router routes, layouts, and `globals.css`.
- `src/components/` holds shared UI; shadcn/ui components live in `src/components/ui/`.
- `src/utils/` and `src/lib/` store helpers and integrations (see `src/utils/supabase/`).
- `src/types/` keeps shared TypeScript types (for example `src/types/supabase.ts`).
- `public/` is for static assets, and `supabase/` holds local migrations plus `config.toml`.
- Root config includes `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, and `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev` starts the local Next.js server at `http://localhost:3000`.
- `npm run build` creates a production build.
- `npm run start` serves the production build locally.
- `npm run lint` runs ESLint with Next.js core web vitals and TypeScript rules.

## Coding Style & Naming Conventions
- TypeScript is required; follow the existing 2-space indentation and no-semicolon style.
- Use the import alias `@/*` (configured in `tsconfig.json`) instead of relative paths when practical.
- Tailwind CSS is the default styling system; keep class lists readable and grouped by intent.
- Linting is configured in `eslint.config.mjs`; there is no Prettier config, so match current formatting.

## Testing Guidelines
- No test runner or coverage requirements are configured yet.
- If you add tests, prefer `*.test.ts` or `*.test.tsx` next to source files or in a top-level `tests/` folder, and document the chosen framework plus how to run it.

## Commit & Pull Request Guidelines
- Git history is not available in this workspace, so no commit convention can be inferred.
- Use clear, imperative commit subjects (for example `Add onboarding hero copy`). If you adopt Conventional Commits, apply it consistently.
- Pull requests should include a short summary, scope of changes, and screenshots or recordings for UI changes.

## Security & Configuration Tips
- Supabase expects `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server-side admin workflows use `SUPABASE_SERVICE_ROLE_KEY`; keep it out of client code.
- Store local secrets in `.env.local` and never commit them.
