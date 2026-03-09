import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Wand2, Zap, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const sequences = [
  { title: "Launch Sequence", desc: "5-7 email pre-launch to post-launch flow", icon: Zap },
  { title: "Welcome Series", desc: "Onboarding emails for new subscribers", icon: Users },
  { title: "Affiliate Swipes", desc: "Ready-to-send promotional emails for JVs", icon: Mail },
  { title: "Follow-Up Series", desc: "Cart abandonment and re-engagement", icon: Clock },
];

export default function EmailEngine() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Email Engine">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Email Engine</h1>
          <p className="text-sm text-muted-foreground">AI-powered email sequences for every stage of your launch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sequences.map((item, i) => (
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
            <Mail className="h-8 w-8 text-accent mx-auto" />
            <h3 className="font-semibold">Complete Email Suite</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Generate all email sequences inside the Launch Wizard — Step 5 builds your complete marketing kit including emails.</p>
            <Button variant="hero" onClick={() => navigate("/wizard")} className="gap-2">
              <Wand2 className="h-4 w-4" /> Open Launch Wizard
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
