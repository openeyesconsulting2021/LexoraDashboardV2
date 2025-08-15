import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Download, Trash2, Search, FileText, File } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLanguage } from "@/contexts/language-context";
interface Document {
  id: string;
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  caseId?: string;
  clientId?: string;
  createdAt: string;
}

interface DocumentListProps {
  documents: Document[] | undefined;
  isLoading: boolean;
}

export default function DocumentList({
  documents,
  isLoading,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isRTL } = useLanguage();
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t("documents.deleteDocumentSuccess") });
    },
    onError: () => {
      toast({
        title: t("documents.deleteDocumentError"),
        variant: "destructive",
      });
    },
  });

  const handleDownload = (documentId: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `/api/documents/${documentId}/download`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      case_file: t("documents.types.case_file"),
      client_correspondence: t("documents.types.client_correspondence"),
      court_document: t("documents.types.court_document"),
      contract: t("documents.types.contract"),
      other: t("documents.types.other"),
    };

    const colors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      case_file: "default",
      client_correspondence: "secondary",
      court_document: "destructive",
      contract: "outline",
      other: "outline",
    };

    return (
      <Badge variant={colors[type] || "outline"}>{labels[type] || type}</Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf"))
      return <File className="w-5 h-5 text-red-500" />;
    if (mimeType.includes("word") || mimeType.includes("document"))
      return <FileText className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes("image"))
      return <File className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const filteredDocuments =
    documents?.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("documents.titleDocument")}{" "}
          </h2>
          <div className="relative w-80">
            <Input
              placeholder={t("documents.searchPlaceholder")}
              disabled
              className="pl-10 bg-white border-0 shadow-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
        </div>
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-100 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
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
          {t("documents.titleDocument")}
        </h2>
        <div className="relative w-80">
          <Input
            placeholder={t("documents.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-0 shadow-md"
            data-testid="input-search-documents"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
      </div>
      <Card className="bg-white shadow-md border-0">
        <CardContent className="p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">
                {searchQuery
                  ? t("documents.noMatchingDocuments")
                  : t("documents.noDocumentsFound")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="border border-slate-200 rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
                  data-testid={`document-card-${document.id}`}
                >
                  <div
                    className={`flex items-start space-x-3 ${
                      isRTL ? "space-x-reverse" : ""
                    }`}
                  >
                    {getFileIcon(document.mimeType)}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {document.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {document.filename}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(document.fileSize)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {getDocumentTypeBadge(document.documentType)}
                    <p
                      className={`text-xs text-slate-500 ${
                        isRTL ? "mr-2" : "ml-2"
                      }`}
                    >
                      {format(new Date(document.createdAt), "PPP", {
                        locale: ar,
                      })}
                    </p>
                  </div>

                  <div
                    className={`flex justify-end space-x-2 ${
                      isRTL ? "space-x-reverse" : ""
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDownload(document.id, document.filename)
                      }
                      data-testid={`button-download-document-${document.id}`}
                    >
                      <Download className="w-4 h-4 ml-1" />
                      {t("documents.download")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-document-${document.id}`}
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          {t("common.delete")}{" "}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {" "}
                            {t("documents.confirmDelete")}{" "}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("documents.deleteConfirmationMessage", {
                              name: document.title,
                            })}{" "}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {" "}
                            {t("common.cancel")}{" "}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(document.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {t("common.delete")}{" "}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
