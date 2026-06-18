import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

type FootballDataMatch = {
  id: number;
  status: string;
  homeTeam: {
    name: string | null;
  };
  awayTeam: {
    name: string | null;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
};

type FootballDataResponse = {
  matches: FootballDataMatch[];
};

function getResultLabel(homeGoals: number, awayGoals: number) {
  if (homeGoals > awayGoals) return "Home Win";
  if (awayGoals > homeGoals) return "Away Win";
  return "Draw";
}

export async function GET() {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing FOOTBALL_DATA_API_KEY." },
        { status: 500 },
      );
    }

    const today = new Date();
    const dateTo = today.toISOString().slice(0, 10);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 9);
    const dateFrom = startDate.toISOString().slice(0, 10);

    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=FINISHED`,
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          success: false,
          error: `football-data.org error: ${response.status} - ${errorText}`,
        },
        { status: 500 },
      );
    }

    const data = (await response.json()) as FootballDataResponse;

    const finishedMatches = (data.matches ?? []).filter((match) => {
      return (
        match.status === "FINISHED" &&
        match.score.fullTime.home !== null &&
        match.score.fullTime.away !== null
      );
    });

    const rows = finishedMatches.map((match) => {
      const homeGoals = match.score.fullTime.home ?? 0;
      const awayGoals = match.score.fullTime.away ?? 0;

      return {
        match_id: `fd-${match.id}`,
        home_team: match.homeTeam.name ?? "TBD",
        away_team: match.awayTeam.name ?? "TBD",
        home_goals: homeGoals,
        away_goals: awayGoals,
        status: "Finished",
        result_label: getResultLabel(homeGoals, awayGoals),
        updated_at: new Date().toISOString(),
      };
    });

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        message: "No finished matches found.",
      });
    }

    const { error } = await supabase
      .from("match_results")
      .upsert(rows, { onConflict: "match_id" });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      synced: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown result sync error.",
      },
      { status: 500 },
    );
  }
}