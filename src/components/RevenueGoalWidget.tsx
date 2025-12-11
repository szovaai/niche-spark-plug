import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, DollarSign, TrendingUp, Edit2, Check, Flame, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface RevenueGoal {
  id: string;
  goal_amount: number;
  current_amount: number;
  is_active: boolean;
}

const MILESTONES = [
  { amount: 100, label: "First $100", icon: "🌱", message: "You did it! First $100 earned!" },
  { amount: 500, label: "$500 Goal", icon: "🔥", message: "Halfway to $1K! Keep going!" },
  { amount: 1000, label: "$1,000 Club", icon: "💎", message: "You hit $1K! You're a real seller now!" },
  { amount: 5000, label: "$5K Milestone", icon: "🚀", message: "Elite seller status unlocked!" },
  { amount: 10000, label: "$10K Legend", icon: "👑", message: "You're a digital product legend!" },
];

const RevenueGoalWidget = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState<RevenueGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [productsLaunched, setProductsLaunched] = useState(0);

  useEffect(() => {
    if (user) {
      fetchGoal();
      fetchProductCount();
    }
  }, [user]);

  const fetchGoal = async () => {
    try {
      const { data, error } = await supabase
        .from("revenue_goals")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setGoal(data);
        setEditAmount(data.goal_amount.toString());
      }
    } catch (error) {
      console.error("Error fetching goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCount = async () => {
    try {
      const { count } = await supabase
        .from("user_product_builds")
        .select("*", { count: "exact", head: true });
      setProductsLaunched(count || 0);
    } catch (error) {
      console.error("Error fetching product count:", error);
    }
  };

  const createOrUpdateGoal = async () => {
    if (!user) return;
    
    const amount = parseInt(editAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error("Please enter a valid goal amount");
      return;
    }

    try {
      if (goal) {
        const { error } = await supabase
          .from("revenue_goals")
          .update({ goal_amount: amount })
          .eq("id", goal.id);
        if (error) throw error;
        setGoal({ ...goal, goal_amount: amount });
      } else {
        const { data, error } = await supabase
          .from("revenue_goals")
          .insert({ user_id: user.id, goal_amount: amount })
          .select()
          .single();
        if (error) throw error;
        setGoal(data);
      }
      setEditing(false);
      toast.success("Goal updated!");
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    }
  };

  const addRevenue = async () => {
    if (!goal || !user) return;
    
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const newTotal = goal.current_amount + amount;
    const oldTotal = goal.current_amount;

    try {
      const { error } = await supabase
        .from("revenue_goals")
        .update({ current_amount: newTotal })
        .eq("id", goal.id);
      if (error) throw error;

      setGoal({ ...goal, current_amount: newTotal });
      setAddAmount("");
      toast.success(`+$${amount} added! 🎉`);

      // Check for milestone hits
      MILESTONES.forEach((milestone) => {
        if (oldTotal < milestone.amount && newTotal >= milestone.amount) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          toast.success(milestone.message, { icon: milestone.icon, duration: 5000 });
        }
      });
    } catch (error) {
      console.error("Error adding revenue:", error);
      toast.error("Failed to add revenue");
    }
  };

  const progress = goal ? Math.min((goal.current_amount / goal.goal_amount) * 100, 100) : 0;
  const nextMilestone = MILESTONES.find(m => (goal?.current_amount || 0) < m.amount);

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-card border border-border animate-pulse">
        <div className="h-8 bg-secondary rounded w-1/2 mb-4" />
        <div className="h-4 bg-secondary rounded w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl gradient-ocean border border-primary/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Revenue Goal</h3>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors"
        >
          {editing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Goal Amount */}
      {editing ? (
        <div className="flex gap-2 mb-4">
          <Input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            placeholder="Goal amount"
            className="flex-1"
          />
          <Button onClick={createOrUpdateGoal} size="sm">Save</Button>
        </div>
      ) : (
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-primary">
            ${goal?.current_amount?.toLocaleString() || 0}
          </span>
          <span className="text-muted-foreground">
            / ${goal?.goal_amount?.toLocaleString() || 500}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progress.toFixed(0)}% to goal</span>
          <span>${((goal?.goal_amount || 500) - (goal?.current_amount || 0)).toLocaleString()} to go</span>
        </div>
      </div>

      {/* Add Revenue */}
      <div className="flex gap-2 mb-4">
        <Input
          type="number"
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
          placeholder="Add sale amount"
          className="flex-1"
        />
        <Button onClick={addRevenue} size="sm" variant="glow">
          <DollarSign className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            {productsLaunched} Products
          </Badge>
        </div>
        {nextMilestone && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3 h-3 text-accent" />
            Next: {nextMilestone.icon} {nextMilestone.label}
          </div>
        )}
      </div>

      {/* Milestone Progress */}
      <div className="flex gap-1 mt-4">
        {MILESTONES.map((m, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${
              (goal?.current_amount || 0) >= m.amount
                ? "bg-primary"
                : "bg-secondary"
            }`}
            title={m.label}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default RevenueGoalWidget;
