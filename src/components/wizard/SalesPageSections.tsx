import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import type { SalesPageSections as SectionsType } from "@/types/launchWizard";
import ProductBreakdownCard from "./ProductBreakdownCard";

const SECTION_TABS = [
  { key: "patternInterrupt", label: "Headline" },
  { key: "bigPromise", label: "Big Promise" },
  { key: "curiosityHook", label: "Hook" },
  { key: "problemAgitation", label: "Problem" },
  { key: "mechanismIntro", label: "Mechanism" },
  { key: "systemSteps", label: "System Steps" },
  { key: "productBreakdown", label: "Product Stack" },
  { key: "bonusStack", label: "Bonus Stack" },
  { key: "socialProofBar", label: "Social Proof" },
  { key: "buyerSignals", label: "Buyer Signals" },
  { key: "implementationPath", label: "Quick Start" },
  { key: "testimonials", label: "Testimonials" },
  { key: "objectionHandling", label: "Objections" },
  { key: "guarantee", label: "Guarantee" },
  { key: "urgencyClose", label: "Urgency" },
  { key: "callToAction", label: "CTA" },
] as const;

interface Props {
  sections: SectionsType;
  onUpdate: (sections: SectionsType) => void;
  askingPrice?: number;
}

export default function SalesPageSectionsUI({ sections, onUpdate, askingPrice }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const startEdit = (key: string, content: string) => {
    setEditing(key);
    setEditValue(content);
  };

  const saveEdit = (key: string) => {
    onUpdate({ ...sections, [key]: editValue });
    setEditing(null);
    toast.success("Section updated!");
  };

  const getTextContent = (key: string): string => {
    const val = sections[key as keyof SectionsType];
    if (typeof val === "string") return val;
    if (Array.isArray(val)) {
      if (val.length === 0) return "";
      if (typeof val[0] === "string") return (val as string[]).join("\n\n");
      return JSON.stringify(val, null, 2);
    }
    return JSON.stringify(val, null, 2);
  };

  const copyFullPage = () => {
    const full = SECTION_TABS.map(t => {
      const content = getTextContent(t.key);
      return `--- ${t.label.toUpperCase()} ---\n\n${content}`;
    }).join("\n\n\n");
    navigator.clipboard.writeText(full);
    toast.success("Full sales page copied!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Sales Page Sections</h3>
        <Button variant="outline" size="sm" onClick={copyFullPage} className="gap-1">
          <Copy className="w-3 h-3" /> Copy Full Page
        </Button>
      </div>

      <Tabs defaultValue="patternInterrupt">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          {SECTION_TABS.map(tab => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTION_TABS.map(tab => {
          const isComplex = tab.key === "productBreakdown" || tab.key === "bonusStack";
          const content = getTextContent(tab.key);
          const isEditing = editing === tab.key;

          return (
            <TabsContent key={tab.key} value={tab.key}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{tab.label}</h4>
                    <div className="flex items-center gap-1">
                      {!isComplex && !isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => startEdit(tab.key, content)} className="gap-1">
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => copyText(content, tab.key)} className="gap-1">
                        {copied === tab.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Product Breakdown visual */}
                  {tab.key === "productBreakdown" && sections.productBreakdown && (
                    <ProductBreakdownCard
                      modules={sections.productBreakdown}
                      bonuses={sections.bonusStack || []}
                      askingPrice={askingPrice}
                    />
                  )}

                  {/* Bonus Stack visual */}
                  {tab.key === "bonusStack" && sections.bonusStack && (
                    <div className="space-y-3">
                      {sections.bonusStack.map((b, i) => (
                        <div key={i} className="p-3 rounded-lg bg-accent/5 border border-accent/10 flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">Bonus #{i + 1}: {b.name}</p>
                            <p className="text-xs text-muted-foreground">{b.description}</p>
                          </div>
                          <span className="text-sm font-bold text-muted-foreground shrink-0 ml-3">${b.value} value</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* System Steps */}
                  {tab.key === "systemSteps" && Array.isArray(sections.systemSteps) && (
                    <div className="space-y-3">
                      {sections.systemSteps.map((step, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text sections */}
                  {!isComplex && tab.key !== "systemSteps" && (
                    isEditing ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="min-h-[200px] text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(tab.key)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none text-foreground whitespace-pre-wrap text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
                        {content}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
