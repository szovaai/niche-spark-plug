import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Sparkles, Copy, Download, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ShopifyLaunch() {
  const [form, setForm] = useState({
    productName: "",
    niche: "",
    audience: "",
    price: "27",
    painPoint: "",
  });
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.productName || !form.painPoint) {
      toast.error("Add a product name and pain point first.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-shopify-assets", { body: form });
      if (error) throw error;
      setAssets(data.assets);
      toast.success("Store assets generated.");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!assets) return;
    navigator.clipboard.writeText(JSON.stringify(assets, null, 2));
    toast.success("Copied to clipboard.");
  };

  const exportCSV = () => {
    if (!assets) return;
    const rows = [
      ["Field", "Value"],
      ["Title", form.productName],
      ["Hero Headline", assets.hero_headline],
      ["Subheadline", assets.subheadline],
      ["Description", assets.product_description],
      ["Price", form.price],
      ["Vendor", "LaunchStack"],
      ["Type", "Digital Product"],
      ["Tags", form.niche],
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.productName.replace(/\s+/g, "-").toLowerCase()}-shopify.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card>
      <CardContent className="p-5 space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5">
            <Store className="h-3 w-3" /> Shopify Launch Engine
          </Badge>
          <h1 className="text-3xl font-black">Generate a complete Shopify launch pack</h1>
          <p className="text-sm text-muted-foreground">Hero copy, descriptions, FAQs, reviews, upsell, order bump — ready to paste.</p>
        </motion.div>

        <Card>
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>Product name</Label><Input value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="Menopause Belly Fat Reset" /></div>
            <div><Label>Niche</Label><Input value={form.niche} onChange={(e) => update("niche", e.target.value)} placeholder="women's health" /></div>
            <div><Label>Target audience</Label><Input value={form.audience} onChange={(e) => update("audience", e.target.value)} placeholder="women 40+ struggling with hormonal weight gain" /></div>
            <div><Label>Price ($)</Label><Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Pain point</Label><Textarea value={form.painPoint} onChange={(e) => update("painPoint", e.target.value)} placeholder="Stubborn belly fat that won't budge no matter what they try…" rows={2} /></div>
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={generate} disabled={loading} variant="hero" className="flex-1 gap-2">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Store Assets
              </Button>
              {assets && (
                <>
                  <Button variant="outline" onClick={copyAll} className="gap-2"><Copy className="h-4 w-4" /> Copy All</Button>
                  <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {assets && (
          <div className="space-y-4">
            <Section title="Hero">
              <p className="text-xl font-bold">{assets.hero_headline}</p>
              <p className="text-sm text-muted-foreground">{assets.subheadline}</p>
            </Section>
            <Section title="Product Description">
              <p className="text-sm whitespace-pre-line text-muted-foreground">{assets.product_description}</p>
            </Section>
            <Section title="Benefit Bullets">
              <ul className="space-y-1.5">{assets.benefit_bullets?.map((b: string, i: number) => <li key={i} className="text-sm text-muted-foreground">✓ {b}</li>)}</ul>
            </Section>
            <Section title="FAQ">
              <div className="space-y-3">
                {assets.faq?.map((f: any, i: number) => (
                  <div key={i}><p className="text-sm font-semibold">{f.q}</p><p className="text-sm text-muted-foreground">{f.a}</p></div>
                ))}
              </div>
            </Section>
            <Section title="Reviews">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assets.reviews?.map((r: any, i: number) => (
                  <div key={i} className="rounded-lg border border-border/30 p-3 bg-secondary/20">
                    <div className="text-xs font-bold">{r.name} · {"★".repeat(r.stars)}</div>
                    <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
                  </div>
                ))}
              </div>
            </Section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Section title="Upsell"><p className="text-sm text-muted-foreground">{assets.upsell_offer}</p></Section>
              <Section title="Order Bump"><p className="text-sm text-muted-foreground">{assets.order_bump}</p></Section>
              <Section title="Urgency"><p className="text-sm font-semibold text-primary">{assets.urgency_copy}</p></Section>
              <Section title="Thank You Offer"><p className="text-sm text-muted-foreground">{assets.thank_you_offer}</p></Section>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
