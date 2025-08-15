import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Search, Calendar, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLanguage } from "@/contexts/language-context";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  caseId?: string;
  assignedToId: string;
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onEdit: (taskData: Task) => void;
}

export default function TaskList({ tasks, isLoading, onEdit }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t("tasks.deleteSuccess") });
    },
    onError: () => {
      toast({ title: t("tasks.deleteError"), variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t("tasks.updateSuccess") });
    },
    onError: () => {
      toast({ title: t("tasks.updateError"), variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "outline",
      in_progress: "default",
      completed: "secondary",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "معلقة",
      in_progress: "قيد التنفيذ",
      completed: "مكتملة",
      cancelled: "ملغية",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
      urgent: "destructive",
    };

    const labels: Record<string, string> = {
      high: "عالية",
      medium: "متوسطة",
      low: "منخفضة",
      urgent: "عاجلة",
    };

    return (
      <Badge variant={variants[priority] || "outline"}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  const filteredTasks =
    tasks?.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    }) || [];

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("tasks.list")}
          </h2>
          <div className="flex space-x-4 space-x-reverse">
            <div className="relative w-80">
              <Input
                placeholder="البحث في المهام..."
                disabled
                className="pl-10 bg-white border-0 shadow-md"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>
        </div>
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-100 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex space-x-2 space-x-reverse">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex space-x-2 space-x-reverse">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {" "}
          {t("tasks.list")}{" "}
        </h2>
        <div className="flex space-x-4 space-x-reverse">
          <div className="relative w-80">
            <Input
              placeholder={t("tasks.searchTasksPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-0 shadow-md"
              data-testid="input-search-tasks"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
        </div>
      </div>

      <Card className="bg-white shadow-md border-0">
        <CardContent className="p-6">
          <div className="flex space-x-4 space-x-reverse mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-40 bg-white border border-gray-200 focus:border-primary-300 transition-all"
                data-testid="select-filter-status"
              >
                <SelectValue placeholder="تصفية الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem
                  value="all"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.all_statuses")}{" "}
                </SelectItem>
                <SelectItem
                  value="pending"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.pending")}{" "}
                </SelectItem>
                <SelectItem
                  value="in_progress"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.in_progress")}{" "}
                </SelectItem>
                <SelectItem
                  value="completed"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.completed")}{" "}
                </SelectItem>
                <SelectItem
                  value="cancelled"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.cancelled")}{" "}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger
                className="w-40 bg-white border border-gray-200 focus:border-primary-300 transition-all"
                data-testid="select-filter-priority"
              >
                <SelectValue placeholder="تصفية الأولوية" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem
                  value="all"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.priority_filter")}{" "}
                </SelectItem>
                <SelectItem
                  value="low"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.low")}{" "}
                </SelectItem>
                <SelectItem
                  value="medium"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.medium")}{" "}
                </SelectItem>
                <SelectItem
                  value="high"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.high")}{" "}
                </SelectItem>
                <SelectItem
                  value="urgent"
                  className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                >
                  {t("tasks.urgent")}{" "}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">
                {searchQuery ||
                statusFilter !== "all" ||
                priorityFilter !== "all"
                  ? t("tasks.noTasksFiltered")
                  : t("tasks.noTasks")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  data-testid={`task-card-${task.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-slate-600 text-sm mb-3">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-500">
                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 ml-1" />
                          {format(new Date(task.dueDate), "PPP", {
                            locale: ar,
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 space-x-reverse">
                      {task.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: task.id,
                              status: "completed",
                            })
                          }
                          data-testid={`button-complete-task-${task.id}`}
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          {t("tasks.complete")}{" "}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(task)}
                        data-testid={`button-edit-task-${task.id}`}
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        {t("tasks.edit")}{" "}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-task-${task.id}`}
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            {t("tasks.delete")}{" "}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {" "}
                              {t("tasks.deleteConfirmationTitle")}{" "}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("tasks.deleteConfirmationTitle", {
                                name: task.title,
                              })}{" "}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("tasks.cancel")}{" "}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(task.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t("tasks.delete")}{" "}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
