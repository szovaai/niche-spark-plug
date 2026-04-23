import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Check, X,
  Wand2, Zap, Target, DollarSign, Users, Search, Brain,
  Package, Mail, Megaphone, FileText, ClipboardList, BarChart3,
  ShieldCheck, Key, Rocket, Eye, HelpCircle, ChevronDown, Timer, Upload, MousePointerClick,
  Play, Trophy, Bot, Monitor, Activity, Gauge, PenTool, Share2, Radar
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
  if (pct < 25) return "Discover how PDF Empire AI works";
  if (pct < 50) return "Meet your AI launch team";
  if (pct < 75) return "See the Command Center in action";
  return "You're almost there — see the launch price below";
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  const handleCTA = () => navigate(user ? "/command-center" : "/auth");

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
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">10 AI Agents. One Launch System.</span>
          </motion.div>

          <motion.p {...fadeIn} transition={{ delay: 0.05 }} className="text-sm md:text-base uppercase tracking-widest text-primary font-semibold mb-4">
            Attention: Digital Product Creators, Course Sellers & Info Marketers
          </motion.p>

          <motion.h1 {...fadeIn} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text glow-text">Your Own AI Launch Team</span>
            <span className="text-foreground"> — Building, Optimizing & Deploying Your Products 24/7</span>
          </motion.h1>

          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            PDF Empire AI deploys 10 specialized AI agents that research your market, build your product, write your sales copy, design your funnel, generate your emails, and launch your business — all from one Command Center.
          </motion.p>

          <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="flex flex-col items-center gap-1 mb-8">
            {["Your AI team finds the opportunity.", "Your AI team builds the product.", "Your AI team launches the business."].map((line, i) => (
              <p key={i} className="text-base md:text-lg font-semibold text-foreground">{line}</p>
            ))}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <Rocket className="w-5 h-5" />
              Activate Your AI Launch Team
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="flex flex-col items-center gap-2 mt-6 max-w-md mx-auto">
            {[
              "10 AI agents working on your launch simultaneously",
              "Full Command Center with real-time launch health",
              "Deploy a complete product launch in under 60 minutes",
              "Built for WarriorPlus, Gumroad, ClickBank & Etsy",
            ].map((line, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                {line}
              </span>
            ))}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-14 max-w-3xl mx-auto">
            {[
              { icon: Radar, label: "Opportunity Agent" },
              { icon: Package, label: "Product Architect" },
              { icon: PenTool, label: "Copy Architect" },
              { icon: Target, label: "Funnel Architect" },
              { icon: BarChart3, label: "Simulation Agent" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/30 border border-border/30">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium text-center">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== THE AI AGENT TEAM ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Meet Your AI Launch Team</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">10 Specialized Agents Working On Your Launch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Each agent has one job. Together, they replace an entire marketing department. They analyze your project, identify weaknesses, and make specific recommendations — automatically.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Radar, name: "Opportunity Agent", desc: "Finds profitable niches and scores product ideas 0-100 before you build anything." },
              { icon: Package, name: "Product Architect", desc: "Designs your product structure, modules, transformation promise, and unique mechanism." },
              { icon: Sparkles, name: "Asset Builder", desc: "Generates checklists, worksheets, scripts, templates, and bonus materials." },
              { icon: PenTool, name: "Copy Architect", desc: "Writes sales headlines, offer stacks, persuasive pages, and call-to-action sections." },
              { icon: Mail, name: "Email Agent", desc: "Creates launch sequences, subject lines, storytelling emails, and follow-ups." },
              { icon: Share2, name: "Viral Content Agent", desc: "Generates viral hooks, short-form scripts, threads, and social posts." },
              { icon: Target, name: "Funnel Architect", desc: "Designs funnel structures, upsells, downsells, and checkout optimizations." },
              { icon: BarChart3, name: "Simulation Agent", desc: "Predicts conversions, revenue, and identifies weak funnel points." },
              { icon: Users, name: "Affiliate Agent", desc: "Predicts EPC, suggests commissions, and generates affiliate swipe copy." },
              { icon: Brain, name: "Learning Agent", desc: "Tracks winning patterns and recommends optimized launch blueprints over time." },
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
              <p className="text-foreground font-bold text-lg">Most AI tools give you a chatbot.</p>
              <p className="gradient-text font-bold text-lg">PDF Empire AI gives you a team.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== COMMAND CENTER ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Mission Control</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Launch Command Center</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every project lives inside a real-time Command Center. You see exactly where your launch stands — what's strong, what's weak, and what to do next.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              { icon: Gauge, title: "Launch Health Gauge", desc: "A real-time speedometer showing your overall launch readiness — offer quality, funnel strength, traffic readiness, and copy power. Push your score higher and watch your projected revenue climb." },
              { icon: Activity, title: "System Status Indicators", desc: "Green, yellow, or red signals for every major system — Offer Strength, Sales Copy, Funnel Structure, and Traffic Plan. Instantly see what needs attention." },
              { icon: BarChart3, title: "Revenue Forecast Panel", desc: "Conservative, moderate, and optimistic projections based on your actual price, funnel data, and conversion benchmarks. No guessing. Real numbers." },
              { icon: Target, title: "Visual Funnel Map", desc: "See your entire funnel — Traffic → Opt-in → Sales Page → Checkout → Upsell → Thank You — with predicted conversion rates at each step." },
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
              { label: "7-Day Timeline", desc: "Day-by-day launch roadmap" },
              { label: "Deploy Button", desc: "One-click launch deployment" },
              { label: "AI Advisor Panel", desc: "Real-time agent suggestions" },
              { label: "Keyboard Shortcuts", desc: "Power-user navigation" },
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
              How many times have you had a product idea — a genuinely good one — and then watched it die a slow death in a Google Doc graveyard because the launch itself felt like climbing Everest barefoot?
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You needed a sales page. Then an email sequence. Then ad copy. Then an affiliate page so JV partners would actually promote the thing. Then a funnel. Then a checklist so you didn't miss anything. And somewhere in the middle of all that… you ran out of steam.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Or worse — you paid a copywriter $3,000, waited six weeks, got back copy that sounded like a robot wrote it, and still had to rewrite half of it yourself.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 font-medium text-foreground">
              Most digital products don't fail because the idea was bad. They fail because the creator never made it through the launch process.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-8">
            <p className="text-foreground font-semibold mb-2">The gap between "great idea" and "money in the bank" isn't talent.</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              It's the sheer volume of moving parts standing between you and your first sale — and the brutal reality that most of us were never taught how to build a launch system from scratch.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="text-center">
            <p className="text-foreground font-semibold text-lg">What if you had an entire AI team handling every part of the launch?</p>
            <p className="text-muted-foreground text-sm mt-2">That's exactly what PDF Empire AI does.</p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== HOW THE AGENTS WORK ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your AI Team Builds Everything In 4 Steps</h2>
            <p className="text-muted-foreground">No experience needed. No writing required. Your agents do the work.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", icon: MousePointerClick, title: "Brief Your Agents", desc: "Tell PDF Empire AI your niche and audience. The Opportunity Agent scores your idea and validates demand before you build." },
              { step: "2", icon: Bot, title: "Agents Build Everything", desc: "Product Architect designs your offer. Copy Architect writes your sales page. Email Agent creates your sequence. All simultaneously." },
              { step: "3", icon: Monitor, title: "Review In Command Center", desc: "See every asset, metric, and agent recommendation in your real-time Command Center. Fix weaknesses with one click." },
              { step: "4", icon: Rocket, title: "Deploy & Sell", desc: "Hit Deploy Launch. Watch the animation sequence. Your product, funnel, emails, and affiliate kit go live." },
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Watch Your AI Team Build A Complete Launch</h2>
            <p className="text-muted-foreground">Here's what happens when you activate your agents on a real project.</p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "1", title: "Opportunity Agent — Research",
                label: "Input", inputText: '"AI Local Lead Generation"',
                outputTitle: "Agent Output — Score: 92/100",
                outputLines: ["Demand validated across 3 platforms", "Competition gap identified", 'Mechanism: "AI Local Client Method"', "Recommended price: $17-27 FE"],
              },
              {
                step: "2", title: "Product Architect — Build",
                label: "Agent builds", inputText: "AI Local Lead Machine",
                outputTitle: "Complete Digital Product",
                outputLines: ["7 chapters with examples & action steps", "3 bonus worksheets generated", "Outreach scripts & templates", "Cheat sheets & quick-start guide"],
              },
              {
                step: "3", title: "Copy Architect — Sales Funnel", label: "", inputText: null, outputTitle: null, outputLines: [],
                customContent: (
                  <div className="p-5 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Agent-Generated Sales Page Hook</p>
                    <p className="text-foreground font-bold text-lg leading-snug mb-1">You're Still Buying Courses?</p>
                    <p className="text-foreground font-bold text-lg leading-snug mb-1">Stop.</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">Start Getting Paid $500 This Week Helping Local Businesses Generate Leads With AI.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-chart-2" />
                      <span className="text-[10px] text-chart-2 font-medium">Copy Score: 87/100 — Ready to deploy</span>
                    </div>
                  </div>
                ),
              },
              {
                step: "4", title: "Email Agent — Launch Sequence", label: "", inputText: null, outputTitle: null, outputLines: [],
                customContent: (
                  <div className="p-5 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Agent-Generated Launch Email #1</p>
                    <p className="text-foreground font-semibold mb-2">Subject: Make $500 This Week?</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">Local businesses are desperate for leads. Now beginners are getting paid to help them using simple AI tools…</p>
                  </div>
                ),
              },
              {
                step: "5", title: "Command Center — Deploy",
                label: "All Agents Complete", inputText: null,
                outputTitle: "Ready To Deploy",
                outputLines: ["Launch Score: 86/100", "Sales page & opt-in page ready", "5-email sequence generated", "Affiliate kit & JV page built", "Funnel Architect: all nodes green", "Simulation Agent: $918 projected revenue"],
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
              The gurus selling you $2,000 courses on "how to launch digital products" show you the funnel diagram, the email framework, the ad angles. But they leave you alone with a blank screen, a blinking cursor, and the crushing pressure of generating 30+ individual assets from scratch.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4 font-medium text-foreground">And the AI "solutions" you've tried?</p>
            <div className="space-y-3 mb-8">
              {[
                "ChatGPT gives you generic drivel that sounds like a corporate press release",
                'Other "AI copywriting tools" spit out disconnected pieces with no strategy behind them',
                "Funnel builders make you a pretty page but have no idea what to put on it",
                "None of them coordinate. None of them think about your launch as a system.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground font-semibold text-center text-lg">PDF Empire AI doesn't give you a chatbot. It gives you a coordinated team of specialists.</p>
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
              <span className="gradient-text glow-text">PDF Empire AI</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              The World's First AI Launch Operating System With A Built-In Agent Team
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              It's not a copywriting tool. It's not a funnel builder. It's not a research tool.
              It's an entire AI-powered launch department — 10 agents, one Command Center, complete launch automation — that takes you from blank-page panic to a fully-built, deployed digital product launch in under 60 minutes.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-10">
            {[
              "Opportunity Agent scores your idea before you build",
              "10 agents coordinate across every launch asset",
              "Command Center shows real-time launch health",
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Here's Everything Your AI Team Builds For You</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Target, title: "Product Concept Engine",
                agent: "Product Architect Agent",
                items: ["AI-generated product title, subtitle, and unique mechanism", "Full product outline with chapter/module structure", "Transformation promise and buyer avatar"],
              },
              {
                icon: FileText, title: "Sales Funnel Copy Library",
                agent: "Copy Architect Agent",
                items: ["Complete sales page — headline, bullets, proof, guarantee, CTA", "Upsell and downsell page copy — OTO 1, OTO 2", "Copy Score grading with specific improvement suggestions"],
              },
              {
                icon: Mail, title: "Email Launch Sequence",
                agent: "Email Campaign Agent",
                items: ["5-email pre-launch and post-launch sequence", "Subject lines, body copy, and CTAs — written in human tone", "Storytelling hooks that feel personal, not automated"],
              },
              {
                icon: Megaphone, title: "Social & Ad Assets",
                agent: "Viral Content Agent",
                items: ["5 ad variations with viral hooks and CTAs", "10 social media posts ready to schedule", "Short-form scripts for TikTok and Reels"],
              },
              {
                icon: Users, title: "Affiliate Kit",
                agent: "Affiliate Agent",
                items: ["JV page copy with predicted EPC and commission structure", "Affiliate email swipes your partners can deploy in minutes", "Affiliate Profit Score to attract top promoters"],
              },
              {
                icon: Monitor, title: "Command Center",
                agent: "All 10 Agents",
                items: ["Real-time Launch Health Gauge", "Revenue forecast with 3 scenarios", "System status indicators and next actions"],
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
                    <p className="text-[10px] text-primary/60 font-medium uppercase tracking-wider mb-3 ml-[52px]">Powered by {section.agent}</p>
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

      {/* ===== STEAL THIS LAUNCH ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Competitive Intelligence</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Steal This Launch</h2>
          </motion.div>
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Paste any WarriorPlus, ClickBank, Gumroad, or Etsy product URL into PDF Empire AI. Your agents will:
            </p>
            <div className="space-y-3 mb-6">
              {[
                "Reverse-engineer the entire launch strategy — offer angle, mechanism, price, funnel structure",
                "Identify the gaps and weaknesses in their approach",
                "Build you a superior, differentiated counter-launch — same market, better positioning",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">
                This isn't copying. This is competitive intelligence at a level that used to require hiring a $500/hour consultant and waiting two weeks for a report. <strong className="text-foreground">Now it takes 90 seconds.</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== RESEARCH AGENT ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Before You Even Have An Idea</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Opportunity Agent + Research Hub</h2>
            <p className="text-muted-foreground">
              Your Opportunity Agent doesn't wait for you to guess. It actively discovers profitable product ideas using four research modes:
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { title: "Pain Point Discovery", desc: "Find real audience frustrations and turn them into product ideas with built-in demand" },
              { title: "Demand-Led Research", desc: "Discover what's already selling so you can build a better version, not a blind guess" },
              { title: "Competitor Gap Analysis", desc: "Find the holes in competitors' products that customers are complaining about" },
              { title: "Asset-First Research", desc: "Already have knowledge or content? Find the fastest path to monetizing what you have" },
            ].map((mode, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-1 text-sm">{mode.title}</h3>
                  <p className="text-xs text-muted-foreground">{mode.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.p {...fadeIn} className="text-center text-foreground font-semibold">
            Stop building products nobody wants. Let your Opportunity Agent find what the market is already screaming for.
          </motion.p>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHAT THIS REPLACES ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What This Replaces</h2>
            <p className="text-muted-foreground">See why creators are switching to PDF Empire AI.</p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <X className="w-5 h-5 text-destructive" />
                  Without PDF Empire AI
                </h3>
                <ul className="space-y-3">
                  {[
                    "Weeks creating your product alone",
                    "Hiring copywriters ($3,000+)",
                    "Building funnels from scratch",
                    "Writing emails one by one",
                    "Guessing what will sell",
                    "No idea if your offer is strong",
                    "Zero coordination between assets",
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
                  With Your AI Launch Team
                </h3>
                <ul className="space-y-3">
                  {[
                    "10 agents build everything simultaneously",
                    "Command Center shows real-time launch health",
                    "Opportunity Agent validates before you build",
                    "Copy Architect writes and scores your sales page",
                    "Simulation Agent predicts your revenue",
                    "Affiliate Agent optimizes your JV program",
                    "Deploy your entire launch with one button",
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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Is This For You?</h2>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> This is For You If…</h3>
                <ul className="space-y-3">
                  {[
                    "You have ideas but struggle to finish launches",
                    "You're tired of juggling 10 different tools",
                    "You want AI that coordinates, not just generates",
                    "You want a system that tells you what's weak and fixes it",
                    "You want to launch your first (or next) product this week",
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
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><X className="w-5 h-5 text-destructive" /> This is NOT For You If…</h3>
                <ul className="space-y-3">
                  {[
                    "You're looking for a magic button that requires zero effort",
                    "You don't believe in digital products as a business model",
                    "You want to sell junk — PDF Empire AI helps you build real offers for real markets",
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
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">What Makes This Different</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most AI tools are general-purpose chatbots. When you try to use them for a digital product launch, you get disconnected, generic pieces that still require a skilled marketer to assemble.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              PDF Empire AI was built from the ground up for <strong className="text-foreground">one thing: launching digital products.</strong> Every agent, every prompt, every framework was engineered specifically for the WarriorPlus/ClickBank/Gumroad ecosystem.
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="text-foreground font-semibold">Other tools give you a chatbot.</p>
              <p className="gradient-text font-bold text-lg mt-1">PDF Empire AI gives you a coordinated launch team with a Command Center.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== FULL PLATFORM ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Complete Platform</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">The Full PDF Empire AI Platform</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
              {[
                "Launch Command Center",
                "AI Agent Hub (10 agents)",
                "Opportunity Radar",
                "Product Builder",
                "Sales Copy Engine",
                "Email Engine",
                "Social Content Generator",
                "Funnel Builder & Simulation",
                "Affiliate Center",
                "Traffic Planner",
                "Analytics Dashboard",
                "Keyboard shortcuts & glass UI",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== TEMPLATES + BYOK ===== */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeIn}>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Pre-Built Launch Templates</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Not sure what niche to start in? Five templates ready to customize and deploy:</p>
            <ul className="space-y-2">
              {[
                "Affiliate Marketing — passive income guides",
                "AI Tools & Automation — AI courses and kits",
                "Fitness & Wellness — 30-day transformation programs",
                "Productivity Systems — second brain products",
                "Side Hustle Blueprint — 2026 economy guides",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeIn}>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">BYOK: Control Your AI Costs</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your own OpenAI, Anthropic (Claude), or DeepSeek API keys and use PDF Empire AI at your own cost structure, with no middleman markup.
            </p>
            <p className="text-sm text-muted-foreground">
              For power users and agencies, run at scale without worrying about platform limits. For everyone else, the app works out of the box with no API key required.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== PRICING / VALUE STACK ===== */}
      <section id="pricing-section" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Your AI Launch Team Delivers</h2>
            <p className="text-muted-foreground">In about 60 minutes, your entire launch is ready.</p>
          </motion.div>

          <motion.div {...fadeIn} className="space-y-3 mb-10">
            {[
              { asset: "10 AI Agents working on your launch", emoji: "🤖" },
              { asset: "Launch Command Center with real-time health", emoji: "🎛️" },
              { asset: "Digital Product (ebook or guide)", emoji: "📚" },
              { asset: "High-Converting Sales Page (scored 0-100)", emoji: "📄" },
              { asset: "Bonus Stack (3+ bonuses)", emoji: "🎁" },
              { asset: "5-Email Launch Sequence", emoji: "📧" },
              { asset: "Affiliate Promo Kit & JV Page", emoji: "🤝" },
              { asset: "Revenue Forecast & Simulation", emoji: "📊" },
              { asset: "Ad Copy & Social Media Posts", emoji: "📣" },
              { asset: "Day-by-Day Launch Timeline", emoji: "📅" },
              { asset: "Complete Launch-In-A-Box ZIP", emoji: "📦" },
              { asset: "Deployable Funnel Website", emoji: "🌐" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <span className="text-lg shrink-0">{item.emoji}</span>
                <span className="text-sm font-medium">{item.asset}</span>
              </div>
            ))}
          </motion.div>

          <motion.div {...fadeIn} className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8">
            <h3 className="text-lg font-bold text-center mb-2">Typical Cost Of Building A Product Launch:</h3>
            <p className="text-center text-sm text-muted-foreground mb-6">Here's what you'd normally pay for each piece…</p>
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
              <p className="text-sm text-muted-foreground font-medium">PDF Empire AI's agent team does it automatically.</p>
              <p className="text-sm text-muted-foreground">Today:</p>
              <p className="text-5xl font-black gradient-text">$37</p>
            </div>
            <div className="text-center mt-6">
              <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
                <Bot className="w-5 h-5" />
                Activate Your AI Launch Team
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
              Use PDF Empire AI. Activate your agents. Let them build your launch. If after using this system you don't have a complete, ready-to-publish digital product launch in your hands — or if for any reason you're not satisfied — contact us within 30 days and we'll refund every penny. No questions. No hoops. No guilt trip.
            </p>
            <p className="text-foreground font-semibold">
              The only way you don't get results is if you don't use it.
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
              PDF Empire AI replaces all of that with a team of 10 AI agents and a real-time Command Center.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Today, during this launch window, you can get access for a one-time investment that is a fraction of what a single freelancer would charge for a single asset.
            </p>
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <Bot className="w-5 h-5" />
              Activate Your AI Launch Team
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
              The first kind spends the next six months doing what they've always done — wrestling with blank pages, paying for tools that don't talk to each other, half-finishing launches that never see the light of day.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The second kind activates their AI launch team today, lets the agents build everything tonight, and wakes up tomorrow with a complete, professional-grade digital product launch ready to upload to WarriorPlus before lunch.
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center mb-8">
              <p className="text-foreground font-semibold">
                The information in your head right now is worth real money to real people who desperately need what you know.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The only thing standing between you and that first sale is a launch system that works. You're looking at it.
              </p>
            </div>
            <div className="text-center">
              <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
                <Rocket className="w-5 h-5" />
                Yes — Activate My AI Launch Team Now
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
              q="What are the AI agents exactly?"
              a="They're 10 specialized AI systems built into the platform — each one handles a different part of your launch. The Opportunity Agent finds ideas. The Product Architect builds your product. The Copy Architect writes your sales page. They all coordinate through the Command Center so nothing falls through the cracks."
            />
            <FAQItem
              q="Do I need any technical skills to use PDF Empire AI?"
              a="None. If you can type and click a mouse, you can use PDF Empire AI. The agents do the work — you review and approve in the Command Center."
            />
            <FAQItem
              q="What kind of products can I launch with this?"
              a="eBooks, video courses, membership sites, coaching programs, software tools, templates, planners, swipe files, affiliate marketing guides — anything sold as a digital product on WarriorPlus, ClickBank, Gumroad, JVZoo, or Etsy."
            />
            <FAQItem
              q="How is this different from ChatGPT or other AI tools?"
              a="ChatGPT is a general-purpose chatbot. PDF Empire AI is a coordinated team of 10 specialized agents with a Command Center. Each agent has a specific job — research, product design, copywriting, funnel architecture, simulation, affiliate optimization. They work together on your project simultaneously. That's the difference between a Swiss Army knife and a launch department."
            />
            <FAQItem
              q="What's the Command Center?"
              a="It's your mission control dashboard. It shows your Launch Health Score, revenue projections, funnel map, system status indicators, AI agent recommendations, and a 7-day launch timeline. Every project has one."
            />
            <FAQItem
              q="Does this actually work for complete beginners?"
              a="Yes. In fact, beginners often get more from PDF Empire AI than experienced marketers because the agents handle the parts that trip beginners up — writing copy, building funnels, structuring offers. You focus on your idea. They handle the execution."
            />
            <FAQItem
              q="Is there a monthly fee?"
              a="Not at this launch price. Today's offer is a one-time payment for permanent access. When we move to our standard pricing model, it will be a recurring subscription. Lock in now and you're grandfathered in for life."
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
            <button onClick={() => navigate("/command-center")} className="hover:text-foreground transition-colors">
              Command Center
            </button>
            <button onClick={() => navigate("/agent-hub")} className="hover:text-foreground transition-colors">
              AI Agents
            </button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing
            </button>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 PDF Empire AI</p>
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
              <p className="text-sm font-bold text-foreground">PDF Empire AI</p>
              <p className="text-xs text-muted-foreground">10 AI Agents. One Command Center. Complete Launch System.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
              <span className="text-lg font-black gradient-text">$37</span>
              <Button variant="hero" size="sm" onClick={scrollToPricing} className="dual-glow">
                <Bot className="w-4 h-4" />
                Activate AI Team
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
