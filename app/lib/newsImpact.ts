import type { TeamNewsReport } from "../types/news";

export function calculateTeamNewsRisk(report: TeamNewsReport) {
  let risk = 0;

  for (const signal of report.signals) {
    if (signal.impact === "High") risk += 20;
    if (signal.impact === "Medium") risk += 10;
    if (signal.impact === "Low") risk += 3;
  }

  return Math.min(100, risk);
}

export function getCombinedNewsRisk(
  homeReport: TeamNewsReport,
  awayReport: TeamNewsReport
) {
  const homeRisk = calculateTeamNewsRisk(homeReport);
  const awayRisk = calculateTeamNewsRisk(awayReport);

  return Math.min(100, Math.round((homeRisk + awayRisk) / 2));
}