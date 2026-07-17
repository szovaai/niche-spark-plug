import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = 'signin' | 'signup' | 'forgot';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Preserve `?next=` so OAuth consent (or any deep link) returns here after auth.
  const nextParam = (() => {
    const raw = new URLSearchParams(window.location.search).get("next");
    if (!raw) return null;
    // Same-origin relative paths only.
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  })();
  const postAuthTarget = nextParam ?? "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(postAuthTarget);
    }
  }, [user, navigate, postAuthTarget]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0].message;
    }
    
    // Only validate password for signin/signup, not forgot
    if (mode !== 'forgot') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.issues[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Password reset email sent! Check your inbox.");
          setMode('signin');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! You can now explore DigiStream.");
          navigate(postAuthTarget);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate(postAuthTarget);
        }
      }

    } finally {
      setLoading(false);
    }
  };

  const getHeading = () => {
    switch (mode) {
      case 'signup': return "Create Your Account";
      case 'forgot': return "Reset Password";
      default: return "Welcome Back";
    }
  };

  const getSubheading = () => {
    switch (mode) {
      case 'signup': return "Start discovering profitable digital product niches";
      case 'forgot': return "Enter your email and we'll send you a reset link";
      default: return "Sign in to continue your research";
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'signup': return "Create Account";
      case 'forgot': return "Send Reset Link";
      default: return "Sign In";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="PDF Empire AI" className="h-32 w-32 object-contain drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{getHeading()}</h1>
          <p className="text-muted-foreground">{getSubheading()}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {getButtonText()}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {mode === 'forgot' ? (
            <div className="text-center pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {mode === 'signup' ? "Already have an account?" : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-primary hover:underline ml-1 font-medium"
                >
                  {mode === 'signup' ? "Sign In" : "Sign Up Free"}
                </button>
              </p>
            </div>
          )}
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
