import type { TeamStats } from "../types/teamStats";
import { calculateTeamRating } from "./teamRatingEngine";

export function convertStatsToRating(stats: TeamStats) {
  return calculateTeamRating({
    recentWins: stats.wins,
    recentDraws: stats.draws,
    recentLosses: stats.losses,
    goalsFor: stats.goalsFor,
    goalsAgainst: stats.goalsAgainst,
    availabilityScore: 80,
  });
}