import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  Wand2,
  ShoppingBag,
  Package,
  FileText,
  Rocket,
  CreditCard,
  Radar,
  Dna,
  BarChart3,
  Monitor,
  Mail,
  Share2,
  Target,
  Palette,
  Plug,
  User,
  TrendingUp,
  Megaphone,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const workspaceItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Command Center", url: "/command-center", icon: Monitor },
  { title: "Opportunities", url: "/opportunities", icon: Radar },
  { title: "My Launches", url: "/products", icon: ShoppingBag },
];

const buildItems = [
  { title: "Launch Wizard", url: "/wizard", icon: Wand2 },
  { title: "Assets Library", url: "/assets", icon: Package },
  { title: "Genome™", url: "/genome", icon: Dna },
];

const funnelItems = [
  { title: "Funnels", url: "/funnels", icon: Target },
  { title: "Deploy", url: "/checklist", icon: Rocket },
];

const growthItems = [
  { title: "Affiliate AI", url: "/affiliate-predictor", icon: BarChart3 },
];

const accountItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  const renderItems = (items: typeof workspaceItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
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

  const renderGroup = (label: string, items: typeof workspaceItems) => (
    <SidebarGroup>
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
      {/* Logo */}
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <NavLink to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-[11px] font-bold text-primary-foreground">LS</span>
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">LaunchStack AI</span>
            </NavLink>
          )}
          <SidebarTrigger className="ml-auto">
            <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {/* New Launch CTA */}
        <div className={`px-2 mb-1 ${isCollapsed ? "px-1" : ""}`}>
          <Button
            onClick={() => navigate("/wizard")}
            variant="hero"
            size={isCollapsed ? "icon" : "sm"}
            className={`w-full gap-2 text-xs ${isCollapsed ? "justify-center" : ""}`}
          >
            <Wand2 className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>New Launch</span>}
          </Button>
        </div>

        <SidebarSeparator className="my-1.5 opacity-30" />

        {renderGroup("Workspace", workspaceItems)}
        <SidebarSeparator className="my-1 opacity-20" />
        {renderGroup("Build", buildItems)}
        <SidebarSeparator className="my-1 opacity-20" />
        {renderGroup("Funnels", funnelItems)}
        <SidebarSeparator className="my-1 opacity-20" />
        {renderGroup("Growth", growthItems)}
        <SidebarSeparator className="my-1 opacity-20" />
        {renderGroup("Account", accountItems)}
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
