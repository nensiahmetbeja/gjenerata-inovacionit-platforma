import { ReactNode } from "react";
import { Home, FileText } from "lucide-react";
import { AdminLayout } from "./AdminLayout";

const ekzekutivMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Home },
  { title: "Aplikimet", url: "/admin/aplikimet", icon: FileText },
];

interface EkzekutivLayoutProps {
  children: ReactNode;
}

export function EkzekutivLayout({ children }: EkzekutivLayoutProps) {
  return (
    <AdminLayout 
      menuItems={ekzekutivMenuItems} 
      groupLabel="Ekzekutiv"
    >
      {children}
    </AdminLayout>
  );
}