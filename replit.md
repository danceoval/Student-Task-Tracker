# Course Task Tracker

A single-user web app for university students to track tasks — assignments, readings, exams, and projects — across multiple courses, with a dashboard, unified task list, and per-course progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/task-tracker run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild shared lib declarations (run after editing `lib/db` schema before leaf typechecks)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite, wouter, TanStack Query, framer-motion, shadcn/ui
- Build: esbuild (CJS bundle)

## Where things live

- API contract (source of truth): `lib/api-spec/openapi.yaml` — run codegen after edits
- DB schema (source of truth): `lib/db/src/schema/{courses,tasks}.ts`, exported via `index.ts`
- API routes: `artifacts/api-server/src/routes/{courses,tasks,dashboard}.ts`, wired in `routes/index.ts`
- Frontend: `artifacts/task-tracker/src/` — pages in `pages/`, components in `components/`
- Generated API hooks/types: import from `@workspace/api-client-react` (package root, not deep paths)

## Architecture decisions

- Single-user app, no authentication by design.
- `tasks.dueDate` uses Drizzle `date(..., { mode: "string" })`, so dates are `"YYYY-MM-DD"` strings throughout the API and UI.
- Task → course is a FK with cascade delete: deleting a course removes its tasks.
- Dashboard summary/upcoming/overdue/activity are computed server-side and exposed as dedicated endpoints.

## Product

- Dashboard: overall stats (active/overdue/due-soon/courses), overdue and upcoming task lists, per-course progress.
- Tasks: unified list across courses with filters (course, status, priority, type) and inline completion toggle.
- Courses: card grid with per-course progress; full CRUD via dialogs.
- Course detail (`/courses/:id`): course metadata, progress, and that course's tasks.

## User preferences

- No emojis in the UI.

## Gotchas

- After editing `lib/db` schema, run `pnpm run typecheck:libs` before leaf-package typechecks, or they see stale `@workspace/db` declarations.
- The api-server `dev` command builds once then starts (no watch) — restart its workflow to pick up route/code changes.
- Import generated hooks and types from `@workspace/api-client-react` (the package root), never deep paths like `@workspace/api-client-react/src/generated/...`.
- Toggle task completion is a `PATCH /tasks/:id/toggle`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
