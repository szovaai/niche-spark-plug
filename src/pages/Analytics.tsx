import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, BarChart3, TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { motion } from "framer-motion";

const metrics = [
  { label: "Total Launches", value: "—", icon: Package, change: "" },
  { label: "Total Revenue", value: "—", icon: DollarSign, change: "" },
  { label: "Avg. Launch Score", value: "—", icon: TrendingUp, change: "" },
  { label: "Affiliate Partners", value: "—", icon: Users, change: "" },
];

export default function Analytics() {
  return (
    <DashboardLayout title="Analytics">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your launch performance and growth metrics.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/20">
                <CardContent className="p-5 text-center space-y-2">
                  <m.icon className="h-5 w-5 text-primary/60 mx-auto" />
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase">{m.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-card/40 backdrop-blur-md border-border/20">
          <CardContent className="p-8 text-center space-y-3">
            <LineChart className="h-10 w-10 text-muted-foreground/20 mx-auto" />
            <h3 className="font-semibold text-muted-foreground">Analytics Coming Soon</h3>
            <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">Revenue tracking, conversion analytics, and affiliate performance data will appear here as you deploy launches.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
