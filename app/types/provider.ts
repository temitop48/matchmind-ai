export type MatchProviderFixture = {
  id: string;
  competition: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
};

export interface FixtureProvider {
  getFixtures(): Promise<MatchProviderFixture[]>;
}