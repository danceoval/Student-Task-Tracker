import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useCreateTask, useUpdateTask, getListTasksQueryKey, getGetDashboardSummaryQueryKey, getGetUpcomingTasksQueryKey, getGetOverdueTasksQueryKey, getGetRecentActivityQueryKey, useListCourses, getGetCourseQueryKey } from "@workspace/api-client-react";
import { Task, TaskInputPriority, TaskInputType } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  courseId: z.coerce.number({ invalid_type_error: "Course is required" }).positive("Course is required"),
  dueDate: z.date().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]),
  type: z.enum(["assignment", "reading", "exam", "project", "other"]),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultCourseId?: number;
}

export function TaskFormDialog({ open, onOpenChange, task, defaultCourseId }: TaskFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: courses = [] } = useListCourses();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      notes: task?.notes || "",
      courseId: task?.courseId || defaultCourseId || 0,
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      priority: task?.priority || "medium",
      type: task?.type || "assignment",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        notes: task?.notes || "",
        courseId: task?.courseId || defaultCourseId || 0,
        dueDate: task?.dueDate ? new Date(task.dueDate) : null,
        priority: task?.priority || "medium",
        type: task?.type || "assignment",
      });
    }
  }, [open, task, defaultCourseId, form]);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isPending = createTask.isPending || updateTask.isPending;

  function invalidateQueries() {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUpcomingTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetOverdueTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
    if (task?.courseId) {
      queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(task.courseId) });
    }
  }

  function onSubmit(values: FormValues) {
    const formattedDueDate = values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : null;

    if (task) {
      updateTask.mutate(
        {
          id: task.id,
          data: {
            ...values,
            dueDate: formattedDueDate,
            priority: values.priority as any,
            type: values.type as any,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "Task updated successfully" });
            invalidateQueries();
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to update task", variant: "destructive" });
          },
        }
      );
    } else {
      createTask.mutate(
        {
          data: {
            ...values,
            dueDate: formattedDueDate,
            priority: values.priority as any,
            type: values.type as any,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "Task created successfully" });
            invalidateQueries();
            form.reset();
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to create task", variant: "destructive" });
          },
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif">{task ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details for this task." : "Add a new task to your workload."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Read chapters 4-6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional instructions or notes here..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
