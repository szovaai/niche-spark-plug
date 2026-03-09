import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronLeft,
  LayoutDashboard,
  Rocket,
  Settings,
  Wand2,
  ShoppingBag,
  BarChart3,
  ClipboardList,
  LayoutTemplate,
  Search,
  Brain,
  Package,
  CreditCard,
  Zap,
  FlaskConical,
  Globe,
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

const buildItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: ShoppingBag },
  { title: "Funnels", url: "/funnels", icon: BarChart3 },
  { title: "Marketing Assets", url: "/assets", icon: Package },
];

const launchItems = [
  { title: "Launch Checklist", url: "/checklist", icon: ClipboardList },
  { title: "Launch Templates", url: "/launch-templates", icon: Rocket },
  { title: "Templates", url: "/templates", icon: LayoutTemplate },
];

const intelligenceItems = [
  { title: "Research Agent", url: "/research-agent", icon: Brain },
  { title: "Steal This Launch", url: "/steal", icon: Search },
];

const accountItems = [
  { title: "Pricing", url: "/pricing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  const renderGroup = (
    label: string,
    items: typeof buildItems,
  ) => (
    <SidebarGroup>
      {!isCollapsed && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-3">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={item.title}
              >
                <NavLink
                  to={item.url}
                  className={
                    isCollapsed
                      ? "flex items-center justify-center"
                      : "flex items-center gap-3"
                  }
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.title}</span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">DL</span>
              </div>
              <span className="font-bold text-lg gradient-text">DigiLaunchKit AI</span>
            </NavLink>
          )}
          <SidebarTrigger className="ml-auto">
            <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary CTA */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className={`px-2 ${isCollapsed ? "px-1" : ""}`}>
              <Button
                onClick={() => navigate("/wizard")}
                variant="hero"
                size={isCollapsed ? "icon" : "default"}
                className={`w-full gap-2 ${isCollapsed ? "justify-center" : ""}`}
              >
                <Wand2 className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>New Launch</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-1" />

        {renderGroup("Build", buildItems)}
        <SidebarSeparator className="my-1" />
        {renderGroup("Deploy", launchItems)}
        <SidebarSeparator className="my-1" />
        {renderGroup("Intelligence", intelligenceItems)}
        <SidebarSeparator className="my-1" />
        {renderGroup("Account", accountItems)}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user ? (
          <div className="space-y-3">
            <SidebarSeparator />
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role} Plan</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        ) : (
          !isCollapsed && (
            <NavLink to="/auth">
              <Button variant="hero" size="sm" className="w-full">
                Sign In
              </Button>
            </NavLink>
          )
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
