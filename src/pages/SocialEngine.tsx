import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, ArrowRight, Wand2, Video, Image, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const contentTypes = [
  { title: "Viral Posts", desc: "Scroll-stopping social media content", icon: MessageSquare },
  { title: "Video Scripts", desc: "TikTok, Reels, and YouTube short scripts", icon: Video },
  { title: "Pin Designs", desc: "Pinterest pin copy and descriptions", icon: Image },
  { title: "Thread Content", desc: "Twitter/X thread sequences", icon: Share2 },
];

export default function SocialEngine() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Social Content Generator">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Social Content Generator</h1>
          <p className="text-sm text-muted-foreground">Create viral-ready content for every social platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentTypes.map((item, i) => (
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
            <Share2 className="h-8 w-8 text-accent mx-auto" />
            <h3 className="font-semibold">Full Social Suite</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">The Launch Wizard generates all social content in Step 5 — viral posts, video scripts, and platform-specific assets.</p>
            <Button variant="hero" onClick={() => navigate("/wizard")} className="gap-2">
              <Wand2 className="h-4 w-4" /> Open Launch Wizard
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
