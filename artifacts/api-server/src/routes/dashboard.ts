import { Router, type IRouter } from "express";
import { db, tasksTable, coursesTable } from "@workspace/db";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";

const router: IRouter = Router();

function serializeTask(task: typeof tasksTable.$inferSelect) {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

router.get("/dashboard/summary", async (_req, res) => {
  const tasks = await db.select().from(tasksTable);
  const courses = await db.select().from(coursesTable);
  const today = todayStr();
  const soonLimit = new Date();
  soonLimit.setDate(soonLimit.getDate() + 7);
  const soonStr = soonLimit.toISOString().slice(0, 10);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate !== null && t.dueDate < today,
  );
  const dueSoonTasks = activeTasks.filter(
    (t) => t.dueDate !== null && t.dueDate >= today && t.dueDate <= soonStr,
  );

  const courseStats = courses.map((c) => {
    const courseTasks = tasks.filter((t) => t.courseId === c.id);
    return {
      courseId: c.id,
      name: c.name,
      code: c.code,
      color: c.color,
      totalTasks: courseTasks.length,
      activeTasks: courseTasks.filter((t) => !t.completed).length,
      completedTasks: courseTasks.filter((t) => t.completed).length,
    };
  });

  res.json({
    totalTasks: tasks.length,
    activeTasks: activeTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    dueSoonTasks: dueSoonTasks.length,
    totalCourses: courses.length,
    courseStats,
  });
});

router.get("/dashboard/upcoming", async (req, res) => {
  const days = req.query.days !== undefined ? Number(req.query.days) : 7;
  const today = todayStr();
  const limit = new Date();
  limit.setDate(limit.getDate() + (Number.isNaN(days) ? 7 : days));
  const limitStr = limit.toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.completed, false),
        gte(tasksTable.dueDate, today),
        lte(tasksTable.dueDate, limitStr),
      ),
    )
    .orderBy(asc(tasksTable.dueDate));
  res.json(rows.map(serializeTask));
});

router.get("/dashboard/overdue", async (_req, res) => {
  const today = todayStr();
  const rows = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.completed, false),
        sql`${tasksTable.dueDate} < ${today}`,
      ),
    )
    .orderBy(asc(tasksTable.dueDate));
  res.json(rows.map(serializeTask));
});

router.get("/dashboard/activity", async (_req, res) => {
  const rows = await db
    .select()
    .from(tasksTable)
    .orderBy(desc(tasksTable.updatedAt))
    .limit(10);
  res.json(rows.map(serializeTask));
});

export default router;
