import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Search, Activity, User, FileText, Briefcase, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLanguage } from "@/contexts/language-context";

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
  const { t, isRTL } = useLanguage();

  const { data: auditLogs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      CREATE: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
      LOGIN: "default",
      LOGOUT: "outline",
    };

    return (
      <Badge variant={variants[action] || "outline"}>
        {t(`audit.actions.${action}`) || action}
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

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t("audit.title")}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("audit.list")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t("audit.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? "pr-10" : "pl-10"}`}
                data-testid="input-audit-search"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`flex items-center justify-between p-4 border border-slate-100 rounded-lg`}>
                  <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-3" : "space-x-3"}`}>
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
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? t("audit.noResults") : t("audit.noAudit")}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors`}
                  data-testid={`audit-log-${log.id}`}
                >
                  <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-3" : "space-x-3"}`}>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {getTableIcon(log.tableName)}
                    </div>
                    <div>
                      <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"} mb-1`}>
                        {getActionBadge(log.action)}
                        <span className="text-sm text-slate-600">
                          {t("audit.entityType")}: {log.tableName}
                        </span>
                      </div>
                      <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"} text-xs text-slate-500`}>
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
                    <div className={`flex items-center mb-1`}>
                      <Calendar className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                    </div>
                    {log.userId && (
                      <span>{t("audit.userId")}: {log.userId}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
