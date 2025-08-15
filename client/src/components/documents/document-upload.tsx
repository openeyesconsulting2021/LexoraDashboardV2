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
import { X, Loader2, Upload, FileText } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/language-context";

interface DocumentUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUpload({
  onClose,
  onSuccess,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isRTL } = useLanguage();
  const { data: cases } = useQuery({
    queryKey: ["/api/cases"],
  }) as { data: any[] | undefined };

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  }) as { data: any[] | undefined };
  const uploadFormSchema = z.object({
    title: z.string().min(1, t("documents.validation.documentTitleRequired")),
    documentType: z
      .string()
      .min(1, t("documents.validation.documentTypeRequired")),
    caseId: z.string().optional(),
    clientId: z.string().optional(),
  });

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
        throw new Error(t("documents.errors.noFileSelected"));
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
        throw new Error(t("documents.errors.uploadFailed"));
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t("documents.success.uploadSuccess") });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: t("documents.errors.uploadError"),
        description: error.message,
        variant: "destructive",
      });
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload Area */}
        <div className="space-y-4">
          <Label> {t("documents.labels.selectFile")}</Label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="mx-auto h-12 w-12 text-green-500" />
                <p className="text-sm font-medium text-slate-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  {t("documents.labels.removeFile")}{" "}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <p className="text-slate-600">
                  {" "}
                  {t("documents.labels.uploadInstruction")}{" "}
                </p>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span> {t("documents.labels.selectFile")} </span>
                  </Button>
                </Label>
                <p className="text-xs text-slate-500">
                  PDF, DOC, DOCX, JPG, PNG حتى 10MB
                </p>
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
              <FormLabel>{t("documents.labels.documentTitle")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("documents.placeholders.documentTitle")}
                  {...field}
                  data-testid="input-document-title"
                  className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                />
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
              <FormLabel> {t("documents.labels.documentTitle")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    data-testid="select-document-type"
                    className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                  >
                    <SelectValue
                      placeholder={t(
                        "documents.placeholders.selectDocumentType"
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem
                    value="case_file"
                    className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                  >
                    {t("documents.case_documents")}
                  </SelectItem>
                  <SelectItem
                    value="client_correspondence"
                    className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                  >
                    {t("documents.client_correspondence")}
                  </SelectItem>
                  <SelectItem
                    value="court_document"
                    className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                  >
                    {t("documents.court_documents")}{" "}
                  </SelectItem>
                  <SelectItem
                    value="contract"
                    className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                  >
                    {t("documents.contracts_agreements")}{" "}
                  </SelectItem>
                  <SelectItem
                    value="other"
                    className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                  >
                    {t("documents.other")}{" "}
                  </SelectItem>
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
                <FormLabel> {t("documents.link_to_case_optional")} </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      data-testid="select-case"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    >
                      <SelectValue placeholder={t("documents.select_case")} />
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

          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("documents.link_to_client_optional")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      data-testid="select-client"
                      className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                    >
                      <SelectValue placeholder={t("documents.select_client")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {clients?.map((client: any) => (
                      <SelectItem
                        key={client.id}
                        value={client.id}
                        className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                      >
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
            disabled={isLoading || !selectedFile}
            data-testid="button-upload"
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
                {t("documents.uploading")}{" "}
              </>
            ) : (
              <>
                <Upload className="ml-2 h-4 w-4 text-white" />
                {t("documents.upload_document")}{" "}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
