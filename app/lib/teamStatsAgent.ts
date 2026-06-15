import type { TeamStats } from "../types/teamStats";
import { supabase } from "./supabase";

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
  const { data, error } = await supabase
    .from("team_stats")
    .select("*")
    .eq("team", team)
    .maybeSingle();

  if (error || !data) {
    return {
      ...fallbackTeamStats,
      team,
    };
  }

  return {
    team: data.team,
    matchesPlayed: data.matches_played,
    wins: data.wins,
    draws: data.draws,
    losses: data.losses,
    goalsFor: data.goals_for,
    goalsAgainst: data.goals_against,
    points: data.points,
  };
}