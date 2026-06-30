---
name: Seeding without tsx
description: How to run/seed TypeScript DB logic in this pnpm monorepo when tsx is unavailable
---

# Seeding the database in this monorepo

`tsx` cannot be installed here (install fails), and Node's native TS type-stripping
won't resolve the shared `lib/db` extensionless/directory imports (e.g. `./schema`),
so a standalone `tsx ./src/seed.ts` CLI seed script does NOT work.

**The working pattern:** put seed logic in `lib/db/src/seed.ts` as an exported
idempotent function (`seedDatabaseIfEmpty()` — only inserts when the table is empty),
export it from `lib/db/src/index.ts`, and call it from the api-server startup
(`artifacts/api-server/src/index.ts`, inside `app.listen` callback).

**Why:** the api-server is bundled with esbuild, which handles the workspace TS module
resolution that plain `node` cannot. Running through the server avoids needing any
extra TS runner.

**How to apply:** for any "run a TS script against the DB" need (seeds, one-off
migrations/backfills), prefer wiring it through the esbuild-bundled server rather than
adding a standalone runner. Keep it idempotent so repeated startups are safe.
