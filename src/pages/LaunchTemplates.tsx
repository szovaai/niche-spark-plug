import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Rocket, Sparkles, Plus, DollarSign } from "lucide-react";
import { LAUNCH_TEMPLATES, type LaunchTemplate } from "@/data/launchTemplates";

export default function LaunchTemplates() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<LaunchTemplate | null>(null);

  const useTemplate = (t: LaunchTemplate) => {
    const params = new URLSearchParams({
      niche: t.niche,
      audience: t.targetAudience,
      productType: t.productType,
      topic: t.topic,
    });
    navigate(`/wizard?${params.toString()}`);
  };

  return (
    <DashboardLayout title="Launch Templates">
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Launch Type</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Pick a proven funnel template and let AI fill in everything — product, copy, emails, affiliate kit, and launch plan.
          </p>
        </div>

        {/* Start from scratch */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            className="border-dashed border-2 border-primary/30 hover:border-primary/60 cursor-pointer transition-all"
            onClick={() => navigate("/wizard")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Start From Scratch</h3>
                <p className="text-sm text-muted-foreground">Build a custom launch from your own niche and idea</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Template grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {LAUNCH_TEMPLATES.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:border-primary/40 transition-all h-full">
                <CardContent className="p-6 space-y-4 flex flex-col h-full">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{t.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                    </div>
                  </div>

                  {/* Funnel structure preview */}
                  <div className="space-y-1.5">
                    {t.funnelStructure.map((tier, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${j === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        <span className="font-medium min-w-[80px]">{tier.tier}</span>
                        <span className="text-primary font-bold">{tier.price}</span>
                        <span className="text-muted-foreground truncate">— {tier.description}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-auto pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreview(t)}>
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1 gap-1" onClick={() => useTemplate(t)}>
                      <Rocket className="w-3 h-3" /> Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{preview?.icon}</span>
              {preview?.name}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{preview.description}</p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Funnel Structure</h4>
                <div className="space-y-2">
                  {preview.funnelStructure.map((tier, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-card border border-border">
                      <DollarSign className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{tier.tier}</span>
                          <Badge variant="outline" className="text-xs">{tier.price}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{tier.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Example Product</h4>
                <p className="text-sm font-medium">{preview.exampleProduct}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Example Bonuses</h4>
                <ul className="space-y-1">
                  {preview.exampleBonuses.map((b, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground">Niche</p>
                  <p className="font-medium">{preview.niche}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground">Product Type</p>
                  <p className="font-medium capitalize">{preview.productType}</p>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={() => { setPreview(null); useTemplate(preview); }}>
                <Sparkles className="w-4 h-4" /> Use This Template
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
