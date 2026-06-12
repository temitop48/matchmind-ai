import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

type PredictionHistoryRow = {
  market_name: string;
  was_correct: boolean | null;
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

  const rows = data as PredictionHistoryRow[];

  const total = rows.length;
  const correct = rows.filter((row) => row.was_correct === true).length;

  const byMarket: Record<
    string,
    { total: number; correct: number; accuracy: number }
  > = {};

  for (const row of rows) {
    if (!byMarket[row.market_name]) {
      byMarket[row.market_name] = {
        total: 0,
        correct: 0,
        accuracy: 0,
      };
    }

    byMarket[row.market_name].total += 1;

    if (row.was_correct) {
      byMarket[row.market_name].correct += 1;
    }
  }

  for (const market of Object.keys(byMarket)) {
    const item = byMarket[market];

    item.accuracy =
      item.total === 0
        ? 0
        : Math.round((item.correct / item.total) * 100);
  }

  return NextResponse.json({
    success: true,
    total,
    correct,
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    byMarket,
  });
}