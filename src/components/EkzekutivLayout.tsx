import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EkzekutivSidebar } from "./EkzekutivSidebar";

interface EkzekutivLayoutProps {
  children: ReactNode;
}

export function EkzekutivLayout({ children }: EkzekutivLayoutProps) {
  return (
    <SidebarProvider>
      <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="ml-2" />
      </header>

      <div className="flex min-h-screen w-full">
        <EkzekutivSidebar />
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}