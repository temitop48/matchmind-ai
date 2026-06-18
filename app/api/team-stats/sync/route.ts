import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { getUpcomingWorldCupMatches } from "../../../lib/fixtures";

export const dynamic = "force-dynamic";

const fallbackTeamStats = {
  matchesPlayed: 5,
  wins: 2,
  draws: 2,
  losses: 1,
  goalsFor: 7,
  goalsAgainst: 5,
  points: 8,
};

export async function GET() {
  try {
    const matches = await getUpcomingWorldCupMatches();

    const teams = Array.from(
      new Set(
        matches
          .flatMap((match) => [match.homeTeam, match.awayTeam])
          .filter((team) => team && team !== "TBD"),
      ),
    );

    const rows = teams.map((team) => ({
      team,
      matches_played: fallbackTeamStats.matchesPlayed,
      wins: fallbackTeamStats.wins,
      draws: fallbackTeamStats.draws,
      losses: fallbackTeamStats.losses,
      goals_for: fallbackTeamStats.goalsFor,
      goals_against: fallbackTeamStats.goalsAgainst,
      points: fallbackTeamStats.points,
      source: "internal-fallback",
      synced_at: new Date().toISOString(),
    }));

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        teamsProcessed: 0,
        saved: 0,
      });
    }

    const { error } = await supabase
      .from("team_stats")
      .upsert(rows, { onConflict: "team" });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      teamsProcessed: teams.length,
      saved: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown team stats sync error.",
      },
      { status: 500 },
    );
  }
}