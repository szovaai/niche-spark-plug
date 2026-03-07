import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Rocket, Brain, ArrowRight, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResearchMessage, OpportunityBrief, ResearchMode, ResearchStyle } from "@/types/researchAgent";
import { RESEARCH_MODES, RESEARCH_STYLES } from "@/types/researchAgent";

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

export default function ResearchAgent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [researchMode, setResearchMode] = useState<ResearchMode | null>(null);
  const [researchStyle, setResearchStyle] = useState<ResearchStyle | null>(null);
  const [brief, setBrief] = useState<OpportunityBrief | null>(null);
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
    sendMessage(`I want to research using ${modeLabel}. Let's find a profitable product idea.`);
  };

  const sendToWizard = (idea?: OpportunityBrief) => {
    const b = idea || brief;
    if (!b) return;
    const recommended = b.ideas.find(i => i.recommended) || b.ideas[0];
    const params = new URLSearchParams({
      niche: b.niche || recommended?.title || "",
      audience: b.targetAudience || recommended?.audience || "",
      topic: b.topic || recommended?.suggestedAngle || "",
    });
    if (recommended?.uniqueMechanism) {
      params.set("mechanism", recommended.uniqueMechanism);
    }
    if (b.productType) {
      params.set("productType", b.productType);
    }
    navigate(`/wizard?${params.toString()}`);
  };

  const quickReplies = [
    "I help people with productivity",
    "I want to sell on WarriorPlus",
    "I have PLR products I want to monetize",
    "I'm interested in the AI/ChatGPT niche",
  ];

  return (
    <DashboardLayout title="Launch Research Agent">
      <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Launch Research Agent</h1>
            <p className="text-sm text-muted-foreground">Discover profitable product ideas before you build</p>
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
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => selectMode(mode.value)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="text-2xl">{mode.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{mode.label}</h3>
                        <p className="text-xs text-muted-foreground">{mode.description}</p>
                      </div>
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
                <span className="text-sm text-muted-foreground">Researching...</span>
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
              <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Opportunity Brief</h3>
                  </div>

                  {brief.ideas.map((idea, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${idea.recommended ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{idea.title}</h4>
                        {idea.recommended && <Badge className="text-xs">⭐ Recommended</Badge>}
                        <Badge variant="outline" className="text-xs ml-auto">{idea.monetizationScore}/100</Badge>
                      </div>
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
                    </div>
                  ))}

                  <Button onClick={() => sendToWizard()} variant="hero" className="w-full gap-2">
                    <Rocket className="w-4 h-4" />
                    Send to Launch Wizard
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
            placeholder="Type your message..."
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
