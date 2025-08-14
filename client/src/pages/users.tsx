import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Edit, Search, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLanguage } from "@/contexts/language-context";

interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const { t, isRTL } = useLanguage();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "destructive",
      lawyer: "default",
      secretary: "secondary",
    };

    const icons: Record<string, React.ReactNode> = {
      admin: <ShieldCheck className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />,
      lawyer: <Shield className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />,
      secretary: <ShieldX className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />,
    };

    return (
      <Badge variant={variants[role] || "outline"} className="flex items-center">
        {icons[role]}
        {t(`users.roles.${role}`)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "outline"}>
        {isActive ? t("common.yes") : t("common.no")}
      </Badge>
    );
  };

  const filteredUsers = users?.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t("users.title")}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("users.list")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t("users.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? "pr-10" : "pl-10"}`}
                data-testid="input-users-search"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex items-center justify-between p-4 border border-slate-100 rounded-lg`}>
                  <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-4" : "space-x-4"}`}>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className={`flex ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? t("users.noResults") : t("users.noUsers")}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className={`flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors`}>
                  <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-4" : "space-x-4"}`}>
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{user.email}</p>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-3" : "space-x-3"}`}>
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.isActive)}
                    <div className="text-xs text-slate-400">
                      {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ar })}
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-edit-user-${user.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
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
