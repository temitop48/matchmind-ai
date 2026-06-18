export type FifaRankingInsight = {
  homeRank: number | null;
  awayRank: number | null;
  rankDifference: number;
  adjustment: number;
  label: string;
};

export function calculateFifaRankingAdjustment(
  homeRank: number | null,
  awayRank: number | null
): FifaRankingInsight {
  if (!homeRank || !awayRank) {
    return {
      homeRank,
      awayRank,
      rankDifference: 0,
      adjustment: 0,
      label: "No FIFA ranking data available",
    };
  }

  const rankDifference = awayRank - homeRank;

  let adjustment = 0;
  let label = "Balanced FIFA ranking profile";

  if (rankDifference >= 40) {
    adjustment = 0.05;
    label = "Major home FIFA ranking advantage";
  } else if (rankDifference >= 20) {
    adjustment = 0.03;
    label = "Strong home FIFA ranking advantage";
  } else if (rankDifference >= 10) {
    adjustment = 0.015;
    label = "Slight home FIFA ranking advantage";
  } else if (rankDifference <= -40) {
    adjustment = -0.05;
    label = "Major away FIFA ranking advantage";
  } else if (rankDifference <= -20) {
    adjustment = -0.03;
    label = "Strong away FIFA ranking advantage";
  } else if (rankDifference <= -10) {
    adjustment = -0.015;
    label = "Slight away FIFA ranking advantage";
  }

  return {
    homeRank,
    awayRank,
    rankDifference,
    adjustment,
    label,
  };
}