import { Link } from "wouter";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import { Task, Course } from "@workspace/api-client-react";
import { useToggleTask, useDeleteTask, getListTasksQueryKey, getGetDashboardSummaryQueryKey, getGetUpcomingTasksQueryKey, getGetOverdueTasksQueryKey, getGetRecentActivityQueryKey, getGetCourseQueryKey } from "@workspace/api-client-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  course?: Course;
  onEdit?: (task: Task) => void;
}

export function TaskItem({ task, course, onEdit }: TaskItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));

  function invalidateQueries() {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUpcomingTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetOverdueTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
    if (task.courseId) {
      queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(task.courseId) });
    }
  }

  const handleToggle = () => {
    toggleTask.mutate(
      { id: task.id },
      {
        onSuccess: () => {
          invalidateQueries();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    deleteTask.mutate(
      { id: task.id },
      {
        onSuccess: () => {
          toast({ title: "Task deleted" });
          invalidateQueries();
        },
      }
    );
  };

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-secondary/20 text-secondary-foreground border-secondary/30",
    low: "bg-muted text-muted-foreground border-border",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-200 hover:shadow-md",
        task.completed ? "opacity-60" : ""
      )}
    >
      <button 
        onClick={handleToggle}
        className={cn(
          "mt-0.5 flex-shrink-0 transition-colors duration-200",
          task.completed ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "font-medium text-foreground transition-all duration-200 line-clamp-2 leading-tight",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {course && (
            <Link href={`/courses/${course.id}`}>
              <Badge variant="outline" className="hover:bg-accent cursor-pointer" style={{ borderColor: course.color, color: course.color }}>
                {course.code}
              </Badge>
            </Link>
          )}

          {task.dueDate && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              <Clock className="w-3.5 h-3.5" />
              {isOverdue ? "Overdue" : format(new Date(task.dueDate), "MMM d")}
            </span>
          )}

          <Badge variant="outline" className={cn("capitalize text-[10px]", priorityColors[task.priority])}>
            {task.priority}
          </Badge>

          <Badge variant="secondary" className="capitalize text-[10px] bg-secondary/50">
            {task.type}
          </Badge>
        </div>
        
        {task.notes && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {task.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
}
