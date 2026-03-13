import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Rocket, Search, Sparkles, ArrowRight, Users, Star, Loader2, Layout, Zap, Target, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface LaunchTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  preview_image: string | null;
  template_data: any;
  uses_count: number;
  rating: number;
}

const CATEGORY_ICONS: Record<string, typeof Rocket> = {
  "Tripwire": Zap,
  "Lead Magnet": Target,
  "Course": BookOpen,
  "PLR": Layout,
};

// Built-in templates (seeded client-side for now)
const BUILT_IN_TEMPLATES: Omit<LaunchTemplate, "id">[] = [
  {
    name: "WarriorPlus $17 Tripwire",
    category: "Tripwire",
    description: "Battle-tested funnel for WarriorPlus. $17 front-end with $37 upsell. Includes swipe emails, JV page, and countdown urgency copy.",
    preview_image: null,
    uses_count: 847,
    rating: 4.8,
    template_data: {
      niche: "Make Money Online",
      target_audience: "Beginner online marketers",
      product_type: "ebook",
      topic: "Quick income methods",
      step1_product: { title: "The $100/Day Shortcut", subtitle: "How Complete Beginners Are Banking $100+ Daily With This Weird Method", concept: "A step-by-step system for generating daily income using digital products on WarriorPlus", uniqueMechanism: "The Flip & Stack Method", painPoints: ["No products to sell", "Don't know where to start", "Tried everything, nothing works"] },
    },
  },
  {
    name: "Lead Magnet Funnel",
    category: "Lead Magnet",
    description: "Free PDF → email sequence → paid offer. Perfect for building a list fast with a high-value cheatsheet or checklist.",
    preview_image: null,
    uses_count: 623,
    rating: 4.6,
    template_data: {
      niche: "Health & Wellness",
      target_audience: "Busy professionals wanting to improve their health",
      product_type: "checklist",
      topic: "Morning routine optimization",
      step1_product: { title: "The 7-Minute Morning Reset", subtitle: "The Simple Checklist That Transforms Your Energy, Focus & Mood Before 8AM", concept: "A scientifically-backed morning checklist that takes just 7 minutes", uniqueMechanism: "The Reset Protocol", painPoints: ["Low energy all day", "Can't focus at work", "Tired of complicated routines"] },
    },
  },
  {
    name: "High-Ticket Coaching Funnel",
    category: "Course",
    description: "VSL → application → call booking. Designed for $497-$997 coaching programs with authority positioning and social proof.",
    preview_image: null,
    uses_count: 312,
    rating: 4.9,
    template_data: {
      niche: "Business Coaching",
      target_audience: "Small business owners doing $5K-$20K/month wanting to scale",
      product_type: "course",
      topic: "Scaling systems for service businesses",
      step1_product: { title: "The Scale Blueprint", subtitle: "How Service Business Owners Are Doubling Revenue Without Doubling Hours", concept: "A complete system for systemizing and scaling a service business", uniqueMechanism: "The 4-Pillar Scale System", painPoints: ["Working 60+ hours", "Can't hire without losing quality", "Revenue plateaued"] },
    },
  },
  {
    name: "PLR Flip & Sell Kit",
    category: "PLR",
    description: "Take PLR content, rebrand it with AI, and launch in 24 hours. Includes rebranding prompts, listing copy, and email swipes.",
    preview_image: null,
    uses_count: 498,
    rating: 4.5,
    template_data: {
      niche: "Digital Marketing",
      target_audience: "Side hustlers looking for passive income with minimal effort",
      product_type: "templates",
      topic: "Social media templates bundle",
      step1_product: { title: "Social Media Mastery Kit", subtitle: "500+ Done-For-You Templates That Turn Followers Into Buyers", concept: "A massive bundle of customizable social media templates for all platforms", uniqueMechanism: "The Template Stack Method", painPoints: ["No time to create content", "Posts get zero engagement", "Don't know what to post"] },
    },
  },
  {
    name: "7-Day Challenge Funnel",
    category: "Lead Magnet",
    description: "Free challenge → daily emails → offer on Day 7. High engagement, high conversion. Perfect for community building.",
    preview_image: null,
    uses_count: 389,
    rating: 4.7,
    template_data: {
      niche: "Productivity",
      target_audience: "Remote workers struggling with focus and output",
      product_type: "planner",
      topic: "7-day productivity transformation challenge",
      step1_product: { title: "The Focus Reset Challenge", subtitle: "7 Days to 2x Your Output — Without Working More Hours", concept: "A structured 7-day challenge that rewires daily habits for maximum focus", uniqueMechanism: "The Focus Block Method", painPoints: ["Constant distractions", "Feel busy but unproductive", "Can't stick to systems"] },
    },
  },
];

export default function TemplatesMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [using, setUsing] = useState<string | null>(null);
  const [dbTemplates, setDbTemplates] = useState<LaunchTemplate[]>([]);

  useEffect(() => {
    supabase.from("launch_templates").select("*").eq("is_active", true).then(({ data }) => {
      if (data) setDbTemplates(data as LaunchTemplate[]);
    });
  }, []);

  const allTemplates = [
    ...BUILT_IN_TEMPLATES.map((t, i) => ({ ...t, id: `builtin-${i}` })),
    ...dbTemplates,
  ];

  const filtered = allTemplates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && t.category !== category) return false;
    return true;
  });

  const categories = [...new Set(allTemplates.map(t => t.category))];

  const useTemplate = async (template: (typeof allTemplates)[0]) => {
    if (!user) { toast.error("Please sign in first"); return; }
    setUsing(template.id);
    try {
      const { data, error } = await supabase.from("launch_projects").insert({
        user_id: user.id,
        name: template.name,
        niche: template.template_data.niche || null,
        target_audience: template.template_data.target_audience || null,
        product_type: template.template_data.product_type || null,
        topic: template.template_data.topic || null,
        step1_product: template.template_data.step1_product || null,
        current_step: 1,
      }).select().single();
      if (error) throw error;
      toast.success("Template loaded! Customize and launch.");
      navigate(`/wizard/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to use template");
    } finally {
      setUsing(null);
    }
  };

  return (
    <DashboardLayout title="Launch Templates">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" />
            Launch Templates
          </h1>
          <p className="text-muted-foreground">Pre-built launch blueprints. Pick one, customize, and go live in 60 minutes.</p>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-1.5">
            <Button variant={category === null ? "default" : "outline"} size="sm" onClick={() => setCategory(null)}>All</Button>
            {categories.map(c => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => setCategory(c)}>{c}</Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template, i) => {
            const Icon = CATEGORY_ICONS[template.category] || Rocket;
            return (
              <motion.div key={template.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:border-primary/30 transition-colors h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm">{template.name}</h3>
                        <Badge variant="secondary" className="text-[10px] mt-1">{template.category}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex-1 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {template.uses_count} uses</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" /> {template.rating}</span>
                      </div>
                      <Button size="sm" className="gap-1 h-8 text-xs" onClick={() => useTemplate(template)} disabled={using === template.id}>
                        {using === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
