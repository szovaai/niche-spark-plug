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
        className="kennedy-preview prose prose-sm max-w-none text-muted-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_hr]:border-border [&_p]:my-1.5 [&_.urgency-bar]:bg-destructive [&_.urgency-bar]:text-destructive-foreground [&_.urgency-bar]:text-center [&_.urgency-bar]:p-2 [&_.urgency-bar]:text-xs [&_.urgency-bar]:uppercase [&_.urgency-bar]:tracking-wider [&_.urgency-bar]:rounded-t-md [&_.letter-header]:bg-muted [&_.letter-header]:border-b [&_.letter-header]:border-border [&_.letter-header]:p-4 [&_.letter-header]:text-center [&_.from-desk]:text-xs [&_.from-desk]:uppercase [&_.from-desk]:tracking-widest [&_.from-desk]:text-muted-foreground [&_.sender]:text-sm [&_.sender]:italic [&_.sender]:text-foreground [&_.headline-box]:p-6 [&_.headline-box]:border-b [&_.headline-box]:border-border [&_.pre-headline]:text-xs [&_.pre-headline]:uppercase [&_.pre-headline]:tracking-widest [&_.pre-headline]:text-destructive [&_.pre-headline]:block [&_.pre-headline]:mb-3 [&_.deck]:text-sm [&_.deck]:italic [&_.deck]:text-muted-foreground [&_.deck]:border-l-4 [&_.deck]:border-destructive [&_.deck]:pl-4 [&_.salutation]:p-4 [&_.salutation]:pt-6 [&_.date-line]:text-xs [&_.date-line]:text-muted-foreground [&_.body-copy]:p-4 [&_.pull-quote]:border-y-2 [&_.pull-quote]:border-destructive [&_.pull-quote]:py-4 [&_.pull-quote]:my-4 [&_.pull-quote]:text-center [&_.pull-quote]:italic [&_.pull-quote]:text-destructive [&_.pull-quote]:font-serif [&_.box]:border [&_.box]:border-border [&_.box]:p-4 [&_.box]:my-4 [&_.box]:bg-card [&_.box.red-border]:border-destructive [&_.box.red-border]:border-2 [&_.box-headline]:text-xs [&_.box-headline]:uppercase [&_.box-headline]:tracking-wider [&_.box-headline]:text-destructive [&_.box-headline]:font-bold [&_.box-headline]:block [&_.box-headline]:mb-2 [&_.fascinations]:list-none [&_.fascinations]:pl-0 [&_.fascinations_li]:border-b [&_.fascinations_li]:border-dotted [&_.fascinations_li]:border-border [&_.check-list]:list-none [&_.check-list]:pl-0 [&_.testimonial-block]:bg-card [&_.testimonial-block]:border [&_.testimonial-block]:border-border [&_.testimonial-block]:border-l-4 [&_.testimonial-block]:border-l-destructive [&_.testimonial-block]:p-4 [&_.testimonial-block]:my-3 [&_.quote-text]:italic [&_.quote-text]:text-foreground [&_.attribution]:text-xs [&_.attribution]:uppercase [&_.attribution]:tracking-wider [&_.attribution]:text-muted-foreground [&_.order-box]:border-2 [&_.order-box]:border-destructive [&_.order-box]:p-6 [&_.order-box]:my-4 [&_.order-box]:text-center [&_.order-box]:bg-card [&_.now-price]:text-4xl [&_.now-price]:font-black [&_.now-price]:text-destructive [&_.was-price]:line-through [&_.was-price]:text-muted-foreground [&_.cta-btn]:bg-destructive [&_.cta-btn]:text-destructive-foreground [&_.cta-btn]:block [&_.cta-btn]:p-4 [&_.cta-btn]:text-center [&_.cta-btn]:uppercase [&_.cta-btn]:tracking-wider [&_.cta-btn]:font-bold [&_.cta-btn]:no-underline [&_.guarantee-section]:bg-muted [&_.guarantee-section]:border [&_.guarantee-section]:border-border [&_.guarantee-section]:p-4 [&_.guarantee-section]:my-4 [&_.guarantee-section]:flex [&_.guarantee-section]:gap-4 [&_.guarantee-seal]:text-5xl [&_.faq-item]:border-b [&_.faq-item]:border-border [&_.faq-item]:py-3 [&_.faq-item_h4]:italic [&_.faq-item_h4]:text-foreground [&_.ps-section]:italic [&_.ps-section]:text-muted-foreground [&_.signature]:text-2xl [&_.signature]:italic [&_.signature]:text-foreground [&_.signature-name]:text-xs [&_.signature-name]:uppercase [&_.signature-name]:tracking-widest [&_.signature-name]:text-muted-foreground [&_.two-col]:grid [&_.two-col]:grid-cols-2 [&_.two-col]:gap-4 [&_.col-box]:border [&_.col-box]:border-border [&_.col-box]:p-3 [&_.col-box.green-top]:border-t-4 [&_.col-box.green-top]:border-t-green-600 [&_.col-box.red-top]:border-t-4 [&_.col-box.red-top]:border-t-destructive [&_.bonus-row]:flex [&_.bonus-row]:gap-3 [&_.bonus-row]:py-3 [&_.bonus-row]:border-b [&_.bonus-row]:border-dotted [&_.bonus-row]:border-border [&_.bonus-num]:text-2xl [&_.bonus-num]:font-black [&_.bonus-num]:text-destructive [&_.bonus-value]:text-xs [&_.bonus-value]:text-muted-foreground [&_.red-text]:text-destructive [&_.red-text]:font-bold [&_.red]:text-destructive [&_.section-break]:border-border [&_.section-break]:my-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
