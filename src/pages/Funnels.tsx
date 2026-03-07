import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const TABS = ["salesPage", "optInPage", "thankYouPage", "bonusPage", "checkoutCopy"] as const;
const TAB_LABELS: Record<string, string> = {
  salesPage: "Sales Pages", optInPage: "Opt-in Pages", thankYouPage: "Thank You", bonusPage: "Bonus Pages", checkoutCopy: "Checkout",
};

const Funnels = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchProjects();
    else setLoading(false);
  }, [user]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("launch_projects")
      .select("id, name, step3_funnel")
      .not("step3_funnel", "is", null)
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout title="Funnels">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Funnel Copy Library</h1>
          <p className="text-muted-foreground text-sm">All your generated funnel assets.</p>
        </div>

        {loading ? (
          <Skeleton className="h-40" />
        ) : projects.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No funnel copy yet. Use the AI Launch Wizard to generate funnels.</p>
          </CardContent></Card>
        ) : (
          <Tabs defaultValue="salesPage">
            <TabsList className="flex-wrap h-auto gap-1">
              {TABS.map(t => <TabsTrigger key={t} value={t} className="text-xs">{TAB_LABELS[t]}</TabsTrigger>)}
            </TabsList>
            {TABS.map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {projects.map(p => {
                  const funnel = p.step3_funnel as any;
                  const text = funnel?.[tab];
                  if (!text) return null;
                  const key = `${p.id}-${tab}`;
                  return (
                    <Card key={p.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{p.name}</h4>
                          <Button variant="ghost" size="sm" onClick={() => copyText(text, key)} className="gap-1">
                            {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{text}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Funnels;
