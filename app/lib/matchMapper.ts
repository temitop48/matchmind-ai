import type { Match } from "../types/match";
import type { WorldCupMatch } from "../data/worldCupMatches";

export function mapDatabaseMatchToWorldCupMatch(match: Match): WorldCupMatch {
  return {
    id: match.id,
    competition: match.competition,
    date: match.date,
    time: match.time,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    venue: match.venue,
    confidence:
      match.confidence === "Low" ||
      match.confidence === "Medium" ||
      match.confidence === "High" ||
      match.confidence === "Pending"
        ? match.confidence
        : "Pending",
    insight: match.insight,
  };
}