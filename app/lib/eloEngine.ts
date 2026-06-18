export type EloInsight = {
  homeElo: number | null;
  awayElo: number | null;
  difference: number;
  adjustment: number;
  label: string;
};

export function calculateEloAdjustment(
  homeElo: number | null,
  awayElo: number | null
): EloInsight {
  if (!homeElo || !awayElo) {
    return {
      homeElo,
      awayElo,
      difference: 0,
      adjustment: 0,
      label: "No Elo data available",
    };
  }

  const difference = homeElo - awayElo;

  let adjustment = 0;
  let label = "Balanced Elo profile";

  if (difference >= 250) {
    adjustment = 0.08;
    label = "Major home Elo advantage";
  } else if (difference >= 150) {
    adjustment = 0.06;
    label = "Strong home Elo advantage";
  } else if (difference >= 75) {
    adjustment = 0.03;
    label = "Slight home Elo advantage";
  } else if (difference <= -250) {
    adjustment = -0.08;
    label = "Major away Elo advantage";
  } else if (difference <= -150) {
    adjustment = -0.06;
    label = "Strong away Elo advantage";
  } else if (difference <= -75) {
    adjustment = -0.03;
    label = "Slight away Elo advantage";
  }

  return {
    homeElo,
    awayElo,
    difference,
    adjustment,
    label,
  };
}