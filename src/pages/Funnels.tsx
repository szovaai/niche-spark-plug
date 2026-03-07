import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check, FileText, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RenderedCopy from "@/components/RenderedCopy";
import { sanitizeHTML } from "@/lib/sanitize";
import { markdownToHTML } from "@/lib/copyUtils";

const TABS = ["salesPage", "optInPage", "thankYouPage", "bonusPage", "checkoutCopy"] as const;
const TAB_LABELS: Record<string, string> = {
  salesPage: "Sales Pages", optInPage: "Opt-in Pages", thankYouPage: "Thank You", bonusPage: "Bonus Pages", checkoutCopy: "Checkout",
};

const Funnels = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<{ title: string; html: string } | null>(null);

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
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const openPreview = (title: string, content: string) => {
    const html = sanitizeHTML(markdownToHTML(content));
    setPreviewContent({ title, html });
  };

  return (
    <DashboardLayout title="Funnels">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Funnel Copy Library</h1>
          <p className="text-muted-foreground text-sm">All your generated funnel assets — full, untruncated copy.</p>
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
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openPreview(`${p.name} — ${TAB_LABELS[tab]}`, text)} className="gap-1">
                              <Eye className="w-3 h-3" /> Preview
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyText(text, key)} className="gap-1">
                              {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Full Page
                            </Button>
                          </div>
                        </div>
                        <div className="max-h-[80vh] overflow-y-auto pr-2">
                          <RenderedCopy content={text} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Full Page Preview Modal */}
        <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewContent?.title}</DialogTitle>
            </DialogHeader>
            <div
              className="prose prose-sm prose-invert max-w-none text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_hr]:border-border [&_p]:my-2"
              dangerouslySetInnerHTML={{ __html: previewContent?.html || "" }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Funnels;
