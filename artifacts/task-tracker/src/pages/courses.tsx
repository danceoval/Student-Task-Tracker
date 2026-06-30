import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, BookOpen, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useListCourses, useGetDashboardSummary, useDeleteCourse, getListCoursesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Course } from "@workspace/api-client-react";

import { AppShell } from "@/components/layout/app-shell";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Courses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { data: courses = [], isLoading: loadingCourses } = useListCourses();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const deleteCourse = useDeleteCourse();

  const handleEdit = (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCourse(course);
    setCourseFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${course.code}? This will delete all its tasks.`)) return;
    
    deleteCourse.mutate(
      { id: course.id },
      {
        onSuccess: () => {
          toast({ title: "Course deleted" });
          queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      }
    );
  };

  const isLoading = loadingCourses || loadingSummary;

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-1">Track your progress across all classes.</p>
        </div>
        <Button onClick={() => { setEditingCourse(null); setCourseFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </>
        ) : courses.length > 0 ? (
          courses.map((course) => {
            const stats = summary?.courseStats.find(s => s.courseId === course.id);
            const totalTasks = stats?.totalTasks || 0;
            const completedTasks = stats?.completedTasks || 0;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col h-full bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="h-2 w-full" style={{ backgroundColor: course.color }} />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg leading-tight mb-1">{course.code}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{course.name}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={e => e.preventDefault()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                          <DropdownMenuItem onClick={(e) => handleEdit(e, course)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDelete(e, course)} className="text-destructive focus:bg-destructive/10">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-auto space-y-4 pt-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {course.instructor && (
                          <span className="truncate flex-1">{course.instructor}</span>
                        )}
                        {course.term && (
                          <span className="whitespace-nowrap bg-secondary/20 px-2 py-0.5 rounded text-secondary-foreground text-xs">{course.term}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" style={{ "--tw-progress-fill": course.color } as any} />
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {completedTasks} of {totalTasks} tasks completed
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border border-dashed rounded-xl bg-card/50">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="text-lg font-serif font-medium text-foreground mb-1">No courses yet</h3>
            <p className="text-muted-foreground text-sm max-w-[300px] mb-6">
              Add your classes to start tracking assignments and progress.
            </p>
            <Button variant="outline" onClick={() => { setEditingCourse(null); setCourseFormOpen(true); }}>
              Add First Course
            </Button>
          </div>
        )}
      </div>

      <CourseFormDialog 
        open={courseFormOpen} 
        onOpenChange={(open) => {
          setCourseFormOpen(open);
          if (!open) setEditingCourse(null);
        }} 
        course={editingCourse}
      />
    </AppShell>
  );
}
