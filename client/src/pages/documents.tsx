import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import DocumentUpload from "@/components/documents/document-upload";
import DocumentList from "@/components/documents/document-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function Documents() {
  const [showUpload, setShowUpload] = useState(false);
  const { t, isRTL } = useLanguage();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
  }) as { data: any; isLoading: boolean };

  const handleUploadClose = () => {
    setShowUpload(false);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t('documents.title')}</h1>
          <Button 
            onClick={() => setShowUpload(true)} 
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            data-testid="button-upload-document"
          >
            <Upload className={`${isRTL ? "mr-2" : "ml-2"} w-4 h-4 text-white`} />
            {t('documents.upload')}
          </Button>
        </div>

        <DocumentList 
          documents={documents} 
          isLoading={isLoading}
        />

        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {t('documents.upload')}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t('documents.uploadForm')}
                </DialogDescription>
              </DialogHeader>
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <DocumentUpload 
                    onClose={handleUploadClose}
                    onSuccess={handleUploadClose}
                  />
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
      </div>
    </MainLayout>
  );
}
