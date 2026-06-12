import { NextResponse } from "next/server";
import { getMatchById } from "../../../lib/fixtures";
import { generatePrediction } from "../../../lib/predictionEngine";
import { createPredictionHash } from "../../../lib/predictionHash";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matchId = body.matchId as string;

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: "matchId is required." },
        { status: 400 }
      );
    }

    const match = await getMatchById(matchId);

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found." },
        { status: 404 }
      );
    }

    const prediction = await generatePrediction(match);
    const predictionHash = createPredictionHash(prediction);

    const { error } = await supabase.from("prediction_proofs").upsert(
      {
        match_id: match.id,
        model_version: prediction.modelVersion,
        prediction_hash: predictionHash,
        proof_status: "Offchain",
        chain: null,
        transaction_hash: null,
      },
      {
        onConflict: "prediction_hash",
      }
    );

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      matchId: match.id,
      predictionHash,
      status: "Offchain",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown proof error.",
      },
      { status: 500 }
    );
  }
}