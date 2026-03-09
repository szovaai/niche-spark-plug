import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles, Loader2, Copy, Check, Zap, MessageSquare, Twitter,
  Linkedin, Facebook, Video, Search, Hash, ArrowRight, TrendingUp
} from "lucide-react";
import { Step1Product, Step2Content, Step3Funnel } from "@/types/launchWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productBrief: Step1Product | null;
  productContent: Step2Content | null;
  funnelCopy: Step3Funnel | null;
}

interface ViralPost {
  platform: string;
  hook: string;
  body: string;
  cta: string;
  charCount: number;
  viralPattern: string;
}

interface Thread {
  platform: string;
  title: string;
  tweets: string[];
}

interface TikTokScript {
  hookLine: string;
  script: string;
  style: string;
}

interface EngagementPost {
  platform: string;
  type: string;
  body: string;
  expectedEngagement: string;
}

interface HookItem {
  hook: string;
  type: string;
  platform: string;
  strength: string;
}

interface ViralAnalysis {
  analysis: {
    hookPattern: string;
    storyStructure: string;
    engagementTriggers: string[];
    toneStyle: string;
    ctaStyle: string;
    viralScore: number;
    whyItWorked: string;
  };
  generatedPosts: { body: string; platform: string; patternUsed: string }[];
}

const PLATFORMS = [
  { id: "twitter", label: "X / Twitter", icon: Twitter },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "tiktok", label: "TikTok", icon: Video },
];

const PATTERN_COLORS: Record<string, string> = {
  "curiosity-gap": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  "contrarian": "bg-red-500/10 text-red-700 dark:text-red-300",
  "micro-story": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "discovery": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "list-style": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const PLATFORM_ICON: Record<string, typeof Twitter> = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: Video,
  universal: Hash,
};

