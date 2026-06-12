import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { gradePredictionPick } from "../../../lib/predictionGrader";

type MatchResultRow = {
  match_id: string;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  status: string;
};

type PredictionRow = {
  id: string;
  match_id: string;
  market_name: string;
  pick: string;
};

export async function GET() {
  const { data: results, error: resultError } = await supabase
    .from("match_results")
    .select("*")
    .eq("status", "Finished");

  if (resultError) {
    return NextResponse.json(
      { success: false, error: resultError.message },
      { status: 500 }
    );
  }

  let graded = 0;

  for (const result of (results ?? []) as MatchResultRow[]) {
    if (result.home_goals === null || result.away_goals === null) {
      continue;
    }

    const { data: predictions, error: predictionError } = await supabase
      .from("prediction_history")
      .select("id, match_id, market_name, pick")
      .eq("match_id", result.match_id);

    if (predictionError) {
      continue;
    }

    for (const prediction of (predictions ?? []) as PredictionRow[]) {
      const wasCorrect = gradePredictionPick(
        prediction.market_name,
        prediction.pick,
        {
          homeTeam: result.home_team,
          awayTeam: result.away_team,
          homeGoals: result.home_goals,
          awayGoals: result.away_goals,
        }
      );

      if (wasCorrect === null) {
        continue;
      }

      await supabase
        .from("prediction_history")
        .update({
          result_status: "Reviewed",
          was_correct: wasCorrect,
        })
        .eq("id", prediction.id);

      graded += 1;
    }
  }

  return NextResponse.json({
    success: true,
    graded,
  });
}