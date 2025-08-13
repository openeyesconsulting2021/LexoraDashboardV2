import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import DocumentUpload from "@/components/documents/document-upload";
import DocumentList from "@/components/documents/document-list";
import { Button } from "@/components/ui/button";
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
            <Button onClick={() => setShowUpload(true)} data-testid="button-upload-document">
              <Upload className="ml-2 w-4 h-4" />
              رفع مستند جديد
            </Button>
          </div>

          {showUpload ? (
            <DocumentUpload 
              onClose={handleUploadClose}
              onSuccess={handleUploadClose}
            />
          ) : (
            <DocumentList 
              documents={documents} 
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </div>
  );
}
