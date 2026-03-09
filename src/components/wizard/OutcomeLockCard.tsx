import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Target, Clock, Zap, Trophy, Shield, ArrowRight } from "lucide-react";

export interface OutcomeLock {
  audience: string;
  painPoint: string;
  promisedResult: string;
  realisticTimeframe: string;
  quickWin: string;          // what they achieve in 30-60 min
  shortTermWin: string;      // 24 hours
  coreResultWindow: string;  // 3-7 days
  finalTransformation: string;
  refundConditions: string;
}

interface Props {
  outcomeLock: OutcomeLock | null;
  setOutcomeLock: (v: OutcomeLock) => void;
  locked: boolean;
  onLock: () => void;
  onUnlock: () => void;
}

const EMPTY: OutcomeLock = {
  audience: "", painPoint: "", promisedResult: "", realisticTimeframe: "",
  quickWin: "", shortTermWin: "", coreResultWindow: "",
  finalTransformation: "", refundConditions: "",
};

export function isOutcomeLockComplete(lock: OutcomeLock | null): boolean {
  if (!lock) return false;
  return !!(lock.audience && lock.painPoint && lock.promisedResult && lock.realisticTimeframe && lock.quickWin && lock.finalTransformation && lock.refundConditions);
}

export default function OutcomeLockCard({ outcomeLock, setOutcomeLock, locked, onLock, onUnlock }: Props) {
  const data = outcomeLock || EMPTY;
  const complete = isOutcomeLockComplete(outcomeLock);

  const update = (field: keyof OutcomeLock, value: string) => {
    setOutcomeLock({ ...data, [field]: value });
  };

  const fields: { key: keyof OutcomeLock; label: string; icon: typeof Target; placeholder: string; multiline?: boolean }[] = [
    { key: "audience", label: "Target Audience", icon: Target, placeholder: "e.g. Complete beginners who want to freelance with AI" },
    { key: "painPoint", label: "Core Pain Point", icon: Zap, placeholder: "e.g. They don't know what to offer or how to find clients" },
    { key: "promisedResult", label: "Promised Result", icon: Trophy, placeholder: "e.g. Land their first $100-$250 client within 3-7 days" },
    { key: "realisticTimeframe", label: "Realistic Timeframe", icon: Clock, placeholder: "e.g. 3-7 days of focused action" },
    { key: "quickWin", label: "Quick Win (30-60 min)", icon: Zap, placeholder: "e.g. Pick a niche, define an offer, build a prospect list of 20 businesses" },
    { key: "shortTermWin", label: "24-Hour Milestone", icon: Clock, placeholder: "e.g. Send first outreach batch and get delivery assets ready" },
    { key: "coreResultWindow", label: "Core Result Window (3-7 days)", icon: Trophy, placeholder: "e.g. Close first paying client and deliver first project" },
    { key: "finalTransformation", label: "Final Transformation", icon: ArrowRight, placeholder: "e.g. From confused beginner → someone with a packaged service, outreach script, and first client", multiline: true },
    { key: "refundConditions", label: "Refund-Safe Promise", icon: Shield, placeholder: "e.g. Follow the steps, complete the outreach, and if you don't get traction, we'll make it right", multiline: true },
  ];

  return (
    <Card className={`border-2 transition-colors ${locked ? "border-emerald-500/40" : complete ? "border-primary/40" : "border-amber-500/30"}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {locked ? <Lock className="w-5 h-5 text-emerald-400" /> : <Unlock className="w-5 h-5 text-amber-400" />}
            <div>
              <h3 className="font-bold text-sm">Outcome Lock</h3>
              <p className="text-xs text-muted-foreground">
                {locked ? "Locked — your product is built around this transformation." : "Define the transformation before generating content."}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={locked ? "text-emerald-400 border-emerald-500/30" : complete ? "text-primary border-primary/30" : "text-amber-400 border-amber-500/30"}>
            {locked ? "Locked ✓" : complete ? "Ready to Lock" : "Incomplete"}
          </Badge>
        </div>

        {!locked && (
          <div className="grid gap-3">
            {fields.map(({ key, label, icon: Icon, placeholder, multiline }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  {label} <span className="text-destructive">*</span>
                </Label>
                {multiline ? (
                  <Textarea
                    value={data[key]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="text-sm min-h-[60px]"
                  />
                ) : (
                  <Input
                    value={data[key]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="text-sm"
                  />
                )}
              </div>
            ))}
            <Button onClick={onLock} disabled={!complete} className="gap-2 mt-1">
              <Lock className="w-4 h-4" />
              Lock Outcome & Generate Product
            </Button>
          </div>
        )}

        {locked && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.filter(f => data[f.key]).map(({ key, label, icon: Icon }) => (
                <div key={key} className="p-2 rounded-lg bg-secondary/30 border border-border/30">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Icon className="w-3 h-3" /> {label}
                  </p>
                  <p className="text-xs mt-0.5">{data[key]}</p>
                </div>
              ))}
            </div>

            {/* Result Path Timeline */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Expected Results Timeline
              </h4>
              <div className="space-y-2">
                {data.quickWin && (
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5 border-primary/30 text-primary">30-60 min</Badge>
                    <p className="text-xs">{data.quickWin}</p>
                  </div>
                )}
                {data.shortTermWin && (
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5 border-primary/30 text-primary">24 hours</Badge>
                    <p className="text-xs">{data.shortTermWin}</p>
                  </div>
                )}
                {data.coreResultWindow && (
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5 border-primary/30 text-primary">3-7 days</Badge>
                    <p className="text-xs">{data.coreResultWindow}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transformation Summary */}
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" /> Transformation Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-destructive/80 uppercase">Before this product</p>
                  <p className="text-xs text-muted-foreground">{data.painPoint || "Not defined"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase">After completing this product</p>
                  <p className="text-xs text-muted-foreground">{data.finalTransformation || "Not defined"}</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="text-xs" onClick={onUnlock}>
              <Unlock className="w-3 h-3 mr-1" /> Unlock & Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
