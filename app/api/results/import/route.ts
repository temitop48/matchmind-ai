import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

type MatchRow = {
  id: string;
  home_team: string;
  away_team: string;
  date: string;
};


export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: matches, error: matchError } = await supabase
      .from("world_cup_matches")
      .select("id, home_team, away_team, date")
      .lte("date", today);

    if (matchError) {
      return NextResponse.json(
        { success: false, error: matchError.message },
        { status: 500 },
      );
    }

    const rows = ((matches ?? []) as MatchRow[]).map((match) => ({
      match_id: match.id,
      home_team: match.home_team,
      away_team: match.away_team,
      home_goals: null,
      away_goals: null,
      status: "Pending",
      result_label: null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("match_results")
      .upsert(rows, { onConflict: "match_id" });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
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
      { status: 500 },
    );
  }
}