import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, Search, Bell, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import Sidebar from "./sidebar";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language, changeLanguage, t, isRTL } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Breadcrumbs */}
        <div
          className={`hidden md:flex items-center space-x-2 ${
            isRTL ? "space-x-reverse" : ""
          }`}
        >
          <span className="text-sm text-slate-500">
            {t("navigation.dashboard")}
          </span>
        </div>

        {/* Header Actions */}
        <div
          className={`flex items-center space-x-4 ${
            isRTL ? "space-x-reverse" : ""
          }`}
        >
          {/* Search */}
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder={t("header.search")}
              className="w-80 pl-10 pr-4 bg-white border border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>

          {/* Language Select */}
          <Select value={language} onValueChange={changeLanguage}>
            <SelectTrigger
              className="w-10 h-10 p-0 border-0 bg-transparent hover:bg-gray-100 transition-colors"
              data-testid="select-language"
            >
              <Globe className="h-5 w-5" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem
                value="ar"
                className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                data-testid="option-language-arabic"
              >
                <span className="ml-2">🇸🇦</span>
                {t("languages.ar")}
              </SelectItem>
              <SelectItem
                value="fr"
                className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                data-testid="option-language-french"
              >
                <span className="ml-2">🇫🇷</span>
                {t("languages.fr")}
              </SelectItem>
              <SelectItem
                value="en"
                className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                data-testid="option-language-english"
              >
                <span className="ml-2">🇺🇸</span>
                {t("languages.en")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
