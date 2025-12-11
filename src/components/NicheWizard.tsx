import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, ArrowRight, ArrowLeft, Loader2, Sparkles, Target, Clock,
  DollarSign, CheckCircle, ChevronRight, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  SKILL_OPTIONS,
  INTEREST_OPTIONS,
  GOAL_OPTIONS,
  type NicheWizardInput,
  type NicheWizardOutput,
} from "@/types/nicheWizard";

interface NicheWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_OPTIONS = [
  { id: 'minimal', label: '1-5 hours/week', description: 'Side hustle mode' },
  { id: 'moderate', label: '5-15 hours/week', description: 'Part-time focus' },
  { id: 'dedicated', label: '15+ hours/week', description: 'Full commitment' },
];

const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Complete Beginner', description: 'Never sold digital products' },
  { id: 'intermediate', label: 'Some Experience', description: 'Made a few sales before' },
  { id: 'advanced', label: 'Experienced Seller', description: 'Consistent sales history' },
];

const NicheWizard = ({ isOpen, onClose }: NicheWizardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [input, setInput] = useState<NicheWizardInput>({
    skills: [],
    interests: [],
    goals: [],
    timeAvailable: 'moderate',
    budget: 'low',
    experience: 'beginner',
  });
  
  const [result, setResult] = useState<NicheWizardOutput | null>(null);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const toggleSelection = (field: 'skills' | 'interests' | 'goals', id: string) => {
    setInput(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(i => i !== id)
        : [...prev[field], id]
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to use the Niche Wizard");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('niche-wizard', {
        body: input
      });

      if (error) throw error;
      setResult(data);
      setStep(6);
      toast.success("Found your perfect niches!");
    } catch (error) {
      console.error("Niche wizard error:", error);
      toast.error("Failed to find niches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNicheClick = (nicheId: string) => {
    onClose();
    navigate(`/niche/${nicheId}`);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Wand2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Find Your Perfect Niche</h3>
              <p className="text-muted-foreground mt-2">
                Answer a few questions and we'll find niches that match your skills and goals
              </p>
            </div>

            <div className="p-4 rounded-xl gradient-ocean border border-primary/20">
              <h4 className="font-semibold mb-3">What are you good at?</h4>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSelection('skills', skill.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      input.skills.includes(skill.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-lg mr-2">{skill.icon}</span>
                    <span className="text-sm">{skill.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full gap-2"
              disabled={input.skills.length === 0}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold">What topics interest you?</h3>
              <p className="text-muted-foreground text-sm">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest.id}
                  onClick={() => toggleSelection('interests', interest.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    input.interests.includes(interest.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg mr-2">{interest.icon}</span>
                  <span className="text-sm">{interest.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1 gap-2"
                disabled={input.interests.length === 0}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold">What are your goals?</h3>
              <p className="text-muted-foreground text-sm">What do you want to achieve?</p>
            </div>

            <div className="space-y-2">
              {GOAL_OPTIONS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleSelection('goals', goal.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    input.goals.includes(goal.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg mr-3">{goal.icon}</span>
                  <span className="font-medium">{goal.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                className="flex-1 gap-2"
                disabled={input.goals.length === 0}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold">Time & Experience</h3>
              <p className="text-muted-foreground text-sm">Help us find the right fit</p>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Time Available
              </h4>
              <div className="space-y-2">
                {TIME_OPTIONS.map(time => (
                  <button
                    key={time.id}
                    onClick={() => setInput({...input, timeAvailable: time.id as 'minimal' | 'moderate' | 'dedicated'})}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      input.timeAvailable === time.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium text-sm">{time.label}</div>
                    <div className="text-xs text-muted-foreground">{time.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Experience Level
              </h4>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => setInput({...input, experience: exp.id as 'beginner' | 'intermediate' | 'advanced'})}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      input.experience === exp.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium text-sm">{exp.label}</div>
                    <div className="text-xs text-muted-foreground">{exp.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={() => setStep(5)} 
                className="flex-1 gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold">Ready to Find Your Niche!</h3>
              <p className="text-muted-foreground text-sm">Here's what you told us:</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="text-xs text-muted-foreground mb-1">Skills</div>
                <div className="flex flex-wrap gap-1">
                  {input.skills.map(s => (
                    <Badge key={s} variant="secondary">
                      {SKILL_OPTIONS.find(o => o.id === s)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="text-xs text-muted-foreground mb-1">Interests</div>
                <div className="flex flex-wrap gap-1">
                  {input.interests.map(i => (
                    <Badge key={i} variant="secondary">
                      {INTEREST_OPTIONS.find(o => o.id === i)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="text-xs text-muted-foreground mb-1">Goals</div>
                <div className="flex flex-wrap gap-1">
                  {input.goals.map(g => (
                    <Badge key={g} variant="secondary">
                      {GOAL_OPTIONS.find(o => o.id === g)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finding Niches...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Find My Niches
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );

      case 6:
        return result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Your Perfect Niches!</h3>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {result.topRecommendations.map((rec, i) => (
                <motion.button
                  key={rec.nicheId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleNicheClick(rec.nicheId)}
                  className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 text-left transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{rec.nicheName}</span>
                        <Badge className="bg-primary/20 text-primary">
                          {rec.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.whyItFits}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-green-400">
                          <DollarSign className="w-3 h-3" />
                          {rec.potentialEarnings}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {rec.timeToFirstSale}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </div>

            {result.personalizedInsights.length > 0 && (
              <div className="p-3 rounded-lg gradient-ocean border border-primary/20">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Personalized Tips
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {result.personalizedInsights.slice(0, 3).map((insight, i) => (
                    <li key={i}>• {insight}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={onClose} className="w-full">Start Exploring</Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Niche Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        {step < 6 && (
          <Progress value={progress} className="h-1 mb-4" />
        )}

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default NicheWizard;
