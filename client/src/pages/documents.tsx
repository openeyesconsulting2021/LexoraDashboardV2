import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import DocumentUpload from "@/components/documents/document-upload";
import DocumentList from "@/components/documents/document-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function Documents() {
  const [showUpload, setShowUpload] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
  }) as { data: any; isLoading: boolean };

  const handleUploadClose = () => {
    setShowUpload(false);
  };

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">إدارة المستندات</h1>
            <Button 
              onClick={() => setShowUpload(true)} 
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              data-testid="button-upload-document"
            >
              <Upload className="ml-2 w-4 h-4 text-white" />
              رفع مستند جديد
            </Button>
          </div>

          <DocumentList 
            documents={documents} 
            isLoading={isLoading}
          />

          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  رفع مستند جديد
                </DialogTitle>
                <DialogDescription className="sr-only">
                  نموذج رفع مستند جديد
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
        </main>
      </div>
    </div>
  );
}
