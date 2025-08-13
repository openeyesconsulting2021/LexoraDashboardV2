import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ClientForm from "@/components/clients/client-form";
import ClientList from "@/components/clients/client-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  }) as { data: any; isLoading: boolean };

  const handleEdit = (clientData: any) => {
    setEditingClient(clientData);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">إدارة العملاء</h1>
            <Button onClick={() => setShowForm(true)} data-testid="button-add-client">
              <Plus className="ml-2 w-4 h-4" />
              إضافة عميل جديد
            </Button>
          </div>

          {showForm ? (
            <ClientForm 
              client={editingClient} 
              onClose={handleFormClose}
              onSuccess={handleFormClose}
            />
          ) : (
            <ClientList 
              clients={clients} 
              isLoading={isLoading}
              onEdit={handleEdit}
            />
          )}
        </main>
      </div>
    </div>
  );
}
