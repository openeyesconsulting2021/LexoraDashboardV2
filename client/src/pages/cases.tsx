import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import CaseForm from "@/components/cases/case-form";
import CaseList from "@/components/cases/case-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Cases() {
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  const { data: cases, isLoading } = useQuery({
    queryKey: ["/api/cases"],
  }) as { data: any; isLoading: boolean };

  const handleEdit = (caseData: any) => {
    setEditingCase(caseData);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCase(null);
  };

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">إدارة القضايا</h1>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              data-testid="button-add-case"
            >
              <Plus className="ml-2 w-4 h-4 text-white" />
              إضافة قضية جديدة
            </Button>
          </div>

          {showForm ? (
            <CaseForm 
              case={editingCase} 
              onClose={handleFormClose}
              onSuccess={handleFormClose}
            />
          ) : (
            <CaseList 
              cases={cases} 
              isLoading={isLoading}
              onEdit={handleEdit}
            />
          )}
        </main>
      </div>
    </div>
  );
}
