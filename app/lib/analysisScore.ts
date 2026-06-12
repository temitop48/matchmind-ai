import type { TeamNewsReport } from "../types/news";

export function calculateNewsImpact(
  report: TeamNewsReport
) {
  let score = 0;

  for (const signal of report.signals) {
    if (signal.impact === "High") score += 15;
    if (signal.impact === "Medium") score += 8;
    if (signal.impact === "Low") score += 3;
  }

  return score;
}