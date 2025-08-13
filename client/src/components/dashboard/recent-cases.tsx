import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit } from "lucide-react";
import { Link } from "wouter";

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  clientId: string;
}

interface RecentCasesProps {
  cases: Case[] | undefined;
  isLoading: boolean;
}

export default function RecentCases({ cases, isLoading }: RecentCasesProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      closed: "outline",
    };
    
    const labels: Record<string, string> = {
      active: "نشطة",
      pending: "معلقة",
      closed: "مغلقة",
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

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle>القضايا الحديثة</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
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
    );
  }

  const recentCases = cases?.slice(0, 5) || [];

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle>القضايا الحديثة</CardTitle>
          <Link href="/cases">
            <Button variant="ghost" size="sm" data-testid="button-view-all-cases">
              عرض الكل
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      {recentCases.length === 0 ? (
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-500">لا توجد قضايا حديثة</p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-0">
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
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    الأولوية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-slate-50" data-testid={`case-row-${caseItem.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {caseItem.caseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {caseItem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(caseItem.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(caseItem.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2 space-x-reverse">
                        <Button variant="ghost" size="sm" data-testid={`button-view-case-${caseItem.id}`}>
                          <Eye className="w-4 h-4 ml-1" />
                          عرض
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-case-${caseItem.id}`}>
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
