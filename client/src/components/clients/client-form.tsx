import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertClientSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Loader2 } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/language-context";

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "اسم العميل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
});

interface ClientFormProps {
  client?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClientForm({ client: editClient, onClose, onSuccess }: ClientFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();
  const form = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: editClient?.name || "",
      email: editClient?.email || "",
      phone: editClient?.phone || "",
      address: editClient?.address || "",
      nationalId: editClient?.nationalId || "",
      notes: editClient?.notes || "",
      createdBy: user?.id || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clientFormSchema>) => {
      const res = await apiRequest("POST", "/api/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "تم إنشاء العميل بنجاح" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء العميل", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clientFormSchema>) => {
      const res = await apiRequest("PUT", `/api/clients/${editClient.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "تم تحديث العميل بنجاح" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "خطأ في تحديث العميل", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof clientFormSchema>) => {
    if (editClient) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العميل</FormLabel>
                    <FormControl>
                      <Input placeholder="محمد أحمد السالم" {...field} data-testid="input-client-name" className="bg-white border border-gray-200 focus:border-primary-300 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="0501234567" {...field} data-testid="input-client-phone" className="bg-white border border-gray-200 focus:border-primary-300 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="mohammed@example.com" 
                        {...field} 
                        data-testid="input-client-email"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهوية</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} data-testid="input-client-national-id" className="bg-white border border-gray-200 focus:border-primary-300 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="العنوان التفصيلي للعميل"
                      rows={3}
                      {...field} 
                      data-testid="textarea-client-address"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="ملاحظات إضافية عن العميل"
                      rows={3}
                      {...field} 
                      data-testid="textarea-client-notes"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <div className={`flex justify-end space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Button type="button" onClick={onClose} data-testid="button-cancel" className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-lg">
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-save-client" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
                    جاري الحفظ...
                  </>
                ) : (
                  editClient ? "تحديث العميل" : "إنشاء العميل"
                )}
              </Button>
            </div>
          </form>
        </Form>
  );
}
