import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const predictionId = body.predictionId as string;
    const wasCorrect = body.wasCorrect as boolean;

    if (!predictionId) {
      return NextResponse.json(
        { success: false, error: "predictionId is required." },
        { status: 400 }
      );
    }

    if (typeof wasCorrect !== "boolean") {
      return NextResponse.json(
        { success: false, error: "wasCorrect must be true or false." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("prediction_history")
      .update({
        result_status: "Reviewed",
        was_correct: wasCorrect,
      })
      .eq("id", predictionId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reviewed: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown review error.",
      },
      { status: 500 }
    );
  }
}