import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, ArrowRight, FileText, Sparkles, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const copyTypes = [
  { title: "Sales Page", desc: "High-converting long-form sales letters", icon: FileText, step: 4 },
  { title: "Opt-in Page", desc: "Lead magnet squeeze pages", icon: Sparkles, step: 4 },
  { title: "Upsell Page", desc: "One-time-offer and bump copy", icon: PenTool, step: 4 },
  { title: "Thank You Page", desc: "Delivery and next-step messaging", icon: Wand2, step: 4 },
];

export default function SalesCopyEngine() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Sales Copy Engine">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sales Copy Engine</h1>
          <p className="text-sm text-muted-foreground">Generate high-converting sales copy for every page of your funnel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {copyTypes.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/20 hover:border-primary/20 transition-all cursor-pointer group"
                onClick={() => navigate("/wizard")}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-card/40 backdrop-blur-md border-accent/15">
          <CardContent className="p-6 text-center space-y-3">
            <PenTool className="h-8 w-8 text-accent mx-auto" />
            <h3 className="font-semibold">Full Copy Suite</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Use the Launch Wizard to generate all copy assets in sequence — headlines, bullets, CTAs, and complete sales pages.</p>
            <Button variant="hero" onClick={() => navigate("/wizard")} className="gap-2">
              <Wand2 className="h-4 w-4" /> Open Launch Wizard
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
