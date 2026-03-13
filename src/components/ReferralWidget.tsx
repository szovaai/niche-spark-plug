import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Users, Link2, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReferralWidget() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState({ clicks: 0, signups: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadReferral();
    else setLoading(false);
  }, [user]);

  const loadReferral = async () => {
    const { data } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setCode(data.code);
      setStats({ clicks: data.clicks, signups: data.signups });
    }
    setLoading(false);
  };

  const generateCode = async () => {
    if (!user) return;
    const newCode = `LS-${user.id.slice(0, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const { error } = await supabase.from("referral_codes").insert({
      user_id: user.id,
      code: newCode,
    });

    if (error) {
      toast.error("Failed to create referral code");
      return;
    }
    setCode(newCode);
    toast.success("Referral code created!");
  };

  const copyLink = () => {
    const url = `${window.location.origin}/auth?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Referral link copied!");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-sm">Refer & Earn</h3>
          <Badge variant="secondary" className="text-[10px]">Free</Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          Share your referral link and earn rewards when friends sign up and launch their first product.
        </p>

        {!code ? (
          <Button onClick={generateCode} variant="hero" size="sm" className="w-full gap-2">
            <Link2 className="w-3.5 h-3.5" />
            Generate Referral Link
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/auth?ref=${code}`}
                className="h-8 text-xs font-mono bg-secondary/50"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={copyLink}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Copy referral link</p></TooltipContent>
              </Tooltip>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center cursor-help">
                    <p className="text-xl font-bold">{stats.clicks}</p>
                    <p className="text-[10px] text-muted-foreground">Link Clicks</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Times your referral link has been clicked</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center cursor-help">
                    <p className="text-xl font-bold">{stats.signups}</p>
                    <p className="text-[10px] text-muted-foreground">Signups</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Users who signed up through your link</p></TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
