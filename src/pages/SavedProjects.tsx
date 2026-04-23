import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Wand2, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUSES = [
  { value: "idea", label: "Idea", color: "bg-muted/40 text-muted-foreground" },
  { value: "building", label: "Building", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "launching", label: "Launching", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  { value: "scaling", label: "Scaling", color: "bg-green-500/15 text-green-400 border-green-500/30" },
];

export default function SavedProjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("launch_projects")
      .select("*")
      .order("updated_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("launch_projects").update({ lifecycle_status: status }).eq("id", id);
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, lifecycle_status: status } : x)));
    toast.success("Status updated.");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("launch_projects").delete().eq("id", id);
    setProjects((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted.");
  };

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5"><Bookmark className="h-3 w-3" /> Saved Projects</Badge>
          <h1 className="text-3xl font-black">Your Launch Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track every project from idea to scaling.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : projects.length === 0 ? (
          <Card><CardContent className="p-10 text-center">
            <p className="text-muted-foreground mb-4">No projects yet.</p>
            <Button variant="hero" onClick={() => navigate("/opportunities")}>Find an Opportunity</Button>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const status = p.lifecycle_status || "idea";
              const sObj = STATUSES.find((s) => s.value === status) || STATUSES[0];
              return (
                <Card key={p.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base line-clamp-2">{p.name}</h3>
                      <Badge className={`${sObj.color} text-[10px] shrink-0`}>{sObj.label}</Badge>
                    </div>
                    {p.niche && <Badge variant="outline" className="text-[10px] capitalize">{p.niche}</Badge>}
                    <div className="text-[11px] text-muted-foreground">
                      Step {p.current_step}/5 · Updated {format(new Date(p.updated_at), "MMM d")}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Select value={status} onValueChange={(v) => updateStatus(p.id, v)}>
                        <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="hero" className="h-8 gap-1 text-xs" onClick={() => navigate(`/wizard/${p.id}`)}>
                        <Wand2 className="h-3 w-3" /> Open
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => remove(p.id)}>
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
