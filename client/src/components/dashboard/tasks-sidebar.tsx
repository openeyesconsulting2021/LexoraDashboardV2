import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  status: string;
}

interface TasksSidebarProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
}

export default function TasksSidebar({ tasks, isLoading }: TasksSidebarProps) {
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500",
      medium: "bg-amber-500",
      low: "bg-primary-500",
      urgent: "bg-red-600",
    };
    return colors[priority] || "bg-slate-500";
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle>المهام القادمة</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 space-x-reverse">
              <Skeleton className="w-2 h-2 rounded-full mt-2" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const upcomingTasks = tasks?.filter(task => task.status === "pending").slice(0, 5) || [];

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle>المهام القادمة</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm">لا توجد مهام معلقة</p>
          </div>
        ) : (
          <>
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 space-x-reverse" data-testid={`task-${task.id}`}>
                <div className={`w-2 h-2 ${getPriorityColor(task.priority)} rounded-full mt-2 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900" data-testid={`task-title-${task.id}`}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-xs text-slate-500 mt-1" data-testid={`task-date-${task.id}`}>
                      {format(new Date(task.dueDate), "PPP", { locale: ar })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            <Link href="/tasks">
              <Button 
                variant="ghost" 
                className="w-full text-center text-sm font-medium pt-4 border-t border-slate-100"
                data-testid="button-view-all-tasks"
              >
                عرض جميع المهام
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
