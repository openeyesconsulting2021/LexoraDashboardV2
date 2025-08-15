import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { Drill } from "lucide-react";

export default function ComingSoonPage() {
  const { t } = useLanguage();
  return (
    <MainLayout>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4 border-yellow-500">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <Drill className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-yellow-500">
                {t("pageConstruction.title" as never)}
              </h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {t("pageConstruction.description" as never)}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
