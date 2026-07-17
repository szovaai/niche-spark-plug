import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles, Copy, Mail, Check } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import {
  CAMPAIGN_CONFIG,
  REPURPOSE_CHANNELS,
  type EmailCampaignType,
} from "@/types/emailCampaign";
import { toast } from "sonner";

const TYPES: EmailCampaignType[] = [
  "origin_story",
  "insight",
  "launch",
  "value",
  "welcome",
  "reengagement",
];

export default function LaunchAssets() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { campaigns, loading, generatingType, generate } = useEmailCampaigns(projectId ?? null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<EmailCampaignType>("launch");

  const byType = useMemo(() => {
    const map = new Map<EmailCampaignType, typeof campaigns>();
    for (const t of TYPES) map.set(t, []);
    for (const c of campaigns) {
      const arr = map.get(c.campaign_type) ?? [];
      arr.push(c);
      map.set(c.campaign_type, arr);
    }
    return map;
  }, [campaigns]);

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied");
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <DashboardLayout title="Launch Assets">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${projectId}`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to project
          </Button>
          <Badge variant="outline" className="gap-1">
            <Mail className="h-3 w-3" /> Email Launch Engine
          </Badge>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Email Launch Engine</h1>
          <p className="text-sm text-muted-foreground">
            Nova writes on-brand sequences and repurposes every email into X, LinkedIn,
            Facebook, Instagram, TikTok, and YouTube Shorts — all in one pass.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as EmailCampaignType)}>
          <TabsList className="flex-wrap gap-1 h-auto">
            {TYPES.map((t) => {
              const cfg = CAMPAIGN_CONFIG[t];
              const count = byType.get(t)?.length ?? 0;
              return (
                <TabsTrigger key={t} value={t} className="gap-1.5">
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {TYPES.map((t) => {
            const cfg = CAMPAIGN_CONFIG[t];
            const list = byType.get(t) ?? [];
            const busy = generatingType === t;
            return (
              <TabsContent key={t} value={t} className="space-y-4 mt-6">
                <Card>
                  <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>{cfg.icon}</span> {cfg.label}
                        <Badge className={cfg.color} variant="outline">
                          {cfg.count} emails
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
                    </div>
                    <Button
                      onClick={() => generate(t)}
                      disabled={busy || !projectId}
                      variant={list.length ? "outline" : "default"}
                    >
                      {busy ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Nova is writing…
                        </>
                      ) : list.length ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" /> Regenerate
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" /> Generate {cfg.count} emails
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {loading && list.length === 0 && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!loading && list.length === 0 && !busy && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                      No {cfg.label.toLowerCase()} emails yet. Hit generate and Nova will
                      draft the full sequence.
                    </CardContent>
                  </Card>
                )}

                {list.map((email) => (
                  <Card key={email.id} className="overflow-hidden">
                    <CardHeader className="border-b border-border/20 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              #{email.email_number}
                            </Badge>
                            {email.preview_text}
                          </div>
                          <CardTitle className="mt-1 text-base font-semibold">
                            {email.subject}
                          </CardTitle>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copy(email.id, `${email.subject}\n\n${email.body_text ?? ""}`)
                          }
                        >
                          {copied === email.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-5">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {email.body_text}
                      </div>
                      {email.cta && (
                        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                          <span className="font-semibold text-primary">CTA:</span> {email.cta}
                        </div>
                      )}

                      {email.repurposed_content &&
                        Object.keys(email.repurposed_content).length > 0 && (
                          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                            <div className="mb-3 text-xs font-semibold text-muted-foreground">
                              Repurposed content
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {REPURPOSE_CHANNELS.map((ch) => {
                                const text = (
                                  email.repurposed_content as Record<string, string>
                                )?.[ch.key];
                                if (!text) return null;
                                return (
                                  <div
                                    key={ch.key}
                                    className="rounded-md border border-border/30 bg-background/50 p-3"
                                  >
                                    <div className="mb-1.5 flex items-center justify-between">
                                      <span className="text-[11px] font-semibold text-muted-foreground">
                                        {ch.label}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copy(`${email.id}-${ch.key}`, text)}
                                      >
                                        {copied === `${email.id}-${ch.key}` ? (
                                          <Check className="h-3 w-3" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                    <div className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
                                      {text}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
