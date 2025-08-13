import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentCases from "@/components/dashboard/recent-cases";
import TasksSidebar from "@/components/dashboard/tasks-sidebar";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  }) as { data: any; isLoading: boolean };

  const { data: recentCases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/cases"],
  }) as { data: any; isLoading: boolean };

  const { data: userTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: () => fetch(`/api/tasks?userId=${user?.id}`).then(res => res.json()),
  });

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900" data-testid="text-welcome">
              مرحباً، {user?.fullName}
            </h2>
            <p className="text-slate-600 mt-1">
              إليك نظرة عامة على نشاط مكتبك القانوني اليوم
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} isLoading={statsLoading} />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Cases */}
            <div className="lg:col-span-2">
              <RecentCases cases={recentCases} isLoading={casesLoading} />
            </div>

            {/* Tasks and Notifications */}
            <div className="space-y-6">
              <TasksSidebar tasks={userTasks} isLoading={tasksLoading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
