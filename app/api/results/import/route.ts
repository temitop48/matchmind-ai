import { NextResponse } from "next/server";
import { getUpcomingWorldCupMatches } from "../../../lib/fixtures";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    const matches = await getUpcomingWorldCupMatches();

    const rows = matches.map((match) => ({
      match_id: match.id,
      home_team: match.homeTeam,
      away_team: match.awayTeam,
      home_goals: null,
      away_goals: null,
      status: "Pending",
      result_label: null,
    }));

    const { error } = await supabase
      .from("match_results")
      .upsert(rows, { onConflict: "match_id" });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imported: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown result import error.",
      },
      { status: 500 }
    );
  }
}