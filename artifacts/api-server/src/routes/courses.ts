import { Router, type IRouter } from "express";
import { db, coursesTable, tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCourseBody, UpdateCourseBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(course: typeof coursesTable.$inferSelect) {
  return {
    ...course,
    createdAt: course.createdAt.toISOString(),
  };
}

router.get("/courses", async (_req, res) => {
  const rows = await db.select().from(coursesTable).orderBy(coursesTable.name);
  res.json(rows.map(serialize));
});

router.post("/courses", async (req, res) => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid course data" });
    return;
  }
  const [created] = await db
    .insert(coursesTable)
    .values({
      name: parsed.data.name,
      code: parsed.data.code,
      color: parsed.data.color,
      instructor: parsed.data.instructor ?? null,
      term: parsed.data.term ?? null,
    })
    .returning();
  res.status(201).json(serialize(created));
});

router.get("/courses/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, id));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(serialize(course));
});

router.patch("/courses/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid course data" });
    return;
  }
  const [updated] = await db
    .update(coursesTable)
    .set(parsed.data)
    .where(eq(coursesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(serialize(updated));
});

router.delete("/courses/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(tasksTable).where(eq(tasksTable.courseId, id));
  const deleted = await db
    .delete(coursesTable)
    .where(eq(coursesTable.id, id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.status(204).send();
});

export default router;
