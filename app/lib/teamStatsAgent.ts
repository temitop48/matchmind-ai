import type { TeamStats } from "../types/teamStats";
import { getRecentTeamStatsFromFootballData } from "./teamFormProvider";

export async function getTeamStats(team: string): Promise<TeamStats> {
  return getRecentTeamStatsFromFootballData(team);
}