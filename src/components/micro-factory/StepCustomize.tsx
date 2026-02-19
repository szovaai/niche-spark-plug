import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
  productType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export default function StepCustomize({ productType, config, onChange }: Props) {
  const set = (key: string, value: unknown) => onChange({ ...config, [key]: value });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Customize Components</h2>
        <p className="text-sm text-muted-foreground">Fine-tune what goes into your product</p>
      </div>

      <div className="space-y-5">
        {productType === "ebook" && (
          <>
            <SliderField
              label="Number of Chapters"
              value={Number(config.numChapters) || 5}
              min={3} max={10} step={1}
              onChange={(v) => set("numChapters", v)}
            />
            <div className="space-y-2">
              <Label>Writing Tone</Label>
              <Select value={String(config.writingTone || "conversational")} onValueChange={(v) => set("writingTone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {productType === "checklist" && (
          <>
            <SliderField
              label="Number of Items"
              value={Number(config.numItems) || 20}
              min={10} max={50} step={5}
              onChange={(v) => set("numItems", v)}
            />
            <div className="flex items-center justify-between">
              <Label>Group by Categories</Label>
              <Switch checked={!!config.groupByCategory} onCheckedChange={(v) => set("groupByCategory", v)} />
            </div>
          </>
        )}

        {productType === "habit_tracker" && (
          <>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={String(config.duration || "30")} onValueChange={(v) => set("duration", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[7, 14, 21, 30].map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} days</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SliderField
              label="Habits per Day"
              value={Number(config.habitsPerDay) || 5}
              min={3} max={10} step={1}
              onChange={(v) => set("habitsPerDay", v)}
            />
          </>
        )}

        {productType === "challenge" && (
          <>
            <div className="space-y-2">
              <Label>Number of Days</Label>
              <Select value={String(config.numDays || "7")} onValueChange={(v) => set("numDays", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 14, 21, 30].map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} days</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily Task Format</Label>
              <Select value={String(config.taskFormat || "action + reflection")} onValueChange={(v) => set("taskFormat", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="action + reflection">Action + Reflection</SelectItem>
                  <SelectItem value="micro-task only">Micro-task Only</SelectItem>
                  <SelectItem value="deep work session">Deep Work Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {productType === "worksheet" && (
          <>
            <SliderField
              label="Number of Sections"
              value={Number(config.numSections) || 5}
              min={3} max={8} step={1}
              onChange={(v) => set("numSections", v)}
            />
            <div className="space-y-2">
              <Label>Exercise Style</Label>
              <Select value={String(config.exerciseStyle || "fill-in-the-blank")} onValueChange={(v) => set("exerciseStyle", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fill-in-the-blank">Fill-in-the-blank</SelectItem>
                  <SelectItem value="open-ended prompts">Open-ended Prompts</SelectItem>
                  <SelectItem value="rating scales">Rating Scales</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {productType === "swipe_file" && (
          <>
            <SliderField
              label="Number of Templates"
              value={Number(config.numTemplates) || 10}
              min={5} max={20} step={1}
              onChange={(v) => set("numTemplates", v)}
            />
            <div className="space-y-2">
              <Label>Format Type</Label>
              <Select value={String(config.formatType || "copy-paste ready")} onValueChange={(v) => set("formatType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="copy-paste ready">Copy-paste Ready</SelectItem>
                  <SelectItem value="fill-in-the-blank">Fill-in-the-blank</SelectItem>
                  <SelectItem value="example-based">Example-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-medium text-primary">{value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
