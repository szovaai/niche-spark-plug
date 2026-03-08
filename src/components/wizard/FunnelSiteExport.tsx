import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Download, ExternalLink, Loader2, FileText, ShoppingCart, Gift, Mail, CreditCard } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateFunnelSite } from "@/lib/funnelSiteGenerator";
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

  if (!funnel) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const files = generateFunnelSite(funnel, {
        productTitle,
        productSubtitle,
        authorName,
        contactEmail,
        paymentLink: paymentLink || "#",
        price,
        niche,
      });

      const zip = new JSZip();
      Object.entries(files).forEach(([name, content]) => {
        zip.file(name, content);
      });

      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const safeName = productTitle.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").toLowerCase().substring(0, 40);
      saveAs(blob, `${safeName}-funnel-site.zip`);
      toast.success("Funnel site downloaded!");
    } catch (e: any) {
      toast.error("Failed to generate funnel site");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Instant Funnel Site</h3>
            <p className="text-sm text-muted-foreground">Download a ready-to-deploy website — no funnel builder needed</p>
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

        {/* Config inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleDownload} disabled={downloading} className="gap-2 flex-1">
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
