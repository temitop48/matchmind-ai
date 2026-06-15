import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { getUpcomingWorldCupMatches } from "../../../lib/fixtures";
import { getRecentTeamStatsFromFootballData } from "../../../lib/teamFormProvider";

export const dynamic = "force-dynamic";

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

    const rows = [];

    for (const team of teams) {
      const stats = await getRecentTeamStatsFromFootballData(team);

      rows.push({
        team: stats.team,
        matches_played: stats.matchesPlayed,
        wins: stats.wins,
        draws: stats.draws,
        losses: stats.losses,
        goals_for: stats.goalsFor,
        goals_against: stats.goalsAgainst,
        points: stats.points,
        source: "football-data.org",
        synced_at: new Date().toISOString(),
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