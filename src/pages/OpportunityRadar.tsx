import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Radar, TrendingUp, Zap, ArrowRight, RefreshCw, Sparkles,
  Target, DollarSign, Users, Flame, Wand2, Filter, X, ChevronsUpDown, Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RESEARCH_NICHES, NICHES_BY_CATEGORY, NICHE_CATEGORIES, type ResearchNiche } from "@/data/researchNiches";
import { cn } from "@/lib/utils";

interface Opportunity {
  title: string;
  niche: string;
  description: string;
  demandScore: number;
  competitionScore: number;
  monetizationScore: number;
  audienceUrgency: number;
  launchScore: number;
  suggestedPrice: number;
  targetAudience: string;
  mechanism: string;
  salesPromise: string;
  tags: string[];
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "ai-tools", label: "AI Tools" },
  { value: "marketing", label: "Marketing" },
  { value: "automation", label: "Automation" },
  { value: "freelancing", label: "Freelancing" },
  { value: "content-creation", label: "Content Creation" },
  { value: "e-commerce", label: "E-Commerce" },
  { value: "health", label: "Health" },
  { value: "crypto", label: "Crypto" },
  { value: "productivity", label: "Productivity" },
];

const difficulties = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const profitLevels = [
  { value: "all", label: "All Profit" },
  { value: "low", label: "Low ($7-$17)" },
  { value: "medium", label: "Medium ($17-$47)" },
  { value: "high", label: "High ($47+)" },
];

function getCompetitionColor(score: number): string {
  if (score <= 3) return "hsl(142, 76%, 46%)";   // green
  if (score <= 6) return "hsl(45, 100%, 55%)";    // yellow
  return "hsl(0, 84%, 60%)";                       // red
}

function getCompetitionLabel(score: number): string {
  if (score <= 3) return "Low";
  if (score <= 6) return "Medium";
  return "High";
}

function getDifficultyFromScore(score: number): string {
  if (score >= 75) return "beginner";
  if (score >= 50) return "intermediate";
  return "advanced";
}

function getProfitFromPrice(price: number): string {
  if (price <= 17) return "low";
  if (price <= 47) return "medium";
  return "high";
}

