export type WorldCupMatch = {
  id: string;
  competition: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  confidence: "Pending" | "Low" | "Medium" | "High";
  insight: string;
};

export const worldCupMatches: WorldCupMatch[] = [
  {
    id: "wc-2026-001",
    competition: "FIFA World Cup 2026",
    date: "June 11, 2026",
    time: "20:00",
    homeTeam: "Mexico",
    awayTeam: "TBD",
    venue: "Estadio Azteca",
    confidence: "Pending",
    insight: "Prediction will be generated when team data is available.",
  },
  {
    id: "wc-2026-002",
    competition: "FIFA World Cup 2026",
    date: "June 12, 2026",
    time: "18:00",
    homeTeam: "Canada",
    awayTeam: "TBD",
    venue: "Toronto Stadium",
    confidence: "Pending",
    insight: "Fixture analysis will include form, injuries, and availability.",
  },
  {
    id: "wc-2026-003",
    competition: "FIFA World Cup 2026",
    date: "June 12, 2026",
    time: "21:00",
    homeTeam: "USA",
    awayTeam: "TBD",
    venue: "Los Angeles Stadium",
    confidence: "Pending",
    insight: "AI prediction engine will activate before kickoff.",
  },
];