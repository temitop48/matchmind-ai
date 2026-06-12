import { NextResponse } from "next/server";
import { getTeamStrengthFromRegistry } from "../../lib/teamStrength";
import { normalizeTeamKey } from "../../lib/teamNameNormalizer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");

  if (!team) {
    return NextResponse.json(
      { success: false, error: "team query is required." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    team,
    normalizedKey: normalizeTeamKey(team),
    strength: getTeamStrengthFromRegistry(team),
  });
}