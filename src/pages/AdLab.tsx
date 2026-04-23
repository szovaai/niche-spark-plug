import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Sparkles, Copy, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdLab() {
  const [form, setForm] = useState({ productName: "", niche: "", audience: "", painPoint: "", mechanism: "" });
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState<any>(null);
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.productName) { toast.error("Add a product name first."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-paid-ads", { body: form });
      if (error) throw error;
      setAds(data.ads);
      toast.success("Ad pack generated.");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed.");
    } finally { setLoading(false); }
  };

  const copyList = (items: string[], label: string) => {
    navigator.clipboard.writeText(items.join("\n\n"));
    toast.success(`${label} copied.`);
  };

  const ListBlock = ({ title, items }: { title: string; items: string[] }) => (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold">{title}</h4>
          <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => copyList(items, title)}>
            <Copy className="h-3 w-3" /> Copy
          </Button>
        </div>
        <ul className="space-y-1.5">
          {items?.map((it, i) => (
            <li key={i} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2.5 whitespace-pre-line">{it}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5"><Megaphone className="h-3 w-3" /> Ad Lab</Badge>
          <h1 className="text-3xl font-black">Paid Ads Creative Lab</h1>
          <p className="text-sm text-muted-foreground">TikTok hooks, FB curiosity, Pinterest pins, Google headlines — all in one shot.</p>
        </motion.div>

        <Card>
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Product name</Label><Input value={form.productName} onChange={(e) => update("productName", e.target.value)} /></div>
            <div><Label>Niche</Label><Input value={form.niche} onChange={(e) => update("niche", e.target.value)} /></div>
            <div><Label>Audience</Label><Input value={form.audience} onChange={(e) => update("audience", e.target.value)} /></div>
            <div><Label>Mechanism (optional)</Label><Input value={form.mechanism} onChange={(e) => update("mechanism", e.target.value)} placeholder="e.g. Hormone Reset Method" /></div>
            <div className="md:col-span-2"><Label>Pain point</Label><Textarea value={form.painPoint} onChange={(e) => update("painPoint", e.target.value)} rows={2} /></div>
            <div className="md:col-span-2">
              <Button onClick={generate} disabled={loading} variant="hero" className="w-full gap-2">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Ads Pack
              </Button>
            </div>
          </CardContent>
        </Card>

        {ads && (
          <Tabs defaultValue="tiktok" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="tiktok">TikTok</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
              <TabsTrigger value="pinterest">Pinterest</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>
            <TabsContent value="tiktok" className="space-y-3">
              <ListBlock title="10 Hooks" items={ads.tiktok?.hooks || []} />
              <ListBlock title="5 UGC Scripts" items={ads.tiktok?.ugc_scripts || []} />
              <ListBlock title="5 CTAs" items={ads.tiktok?.ctas || []} />
            </TabsContent>
            <TabsContent value="facebook" className="space-y-3">
              <ListBlock title="Direct Response" items={ads.facebook?.direct_response || []} />
              <ListBlock title="Curiosity" items={ads.facebook?.curiosity || []} />
              <ListBlock title="Story" items={ads.facebook?.story || []} />
            </TabsContent>
            <TabsContent value="pinterest">
              <ListBlock title="10 Pin Headlines" items={ads.pinterest?.pin_headlines || []} />
            </TabsContent>
            <TabsContent value="google">
              <ListBlock title="10 Search Headlines" items={ads.google?.search_headlines || []} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
