export type TeamRatingInput = {
  fifaRank?: number;
  eloRating?: number;
  recentWins: number;
  recentDraws: number;
  recentLosses: number;
  goalsFor: number;
  goalsAgainst: number;
  availabilityScore: number;
};

export type TeamRatingResult = {
  attack: number;
  defense: number;
  form: number;
  availability: number;
  rankingScore: number;
  eloScore: number;
  goalBalance: number;
  overall: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateTeamRating(input: TeamRatingInput): TeamRatingResult {
  const matchesPlayed =
    input.recentWins + input.recentDraws + input.recentLosses || 1;

  const points = input.recentWins * 3 + input.recentDraws;

  const form = clamp((points / (matchesPlayed * 3)) * 100);

  const goalsForPerMatch = input.goalsFor / matchesPlayed;
  const goalsAgainstPerMatch = input.goalsAgainst / matchesPlayed;

  const attack = clamp(goalsForPerMatch * 35);
  const defense = clamp(100 - goalsAgainstPerMatch * 35);

  const rankingScore = input.fifaRank ? clamp(105 - input.fifaRank) : 50;

  const eloScore = input.eloRating ? clamp((input.eloRating - 1200) / 8) : 50;

  const goalBalance = clamp(
    50 + (input.goalsFor - input.goalsAgainst) * 5,
  );

  const availability = clamp(input.availabilityScore);

  const overall = Math.round(
    form * 0.22 +
      attack * 0.2 +
      defense * 0.2 +
      rankingScore * 0.13 +
      eloScore * 0.1 +
      goalBalance * 0.1 +
      availability * 0.05,
  );

  return {
    attack: Math.round(attack),
    defense: Math.round(defense),
    form: Math.round(form),
    availability: Math.round(availability),
    rankingScore: Math.round(rankingScore),
    eloScore: Math.round(eloScore),
    goalBalance: Math.round(goalBalance),
    overall,
  };
}