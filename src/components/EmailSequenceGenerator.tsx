import { useState } from "react";
import { Mail, RefreshCw, Copy, Download, Check, Calendar, Sparkles, Zap, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  EmailSequence14Day,
  EMAIL_FOCUS_CONFIG,
  FRAMEWORK_CONFIG,
  PURPOSE_CONFIG,
  SequenceFramework,
  SequencePurpose,
  EmailVolume,
} from "@/types/emailSequence";
import EmailSequenceDisplay from "./EmailSequenceDisplay";
import { cn } from "@/lib/utils";

interface EmailSequenceGeneratorProps {
  offerName?: string;
  targetAudience?: string;
  price?: number;
  onSequenceGenerated?: (sequence: EmailSequence14Day) => void;
}

const EmailSequenceGenerator = ({
  offerName: initialOfferName = "",
  targetAudience: initialAudience = "",
  price: initialPrice = 17,
  onSequenceGenerated,
}: EmailSequenceGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMiningStories, setIsMiningStories] = useState(false);
  const [sequence, setSequence] = useState<EmailSequence14Day | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [offerName, setOfferName] = useState(initialOfferName);
  const [targetAudience, setTargetAudience] = useState(initialAudience);
  const [keyBenefits, setKeyBenefits] = useState("");
  const [uniqueMechanism, setUniqueMechanism] = useState("");
  const [price, setPrice] = useState(initialPrice);

  // New controls
  const [framework, setFramework] = useState<SequenceFramework>("momentum-launch");
  const [purpose, setPurpose] = useState<SequencePurpose>("product-launch");
  const [emailCount, setEmailCount] = useState<EmailVolume>(5);
  const [storyAngles, setStoryAngles] = useState<string[]>([]);

  const generateSequence = async () => {
    if (!offerName.trim()) {
      toast.error("Please enter an offer name");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-sequence", {
        body: {
          offerName,
          targetAudience: targetAudience || "Online entrepreneurs and digital marketers",
          keyBenefits: keyBenefits ? keyBenefits.split("\n").filter(b => b.trim()) : ["Get results faster", "Save time", "Proven system"],
          uniqueMechanism: uniqueMechanism || undefined,
          price,
          framework,
          purpose,
          emailCount,
        },
      });

      if (error) throw error;

      if (data?.emails) {
        const enriched = { ...data, framework, purpose };
        setSequence(enriched);
        if (data.storyAngles) setStoryAngles(data.storyAngles);
        onSequenceGenerated?.(enriched);
        toast.success(`${data.emails.length}-email ${FRAMEWORK_CONFIG[framework].label} generated!`);
      } else {
        throw new Error("No sequence returned");
      }
    } catch (error) {
      console.error("Error generating email sequence:", error);
      toast.error("Failed to generate sequence. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const mineStoryAngles = async () => {
    if (!offerName.trim()) {
      toast.error("Enter an offer name first");
      return;
    }
    setIsMiningStories(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-sequence", {
        body: {
          offerName,
          targetAudience: targetAudience || "Online entrepreneurs",
          keyBenefits: [],
          price,
          framework,
          purpose,
          emailCount: 5,
          mineStoriesOnly: true,
        },
      });
      if (error) throw error;
      if (data?.storyAngles) {
        setStoryAngles(data.storyAngles);
        toast.success(`${data.storyAngles.length} story angles generated!`);
      }
    } catch {
      toast.error("Failed to mine story angles.");
    } finally {
      setIsMiningStories(false);
    }
  };

  const copyAllEmails = async () => {
    if (!sequence) return;
    const text = sequence.emails.map(email => {
      return `=== Day ${email.day}: ${EMAIL_FOCUS_CONFIG[email.focus]?.label || email.focus} ===\n\nSubject: ${email.subject}\nPreview: ${email.previewText}\n\n${email.openingHook}\n\n${email.storyAnalogy}\n\n${email.lessonTwist}\n\n${email.offerBridge}\n\n${email.cta}\n\n${email.ps ? `P.S. ${email.ps}` : ""}\n\n-------------------`;
    }).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("All emails copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsCSV = () => {
    if (!sequence) return;
    const headers = ["Day", "Focus", "Subject", "Preview", "Opening Hook", "Story", "Lesson", "Offer Bridge", "CTA", "P.S."];
    const rows = sequence.emails.map(email => [
      email.day,
      EMAIL_FOCUS_CONFIG[email.focus]?.label || email.focus,
      `"${email.subject.replace(/"/g, '""')}"`,
      `"${email.previewText.replace(/"/g, '""')}"`,
      `"${email.openingHook.replace(/"/g, '""')}"`,
      `"${email.storyAnalogy.replace(/"/g, '""')}"`,
      `"${email.lessonTwist.replace(/"/g, '""')}"`,
      `"${email.offerBridge.replace(/"/g, '""')}"`,
      `"${email.cta.replace(/"/g, '""')}"`,
      `"${(email.ps || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${offerName.replace(/\s+/g, "-").toLowerCase()}-email-sequence.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Email sequence downloaded as CSV!");
  };

  const VOLUME_OPTIONS: { value: EmailVolume; label: string }[] = [
    { value: 5, label: "5 Emails" },
    { value: 10, label: "10 Emails" },
    { value: 20, label: "20 Emails" },
    { value: 30, label: "30 Emails" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Conversion Email Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Generate story-driven email sequences that build trust, create curiosity, and convert — not robotic blasts.
          </p>

          {/* Framework Selector */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
              Choose Your Framework
            </Label>
            <div className="grid gap-3 md:grid-cols-2">
              {(Object.entries(FRAMEWORK_CONFIG) as [SequenceFramework, typeof FRAMEWORK_CONFIG[SequenceFramework]][]).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFramework(key)}
                  className={cn(
                    "text-left p-4 rounded-xl border-2 transition-all",
                    framework === key
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{config.icon}</span>
                    <span className="font-semibold text-sm">{config.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Purpose + Volume */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                Sequence Purpose
              </Label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(PURPOSE_CONFIG) as [SequencePurpose, typeof PURPOSE_CONFIG[SequencePurpose]][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setPurpose(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      purpose === key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                Email Count
              </Label>
              <div className="flex flex-wrap gap-2">
                {VOLUME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEmailCount(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      emailCount === opt.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          {!sequence && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="offerName">Offer Name *</Label>
                <Input id="offerName" placeholder="e.g., The AI Client System" value={offerName} onChange={(e) => setOfferName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input id="targetAudience" placeholder="e.g., Freelancers wanting AI clients" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" placeholder="17" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="uniqueMechanism">Unique Mechanism (optional)</Label>
                <Input id="uniqueMechanism" placeholder="e.g., The Prompt-First Method" value={uniqueMechanism} onChange={(e) => setUniqueMechanism(e.target.value)} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="keyBenefits">Key Benefits (one per line)</Label>
                <Textarea id="keyBenefits" placeholder="Land your first AI client in 7 days&#10;Done-for-you prompts included&#10;No tech skills needed" value={keyBenefits} onChange={(e) => setKeyBenefits(e.target.value)} rows={3} className="mt-1" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Button variant="hero" onClick={generateSequence} disabled={isGenerating} className="gap-2">
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {sequence ? "Regenerate Sequence" : `Generate ${emailCount}-Email Sequence`}
            </Button>

            <Button variant="outline" onClick={mineStoryAngles} disabled={isMiningStories} className="gap-2">
              {isMiningStories ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Mine 50 Story Angles
            </Button>

            {sequence && (
              <>
                <Button variant="outline" onClick={copyAllEmails} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="outline" onClick={downloadAsCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
              </>
            )}
          </div>

          {isGenerating && (
            <div className="text-center text-sm text-muted-foreground animate-pulse">
              Crafting your {FRAMEWORK_CONFIG[framework].label.toLowerCase()}...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Story Mining Results */}
      {storyAngles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              Story Mining Engine — {storyAngles.length} Angles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {storyAngles.map((angle, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5">{i + 1}.</span>
                  <span>{angle}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sequence Output */}
      {sequence && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{sequence.emails?.length || 0} Emails</Badge>
                <Badge variant="outline">{FRAMEWORK_CONFIG[framework].label}</Badge>
                <Badge variant="outline">{PURPOSE_CONFIG[purpose].label}</Badge>
                <Badge variant="outline">Theme: {sequence.sequenceTheme}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Narrative Arc:</strong> {sequence.narrativeArc}
              </p>
            </CardContent>
          </Card>
          <EmailSequenceDisplay emails={sequence.emails} />
        </>
      )}
    </div>
  );
};

export default EmailSequenceGenerator;
