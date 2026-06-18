import { NextResponse } from "next/server";

async function runJob(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${path} failed: ${errorText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const fixtures = await runJob("/api/fixtures/sync");
    const teamStats = await runJob("/api/team-stats/sync");
    const results = await runJob("/api/results/sync");
    const grading = await runJob("/api/predictions/grade");
    const predictions = await runJob("/api/predictions/generate-daily");
    const learning = await runJob("/api/learning/update");

    return NextResponse.json({
      success: true,
      message: "Daily sync completed.",
      results: {
        fixtures,
        teamStats,
        results,
        grading,
        predictions,
        learning,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown cron sync error.",
      },
      { status: 500 },
    );
  }
}
