import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Rocket, Brain, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResearchMessage, OpportunityBrief, ResearchMode, ResearchStyle } from "@/types/researchAgent";
import { RESEARCH_MODES, RESEARCH_STYLES } from "@/types/researchAgent";

interface OpportunityIdea {
  title: string;
  audience: string;
  whyItSells: string[];
  productFormat: string;
  suggestedAngle: string;
  uniqueMechanism: string;
  monetizationScore: number;
  recommended?: boolean;
  trendVelocity?: number;
  marketWindow?: string;
}

function parseOpportunityBrief(text: string): OpportunityBrief | null {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.type === "opportunity_brief") return parsed;
  } catch { /* ignore */ }
  return null;
}

function stripJsonBlock(text: string): string {
  return text.replace(/```json\s*[\s\S]*?```/g, "").trim();
}

function TrendVelocityMeter({ velocity, window: marketWindow }: { velocity: number; window?: string }) {
  const getColor = (v: number) => {
    if (v >= 80) return "text-green-400";
    if (v >= 60) return "text-yellow-400";
    return "text-muted-foreground";
  };
  const getWindowLabel = (w?: string) => {
    if (!w) return null;
    const labels: Record<string, string> = {
      "Early Growth": "🟢 Early Trend — Ideal Time To Launch",
      "Peak": "🟡 Peak — Launch Now or Wait",
      "Saturating": "🔴 Saturating — Find a Unique Angle",
    };
    return labels[w] || w;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Trend Strength</span>
        <span className={`text-sm font-bold ${getColor(velocity)}`}>{velocity}/100</span>
      </div>
      <Progress value={velocity} className="h-2" />
      {marketWindow && (
        <p className="text-xs text-muted-foreground">{getWindowLabel(marketWindow)}</p>
      )}
    </div>
  );
}

