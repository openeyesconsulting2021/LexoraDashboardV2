import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import ClientForm from "@/components/clients/client-form";
import ClientList from "@/components/clients/client-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import ClientDetailsForm from "@/components/clients/client-form-view";

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const { t, isRTL } = useLanguage();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  }) as { data: any; isLoading: boolean };

  const handleEdit = (clientData: any) => {
    setEditingClient(clientData);
    setShowForm(true);
  };
  const handleShow = (clientData: any) => {
    setViewClient(clientData);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClient(null);
  };
  const handleDetailsClose = () => {
    setShowDetails(false);
    setViewClient(null);
  };
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {t("clients.title")}
          </h1>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            data-testid="button-add-client"
          >
            <Plus className={`${isRTL ? "mr-2" : "ml-2"} w-4 h-4 text-white`} />
            {t("clients.addNew")}
          </Button>
        </div>

        <ClientList
          clients={clients}
          isLoading={isLoading}
          onEdit={handleEdit}
          onShow={handleShow}
        />

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingClient ? t("clients.edit") : t("clients.addNew")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingClient ? t("clients.editForm") : t("clients.addForm")}
              </DialogDescription>
            </DialogHeader>
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <ClientForm
                  client={editingClient}
                  onClose={handleFormClose}
                  onSuccess={handleFormClose}
                />
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {t("clients.view")}
              </DialogTitle>
            </DialogHeader>
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <ClientDetailsForm
                  client={viewClient}
                  onClose={handleDetailsClose}
                  onSuccess={handleDetailsClose}
                />
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
