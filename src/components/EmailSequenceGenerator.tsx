import { useState } from "react";
import { Mail, RefreshCw, Copy, Download, Check, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailSequence14Day, EmailDay, EMAIL_FOCUS_CONFIG } from "@/types/emailSequence";
import EmailSequenceDisplay from "./EmailSequenceDisplay";

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
  const [sequence, setSequence] = useState<EmailSequence14Day | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [offerName, setOfferName] = useState(initialOfferName);
  const [targetAudience, setTargetAudience] = useState(initialAudience);
  const [keyBenefits, setKeyBenefits] = useState("");
  const [uniqueMechanism, setUniqueMechanism] = useState("");
  const [price, setPrice] = useState(initialPrice);

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
          keyBenefits: keyBenefits ? keyBenefits.split("\n").filter(b => b.trim()) : ["Get results faster", "Save time and money", "Proven system"],
          uniqueMechanism: uniqueMechanism || undefined,
          price,
        },
      });

      if (error) throw error;

      if (data?.emails) {
        setSequence(data);
        onSequenceGenerated?.(data);
        toast.success("14-day email sequence generated!");
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

  const copyAllEmails = async () => {
    if (!sequence) return;

    const text = sequence.emails.map(email => {
      return `=== Day ${email.day}: ${EMAIL_FOCUS_CONFIG[email.focus]?.label || email.focus} ===

Subject: ${email.subject}
Preview: ${email.previewText}

${email.openingHook}

${email.storyAnalogy}

${email.lessonTwist}

${email.offerBridge}

${email.cta}

${email.ps ? `P.S. ${email.ps}` : ""}

-------------------`;
    }).join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("All emails copied to clipboard!");
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            14-Day Email Sequence Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Generate a complete 14-day pre-sale email sequence using the Funnel Architect Pro framework.
            Story-driven, curiosity hooks, objection handling, and urgency — all done for you.
          </p>

          {!sequence && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="offerName">Offer Name *</Label>
                <Input
                  id="offerName"
                  placeholder="e.g., The Simple List Builder Toolkit"
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Coaches and course creators"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="17"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="uniqueMechanism">Unique Mechanism (optional)</Label>
                <Input
                  id="uniqueMechanism"
                  placeholder="e.g., The Value-First List Method"
                  value={uniqueMechanism}
                  onChange={(e) => setUniqueMechanism(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="keyBenefits">Key Benefits (one per line)</Label>
                <Textarea
                  id="keyBenefits"
                  placeholder="Build your list without ads&#10;Create a responsive audience&#10;Turn subscribers into buyers"
                  value={keyBenefits}
                  onChange={(e) => setKeyBenefits(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button
              variant="hero"
              onClick={generateSequence}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {sequence ? "Regenerate Sequence" : "Generate 14-Day Sequence"}
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
              Crafting your 14-day story-driven email sequence...
            </div>
          )}
        </CardContent>
      </Card>

      {sequence && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{sequence.emails?.length || 0} Emails</Badge>
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
