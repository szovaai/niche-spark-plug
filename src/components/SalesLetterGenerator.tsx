import { useState } from "react";
import { Mail, RefreshCw, Check, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolkitComponents } from "@/types/toolkit";

interface SalesLetterGeneratorProps {
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  components: ToolkitComponents;
  onSalesLetterGenerated: (letter: string) => void;
  existingSalesLetter?: string;
}

const SalesLetterGenerator = ({ title, niche, onSalesLetterGenerated, existingSalesLetter }: SalesLetterGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [salesLetter, setSalesLetter] = useState(existingSalesLetter || "");

  const generateSalesLetter = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const letter = `# ${title}\n\nAre you struggling with ${niche}?\n\nIntroducing the ultimate toolkit that will transform your results...\n\n## What You'll Get:\n- Complete guide\n- Actionable worksheets\n- Ready-to-use templates\n\n**Get Instant Access Now!**`;
      setSalesLetter(letter);
      onSalesLetterGenerated(letter);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold gradient-text">Generate Sales Letter</h2>
          <p className="text-muted-foreground mt-2">Create compelling sales copy for your product.</p>
        </div>

        {salesLetter ? (
          <Textarea value={salesLetter} onChange={(e) => setSalesLetter(e.target.value)} rows={12} className="font-mono text-sm" />
        ) : (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Click below to generate your sales letter.</p>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="hero" onClick={generateSalesLetter} disabled={isGenerating} className="gap-2">
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {salesLetter ? "Regenerate" : "Generate Sales Letter"}
          </Button>
          {salesLetter && (
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(salesLetter)} className="gap-2">
              <Copy className="w-4 h-4" /> Copy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesLetterGenerator;
