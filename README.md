# Course Task Tracker

A single-user web app for university students to manage tasks — assignments, readings, exams, and projects — across all their courses.

**Live app:** [https://workspace.dansohval.replit.app](https://workspace.dansohval.replit.app)

---

## Features

- **Dashboard** — summary stats, overdue and upcoming tasks, per-course progress bars, and a recent activity feed
- **Tasks** — unified list across all courses with filters by course, status, priority, type, and due-date window (overdue / today / this week / this month / no due date)
- **Courses** — card grid showing completion progress; create, edit, and delete courses
- **Course detail** — per-course progress and task list
- Full CRUD for courses and tasks, with inline completion toggle

## Tech stack

- **Frontend:** React + Vite, TanStack Query, wouter, framer-motion, shadcn/ui
- **Backend:** Express 5, Node.js 24, TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **API:** OpenAPI spec → Orval codegen (typed hooks + Zod schemas)
- **Monorepo:** pnpm workspaces

## Running locally

```bash
# Install dependencies
pnpm install

# Set the required environment variable
DATABASE_URL=postgres://...

# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the web frontend
pnpm --filter @workspace/task-tracker run dev
```

The app seeds sample data automatically on first run (4 courses, 14 tasks).

## Project structure

```
lib/
  api-spec/      # OpenAPI spec (source of truth for the API contract)
  db/            # Drizzle schema and seed logic
artifacts/
  api-server/    # Express API server
  task-tracker/  # React + Vite frontend
```
