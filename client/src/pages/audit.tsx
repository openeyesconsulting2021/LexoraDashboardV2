import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Search, Activity, User, FileText, Briefcase, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function Audit() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: auditLogs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      user_registered: "default",
      user_login: "secondary",
      user_logout: "outline",
      user_updated: "default",
      client_created: "default",
      client_updated: "secondary",
      client_deleted: "destructive",
      case_created: "default",
      case_updated: "secondary",
      case_deleted: "destructive",
      task_created: "default",
      task_updated: "secondary",
      task_deleted: "destructive",
      document_uploaded: "default",
      document_deleted: "destructive",
    };
    
    const labels: Record<string, string> = {
      user_registered: "تسجيل مستخدم",
      user_login: "تسجيل دخول",
      user_logout: "تسجيل خروج",
      user_updated: "تحديث مستخدم",
      client_created: "إنشاء عميل",
      client_updated: "تحديث عميل",
      client_deleted: "حذف عميل",
      case_created: "إنشاء قضية",
      case_updated: "تحديث قضية",
      case_deleted: "حذف قضية",
      task_created: "إنشاء مهمة",
      task_updated: "تحديث مهمة",
      task_deleted: "حذف مهمة",
      document_uploaded: "رفع مستند",
      document_deleted: "حذف مستند",
    };

    return (
      <Badge variant={variants[action] || "outline"}>
        {labels[action] || action}
      </Badge>
    );
  };

  const getTableIcon = (tableName: string) => {
    const icons: Record<string, React.ReactNode> = {
      users: <User className="w-4 h-4" />,
      clients: <Users className="w-4 h-4" />,
      cases: <Briefcase className="w-4 h-4" />,
      tasks: <Activity className="w-4 h-4" />,
      documents: <FileText className="w-4 h-4" />,
    };

    return icons[tableName] || <Activity className="w-4 h-4" />;
  };

  const filteredLogs = auditLogs?.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ipAddress?.includes(searchQuery)
  ) || [];

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden" dir="rtl">
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-900">سجل الأنشطة</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>سجل الأنشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">سجل الأنشطة</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>سجل الأنشطة</CardTitle>
                <div className="relative w-80">
                  <Input
                    placeholder="البحث في الأنشطة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-audit"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    {searchQuery ? "لا توجد أنشطة مطابقة لبحثك" : "لا توجد أنشطة"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid={`audit-log-${log.id}`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          {getTableIcon(log.tableName)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse mb-1">
                            {getActionBadge(log.action)}
                            <span className="text-sm text-slate-600">على جدول {log.tableName}</span>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse text-xs text-slate-500">
                            {log.ipAddress && (
                              <span>IP: {log.ipAddress}</span>
                            )}
                            {log.recordId && (
                              <span>ID: {log.recordId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end text-xs text-slate-500">
                        <div className="flex items-center mb-1">
                          <Calendar className="w-3 h-3 ml-1" />
                          {format(new Date(log.createdAt), "PPpp", { locale: ar })}
                        </div>
                        {log.userId && (
                          <span>المستخدم: {log.userId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
