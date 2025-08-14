import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, Search, Phone, Mail, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nationalId?: string;
  notes?: string;
  createdAt: string;
}

interface ClientListProps {
  clients: Client[] | undefined;
  isLoading: boolean;
  onEdit: (clientData: Client) => void;
}

export default function ClientList({ clients, isLoading, onEdit }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "تم حذف العميل بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف العميل", variant: "destructive" });
    },
  });

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery) ||
    client.nationalId?.includes(searchQuery)
  ) || [];

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">قائمة العملاء</h2>
          <div className="relative w-80">
            <Input
              placeholder="البحث في العملاء..."
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
                <div key={i} className="border border-slate-100 rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex space-x-2 space-x-reverse">
                    <Skeleton className="h-8 w-16" />
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
        <h2 className="text-xl font-semibold text-slate-900">قائمة العملاء</h2>
        <div className="relative w-80">
          <Input
            placeholder="البحث في العملاء..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-0 shadow-md"
            data-testid="input-search-clients"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
      </div>
      <Card className="bg-white shadow-md border-0">
        <CardContent className="p-6">
          {filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">
              {searchQuery ? "لا يوجد عملاء مطابقون لبحثك" : "لا يوجد عملاء"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="border border-slate-200 rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
                data-testid={`client-card-${client.id}`}
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
                  {client.nationalId && (
                    <p className="text-sm text-slate-500">هوية: {client.nationalId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {client.phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-4 h-4 ml-2" />
                      {client.phone}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="w-4 h-4 ml-2" />
                      {client.email}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start text-sm text-slate-600">
                      <MapPin className="w-4 h-4 ml-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-sm text-slate-600 line-clamp-2">{client.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                  <Button variant="ghost" size="sm" data-testid={`button-view-client-${client.id}`}>
                    <Eye className="w-4 h-4 ml-1" />
                    عرض
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(client)}
                    data-testid={`button-edit-client-${client.id}`}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-client-${client.id}`}
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف العميل "{client.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(client.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف
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
