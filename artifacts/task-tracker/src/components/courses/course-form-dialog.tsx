import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { useCreateCourse, useUpdateCourse, getListCoursesQueryKey, getGetDashboardSummaryQueryKey, getGetCourseQueryKey } from "@workspace/api-client-react";
import { Course } from "@workspace/api-client-react";

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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COURSE_COLORS = [
  "#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51",
  "#1d3557", "#457b9d", "#a8dadc", "#e63946", "#d62828",
  "#606c38", "#283618", "#dda15e", "#bc6c25", "#8a817c"
];

const formSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
  color: z.string().min(1, "Color is required"),
  instructor: z.string().optional(),
  term: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}

export function CourseFormDialog({ open, onOpenChange, course }: CourseFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: course?.name || "",
      code: course?.code || "",
      color: course?.color || COURSE_COLORS[0],
      instructor: course?.instructor || "",
      term: course?.term || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: course?.name || "",
        code: course?.code || "",
        color: course?.color || COURSE_COLORS[0],
        instructor: course?.instructor || "",
        term: course?.term || "",
      });
    }
  }, [open, course, form]);

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const isPending = createCourse.isPending || updateCourse.isPending;

  function invalidateQueries() {
    queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    if (course) {
      queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(course.id) });
    }
  }

  function onSubmit(values: FormValues) {
    if (course) {
      updateCourse.mutate(
        {
          id: course.id,
          data: values,
        },
        {
          onSuccess: () => {
            toast({ title: "Course updated successfully" });
            invalidateQueries();
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to update course", variant: "destructive" });
          },
        }
      );
    } else {
      createCourse.mutate(
        {
          data: values,
        },
        {
          onSuccess: () => {
            toast({ title: "Course created successfully" });
            invalidateQueries();
            form.reset();
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to create course", variant: "destructive" });
          },
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif">{course ? "Edit Course" : "New Course"}</DialogTitle>
          <DialogDescription>
            {course ? "Update the details for this course." : "Add a new course to track."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-[1fr_120px] gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Introduction to Physics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="PHYS 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {COURSE_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform",
                            field.value === c ? "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:scale-110"
                          )}
                          style={{ backgroundColor: c }}
                          onClick={() => field.onChange(c)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dr. Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fall 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Course"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
