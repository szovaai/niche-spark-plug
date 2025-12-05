import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Store, ShoppingBag, Palette, FileText, Calculator, Zap, Search, ArrowRight, Check } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (preferences: { platform: string; interests: string[] }) => void;
  onSkip: () => void;
}

const platforms = [
  { id: "etsy", label: "Etsy", icon: Store, description: "Handmade & vintage marketplace" },
  { id: "shopify", label: "Shopify", icon: ShoppingBag, description: "Your own online store" },
  { id: "both", label: "Both", icon: Sparkles, description: "Sell everywhere" },
];

const productTypes = [
  { id: "printables", label: "Printables", icon: FileText },
  { id: "planners", label: "Planners", icon: Calculator },
  { id: "art", label: "Digital Art", icon: Palette },
  { id: "templates", label: "Templates", icon: FileText },
];

const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    onComplete({ platform, interests });
  };

  const steps = [
    // Step 0: Welcome
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-primary-foreground" />
      </div>
      <h2 className="text-3xl font-bold text-foreground">Welcome to DigiStream!</h2>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        Let's find your first profitable digital product in under 60 minutes.
      </p>
      <Button size="lg" onClick={() => setStep(1)} className="gap-2">
        Let's Go <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>,

    // Step 1: Platform Preference
    <motion.div
      key="platform"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Where do you want to sell?</h2>
        <p className="text-muted-foreground mt-2">We'll tailor recommendations to your platform</p>
      </div>
      <div className="grid gap-3">
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
              platform === p.id 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50 bg-card"
            }`}
          >
            <div className={`p-3 rounded-lg ${platform === p.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <p.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{p.label}</div>
              <div className="text-sm text-muted-foreground">{p.description}</div>
            </div>
            {platform === p.id && <Check className="w-5 h-5 text-primary ml-auto" />}
          </button>
        ))}
      </div>
      <Button 
        size="lg" 
        onClick={() => setStep(2)} 
        disabled={!platform}
        className="w-full gap-2"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>,

    // Step 2: Product Interests
    <motion.div
      key="interests"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">What interests you?</h2>
        <p className="text-muted-foreground mt-2">Select all that apply (or skip)</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {productTypes.map(p => (
          <button
            key={p.id}
            onClick={() => toggleInterest(p.id)}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              interests.includes(p.id) 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50 bg-card"
            }`}
          >
            <p.icon className={`w-6 h-6 ${interests.includes(p.id) ? "text-primary" : "text-muted-foreground"}`} />
            <span className="font-medium text-foreground">{p.label}</span>
          </button>
        ))}
      </div>
      <Button size="lg" onClick={() => setStep(3)} className="w-full gap-2">
        Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>,

    // Step 3: Mini Tutorial
    <motion.div
      key="tutorial"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Here's how DigiStream works</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Launchability Score™</div>
            <div className="text-sm text-muted-foreground">Every niche has a 0-100 score showing how easy and profitable it is to launch.</div>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Build My Pack</div>
            <div className="text-sm text-muted-foreground">One click generates your product title, description, and launch plan.</div>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
          <div className="p-2 bg-secondary rounded-lg">
            <Search className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Find Hot Niches</div>
            <div className="text-sm text-muted-foreground">Search or browse trending niches sorted by launch potential.</div>
          </div>
        </div>
      </div>
      <Button size="lg" onClick={handleComplete} className="w-full gap-2">
        Start Exploring <Sparkles className="w-4 h-4" />
      </Button>
    </motion.div>,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : i < step ? "bg-primary/60" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>

        {/* Skip Button */}
        {step > 0 && (
          <button
            onClick={onSkip}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
