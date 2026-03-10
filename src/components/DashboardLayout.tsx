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
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Deep background gradient layer */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px] animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[120px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.015] blur-[150px]" />
        </div>

        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Top Header Bar — Glass */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/15 bg-background/60 backdrop-blur-2xl px-4">
            <SidebarTrigger className="md:hidden" />
            <Separator orientation="vertical" className="h-6 md:hidden" />
            {pageTitle && (
              <h1 className="font-semibold text-lg">{pageTitle}</h1>
            )}
          </header>
          
          {/* Main Content */}
          <main className="flex-1 relative">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
