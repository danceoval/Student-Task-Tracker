import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, LayoutList } from "lucide-react";
import { useListTasks, useListCourses } from "@workspace/api-client-react";
import { Task } from "@workspace/api-client-react";

import { AppShell } from "@/components/layout/app-shell";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tasks() {
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters
  const [status, setStatus] = useState<"all" | "active" | "completed">("active");
  const [courseId, setCourseId] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  const { data: courses = [] } = useListCourses();
  
  const { data: tasks = [], isLoading } = useListTasks({
    status: status,
    courseId: courseId !== "all" ? Number(courseId) : undefined,
    priority: priority !== "all" ? priority as any : undefined,
  });

  const getCourse = (id: number) => courses.find(c => c.id === id);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage all your academic responsibilities.</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-card p-4 rounded-xl border">
        <div className="flex items-center text-sm font-medium text-muted-foreground mr-2">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </div>
        
        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All Statuses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.code}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : tasks.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                course={getCourse(task.courseId)}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed rounded-xl bg-card/50">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LayoutList className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="text-lg font-serif font-medium text-foreground mb-1">No tasks found</h3>
            <p className="text-muted-foreground text-sm max-w-[300px] mb-6">
              You don't have any tasks matching these filters. Take a break or add a new one.
            </p>
            <Button variant="outline" onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}>
              Add First Task
            </Button>
          </div>
        )}
      </div>

      <TaskFormDialog 
        open={taskFormOpen} 
        onOpenChange={(open) => {
          setTaskFormOpen(open);
          if (!open) setEditingTask(null);
        }} 
        task={editingTask}
      />
    </AppShell>
  );
}
