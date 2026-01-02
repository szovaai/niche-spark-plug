import { useState } from "react";
import { 
  HelpCircle, 
  ChevronRight, 
  RotateCcw, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Cloud,
  Triangle,
  Github,
  Shield,
  Code,
  Upload,
  Server,
  Zap,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FREE_HOSTING_PLATFORMS, FreeHostingPlatform } from "@/data/freeHostingPlatforms";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cloud,
  Triangle,
  Github,
  Shield,
  Code,
  Upload,
  Server,
  Zap,
};

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    description?: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'skill',
    question: 'What\'s your technical comfort level?',
    options: [
      { label: 'Complete Beginner', value: 'beginner', description: 'I just want to upload a file and get a link' },
      { label: 'Comfortable with Tech', value: 'intermediate', description: 'I can follow instructions and use online tools' },
      { label: 'Developer', value: 'advanced', description: 'I know Git, CLI, and can handle setup' },
    ],
  },
  {
    id: 'domain',
    question: 'Do you need a custom domain (yoursite.com)?',
    options: [
      { label: 'Not right now', value: 'no', description: 'A free subdomain is fine for now' },
      { label: 'Yes, eventually', value: 'later', description: 'I want the option to add one later' },
      { label: 'Yes, immediately', value: 'yes', description: 'I already have a domain to connect' },
    ],
  },
  {
    id: 'speed',
    question: 'How quickly do you need to be online?',
    options: [
      { label: 'Right now!', value: 'instant', description: 'Under 1 minute, no signup' },
      { label: 'Today', value: 'quick', description: 'Happy to create an account if needed' },
      { label: 'No rush', value: 'flexible', description: 'I want the best long-term option' },
    ],
  },
];

type Answers = Record<string, string>;

const getRecommendation = (answers: Answers): FreeHostingPlatform => {
  const { skill, domain, speed } = answers;

  // Instant + beginner = Tiiny.host or Netlify Drop
  if (speed === 'instant' && skill === 'beginner') {
    return FREE_HOSTING_PLATFORMS.find(p => p.id === 'tiiny-host')!;
  }

  // Beginner wanting custom domain later = Netlify
  if (skill === 'beginner' && domain !== 'no') {
    return FREE_HOSTING_PLATFORMS.find(p => p.id === 'netlify')!;
  }

  // Beginner, no domain needed, quick = Netlify Drop
  if (skill === 'beginner') {
    return FREE_HOSTING_PLATFORMS.find(p => p.id === 'netlify')!;
  }

  // Developer wanting speed = Surge or Vercel
  if (skill === 'advanced' && speed === 'instant') {
    return FREE_HOSTING_PLATFORMS.find(p => p.id === 'surge')!;
  }

  // Developer wanting long-term = GitHub Pages or Cloudflare
  if (skill === 'advanced' && speed === 'flexible') {
    return FREE_HOSTING_PLATFORMS.find(p => p.id === 'cloudflare-pages')!;
  }

  // Intermediate with custom domain = Vercel
  if (skill === 'intermediate' && domain !== 'no') {
    return FREE_HOSTING_PLATFORMS.find(p => p.id === 'vercel')!;
  }

  // Intermediate wanting to grow = Render
  if (skill === 'intermediate' && speed === 'flexible') {
    return FREE_HOSTING_PLATFORMS.find(p => p.id === 'render')!;
  }

  // Default: Netlify (great all-rounder)
  return FREE_HOSTING_PLATFORMS.find(p => p.id === 'netlify')!;
};

const getAlternatives = (recommendation: FreeHostingPlatform, answers: Answers): FreeHostingPlatform[] => {
  const alternatives: FreeHostingPlatform[] = [];
  
  // Add complementary options
  if (recommendation.id !== 'netlify') {
    alternatives.push(FREE_HOSTING_PLATFORMS.find(p => p.id === 'netlify')!);
  }
  if (recommendation.id !== 'vercel' && answers.skill !== 'beginner') {
    alternatives.push(FREE_HOSTING_PLATFORMS.find(p => p.id === 'vercel')!);
  }
  if (recommendation.id !== 'tiiny-host' && answers.skill === 'beginner') {
    alternatives.push(FREE_HOSTING_PLATFORMS.find(p => p.id === 'tiiny-host')!);
  }

  return alternatives.slice(0, 2);
};

export const HostingPickerQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  const recommendation = showResult ? getRecommendation(answers) : null;
  const alternatives = recommendation ? getAlternatives(recommendation, answers) : [];
  const RecommendedIcon = recommendation ? (iconMap[recommendation.icon] || Globe) : Globe;

  if (showResult && recommendation) {
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold">Your Perfect Match</h4>
            </div>
            <Button variant="ghost" size="sm" onClick={resetQuiz}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Retake Quiz
            </Button>
          </div>

          {/* Main Recommendation */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <RecommendedIcon className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{recommendation.name}</h3>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    Best Match
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{recommendation.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{recommendation.freeTier}</span>
                </div>
                <Button onClick={() => window.open(recommendation.setupUrl, '_blank')}>
                  Get Started with {recommendation.name}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Quick Steps */}
            <div className="mt-4 pt-4 border-t border-primary/20">
              <h5 className="text-sm font-medium mb-2">Quick Start:</h5>
              <ol className="space-y-1">
                {recommendation.quickSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Also great options:</h5>
              <div className="grid sm:grid-cols-2 gap-3">
                {alternatives.map(alt => {
                  const AltIcon = iconMap[alt.icon] || Globe;
                  return (
                    <div 
                      key={alt.id} 
                      className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => window.open(alt.setupUrl, '_blank')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <AltIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alt.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{alt.bestFor}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = QUIZ_QUESTIONS[currentStep];

  return (
    <Card className="border-2 border-blue-500/30 bg-blue-500/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">Find Your Perfect Host</h4>
          </div>
          <div className="flex items-center gap-1">
            {QUIZ_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep 
                    ? 'bg-primary' 
                    : i < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map(option => (
            <button
              key={option.value}
              onClick={() => handleAnswer(currentQuestion.id, option.value)}
              className="w-full p-4 rounded-xl border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>

        {currentStep > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="mt-4"
          >
            ← Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
