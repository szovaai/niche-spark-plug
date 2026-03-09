import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Share2, Mail, Users, Video, Image, Globe, Megaphone } from "lucide-react";
import { motion } from "framer-motion";

const channels = [
  { name: "TikTok / Reels", icon: Video, effort: "5 videos/week", potential: "High", color: "text-accent" },
  { name: "Pinterest", icon: Image, effort: "10 pins/week", potential: "Medium", color: "text-chart-4" },
  { name: "Email List", icon: Mail, effort: "3 broadcasts/week", potential: "Very High", color: "text-chart-2" },
  { name: "Affiliates", icon: Users, effort: "Recruit 15+", potential: "Very High", color: "text-chart-2" },
  { name: "Twitter / X", icon: Share2, effort: "Daily threads", potential: "Medium", color: "text-chart-4" },
  { name: "Facebook Groups", icon: Globe, effort: "2 posts/day", potential: "Medium", color: "text-chart-4" },
  { name: "YouTube Shorts", icon: Video, effort: "3 videos/week", potential: "High", color: "text-accent" },
  { name: "Paid Ads", icon: Megaphone, effort: "$10–50/day", potential: "High", color: "text-accent" },
];

export default function TrafficPlanner() {
  return (
    <DashboardLayout title="Traffic Planner">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Traffic Planner</h1>
          <p className="text-sm text-muted-foreground">Plan your traffic strategy across multiple channels to hit your launch revenue goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((ch, i) => (
            <motion.div key={ch.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/20 hover:border-primary/15 transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <ch.icon className="h-5 w-5 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{ch.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{ch.effort}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold ${ch.color}`}>{ch.potential}</span>
                    <p className="text-[9px] text-muted-foreground/40">Potential</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
