import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/wizard": "AI Launch Wizard",
  "/products": "Products",
  "/funnels": "Funnels",
  "/assets": "Marketing Assets",
  "/checklist": "Launch Checklist",
  "/templates": "Templates",
  "/settings": "Settings",
  "/pricing": "Pricing",
};

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const location = useLocation();
  const pageTitle = title || pageTitles[location.pathname] || "";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="md:hidden" />
            <Separator orientation="vertical" className="h-6 md:hidden" />
            {pageTitle && (
              <h1 className="font-semibold text-lg">{pageTitle}</h1>
            )}
          </header>
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
