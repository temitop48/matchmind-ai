export type MatchResultForGrading = {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
};

export function getFullTimeResult(result: MatchResultForGrading) {
  if (result.homeGoals > result.awayGoals) return `${result.homeTeam} Win`;
  if (result.awayGoals > result.homeGoals) return `${result.awayTeam} Win`;
  return "Draw";
}

export function gradePredictionPick(
  marketName: string,
  pick: string,
  result: MatchResultForGrading
) {
  const totalGoals = result.homeGoals + result.awayGoals;
  const fullTimeResult = getFullTimeResult(result);

  if (marketName === "Full Time Result") {
    return pick === fullTimeResult;
  }

  if (marketName === "BTTS") {
    const bothScored = result.homeGoals > 0 && result.awayGoals > 0;
    return pick === (bothScored ? "Yes" : "No");
  }

  if (marketName === "Over/Under Goals") {
    if (pick === "Over 2.5") return totalGoals > 2.5;
    if (pick === "Under 2.5") return totalGoals < 2.5;
  }

  return null;
}