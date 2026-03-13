import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, Copy, Check, RefreshCw, Target, BookOpen, Lightbulb, ListOrdered, CheckCircle, AlertTriangle, Pencil, Key, FileText, ChevronDown, ClipboardList, FileCode, BookMarked, Footprints, PenLine, Download, Lock } from "lucide-react";
import { Step1Product, Step2Content, ChapterItem, ContentDepth, ExpansionType } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AssetDownloadButtons from "@/components/AssetDownloadButtons";
import ProofStackBuilder from "./ProofStackBuilder";
import ContentQualityReport from "./ContentQualityReport";
import AssetFactory from "./AssetFactory";
import OutcomeLockCard, { OutcomeLock, isOutcomeLockComplete } from "./OutcomeLockCard";
import ScenarioGenerator from "./ScenarioGenerator";
import VoiceToneSelector, { WritingVoice, getVoicePromptDirective } from "./VoiceToneSelector";
import OutlineEditor from "./OutlineEditor";
import ContentPreviewModal from "./ContentPreviewModal";
import ReadabilityMeter from "./ReadabilityMeter";
import { auditFullContent } from "@/lib/contentAudit";
import type { ProductAssets } from "@/types/productAssets";

import type { LaunchMode } from "@/pages/LaunchWizard";

interface Props {
  productBrief: Step1Product | null;
  productType: string;
  result: Step2Content | null;
  setResult: (v: Step2Content | null) => void;
  onNext: () => void;
  userId?: string;
  assets?: ProductAssets;
  setAssets?: (a: ProductAssets) => void;
  launchMode?: LaunchMode;
}

const DEPTH_CONFIG: Record<ContentDepth, { label: string; pages: string; wordsPerChapter: number }> = {
  quick: { label: "Quick", pages: "20–30 pages", wordsPerChapter: 800 },
  standard: { label: "Standard", pages: "40–60 pages", wordsPerChapter: 1200 },
  premium: { label: "Premium", pages: "80–120 pages", wordsPerChapter: 2000 },
  authority: { label: "Authority", pages: "150+ pages", wordsPerChapter: 2500 },
};

const EXPANSION_OPTIONS: { type: ExpansionType; label: string; icon: typeof FileText }[] = [
  { type: "caseStudy", label: "Add Case Study", icon: BookMarked },
  { type: "worksheet", label: "Add Worksheet", icon: ClipboardList },
  { type: "template", label: "Add Template", icon: FileCode },
  { type: "checklist", label: "Add Checklist", icon: CheckCircle },
  { type: "realExample", label: "Add Real Example", icon: Footprints },
];

