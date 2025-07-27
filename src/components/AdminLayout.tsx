import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface AdminLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  groupLabel: string;
}

export function AdminLayout({ children, menuItems, groupLabel }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="ml-2" />
      </header>

      <div className="flex min-h-screen w-full">
        <AdminSidebar menuItems={menuItems} groupLabel={groupLabel} />
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}