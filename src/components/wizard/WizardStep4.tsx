import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, Mail, MessageSquare, Image, FileText, Video, Megaphone, Users, RefreshCw, Trophy, Calendar, Send, Target, Zap } from "lucide-react";
import { Step1Product, Step2Content, Step3Funnel, Step4Marketing } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RenderedCopy from "@/components/RenderedCopy";
import AssetDownloadButtons from "@/components/AssetDownloadButtons";
import ViralContentEngine from "@/components/wizard/ViralContentEngine";



import type { LaunchMode } from "@/pages/LaunchWizard";

interface Props {
  productBrief: Step1Product | null;
  productContent: Step2Content | null;
  funnelCopy: Step3Funnel | null;
  result: Step4Marketing | null;
  setResult: (v: Step4Marketing | null) => void;
  onNext: () => void;
  userId?: string;
  price?: number;
  launchMode?: LaunchMode;
}

export default function WizardStep4({ productBrief, productContent, funnelCopy, result, setResult, onNext, userId, price, launchMode }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-marketing", {
        body: { productBrief, productContent, funnelCopy, price: price || 17, userId, launchMode },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Marketing assets generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  if (!productBrief) {
    return <div className="text-center py-12 text-muted-foreground">Complete previous steps first.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Marketing Asset Generator</h2>
        <p className="text-muted-foreground">Create all your promotional content including ad copy & affiliate kit.</p>
      </div>

      {!result && (
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate All Marketing Assets
        </Button>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generate} disabled={loading} className="gap-1">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Regenerate All
            </Button>
          </div>

          <Tabs defaultValue="emails">
            <TabsList className="w-full flex-wrap h-auto gap-1">
              <TabsTrigger value="emails" className="gap-1 text-xs"><Mail className="w-3 h-3" /> Emails</TabsTrigger>
              <TabsTrigger value="ads" className="gap-1 text-xs"><Megaphone className="w-3 h-3" /> Ads</TabsTrigger>
              <TabsTrigger value="posts" className="gap-1 text-xs"><MessageSquare className="w-3 h-3" /> Posts</TabsTrigger>
              <TabsTrigger value="viral" className="gap-1 text-xs font-semibold text-orange-600"><Zap className="w-3 h-3" /> Viral Engine</TabsTrigger>
              <TabsTrigger value="pins" className="gap-1 text-xs"><Image className="w-3 h-3" /> Pins</TabsTrigger>
              <TabsTrigger value="blog" className="gap-1 text-xs"><FileText className="w-3 h-3" /> Blog</TabsTrigger>
              <TabsTrigger value="video" className="gap-1 text-xs"><Video className="w-3 h-3" /> Video</TabsTrigger>
              {result.affiliateKit && (
                <TabsTrigger value="affiliate" className="gap-1 text-xs font-semibold text-primary"><Users className="w-3 h-3" /> Affiliate Launch Kit</TabsTrigger>
              )}
            </TabsList>

            {/* === Emails Tab === */}
            <TabsContent value="emails">
              <div className="space-y-3">
                {result.emails?.map((email, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-sm">Email {i + 1}: {email.subject}</h4>
                        <div className="flex items-center gap-1">
                          <AssetDownloadButtons content={`Subject: ${email.subject}\n\n${email.body}`} title={`Email ${i + 1} - ${email.subject}`} />
                          <Button variant="ghost" size="sm" onClick={() => copyText(`Subject: ${email.subject}\n\n${email.body}`, `email-${i}`)} className="gap-1">
                            {copied === `email-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                      <RenderedCopy content={email.body} showScore={i === 0} mechanismName={productBrief?.uniqueMechanism} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* === Ads Tab === */}
            <TabsContent value="ads">
              <div className="space-y-3">
                {productBrief?.selectedAngle && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-medium">Campaign Angle: <span className="text-primary">{productBrief.selectedAngle}</span></p>
                  </div>
                )}
                {result.adCopy?.map((ad, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">Ad {i + 1}</h4>
                          <Badge variant="outline" className="text-xs">{ad.hookAngle}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <AssetDownloadButtons content={`Headline: ${ad.headline}\n\n${ad.primaryText}\n\nCTA: ${ad.cta}`} title={`Ad ${i + 1} - ${ad.hookAngle}`} />
                          <Button variant="ghost" size="sm" onClick={() => copyText(`Headline: ${ad.headline}\n\n${ad.primaryText}\n\nCTA: ${ad.cta}`, `ad-${i}`)} className="gap-1">
                            {copied === `ad-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 rounded bg-primary/5">
                          <p className="text-sm font-bold">{ad.headline}</p>
                        </div>
                        <RenderedCopy content={ad.primaryText} />
                        <Badge variant="secondary">{ad.cta}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {result.targetingKeywords && result.targetingKeywords.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">Suggested Targeting Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.targetingKeywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* === Posts Tab === */}
            <TabsContent value="posts">
              <div className="grid gap-3 md:grid-cols-2">
                {result.socialPosts?.map((post, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <RenderedCopy content={post} className="text-sm flex-1" />
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyText(post, `post-${i}`)}>
                            {copied === `post-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                          <span className="text-[10px] text-muted-foreground">{post.length} chars</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* === Viral Engine Tab === */}
            <TabsContent value="viral">
              <ViralContentEngine productBrief={productBrief} productContent={productContent} funnelCopy={funnelCopy} />
            </TabsContent>

            {/* === Pins Tab === */}
            <TabsContent value="pins">
              <div className="grid gap-3 md:grid-cols-2">
                {result.pinterestPins?.map((pin, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <RenderedCopy content={pin} className="text-sm" />
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => copyText(pin, `pin-${i}`)}>
                          {copied === `pin-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* === Blog Tab === */}
            <TabsContent value="blog">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <h3 className="font-bold">Blog Article</h3>
                    <div className="flex items-center gap-2">
                      <AssetDownloadButtons content={result.blogArticle} title={`${productBrief.title} - Blog Article`} />
                      <Button variant="ghost" size="sm" onClick={() => copyText(result.blogArticle, "blog")} className="gap-1">
                        {copied === "blog" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-[80vh] overflow-y-auto pr-2">
                    <RenderedCopy content={result.blogArticle} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === Video Tab === */}
            <TabsContent value="video">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                    <h3 className="font-bold">Video Script</h3>
                    <div className="flex items-center gap-2">
                      <AssetDownloadButtons content={result.videoScript} title={`${productBrief.title} - Video Script`} />
                      <Button variant="ghost" size="sm" onClick={() => copyText(result.videoScript, "video")} className="gap-1">
                        {copied === "video" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-[80vh] overflow-y-auto pr-2">
                    <RenderedCopy content={result.videoScript} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === AFFILIATE LAUNCH KIT TAB === */}
            {result.affiliateKit && (
              <TabsContent value="affiliate">
                <div className="space-y-4">
                  {/* Sub-navigation */}
                  <Tabs defaultValue="jv-page">
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-accent/5">
                      <TabsTrigger value="jv-page" className="gap-1 text-xs"><FileText className="w-3 h-3" /> JV Page</TabsTrigger>
                      <TabsTrigger value="swipes" className="gap-1 text-xs"><Mail className="w-3 h-3" /> Affiliate Swipes</TabsTrigger>
                      <TabsTrigger value="outreach" className="gap-1 text-xs"><Send className="w-3 h-3" /> Outreach Emails</TabsTrigger>
                      <TabsTrigger value="contest" className="gap-1 text-xs"><Trophy className="w-3 h-3" /> Contest & Prizes</TabsTrigger>
                      <TabsTrigger value="calendar" className="gap-1 text-xs"><Calendar className="w-3 h-3" /> Launch Calendar</TabsTrigger>
                      <TabsTrigger value="finder" className="gap-1 text-xs"><Target className="w-3 h-3" /> Affiliate Finder</TabsTrigger>
                    </TabsList>

                    {/* JV Page */}
                    <TabsContent value="jv-page">
                      <div className="space-y-4">
                        <Card className="border-accent/30">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-accent/20 text-accent-foreground">JV Page Headline</Badge>
                              <Button variant="ghost" size="sm" onClick={() => copyText(result.affiliateKit!.headline, "jv-headline")} className="gap-1">
                                {copied === "jv-headline" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                            <p className="text-lg font-bold">{result.affiliateKit!.headline}</p>
                          </CardContent>
                        </Card>

                        {/* Commission Structure */}
                        {result.affiliateKit!.commissionStructure && (
                          <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-sm flex items-center gap-2">💰 Commission Structure</h4>
                                <Button variant="ghost" size="sm" onClick={() => copyText(result.affiliateKit!.commissionStructure!, "commission")} className="gap-1">
                                  {copied === "commission" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                              <pre className="text-sm whitespace-pre-wrap font-mono bg-background/50 p-3 rounded-lg">{result.affiliateKit!.commissionStructure}</pre>
                            </CardContent>
                          </Card>
                        )}

                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                              <h3 className="font-bold">JV Recruitment Page Copy</h3>
                              <div className="flex items-center gap-2">
                                <AssetDownloadButtons content={result.affiliateKit!.jvPageCopy} title={`${productBrief.title} - JV Page`} />
                                <Button variant="ghost" size="sm" onClick={() => copyText(result.affiliateKit!.jvPageCopy, "jv-copy")} className="gap-1">
                                  {copied === "jv-copy" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  Copy
                                </Button>
                              </div>
                            </div>
                            <div className="max-h-[80vh] overflow-y-auto pr-2">
                              <RenderedCopy content={result.affiliateKit!.jvPageCopy} showScore />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-2">Promo Angles for Affiliates</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.affiliateKit!.promoAngles?.map((angle, i) => (
                                <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10" onClick={() => copyText(angle, `angle-${i}`)}>
                                  {angle}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">Bonus Page Headline</h4>
                              <Button variant="ghost" size="sm" onClick={() => copyText(result.affiliateKit!.bonusPageHeadline, "bonus-headline")} className="gap-1">
                                {copied === "bonus-headline" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                            <p className="text-sm font-medium">{result.affiliateKit!.bonusPageHeadline}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Affiliate Swipes */}
                    <TabsContent value="swipes">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Affiliate Email Swipes</h4>
                        <p className="text-xs text-muted-foreground">Ready-to-send emails affiliates can use to promote your product. They just replace [YOUR AFFILIATE LINK].</p>
                        {result.affiliateKit!.emailSwipes?.map((swipe, i) => (
                          <Card key={i}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm">Swipe {i + 1}: {swipe.subject}</h4>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => copyText(`Subject: ${swipe.subject}\n\n${swipe.body}`, `swipe-${i}`)} className="gap-1">
                                  {copied === `swipe-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                              <RenderedCopy content={swipe.body} showScore={i === 0} />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Outreach Emails */}
                    <TabsContent value="outreach">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Send className="w-4 h-4 text-accent" /> Affiliate Recruitment Emails
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Personalized outreach emails to recruit affiliates. Copy, customize with their name, and send directly.
                          </p>
                        </div>
                        {result.affiliateKit!.outreachEmails?.map((email, i) => (
                          <Card key={i} className="border-accent/10">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{email.targetType}</Badge>
                                  <h4 className="font-semibold text-sm">{email.subject}</h4>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => copyText(`Subject: ${email.subject}\n\n${email.body}`, `outreach-${i}`)} className="gap-1">
                                  {copied === `outreach-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  Copy
                                </Button>
                              </div>
                              <RenderedCopy content={email.body} />
                            </CardContent>
                          </Card>
                        )) || (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            Outreach emails will appear here after regenerating marketing assets.
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Contest & Prizes */}
                    <TabsContent value="contest">
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-primary" /> Affiliate Contest Leaderboard
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Suggested prize structure to motivate affiliates to promote your launch.
                          </p>
                        </div>

                        <Card className="border-primary/20">
                          <CardContent className="p-5">
                            <div className="space-y-3">
                              {result.affiliateKit!.contestPrizes?.map((prize, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                                  i === 0 ? "bg-yellow-500/10 border border-yellow-500/30" :
                                  i === 1 ? "bg-secondary/50 border border-border" :
                                  i === 2 ? "bg-orange-500/10 border border-orange-500/20" :
                                  "bg-secondary/30 border border-border/50"
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">
                                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏆"}
                                    </span>
                                    <span className="font-semibold text-sm">{prize.place}</span>
                                  </div>
                                  <span className="font-bold text-primary">{prize.prize}</span>
                                </div>
                              )) || (
                                <div className="text-center py-6 text-muted-foreground text-sm">
                                  Contest prizes will appear here after regenerating.
                                </div>
                              )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const prizesText = result.affiliateKit!.contestPrizes?.map(p => `${p.place}: ${p.prize}`).join("\n") || "";
                                  copyText(`AFFILIATE CONTEST — ${productBrief.title}\n\n${prizesText}`, "prizes");
                                }}
                                className="gap-1 w-full"
                              >
                                {copied === "prizes" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy Prize Structure
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Launch Calendar */}
                    <TabsContent value="calendar">
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" /> Launch Calendar
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your affiliate launch timeline — share this with affiliates so they know exactly when to promote.
                          </p>
                        </div>

                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                          <div className="space-y-4">
                            {result.affiliateKit!.launchCalendar?.map((event, i) => (
                              <div key={i} className="flex gap-4 ml-1">
                                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 z-10">
                                  {i + 1}
                                </div>
                                <Card className="flex-1">
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-sm">{event.event}</h4>
                                      <Badge variant="outline" className="text-xs">{event.date}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                                  </CardContent>
                                </Card>
                              </div>
                            )) || (
                              <div className="text-center py-6 text-muted-foreground text-sm ml-8">
                                Launch calendar will appear after regenerating.
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const calText = result.affiliateKit!.launchCalendar?.map(e => `${e.date} — ${e.event}: ${e.description}`).join("\n") || "";
                            copyText(`LAUNCH CALENDAR — ${productBrief.title}\n\n${calText}`, "calendar");
                          }}
                          className="gap-1 w-full"
                        >
                          {copied === "calendar" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy Launch Calendar
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Affiliate Finder */}
                    <TabsContent value="finder">
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" /> Top Affiliate Niches to Target
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            These are the niches where you'll find affiliates who promote similar products. Search affiliate networks like ClickBank, JVZoo, Gumroad, or PartnerStack for top sellers in these categories.
                          </p>
                        </div>

                        <Card>
                          <CardContent className="p-5">
                            <div className="space-y-2">
                              {result.affiliateKit!.topAffiliateNiches?.map((niche, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                                  <span className="text-sm font-medium">{niche}</span>
                                </div>
                              )) || (
                                <div className="text-center py-6 text-muted-foreground text-sm">
                                  Affiliate niches will appear after regenerating.
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-accent/5 border-accent/20">
                          <CardContent className="p-5">
                            <h4 className="font-semibold text-sm mb-3">💡 How to Find Affiliates</h4>
                            <ol className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Browse affiliate networks (ClickBank, JVZoo, Gumroad, PartnerStack) → Find Affiliates</li>
                              <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Search for products in the niches listed above</li>
                              <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Look at the top affiliates on the leaderboard</li>
                              <li className="flex gap-2"><span className="font-bold text-foreground">4.</span> Send them your Outreach Email (from the Outreach tab)</li>
                              <li className="flex gap-2"><span className="font-bold text-foreground">5.</span> Include your JV page link and offer review access</li>
                            </ol>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            )}
          </Tabs>
          <Button onClick={onNext} className="gap-2">Continue to Launch Checklist</Button>
        </div>
      )}
    </div>
  );
}
