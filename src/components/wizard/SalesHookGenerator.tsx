import { useState } from "react";
import { Zap, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HOOK_CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  curiosity: { label: "Curiosity", emoji: "🔍", color: "bg-purple-500" },
  contrarian: { label: "Contrarian", emoji: "🔄", color: "bg-red-500" },
  bigPromise: { label: "Big Promise", emoji: "🎯", color: "bg-emerald-500" },
  question: { label: "Question", emoji: "❓", color: "bg-blue-500" },
  story: { label: "Story", emoji: "📖", color: "bg-amber-500" },
  proof: { label: "Proof", emoji: "📊", color: "bg-green-600" },
  speed: { label: "Speed", emoji: "⚡", color: "bg-orange-500" },
  fearLoss: { label: "Fear/Loss", emoji: "⏳", color: "bg-rose-600" },
  identity: { label: "Identity", emoji: "🦸", color: "bg-indigo-500" },
  mechanism: { label: "Mechanism", emoji: "⚙️", color: "bg-primary" },
};

interface SalesHookGeneratorProps {
  productName: string;
  mechanism?: string;
  targetAudience?: string;
  painPoints?: string[];
  price?: number;
}

export default function SalesHookGenerator({ productName, mechanism, targetAudience, painPoints, price }: SalesHookGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [headlines, setHeadlines] = useState<Record<string, string[]> | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-hooks", {
        body: { productName, mechanism, targetAudience, painPoints, price },
      });
      if (error) throw error;
      if (data?.headlines) {
        setHeadlines(data.headlines);
        const total = Object.values(data.headlines as Record<string, string[]>).reduce((s, arr) => s + arr.length, 0);
        toast.success(`${total} headline hooks generated!`);
        // Expand first category
        const firstKey = Object.keys(data.headlines)[0];
        if (firstKey) setExpandedCats([firstKey]);
      }
    } catch {
      toast.error("Failed to generate hooks. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyHeadline = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    toast.success("Headline copied!");
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyCategory = (cat: string, items: string[]) => {
    navigator.clipboard.writeText(items.join("\n"));
    toast.success(`All ${HOOK_CATEGORIES[cat]?.label || cat} headlines copied!`);
  };

  const copyAll = () => {
    if (!headlines) return;
    const all = Object.entries(headlines)
      .map(([cat, items]) => `--- ${HOOK_CATEGORIES[cat]?.label || cat} ---\n${items.join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(all);
    toast.success("All 100 headlines copied!");
  };

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const totalCount = headlines ? Object.values(headlines).reduce((s, arr) => s + arr.length, 0) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-4 h-4 text-primary" />
          Sales Hook Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Generate 100 headline variations across 10 proven hook categories. Headlines drive 80% of conversion performance.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} disabled={loading || !productName} variant="hero" size="sm" className="gap-2">
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {headlines ? "Regenerate 100 Hooks" : "Generate 100 Headline Hooks"}
          </Button>
          {headlines && (
            <Button variant="outline" size="sm" onClick={copyAll} className="gap-1">
              <Copy className="w-3 h-3" /> Copy All {totalCount}
            </Button>
          )}
        </div>

        {loading && (
          <div className="text-center text-sm text-muted-foreground animate-pulse py-4">
            Crafting 100 headline variations across 10 categories...
          </div>
        )}

        {headlines && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {Object.entries(headlines).map(([cat, items]) => (
                <Badge key={cat} variant="outline" className="text-xs cursor-pointer" onClick={() => toggleCat(cat)}>
                  {HOOK_CATEGORIES[cat]?.emoji} {HOOK_CATEGORIES[cat]?.label || cat} ({items.length})
                </Badge>
              ))}
            </div>

            {Object.entries(headlines).map(([cat, items]) => {
              const config = HOOK_CATEGORIES[cat];
              const isExpanded = expandedCats.includes(cat);

              return (
                <div key={cat} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs", config?.color || "bg-muted")}>
                        {config?.emoji || "📝"}
                      </div>
                      <span className="font-medium text-sm">{config?.label || cat}</span>
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => { e.stopPropagation(); copyCategory(cat, items); }}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy All
                      </Button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t divide-y">
                      {items.map((headline, i) => {
                        const id = `${cat}-${i}`;
                        return (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 group">
                            <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">{i + 1}</span>
                            <span className="text-sm flex-1">{headline}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 shrink-0"
                              onClick={() => copyHeadline(headline, id)}
                            >
                              {copiedIdx === id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
