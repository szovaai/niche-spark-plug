import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield } from "lucide-react";

interface Props {
  project: any;
}

interface AuditItem {
  label: string;
  passed: boolean;
  step: number;
}

function auditProject(project: any): AuditItem[] {
  const s1 = project?.step1_product || {};
  const s3 = project?.step3_funnel || {};
  const s4 = project?.step4_marketing || {};
  const s5 = project?.step5_checklist || {};

  return [
    { label: "Branded mechanism defined", passed: !!s1.mechanism, step: 1 },
    { label: "Buyer avatar created", passed: !!project?.buyer_avatar, step: 1 },
    { label: "Sales page generated", passed: !!s3.salesPage, step: 3 },
    { label: "Guarantee / risk reversal", passed: !!s3.pricingPsychology?.guarantee || (s3.salesPage?.toLowerCase?.()?.includes("guarantee")), step: 3 },
    { label: "Clear CTA on sales page", passed: !!s3.salesPage && (s3.salesPage?.toLowerCase?.()?.includes("buy") || s3.salesPage?.toLowerCase?.()?.includes("get access")), step: 3 },
    { label: "Email sequence created", passed: !!(s4.emails?.length > 0), step: 4 },
    { label: "Social media assets", passed: !!(s4.socialPosts?.length > 0 || s4.adCopy?.length > 0), step: 4 },
    { label: "Launch timeline set", passed: !!(s5.steps?.length > 0), step: 5 },
  ];
}

export default function PreLaunchAudit({ project }: Props) {
  const items = auditProject(project);
  const passCount = items.filter(i => i.passed).length;
  const pct = Math.round((passCount / items.length) * 100);

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Pre-Launch Audit</h3>
          </div>
          <Badge variant={pct >= 75 ? "default" : "secondary"} className={pct >= 75 ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
            {passCount}/{items.length} — {pct}% ready
          </Badge>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive/60 shrink-0" />
              )}
              <span className={item.passed ? "text-muted-foreground" : ""}>{item.label}</span>
              {!item.passed && (
                <span className="text-xs text-muted-foreground ml-auto">Step {item.step}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
