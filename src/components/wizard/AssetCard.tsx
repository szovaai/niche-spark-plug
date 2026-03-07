import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import AssetDownloadButtons from "@/components/AssetDownloadButtons";
import type { ProductAssets, AssetType } from "@/types/productAssets";

interface AssetCardProps {
  assetType: AssetType;
  label: string;
  data: any;
  productTitle: string;
}

function formatAssetText(assetType: AssetType, data: any): string {
  switch (assetType) {
    case "workbook":
      return data.worksheets?.map((w: any) =>
        `${w.title}\n${w.intro}\n\nQuestions:\n${w.questions?.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}\n\nReflection: ${w.reflectionPrompt}`
      ).join("\n\n---\n\n") || "";
    case "cheatsheet":
      return data.sheets?.map((s: any) =>
        `${s.title}\n${s.subtitle}\n\n${s.steps?.map((st: any) => `Step ${st.number}: ${st.title}\n${st.description}`).join("\n\n")}\n\nPro Tip: ${s.proTip}`
      ).join("\n\n---\n\n") || "";
    case "toolkit":
      return data.tools?.map((t: any) =>
        `${t.name} (${t.type})\n${t.description}\n\n${t.content}`
      ).join("\n\n---\n\n") || "";
    case "templates":
      return data.templates?.map((t: any) =>
        `${t.name}\nCategory: ${t.category}\n\nInstructions: ${t.instructions}\n\n${t.content}`
      ).join("\n\n---\n\n") || "";
    case "promptPack":
      return data.categories?.map((c: any) =>
        `--- ${c.name} ---\n\n${c.prompts?.map((p: any) => `${p.title}\n\n${p.prompt}\n\nExpected Output: ${p.expectedOutput}`).join("\n\n")}`
      ).join("\n\n===\n\n") || "";
    case "bonusGuides":
      return data.bonuses?.map((b: any) =>
        `${b.name} (Value: $${b.perceivedValue})\n${b.tagline}\n\n${b.content}`
      ).join("\n\n---\n\n") || "";
    case "caseStudies":
      return data.caseStudies?.map((c: any) =>
        `Case Study: ${c.name}\n\nBackground: ${c.background}\nChallenge: ${c.challenge}\nMethod: ${c.method}\nResults: ${c.results}\n\n"${c.quote}"`
      ).join("\n\n---\n\n") || "";
    case "multiplier":
      return data.formats?.map((f: any) =>
        `${f.format} — $${f.estimatedPrice} (${f.timeToCreate})\n${f.pitch}\n\nOutline:\n${f.outline?.map((o: string) => `• ${o}`).join("\n")}`
      ).join("\n\n---\n\n") || "";
    default:
      return JSON.stringify(data, null, 2);
  }
}

export default function AssetCard({ assetType, label, data, productTitle }: AssetCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = formatAssetText(assetType, data);

  const copyAll = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    switch (assetType) {
      case "workbook":
        return data.worksheets?.map((w: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <p className="font-semibold text-sm">{w.title}</p>
            <p className="text-xs text-muted-foreground">{w.intro}</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              {w.questions?.map((q: string, j: number) => <li key={j} className="text-muted-foreground">{q}</li>)}
            </ol>
            <p className="text-xs italic text-muted-foreground">💭 {w.reflectionPrompt}</p>
          </div>
        ));
      case "cheatsheet":
        return data.sheets?.map((s: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <p className="font-semibold text-sm">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.subtitle}</p>
            {s.steps?.map((st: any, j: number) => (
              <div key={j} className="flex gap-2">
                <Badge variant="outline" className="shrink-0 h-5 w-5 flex items-center justify-center p-0 text-xs">{st.number}</Badge>
                <div><p className="text-sm font-medium">{st.title}</p><p className="text-xs text-muted-foreground">{st.description}</p></div>
              </div>
            ))}
            <p className="text-xs text-accent">💡 Pro Tip: {s.proTip}</p>
          </div>
        ));
      case "toolkit":
        return data.tools?.map((t: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-1">
            <div className="flex items-center gap-2"><p className="font-semibold text-sm">{t.name}</p><Badge variant="secondary" className="text-xs">{t.type}</Badge></div>
            <p className="text-xs text-muted-foreground">{t.description}</p>
            <pre className="text-xs bg-background/50 p-2 rounded whitespace-pre-wrap mt-1">{t.content}</pre>
          </div>
        ));
      case "templates":
        return data.templates?.map((t: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-1">
            <div className="flex items-center gap-2"><p className="font-semibold text-sm">{t.name}</p><Badge variant="secondary" className="text-xs">{t.category}</Badge></div>
            <p className="text-xs text-muted-foreground italic">{t.instructions}</p>
            <pre className="text-xs bg-background/50 p-2 rounded whitespace-pre-wrap mt-1">{t.content}</pre>
          </div>
        ));
      case "promptPack":
        return data.categories?.map((c: any, i: number) => (
          <div key={i} className="space-y-2">
            <p className="font-semibold text-sm text-accent">{c.name}</p>
            {c.prompts?.map((p: any, j: number) => (
              <div key={j} className="p-3 rounded-lg bg-secondary/30 space-y-1">
                <p className="font-medium text-sm">{p.title}</p>
                <pre className="text-xs bg-background/50 p-2 rounded whitespace-pre-wrap">{p.prompt}</pre>
                <p className="text-xs text-muted-foreground">→ {p.expectedOutput}</p>
              </div>
            ))}
          </div>
        ));
      case "bonusGuides":
        return data.bonuses?.map((b: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-1">
            <div className="flex items-center gap-2"><p className="font-semibold text-sm">{b.name}</p><Badge variant="default" className="text-xs">${b.perceivedValue} Value</Badge></div>
            <p className="text-xs text-accent italic">{b.tagline}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{b.content}</p>
          </div>
        ));
      case "caseStudies":
        return data.caseStudies?.map((c: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <p className="font-semibold text-sm">{c.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div><span className="font-medium">Background:</span> <span className="text-muted-foreground">{c.background}</span></div>
              <div><span className="font-medium">Challenge:</span> <span className="text-muted-foreground">{c.challenge}</span></div>
              <div><span className="font-medium">Method:</span> <span className="text-muted-foreground">{c.method}</span></div>
              <div><span className="font-medium">Results:</span> <span className="text-muted-foreground">{c.results}</span></div>
            </div>
            <blockquote className="text-xs italic border-l-2 border-accent pl-2 text-muted-foreground">"{c.quote}"</blockquote>
          </div>
        ));
      case "multiplier":
        return data.formats?.map((f: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{f.format}</p>
              <Badge variant="outline" className="text-xs">${f.estimatedPrice}</Badge>
              <Badge variant="secondary" className="text-xs">{f.timeToCreate}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{f.pitch}</p>
            <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
              {f.outline?.map((o: string, j: number) => <li key={j}>{o}</li>)}
            </ul>
          </div>
        ));
      default:
        return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardContent className="p-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <h4 className="font-bold text-sm">{label}</h4>
                <Badge variant="default" className="text-xs">Generated</Badge>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <AssetDownloadButtons content={fullText} title={`${productTitle} - ${label}`} />
                <Button variant="ghost" size="sm" onClick={copyAll} className="gap-1 h-7">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {renderContent()}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
