import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe, Download, ExternalLink, Loader2, Zap, Eye, Palette,
  ChevronDown, ChevronUp, ArrowRight, Link2, Mail, Settings2,
  FileText, CreditCard, Gift, ShoppingCart, Users, Rocket
} from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  generateFunnelSite,
  generateSalesPageHTML,
  FUNNEL_TEMPLATES,
  FUNNEL_TYPES,
  type FunnelTemplate,
  type FunnelType,
  type AutoresponderConfig,
} from "@/lib/funnelSiteGenerator";
import type { Step3Funnel, Step4Marketing } from "@/types/launchWizard";

interface Props {
  funnel: Step3Funnel | null;
  marketing?: Step4Marketing | null;
  productTitle: string;
  productSubtitle?: string;
  price?: number;
  niche?: string;
}

const PAYMENT_PROVIDERS = [
  { value: "stripe", label: "Stripe Payment Link" },
  { value: "paypal", label: "PayPal Checkout" },
  { value: "warriorplus", label: "WarriorPlus Buy Button" },
  { value: "gumroad", label: "Gumroad Link" },
  { value: "thrivecart", label: "ThriveCart" },
  { value: "systemeio", label: "Systeme.io" },
  { value: "generic", label: "Generic Checkout URL" },
];

const AUTORESPONDER_PROVIDERS = [
  { value: "none", label: "No autoresponder" },
  { value: "systemeio", label: "Systeme.io" },
  { value: "getresponse", label: "GetResponse" },
  { value: "aweber", label: "AWeber" },
  { value: "mailchimp", label: "Mailchimp" },
  { value: "convertkit", label: "ConvertKit / Kit" },
  { value: "activecampaign", label: "ActiveCampaign" },
  { value: "beehiiv", label: "Beehiiv" },
  { value: "webhook", label: "Generic Webhook" },
  { value: "zapier", label: "Zapier / Make" },
];

const PAGE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "optin.html": { label: "Opt-In Page", icon: Mail, color: "text-blue-500" },
  "index.html": { label: "Sales Page", icon: FileText, color: "text-primary" },
  "checkout.html": { label: "Checkout", icon: CreditCard, color: "text-emerald-500" },
  "upsell.html": { label: "Upsell (OTO)", icon: ShoppingCart, color: "text-amber-500" },
  "downsell.html": { label: "Downsell (Lite)", icon: ShoppingCart, color: "text-orange-500" },
  "thankyou.html": { label: "Thank You", icon: Gift, color: "text-green-500" },
  "bonus-delivery.html": { label: "Bonus Delivery", icon: Gift, color: "text-violet-500" },
  "bonus.html": { label: "Bonus Page", icon: Gift, color: "text-violet-500" },
  "affiliate.html": { label: "Affiliate Page", icon: Users, color: "text-pink-500" },
};

