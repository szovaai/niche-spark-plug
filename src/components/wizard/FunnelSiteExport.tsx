import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, Download, ExternalLink, Loader2, FileText, Mail, Gift, CreditCard, Zap, Eye, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateFunnelSite, generateSalesPageHTML, FUNNEL_TEMPLATES, type FunnelTemplate } from "@/lib/funnelSiteGenerator";
import type { Step3Funnel } from "@/types/launchWizard";

interface Props {
  funnel: Step3Funnel | null;
  productTitle: string;
  productSubtitle?: string;
  price?: number;
  niche?: string;
}

const PAGE_ICONS = [
  { file: "index.html", label: "Sales Page", icon: FileText },
  { file: "optin.html", label: "Opt-In Page", icon: Mail },
  { file: "thankyou.html", label: "Thank You", icon: Gift },
  { file: "bonus.html", label: "Bonus Page", icon: Gift },
  { file: "checkout.html", label: "Checkout", icon: CreditCard },
];

export default function FunnelSiteExport({ funnel, productTitle, productSubtitle, price, niche }: Props) {
  const [authorName, setAuthorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [template, setTemplate] = useState<FunnelTemplate>("classic-im");
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  if (!funnel) return null;

  const config = {
    productTitle,
    productSubtitle,
    authorName,
    contactEmail,
    paymentLink: paymentLink || "#",
    price,
    niche,
    template,
  };

  // Live preview HTML
  const previewHTML = useMemo(() => {
    if (!showPreview) return "";
    return generateSalesPageHTML(funnel, config);
  }, [showPreview, funnel, template, productTitle, productSubtitle, authorName, paymentLink, price]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const files = generateFunnelSite(funnel, config);
      const zip = new JSZip();
      Object.entries(files).forEach(([name, content]) => {
        zip.file(name, content);
      });
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const safeName = productTitle.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase().substring(0, 40);
      saveAs(blob, `${safeName}-funnel-site.zip`);
      toast.success("Funnel site downloaded!");
    } catch {
      toast.error("Failed to generate funnel site");
    } finally {
      setDownloading(false);
    }
  };

  const handleMomentumLaunch = async () => {
    setDownloading(true);
    try {
      const files = generateFunnelSite(funnel, config);
      const zip = new JSZip();
      Object.entries(files).forEach(([name, content]) => {
        zip.file(name, content);
      });
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const safeName = productTitle.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase().substring(0, 40);
      saveAs(blob, `${safeName}-funnel-site.zip`);
      toast.success("Funnel site ready! Now drag the folder onto Netlify Drop →");
      window.open("https://app.netlify.com/drop", "_blank");
    } catch {
      toast.error("Failed to generate");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Instant Funnel Site</h3>
              <p className="text-sm text-muted-foreground">Beautiful, conversion-optimized pages — ready to deploy</p>
            </div>
          </div>
        </div>

        {/* ⚡ Momentum Launch */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-amber-600 dark:text-amber-400">Momentum Launch — Go Live in 2 Minutes</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Download your funnel site + open Netlify Drop in one click. Drag, drop, live.
          </p>
          <Button onClick={handleMomentumLaunch} disabled={downloading} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            ⚡ Momentum Launch
          </Button>
        </div>

        {/* Template Picker */}
        <div>
          <Label className="text-xs font-semibold mb-2 block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Choose Template
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        {/* Pages preview */}
        <div className="flex flex-wrap gap-2">
          {PAGE_ICONS.map(p => (
            <Badge key={p.file} variant="outline" className="gap-1.5 py-1.5 px-3">
              <p.icon className="w-3 h-3" />
              {p.label}
            </Badge>
          ))}
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
            {showPreview ? "Hide Preview" : "Live Preview"}
            {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          {showPreview && (
            <div className="rounded-xl border border-border overflow-hidden shadow-lg">
              <div className="bg-muted/50 px-3 py-1.5 flex items-center gap-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">your-product.netlify.app</span>
              </div>
              <iframe
                srcDoc={previewHTML}
                className="w-full h-[500px] bg-white"
                title="Sales page preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        {/* Collapsible Config */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="gap-1.5 text-muted-foreground"
          >
            {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showConfig ? "Hide" : "Customize"} Details
          </Button>
          {showConfig && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Author / Brand Name</Label>
                <Input placeholder="Your name or brand" value={authorName} onChange={e => setAuthorName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Contact Email</Label>
                <Input placeholder="you@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Payment Link (Gumroad, PayPal, Stripe)</Label>
                <Input placeholder="https://yoursite.gumroad.com/l/product" value={paymentLink} onChange={e => setPaymentLink(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleDownload} disabled={downloading} variant="outline" className="gap-2 flex-1">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Funnel Site (.zip)
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open("https://app.netlify.com/drop", "_blank")}>
            <ExternalLink className="w-4 h-4" />
            Deploy to Netlify
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Drag the downloaded folder onto Netlify Drop to go live in seconds — completely free.
        </p>
      </CardContent>
    </Card>
  );
}
