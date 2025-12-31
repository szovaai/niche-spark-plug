import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailDay, EMAIL_FOCUS_CONFIG } from "@/types/emailSequence";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EmailSequenceDisplayProps {
  emails: EmailDay[];
}

const EmailSequenceDisplay = ({ emails }: EmailSequenceDisplayProps) => {
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);

  const toggleExpand = (day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const copyEmail = async (email: EmailDay) => {
    const text = `Subject: ${email.subject}
Preview: ${email.previewText}

${email.openingHook}

${email.storyAnalogy}

${email.lessonTwist}

${email.offerBridge}

${email.cta}

${email.ps ? `P.S. ${email.ps}` : ""}`;

    await navigator.clipboard.writeText(text);
    setCopiedDay(email.day);
    toast.success(`Day ${email.day} email copied!`);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const getColorClasses = (focus: string) => {
    const config = EMAIL_FOCUS_CONFIG[focus as keyof typeof EMAIL_FOCUS_CONFIG];
    return config?.color || "bg-gray-500";
  };

  return (
    <div className="grid gap-3">
      {emails.map((email) => {
        const isExpanded = expandedDays.includes(email.day);
        const focusConfig = EMAIL_FOCUS_CONFIG[email.focus];

        return (
          <Card 
            key={email.day} 
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              isExpanded && "ring-2 ring-primary/20"
            )}
          >
            <CardContent className="p-4">
              {/* Header Row */}
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => toggleExpand(email.day)}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  getColorClasses(email.focus)
                )}>
                  {email.day}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {focusConfig?.label || email.focus}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {focusConfig?.purpose}
                    </span>
                  </div>
                  <p className="font-medium truncate mt-1">
                    {email.subject}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyEmail(email);
                    }}
                  >
                    {copiedDay === email.day ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Preview Text
                    </p>
                    <p className="text-sm italic text-muted-foreground">
                      {email.previewText}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Opening Hook
                    </p>
                    <p className="text-sm">{email.openingHook}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Story / Analogy
                    </p>
                    <p className="text-sm whitespace-pre-line">{email.storyAnalogy}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Lesson / Twist
                    </p>
                    <p className="text-sm">{email.lessonTwist}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Offer Bridge
                    </p>
                    <p className="text-sm">{email.offerBridge}</p>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Call to Action
                    </p>
                    <p className="text-sm font-medium text-primary">{email.cta}</p>
                  </div>

                  {email.ps && (
                    <div className="border-l-2 border-muted pl-3">
                      <p className="text-sm italic">
                        <strong>P.S.</strong> {email.ps}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyEmail(email)}
                      className="gap-2"
                    >
                      {copiedDay === email.day ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy Email
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EmailSequenceDisplay;
