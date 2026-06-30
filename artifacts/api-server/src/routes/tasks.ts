import { Router, type IRouter } from "express";
import { db, tasksTable, coursesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { CreateTaskBody, UpdateTaskBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(task: typeof tasksTable.$inferSelect) {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

router.get("/tasks", async (req, res) => {
  const conditions = [];
  if (req.query.courseId !== undefined) {
    conditions.push(eq(tasksTable.courseId, Number(req.query.courseId)));
  }
  if (req.query.status === "active") {
    conditions.push(eq(tasksTable.completed, false));
  } else if (req.query.status === "completed") {
    conditions.push(eq(tasksTable.completed, true));
  }
  if (typeof req.query.priority === "string") {
    conditions.push(eq(tasksTable.priority, req.query.priority));
  }
  if (typeof req.query.type === "string") {
    conditions.push(eq(tasksTable.type, req.query.type));
  }

  const rows = await db
    .select()
    .from(tasksTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(tasksTable.dueDate);
  res.json(rows.map(serialize));
});

router.post("/tasks", async (req, res) => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid task data" });
    return;
  }
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, parsed.data.courseId));
  if (!course) {
    res.status(400).json({ error: "Course not found" });
    return;
  }
  const [created] = await db
    .insert(tasksTable)
    .values({
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      notes: parsed.data.notes ?? null,
      dueDate: parsed.data.dueDate ?? null,
      priority: parsed.data.priority ?? "medium",
      type: parsed.data.type ?? "assignment",
    })
    .returning();
  res.status(201).json(serialize(created));
});

router.get("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(serialize(task));
});

router.patch("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid task data" });
    return;
  }
  if (parsed.data.courseId !== undefined) {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, parsed.data.courseId));
    if (!course) {
      res.status(400).json({ error: "Course not found" });
      return;
    }
  }
  const [updated] = await db
    .update(tasksTable)
    .set(parsed.data)
    .where(eq(tasksTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(serialize(updated));
});

router.patch("/tasks/:id/toggle", async (req, res) => {
  const id = Number(req.params.id);
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const [updated] = await db
    .update(tasksTable)
    .set({ completed: !task.completed })
    .where(eq(tasksTable.id, id))
    .returning();
  res.json(serialize(updated));
});

router.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.status(204).send();
});

export default router;