// Radar visualization component
function RadarVisualization({
  opportunities,
  selected,
  onSelect,
}: {
  opportunities: Opportunity[];
  selected: string | null;
  onSelect: (title: string) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const size = 400;
  const center = size / 2;

  // Position blips based on scores
  const blips = useMemo(() => {
    return opportunities.map((opp, i) => {
      // Distance from center = inverse of launchScore (easier = closer)
      const distance = ((100 - opp.launchScore) / 100) * (center - 40);
      // Angle based on index spread
      const angle = (i / opportunities.length) * Math.PI * 2 - Math.PI / 2;
      const x = center + Math.cos(angle) * distance;
      const y = center + Math.sin(angle) * distance;
      // Size based on demand
      const radius = 8 + (opp.demandScore / 100) * 16;
      const color = getCompetitionColor(opp.competitionScore);
      return { ...opp, x, y, radius, color };
    });
  }, [opportunities, center]);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Radar rings */}
      <svg width={size} height={size} className="absolute inset-0">
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={(center - 20) * r}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity={0.3}
          />
        ))}
        {/* Cross lines */}
        <line x1={center} y1={20} x2={center} y2={size - 20} stroke="hsl(var(--border))" strokeWidth="1" opacity={0.2} />
        <line x1={20} y1={center} x2={size - 20} y2={center} stroke="hsl(var(--border))" strokeWidth="1" opacity={0.2} />
        {/* Sweep line animation */}
        <line
          x1={center}
          y1={center}
          x2={center}
          y2={20}
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          opacity={0.4}
          className="origin-center"
          style={{
            transformOrigin: `${center}px ${center}px`,
            animation: "radar-sweep 6s linear infinite",
          }}
        />
      </svg>

      {/* Center pulse */}
      <div
        className="absolute rounded-full bg-primary/20 animate-ping"
        style={{ width: 12, height: 12, left: center - 6, top: center - 6 }}
      />
      <div
        className="absolute rounded-full bg-primary"
        style={{ width: 8, height: 8, left: center - 4, top: center - 4 }}
      />

      {/* Blips */}
      {blips.map((blip, i) => (
        <motion.div
          key={blip.title}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1, type: "spring" }}
          className={`absolute cursor-pointer transition-all hover:z-10 group ${
            selected === blip.title ? "z-20" : ""
          }`}
          style={{
            left: blip.x - blip.radius,
            top: blip.y - blip.radius,
            width: blip.radius * 2,
            height: blip.radius * 2,
          }}
          onClick={() => onSelect(blip.title)}
        >
          <div
            className={`w-full h-full rounded-full transition-all ${
              selected === blip.title ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
            }`}
            style={{
              backgroundColor: blip.color,
              opacity: selected === blip.title ? 1 : 0.75,
              boxShadow: `0 0 ${blip.radius}px ${blip.color}40`,
            }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
            <div className="bg-popover text-popover-foreground text-xs px-2.5 py-1.5 rounded-md shadow-lg border border-border">
              <p className="font-semibold">{blip.title}</p>
              <p className="text-muted-foreground">{blip.niche} · Score {blip.launchScore}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Labels */}
      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50 uppercase tracking-wider">Easiest</span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50 uppercase tracking-wider">Hardest</span>

      {/* CSS for sweep animation */}
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Opportunity detail card
function OpportunityDetail({ opp, onBuild }: { opp: Opportunity; onBuild: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
      <Card className="border-primary/30 bg-card/80 backdrop-blur-lg">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-lg">{opp.title}</h3>
            <p className="text-sm text-muted-foreground">{opp.niche}</p>
          </div>

          <p className="text-sm text-muted-foreground">{opp.description}</p>

          {/* Score grid */}
          <div className="grid grid-cols-2 gap-3">
            <ScoreCard label="Demand Score" value={opp.demandScore} icon={<TrendingUp className="w-3.5 h-3.5" />} />
            <ScoreCard label="Competition" value={opp.competitionScore} icon={<Users className="w-3.5 h-3.5" />} max={10} inverted />
            <ScoreCard label="Launch Difficulty" value={opp.launchScore} icon={<Zap className="w-3.5 h-3.5" />} />
            <ScoreCard label="Monetization" value={opp.monetizationScore} icon={<DollarSign className="w-3.5 h-3.5" />} />
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <span className="text-sm text-muted-foreground">Estimated Price</span>
            <span className="text-lg font-bold text-primary">${opp.suggestedPrice}</span>
          </div>

          {/* Mechanism */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Unique Mechanism</p>
            <p className="text-sm font-medium">{opp.mechanism}</p>
          </div>

          {/* Sales Promise */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sales Promise</p>
            <p className="text-sm">{opp.salesPromise}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {opp.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>

          {/* CTA */}
          <Button onClick={onBuild} className="w-full gap-2" variant="hero">
            <Wand2 className="w-4 h-4" />
            Build This Product
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ScoreCard({ label, value, icon, max = 100, inverted = false }: {
  label: string; value: number; icon: React.ReactNode; max?: number; inverted?: boolean;
}) {
  const pct = (value / max) * 100;
  const displayScore = inverted ? (max === 10 ? getCompetitionLabel(value) : `${value}/${max}`) : `${value}/${max}`;

  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-lg font-bold">{displayScore}</p>
      <Progress value={inverted ? 100 - pct : pct} className="h-1.5" />
    </div>
  );
}

// Legend
function RadarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 46%)" }} />
        <span>Low Competition</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 100%, 55%)" }} />
        <span>Medium</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
        <span>High</span>
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        <span>Small = lower demand</span>
        <div className="w-4 h-4 rounded-full bg-muted-foreground/40" />
        <span>Large = higher demand</span>
      </div>
    </div>
  );
}

const OpportunityRadar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [profitLevel, setProfitLevel] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedNicheId, setSelectedNicheId] = useState<string>(() => {
    if (typeof window === "undefined") return "all";
    return localStorage.getItem("radar:selectedNicheId") || "all";
  });
  const [nichePickerOpen, setNichePickerOpen] = useState(false);

  const selectedNiche: ResearchNiche | null = useMemo(
    () => RESEARCH_NICHES.find(n => n.id === selectedNicheId) || null,
    [selectedNicheId]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("radar:selectedNicheId", selectedNicheId);
    }
  }, [selectedNicheId]);

  const fetchOpportunities = async () => {
    if (!user) {
      toast.error("Sign in to discover opportunities");
      return;
    }
    setLoading(true);
    setSelected(null);
    try {
      const { data, error } = await supabase.functions.invoke("opportunity-radar", {
        body: {
          category,
          targetNiche: selectedNiche?.label || "all",
          targetKeywords: selectedNiche?.keywords || [],
        },
      });
      if (error) throw error;
      setOpportunities(data.opportunities || []);
      toast.success("Radar scan complete!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to scan market");
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      if (difficulty !== "all" && getDifficultyFromScore(opp.launchScore) !== difficulty) return false;
      if (profitLevel !== "all" && getProfitFromPrice(opp.suggestedPrice) !== profitLevel) return false;
      return true;
    });
  }, [opportunities, difficulty, profitLevel]);

  const selectedOpp = useMemo(
    () => filteredOpportunities.find(o => o.title === selected) || null,
    [filteredOpportunities, selected]
  );

  const launchFromOpportunity = useCallback((opp: Opportunity) => {
    const params = new URLSearchParams({
      niche: opp.niche,
      topic: opp.title,
      audience: opp.targetAudience,
      mechanism: opp.mechanism,
    });
    navigate(`/wizard?${params.toString()}`);
  }, [navigate]);

  return (
    <DashboardLayout title="Opportunity Radar">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Radar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Market Opportunity Radar</h1>
              <p className="text-sm text-muted-foreground">
                Visually map profitable opportunities — see where the money is
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={profitLevel} onValueChange={setProfitLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profitLevels.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchOpportunities} disabled={loading} className="gap-2 shrink-0">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
                {loading ? "Scanning..." : opportunities.length > 0 ? "Rescan" : "Scan Market"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: "4s" }} />
              <div className="absolute inset-4 rounded-full border border-primary/20 animate-spin" style={{ animationDuration: "3s", animationDirection: "reverse" }} />
              <div className="absolute inset-8 rounded-full border border-primary/40 animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Radar className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Scanning market signals...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && opportunities.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Radar className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Scan the Market</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Click "Scan Market" to have AI analyze trending niches and discover profitable product opportunities you can launch today.
            </p>
            <Button onClick={fetchOpportunities} size="lg" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Scan Market Now
            </Button>
          </motion.div>
        )}

        {/* Radar + Detail panel */}
        {!loading && filteredOpportunities.length > 0 && (
          <div className="space-y-4">
            {/* Legend */}
            <RadarLegend />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Radar visualization */}
              <div className="lg:col-span-3">
                <Card className="bg-card/40 backdrop-blur-lg border-border/50 overflow-hidden">
                  <CardContent className="p-6 flex items-center justify-center">
                    <RadarVisualization
                      opportunities={filteredOpportunities}
                      selected={selected}
                      onSelect={(title) => setSelected(selected === title ? null : title)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Detail panel */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {selectedOpp ? (
                    <OpportunityDetail
                      key={selectedOpp.title}
                      opp={selectedOpp}
                      onBuild={() => launchFromOpportunity(selectedOpp)}
                    />
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center p-8"
                    >
                      <Target className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Click a blip on the radar to see opportunity details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Opportunity list below */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOpportunities.map((opp, i) => (
                <motion.div
                  key={opp.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:border-primary/40 ${
                      selected === opp.title ? "ring-1 ring-primary/50 border-primary/40" : "border-border/50"
                    }`}
                    onClick={() => setSelected(selected === opp.title ? null : opp.title)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: getCompetitionColor(opp.competitionScore) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{opp.title}</p>
                        <p className="text-xs text-muted-foreground">{opp.niche}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{opp.launchScore}</p>
                        <p className="text-[10px] text-muted-foreground">Score</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OpportunityRadar;
