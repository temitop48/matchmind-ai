import type { WorldCupMatch } from "../data/worldCupMatches";

export type MatchContextItem = {
  title: string;
  status: "Pending" | "Available" | "Important";
  detail: string;
};

export type MatchContextReport = {
  matchId: string;
  lastUpdated: string;
  items: MatchContextItem[];
};

export function getMatchContext(match: WorldCupMatch): MatchContextReport {
  return {
    matchId: match.id,
    lastUpdated: "Not updated yet",
    items: [
      {
        title: "Injury Updates",
        status: "Pending",
        detail:
          "Injury data will be checked before kickoff when official squad updates are available.",
      },
      {
        title: "Player Availability",
        status: "Pending",
        detail:
          "Availability analysis will include suspensions, fitness doubts, and expected starters.",
      },
      {
        title: "Recent Team Form",
        status: "Pending",
        detail:
          "The system will compare recent wins, losses, goals scored, goals conceded, and home/away strength.",
      },
      {
        title: "Match Importance",
        status: "Pending",
        detail:
          "Group stage pressure, qualification needs, and knockout context will affect prediction confidence.",
      },
      {
        title: "Tactical Notes",
        status: "Pending",
        detail:
          "Formation changes, manager comments, and playing style will be included in the final analysis.",
      },
    ],
  };
}