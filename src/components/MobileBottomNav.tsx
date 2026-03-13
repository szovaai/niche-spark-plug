import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wand2, Monitor, Radar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const items = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard", tip: "Dashboard & stats" },
  { label: "Radar", icon: Radar, path: "/opportunities", tip: "Opportunity scanner" },
  { label: "Build", icon: Wand2, path: "/wizard", tip: "AI Product Builder" },
  { label: "Center", icon: Monitor, path: "/command-center", tip: "Command Center" },
  { label: "Settings", icon: Settings, path: "/settings", tip: "Settings & account" },
];

// Pages where the bottom nav should NOT appear
const hiddenPaths = ["/", "/auth", "/pricing"];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/30 bg-background/80 backdrop-blur-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {items.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {active && (
                    <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{item.tip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
