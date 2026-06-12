import type {
  MatchProbabilities,
  TeamStrength,
} from "../types/prediction";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateMatchProbabilities(
  home: TeamStrength,
  away: TeamStrength
): MatchProbabilities {
  const homeScore =
    home.attack * 0.3 +
    home.defense * 0.25 +
    home.form * 0.3 +
    home.availability * 0.15 +
    5;

  const awayScore =
    away.attack * 0.3 +
    away.defense * 0.25 +
    away.form * 0.3 +
    away.availability * 0.15;

  const strengthGap = homeScore - awayScore;

  const homeWin = clamp(Math.round(40 + strengthGap * 0.45));
  const awayWin = clamp(Math.round(35 - strengthGap * 0.45));
  const draw = clamp(100 - homeWin - awayWin, 15, 35);

  const attackingAverage = (home.attack + away.attack) / 2;
  const defensiveWeakness =
    (100 - home.defense + (100 - away.defense)) / 2;

  const btts = clamp(
    Math.round(attackingAverage * 0.45 + defensiveWeakness * 0.35)
  );

  const over25 = clamp(
    Math.round(attackingAverage * 0.5 + defensiveWeakness * 0.3)
  );

  return {
    homeWin,
    draw,
    awayWin,
    btts,
    over25,
  };
}