import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Search, Bell, Globe } from "lucide-react";
import Sidebar from "./sidebar";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("ar");

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-slate-500">لوحة التحكم</span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Search */}
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="البحث في القضايا والعملاء..."
              className="w-80 pl-10 pr-4 bg-white border border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>

          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-language">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setCurrentLanguage("ar")}
                className={`cursor-pointer ${currentLanguage === "ar" ? "bg-primary-50 text-primary-600" : ""}`}
                data-testid="menu-language-arabic"
              >
                <span className="ml-2">🇸🇦</span>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setCurrentLanguage("en")}
                className={`cursor-pointer ${currentLanguage === "en" ? "bg-primary-50 text-primary-600" : ""}`}
                data-testid="menu-language-english"
              >
                <span className="ml-2">🇺🇸</span>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
