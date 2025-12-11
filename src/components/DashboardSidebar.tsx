import { useLocation } from "react-router-dom";
import { 
  Search, 
  Package, 
  Map, 
  Rocket, 
  Star, 
  Video, 
  CreditCard,
  Crown,
  LogOut,
  ChevronLeft,
  LayoutDashboard
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

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Discover", url: "/discover", icon: Search },
  { title: "My Products", url: "/my-products", icon: Package },
  { title: "Money Map", url: "/money-map", icon: Map },
  { title: "Launch Packs", url: "/launch-packs", icon: Rocket, isPro: true },
  { title: "Saved", url: "/saved", icon: Star },
  { title: "UGC Vault", url: "/ugc-vault", icon: Video, isPro: true },
];

const secondaryNavItems = [
  { title: "Pricing", url: "/pricing", icon: CreditCard },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, role, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">DS</span>
              </div>
              <span className="font-bold text-lg gradient-text">DigiStream</span>
            </NavLink>
          )}
          <SidebarTrigger className="ml-auto">
            <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.isPro && role === "free" && (
                        <Crown className="h-3 w-3 text-accent ml-auto shrink-0" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                  <p className="text-xs text-muted-foreground capitalize">
                    {role} Plan
                  </p>
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