function estimatePages(chapters: ChapterItem[], depth: ContentDepth): number {
  const baseWords = DEPTH_CONFIG[depth].wordsPerChapter;
  let totalPages = 0;
  for (const ch of chapters) {
    let words = baseWords;
    words += (ch.caseStudies?.length || 0) * 300;
    words += (ch.worksheets?.length || 0) * 500;
    words += (ch.templates?.length || 0) * 400;
    words += (ch.checklists?.length || 0) * 200;
    words += (ch.additionalExamples?.length || 0) * 350;
    totalPages += words / 250; // ~250 words per page
  }
  return Math.round(totalPages);
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

      {/* Expanded assets display */}
      {chapter.caseStudies && chapter.caseStudies.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"><BookMarked className="w-3 h-3" /> Case Studies</p>
          {chapter.caseStudies.map((cs, j) => (
            <div key={j} className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm space-y-1">
              <p className="font-semibold">{cs.name}</p>
              <p><span className="text-xs font-medium text-destructive">Problem:</span> {cs.problem}</p>
              <p><span className="text-xs font-medium text-accent">Solution:</span> {cs.solution}</p>
              <p><span className="text-xs font-medium text-emerald-400">Result:</span> {cs.result}</p>
              {cs.quote && <p className="italic text-muted-foreground border-l-2 border-accent pl-2 mt-1">"{cs.quote}"</p>}
            </div>
          ))}
        </div>
      )}

      {chapter.worksheets && chapter.worksheets.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Worksheets</p>
          {chapter.worksheets.map((ws, j) => (
            <div key={j} className="p-3 rounded-lg bg-secondary/30 text-sm space-y-1">
              <p className="font-semibold">{ws.title}</p>
              <p className="text-xs text-muted-foreground">{ws.instructions}</p>
              <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5 mt-1">
                {ws.fields.map((f, k) => <li key={k}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {chapter.templates && chapter.templates.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"><FileCode className="w-3 h-3" /> Templates</p>
          {chapter.templates.map((t, j) => (
            <div key={j} className="p-3 rounded-lg bg-secondary/30 text-sm space-y-1">
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{t.content}</p>
            </div>
          ))}
        </div>
      )}

      {chapter.checklists && chapter.checklists.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Checklists</p>
          {chapter.checklists.map((cl, j) => (
            <div key={j} className="p-3 rounded-lg bg-secondary/30 text-sm space-y-1">
              <p className="font-semibold">{cl.title}</p>
              <ul className="space-y-0.5">
                {cl.items.map((item, k) => <li key={k} className="text-xs text-muted-foreground flex items-center gap-1">☐ {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {chapter.additionalExamples && chapter.additionalExamples.length > 0 && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Footprints className="w-3 h-3" /> Real Examples</p>
          {chapter.additionalExamples.map((ex, j) => (
            <div key={j} className="p-3 rounded-lg bg-secondary/30 text-sm space-y-1">
              <p className="font-semibold">{ex.title}</p>
              <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
                {ex.steps.map((s, k) => <li key={k}>{s}</li>)}
              </ol>
            </div>
          ))}
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

export default function WizardStep2({ productBrief, productType, result, setResult, onNext, userId, assets, setAssets, launchMode }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandingIndex, setExpandingIndex] = useState<number | null>(null);
  const [expandingType, setExpandingType] = useState<string | null>(null);
  const [contentDepth, setContentDepth] = useState<ContentDepth>("standard");
  const [writingIndex, setWritingIndex] = useState<number | null>(null);
  const [writingAll, setWritingAll] = useState(false);
  const [writeAllProgress, setWriteAllProgress] = useState(0);
  const [outcomeLock, setOutcomeLock] = useState<OutcomeLock | null>(null);
  const [outcomeLocked, setOutcomeLocked] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [writingVoice, setWritingVoice] = useState<WritingVoice>("mentor");
  const [previewChapter, setPreviewChapter] = useState<{ index: number; title: string; content: string } | null>(null);

  const generate = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-launch-content", {
        body: { productBrief, productType, userId, launchMode, contentDepth, writingVoice },
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

  const expandChapter = async (index: number, expansionType?: ExpansionType) => {
    if (!result || !productBrief) return;
    setExpandingIndex(index);
    setExpandingType(expansionType || "expand");
    try {
      const chapter = result.chapters[index];
      const { data, error } = await supabase.functions.invoke("generate-launch-content", {
        body: {
          productBrief,
          productType,
          expandChapter: true,
          chapterToExpand: chapter,
          chapterIndex: index,
          expansionType: expansionType || undefined,
        },
      });
      if (error) throw error;
      if (data?.expandedChapter) {
        const updatedChapters = [...result.chapters];
        if (expansionType) {
          // Merge expansion into existing chapter
          const existing = updatedChapters[index];
          const expanded = data.expandedChapter;
          updatedChapters[index] = {
            ...existing,
            caseStudies: [...(existing.caseStudies || []), ...(expanded.caseStudies || [])],
            worksheets: [...(existing.worksheets || []), ...(expanded.worksheets || [])],
            templates: [...(existing.templates || []), ...(expanded.templates || [])],
            checklists: [...(existing.checklists || []), ...(expanded.checklists || [])],
            additionalExamples: [...(existing.additionalExamples || []), ...(expanded.additionalExamples || [])],
          };
        } else {
          updatedChapters[index] = data.expandedChapter;
        }
        setResult({ ...result, chapters: updatedChapters });
        const label = expansionType ? EXPANSION_OPTIONS.find(o => o.type === expansionType)?.label || "Content" : "examples and walkthroughs";
        toast.success(`Chapter ${index + 1} expanded with ${label}!`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to expand chapter");
    } finally {
      setExpandingIndex(null);
      setExpandingType(null);
    }
  };

  const writeFullChapter = async (index: number) => {
    if (!result || !productBrief) return;
    setWritingIndex(index);
    try {
      const chapter = result.chapters[index];
      const { data, error } = await supabase.functions.invoke("generate-launch-content", {
        body: {
          writeFullChapter: true,
          chapterToExpand: chapter,
          productBrief,
          productType,
        },
      });
      if (error) throw error;
      if (data?.fullContent) {
        const updatedChapters = [...result.chapters];
        updatedChapters[index] = { ...updatedChapters[index], fullContent: data.fullContent };
        setResult({ ...result, chapters: updatedChapters });
        toast.success(`Chapter ${index + 1} full content written!`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to write chapter");
    } finally {
      setWritingIndex(null);
    }
  };

  const writeAllChapters = async () => {
    if (!result || !productBrief) return;
    setWritingAll(true);
    setWriteAllProgress(0);
    const total = result.chapters.length;
    for (let i = 0; i < total; i++) {
      if (result.chapters[i].fullContent) {
        setWriteAllProgress(((i + 1) / total) * 100);
        continue;
      }
      setWritingIndex(i);
      try {
        const chapter = result.chapters[i];
        const { data, error } = await supabase.functions.invoke("generate-launch-content", {
          body: {
            writeFullChapter: true,
            chapterToExpand: chapter,
            productBrief,
            productType,
          },
        });
        if (error) throw error;
        if (data?.fullContent) {
          const updatedChapters = [...result.chapters];
          updatedChapters[i] = { ...updatedChapters[i], fullContent: data.fullContent };
          setResult({ ...result, chapters: updatedChapters });
        }
      } catch (e: any) {
        toast.error(`Failed to write chapter ${i + 1}`);
      }
      setWriteAllProgress(((i + 1) / total) * 100);
    }
    setWritingIndex(null);
    setWritingAll(false);
    toast.success("All chapters written!");
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const humanizeAll = async () => {
    if (!result || !productBrief) return;
    setHumanizing(true);
    const total = result.chapters.length;
    const updatedChapters = [...result.chapters];
    for (let i = 0; i < total; i++) {
      try {
        const { data, error } = await supabase.functions.invoke("humanize-chapter", {
          body: {
            chapter: result.chapters[i],
            productTitle: productBrief.title,
            uniqueMechanism: productBrief.uniqueMechanism,
          },
        });
        if (error) throw error;
        if (data) {
          updatedChapters[i] = { ...updatedChapters[i], ...data };
        }
      } catch (e: any) {
        toast.error(`Failed to humanize chapter ${i + 1}`);
      }
    }
    setResult({ ...result, chapters: updatedChapters });
    setHumanizing(false);
    toast.success("All chapters humanized!");
  };

  const audit = result ? auditFullContent(result) : null;
  const estimatedPages = result?.chapters ? estimatePages(result.chapters, contentDepth) : 0;

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

      {/* Content Depth Selector */}
      <Card className="border-accent/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Content Depth</p>
              <p className="text-xs text-muted-foreground">Choose how comprehensive your product will be</p>
            </div>
            {estimatedPages > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <FileText className="w-3 h-3" />
                ~{estimatedPages} pages
              </Badge>
            )}
          </div>
          <RadioGroup value={contentDepth} onValueChange={(v) => setContentDepth(v as ContentDepth)} className="grid grid-cols-2 gap-2">
            {(Object.entries(DEPTH_CONFIG) as [ContentDepth, typeof DEPTH_CONFIG[ContentDepth]][]).map(([key, config]) => (
              <Label
                key={key}
                htmlFor={`depth-${key}`}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  contentDepth === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={key} id={`depth-${key}`} />
                <div>
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.pages}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Writing Voice Selector */}
      <VoiceToneSelector value={writingVoice} onChange={setWritingVoice} disabled={loading} />

      {/* Outcome Lock — must be defined before generating */}
      <OutcomeLockCard
        outcomeLock={outcomeLock}
        setOutcomeLock={setOutcomeLock}
        locked={outcomeLocked}
        onLock={() => {
          setOutcomeLocked(true);
          if (!result) generate();
        }}
        onUnlock={() => setOutcomeLocked(false)}
        productBrief={productBrief}
      />

      {!result && !outcomeLocked && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Lock your outcome above to generate your product.</p>
        </div>
      )}

      {!result && outcomeLocked && (
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

          {/* Pre-Continue Optimization Report */}
          <ContentQualityReport
            content={result}
            onExpandChapter={(i) => expandChapter(i)}
            expandingIndex={expandingIndex}
            onHumanize={humanizeAll}
            humanizing={humanizing}
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
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">Chapters ({result.chapters?.length || 0})</h3>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <FileText className="w-3 h-3" />
                    ~{estimatedPages} pages
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" disabled={writingAll || writingIndex !== null} onClick={writeAllChapters}>
                    {writingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <PenLine className="w-3 h-3" />}
                    Write All Chapters
                  </Button>
                  <AssetDownloadButtons
                    content={result.chapters?.map((ch, i) =>
                      `Chapter ${i + 1}: ${ch.title}\n${ch.fullContent || `${ch.summary}\n\nKey Points:\n${ch.keyPoints?.map(kp => `- ${kp}`).join("\n") || ""}`}`
                    ).join("\n\n---\n\n") || ""}
                    title={`${productBrief.title} - Chapters`}
                  />
                </div>
              </div>
              {writingAll && (
                <div className="mb-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Writing chapters...</span>
                    <span>{Math.round(writeAllProgress)}%</span>
                  </div>
                  <Progress value={writeAllProgress} className="h-2" />
                </div>
              )}
              <Accordion type="multiple" className="space-y-2">
                {result.chapters?.map((ch, i) => (
                  <AccordionItem key={i} value={`ch-${i}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span>Chapter {i + 1}: {ch.title}</span>
                        {((ch.caseStudies?.length || 0) + (ch.worksheets?.length || 0) + (ch.templates?.length || 0) + (ch.checklists?.length || 0) + (ch.additionalExamples?.length || 0)) > 0 && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {(ch.caseStudies?.length || 0) + (ch.worksheets?.length || 0) + (ch.templates?.length || 0) + (ch.checklists?.length || 0) + (ch.additionalExamples?.length || 0)} assets
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <StructuredChapter chapter={ch} index={i} copied={copied} onCopy={copyText} />

                      {/* Full written chapter content */}
                      {ch.fullContent && (
                        <div className="border-t border-border/50 pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <PenLine className="w-3 h-3" /> Full Chapter Content
                            </p>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => copyText(ch.fullContent!, `full-${i}`)}>
                                {copied === `full-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => {
                                const blob = new Blob([ch.fullContent!], { type: "text/markdown" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `Chapter_${i + 1}_${ch.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}>
                                <Download className="w-3 h-3" /> Save
                              </Button>
                            </div>
                          </div>
                          <ScrollArea className="max-h-[400px] rounded-lg border border-border/50 bg-background/50 p-4">
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{ch.fullContent}</div>
                          </ScrollArea>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        <Button variant="ghost" size="sm" onClick={() => copyText(`${ch.title}\n\n${ch.summary}\n\n${ch.keyPoints?.join("\n")}`, `ch-${i}`)} className="gap-1 text-xs">
                          {copied === `ch-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy All
                        </Button>
                        <Button variant="default" size="sm" className="gap-1 text-xs" disabled={writingIndex === i || writingAll} onClick={() => writeFullChapter(i)}>
                          {writingIndex === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <PenLine className="w-3 h-3" />}
                          {ch.fullContent ? "Rewrite" : "Write Full Content"}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" disabled={expandingIndex === i} onClick={() => expandChapter(i)}>
                          {expandingIndex === i && !expandingType?.match(/case|work|temp|check|real/) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Expand
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 text-xs" disabled={expandingIndex === i}>
                              {expandingIndex === i && expandingType !== "expand" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
                              Add Asset
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {EXPANSION_OPTIONS.map((opt) => (
                              <DropdownMenuItem key={opt.type} onClick={() => expandChapter(i, opt.type)} className="gap-2 text-xs">
                                <opt.icon className="w-3 h-3" />
                                {opt.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

          {/* AI Client Scenario Generator */}
          {productBrief && outcomeLock && (
            <ScenarioGenerator
              productTitle={productBrief.title}
              niche={outcomeLock.audience}
              targetAudience={outcomeLock.audience}
              promisedResult={outcomeLock.promisedResult}
              uniqueMechanism={productBrief.uniqueMechanism}
            />
          )}

          {/* Digital Product Asset Factory */}
          {productBrief && assets !== undefined && setAssets && (
            <AssetFactory
              productBrief={productBrief}
              productContent={result}
              productType={productType}
              assets={assets}
              setAssets={setAssets}
            />
          )}

          {/* Boost Score Button */}
          {audit && audit.overall < 80 && (
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Score: {audit.overall}/100 — needs 80+ to pass</p>
                  <p className="text-xs text-muted-foreground">Auto-enrich all chapters with prompts, scripts, time markers, and examples to hit 80+</p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 shrink-0"
                  disabled={expandingIndex !== null || writingAll}
                  onClick={async () => {
                    if (!result || !productBrief) return;
                    setWritingAll(true);
                    setWriteAllProgress(0);
                    const total = result.chapters.length;
                    const coachingMessages = audit.coachingMessages;
                    
                    for (let i = 0; i < total; i++) {
                      setWritingIndex(i);
                      try {
                        // Add missing assets based on coaching
                        const chapter = result.chapters[i];
                        const chapterAudit = auditFullContent({ ...result, chapters: [chapter] });
                        const weakDims = chapterAudit.dimensions.filter(d => d.score < 70).map(d => d.label);
                        
                        if (weakDims.length > 0) {
                          // Determine what expansions are needed
                          const expansions: string[] = [];
                          if (weakDims.some(d => d.includes("Proof") || d.includes("Believability"))) expansions.push("caseStudy");
                          if (weakDims.some(d => d.includes("Actionability") || d.includes("Asset"))) expansions.push("template", "checklist");
                          if (weakDims.some(d => d.includes("Example") || d.includes("Execution"))) expansions.push("realExample");
                          
                          for (const expType of expansions.slice(0, 2)) {
                            try {
                              await expandChapter(i, expType as any);
                            } catch { /* continue */ }
                          }
                        }
                        
                        // Write full content if missing
                        if (!chapter.fullContent) {
                          await writeFullChapter(i);
                        }
                      } catch { /* continue */ }
                      setWriteAllProgress(((i + 1) / total) * 100);
                    }
                    setWritingIndex(null);
                    setWritingAll(false);
                    toast.success("Score boost complete! Check your updated score.");
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Boost to 80+
                </Button>
              </CardContent>
            </Card>
          )}

          {audit && !audit.canContinue && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{audit.gateMessage || `Score is ${audit.overall}/100. Aim for 80+ for best results.`}</span>
            </div>
          )}
          <Button
            onClick={onNext}
            variant={audit && !audit.canContinue ? "outline" : "default"}
            className="gap-2"
          >
            {audit && !audit.canContinue ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                Continue Anyway ({audit.overall}/100)
              </>
            ) : (
              "Continue to Funnel Builder"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
