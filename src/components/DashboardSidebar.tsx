import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  Wand2,
  Rocket,
  Target,
  Activity,
  Eye,
  Map,
  Radar,
  Layout,
  Store,
  Megaphone,
  Copy as CopyIcon,
  Bookmark,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const coreItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, tip: "Your home base" },
  { title: "Profit Radar AI", url: "/opportunities", icon: Radar, tip: "Discover problems people pay to solve" },
  { title: "Saved Projects", url: "/saved-projects", icon: Bookmark, tip: "Your launch pipeline" },
];

const buildItems = [
  { title: "Product Builder", url: "/wizard", icon: Wand2, tip: "Create a complete product + funnel" },
  { title: "Funnel Builder", url: "/funnels", icon: Target, tip: "Build sales funnels with drag & drop" },
  { title: "Shopify Launch", url: "/shopify-launch", icon: Store, tip: "Generate Shopify store assets" },
  { title: "Ad Lab", url: "/ad-lab", icon: Megaphone, tip: "TikTok / FB / Pinterest / Google ads" },
];

const intelligenceItems = [
  { title: "Clone Competitor", url: "/clone-competitor", icon: CopyIcon, tip: "Reverse-engineer winning offers" },
  { title: "Winning Launch Modeler", url: "/steal", icon: Eye, tip: "Analyze top sellers" },
  { title: "Profit Map", url: "/profit-map", icon: Map, tip: "Revenue projections & pricing" },
  { title: "Launch Simulation", url: "/funnel-simulation", icon: Activity, tip: "Simulate launch scenarios" },
];

const systemItems = [
  { title: "Launch Templates", url: "/templates-marketplace", icon: Layout, tip: "Pre-built blueprints" },
  { title: "Settings", url: "/settings", icon: Settings, tip: "Account, brand kit & integrations" },
];

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; tip: string };

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path.includes("?")) return location.pathname === path.split("?")[0];
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  const renderItems = (items: NavItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.tip}>
          <NavLink
            to={item.url}
            className={isCollapsed ? "flex items-center justify-center" : "flex items-center gap-3"}
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <item.icon className="h-4 w-4 shrink-0 opacity-70" />
            {!isCollapsed && <span className="truncate flex-1 text-[13px]">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup key={label}>
      {!isCollapsed && (
        <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold px-3 mb-0.5">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>{renderItems(items)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/15 bg-sidebar/40 backdrop-blur-2xl">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <NavLink to="/" className="flex items-center gap-2.5">
              <img src={logo} alt="PDF Empire AI" className="h-14 w-14 object-contain drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
            </NavLink>
          )}
          <SidebarTrigger className="ml-auto">
            <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <div className={`px-2 mb-1 ${isCollapsed ? "px-1" : ""}`}>
          <Button
            onClick={() => navigate("/wizard")}
            variant="hero"
            size={isCollapsed ? "icon" : "sm"}
            className={`w-full gap-2 text-xs ${isCollapsed ? "justify-center" : ""}`}
          >
            <Rocket className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>New Launch</span>}
          </Button>
        </div>

        <SidebarSeparator className="my-1.5 opacity-30" />

        {renderGroup("Core", coreItems)}
        <SidebarSeparator className="my-1 opacity-20" />
        {renderGroup("Build", buildItems)}
        <SidebarSeparator className="my-1 opacity-20" />
        {renderGroup("Intelligence", intelligenceItems)}
        <SidebarSeparator className="my-1 opacity-20" />
        {renderGroup("System", systemItems)}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {user ? (
          <div className="space-y-2">
            <SidebarSeparator className="opacity-20" />
            <div className="flex items-center gap-2.5">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-medium">{userInitial}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user.email}</p>
                  <p className="text-[10px] text-muted-foreground/60 capitalize">{role}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="w-full justify-start gap-2 text-muted-foreground/60 hover:text-foreground text-xs h-7"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        ) : (
          !isCollapsed && (
            <NavLink to="/auth">
              <Button variant="hero" size="sm" className="w-full text-xs">
                Sign In
              </Button>
            </NavLink>
          )
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
