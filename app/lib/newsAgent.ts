import type { TeamNewsReport } from "../types/news";
import { getTeamNewsSources } from "./newsSourceProvider";
import { analyzeNewsSignals } from "./newsSignalAnalyzer";

export async function getTeamNews(team: string): Promise<TeamNewsReport> {
  const sources = await getTeamNewsSources(team);
  const signals = analyzeNewsSignals(sources);

  return {
    team,
    generatedAt: new Date().toISOString(),
    signals:
      signals.length === 0
        ? [
            {
              title: "No team news available",
              impact: "Low",
              category: "other",
              summary:
                "No external news source is connected for this team yet.",
            },
          ]
        : signals,
  };
}