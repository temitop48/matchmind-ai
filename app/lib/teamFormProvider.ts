import type { TeamStats } from "../types/teamStats";

type FootballDataTeam = {
  id: number;
  name: string;
};

type FootballDataTeamSearchResponse = {
  teams: FootballDataTeam[];
};

type FootballDataMatch = {
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
};

type FootballDataMatchesResponse = {
  matches: FootballDataMatch[];
};

const fallbackStats: TeamStats = {
  team: "Unknown",
  matchesPlayed: 5,
  wins: 2,
  draws: 2,
  losses: 1,
  goalsFor: 7,
  goalsAgainst: 5,
  points: 8,
};

export async function getRecentTeamStatsFromFootballData(
  team: string,
): Promise<TeamStats> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey || team === "TBD") {
    return {
      ...fallbackStats,
      team,
    };
  }

  try {
    const searchResponse = await fetch(
      `https://api.football-data.org/v4/teams?name=${encodeURIComponent(team)}`,
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
        cache: "no-store",
      },
    );

    if (!searchResponse.ok) {
      return {
        ...fallbackStats,
        team,
      };
    }

    const searchData =
      (await searchResponse.json()) as FootballDataTeamSearchResponse;

    const foundTeam = searchData.teams?.find(
      (item) => item.name.toLowerCase() === team.toLowerCase(),
    );

    if (!foundTeam) {
      return {
        ...fallbackStats,
        team,
      };
    }

    const matchesResponse = await fetch(
      `https://api.football-data.org/v4/teams/${foundTeam.id}/matches?status=FINISHED&limit=5`,
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
        cache: "no-store",
      },
    );

    if (!matchesResponse.ok) {
      return {
        ...fallbackStats,
        team,
      };
    }

    const matchesData =
      (await matchesResponse.json()) as FootballDataMatchesResponse;

    const matches = matchesData.matches ?? [];

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const match of matches) {
      const homeGoals = match.score.fullTime.home ?? 0;
      const awayGoals = match.score.fullTime.away ?? 0;

      const isHome = match.homeTeam.id === foundTeam.id;

      const teamGoals = isHome ? homeGoals : awayGoals;
      const opponentGoals = isHome ? awayGoals : homeGoals;

      goalsFor += teamGoals;
      goalsAgainst += opponentGoals;

      if (teamGoals > opponentGoals) wins += 1;
      else if (teamGoals === opponentGoals) draws += 1;
      else losses += 1;
    }

    return {
      team,
      matchesPlayed: matches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      points: wins * 3 + draws,
    };
  } catch {
    return {
      ...fallbackStats,
      team,
    };
  }
}