import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertCaseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Loader2 } from "lucide-react";
import { z } from "zod";

const caseFormSchema = insertCaseSchema.extend({
  caseNumber: z.string().min(1, "رقم القضية مطلوب"),
  title: z.string().min(1, "عنوان القضية مطلوب"),
  caseType: z.string().min(1, "نوع القضية مطلوب"),
  clientId: z.string().min(1, "العميل مطلوب"),
  assignedLawyerId: z.string().min(1, "المحامي المسؤول مطلوب"),
});

interface CaseFormProps {
  case?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CaseForm({ case: editCase, onClose, onSuccess }: CaseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  }) as { data: any[] | undefined };

  const { data: lawyers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()).then(users => 
      users.filter((u: any) => u.role === "lawyer" || u.role === "admin")
    ),
  });

  const form = useForm({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      caseNumber: editCase?.caseNumber || "",
      title: editCase?.title || "",
      description: editCase?.description || "",
      status: editCase?.status || "active",
      priority: editCase?.priority || "medium",
      caseType: editCase?.caseType || "",
      court: editCase?.court || "",
      judge: editCase?.judge || "",
      opposingParty: editCase?.opposingParty || "",
      clientId: editCase?.clientId || "",
      assignedLawyerId: editCase?.assignedLawyerId || "",
      createdBy: user?.id || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof caseFormSchema>) => {
      const res = await apiRequest("POST", "/api/cases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "تم إنشاء القضية بنجاح" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء القضية", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof caseFormSchema>) => {
      const res = await apiRequest("PUT", `/api/cases/${editCase.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "تم تحديث القضية بنجاح" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "خطأ في تحديث القضية", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof caseFormSchema>) => {
    if (editCase) {
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
          {editCase ? "تعديل القضية" : "إضافة قضية جديدة"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-form">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم القضية</FormLabel>
                    <FormControl>
                      <Input placeholder="C-2024-001" {...field} data-testid="input-case-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العميل</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client">
                          <SelectValue placeholder="اختر العميل" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان القضية</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان القضية" {...field} data-testid="input-case-title" />
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
                  <FormLabel>وصف القضية</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="وصف تفصيلي للقضية"
                      rows={3}
                      {...field} 
                      data-testid="textarea-case-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="caseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع القضية</FormLabel>
                    <FormControl>
                      <Input placeholder="نزاع تجاري" {...field} data-testid="input-case-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="active">نشطة</SelectItem>
                        <SelectItem value="pending">معلقة</SelectItem>
                        <SelectItem value="closed">مغلقة</SelectItem>
                        <SelectItem value="archived">مؤرشفة</SelectItem>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assignedLawyerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المحامي المسؤول</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-lawyer">
                          <SelectValue placeholder="اختر المحامي" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lawyers?.map((lawyer: any) => (
                          <SelectItem key={lawyer.id} value={lawyer.id}>
                            {lawyer.fullName}
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
                name="court"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المحكمة</FormLabel>
                    <FormControl>
                      <Input placeholder="المحكمة التجارية" {...field} data-testid="input-court" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="judge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القاضي</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم القاضي" {...field} data-testid="input-judge" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opposingParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الطرف المقابل</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الطرف المقابل" {...field} data-testid="input-opposing-party" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-save-case">
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  editCase ? "تحديث القضية" : "إنشاء القضية"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
