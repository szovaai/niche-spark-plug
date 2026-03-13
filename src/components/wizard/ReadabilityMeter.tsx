import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, BarChart3, AlertTriangle, CheckCircle2, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadabilityMeterProps {
  text: string;
  label?: string;
}

// Flesch-Kincaid approximation
function computeReadability(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllables / Math.max(wordCount, 1);

  // Flesch Reading Ease (higher = easier)
  const flesch = Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord);
  const readingTimeMin = Math.ceil(wordCount / 230);

  // AI detection risk heuristics
  const aiPhrases = [
    "in today's", "leverage", "optimize", "elevate", "harness",
    "dive into", "comprehensive guide", "navigate the complexities",
    "furthermore", "moreover", "additionally", "it is important to note",
    "game changer", "without further ado", "journey", "empower",
    "unlock your potential", "in conclusion", "in this article",
    "delve into", "crucial", "landscape", "paradigm", "synergy",
  ];
  const lowerText = text.toLowerCase();
  const aiHits = aiPhrases.filter(p => lowerText.includes(p));
  const aiRisk = Math.min(100, Math.round((aiHits.length / 5) * 100));

  // Paragraph density
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const avgParaLength = wordCount / Math.max(paragraphs.length, 1);
  const densityWarning = avgParaLength > 80;

  // Actionability (presence of action verbs, steps, numbers)
  const hasSteps = /step\s*\d|#\d|\d\.\s/i.test(text);
  const hasNumbers = /\$[\d,]+|\d+%|\d+\s*(days?|hours?|minutes?|weeks?)/i.test(text);
  const hasPrompts = /here'?s\s+(the\s+)?(exact|what|how)|copy[\s-]paste|template:|script:|prompt:/i.test(text);
  const actionScore = [hasSteps, hasNumbers, hasPrompts].filter(Boolean).length;

  return {
    wordCount,
    sentenceCount,
    flesch: Math.max(0, Math.min(100, flesch)),
    readingTimeMin,
    aiRisk,
    aiHits,
    densityWarning,
    avgWordsPerSentence: Math.round(avgWordsPerSentence),
    avgParaLength: Math.round(avgParaLength),
    actionScore,
    paragraphCount: paragraphs.length,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function getFleschLabel(score: number) {
  if (score >= 80) return { label: "Very Easy", color: "text-green-400" };
  if (score >= 60) return { label: "Easy", color: "text-green-400" };
  if (score >= 40) return { label: "Standard", color: "text-yellow-400" };
  if (score >= 20) return { label: "Difficult", color: "text-orange-400" };
  return { label: "Very Hard", color: "text-destructive" };
}

export default function ReadabilityMeter({ text, label }: ReadabilityMeterProps) {
  const stats = useMemo(() => computeReadability(text), [text]);
  const fleschInfo = getFleschLabel(stats.flesch);

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        {label && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        )}

        {/* Top stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold">{stats.wordCount.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Words</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold">{stats.readingTimeMin}</p>
              <p className="text-[10px] text-muted-foreground">Min read</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className={cn("w-4 h-4 shrink-0", fleschInfo.color)} />
            <div>
              <p className="text-lg font-bold">{stats.flesch}</p>
              <p className={cn("text-[10px]", fleschInfo.color)}>{fleschInfo.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold">{stats.paragraphCount}</p>
              <p className="text-[10px] text-muted-foreground">Paragraphs</p>
            </div>
          </div>
        </div>

        {/* Readability bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Readability Score</span>
            <span>{stats.flesch}/100</span>
          </div>
          <Progress
            value={stats.flesch}
            className={cn("h-2", stats.flesch >= 60 ? "[&>div]:bg-green-500" : stats.flesch >= 40 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-destructive")}
          />
        </div>

        {/* AI detection risk */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {stats.aiRisk <= 20 ? (
                <CheckCircle2 className="w-3 h-3 text-green-400" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              )}
              AI-Phrasing Risk
            </span>
            <span>{stats.aiRisk <= 20 ? "Low" : stats.aiRisk <= 50 ? "Medium" : "High"}</span>
          </div>
          <Progress
            value={100 - stats.aiRisk}
            className={cn("h-2", stats.aiRisk <= 20 ? "[&>div]:bg-green-500" : stats.aiRisk <= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-destructive")}
          />
          {stats.aiHits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {stats.aiHits.map((phrase, i) => (
                <Badge key={i} variant="outline" className="text-[10px] text-destructive border-destructive/30">
                  "{phrase}"
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actionability indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={stats.actionScore >= 2 ? "default" : "outline"} className={cn("text-[10px]", stats.actionScore >= 2 ? "bg-green-500/20 text-green-400 border-green-500/30" : "")}>
            {stats.actionScore >= 2 ? "✓" : "✗"} Actionable Steps
          </Badge>
          <Badge variant={stats.avgWordsPerSentence <= 20 ? "default" : "outline"} className={cn("text-[10px]", stats.avgWordsPerSentence <= 20 ? "bg-green-500/20 text-green-400 border-green-500/30" : "text-amber-400 border-amber-400/30")}>
            Avg {stats.avgWordsPerSentence} words/sentence
          </Badge>
          {stats.densityWarning && (
            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30">
              ⚠ Dense paragraphs ({stats.avgParaLength} words avg)
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
