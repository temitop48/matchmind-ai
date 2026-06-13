import {
  FixtureProvider,
  MatchProviderFixture,
} from "../../types/provider";

type FootballDataMatch = {
  id: number;
  utcDate: string;
  competition: {
    name: string;
    code?: string;
  };
  homeTeam: {
    name: string | null;
  };
  awayTeam: {
    name: string | null;
  };
};

type FootballDataResponse = {
  matches: FootballDataMatch[];
};

export class FootballDataProvider implements FixtureProvider {
  async getFixtures(): Promise<MatchProviderFixture[]> {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      throw new Error("Missing FOOTBALL_DATA_API_KEY.");
    }

    const today = new Date();
const dateFrom = today.toISOString().slice(0, 10);

const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const dateTo = nextWeek.toISOString().slice(0, 10);

const response = await fetch(
  `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
  {
      headers: {
        "X-Auth-Token": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `football-data.org error: ${response.status} - ${errorText}`
      );
    }

    const data = (await response.json()) as FootballDataResponse;

    return data.matches.map((match) => {
      const date = new Date(match.utcDate);

      return {
        id: `fd-${match.id}`,
        competition: match.competition.name,
        date: date.toISOString().slice(0, 10),
        time: date.toISOString().slice(11, 16),
        homeTeam: match.homeTeam.name ?? "TBD",
        awayTeam: match.awayTeam.name ?? "TBD",
        venue: "TBD",
      };
    });
  }
}