export default function ViralContentEngine({ productBrief, productContent, funnelCopy }: Props) {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "facebook", "linkedin", "tiktok"]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Batch results
  const [batchResult, setBatchResult] = useState<any>(null);

  // Hooks
  const [hooks, setHooks] = useState<HookItem[]>([]);
  const [hookFilter, setHookFilter] = useState<string>("all");

  // Analyzer
  const [viralText, setViralText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<ViralAnalysis | null>(null);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = (posts: any[], formatter: (p: any) => string) => {
    const text = posts.map(formatter).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("All posts copied!");
  };

  const generateBatch = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-viral-content", {
        body: { mode: "generate-batch", productBrief, productContent, funnelCopy, platforms: selectedPlatforms },
      });
      if (error) throw error;
      setBatchResult(data);
      toast.success("Viral content batch generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const generateHooks = async () => {
    if (!productBrief) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-viral-content", {
        body: { mode: "generate-hooks", productBrief, productContent },
      });
      if (error) throw error;
      setHooks(data.hooks || []);
      toast.success("50 viral hooks generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate hooks");
    } finally {
      setLoading(false);
    }
  };

  const analyzeViral = async () => {
    if (!productBrief || !viralText.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-viral-content", {
        body: { mode: "analyze-viral", productBrief, productContent, viralText },
      });
      if (error) throw error;
      setAnalysisResult(data);
      toast.success("Viral pattern analyzed!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const renderPost = (post: ViralPost, idx: number, category: string) => {
    const Icon = PLATFORM_ICON[post.platform] || MessageSquare;
    const key = `${category}-${idx}`;
    return (
      <Card key={key} className="group hover:border-primary/30 transition-colors">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <Badge className={`text-[10px] ${PATTERN_COLORS[post.viralPattern] || "bg-secondary"}`}>
                {post.viralPattern}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{post.charCount} chars</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyText(`${post.hook}\n\n${post.body}\n\n${post.cta}`, key)}>
              {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-sm font-semibold text-primary">{post.hook}</p>
          <p className="text-sm whitespace-pre-line">{post.body}</p>
          {post.cta && <p className="text-sm font-medium text-primary/80 italic">{post.cta}</p>}
        </CardContent>
      </Card>
    );
  };

  const filteredHooks = hookFilter === "all" ? hooks : hooks.filter(h => h.type === hookFilter);
  const hookTypes = [...new Set(hooks.map(h => h.type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Viral Momentum Engine</h3>
          <p className="text-sm text-muted-foreground">Reverse-engineer virality. Generate scroll-stopping content.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-auto flex-wrap gap-1">
          <TabsTrigger value="generate" className="gap-1 text-xs"><Sparkles className="w-3 h-3" /> Content Batch</TabsTrigger>
          <TabsTrigger value="hooks" className="gap-1 text-xs"><TrendingUp className="w-3 h-3" /> 50 Hooks</TabsTrigger>
          <TabsTrigger value="analyzer" className="gap-1 text-xs"><Search className="w-3 h-3" /> Pattern Analyzer</TabsTrigger>
        </TabsList>

        {/* === BATCH GENERATOR === */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-sm">Select Platforms</h4>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map(p => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedPlatforms.includes(p.id)}
                      onCheckedChange={() => togglePlatform(p.id)}
                    />
                    <p.icon className="w-4 h-4" />
                    <span className="text-sm">{p.label}</span>
                  </label>
                ))}
              </div>
              <Button onClick={generateBatch} disabled={loading || selectedPlatforms.length === 0} className="gap-2 w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Generate 30+ Viral Posts, 3 Threads & 3 TikTok Scripts
              </Button>
            </CardContent>
          </Card>

          {batchResult && (
            <Tabs defaultValue="curiosity">
              <TabsList className="w-full h-auto flex-wrap gap-1">
                <TabsTrigger value="curiosity" className="text-xs">🔮 Curiosity</TabsTrigger>
                <TabsTrigger value="contrarian" className="text-xs">🔥 Contrarian</TabsTrigger>
                <TabsTrigger value="stories" className="text-xs">📖 Stories</TabsTrigger>
                <TabsTrigger value="discovery" className="text-xs">💡 Discovery</TabsTrigger>
                <TabsTrigger value="lists" className="text-xs">📋 Lists</TabsTrigger>
                <TabsTrigger value="threads" className="text-xs">🧵 Threads</TabsTrigger>
                <TabsTrigger value="tiktok" className="text-xs">🎬 TikTok</TabsTrigger>
                <TabsTrigger value="engagement" className="text-xs">💬 Engage</TabsTrigger>
              </TabsList>

              {/* Curiosity */}
              <TabsContent value="curiosity" className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">Curiosity Gap Posts</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyAll(batchResult.curiosityPosts || [], p => `${p.hook}\n\n${p.body}\n\n${p.cta}`)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy All
                  </Button>
                </div>
                {batchResult.curiosityPosts?.map((p: ViralPost, i: number) => renderPost(p, i, "curiosity"))}
              </TabsContent>

              {/* Contrarian */}
              <TabsContent value="contrarian" className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">Contrarian Posts</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyAll(batchResult.contrarianPosts || [], p => `${p.hook}\n\n${p.body}\n\n${p.cta}`)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy All
                  </Button>
                </div>
                {batchResult.contrarianPosts?.map((p: ViralPost, i: number) => renderPost(p, i, "contrarian"))}
              </TabsContent>

              {/* Micro Stories */}
              <TabsContent value="stories" className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">Micro Story Posts</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyAll(batchResult.microStoryPosts || [], p => `${p.hook}\n\n${p.body}\n\n${p.cta}`)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy All
                  </Button>
                </div>
                {batchResult.microStoryPosts?.map((p: ViralPost, i: number) => renderPost(p, i, "stories"))}
              </TabsContent>

              {/* Discovery */}
              <TabsContent value="discovery" className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">Discovery Posts</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyAll(batchResult.discoveryPosts || [], p => `${p.hook}\n\n${p.body}\n\n${p.cta}`)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy All
                  </Button>
                </div>
                {batchResult.discoveryPosts?.map((p: ViralPost, i: number) => renderPost(p, i, "discovery"))}
              </TabsContent>

              {/* Lists */}
              <TabsContent value="lists" className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">List-Style Posts</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyAll(batchResult.listPosts || [], p => `${p.hook}\n\n${p.body}\n\n${p.cta}`)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy All
                  </Button>
                </div>
                {batchResult.listPosts?.map((p: ViralPost, i: number) => renderPost(p, i, "lists"))}
              </TabsContent>

              {/* Threads */}
              <TabsContent value="threads" className="space-y-4">
                {batchResult.threads?.map((thread: Thread, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">🧵 {thread.title}</h4>
                        <Button variant="ghost" size="sm" onClick={() => copyText(thread.tweets.map((t, j) => `${j + 1}/ ${t}`).join("\n\n"), `thread-${i}`)}>
                          {copied === `thread-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Thread
                        </Button>
                      </div>
                      <div className="space-y-2 relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                        {thread.tweets.map((tweet, j) => (
                          <div key={j} className="flex gap-3 ml-1">
                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                              {j + 1}
                            </div>
                            <p className="text-sm flex-1">{tweet}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* TikTok */}
              <TabsContent value="tiktok" className="space-y-3">
                {batchResult.tiktokScripts?.map((script: TikTokScript, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <h4 className="font-semibold text-sm">Script {i + 1}</h4>
                          <Badge variant="outline" className="text-[10px]">{script.style}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyText(script.script, `tiktok-${i}`)}>
                          {copied === `tiktok-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <div className="p-2 rounded bg-primary/5">
                        <p className="text-sm font-bold">🎬 Hook: {script.hookLine}</p>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap font-mono bg-secondary/30 p-3 rounded">{script.script}</pre>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Engagement */}
              <TabsContent value="engagement" className="space-y-3">
                {batchResult.engagementPosts?.map((post: EngagementPost, i: number) => {
                  const Icon = PLATFORM_ICON[post.platform] || MessageSquare;
                  return (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            <Badge variant="outline" className="text-[10px]">{post.type}</Badge>
                            <Badge className={`text-[10px] ${post.expectedEngagement === "high" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>
                              {post.expectedEngagement} engagement
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyText(post.body, `engage-${i}`)}>
                            {copied === `engage-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-line">{post.body}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        {/* === HOOKS TAB === */}
        <TabsContent value="hooks" className="space-y-4">
          <Button onClick={generateHooks} disabled={loading} className="gap-2 w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Generate 50 Viral Hooks
          </Button>

          {hooks.length > 0 && (
            <>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={hookFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setHookFilter("all")}
                >All ({hooks.length})</Badge>
                {hookTypes.map(type => (
                  <Badge
                    key={type}
                    variant={hookFilter === type ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setHookFilter(type)}
                  >{type} ({hooks.filter(h => h.type === type).length})</Badge>
                ))}
              </div>

              <Button variant="ghost" size="sm" onClick={() => copyAll(filteredHooks, h => h.hook)} className="gap-1">
                <Copy className="w-3 h-3" /> Copy All Hooks
              </Button>

              <div className="grid gap-2 md:grid-cols-2">
                {filteredHooks.map((h, i) => {
                  const Icon = PLATFORM_ICON[h.platform] || Hash;
                  return (
                    <Card key={i} className="group hover:border-primary/30 transition-colors">
                      <CardContent className="p-3 flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium">{h.hook}</p>
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-[10px]">{h.type}</Badge>
                            {h.strength === "high" && <Badge className="text-[10px] bg-emerald-500/10 text-emerald-700">🔥 high</Badge>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyText(h.hook, `hook-${i}`)}>
                          {copied === `hook-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* === PATTERN ANALYZER === */}
        <TabsContent value="analyzer" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Search className="w-4 h-4" /> Paste a Viral Post
              </h4>
              <p className="text-xs text-muted-foreground">Paste any viral tweet, post, or thread. The AI will extract its patterns and generate 10 new posts using those same triggers.</p>
              <Textarea
                value={viralText}
                onChange={e => setViralText(e.target.value)}
                placeholder="Paste a viral post here..."
                rows={6}
              />
              <Button onClick={analyzeViral} disabled={loading || !viralText.trim()} className="gap-2 w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Analyze & Generate
              </Button>
            </CardContent>
          </Card>

          {analysisResult && (
            <div className="space-y-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">🔬 Pattern Analysis</h4>
                    <Badge className="bg-primary/20 text-primary">Score: {analysisResult.analysis.viralScore}/100</Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Hook Pattern</p>
                      <p className="text-sm">{analysisResult.analysis.hookPattern}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Story Structure</p>
                      <p className="text-sm">{analysisResult.analysis.storyStructure}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Tone Style</p>
                      <p className="text-sm">{analysisResult.analysis.toneStyle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">CTA Style</p>
                      <p className="text-sm">{analysisResult.analysis.ctaStyle}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Engagement Triggers</p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.analysis.engagementTriggers.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-background/50">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Why It Worked</p>
                    <p className="text-sm">{analysisResult.analysis.whyItWorked}</p>
                  </div>
                </CardContent>
              </Card>

              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> 10 Posts Using These Patterns
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {analysisResult.generatedPosts.map((post, i) => {
                  const Icon = PLATFORM_ICON[post.platform] || MessageSquare;
                  return (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            <Badge variant="outline" className="text-[10px]">{post.patternUsed}</Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyText(post.body, `analyzed-${i}`)}>
                            {copied === `analyzed-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-line">{post.body}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
