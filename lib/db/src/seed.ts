import { db, coursesTable, tasksTable } from "./index";

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function seedDatabaseIfEmpty(): Promise<{ seeded: boolean }> {
  const existing = await db.select().from(coursesTable);
  if (existing.length > 0) {
    return { seeded: false };
  }

  const courses = await db
    .insert(coursesTable)
    .values([
      {
        name: "Introduction to Computer Science",
        code: "CS 101",
        color: "#6366f1",
        instructor: "Dr. Alan Pierce",
        term: "Fall 2026",
      },
      {
        name: "Organic Chemistry",
        code: "CHEM 210",
        color: "#10b981",
        instructor: "Prof. Mira Tanaka",
        term: "Fall 2026",
      },
      {
        name: "Modern World History",
        code: "HIST 150",
        color: "#f59e0b",
        instructor: "Dr. Eleanor Voss",
        term: "Fall 2026",
      },
      {
        name: "Calculus II",
        code: "MATH 220",
        color: "#ef4444",
        instructor: "Prof. Samuel Reed",
        term: "Fall 2026",
      },
    ])
    .returning();

  const byCode = Object.fromEntries(courses.map((c) => [c.code, c.id]));

  await db.insert(tasksTable).values([
    { courseId: byCode["CS 101"], title: "Problem Set 3: Recursion", notes: "Complete exercises 1-8 in chapter 4", dueDate: dateOffset(2), priority: "high", type: "assignment", completed: false },
    { courseId: byCode["CS 101"], title: "Read Chapter 5: Data Structures", dueDate: dateOffset(5), priority: "medium", type: "reading", completed: false },
    { courseId: byCode["CS 101"], title: "Midterm Exam", notes: "Covers chapters 1-5", dueDate: dateOffset(14), priority: "high", type: "exam", completed: false },
    { courseId: byCode["CS 101"], title: "Lab 2 writeup", notes: "Submit on the course portal", dueDate: dateOffset(-2), priority: "medium", type: "assignment", completed: false },
    { courseId: byCode["CS 101"], title: "Set up dev environment", dueDate: dateOffset(-10), priority: "low", type: "other", completed: true },
    { courseId: byCode["CHEM 210"], title: "Lab Report: Distillation", notes: "Include the full procedure and results", dueDate: dateOffset(1), priority: "high", type: "assignment", completed: false },
    { courseId: byCode["CHEM 210"], title: "Read sections 8.1-8.3", dueDate: dateOffset(3), priority: "medium", type: "reading", completed: false },
    { courseId: byCode["CHEM 210"], title: "Quiz on functional groups", dueDate: dateOffset(-5), priority: "medium", type: "exam", completed: false },
    { courseId: byCode["HIST 150"], title: "Essay: Causes of WWI", notes: "1500 words, MLA format", dueDate: dateOffset(8), priority: "high", type: "assignment", completed: false },
    { courseId: byCode["HIST 150"], title: 'Read "The Guns of August" ch. 1-3', dueDate: dateOffset(4), priority: "low", type: "reading", completed: false },
    { courseId: byCode["HIST 150"], title: "Discussion post week 4", dueDate: dateOffset(-1), priority: "low", type: "other", completed: false },
    { courseId: byCode["MATH 220"], title: "Homework 6: Integration by parts", dueDate: dateOffset(2), priority: "medium", type: "assignment", completed: false },
    { courseId: byCode["MATH 220"], title: "Group project proposal", notes: "Coordinate with study group", dueDate: dateOffset(10), priority: "high", type: "project", completed: false },
    { courseId: byCode["MATH 220"], title: "Practice problems set A", dueDate: dateOffset(-8), priority: "low", type: "assignment", completed: true },
  ]);

  return { seeded: true };
}
