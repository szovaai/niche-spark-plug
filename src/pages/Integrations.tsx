import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CreditCard, Mail, Globe, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const integrations = [
  { name: "Gumroad", desc: "Sell digital products and manage customers", icon: CreditCard, status: "Available" },
  { name: "WarriorPlus", desc: "Launch on the WarriorPlus marketplace", icon: Globe, status: "Available" },
  { name: "Mailchimp", desc: "Connect your email list and automations", icon: Mail, status: "Coming Soon" },
  { name: "ConvertKit", desc: "Creator-focused email marketing", icon: Mail, status: "Coming Soon" },
  { name: "Stripe", desc: "Accept payments directly", icon: CreditCard, status: "Coming Soon" },
  { name: "Google Analytics", desc: "Track visitors and conversions", icon: BarChart3, status: "Coming Soon" },
];

export default function Integrations() {
  return (
    <DashboardLayout title="Integrations">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-muted-foreground">Connect PDF Empire AI to your favorite platforms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/20">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Badge variant={item.status === "Available" ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {item.status}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
