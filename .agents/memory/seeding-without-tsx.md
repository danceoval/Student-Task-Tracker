---
name: Seeding / running TS DB scripts without tsx
description: Why standalone TS runner scripts fail in this pnpm monorepo and the durable pattern to use instead
---

# Running TypeScript DB logic in this monorepo

`tsx` is NOT installable in this environment (install fails), and plain `node`'s
native TS type-stripping won't resolve the shared db package's extensionless /
directory imports. So a standalone `tsx ./seed.ts`-style CLI script does NOT work
for seeds, backfills, or one-off DB scripts.

**Durable pattern:** run such logic through the already-bundled API server instead
of a separate TS runner. Express the seed as an idempotent exported function and
invoke it from the server's startup path.

**Why:** the API server is bundled with esbuild, which resolves the workspace's TS
module graph that a bare `node`/`tsx` invocation cannot. Piggybacking on it avoids
needing any extra TS runtime.

**How to apply:** for any "run TS against the DB" need, prefer wiring it into the
esbuild-bundled server's startup rather than adding a standalone runner. Always make
it idempotent (guard on existing data) so repeated startups are safe.
