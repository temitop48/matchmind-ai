import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { getMatchById } from "../../../lib/fixtures";
import { generatePrediction } from "../../../lib/predictionEngine";
import { calculatePredictionQuality } from "../../../lib/predictionQuality";
import { getMarketLearningWeights } from "../../../lib/learningWeights";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matchId = body.matchId as string;

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: "matchId is required." },
        { status: 400 },
      );
    }

    const match = await getMatchById(matchId);

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found." },
        { status: 404 },
      );
    }

    const prediction = await generatePrediction(match);
    const weights = await getMarketLearningWeights();
    const quality = calculatePredictionQuality(prediction, weights);

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

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      saved: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown prediction save error.",
      },
      { status: 500 },
    );
  }
}
