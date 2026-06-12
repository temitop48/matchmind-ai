import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const predictionHash = body.predictionHash as string;
    const transactionHash = body.transactionHash as string;
    const chain = body.chain as string;

    if (!predictionHash || !transactionHash || !chain) {
      return NextResponse.json(
        {
          success: false,
          error: "predictionHash, transactionHash, and chain are required.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("prediction_proofs")
      .update({
        proof_status: "Onchain",
        chain,
        transaction_hash: transactionHash,
      })
      .eq("prediction_hash", predictionHash);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown proof update error.",
      },
      { status: 500 }
    );
  }
}