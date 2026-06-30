import { useState } from "react";
import { useParams, Link } from "wouter";
import { Plus, ArrowLeft, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useGetCourse, useListTasks, useDeleteCourse, getGetCourseQueryKey, getListCoursesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Task } from "@workspace/api-client-react";

import { AppShell } from "@/components/layout/app-shell";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id, 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: course, isLoading: loadingCourse } = useGetCourse(courseId, { 
    query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) } 
  });
  
  const { data: tasks = [], isLoading: loadingTasks } = useListTasks({ courseId });
  const deleteCourse = useDeleteCourse();

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleDeleteCourse = () => {
    if (!confirm(`Are you sure you want to delete ${course?.code}? This will delete all its tasks.`)) return;
    
    deleteCourse.mutate(
      { id: courseId },
      {
        onSuccess: () => {
          toast({ title: "Course deleted" });
          queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          // Navigate back (handled by wouter or window.history)
          window.history.back();
        }
      }
    );
  };

  if (loadingCourse) {
    return (
      <AppShell>
        <Skeleton className="h-40 w-full rounded-2xl mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <h2 className="text-xl font-serif">Course not found</h2>
          <Link href="/courses">
            <Button variant="link" className="mt-4">Back to courses</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
          </Button>
        </Link>
      </div>

      <div 
        className="relative overflow-hidden rounded-3xl border bg-card p-8 md:p-10 mb-8"
        style={{ borderTopWidth: 6, borderTopColor: course.color }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" style={{ backgroundColor: course.color }} />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-serif font-bold text-foreground">{course.code}</h1>
              {course.term && (
                <span className="px-2.5 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
                  {course.term}
                </span>
              )}
            </div>
            <p className="text-xl text-muted-foreground">{course.name}</p>
            
            {course.instructor && (
              <p className="mt-4 text-sm text-foreground/80 font-medium">
                Instructor: <span className="text-foreground">{course.instructor}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-6 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCourseFormOpen(true)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Course
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteCourse} className="text-destructive focus:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border w-full md:w-64">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Course Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" style={{ "--tw-progress-fill": course.color } as any} />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-semibold text-foreground">Tasks</h2>
        <Button onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {loadingTasks ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              course={course}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed rounded-xl bg-card">
          <p className="text-muted-foreground mb-4">No tasks assigned for this course yet.</p>
          <Button variant="outline" onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}>
            Create First Task
          </Button>
        </div>
      )}

      <CourseFormDialog 
        open={courseFormOpen} 
        onOpenChange={setCourseFormOpen} 
        course={course} 
      />
      <TaskFormDialog 
        open={taskFormOpen} 
        onOpenChange={(open) => {
          setTaskFormOpen(open);
          if (!open) setEditingTask(null);
        }} 
        task={editingTask} 
        defaultCourseId={course.id}
      />
    </AppShell>
  );
}
