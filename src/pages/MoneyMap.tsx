import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Map, Target, Rocket, CheckCircle, Circle, DollarSign,
  Clock, ArrowRight, Gift, Trophy, Sparkles, Play, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { STARTER_PRODUCTS, DAILY_CHALLENGES, type DailyChallenge } from "@/types/moneyMap";

const MoneyMap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(0);

  // Load completed days from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('moneymap_completed');
    if (saved) {
      setCompletedDays(JSON.parse(saved));
    }
  }, []);

  const toggleDay = (day: number) => {
    const newCompleted = completedDays.includes(day)
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day];
    setCompletedDays(newCompleted);
    localStorage.setItem('moneymap_completed', JSON.stringify(newCompleted));
  };

  const totalProgress = (completedDays.length / 7) * 100;
  const currentProduct = STARTER_PRODUCTS[selectedProduct];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Map className="w-4 h-4 text-primary" />
              <span className="text-sm gradient-text font-medium">Your 7-Day Money Map</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Get Your First Sale in 7 Days
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Follow this step-by-step plan to launch your first digital product and make your first sale
            </p>
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl gradient-ocean border border-primary/20 mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-semibold">Your Progress</span>
              </div>
              <Badge variant="secondary">{completedDays.length}/7 Days Complete</Badge>
            </div>
            <Progress value={totalProgress} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Day 1: Pick Product</span>
              <span>Day 7: Launch! 🚀</span>
            </div>
          </motion.div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products" className="gap-1">
                <Gift className="w-4 h-4" /> Starter Products
              </TabsTrigger>
              <TabsTrigger value="plan" className="gap-1">
                <Target className="w-4 h-4" /> 7-Day Plan
              </TabsTrigger>
              <TabsTrigger value="challenges" className="gap-1">
                <Rocket className="w-4 h-4" /> Daily Challenges
              </TabsTrigger>
            </TabsList>

            {/* Starter Products */}
            <TabsContent value="products" className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Choose Your First Product</h2>
                <p className="text-sm text-muted-foreground">
                  These are beginner-friendly products with proven demand
                </p>
              </div>

              <div className="grid gap-4">
                {STARTER_PRODUCTS.map((product, i) => (
                  <motion.div
                    key={product.productName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedProduct(i)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedProduct === i
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{product.productName}</h3>
                          <Badge variant="secondary">{product.productType}</Badge>
                          <Badge className={
                            product.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            product.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {product.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-400">
                            <DollarSign className="w-4 h-4" />
                            ${product.pricePoint}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {product.estimatedTimeToCreate}
                          </span>
                        </div>
                        <ul className="mt-3 space-y-1">
                          {product.keyFeatures.map((feature, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedProduct === i && (
                        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button 
                onClick={() => navigate('/discover')} 
                className="w-full gap-2"
                variant="hero"
              >
                <Sparkles className="w-4 h-4" />
                Start Building "{currentProduct.productName}"
              </Button>
            </TabsContent>

            {/* 7-Day Plan */}
            <TabsContent value="plan" className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Your First Sale Plan</h2>
                <p className="text-sm text-muted-foreground">
                  Step-by-step guide for "{currentProduct.productName}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Estimated First Month Revenue</div>
                    <div className="text-2xl font-bold text-primary">
                      ${(currentProduct.pricePoint * 15).toFixed(0)} - ${(currentProduct.pricePoint * 30).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">At 15-30 sales/month</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { step: 1, title: "Research & Plan", duration: "Day 1", tasks: ["Choose your product", "Research 5 competitors", "Note improvement ideas"] },
                  { step: 2, title: "Create Product", duration: "Days 2-3", tasks: ["Build your product in Canva", "Add all pages/sections", "Export in multiple formats"] },
                  { step: 3, title: "Create Listing", duration: "Day 4-5", tasks: ["Write compelling title", "Create listing images", "Write description & tags"] },
                  { step: 4, title: "Launch & Promote", duration: "Days 6-7", tasks: ["Publish on Etsy/Gumroad", "Share on social media", "Tell friends & family"] },
                ].map((phase, i) => (
                  <motion.div
                    key={phase.step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">{phase.step}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{phase.title}</h4>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                        <ul className="space-y-1">
                          {phase.tasks.map((task, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-primary" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Daily Challenges */}
            <TabsContent value="challenges" className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Daily Challenges</h2>
                <p className="text-sm text-muted-foreground">
                  Complete one challenge per day to stay on track
                </p>
              </div>

              <div className="space-y-3">
                {DAILY_CHALLENGES.map((challenge, i) => {
                  const isCompleted = completedDays.includes(challenge.day);
                  const isLocked = i > 0 && !completedDays.includes(DAILY_CHALLENGES[i - 1].day);

                  return (
                    <motion.div
                      key={challenge.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted 
                          ? "bg-green-500/10 border-green-500/30" 
                          : isLocked
                          ? "bg-muted/50 border-border opacity-50"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => !isLocked && toggleDay(challenge.day)}
                          disabled={isLocked}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCompleted 
                              ? "bg-green-500 text-white" 
                              : "bg-secondary hover:bg-primary/20"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-bold">{challenge.day}</span>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {challenge.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {challenge.estimatedTime}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {challenge.description}
                          </p>
                          {!isLocked && (
                            <ul className="space-y-1">
                              {challenge.actionItems.map((item, j) => (
                                <li key={j} className="text-xs flex items-center gap-2">
                                  <Circle className="w-2 h-2 text-primary" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          {challenge.proTip && !isLocked && (
                            <div className="mt-2 p-2 rounded-lg bg-accent/10 text-xs">
                              <strong className="text-accent">Pro Tip:</strong> {challenge.proTip}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {completedDays.length === 7 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl gradient-ocean border border-primary/30 text-center"
                >
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-accent" />
                  <h3 className="text-xl font-bold mb-2">Congratulations! 🎉</h3>
                  <p className="text-muted-foreground mb-4">
                    You've completed all 7 days! Your first product should be live now.
                  </p>
                  <Button variant="hero" onClick={() => navigate('/my-products')}>
                    View My Products
                  </Button>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 rounded-xl bg-card border border-border"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Tips for Success
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Done is better than perfect - launch fast!
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Your first sale often comes from your network
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Price at $5-15 for your first product
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Good listing images = more clicks
              </li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MoneyMap;
