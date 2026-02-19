import { BookOpen, CheckSquare, Calendar, Trophy, FileText, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const productTypes = [
  {
    id: "ebook",
    label: "E-book / Mini Guide",
    description: "Short, focused guide with chapters",
    icon: BookOpen,
    badge: "Popular",
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Actionable step-by-step checklist",
    icon: CheckSquare,
  },
  {
    id: "habit_tracker",
    label: "Habit Tracker",
    description: "Daily habit tracking system",
    icon: Calendar,
  },
  {
    id: "challenge",
    label: "Challenge",
    description: "Multi-day transformation challenge",
    icon: Trophy,
    badge: "Hot",
  },
  {
    id: "worksheet",
    label: "Worksheet",
    description: "Interactive exercises & prompts",
    icon: FileText,
  },
  {
    id: "swipe_file",
    label: "Swipe File / Templates",
    description: "Ready-to-use template collection",
    icon: Copy,
  },
];

interface Props {
  selected: string;
  onSelect: (type: string) => void;
}

export default function StepSelectType({ selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Pick a Product Type</h2>
        <p className="text-sm text-muted-foreground">Choose the format for your micro product</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {productTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selected === type.id ? "border-primary bg-primary/5 ring-1 ring-primary/30" : ""
            }`}
            onClick={() => onSelect(type.id)}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <type.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{type.label}</p>
                  {type.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-accent/20 text-accent">
                      {type.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
