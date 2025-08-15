import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Loader2, Calendar } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/language-context";

interface TaskFormProps {
  task?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({
  task: editTask,
  onClose,
  onSuccess,
}: TaskFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();
  const { t } = useLanguage();
  const { data: cases } = useQuery({
    queryKey: ["/api/cases"],
  }) as { data: any[] | undefined };

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () =>
      fetch("/api/users")
        .then((res) => res.json())
        .then((users) => users.filter((u: any) => u.isActive)),
  }) as { data: any[] | undefined };

  console.log("Users:", users);
  const taskFormSchema = insertTaskSchema.extend({
    title: z.string().min(1, t("tasks.titleRequired")),
    assignedToId: z.string().min(1, t("tasks.assignedToo")),
    dueDate: z.string().optional(),
  });
  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: editTask?.title || "",
      description: editTask?.description || "",
      status: editTask?.status || "pending",
      priority: editTask?.priority || "medium",
      dueDate: editTask?.dueDate
        ? new Date(editTask.dueDate).toISOString().split("T")[0]
        : "",
      caseId: editTask?.caseId || "",
      assignedToId: editTask?.assignedToId || "",
      createdBy: user?.id || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      };
      const res = await apiRequest("POST", "/api/tasks", taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t("tasks.toast.createSuccess") });
      onSuccess();
    },
    onError: () => {
      toast({ title: t("tasks.toast.createError"), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      const res = await apiRequest(
        "PUT",
        `/api/tasks/${editTask.id}`,
        taskData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t("tasks.toast.updateSuccess") });
      onSuccess();
    },
    onError: () => {
      toast({ title: t("tasks.toast.updateError"), variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof taskFormSchema>) => {
    if (editTask) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel> {t("tasks.titleTasks")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("tasks.placeholder")}
                  {...field}
                  data-testid="input-task-title"
                  className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel> {t("tasks.descriptionTasks")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("tasks.descriptionPlaceholder")}
                  rows={3}
                  {...field}
                  data-testid="textarea-task-description"
                  className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("tasks.status")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      data-testid="select-status"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    >
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem
                      value="pending"
                      className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                    >
                      {t("tasks.statuses.pending")}{" "}
                    </SelectItem>
                    <SelectItem
                      value="in_progress"
                      className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                    >
                      {t("tasks.statuses.in_progress")}{" "}
                    </SelectItem>
                    <SelectItem
                      value="completed"
                      className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                    >
                      {t("tasks.statuses.completed")}{" "}
                    </SelectItem>
                    <SelectItem
                      value="cancelled"
                      className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                    >
                      {t("tasks.statuses.cancelled")}{" "}
                    </SelectItem>
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
                <FormLabel> {t("tasks.priority")} </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      data-testid="select-priority"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    >
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
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
                      {t("tasks.high")}
                    </SelectItem>
                    <SelectItem
                      value="urgent"
                      className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                    >
                      {t("tasks.urgent")}
                    </SelectItem>
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
              <FormItem>
                <FormLabel> {t("tasks.dueDate")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      {...field}
                      data-testid="input-due-date"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("tasks.assignedTooo")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      data-testid="select-assigned-to"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    >
                      <SelectValue
                        placeholder={t("tasks.assignedToPlaceholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {users?.map((user: any) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {user.fullName} ({t(`users.roles.${user.role}`)})
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
            name="caseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("tasks.case")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      data-testid="select-case"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    >
                      <SelectValue placeholder={t("tasks.casePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {cases?.map((caseItem: any) => (
                      <SelectItem
                        key={caseItem.id}
                        value={caseItem.id}
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
                        {caseItem.caseNumber} - {caseItem.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div
          className={`flex justify-end space-x-2 ${
            isRTL ? "space-x-reverse" : ""
          }`}
        >
          <Button
            type="button"
            onClick={onClose}
            data-testid="button-cancel"
            className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-lg"
          >
            {t("common.cancel")}{" "}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-save-task"
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
                {t("tasks.saving")}{" "}
              </>
            ) : editTask ? (
              t("tasks.updateButton")
            ) : (
              t("tasks.saveButton")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
