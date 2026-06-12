import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

type PredictionRow = {
  market_name: string;
  was_correct: boolean;
};

export async function GET() {
  const { data, error } = await supabase
    .from("prediction_history")
    .select("market_name, was_correct")
    .not("was_correct", "is", null);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  const grouped: Record<string, { total: number; correct: number }> = {};

  for (const row of (data ?? []) as PredictionRow[]) {
    if (!grouped[row.market_name]) {
      grouped[row.market_name] = { total: 0, correct: 0 };
    }

    grouped[row.market_name].total += 1;

    if (row.was_correct) {
      grouped[row.market_name].correct += 1;
    }
  }

  const rows = Object.entries(grouped).map(([marketName, item]) => {
    const accuracy = Math.round((item.correct / item.total) * 100);

    return {
      market_name: marketName,
      total_reviewed: item.total,
      correct_count: item.correct,
      accuracy,
      trust_weight: Math.max(0.5, Math.min(1.5, accuracy / 70)),
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from("market_learning_weights")
      .upsert(rows, { onConflict: "market_name" });

    if (upsertError) {
      return NextResponse.json(
        { success: false, error: upsertError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    updated: rows.length,
    weights: rows,
  });
}