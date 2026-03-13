import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Monitor, Wand2, Eye, Radar, Target,
  Map, Activity, Settings, Rocket, Search, FileText,
} from "lucide-react";

const pages = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Command Center", icon: Monitor, path: "/command-center" },
  { label: "AI Product Builder", icon: Wand2, path: "/wizard" },
  { label: "New Launch", icon: Rocket, path: "/wizard" },
  { label: "Winning Launch Modeler", icon: Eye, path: "/steal" },
  { label: "Opportunity Radar", icon: Radar, path: "/opportunities" },
  { label: "Visual Funnel Builder", icon: Target, path: "/funnels" },
  { label: "Profit Map", icon: Map, path: "/profit-map" },
  { label: "Launch Simulation", icon: Activity, path: "/funnel-simulation" },
  { label: "Research Agent", icon: Search, path: "/research-agent" },
  { label: "Templates", icon: FileText, path: "/templates" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function QuickActionsDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runAction = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem key={p.path + p.label} onSelect={() => runAction(p.path)}>
              <p.icon className="mr-2 h-4 w-4 opacity-60" />
              <span>{p.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
