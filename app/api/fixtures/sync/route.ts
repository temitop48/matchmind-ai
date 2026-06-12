import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { fetchWorldCupFixtures } from "../../../lib/fixtureImporter";

export async function GET() {
  try {
    const fixtures = await fetchWorldCupFixtures();

    const rows = fixtures.map((fixture) => ({
      id: fixture.id,
      competition: fixture.competition,
      date: fixture.date,
      time: fixture.time,
      home_team: fixture.homeTeam,
      away_team: fixture.awayTeam,
      venue: fixture.venue,
      confidence: "Pending",
      insight: "Prediction will be generated when match data is available.",
    }));

    const { error } = await supabase
      .from("world_cup_matches")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      await supabase.from("fixture_sync_logs").insert({
        provider: "football-data.org",
        success: false,
        imported_count: 0,
        error_message: error.message,
      });

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    await supabase.from("fixture_sync_logs").insert({
      provider: "football-data.org",
      success: true,
      imported_count: rows.length,
      error_message: null,
    });

    return NextResponse.json({
      success: true,
      imported: rows.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown fixture sync error.";

    await supabase.from("fixture_sync_logs").insert({
      provider: "football-data.org",
      success: false,
      imported_count: 0,
      error_message: message,
    });

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}