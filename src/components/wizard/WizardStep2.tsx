import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Loader2, Copy, Check, RefreshCw, Target, BookOpen, Lightbulb, ListOrdered, CheckCircle, AlertTriangle, Pencil, Key } from "lucide-react";
import { Step1Product, Step2Content, ChapterItem } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AssetDownloadButtons from "@/components/AssetDownloadButtons";
import ProofStackBuilder from "./ProofStackBuilder";
import ContentQualityReport from "./ContentQualityReport";

interface Props {
  productBrief: Step1Product | null;
  productType: string;
  result: Step2Content | null;
  setResult: (v: Step2Content | null) => void;
  onNext: () => void;
  userId?: string;
}

function StructuredChapter({ chapter, index, copied, onCopy }: { chapter: ChapterItem; index: number; copied: string | null; onCopy: (text: string, label: string) => void }) {
  const isStructured = !!(chapter.moduleGoal || chapter.hook || chapter.actionPlan?.length);

  if (!isStructured) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{chapter.summary}</p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {chapter.keyPoints?.map((kp, j) => <li key={j}>{kp}</li>)}
        </ul>
      </div>
    );
  }

  const sections = [
    { icon: Target, label: "Module Goal", content: chapter.moduleGoal },
    { icon: BookOpen, label: "Hook", content: chapter.hook },
    { icon: Lightbulb, label: "Core Concept", content: chapter.coreConcept },
    { icon: CheckCircle, label: "Real Example", content: chapter.realExample },
    { icon: Pencil, label: "Action Step", content: chapter.actionStep },
  ].filter(s => s.content);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{chapter.summary}</p>

      {sections.map((section, i) => (
        <div key={i} className="flex gap-2">
          <section.icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{section.label}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 h-6 w-6 p-0" onClick={() => onCopy(section.content!, `${index}-${section.label}`)}>
            {copied === `${index}-${section.label}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      ))}

      {chapter.actionPlan && chapter.actionPlan.length > 0 && (
        <div className="flex gap-2">
          <ListOrdered className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Action Plan</p>
            <div className="space-y-2">
              {chapter.actionPlan.map((step, j) => (
                <div key={j} className="p-2 rounded bg-secondary/30 text-sm">
                  <p className="font-medium">{step.step}: {step.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {chapter.commonMistakes && chapter.commonMistakes.length > 0 && (
        <div className="flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Common Mistakes</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
              {chapter.commonMistakes.map((m, j) => <li key={j}>{m}</li>)}
            </ul>
          </div>
        </div>
      )}

      {chapter.moduleSummary && chapter.moduleSummary.length > 0 && (
        <div className="flex gap-2">
          <Key className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Key Takeaways</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
              {chapter.moduleSummary.map((s, j) => <li key={j}>{s}</li>)}
            </ul>
          </div>
        </div>
      )}

      {chapter.keyPoints?.length > 0 && !chapter.actionPlan?.length && (
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {chapter.keyPoints.map((kp, j) => <li key={j}>{kp}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function WizardStep2({ productBrief, productType, result, setResult, onNext, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandingIndex, setExpandingIndex] = useState<number | null>(null);

  const generate = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-content", {
        body: { productBrief, productType, userId },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Product content generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const expandChapter = async (index: number) => {
    if (!result || !productBrief) return;
    setExpandingIndex(index);
    try {
      const chapter = result.chapters[index];
      const { data, error } = await supabase.functions.invoke("generate-launch-content", {
        body: {
          productBrief,
          productType,
          expandChapter: true,
          chapterToExpand: chapter,
          chapterIndex: index,
        },
      });
      if (error) throw error;
      if (data?.expandedChapter) {
        const updatedChapters = [...result.chapters];
        updatedChapters[index] = data.expandedChapter;
        setResult({ ...result, chapters: updatedChapters });
        toast.success(`Chapter ${index + 1} expanded with examples and walkthroughs!`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to expand chapter");
    } finally {
      setExpandingIndex(null);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  if (!productBrief) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Complete Step 1 first to generate your product concept.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Product Generator</h2>
        <p className="text-muted-foreground">Generate your complete product outline and content structure.</p>
      </div>

      <Card className="bg-secondary/30">
        <CardContent className="p-4">
          <p className="text-sm"><strong>Product:</strong> {productBrief.title} — {productBrief.subtitle}</p>
        </CardContent>
      </Card>

      {!result && (
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Full Product
        </Button>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generate} disabled={loading} className="gap-1">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Regenerate
            </Button>
          </div>

          {/* Content Quality Report */}
          <ContentQualityReport
            content={result}
            onExpandChapter={expandChapter}
            expandingIndex={expandingIndex}
          />

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg">Product Outline</h3>
                <div className="flex items-center gap-2">
                  <AssetDownloadButtons content={result.outline} title={`${productBrief.title} - Outline`} />
                  <Button variant="ghost" size="sm" onClick={() => copyText(result.outline, "outline")} className="gap-1">
                    {copied === "outline" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.outline}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 className="font-bold text-lg">Chapters ({result.chapters?.length || 0})</h3>
                <AssetDownloadButtons
                  content={result.chapters?.map((ch, i) =>
                    `Chapter ${i + 1}: ${ch.title}\n${ch.summary}\n\nKey Points:\n${ch.keyPoints?.map(kp => `- ${kp}`).join("\n") || ""}`
                  ).join("\n\n---\n\n") || ""}
                  title={`${productBrief.title} - Chapters`}
                />
              </div>
              <Accordion type="multiple" className="space-y-2">
                {result.chapters?.map((ch, i) => (
                  <AccordionItem key={i} value={`ch-${i}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium">
                      Chapter {i + 1}: {ch.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <StructuredChapter chapter={ch} index={i} copied={copied} onCopy={copyText} />
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => copyText(`${ch.title}\n\n${ch.summary}\n\n${ch.keyPoints?.join("\n")}`, `ch-${i}`)} className="gap-1 text-xs">
                          {copied === `ch-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy All
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" disabled={expandingIndex === i} onClick={() => expandChapter(i)}>
                          {expandingIndex === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Expand
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg">Bonus Ideas</h3>
                <AssetDownloadButtons
                  content={result.bonuses?.join("\n\n") || ""}
                  title={`${productBrief.title} - Bonuses`}
                />
              </div>
              {result.bonuses?.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">#{i + 1}</Badge>
                  <p className="text-sm text-muted-foreground">{b}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg">Product Description</h3>
                <div className="flex items-center gap-2">
                  <AssetDownloadButtons content={result.description} title={`${productBrief.title} - Description`} />
                  <Button variant="ghost" size="sm" onClick={() => copyText(result.description, "desc")} className="gap-1">
                    {copied === "desc" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.description}</p>
            </CardContent>
          </Card>

          {result.proofStack && <ProofStackBuilder proofStack={result.proofStack} />}

          <Button onClick={onNext} className="gap-2">Continue to Funnel Builder</Button>
        </div>
      )}
    </div>
  );
}
