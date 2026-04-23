import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles, RefreshCw, Radar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OpportunityCard, RadarOpportunity } from "@/components/radar/OpportunityCard";
import { ViewDataModal } from "@/components/radar/ViewDataModal";
import { BuyerGoldmines } from "@/components/radar/BuyerGoldmines";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MODES = [
  { key: "buyer_problems", label: "Buyer Problems 🔥" },
  { key: "paid_ad_ready", label: "Paid Ad Ready" },
  { key: "shopify_winners", label: "Shopify Winners" },
  { key: "etsy_trends", label: "Etsy Trends" },
  { key: "printables", label: "Printables" },
  { key: "evergreen", label: "Evergreen" },
  { key: "fast_launch", label: "Fast Launch" },
];

const EXAMPLES = ["weight loss", "dog anxiety", "credit repair", "menopause", "side hustle", "sleep", "confidence"];

export default function ProfitRadar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [mode, setMode] = useState("buyer_problems");
  const [loading, setLoading] = useState(false);
  const [opps, setOpps] = useState<RadarOpportunity[]>([]);
  const [selected, setSelected] = useState<RadarOpportunity | null>(null);

  const fetchOpps = useCallback(async (kw: string, m: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("opportunity-radar", {
        body: { keyword: kw, mode: m },
      });
      if (error) throw error;
      setOpps(data?.opportunities || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to scan opportunities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchOpps("", "buyer_problems");
  }, [user, fetchOpps]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchOpps(keyword, mode);
  };

  const handleBuild = (opp: RadarOpportunity) => {
    const params = new URLSearchParams({
      title: opp.title,
      niche: opp.niche || "",
      audience: opp.payload?.target_audience || "",
      pain: opp.payload?.pain_analysis || "",
      price: String(opp.suggested_price || 27),
    });
    navigate(`/wizard?${params.toString()}`);
  };

  const handleClone = (opp: RadarOpportunity) => {
    navigate(`/clone-competitor?seed=${encodeURIComponent(opp.title)}`);
  };

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6 max-w-7xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5 mb-2">
            <Radar className="h-3 w-3" /> Profit Radar AI
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Discover Problems People Pay To Solve
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Find real buyer demand, score winning opportunities, generate digital products, launch stores, and scale with ads.
          </p>
        </motion.div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search markets, pain points, keywords, niches…"
              className="pl-11 pr-28 h-12 text-base"
            />
            <Button type="submit" size="sm" variant="hero" className="absolute right-2 top-1/2 -translate-y-1/2">
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Scan
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex}
                onClick={() => { setKeyword(ex); fetchOpps(ex, mode); }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </form>

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); fetchOpps(keyword, m.key); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === m.key
                  ? "bg-primary text-primary-foreground shadow-[0_0_18px_-3px_hsl(var(--primary)/0.5)]"
                  : "bg-secondary/40 text-muted-foreground border border-border/30 hover:border-primary/40"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Grid + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
              </div>
            ) : opps.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No opportunities yet. Try a search above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {opps.map((o, i) => (
                  <OpportunityCard
                    key={o.id || i}
                    opp={o}
                    onView={() => setSelected(o)}
                    onBuild={() => handleBuild(o)}
                    onClone={() => handleClone(o)}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <BuyerGoldmines />
          </aside>
        </div>

        <ViewDataModal
          opp={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onBuild={() => { if (selected) handleBuild(selected); setSelected(null); }}
        />
      </div>
    </DashboardLayout>
  );
}
