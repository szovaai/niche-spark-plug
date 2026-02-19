import { useState } from "react";
import { Copy, Check, BookOpen, Megaphone, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Props {
  data: Record<string, unknown> | null;
  productType: string;
}

export default function StepResults({ data, productType }: Props) {
  if (!data) return null;

  const { product_title, product_subtitle, product_content, product_description, social_posts, email_pitch } = data as {
    product_title: string;
    product_subtitle: string;
    product_content: unknown;
    product_description: string;
    social_posts: string[];
    email_pitch: string;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">{product_title}</h2>
        <p className="text-sm text-muted-foreground">{product_subtitle}</p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="content" className="gap-1.5"><BookOpen className="w-3.5 h-3.5" />Content</TabsTrigger>
          <TabsTrigger value="marketing" className="gap-1.5"><Megaphone className="w-3.5 h-3.5" />Marketing</TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5"><Share2 className="w-3.5 h-3.5" />Social</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4 space-y-3">
          <ContentRenderer content={product_content} type={productType} />
        </TabsContent>

        <TabsContent value="marketing" className="mt-4 space-y-4">
          <CopyBlock label="Product Description" text={product_description} />
          <CopyBlock label="Email Pitch" text={email_pitch} />
        </TabsContent>

        <TabsContent value="social" className="mt-4 space-y-3">
          {(social_posts || []).map((post: string, i: number) => (
            <CopyBlock key={i} label={`Post ${i + 1}`} text={post} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentRenderer({ content, type }: { content: unknown; type: string }) {
  if (!content) return <p className="text-muted-foreground">No content generated.</p>;

  const items = Array.isArray(content) ? content : [];

  if (type === "ebook") {
    return (
      <>
        {items.map((ch: { chapter_number?: number; title?: string; content?: string }, i: number) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold text-sm">Chapter {ch.chapter_number || i + 1}: {ch.title}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ch.content}</p>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (type === "checklist") {
    return (
      <>
        {items.map((group: { category?: string; items?: string[]; item?: string; details?: string }, i: number) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              {group.category && <h4 className="font-semibold text-sm">{group.category}</h4>}
              {group.items ? (
                <ul className="space-y-1">
                  {group.items.map((item: string, j: number) => (
                    <li key={j} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">☐</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{group.item} — {group.details}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (type === "challenge") {
    return (
      <>
        {items.map((day: { day?: number; theme?: string; task?: string; reflection?: string; quick_win?: string }, i: number) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-1">
              <h4 className="font-semibold text-sm">Day {day.day || i + 1}: {day.theme}</h4>
              <p className="text-sm"><span className="text-primary font-medium">Task:</span> {day.task}</p>
              <p className="text-sm"><span className="text-accent font-medium">Reflect:</span> {day.reflection}</p>
              {day.quick_win && <p className="text-sm"><span className="font-medium">⚡ Quick Win:</span> {day.quick_win}</p>}
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (type === "habit_tracker" && !Array.isArray(content)) {
    const ht = content as { habits?: { name: string; description: string }[]; daily_structure?: string; milestones?: string[] };
    return (
      <div className="space-y-3">
        {ht.habits?.map((h, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <p className="font-medium text-sm">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.description}</p>
            </CardContent>
          </Card>
        ))}
        {ht.daily_structure && <CopyBlock label="Daily Structure" text={ht.daily_structure} />}
      </div>
    );
  }

  // Generic fallback for worksheet, swipe_file, etc.
  return (
    <>
      {items.map((item: Record<string, unknown>, i: number) => (
        <Card key={i}>
          <CardContent className="p-4">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={copy}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-sm whitespace-pre-wrap">{text}</p>
      </CardContent>
    </Card>
  );
}
