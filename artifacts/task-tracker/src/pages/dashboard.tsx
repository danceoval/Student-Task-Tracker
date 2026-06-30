import { useState } from "react";
import { Link } from "wouter";
import { useGetDashboardSummary, useGetUpcomingTasks, useGetOverdueTasks, useGetRecentActivity, useListCourses } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, Plus, AlertCircle, Activity, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { AppShell } from "@/components/layout/app-shell";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [courseFormOpen, setCourseFormOpen] = useState(false);

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: upcomingTasks = [], isLoading: loadingUpcoming } = useGetUpcomingTasks({ days: 7 });
  const { data: overdueTasks = [], isLoading: loadingOverdue } = useGetOverdueTasks();
  const { data: recentTasks = [], isLoading: loadingRecent } = useGetRecentActivity();
  const { data: courses = [], isLoading: loadingCourses } = useListCourses();

  const getCourse = (id: number) => courses.find(c => c.id === id);

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's your academic command center.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setCourseFormOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Course
          </Button>
          <Button onClick={() => setTaskFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Task
          </Button>
        </div>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="border-border shadow-sm bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" /> Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{summary.activeTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">out of {summary.totalTasks} total</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-card overflow-hidden relative">
             <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/5 rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" /> Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold text-destructive">{summary.overdueTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">requires attention</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary-foreground" /> Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{summary.dueSoonTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">in the next 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif font-bold">{summary.totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">active enrollment</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {overdueTasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Overdue Tasks
                </h2>
              </div>
              <div className="space-y-3">
                {overdueTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    course={getCourse(task.courseId)}
                    onEdit={() => {}} // Could wire up edit here, but simpler in tasks view
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5" /> Upcoming Tasks
              </h2>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {loadingUpcoming || loadingCourses ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    course={getCourse(task.courseId)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded-xl bg-card">
                <p className="text-muted-foreground">No tasks due in the next 7 days.</p>
                <Button variant="outline" className="mt-4" onClick={() => setTaskFormOpen(true)}>Add Task</Button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Course Progress</h2>
            {loadingSummary ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : summary?.courseStats && summary.courseStats.length > 0 ? (
              <div className="space-y-4">
                {summary.courseStats.map(stat => {
                  const progress = stat.totalTasks > 0 ? (stat.completedTasks / stat.totalTasks) * 100 : 0;
                  return (
                    <Link key={stat.courseId} href={`/courses/${stat.courseId}`}>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl border bg-card cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                            {stat.code}
                          </span>
                          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                          <span>{stat.completedTasks} completed</span>
                          <span>{stat.activeTasks} remaining</span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed rounded-xl bg-card">
                <p className="text-sm text-muted-foreground mb-4">No courses tracked yet.</p>
                <Button variant="outline" size="sm" onClick={() => setCourseFormOpen(true)}>Add Course</Button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Recent Activity
            </h2>
            {loadingRecent || loadingCourses ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="rounded-xl border bg-card divide-y">
                {recentTasks.slice(0, 10).map(task => {
                  const course = getCourse(task.courseId);
                  return (
                    <div key={task.id} className="flex items-start gap-3 p-3">
                      {task.completed ? (
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {course && (
                            <span className="text-[10px] font-medium" style={{ color: course.color }}>
                              {course.code}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {task.completed ? "Completed" : "Updated"} {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed rounded-xl bg-card">
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <TaskFormDialog open={taskFormOpen} onOpenChange={setTaskFormOpen} />
      <CourseFormDialog open={courseFormOpen} onOpenChange={setCourseFormOpen} />
    </AppShell>
  );
}
