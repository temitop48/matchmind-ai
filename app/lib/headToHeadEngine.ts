export type HeadToHeadRecord = {
  matches: number;
  teamAWins: number;
  draws: number;
  teamBWins: number;
  goalsA: number;
  goalsB: number;
};

export type HeadToHeadInsight = {
  matches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  homeGoals: number;
  awayGoals: number;
  adjustment: number;
  label: string;
};

export function calculateHeadToHeadAdjustment(
  record: HeadToHeadRecord | null,
  homeTeamIsTeamA: boolean
): HeadToHeadInsight {
  if (!record || record.matches === 0) {
    return {
      matches: 0,
      homeWins: 0,
      draws: 0,
      awayWins: 0,
      homeGoals: 0,
      awayGoals: 0,
      adjustment: 0,
      label: "No head-to-head data available",
    };
  }

  const homeWins = homeTeamIsTeamA ? record.teamAWins : record.teamBWins;
  const awayWins = homeTeamIsTeamA ? record.teamBWins : record.teamAWins;
  const homeGoals = homeTeamIsTeamA ? record.goalsA : record.goalsB;
  const awayGoals = homeTeamIsTeamA ? record.goalsB : record.goalsA;

  const winDifference = homeWins - awayWins;
  const goalDifference = homeGoals - awayGoals;

  let adjustment = 0;
  let label = "Balanced head-to-head record";

  if (winDifference >= 4) {
    adjustment = 0.05;
    label = "Dominant home head-to-head edge";
  } else if (winDifference >= 2) {
    adjustment = 0.03;
    label = "Clear home head-to-head edge";
  } else if (winDifference <= -4) {
    adjustment = -0.05;
    label = "Dominant away head-to-head edge";
  } else if (winDifference <= -2) {
    adjustment = -0.03;
    label = "Clear away head-to-head edge";
  } else if (goalDifference >= 5) {
    adjustment = 0.02;
    label = "Home goal-difference head-to-head edge";
  } else if (goalDifference <= -5) {
    adjustment = -0.02;
    label = "Away goal-difference head-to-head edge";
  }

  return {
    matches: record.matches,
    homeWins,
    draws: record.draws,
    awayWins,
    homeGoals,
    awayGoals,
    adjustment,
    label,
  };
}