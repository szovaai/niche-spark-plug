import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Users, DollarSign, Target, Mail, Gift, Zap, ArrowRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Dimension {
  label: string;
  score: number;
  icon: React.ElementType;
  color: string;
  boostAction?: string;
}

interface Props {
  project: any;
}

function scoreDimension(project: any): Dimension[] {
  const p = project;
  const s1 = p.step1_product || {};
  const s2 = p.step2_product_content || {};
  const s3 = p.step3_funnel || {};
  const s4 = p.step4_marketing || {};
  const s5 = p.step5_checklist || {};

  // Content Quality: has chapters, has mechanism, has outline
  let content = 0;
  if (s2.chapters?.length >= 3) content += 40;
  if (s2.chapters?.length >= 5) content += 20;
  if (s1.mechanism) content += 20;
  if (s1.outline?.length > 0) content += 20;

  // Social Proof: has proof stack, buyer avatar, objections
  let proof = 0;
  if (s1.proofStack) proof += 35;
  if (p.buyer_avatar) proof += 35;
  if (s3.objections?.length > 0) proof += 30;

  // Pricing Power: has pricing, has payment plans
  let pricing = 0;
  if (s1.price) pricing += 40;
  if (s3.pricingPsychology) pricing += 30;
  if (s3.salesPage) pricing += 30;

  // Positioning: has mechanism, niche, audience
  let positioning = 0;
  if (s1.mechanism) positioning += 40;
  if (p.niche) positioning += 30;
  if (p.target_audience) positioning += 30;

  // Email Flow
  let email = 0;
  if (s4.emails?.length > 0) email += 50;
  if (s4.emails?.length >= 5) email += 30;
  if (s4.emailSubjectLines?.length > 0) email += 20;

  // Bonus Value
  let bonus = 0;
  if (s1.bonuses?.length > 0) bonus += 50;
  if (s1.bonuses?.length >= 3) bonus += 30;
  if (s1.bonuses?.length >= 5) bonus += 20;

  // Speed to Sale
  let speed = 0;
  if (s3.salesPage) speed += 30;
  if (s3.optInPage) speed += 20;
  if (s4.emails?.length > 0) speed += 20;
  if (s5.steps?.length > 0) speed += 30;

  return [
    { label: "Content Quality", score: Math.min(content, 100), icon: BookOpen, color: "text-primary", boostAction: "2" },
    { label: "Social Proof", score: Math.min(proof, 100), icon: Users, color: "text-amber-500", boostAction: "1" },
    { label: "Pricing Power", score: Math.min(pricing, 100), icon: DollarSign, color: "text-green-500", boostAction: "3" },
    { label: "Positioning", score: Math.min(positioning, 100), icon: Target, color: "text-blue-500", boostAction: "1" },
    { label: "Email Flow", score: Math.min(email, 100), icon: Mail, color: "text-purple-500", boostAction: "4" },
    { label: "Bonus Value", score: Math.min(bonus, 100), icon: Gift, color: "text-accent", boostAction: "1" },
    { label: "Speed to Sale", score: Math.min(speed, 100), icon: Zap, color: "text-orange-500", boostAction: "5" },
  ];
}

export default function ProductScorecard({ project }: Props) {
  const navigate = useNavigate();
  const dimensions = scoreDimension(project);
  const avgScore = Math.round(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length);
  const weakest = dimensions.reduce((min, d) => d.score < min.score ? d : min, dimensions[0]);

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Product Strength</h3>
          <span className={`text-2xl font-bold ${avgScore >= 70 ? "text-green-500" : avgScore >= 40 ? "text-amber-500" : "text-destructive"}`}>
            {avgScore}%
          </span>
        </div>

        <div className="space-y-3">
          {dimensions.map((d) => (
            <div key={d.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <d.icon className={`w-3.5 h-3.5 ${d.color}`} />
                  {d.label}
                </span>
                <span className="text-muted-foreground">{d.score}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${d.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {weakest.score < 60 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={() => navigate(`/wizard/${project.id}`)}
          >
            Boost "{weakest.label}" <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
