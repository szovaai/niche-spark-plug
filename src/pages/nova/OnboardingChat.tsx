import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useFounderProfile } from "@/hooks/useFounderProfile";
import { ONBOARDING_QUESTIONS } from "@/lib/nova/onboardingQuestions";
import { toast } from "sonner";

export default function OnboardingChat() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, saveAnswer } = useFounderProfile();
  const [step, setStep] = useState(0);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?next=/onboarding");
  }, [authLoading, user, navigate]);

  // Resume where the user left off
  useEffect(() => {
    if (!profile) return;
    if (profile.onboarding_completed_at) {
      navigate("/dashboard");
      return;
    }
    const resumeStep = Math.min(profile.onboarding_step ?? 0, ONBOARDING_QUESTIONS.length - 1);
    setStep(resumeStep);
  }, [profile, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const q = ONBOARDING_QUESTIONS[step];
  const name = profile?.preferred_name ?? null;
  const askText = useMemo(() => q?.ask(name) ?? "", [q, name]);
  const progress = ((step + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleNext = async () => {
    if (!q) return;
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Give me something to work with.");
      return;
    }
    setSaving(true);
    try {
      const transformed = q.transform ? q.transform(trimmed) : trimmed;
      const isLast = step === ONBOARDING_QUESTIONS.length - 1;
      await saveAnswer(
        { [q.field]: transformed } as never,
        { step: step + 1, complete: isLast },
      );
      setValue("");
      if (isLast) {
        toast.success("Founder Profile saved.");
        navigate("/dashboard");
      } else {
        setStep(step + 1);
      }
    } catch (e) {
      toast.error("Couldn't save that. Try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!q) return null;

  const isTextarea = q.field === "audience" || q.field === "interests" || q.field === "camera_comfort";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/20 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Nova · Founder Profile</div>
            <Progress value={progress} className="mt-1 h-1" />
          </div>
          <div className="text-xs text-muted-foreground">
            {step + 1} of {ONBOARDING_QUESTIONS.length}
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-border/30 bg-muted/20">
                <CardContent className="p-5">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">Nova</div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {askText}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-2">
            {isTextarea ? (
              <Textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={q.hint ?? "Your answer…"}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void handleNext();
                  }
                }}
              />
            ) : (
              <Input
                ref={inputRef as unknown as React.Ref<HTMLInputElement>}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={q.hint ?? "Your answer…"}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleNext();
                  }
                }}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Saved automatically. You can leave and come back.
              </div>
              <Button onClick={handleNext} disabled={saving || !value.trim()}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {step === ONBOARDING_QUESTIONS.length - 1 ? "Finish" : "Next"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
