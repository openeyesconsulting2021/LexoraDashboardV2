import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, CheckSquare, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats: {
    activeCases: number;
    newClients: number;
    pendingTasks: number;
    recentDocuments: number;
  } | undefined;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const statsData = [
    {
      label: "القضايا النشطة",
      value: stats?.activeCases || 0,
      change: "+12% من الشهر السابق",
      icon: Briefcase,
      color: "bg-primary-100 text-primary-600",
    },
    {
      label: "العملاء الجدد",
      value: stats?.newClients || 0,
      change: "+3 هذا الأسبوع",
      icon: Users,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "المهام المعلقة",
      value: stats?.pendingTasks || 0,
      change: "5 مستحقة اليوم",
      icon: CheckSquare,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "المستندات الجديدة",
      value: stats?.recentDocuments || 0,
      change: "تم رفع 15 اليوم",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600" data-testid={`stat-label-${index}`}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2" data-testid={`stat-value-${index}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1" data-testid={`stat-change-${index}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
