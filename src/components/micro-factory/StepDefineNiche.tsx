import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NicheData {
  nicheTopic: string;
  targetAudience: string;
  problemStatement: string;
}

interface Props {
  data: NicheData;
  onChange: (data: NicheData) => void;
}

export default function StepDefineNiche({ data, onChange }: Props) {
  const update = (field: keyof NicheData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Define Your Niche & Audience</h2>
        <p className="text-sm text-muted-foreground">Tell us who this product is for and what problem it solves</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Topic / Niche</Label>
          <Input
            id="niche"
            placeholder="e.g. Productivity for remote workers"
            value={data.nicheTopic}
            onChange={(e) => update("nicheTopic", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Input
            id="audience"
            placeholder="e.g. Freelancers struggling with time management"
            value={data.targetAudience}
            onChange={(e) => update("targetAudience", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="problem">Problem It Solves</Label>
          <Textarea
            id="problem"
            placeholder="e.g. They waste hours every week on unstructured work and miss deadlines"
            value={data.problemStatement}
            onChange={(e) => update("problemStatement", e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
