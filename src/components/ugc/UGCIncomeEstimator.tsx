import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Target, TrendingUp, DollarSign, Video, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function UGCIncomeEstimator() {
  const [videosPerWeek, setVideosPerWeek] = useState(5);
  const [avgPayPerVideo, setAvgPayPerVideo] = useState(100);
  const [retainerAmount, setRetainerAmount] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(2000);

  const weeksPerMonth = 4;
  const monthlyFromVideos = videosPerWeek * avgPayPerVideo * weeksPerMonth;
  const totalMonthly = monthlyFromVideos + retainerAmount;
  const progressToGoal = Math.min((totalMonthly / monthlyGoal) * 100, 100);
  const annualProjection = totalMonthly * 12;

  const getProgressColor = () => {
    if (progressToGoal >= 100) return 'bg-green-500';
    if (progressToGoal >= 75) return 'bg-yellow-500';
    if (progressToGoal >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIncomeLevel = () => {
    if (totalMonthly >= 5000) return { label: 'Full-Time Income', color: 'text-green-400' };
    if (totalMonthly >= 2000) return { label: 'Solid Side Hustle', color: 'text-yellow-400' };
    if (totalMonthly >= 500) return { label: 'Good Start', color: 'text-orange-400' };
    return { label: 'Building Up', color: 'text-muted-foreground' };
  };

  const incomeLevel = getIncomeLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Income Estimator</h2>
          <p className="text-muted-foreground text-sm">Calculate your potential UGC earnings</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Your Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Videos per Week */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-muted-foreground" />
                  Videos per Week
                </Label>
                <span className="font-semibold text-primary">{videosPerWeek}</span>
              </div>
              <Slider
                value={[videosPerWeek]}
                onValueChange={([v]) => setVideosPerWeek(v)}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 video</span>
                <span>20 videos</span>
              </div>
            </div>

            {/* Avg Pay per Video */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  Avg. Pay per Video
                </Label>
                <span className="font-semibold text-primary">${avgPayPerVideo}</span>
              </div>
              <Slider
                value={[avgPayPerVideo]}
                onValueChange={([v]) => setAvgPayPerVideo(v)}
                min={25}
                max={500}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$25</span>
                <span>$500</span>
              </div>
            </div>

            {/* Retainer Amount */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Monthly Retainers
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={retainerAmount}
                  onChange={(e) => setRetainerAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Fixed monthly payments from brand partnerships
              </p>
            </div>

            {/* Monthly Goal */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                Monthly Goal
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* Main Projection */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-2">Estimated Monthly Income</p>
                <p className="text-5xl font-bold text-foreground mb-2">
                  ${totalMonthly.toLocaleString()}
                </p>
                <Badge className={incomeLevel.color} variant="outline">
                  {incomeLevel.label}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Goal Progress */}
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progress to Goal</span>
                <span className="text-sm font-medium">
                  ${totalMonthly.toLocaleString()} / ${monthlyGoal.toLocaleString()}
                </span>
              </div>
              <Progress value={progressToGoal} className="h-3" />
              <p className="text-sm mt-2 text-muted-foreground">
                {progressToGoal >= 100 
                  ? '🎉 You\'re exceeding your goal!' 
                  : `$${(monthlyGoal - totalMonthly).toLocaleString()} more to reach your goal`}
              </p>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card className="bg-card/50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Income Breakdown
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From Videos</span>
                  <span className="font-medium">${monthlyFromVideos.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From Retainers</span>
                  <span className="font-medium">${retainerAmount.toLocaleString()}/mo</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted-foreground">Annual Projection</span>
                  <span className="font-semibold text-primary">${annualProjection.toLocaleString()}/yr</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-4">
              <h4 className="font-semibold text-accent mb-2">💡 Quick Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with 3-5 apps to diversify income</li>
                <li>• Aim for at least 1 retainer client</li>
                <li>• Quality over quantity = higher per-video rates</li>
                <li>• Build a portfolio to command $200+/video</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
