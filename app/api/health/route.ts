import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

async function countRows(table: string) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    return {
      count: 0,
      error: error.message,
    };
  }

  return {
    count: count ?? 0,
    error: null,
  };
}

export async function GET() {
  const fixtures = await countRows("world_cup_matches");
  const syncLogs = await countRows("fixture_sync_logs");
  const predictionHistory = await countRows("prediction_history");

  return NextResponse.json({
    success: true,
    checks: {
      fixtures,
      syncLogs,
      predictionHistory,
    },
  });
}