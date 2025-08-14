import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Scale, CheckSquare, FileText } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const quickActions = [
    {
      icon: UserPlus,
      label: "إضافة عميل",
      description: "إضافة عميل جديد للنظام",
      path: "/clients",
      color: "bg-blue-500 hover:bg-blue-600",
      testId: "button-add-client"
    },
    {
      icon: Scale,
      label: "إضافة قضية",
      description: "إنشاء قضية جديدة",
      path: "/cases",
      color: "bg-green-500 hover:bg-green-600",
      testId: "button-add-case"
    },
    {
      icon: CheckSquare,
      label: "إضافة مهمة",
      description: "إنشاء مهمة جديدة",
      path: "/tasks",
      color: "bg-purple-500 hover:bg-purple-600",
      testId: "button-add-task"
    },
    {
      icon: FileText,
      label: "إضافة وثيقة",
      description: "رفع وثيقة جديدة",
      path: "/documents",
      color: "bg-orange-500 hover:bg-orange-600",
      testId: "button-add-document"
    }
  ];

  return (
    <Card className="shadow-md hover:shadow-lg rounded-xl border-0 transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          الإجراءات السريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.path}
                variant="outline"
                className={`${action.color} text-white border-0 rounded-lg h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200`}
                onClick={() => setLocation(action.path)}
                data-testid={action.testId}
              >
                <Icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-90 mt-1">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}