import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import CaseForm from "@/components/cases/case-form";
import CaseList from "@/components/cases/case-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function Cases() {
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const { t, isRTL } = useLanguage();

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
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t('cases.title')}</h1>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            data-testid="button-add-case"
          >
            <Plus className={`${isRTL ? "mr-2" : "ml-2"} w-4 h-4 text-white`} />
            {t('cases.addNew')}
          </Button>
        </div>

        <CaseList 
          cases={cases} 
          isLoading={isLoading}
          onEdit={handleEdit}
        />

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingCase ? t('cases.edit') : t('cases.addNew')}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingCase ? t('cases.editForm') : t('cases.addForm')}
              </DialogDescription>
            </DialogHeader>
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <CaseForm 
                  case={editingCase} 
                  onClose={handleFormClose}
                  onSuccess={handleFormClose}
                />
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
