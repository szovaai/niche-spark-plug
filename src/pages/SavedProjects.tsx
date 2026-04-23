import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Wand2, Trash2, Search, Crown, Zap, Wrench, Rocket, Layers } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type ProjectType = "launch" | "empire" | "micro" | "toolkit";

interface UnifiedProject {
  id: string;
  type: ProjectType;
  name: string;
  niche?: string | null;
  status?: string | null;
  progress?: number;
  updated_at: string;
  table: "launch_projects" | "empire_projects" | "micro_products" | "toolkits";
  openPath: string;
}

const TYPE_META: Record<ProjectType, { label: string; icon: any; color: string }> = {
  launch:  { label: "Launch",  icon: Rocket, color: "bg-primary/15 text-primary border-primary/30" },
  empire:  { label: "Empire",  icon: Crown,  color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  micro:   { label: "Micro",   icon: Zap,    color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  toolkit: { label: "Toolkit", icon: Wrench, color: "bg-green-500/15 text-green-400 border-green-500/30" },
};

const FILTERS: Array<{ value: ProjectType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "launch", label: "Launches" },
  { value: "empire", label: "Empire" },
  { value: "micro", label: "Micro" },
  { value: "toolkit", label: "Toolkits" },
];

export default function SavedProjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<UnifiedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProjectType | "all">("all");
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [launches, empires, micros, toolkits] = await Promise.all([
        supabase.from("launch_projects").select("id, name, niche, lifecycle_status, current_step, updated_at"),
        supabase.from("empire_projects").select("id, name, step1_final_niche, status, current_step, updated_at"),
        supabase.from("micro_products").select("id, product_title, niche_topic, status, updated_at"),
        supabase.from("toolkits").select("id, title, niche, status, wizard_step, updated_at"),
      ]);

      const merged: UnifiedProject[] = [
        ...((launches.data || []).map((p: any) => ({
          id: p.id,
          type: "launch" as const,
          name: p.name || "Untitled Launch",
          niche: p.niche,
          status: p.lifecycle_status || "idea",
          progress: Math.round(((p.current_step || 1) / 5) * 100),
          updated_at: p.updated_at,
          table: "launch_projects" as const,
          openPath: `/wizard/${p.id}`,
        }))),
        ...((empires.data || []).map((p: any) => ({
          id: p.id,
          type: "empire" as const,
          name: p.name || "Empire Project",
          niche: p.step1_final_niche,
          status: p.status,
          progress: Math.round(((p.current_step || 1) / 6) * 100),
          updated_at: p.updated_at,
          table: "empire_projects" as const,
          openPath: `/empire/${p.id}`,
        }))),
        ...((micros.data || []).map((p: any) => ({
          id: p.id,
          type: "micro" as const,
          name: p.product_title || p.niche_topic || "Micro Product",
          niche: p.niche_topic,
          status: p.status,
          progress: p.status === "complete" ? 100 : 50,
          updated_at: p.updated_at,
          table: "micro_products" as const,
          openPath: `/micro-factory?id=${p.id}`,
        }))),
        ...((toolkits.data || []).map((p: any) => ({
          id: p.id,
          type: "toolkit" as const,
          name: p.title || "Untitled Toolkit",
          niche: p.niche,
          status: p.status,
          progress: Math.round(((p.wizard_step || 0) / 8) * 100),
          updated_at: p.updated_at,
          table: "toolkits" as const,
          openPath: `/create-toolkit?edit=${p.id}`,
        }))),
      ];

      merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setProjects(merged);
    } catch (err: any) {
      toast.error("Failed to load projects", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user]);

  const remove = async (p: UnifiedProject) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from(p.table as any).delete().eq("id", p.id);
    if (error) return toast.error("Delete failed", { description: error.message });
    setProjects((prev) => prev.filter((x) => !(x.id === p.id && x.type === p.type)));
    toast.success("Deleted.");
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter((p) => {
      if (filter !== "all" && p.type !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.niche || "").toLowerCase().includes(q)
      );
    });
  }, [projects, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach((p) => { c[p.type] = (c[p.type] || 0) + 1; });
    return c;
  }, [projects]);

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5">
            <Layers className="h-3 w-3" /> All Projects
          </Badge>
          <h1 className="text-3xl font-black">Your Build Library</h1>
          <p className="text-sm text-muted-foreground">
            Every launch, empire, micro product, and toolkit — autosaved & in one place.
          </p>
        </motion.div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
                className="h-8 text-xs gap-1.5"
              >
                {f.label}
                <span className="text-[10px] opacity-60">{counts[f.value] ?? 0}</span>
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or niche…"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center space-y-3">
              <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {projects.length === 0 ? "No projects yet — start a build to see it here." : "No matches for this filter."}
              </p>
              {projects.length === 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button size="sm" variant="hero" onClick={() => navigate("/wizard")}><Rocket className="h-3.5 w-3.5 mr-1" /> New Launch</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate("/empire")}><Crown className="h-3.5 w-3.5 mr-1" /> Empire</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate("/micro-factory")}><Zap className="h-3.5 w-3.5 mr-1" /> Micro</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const meta = TYPE_META[p.type];
              const Icon = meta.icon;
              return (
                <Card key={`${p.type}-${p.id}`} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className={cn(meta.color, "text-[10px] gap-1")}>
                        <Icon className="h-3 w-3" /> {meta.label}
                      </Badge>
                      {p.status && (
                        <Badge variant="outline" className="text-[10px] capitalize">{p.status}</Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-base line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                    {p.niche && (
                      <Badge variant="outline" className="text-[10px] capitalize line-clamp-1">{p.niche}</Badge>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{p.progress ?? 0}% complete</span>
                        <span>Updated {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${p.progress ?? 0}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" variant="hero" className="h-8 gap-1 text-xs flex-1" onClick={() => navigate(p.openPath)}>
                        <Wand2 className="h-3 w-3" /> Open
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => remove(p)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
