import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Check, X,
  Zap, Target, Users, Brain,
  Package, Mail, Megaphone, FileText, BarChart3,
  ShieldCheck, Rocket, Eye, ChevronDown, Timer, MousePointerClick,
  Trophy, Bot, Monitor, Compass, MessageCircle, PenTool, Share2, Radar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const SectionDivider = () => (
  <div className="w-full flex justify-center py-4">
    <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
  </div>
);

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
};

const getProgressText = (pct: number) => {
  if (pct < 25) return "Meet Nova, your AI Launch Coach";
  if (pct < 50) return "See how Nova runs your launch";
  if (pct < 75) return "Watch a real project come together";
  return "You're almost there — grab your seat below";
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  const handleCTA = () => navigate(user ? "/dashboard" : "/auth?next=/coach");

  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      setScrollProgress(Math.min(pct, 100));
      setShowFloatingBar(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPricing = () => {
    const el = document.getElementById("pricing-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ===== SCROLL PROGRESS BAR ===== */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-secondary/30">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="bg-background/80 backdrop-blur-sm border-b border-border/30">
          <p className="text-[10px] text-muted-foreground text-center py-0.5 px-4 truncate">
            {getProgressText(scrollProgress)}
          </p>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-24">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,182,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,182,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Introducing Nova — your AI Launch Coach</span>
          </motion.div>

          <motion.p {...fadeIn} transition={{ delay: 0.05 }} className="text-sm md:text-base uppercase tracking-widest text-primary font-semibold mb-4">
            For creators who are done juggling tools, tabs, and blank pages
          </motion.p>

          <motion.h1 {...fadeIn} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text glow-text">Meet Nova.</span>
            <span className="text-foreground"> The AI launch manager who runs your digital product from idea to first sale.</span>
          </motion.h1>

          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            Nova gets to know you, plans your launch, does the work, and hands you clear decisions — not blank pages. You stay in the driver's seat. Nova handles everything in between.
          </motion.p>

          <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="flex flex-col items-center gap-1 mb-8">
            {[
              "Nova learns your business in an 8-minute conversation.",
              "Nova builds your product, copy, and funnel behind the scenes.",
              "You review one clear decision at a time — then ship.",
            ].map((line, i) => (
              <p key={i} className="text-base md:text-lg font-semibold text-foreground">{line}</p>
            ))}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <MessageCircle className="w-5 h-5" />
              Start Talking To Nova
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="flex flex-col items-center gap-2 mt-6 max-w-md mx-auto">
            {[
              "Persistent memory — Nova remembers your niche, voice, and offers",
              "One decision card at a time — no dashboards to decode",
              "25 free launch credits when you sign up — no card required",
              "Your existing Power Tools (funnels, emails, ads) still one click away",
            ].map((line, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                {line}
              </span>
            ))}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-14 max-w-3xl mx-auto">
            {[
              { icon: Compass, label: "Founder Profile" },
              { icon: Radar, label: "Opportunity" },
              { icon: Package, label: "Product Build" },
              { icon: Rocket, label: "Launch & Sell" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/30 border border-border/30">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium text-center">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW NOVA WORKS ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">How Nova Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Coach. A Team. A Finished Launch.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nova is the manager. Behind her is a specialist team that quietly handles research, product design, sales copy, funnels, emails, and affiliate assets — coordinated across every stage of your launch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MessageCircle, name: "Nova Coach", desc: "Your day-one guide. Learns your goals, voice, and constraints — then drives every decision." },
              { icon: Radar, name: "Opportunity Scout", desc: "Validates demand and scores product ideas before you spend a minute building." },
              { icon: Package, name: "Product Architect", desc: "Turns your idea into a real offer with structure, mechanism, and buyer promise." },
              { icon: PenTool, name: "Copy Writer", desc: "Drafts your sales page, opt-ins, and CTAs in a voice that actually sounds like you." },
              { icon: Mail, name: "Email Specialist", desc: "Writes launch sequences and follow-ups tuned to your audience." },
              { icon: Target, name: "Funnel Designer", desc: "Maps your funnel, upsells, and checkout so nothing leaks between steps." },
              { icon: Share2, name: "Content Creator", desc: "Generates viral hooks, short-form scripts, and social posts for launch week." },
              { icon: Brain, name: "Memory Engine", desc: "Remembers every conversation, brand, and project so Nova never asks twice." },
            ].map((agent, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-all group">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <agent.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{agent.name}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{agent.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} className="mt-10 text-center">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-foreground font-bold text-lg">Other tools hand you 10 blank editors.</p>
              <p className="gradient-text font-bold text-lg">Nova hands you one clear decision — with the work already done.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== STAGE MAP ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Your Launch, One Screen</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Nova Dashboard</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every project lives on an 8-stage launch map. You always know exactly where you are, what Nova is working on, and what decision is waiting for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              { icon: Compass, title: "8-Stage Launch Map", desc: "Founder Profile → Opportunity → Offer → Product → Copy → Funnel → Launch → Published. See progress at a glance." },
              { icon: MessageCircle, title: "One Decision Card", desc: "No sea of dashboards. Nova surfaces the single next question that actually moves your launch forward." },
              { icon: Brain, title: "Persistent Memory", desc: "Close the tab, come back tomorrow. Nova remembers your niche, tone, offers, and every choice you've made." },
              { icon: Zap, title: "Credits Meter", desc: "Simple, transparent credits. Start with 25 free. See exactly what each action costs before Nova spends them." },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.08 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Streaming Chat", desc: "Talk to Nova in real time" },
              { label: "Project Workspace", desc: "One space per launch" },
              { label: "Power Tools", desc: "50+ specialist tools on tap" },
              { label: "Voice-Ready", desc: "Voice mode arriving soon" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border/30 text-center">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== THE PROBLEM ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">Dear Fellow Digital Entrepreneur,</p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              How many times have you had a product idea — a genuinely good one — and then watched it die in a Google Doc graveyard because the launch itself felt like climbing Everest barefoot?
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You needed a sales page. Then an email sequence. Then ad copy. Then an affiliate page. Then a funnel. Then a checklist so you didn't miss anything. And somewhere in the middle of it all… you ran out of steam.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Or worse — you tried a stack of AI tools that each spat out a different piece, in a different voice, with no memory of what came before.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 font-medium text-foreground">
              Most digital products don't fail because the idea was bad. They fail because the creator never made it through the launch process.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-8">
            <p className="text-foreground font-semibold mb-2">You don't need another tool. You need someone running the launch.</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A manager who remembers your business, knows your voice, coordinates the work, and only comes to you when a real decision needs to be made.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="text-center">
            <p className="text-foreground font-semibold text-lg">That's Nova.</p>
            <p className="text-muted-foreground text-sm mt-2">The AI Launch Coach who works while you sleep and reports in the morning.</p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== FOUR STEPS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">The Nova Flow</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From Blank Page To Shipped Launch — In 4 Moves</h2>
            <p className="text-muted-foreground">You talk. Nova works. You decide. You ship.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", icon: MessageCircle, title: "Meet Nova", desc: "Answer 8 quick questions. Nova learns your niche, audience, voice, and goals — and never forgets them." },
              { step: "2", icon: MousePointerClick, title: "Kick Off A Project", desc: "Tell Nova what you want to launch. She scopes the plan, picks the right specialists, and gets to work." },
              { step: "3", icon: Bot, title: "Nova Does The Work", desc: "Product, copy, funnel, emails, social — all drafted by Nova's team in your voice, all stitched together." },
              { step: "4", icon: Rocket, title: "You Approve & Ship", desc: "Nova hands you one decision at a time. Approve, tweak, or ask her to try again. Then hit publish." },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden">
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{item.step}</span>
                  </div>
                  <CardContent className="p-6 pt-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== SEE IT IN ACTION ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Watch Nova Take A Real Idea To A Real Launch</h2>
            <p className="text-muted-foreground">Here's what a first session with Nova actually looks like.</p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "1", title: "Nova — Onboarding",
                label: "You say", inputText: '"I want to help beginners land local clients using AI."',
                outputTitle: "Nova replies",
                outputLines: [
                  "Locks in your niche + audience",
                  "Captures tone: friendly, direct, no fluff",
                  "Flags 2 offer angles worth exploring",
                  "Saves everything to your Founder Profile",
                ],
              },
              {
                step: "2", title: "Opportunity Scout — Validation",
                label: "Nova asks", inputText: "Should we validate before building?",
                outputTitle: "Result — Score: 92/100",
                outputLines: [
                  "Demand validated across 3 platforms",
                  "Competition gap identified",
                  'Mechanism: "AI Local Client Method"',
                  "Recommended price: $17-27 FE",
                ],
              },
              {
                step: "3", title: "Product Architect — Build", label: "", inputText: null, outputTitle: null, outputLines: [],
                customContent: (
                  <div className="p-5 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Decision Card From Nova</p>
                    <p className="text-foreground font-bold text-lg leading-snug mb-1">"I've drafted 'AI Local Lead Machine' — 7 chapters, 3 bonuses, quick-start guide."</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">Want me to keep going into copy, or would you like to adjust the outline first?</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-chart-2" />
                      <span className="text-[10px] text-chart-2 font-medium">One question. Two clear buttons. Zero blank pages.</span>
                    </div>
                  </div>
                ),
              },
              {
                step: "4", title: "Copy Writer — Sales Page", label: "", inputText: null, outputTitle: null, outputLines: [],
                customContent: (
                  <div className="p-5 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Nova-Drafted Sales Hook</p>
                    <p className="text-foreground font-bold text-lg leading-snug mb-1">You're Still Buying Courses?</p>
                    <p className="text-foreground font-bold text-lg leading-snug mb-1">Stop.</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">Start getting paid $500 this week helping local businesses generate leads with AI.</p>
                  </div>
                ),
              },
              {
                step: "5", title: "Nova — Ready To Ship",
                label: "Status", inputText: null,
                outputTitle: "Launch package built",
                outputLines: [
                  "Product, sales page, and 5-email sequence drafted",
                  "Funnel mapped, upsell + downsell in place",
                  "Affiliate JV page & swipes ready",
                  "One button left: Publish",
                ],
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                    </div>
                    {i < 4 && <div className="w-0.5 h-6 bg-primary/20 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{item.title}</p>
                    {(item as any).customContent ? (
                      (item as any).customContent
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.inputText && (
                          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                            <p className="text-xs text-muted-foreground font-medium mb-1">{item.label}</p>
                            <p className="text-sm font-semibold text-foreground">{item.inputText}</p>
                          </div>
                        )}
                        <div className={`p-4 rounded-xl bg-primary/5 border border-primary/20 ${!item.inputText ? "sm:col-span-2" : ""}`}>
                          {item.outputTitle && <p className="text-xs text-primary font-medium mb-2">{item.outputTitle}</p>}
                          <ul className="space-y-1">
                            {item.outputLines.map((line, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT NOBODY ADMITS ===== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2 {...fadeIn} className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Here's What Nobody In This Industry Wants To Admit...
          </motion.h2>
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The gurus selling $2,000 courses on "how to launch digital products" show you the funnel diagram, the email framework, the ad angles. Then they leave you alone with a blank screen and 30+ assets to generate from scratch.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4 font-medium text-foreground">And the AI "solutions" you've tried?</p>
            <div className="space-y-3 mb-8">
              {[
                "ChatGPT forgets your business every time you open a new tab",
                "Copy tools spit out disconnected pieces with no strategy behind them",
                "Funnel builders make you a pretty page but have no idea what to put on it",
                "None of them coordinate. None of them run your launch as a system.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground font-semibold text-center text-lg">Nova doesn't hand you 10 more editors. Nova runs the launch and hands you the decisions.</p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== INTRODUCING ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Introducing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text glow-text">PDF Empire AI + Nova</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              The AI Launch Coach that turns your idea into a shipped digital product.
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Not a chatbot. Not a copy generator. Not another funnel builder.
              Nova is a persistent AI manager — with memory, taste, and a specialist team behind her — who takes you from blank page to a published launch in a series of short conversations.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-10">
            {[
              "Nova learns your business once — and remembers it forever",
              "Coordinated team of AI specialists behind every decision",
              "One decision at a time — you always know what's next",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-left p-3 rounded-lg bg-secondary/30 border border-border/50">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT GETS BUILT ===== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Complete Launch Package</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Here's Everything Nova Builds With You</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Target, title: "Offer & Product",
                agent: "Product Architect",
                items: ["Product title, subtitle, and unique mechanism", "Full outline with chapters and modules", "Transformation promise and buyer avatar"],
              },
              {
                icon: FileText, title: "Sales Page & Funnel Copy",
                agent: "Copy Writer",
                items: ["Sales page — headline, bullets, proof, guarantee, CTA", "Upsell and downsell copy — OTO 1 and OTO 2", "Written in your voice, not corporate AI"],
              },
              {
                icon: Mail, title: "Email Launch Sequence",
                agent: "Email Specialist",
                items: ["5-email pre-launch and post-launch sequence", "Subject lines, body copy, and CTAs — human tone", "Storytelling hooks that feel personal"],
              },
              {
                icon: Megaphone, title: "Social & Ad Assets",
                agent: "Content Creator",
                items: ["Ad variations with viral hooks and CTAs", "Social media posts ready to schedule", "Short-form scripts for TikTok and Reels"],
              },
              {
                icon: Users, title: "Affiliate Kit",
                agent: "Affiliate Assistant",
                items: ["JV page copy with commission structure", "Affiliate email swipes ready to deploy", "Simple recruitment plan to attract partners"],
              },
              {
                icon: Monitor, title: "Nova Dashboard",
                agent: "Nova, coordinating everything",
                items: ["8-stage launch map with live progress", "One decision card at a time", "Credits meter and full project memory"],
              },
            ].map((section, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.08 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">{section.title}</h3>
                    </div>
                    <p className="text-[10px] text-primary/60 font-medium uppercase tracking-wider mb-3 ml-[52px]">Handled by {section.agent}</p>
                    <ul className="space-y-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== POWER TOOLS ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">For Power Users</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nova In Front. 50+ Power Tools Behind Her.</h2>
          </motion.div>
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most people never leave Nova — she's more than enough. But when you want to go deeper, the full PDF Empire toolkit is still there, one click away in Power Tools:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                "Launch Wizard, Empire Mode, Micro Factory",
                "Sales Copy Engine, Email Engine, Ad Lab",
                "Funnel Builder, Funnel Simulation, Clone Competitor",
                "Opportunity Radar, Genome Library, Analytics",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">
                Beginners get a coach. Power users get a coach <strong className="text-foreground">and</strong> a full arsenal. Nothing you already rely on has gone away.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT THIS REPLACES ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Nova Replaces</h2>
            <p className="text-muted-foreground">Here's what your launch stack used to look like — and what it looks like now.</p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <X className="w-5 h-5 text-destructive" />
                  Without Nova
                </h3>
                <ul className="space-y-3">
                  {[
                    "Weeks trying to write your product alone",
                    "$3,000+ paid to copywriters",
                    "A dozen tabs of AI tools with no memory",
                    "Writing emails, ads, and posts one by one",
                    "Guessing what will sell",
                    "No idea what to do next on any given day",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  With Nova
                </h3>
                <ul className="space-y-3">
                  {[
                    "A coach who remembers your business and voice",
                    "A specialist team drafting every asset for you",
                    "One conversation instead of a dozen tabs",
                    "Product, copy, funnel, and emails in your voice",
                    "Opportunity scored before you build",
                    "One clear decision waiting for you every day",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHO THIS IS FOR ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Is Nova For You?</h2>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> Yes, if…</h3>
                <ul className="space-y-3">
                  {[
                    "You have ideas but struggle to finish launches",
                    "You're tired of juggling AI tools that don't talk to each other",
                    "You want a coach that remembers you and your business",
                    "You'd rather approve decisions than draft from scratch",
                    "You want to ship your first (or next) product this week",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><X className="w-5 h-5 text-destructive" /> Not really, if…</h3>
                <ul className="space-y-3">
                  {[
                    "You want a magic button that requires zero input",
                    "You don't believe in digital products as a business model",
                    "You want to sell junk — Nova only helps you build real offers for real markets",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT MAKES IT DIFFERENT ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">What Makes Nova Different</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most AI tools are general-purpose chatbots. They forget your business the second you close the tab, and they treat every request like it's the first one.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Nova was built for <strong className="text-foreground">one thing: launching digital products end-to-end.</strong> She has persistent memory, a specialist team, a clear stage map, and taste that's tuned for the WarriorPlus / ClickBank / Gumroad / Etsy world.
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="text-foreground font-semibold">Other tools give you a blank prompt.</p>
              <p className="gradient-text font-bold text-lg mt-1">Nova gives you a coach who already knows you — and a launch already in motion.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== PRICING / VALUE STACK ===== */}
      <section id="pricing-section" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Get With Nova</h2>
            <p className="text-muted-foreground">Everything below is included from the first conversation.</p>
          </motion.div>

          <motion.div {...fadeIn} className="space-y-3 mb-10">
            {[
              { asset: "Nova — your AI Launch Coach with persistent memory", emoji: "🧭" },
              { asset: "Specialist team drafting product, copy, funnel, emails", emoji: "🤖" },
              { asset: "8-stage Launch Dashboard with live progress", emoji: "🎛️" },
              { asset: "Digital Product draft (ebook or guide)", emoji: "📚" },
              { asset: "Sales page written in your voice", emoji: "📄" },
              { asset: "Bonus stack (3+ bonuses)", emoji: "🎁" },
              { asset: "5-email launch sequence", emoji: "📧" },
              { asset: "Affiliate kit and JV page", emoji: "🤝" },
              { asset: "Ad copy and social posts for launch week", emoji: "📣" },
              { asset: "50+ Power Tools available on demand", emoji: "🛠️" },
              { asset: "25 launch credits to get you started free", emoji: "⚡" },
              { asset: "Every project saved, portable, and yours", emoji: "📦" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <span className="text-lg shrink-0">{item.emoji}</span>
                <span className="text-sm font-medium">{item.asset}</span>
              </div>
            ))}
          </motion.div>

          <motion.div {...fadeIn} className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8">
            <h3 className="text-lg font-bold text-center mb-2">What A Full Launch Normally Costs:</h3>
            <p className="text-center text-sm text-muted-foreground mb-6">Here's what you'd pay for each piece the old way…</p>
            <div className="space-y-2 mb-6">
              {[
                { item: "Product creation", value: "$297" },
                { item: "Sales page copy", value: "$197" },
                { item: "Email launch sequence", value: "$97" },
                { item: "Affiliate promo kit", value: "$97" },
                { item: "Funnel setup", value: "$197" },
                { item: "Launch consultant", value: "$500+" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/30">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {row.item}
                  </span>
                  <span className="text-sm text-muted-foreground font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-4xl font-black text-foreground line-through decoration-destructive/60">$1,385+</p>
              <p className="text-sm text-muted-foreground font-medium">Nova does it with you, in one conversation.</p>
              <p className="text-sm text-muted-foreground">Today:</p>
              <p className="text-5xl font-black gradient-text">$37</p>
              <p className="text-xs text-muted-foreground">Start free with 25 credits — no card required.</p>
            </div>
            <div className="text-center mt-6">
              <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
                <MessageCircle className="w-5 h-5" />
                Start Talking To Nova
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== GUARANTEE ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The "Launch Or It's Free" Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Talk to Nova. Let her plan your launch. Let her team do the work. If after using Nova you don't have a complete, ready-to-publish digital product launch — or if for any reason you're not satisfied — contact us within 30 days and we'll refund every penny. No questions. No hoops. No guilt trip.
            </p>
            <p className="text-foreground font-semibold">
              The only way you don't get results is if you never open the chat.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== INVESTMENT ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Here's What This Investment Looks Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Professional Copywriter", cost: "$3,000 – $10,000", time: "4–8 weeks" },
                { label: "Launch Consultant", cost: "$5,000 – $25,000", time: "Strategy only" },
                { label: "Funnel Builder", cost: "$1,500 – $5,000", time: "Before copy" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-destructive font-bold mt-1">{item.cost}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nova replaces all of that with a single AI coach who runs the whole launch with you.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Today, during this launch window, you can get access for a fraction of what a single freelancer would charge for a single asset.
            </p>
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <MessageCircle className="w-5 h-5" />
              Start Talking To Nova
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== FINAL WORD ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">A Final Word Before You Decide</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              There are two kinds of digital entrepreneurs.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The first kind spends the next six months doing what they've always done — wrestling with blank pages, juggling tools that don't remember them, half-finishing launches that never see the light of day.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The second kind opens a chat with Nova today, lets her plan and draft everything tonight, and wakes up tomorrow with a real launch ready to ship.
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center mb-8">
              <p className="text-foreground font-semibold">
                The knowledge in your head is worth real money to real people who need what you know.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The only thing standing between you and that first sale is a coach who won't let the launch stall. That's Nova.
              </p>
            </div>
            <div className="text-center">
              <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
                <Rocket className="w-5 h-5" />
                Yes — Let Me Meet Nova
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <motion.div {...fadeIn} className="space-y-3">
            <FAQItem
              q="Who — or what — is Nova?"
              a="Nova is your AI Launch Coach. She's the manager sitting on top of PDF Empire's specialist agents. Nova learns your business, plans your launch, coordinates the work behind the scenes, and only comes to you when a real decision is needed."
            />
            <FAQItem
              q="Do I need any technical skills to use this?"
              a="None. If you can hold a conversation, you can work with Nova. She asks questions in plain English, drafts everything for you, and shows you one decision at a time in the dashboard."
            />
            <FAQItem
              q="What kinds of products can Nova help me launch?"
              a="eBooks, video courses, membership sites, coaching programs, templates, planners, swipe files, affiliate guides — anything sold as a digital product on WarriorPlus, ClickBank, Gumroad, JVZoo, or Etsy."
            />
            <FAQItem
              q="How is Nova different from ChatGPT?"
              a="ChatGPT is a general chatbot that forgets you between sessions. Nova has persistent memory of your niche, voice, offers, and every project. She's tuned for one job — running digital product launches — and she coordinates a full specialist team behind every response."
            />
            <FAQItem
              q="What's the Launch Dashboard?"
              a="It's the home screen for every project. You see an 8-stage launch map (Founder Profile → Opportunity → Offer → Product → Copy → Funnel → Launch → Published), one clear decision card, and your credits meter. That's the whole interface — Nova handles the complexity underneath."
            />
            <FAQItem
              q="What are credits, and what do they cost?"
              a="Nova uses a simple credits system so you always know what an action costs before she runs it. You get 25 free credits on signup — enough to build a Founder Profile, kick off a project, and see Nova in action end-to-end."
            />
            <FAQItem
              q="Does Nova work for complete beginners?"
              a="Especially well. Beginners often get more out of Nova than experienced marketers, because she handles the parts that usually trip beginners up — writing copy, mapping funnels, structuring offers. You focus on your idea and your voice. Nova handles execution."
            />
            <FAQItem
              q="What happens to the Power Tools I already use?"
              a="Everything's still there — Launch Wizard, Empire Mode, Sales Copy Engine, Funnel Builder, and the rest. They now live under Power Tools in the sidebar, one click away whenever you or Nova needs them."
            />
            <FAQItem
              q="Is there a monthly fee?"
              a="Not at this launch price. Today's offer is a one-time payment for permanent access. When we move to standard pricing, it will be a recurring subscription. Lock in now and you're grandfathered in for life."
            />
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            PDF Empire AI
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/coach")} className="hover:text-foreground transition-colors">
              Nova Coach
            </button>
            <button onClick={() => navigate("/dashboard")} className="hover:text-foreground transition-colors">
              Dashboard
            </button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing
            </button>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 PDF Empire AI</p>
        </div>
      </footer>

      {/* ===== FLOATING BUY BAR ===== */}
      {showFloatingBar && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-primary/20 shadow-[0_-4px_30px_hsl(var(--primary)/0.15)]"
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground">Nova — Your AI Launch Coach</p>
              <p className="text-xs text-muted-foreground">One coach. One conversation. A shipped launch.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
              <span className="text-lg font-black gradient-text">$37</span>
              <Button variant="hero" size="sm" onClick={scrollToPricing} className="dual-glow">
                <MessageCircle className="w-4 h-4" />
                Meet Nova
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
