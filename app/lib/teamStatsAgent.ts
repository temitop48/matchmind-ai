import type { TeamStats } from "../types/teamStats";

const fallbackTeamStats: TeamStats = {
  team: "Unknown",
  matchesPlayed: 5,
  wins: 2,
  draws: 2,
  losses: 1,
  goalsFor: 7,
  goalsAgainst: 5,
  points: 8,
};

export async function getTeamStats(team: string): Promise<TeamStats> {
  return {
    ...fallbackTeamStats,
    team,
  };
}