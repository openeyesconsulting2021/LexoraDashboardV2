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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Loader2, Calendar } from "lucide-react";
import { z } from "zod";

const taskFormSchema = insertTaskSchema.extend({
  title: z.string().min(1, "عنوان المهمة مطلوب"),
  assignedToId: z.string().min(1, "المكلف بالمهمة مطلوب"),
  dueDate: z.string().optional(),
});

interface TaskFormProps {
  task?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({ task: editTask, onClose, onSuccess }: TaskFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases } = useQuery({
    queryKey: ["/api/cases"],
  }) as { data: any[] | undefined };

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()).then(users => 
      users.filter((u: any) => u.isActive)
    ),
  }) as { data: any[] | undefined };

  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: editTask?.title || "",
      description: editTask?.description || "",
      status: editTask?.status || "pending",
      priority: editTask?.priority || "medium",
      dueDate: editTask?.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : "",
      caseId: editTask?.caseId || "",
      assignedToId: editTask?.assignedToId || "",
      createdBy: user?.id || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      const res = await apiRequest("POST", "/api/tasks", taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "تم إنشاء المهمة بنجاح" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء المهمة", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      const res = await apiRequest("PUT", `/api/tasks/${editTask.id}`, taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "تم تحديث المهمة بنجاح" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المهمة", variant: "destructive" });
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {editTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-form">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان المهمة</FormLabel>
                  <FormControl>
                    <Input placeholder="مراجعة مستندات القضية" {...field} data-testid="input-task-title" />
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
                  <FormLabel>وصف المهمة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="وصف تفصيلي للمهمة"
                      rows={3}
                      {...field} 
                      data-testid="textarea-task-description"
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
                    <FormLabel>الحالة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">معلقة</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتملة</SelectItem>
                        <SelectItem value="cancelled">ملغية</SelectItem>
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
                    <FormLabel>الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجلة</SelectItem>
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
                    <FormLabel>تاريخ الاستحقاق</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="date"
                          {...field} 
                          data-testid="input-due-date"
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
                    <FormLabel>المكلف بالمهمة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-assigned-to">
                          <SelectValue placeholder="اختر المكلف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName} ({user.role === "admin" ? "مدير" : 
                             user.role === "lawyer" ? "محامي" : "سكرتير"})
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
                    <FormLabel>ربط بقضية (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-case">
                          <SelectValue placeholder="اختر القضية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cases?.map((caseItem: any) => (
                          <SelectItem key={caseItem.id} value={caseItem.id}>
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

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-save-task">
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  editTask ? "تحديث المهمة" : "إنشاء المهمة"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
