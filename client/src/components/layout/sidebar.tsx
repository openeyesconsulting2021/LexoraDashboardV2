import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  Scale, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  ShieldQuestion, 
  History, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    name: "لوحة التحكم",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "lawyer", "secretary"],
  },
  {
    name: "القضايا",
    href: "/cases",
    icon: Briefcase,
    roles: ["admin", "lawyer", "secretary"],
    badge: "12",
  },
  {
    name: "العملاء",
    href: "/clients",
    icon: Users,
    roles: ["admin", "lawyer", "secretary"],
  },
  {
    name: "المستندات",
    href: "/documents",
    icon: FileText,
    roles: ["admin", "lawyer", "secretary"],
  },
  {
    name: "المهام",
    href: "/tasks",
    icon: CheckSquare,
    roles: ["admin", "lawyer", "secretary"],
    badge: "5",
  },
  {
    name: "التقارير",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "lawyer"],
  },
];

const adminItems = [
  {
    name: "المستخدمين",
    href: "/users",
    icon: ShieldQuestion,
    roles: ["admin"],
  },
  {
    name: "سجل الأنشطة",
    href: "/audit",
    icon: History,
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-l border-slate-200">
        {/* Logo and Brand */}
        <div className="flex items-center px-6 pb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Scale className="text-white w-4 h-4" />
            </div>
            <div className="mr-3">
              <h1 className="text-lg font-bold text-slate-900">Lexora</h1>
              <p className="text-xs text-slate-500">نظام إدارة قانوني</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 pb-4 border-b border-slate-100">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user.fullName.charAt(0)}
              </span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-slate-900" data-testid="text-username">
                {user.fullName}
              </p>
              <p className="text-xs text-slate-500" data-testid="text-user-role">
                {user.role === "admin" ? "مدير" : 
                 user.role === "lawyer" ? "محامي" : "سكرتير"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            if (!item.roles.includes(user.role)) return null;
            
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-white bg-primary-600"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  data-testid={`nav-${item.href.slice(1) || 'dashboard'}`}
                >
                  <Icon className="ml-3 w-4 h-4" />
                  {item.name}
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className="mr-auto text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Admin Only Navigation */}
          {user.role === "admin" && (
            <div className="pt-4 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                الإدارة
              </p>
              {adminItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                        isActive
                          ? "text-white bg-primary-600"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                      data-testid={`nav-${item.href.slice(1)}`}
                    >
                      <Icon className="ml-3 w-4 h-4" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Settings and Logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          <Link href="/settings">
            <a
              className="group flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 mb-2"
              data-testid="nav-settings"
            >
              <Settings className="ml-3 w-4 h-4" />
              الإعدادات
            </a>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="ml-3 w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