export default function ResearchAgent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [researchMode, setResearchMode] = useState<ResearchMode | null>(null);
  const [researchStyle, setResearchStyle] = useState<ResearchStyle | null>(null);
  const [brief, setBrief] = useState<OpportunityBrief | null>(null);
  const [buildingIdeaIdx, setBuildingIdeaIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg: ResearchMessage = { role: "user", content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("research-agent", {
        body: {
          messages: newMessages,
          researchMode,
          researchStyle,
        },
      });
      if (error) throw error;

      const reply = data.reply as string;
      const parsed = parseOpportunityBrief(reply);
      if (parsed) setBrief(parsed);

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const selectMode = (mode: ResearchMode) => {
    setResearchMode(mode);
    const modeLabel = RESEARCH_MODES.find(m => m.value === mode)?.label || mode;
    if (mode === "trend_hijacking") {
      sendMessage(`I want to use ${modeLabel} mode. Show me the hottest emerging trends right now and identify the best product opportunities before competitors catch on.`);
    } else {
      sendMessage(`I want to research using ${modeLabel}. Let's find a profitable product idea.`);
    }
  };

  const buildFromIdea = async (idea: OpportunityIdea, ideaIndex: number) => {
    if (!user) {
      toast.error("Please sign in to create a project");
      return;
    }

    setBuildingIdeaIdx(ideaIndex);

    try {
      const { data, error } = await supabase
        .from("launch_projects")
        .insert({
          user_id: user.id,
          name: idea.title,
          niche: brief?.niche || idea.title,
          target_audience: idea.audience,
          product_type: brief?.productType || idea.productFormat?.split(/[+,]/)[0]?.trim() || "ebook",
          topic: brief?.topic || idea.suggestedAngle,
          step1_product: {
            title: idea.title,
            uniqueMechanism: idea.uniqueMechanism,
            campaignAngle: idea.suggestedAngle,
            whyItSells: idea.whyItSells,
            productFormat: idea.productFormat,
            monetizationScore: idea.monetizationScore,
          },
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Project created — opening Launch Wizard...");
      navigate(`/wizard/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create project");
    } finally {
      setBuildingIdeaIdx(null);
    }
  };

  const sendToWizard = () => {
    if (!brief) return;
    const recommended = (brief.ideas as OpportunityIdea[]).find(i => i.recommended);
    const idx = recommended
      ? (brief.ideas as OpportunityIdea[]).indexOf(recommended)
      : 0;
    const idea = (brief.ideas as OpportunityIdea[])[idx];
    buildFromIdea(idea, idx);
  };

  const quickReplies = researchMode === "trend_hijacking"
    ? [
        "Show me AI-related trends",
        "What's trending in the make-money-online space?",
        "Find trends in health and wellness",
        "What new tools or platforms are gaining traction?",
      ]
    : [
        "I help people with productivity",
        "I want to sell digital products online",
        "I have PLR products I want to monetize",
        "I'm interested in the AI/ChatGPT niche",
      ];

  const isTrendMode = researchMode === "trend_hijacking";

  return (
    <DashboardLayout title="Launch Research Agent">
      <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${isTrendMode ? "from-orange-500 to-red-500" : "from-primary to-accent"}`}>
            {isTrendMode ? <TrendingUp className="w-5 h-5 text-primary-foreground" /> : <Brain className="w-5 h-5 text-primary-foreground" />}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {isTrendMode ? "Trend Hijacking Mode" : "Launch Research Agent"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isTrendMode
                ? "Find profitable ideas from emerging trends before competitors launch"
                : "Discover profitable product ideas before you build"}
            </p>
          </div>
        </div>

        {/* Research Style Toggle */}
        {researchMode && !brief && (
          <div className="flex gap-2 flex-wrap mb-3">
            {RESEARCH_STYLES.map(s => (
              <Badge
                key={s.value}
                variant={researchStyle === s.value ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setResearchStyle(researchStyle === s.value ? null : s.value)}
              >
                {s.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {/* Mode Selection */}
          {!researchMode && messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center py-6">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="text-lg font-semibold mb-1">How do you want to research?</h2>
                <p className="text-sm text-muted-foreground">Choose a research mode and I'll guide you to a profitable idea.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RESEARCH_MODES.map(mode => (
                  <Card
                    key={mode.value}
                    className={`cursor-pointer hover:border-primary/50 transition-colors ${mode.value === "trend_hijacking" ? "sm:col-span-2 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-red-500/5" : ""}`}
                    onClick={() => selectMode(mode.value)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="text-2xl">{mode.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{mode.label}</h3>
                        <p className="text-xs text-muted-foreground">{mode.description}</p>
                      </div>
                      {mode.value === "trend_hijacking" && (
                        <Badge variant="outline" className="ml-auto text-[10px] border-orange-500/40 text-orange-400 shrink-0">NEW</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const displayText = isUser ? msg.content : stripJsonBlock(msg.content);
              if (!displayText) return null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {displayText}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {isTrendMode ? "Scanning trends..." : "Researching..."}
                </span>
              </div>
            </div>
          )}

          {/* Quick Replies */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((qr, i) => (
                <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => sendMessage(qr)}>
                  {qr}
                </Button>
              ))}
            </div>
          )}

          {/* Opportunity Brief */}
          {brief && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className={`border-primary/40 ${isTrendMode ? "bg-gradient-to-br from-orange-500/5 to-red-500/5" : "bg-gradient-to-br from-primary/5 to-accent/5"}`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    {isTrendMode ? <TrendingUp className="w-5 h-5 text-orange-400" /> : <Rocket className="w-5 h-5 text-primary" />}
                    <h3 className="font-bold text-lg">
                      {isTrendMode ? "Trend Intelligence Brief" : "Opportunity Brief"}
                    </h3>
                  </div>

                  {(brief.ideas as OpportunityIdea[]).map((idea, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${idea.recommended ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{idea.title}</h4>
                        {idea.recommended && <Badge className="text-xs">⭐ Recommended</Badge>}
                        <Badge variant="outline" className="text-xs ml-auto">{idea.monetizationScore}/100</Badge>
                      </div>

                      {/* Trend Velocity Meter */}
                      {idea.trendVelocity != null && (
                        <div className="mb-3">
                          <TrendVelocityMeter velocity={idea.trendVelocity} window={idea.marketWindow} />
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Audience:</strong> {idea.audience}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Format:</strong> {idea.productFormat}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Angle:</strong> {idea.suggestedAngle}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Mechanism:</strong> {idea.uniqueMechanism}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Why It Sells:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {idea.whyItSells.map((r, j) => <li key={j}>• {r}</li>)}
                        </ul>
                      </div>

                      {/* Build This Product button — all modes */}
                      <Button
                        size="sm"
                        variant={isTrendMode ? "outline" : "default"}
                        className={`mt-3 gap-1.5 text-xs ${isTrendMode ? "border-orange-500/40 text-orange-400 hover:bg-orange-500/10" : ""}`}
                        disabled={buildingIdeaIdx !== null}
                        onClick={() => buildFromIdea(idea, i)}
                      >
                        {buildingIdeaIdx === i ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Rocket className="w-3 h-3" />
                        )}
                        {isTrendMode ? "Steal This Trend" : "Build This Product"}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  <Button onClick={sendToWizard} variant="hero" className="w-full gap-2" disabled={buildingIdeaIdx !== null}>
                    {buildingIdeaIdx !== null ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4" />
                    )}
                    Launch Recommended Idea
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-end border-t pt-3">
          <Textarea
            placeholder={isTrendMode ? "Ask about specific trends or niches..." : "Type your message..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} size="icon" className="shrink-0 h-11 w-11">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
