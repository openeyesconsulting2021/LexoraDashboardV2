import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  caseType: string;
  clientId: string;
  assignedLawyerId: string;
  court?: string;
  description?: string;
  createdAt: string;
}

interface CaseListProps {
  cases: Case[] | undefined;
  isLoading: boolean;
  onEdit: (caseData: Case) => void;
}

export default function CaseList({ cases, isLoading, onEdit }: CaseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      toast({ title: "تم حذف القضية بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف القضية", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      closed: "outline",
      archived: "destructive",
    };
    
    const labels: Record<string, string> = {
      active: "نشطة",
      pending: "معلقة",
      closed: "مغلقة",
      archived: "مؤرشفة",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
      urgent: "destructive",
    };
    
    const labels: Record<string, string> = {
      high: "عالية",
      medium: "متوسطة",
      low: "منخفضة",
      urgent: "عاجلة",
    };

    return (
      <Badge variant={variants[priority] || "outline"}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  const filteredCases = cases?.filter(caseItem =>
    caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.caseType.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">قائمة القضايا</h2>
          <div className="relative w-80">
            <Input
              placeholder="البحث في القضايا..."
              disabled
              className="pl-10 bg-white border-0 shadow-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
        </div>
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
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
        <h2 className="text-xl font-semibold text-slate-900">قائمة القضايا</h2>
        <div className="relative w-80">
          <Input
            placeholder="البحث في القضايا..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-0 shadow-md"
            data-testid="input-search-cases"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
      </div>
      
      <Card className="bg-white shadow-md border-0">
        <CardContent className="p-6">
          {filteredCases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">
                {searchQuery ? "لا توجد قضايا مطابقة لبحثك" : "لا توجد قضايا"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      رقم القضية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      الأولوية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      المحكمة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredCases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-slate-50" data-testid={`case-row-${caseItem.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {caseItem.caseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 max-w-xs truncate">
                        {caseItem.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {caseItem.caseType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(caseItem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(caseItem.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {caseItem.court || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2 space-x-reverse">
                          <Button variant="ghost" size="sm" data-testid={`button-view-case-${caseItem.id}`}>
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onEdit(caseItem)}
                            data-testid={`button-edit-case-${caseItem.id}`}
                          >
                            <Edit className="w-4 h-4 ml-1" />
                            تعديل
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" data-testid={`button-delete-case-${caseItem.id}`}>
                                <Trash2 className="w-4 h-4 ml-1" />
                                حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف القضية "{caseItem.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-red-500 hover:bg-red-600 text-white ml-2">إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(caseItem.id)}
                                  className="bg-primary-600 hover:bg-primary-700 text-white"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
