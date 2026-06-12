import { NextResponse } from "next/server";
import { getTeamStats } from "../../lib/teamStatsAgent";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");

  if (!team) {
    return NextResponse.json(
      {
        success: false,
        error: "team query is required.",
      },
      { status: 400 }
    );
  }

  const stats = await getTeamStats(team);

  return NextResponse.json({
    success: true,
    team,
    stats,
  });
}