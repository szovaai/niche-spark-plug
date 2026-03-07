import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, Mail, MessageSquare, Image, FileText, Video, Megaphone, Users, RefreshCw } from "lucide-react";
import { Step1Product, Step2Content, Step3Funnel, Step4Marketing } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RenderedCopy from "@/components/RenderedCopy";
import AssetDownloadButtons from "@/components/AssetDownloadButtons";

interface Props {
  productBrief: Step1Product | null;
  productContent: Step2Content | null;
  funnelCopy: Step3Funnel | null;
  result: Step4Marketing | null;
  setResult: (v: Step4Marketing | null) => void;
  onNext: () => void;
  userId?: string;
  price?: number;
}

export default function WizardStep4({ productBrief, productContent, funnelCopy, result, setResult, onNext, userId, price }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-marketing", {
        body: { productBrief, productContent, funnelCopy, price: price || 17, userId },
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
              <TabsTrigger value="pins" className="gap-1 text-xs"><Image className="w-3 h-3" /> Pins</TabsTrigger>
              <TabsTrigger value="blog" className="gap-1 text-xs"><FileText className="w-3 h-3" /> Blog</TabsTrigger>
              <TabsTrigger value="video" className="gap-1 text-xs"><Video className="w-3 h-3" /> Video</TabsTrigger>
              {result.affiliateKit && (
                <TabsTrigger value="affiliate" className="gap-1 text-xs"><Users className="w-3 h-3" /> Affiliate Kit</TabsTrigger>
              )}
            </TabsList>

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

            {/* Affiliate Kit Tab */}
            {result.affiliateKit && (
              <TabsContent value="affiliate">
                <div className="space-y-4">
                  <Card className="border-accent/30">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-accent/20 text-accent-foreground">JV Page Headline</Badge>
                        <Button variant="ghost" size="sm" onClick={() => copyText(result.affiliateKit!.headline, "jv-headline")} className="gap-1">
                          {copied === "jv-headline" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <p className="text-lg font-bold">{result.affiliateKit.headline}</p>
                    </CardContent>
                  </Card>

                  <h4 className="font-semibold text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Affiliate Email Swipes</h4>
                  {result.affiliateKit.emailSwipes?.map((swipe, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Swipe {i + 1}: {swipe.subject}</h4>
                          <Button variant="ghost" size="sm" onClick={() => copyText(`Subject: ${swipe.subject}\n\n${swipe.body}`, `swipe-${i}`)} className="gap-1">
                            {copied === `swipe-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <RenderedCopy content={swipe.body} showScore={i === 0} />
                      </CardContent>
                    </Card>
                  ))}

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">Promo Angles for Affiliates</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.affiliateKit.promoAngles?.map((angle, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{angle}</Badge>
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
                      <p className="text-sm font-medium">{result.affiliateKit.bonusPageHeadline}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <h3 className="font-bold">JV Recruitment Page Copy</h3>
                        <div className="flex items-center gap-2">
                          <AssetDownloadButtons content={result.affiliateKit.jvPageCopy} title={`${productBrief.title} - JV Page`} />
                          <Button variant="ghost" size="sm" onClick={() => copyText(result.affiliateKit!.jvPageCopy, "jv-copy")} className="gap-1">
                            {copied === "jv-copy" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-[80vh] overflow-y-auto pr-2">
                        <RenderedCopy content={result.affiliateKit.jvPageCopy} showScore />
                      </div>
                    </CardContent>
                  </Card>
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
