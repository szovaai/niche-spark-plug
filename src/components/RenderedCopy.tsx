import { useMemo } from "react";
import { markdownToHTML, filterBannedPhrases, scoreCopy } from "@/lib/copyUtils";
import CopyScoreBadge from "./CopyScoreBadge";

interface Props {
  content: string;
  mechanismName?: string;
  showScore?: boolean;
  className?: string;
}

/**
 * Renders AI-generated copy with markdown→HTML conversion,
 * banned-phrase filtering, and optional quality scoring.
 */
export default function RenderedCopy({ content, mechanismName, showScore = false, className = "" }: Props) {
  const { html, score } = useMemo(() => {
    const cleaned = filterBannedPhrases(content);
    return {
      html: markdownToHTML(cleaned),
      score: showScore ? scoreCopy(cleaned, mechanismName) : null,
    };
  }, [content, mechanismName, showScore]);

  return (
    <div className={className}>
      {score && <CopyScoreBadge score={score} className="mb-3" />}
      <div
        className="prose prose-sm prose-invert max-w-none text-muted-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_hr]:border-border [&_p]:my-1.5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
