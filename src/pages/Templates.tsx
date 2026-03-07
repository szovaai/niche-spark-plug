import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Dumbbell, Cpu, CheckSquare, TrendingUp } from "lucide-react";

const templates = [
  {
    name: "Affiliate Marketing",
    icon: TrendingUp,
    niche: "Affiliate Marketing",
    audience: "Beginners",
    type: "ebook",
    topic: "Building passive income with affiliate marketing",
    color: "text-green-500",
  },
  {
    name: "AI Tools & Automation",
    icon: Cpu,
    niche: "AI Tools",
    audience: "Entrepreneurs",
    type: "course",
    topic: "Leveraging AI tools to automate your business",
    color: "text-blue-500",
  },
  {
    name: "Fitness & Wellness",
    icon: Dumbbell,
    niche: "Fitness",
    audience: "Health-conscious adults",
    type: "planner",
    topic: "30-day fitness transformation program",
    color: "text-orange-500",
  },
  {
    name: "Productivity Systems",
    icon: CheckSquare,
    niche: "Productivity",
    audience: "Remote workers",
    type: "templates",
    topic: "Building a second brain productivity system",
    color: "text-purple-500",
  },
  {
    name: "Side Hustle Blueprint",
    icon: Briefcase,
    niche: "Side Hustles",
    audience: "9-to-5 workers",
    type: "ebook",
    topic: "Starting a profitable side hustle in 2026",
    color: "text-accent",
  },
];

const Templates = () => {
  const navigate = useNavigate();

  const useTemplate = (t: typeof templates[0]) => {
    const params = new URLSearchParams({
      niche: t.niche,
      audience: t.audience,
      type: t.type,
      topic: t.topic,
    });
    navigate(`/wizard?${params.toString()}`);
  };

  return (
    <DashboardLayout title="Templates">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Launch Templates</h1>
          <p className="text-muted-foreground text-sm">Pre-built starting points to accelerate your launch.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <Card key={t.name} className="hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => useTemplate(t)}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <t.icon className={`w-5 h-5 ${t.color}`} />
                  </div>
                  <h3 className="font-bold">{t.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t.topic}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">{t.niche}</Badge>
                  <Badge variant="outline" className="text-xs">{t.type}</Badge>
                </div>
                <Button variant="ghost" className="w-full gap-2 group-hover:text-primary">
                  Use Template <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
