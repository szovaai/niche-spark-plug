import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Goldmine {
  title: string;
  niche: string;
  score: number;
  trend: string;
}

export function BuyerGoldmines() {
  const [items, setItems] = useState<Goldmine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("buyer-goldmines-daily");
        if (!error && data?.goldmines) setItems(data.goldmines);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-orange-400" />
          <h3 className="font-bold text-sm">Today's Buyer Goldmines</h3>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No goldmines available right now.</p>
        ) : (
          <ul className="space-y-1.5">
            {items.slice(0, 8).map((g, i) => (
              <li key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/40 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate text-foreground">{g.title}</div>
                  <div className="text-[10px] text-muted-foreground">{g.trend} · {g.niche}</div>
                </div>
                <span className="text-xs font-bold text-primary">{g.score}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
