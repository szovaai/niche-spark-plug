import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Loader2, CheckCircle, AlertTriangle, XCircle, Sparkles, TrendingUp, Lightbulb, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UniquenessCheckInput, UniquenessCheckOutput } from '@/types/uniquenessCheck';

interface UniquenessCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialType?: UniquenessCheckInput['contentType'];
}

export const UniquenessChecker = ({ isOpen, onClose, initialContent = '', initialType = 'description' }: UniquenessCheckerProps) => {
  const [content, setContent] = useState(initialContent);
  const [contentType, setContentType] = useState<UniquenessCheckInput['contentType']>(initialType);
  const [nicheContext, setNicheContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<UniquenessCheckOutput | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (content.trim().length < 50) {
      toast.error('Please enter at least 50 characters to analyze');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-uniqueness', {
        body: { content, contentType, nicheContext: nicheContext || undefined }
      });

      if (error) throw error;
      setResult(data);
      toast.success('Analysis complete!');
    } catch (error: any) {
      console.error('Uniqueness check error:', error);
      toast.error(error.message || 'Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-400';
    if (score >= 51) return 'text-primary';
    if (score >= 31) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 71) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (score >= 51) return <TrendingUp className="w-6 h-6 text-primary" />;
    if (score >= 31) return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    return <XCircle className="w-6 h-6 text-red-400" />;
  };

  const getRatingBadgeVariant = (rating: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (rating) {
      case 'Excellent': return 'default';
      case 'Good': return 'secondary';
      case 'Moderate': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Fingerprint className="w-6 h-6 text-primary" />
            Uniqueness Score Analyzer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={(v) => setContentType(v as UniquenessCheckInput['contentType'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="description">Product Description</SelectItem>
                      <SelectItem value="blueprint">Product Blueprint</SelectItem>
                      <SelectItem value="marketing_copy">Marketing Copy</SelectItem>
                      <SelectItem value="plr_content">PLR Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Niche/Context (Optional)</Label>
                  <Input
                    placeholder="e.g., Self-care planners for busy moms"
                    value={nicheContext}
                    onChange={(e) => setNicheContext(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content to Analyze</Label>
                <Textarea
                  placeholder="Paste your content here... (minimum 50 characters)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {content.length} characters {content.length < 50 && '(minimum 50 required)'}
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || content.trim().length < 50}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Patterns...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Uniqueness
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Header */}
                <div className="flex items-center justify-between p-6 rounded-xl bg-background/50 border border-border">
                  <div className="flex items-center gap-4">
                    {getScoreIcon(result.uniquenessScore)}
                    <div>
                      <p className="text-sm text-muted-foreground">Uniqueness Score</p>
                      <p className={`text-4xl font-bold ${getScoreColor(result.uniquenessScore)}`}>
                        {result.uniquenessScore}
                        <span className="text-lg text-muted-foreground">/100</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant={getRatingBadgeVariant(result.rating)} className="text-lg px-4 py-2">
                    {result.rating}
                  </Badge>
                </div>

                {/* Overall Assessment */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Overall Assessment</p>
                  <p className="text-foreground">{result.overallAssessment}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uniqueness Level</span>
                    <span className={getScoreColor(result.uniquenessScore)}>{result.uniquenessScore}%</span>
                  </div>
                  <Progress value={result.uniquenessScore} className="h-3" />
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </p>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Areas to Improve
                    </p>
                    <ul className="space-y-2">
                      {result.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pattern Matches */}
                {result.patternMatches.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Detected Patterns</p>
                    <div className="space-y-2">
                      {result.patternMatches.map((match, i) => (
                        <div key={i} className="p-3 rounded-lg bg-background/50 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">"{match.pattern}"</span>
                            <Badge variant={match.frequency === 'common' ? 'destructive' : match.frequency === 'moderate' ? 'outline' : 'secondary'}>
                              {match.frequency}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{match.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Suggestions */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    Improvement Suggestions
                  </p>
                  <div className="space-y-2">
                    {result.improvementSuggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-foreground">{suggestion}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion, `Suggestion ${i + 1}`)}
                          className="shrink-0"
                        >
                          {copiedItem === `Suggestion ${i + 1}` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Differentiation Tips */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Differentiation Tips
                  </p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {result.differentiationTips.map((tip, i) => (
                      <div key={i} className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm text-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setResult(null)}
                    className="flex-1"
                  >
                    Analyze New Content
                  </Button>
                  <Button
                    onClick={() => {
                      const report = `Uniqueness Score: ${result.uniquenessScore}/100 (${result.rating})\n\n${result.overallAssessment}\n\nStrengths:\n${result.strengths.map(s => `• ${s}`).join('\n')}\n\nAreas to Improve:\n${result.weaknesses.map(w => `• ${w}`).join('\n')}\n\nSuggestions:\n${result.improvementSuggestions.map(s => `• ${s}`).join('\n')}`;
                      copyToClipboard(report, 'Full Report');
                    }}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Full Report
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
