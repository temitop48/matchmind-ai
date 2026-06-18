import { NextResponse } from "next/server";
import { getUpcomingWorldCupMatches } from "../../../lib/fixtures";
import { generatePrediction } from "../../../lib/predictionEngine";
import { calculatePredictionQuality } from "../../../lib/predictionQuality";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    const matches = await getUpcomingWorldCupMatches();

    let savedCount = 0;

    for (const match of matches) {
      const prediction = await generatePrediction(match);
      const quality = calculatePredictionQuality(prediction);

      const rows = prediction.markets.map((market) => ({
        match_id: match.id,
        market_name: market.name,
        pick: market.pick,
        probability: market.probability,
        confidence: market.confidence,
        recommendation_tier: market.recommendationTier,
        reason: market.reason,
        model_version: prediction.modelVersion,
        result_status: "Pending",
        was_correct: null,
        quality_score: quality.score,
        quality_label: quality.label,
      }));

      const { error } = await supabase.from("prediction_history").upsert(rows, {
        onConflict: "match_id,market_name,model_version",
      });

      if (!error) {
        savedCount += rows.length;
      }
    }

    return NextResponse.json({
      success: true,
      matchesProcessed: matches.length,
      savedPredictions: savedCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown daily generation error.",
      },
      { status: 500 },
    );
  }
}
