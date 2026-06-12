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
  overall: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateTeamRating(
  input: TeamRatingInput
): TeamRatingResult {
  const matchesPlayed =
    input.recentWins + input.recentDraws + input.recentLosses || 1;

  const points =
    input.recentWins * 3 + input.recentDraws;

  const form = clamp((points / (matchesPlayed * 3)) * 100);

  const attack = clamp((input.goalsFor / matchesPlayed) * 35);

  const defense = clamp(100 - (input.goalsAgainst / matchesPlayed) * 35);

  const rankingBoost = input.fifaRank
    ? clamp(100 - input.fifaRank)
    : 50;

  const eloBoost = input.eloRating
    ? clamp((input.eloRating - 1200) / 8)
    : 50;

  const availability = clamp(input.availabilityScore);

  const overall = Math.round(
    form * 0.25 +
      attack * 0.2 +
      defense * 0.2 +
      rankingBoost * 0.15 +
      eloBoost * 0.1 +
      availability * 0.1
  );

  return {
    attack: Math.round(attack),
    defense: Math.round(defense),
    form: Math.round(form),
    availability: Math.round(availability),
    overall,
  };
}