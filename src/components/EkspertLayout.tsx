import { ReactNode } from "react";
import { FileText } from "lucide-react";
import { AdminLayout } from "./AdminLayout";

const ekspertMenuItems = [
  { title: "Aplikimet", url: "/admin/aplikimet", icon: FileText },
];

interface EkspertLayoutProps {
  children: ReactNode;
}

export function EkspertLayout({ children }: EkspertLayoutProps) {
  return (
    <AdminLayout 
      menuItems={ekspertMenuItems} 
      groupLabel="Ekspert"
    >
      {children}
    </AdminLayout>
  );
}