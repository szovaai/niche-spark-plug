import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Check, X,
  Wand2, Zap, Target, DollarSign, Users, Search, Brain,
  Package, Mail, Megaphone, FileText, ClipboardList, BarChart3,
  ShieldCheck, Key, Rocket, Eye, HelpCircle, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

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

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => navigate(user ? "/wizard" : "/auth");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
            <span className="text-sm text-muted-foreground">AI Launch Operating System</span>
          </motion.div>

          <motion.p {...fadeIn} transition={{ delay: 0.05 }} className="text-sm md:text-base uppercase tracking-widest text-primary font-semibold mb-4">
            Attention: Digital Product Creators, Course Sellers & Info Marketers
          </motion.p>

          <motion.h1 {...fadeIn} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-foreground">New AI System Builds Your Entire Digital Product Launch — </span>
            <span className="gradient-text glow-text">Sales Funnel, Email Sequence, Ad Copy, Affiliate Kit & Launch Checklist</span>
            <span className="text-foreground"> — In Under 60 Minutes.</span>
          </motion.h1>

          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            If you can type a niche and a rough idea into a text box, you already know everything you need to use it.
          </motion.p>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <Wand2 className="w-5 h-5" />
              Get Instant Access Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            {[
              { value: "30+", label: "Assets Generated" },
              { value: "< 60min", label: "Idea to Launch" },
              { value: "One Click", label: "Generate Everything" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section className="py-20 px-4">
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
                "Research takes days — combing through WarriorPlus, ClickBank, Reddit — just to find if your idea is worth building",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground font-semibold text-center text-lg">That ends today.</p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== INTRODUCING ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Introducing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text glow-text">DigiLaunchKit AI</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              The World's First AI Operating System Built Specifically for Launching Digital Products on WarriorPlus, ClickBank, Gumroad, JVZoo, and Etsy
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              It's not a copywriting tool. It's not a funnel builder. It's not a research tool.
              It's all three — working together as a single, guided launch system that takes you from blank-page panic to a fully-built, ready-to-sell digital product launch in under 60 minutes.
            </p>
          </motion.div>

          <motion.div {...fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-10">
            {[
              "AI asks 5 simple questions about your niche",
              "Generates 3 unique mechanisms for your offer",
              "Builds everything in one clean dashboard",
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
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Complete Launch Package</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Here's Everything DigiLaunchKit AI Builds For You</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Target,
                title: "Product Concept Engine",
                items: [
                  "AI-generated product title, subtitle, and unique mechanism",
                  "Full product outline with chapter/module structure",
                ],
              },
              {
                icon: FileText,
                title: "Sales Funnel Copy Library",
                items: [
                  "Complete sales page — headline, bullets, proof, guarantee, CTA",
                  "Upsell and downsell page copy — OTO 1, OTO 2",
                  "Thank you page copy and buyer onboarding sequence",
                ],
              },
              {
                icon: Mail,
                title: "Email Launch Sequence",
                items: [
                  "5-email pre-launch and post-launch sequence",
                  "Subject lines, body copy, and CTAs — written in your voice",
                ],
              },
              {
                icon: Megaphone,
                title: "Ad Copy & Social Assets",
                items: [
                  "5 Facebook/Instagram ad variations with hooks and CTAs",
                  "10 social media posts ready to schedule",
                  "Pinterest pin descriptions optimized for discovery",
                ],
              },
              {
                icon: Users,
                title: "Affiliate Kit Generator",
                items: [
                  "Complete JV page copy with commission structure and promo angles",
                  "Affiliate email swipes your partners can deploy in minutes",
                  "Bonus page headlines and promotional angles",
                ],
              },
              {
                icon: ClipboardList,
                title: "Launch Checklist",
                items: [
                  "Day-by-day launch timeline so nothing falls through the cracks",
                  "Pre-launch, launch day, and post-launch task sequence",
                ],
              },
            ].map((section, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.08 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">{section.title}</h3>
                    </div>
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
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Nobody Else Has This</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Steal This Launch</h2>
          </motion.div>
          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Paste any WarriorPlus, ClickBank, Gumroad, JVZoo, or Etsy product URL into DigiLaunchKit AI, click Analyze, and the AI will:
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
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Before You Even Have An Idea</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Launch Research Agent</h2>
            <p className="text-muted-foreground">
              Discover profitable product ideas before you build anything. Four research modes for four different situations:
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
            Stop building products nobody wants. Start building the products your market is already screaming for.
          </motion.p>
        </div>
      </section>

      <SectionDivider />

      {/* ===== LAUNCH SCORE ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Launch Score Advisor</h2>
            <p className="text-muted-foreground mb-6">Your AI Strategist On Demand</p>
          </motion.div>

          <motion.div {...fadeIn}>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Before you spend a single hour building, DigiLaunchKit's Launch Score Advisor analyzes your idea and scores it across four critical dimensions:
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: BarChart3, label: "Market Demand" },
                { icon: Search, label: "Competition Level" },
                { icon: DollarSign, label: "Monetization Potential" },
                { icon: Target, label: "Offer Strength" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <item.icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">
                Most people only discover their idea was weak <strong className="text-foreground">after</strong> they've spent three months building it. The Launch Score Advisor tells you in three minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== WHO IT'S FOR / NOT FOR ===== */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeIn} className="text-3xl md:text-4xl font-bold mb-10 text-center">Who This Is For (and Who It's Not)</motion.h2>

          <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> This IS For You If…</h3>
                <ul className="space-y-3">
                  {[
                    "Digital product creators who want to launch faster without sacrificing quality",
                    "Affiliate marketers who want to create their own products and stop sharing commissions",
                    "Coaches and consultants who want to productize expertise without hiring a $5,000 copywriter",
                    "Course creators tired of spending more time on the launch than the course itself",
                    "Complete beginners who have a good idea but no idea where to start",
                    "Experienced sellers who want to cut launch time from weeks to hours",
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
                    "You want to sell junk — DigiLaunchKit helps you build real offers for real markets",
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">What Makes This Different</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most AI tools are general-purpose. They were built to write emails, blog posts, and social media captions. When you try to use them for a digital product launch, you get disconnected, generic pieces that still require a skilled marketer to assemble.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              DigiLaunchKit AI was built from the ground up for <strong className="text-foreground">one thing: launching digital products.</strong> Every prompt, every framework, every output was engineered specifically for the WarriorPlus/ClickBank/Gumroad ecosystem.
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="text-foreground font-semibold">This is the difference between a Swiss Army knife and a scalpel.</p>
              <p className="text-sm text-muted-foreground mt-1">One does a lot of things adequately. The other does one thing perfectly.</p>
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
                "AI Tools & Automation — leverage AI courses",
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
              Connect your own OpenAI, Anthropic (Claude), or DeepSeek API keys and use DigiLaunchKit at your own cost structure, with no middleman markup.
            </p>
            <p className="text-sm text-muted-foreground">
              For power users and agencies, run at scale without worrying about platform limits. For everyone else, the app works out of the box with no API key required.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== EVERYTHING YOU GET ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Here's Everything You Get Today</h2>
          </motion.div>

          <motion.div {...fadeIn} className="space-y-3">
            {[
              "DigiLaunchKit AI Full Platform Access",
              "AI Launch Wizard — 5-step guided launch builder",
              "Complete Launch Asset Generation (30+ assets per launch)",
              "Sales Funnel Copy Library",
              "Email Sequence Generator (5 emails per launch)",
              "Ad Copy & Social Media Assets (15 assets per launch)",
              "Affiliate Kit Generator — JV page, swipes, angles",
              "Launch Checklist with Day-by-Day Timeline",
              "Steal This Launch — Competitive Intelligence Tool",
              "Launch Research Agent (4 research modes)",
              "Launch Score Advisor",
              "5 Pre-Built Launch Templates",
              "BYOK Support for DeepSeek, OpenAI, and Claude APIs",
              "Dashboard with Revenue Projector",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
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
              Use DigiLaunchKit AI. Run the Launch Wizard. Generate your assets. If after using this system you don't have a complete, ready-to-publish digital product launch in your hands — or if for any reason you're not satisfied — contact us within 30 days and we'll refund every penny. No questions. No hoops. No guilt trip.
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
            <p className="text-muted-foreground leading-relaxed mb-8">
              DigiLaunchKit AI replaces all of that. Today, during this launch window, you can get access for a one-time investment that is a fraction of what a single freelancer would charge for a single asset.
            </p>
            <Button variant="hero" size="xl" onClick={handleCTA} className="dual-glow">
              <Wand2 className="w-5 h-5" />
              Get Instant Access Now
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
              The second kind clicks a button today, runs the wizard tonight, and wakes up tomorrow with a complete, professional-grade digital product launch ready to upload to WarriorPlus before lunch.
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
                <Wand2 className="w-5 h-5" />
                Yes — Give Me Instant Access Now
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
              q="Do I need any technical skills to use DigiLaunchKit AI?"
              a="None. If you can type and click a mouse, you can use DigiLaunchKit. The entire system is guided — it tells you what to enter at every step."
            />
            <FAQItem
              q="What kind of products can I launch with this?"
              a="eBooks, video courses, membership sites, coaching programs, software tools, templates, planners, swipe files, affiliate marketing guides — anything sold as a digital product on WarriorPlus, ClickBank, Gumroad, JVZoo, or Etsy."
            />
            <FAQItem
              q="Does this actually work for complete beginners?"
              a="Yes. In fact, beginners often get more from DigiLaunchKit than experienced marketers because they haven't spent years building bad habits. The system guides you through every decision."
            />
            <FAQItem
              q="What if my niche isn't covered in the templates?"
              a="The templates are starting points, not limitations. The AI Launch Wizard works for any niche — you enter your own topic and audience, and the system builds around your specific market."
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
            DigiLaunchKit AI
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/wizard")} className="hover:text-foreground transition-colors">
              Launch Wizard
            </button>
            <button onClick={() => navigate("/steal")} className="hover:text-foreground transition-colors">
              Steal a Launch
            </button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing
            </button>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 DigiLaunchKit AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
