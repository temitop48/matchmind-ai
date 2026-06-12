import type { RawNewsItem } from "../types/newsSource";

export async function getTeamNewsSources(
  team: string
): Promise<RawNewsItem[]> {
  if (!team || team === "TBD") {
    return [];
  }

  return [
    {
      title: `${team} news source placeholder`,
      source: "MatchMind",
      url: "#",
      publishedAt: new Date().toISOString(),
      summary:
        "External football news, injuries, availability, and lineup updates will be connected here.",
    },
  ];
}