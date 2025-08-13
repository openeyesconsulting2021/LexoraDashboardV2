import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Loader2, Upload, FileText } from "lucide-react";
import { z } from "zod";

const uploadFormSchema = z.object({
  title: z.string().min(1, "عنوان المستند مطلوب"),
  documentType: z.string().min(1, "نوع المستند مطلوب"),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
});

interface DocumentUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUpload({ onClose, onSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases } = useQuery({
    queryKey: ["/api/cases"],
  }) as { data: any[] | undefined };

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  }) as { data: any[] | undefined };

  const form = useForm({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      documentType: "",
      caseId: "",
      clientId: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: z.infer<typeof uploadFormSchema>) => {
      if (!selectedFile) {
        throw new Error("لم يتم اختيار ملف");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", data.title);
      formData.append("documentType", data.documentType);
      if (data.caseId) formData.append("caseId", data.caseId);
      if (data.clientId) formData.append("clientId", data.clientId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("فشل في رفع المستند");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "تم رفع المستند بنجاح" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في رفع المستند", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof uploadFormSchema>) => {
    uploadMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!form.getValues("title")) {
        form.setValue("title", file.name);
      }
    }
  };

  const isLoading = uploadMutation.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>رفع مستند جديد</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-upload">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <Label>اختيار الملف</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                    <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      إزالة الملف
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="text-slate-600">اسحب وأفلت الملف هنا أو</p>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>اختر الملف</span>
                      </Button>
                    </Label>
                    <p className="text-xs text-slate-500">PDF, DOC, DOCX, JPG, PNG حتى 10MB</p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  data-testid="input-file"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان المستند</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان المستند" {...field} data-testid="input-document-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المستند</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-document-type">
                        <SelectValue placeholder="اختر نوع المستند" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="case_file">مستندات القضية</SelectItem>
                      <SelectItem value="client_correspondence">مراسلات العميل</SelectItem>
                      <SelectItem value="court_document">أوراق المحكمة</SelectItem>
                      <SelectItem value="contract">عقود واتفاقيات</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ربط بعميل (اختياري)</FormLabel>
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

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !selectedFile} 
                data-testid="button-upload"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-4 w-4" />
                    رفع المستند
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
