import { DemandTier, CompetitionTier, MomentumDirection, LaunchSpeed } from "@/types/niche";

export type XLSRating = "Low" | "Good" | "Great" | "Excellent";

interface XLSInput {
  demandTier: DemandTier;
  competitionTier: CompetitionTier;
  momentum: MomentumDirection;
  launchSpeed: LaunchSpeed;
}

const DEMAND_SCORES: Record<DemandTier, number> = {
  "Spark": 10,
  "Hot": 20,
  "On Fire": 30
};

const COMPETITION_SCORES: Record<CompetitionTier, number> = {
  "Saturated": 5,
  "Moderate": 15,
  "Easy": 25
};

const MOMENTUM_SCORES: Record<MomentumDirection, number> = {
  "declining": 5,
  "steady": 15,
  "rising": 25
};

const SPEED_SCORES: Record<LaunchSpeed, number> = {
  "1 Day": 5,
  "1 Hour": 12,
  "Instant": 20
};

export function calculateLaunchabilityScore(input: XLSInput): number {
  const demandScore = DEMAND_SCORES[input.demandTier];
  const competitionScore = COMPETITION_SCORES[input.competitionTier];
  const momentumScore = MOMENTUM_SCORES[input.momentum];
  const speedScore = SPEED_SCORES[input.launchSpeed];
  
  return demandScore + competitionScore + momentumScore + speedScore;
}

export function getXLSRating(score: number): XLSRating {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Great";
  if (score >= 50) return "Good";
  return "Low";
}

export function getXLSColor(score: number): string {
  if (score >= 85) return "text-yellow-400";
  if (score >= 70) return "text-green-400";
  if (score >= 50) return "text-blue-400";
  return "text-muted-foreground";
}

export function getXLSBgColor(score: number): string {
  if (score >= 85) return "from-yellow-500/20 to-orange-500/20";
  if (score >= 70) return "from-green-500/20 to-emerald-500/20";
  if (score >= 50) return "from-blue-500/20 to-cyan-500/20";
  return "from-muted/20 to-muted/10";
}

export function getXLSTagline(score: number): string {
  if (score >= 85) return "Launch Today!";
  if (score >= 70) return "Strong Opportunity";
  if (score >= 50) return "Worth Exploring";
  return "Research More";
}
