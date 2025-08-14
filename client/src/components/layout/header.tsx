import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Search, Bell, Plus } from "lucide-react";
import Sidebar from "./sidebar";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

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

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
          </Button>

          {/* Quick Actions */}
          <Button className="hidden md:flex" data-testid="button-quick-actions">
            <Plus className="ml-2 w-4 h-4" />
            إجراء سريع
          </Button>
        </div>
      </div>
    </header>
  );
}
