import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Package, ArrowRight, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("launch_projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("launch_projects").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setProjects(p => p.filter(x => x.id !== id));
    toast.success("Project deleted");
  };

  return (
    <DashboardLayout title="Products">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Products</h1>
            <p className="text-muted-foreground text-sm">All your launch projects in one place.</p>
          </div>
          <Button onClick={() => navigate("/wizard")} className="gap-2">
            <Plus className="w-4 h-4" /> New Launch
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-semibold mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start the AI Launch Wizard to create your first product.</p>
              <Button onClick={() => navigate("/wizard")} className="gap-2"><Plus className="w-4 h-4" /> Create Product</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map(p => (
              <Card key={p.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/wizard/${p.id}`)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.niche} · {p.product_type} · {format(new Date(p.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20">
                      <Progress value={[p.step1_product, p.step2_product_content, p.step3_funnel, p.step4_marketing, p.step5_checklist].filter(Boolean).length * 20} className="h-2" />
                      <p className="text-[10px] text-muted-foreground text-center mt-0.5">{[p.step1_product, p.step2_product_content, p.step3_funnel, p.step4_marketing, p.step5_checklist].filter(Boolean).length * 20}%</p>
                    </div>
                    <Badge variant={p.status === "complete" ? "default" : "secondary"}>{p.status}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
