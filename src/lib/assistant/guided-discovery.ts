import { planPublicDiscovery, type DiscoveryFilters } from "./public-discovery";
import { guidedGoals } from "./navigator-copy";

export type GuidedAnswers = { goal: string; topic: string; location: string };
export function understandGuidedGoal(goal: string): GuidedAnswers {
  if (guidedGoals.includes(goal)) return { goal, topic: "", location: "" };
  const plan = planPublicDiscovery(goal);
  return { goal: goal.slice(0, 80), topic: plan.topic, location: plan.location };
}
// Ask only for missing information. Skips stay deliberate, not inferred consent.
export function nextGuidedQuestion(answers: GuidedAnswers, completed: "goal" | "topic"): 1 | 2 | null {
  if (completed === "goal" && !answers.topic) return 1;
  return answers.location ? null : 2;
}
export function guidedSearch(answers: GuidedAnswers): { query: string; filters: DiscoveryFilters } {
  const { goal, topic, location } = answers;
  return { query: [goal || "Explore the community", topic, location].filter(Boolean).join(" · ").slice(0, 120), filters: { goal, topic, location } };
}