export default function FunnelInjectionEngine({ funnel, marketing, productTitle, productSubtitle, price, niche }: Props) {
  const [funnelType, setFunnelType] = useState<FunnelType>("warriorplus-launch");
  const [template, setTemplate] = useState<FunnelTemplate>("classic-im");
  const [paymentProvider, setPaymentProvider] = useState("stripe");
  const [paymentLink, setPaymentLink] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [autoresponder, setAutoresponder] = useState("none");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [step, setStep] = useState(1); // 1=type, 2=config, 3=preview+deploy

  const config = useMemo(() => ({
    productTitle,
    productSubtitle,
    authorName,
    contactEmail,
    paymentLink: paymentLink || "#",
    price,
    niche,
    template,
  }), [productTitle, productSubtitle, authorName, contactEmail, paymentLink, price, niche, template]);

  const selectedFunnelType = FUNNEL_TYPES.find(t => t.id === funnelType) || FUNNEL_TYPES[2];

  const previewHTML = useMemo(() => {
    if (!showPreview || !funnel) return "";
    return generateSalesPageHTML(funnel, config);
  }, [showPreview, funnel, config]);

  if (!funnel) return null;

  const doDownload = async (openNetlify = false) => {
    setDownloading(true);
    try {
      const files = generateFunnelSite(funnel, config, funnelType, marketing?.affiliateKit);
      const zip = new JSZip();
      Object.entries(files).forEach(([name, content]) => zip.file(name, content));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const safeName = productTitle.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase().substring(0, 40);
      saveAs(blob, `${safeName}-funnel.zip`);
      toast.success(openNetlify ? "Funnel ready! Opening Netlify Drop…" : "Funnel downloaded!");
      if (openNetlify) {
        setTimeout(() => window.open("https://app.netlify.com/drop", "_blank"), 500);
      }
    } catch {
      toast.error("Failed to generate funnel");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-border/50">
          <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Funnel Injection Engine</h3>
            <p className="text-sm text-muted-foreground">One-click deploy — copy, graphics & branding auto-injected</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {selectedFunnelType.pages.length} pages
          </Badge>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 flex items-center gap-2 bg-muted/30 border-b border-border/50">
          {[
            { n: 1, label: "Funnel Type" },
            { n: 2, label: "Setup" },
            { n: 3, label: "Deploy" },
          ].map((s, i) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                step === s.n
                  ? "bg-primary text-primary-foreground"
                  : step > s.n
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.n}. {s.label}
              {i < 2 && <ArrowRight className="w-3 h-3 ml-1 text-muted-foreground" />}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* STEP 1: Funnel Type Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Choose Your Funnel Type</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FUNNEL_TYPES.map(ft => (
                  <button
                    key={ft.id}
                    onClick={() => setFunnelType(ft.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      funnelType === ft.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/40 bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{ft.icon}</span>
                      <span className="font-semibold text-sm">{ft.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{ft.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ft.pages.map(p => {
                        const meta = PAGE_META[p];
                        return meta ? (
                          <Badge key={p} variant="outline" className="text-[10px] py-0 px-1.5 gap-0.5">
                            <meta.icon className={`w-2.5 h-2.5 ${meta.color}`} />
                            {meta.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </button>
                ))}
              </div>

              {/* Visual Funnel Map */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h5 className="text-xs font-semibold text-muted-foreground mb-3">FUNNEL MAP</h5>
                <div className="flex items-center gap-1 flex-wrap">
                  {selectedFunnelType.pages.map((p, i) => {
                    const meta = PAGE_META[p];
                    if (!meta) return null;
                    return (
                      <div key={p} className="flex items-center gap-1">
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-xs font-medium">
                          <meta.icon className={`w-3.5 h-3.5 ${meta.color}`} />
                          {meta.label}
                        </div>
                        {i < selectedFunnelType.pages.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="gap-2">
                Continue to Setup <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: Configuration */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Template picker */}
              <div>
                <Label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Design Template
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {FUNNEL_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        template === t.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{t.preview}</span>
                        <span className="font-semibold text-sm">{t.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment link — GLOBAL */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">Global Payment Link</h4>
                  <Badge variant="outline" className="text-[10px]">Updates all CTA buttons</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Provider</Label>
                    <Select value={paymentProvider} onValueChange={setPaymentProvider}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_PROVIDERS.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Checkout URL</Label>
                    <Input
                      className="mt-1"
                      placeholder="https://your-checkout-link.com"
                      value={paymentLink}
                      onChange={e => setPaymentLink(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Autoresponder */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">Autoresponder</h4>
                  <Badge variant="outline" className="text-[10px]">For opt-in forms</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Email Platform</Label>
                    <Select value={autoresponder} onValueChange={setAutoresponder}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AUTORESPONDER_PROVIDERS.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {autoresponder !== "none" && (
                    <div>
                      <Label className="text-xs">Webhook / Form Action URL</Label>
                      <Input
                        className="mt-1"
                        placeholder="https://your-webhook-url.com"
                        value={webhookUrl}
                        onChange={e => setWebhookUrl(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {autoresponder !== "none" && (
                  <p className="text-xs text-muted-foreground">
                    Paste your autoresponder's form action URL or webhook endpoint. Opt-in forms will POST to this URL.
                  </p>
                )}
              </div>

              {/* Advanced settings */}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="gap-1.5 text-muted-foreground"
                >
                  <Settings2 className="w-3 h-3" />
                  {showAdvanced ? "Hide" : "Show"} Advanced Settings
                  {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
                {showAdvanced && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Author / Brand Name</Label>
                      <Input placeholder="Your name or brand" value={authorName} onChange={e => setAuthorName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Contact Email</Label>
                      <Input placeholder="you@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="gap-2 flex-1">
                  Review & Deploy <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Deploy */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                <h4 className="font-semibold text-sm">Funnel Summary</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{selectedFunnelType.label}</span></div>
                  <div><span className="text-muted-foreground">Template:</span> <span className="font-medium">{FUNNEL_TEMPLATES.find(t => t.id === template)?.label}</span></div>
                  <div><span className="text-muted-foreground">Pages:</span> <span className="font-medium">{selectedFunnelType.pages.length}</span></div>
                  <div><span className="text-muted-foreground">Payment:</span> <span className="font-medium">{paymentLink ? "✓ Set" : "⚠ Not set"}</span></div>
                </div>

                {/* Funnel map */}
                <div className="flex items-center gap-1 flex-wrap pt-2">
                  {selectedFunnelType.pages.map((p, i) => {
                    const meta = PAGE_META[p];
                    if (!meta) return null;
                    return (
                      <div key={p} className="flex items-center gap-1">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-card border border-border text-[10px] font-medium">
                          <meta.icon className={`w-3 h-3 ${meta.color}`} />
                          {meta.label}
                        </div>
                        {i < selectedFunnelType.pages.length - 1 && (
                          <ArrowRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-1.5 mb-3"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? "Hide Preview" : "Preview Sales Page"}
                  {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
                {showPreview && previewHTML && (
                  <div className="rounded-xl border border-border overflow-hidden shadow-lg">
                    <div className="bg-muted/50 px-3 py-1.5 flex items-center gap-2 border-b border-border">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">your-product.netlify.app</span>
                    </div>
                    <iframe
                      srcDoc={previewHTML}
                      className="w-full h-[500px]"
                      style={{ background: "#fff" }}
                      title="Sales page preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                )}
              </div>

              {/* Deploy actions */}
              <div className="space-y-3">
                {/* Momentum Launch */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <h4 className="font-bold text-accent">⚡ Deploy My Funnel — Go Live Now</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Downloads your {selectedFunnelType.pages.length}-page funnel + opens Netlify Drop. Drag, drop, live in 60 seconds.
                  </p>
                  <Button onClick={() => doDownload(true)} disabled={downloading} className="gap-2">
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                    Deploy My Funnel
                  </Button>
                </div>

                {/* Alternative actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => doDownload(false)} disabled={downloading} variant="outline" className="gap-2 flex-1">
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Only (.zip)
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => window.open("https://app.netlify.com/drop", "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                    Open Netlify Drop
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1 text-muted-foreground">
                    ← Back to Setup
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Drag the downloaded folder onto Netlify Drop → live URL in seconds. Free forever.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
