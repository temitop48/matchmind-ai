import { nationalTeamRatings } from "../data/nationalTeamRatings";
import type { TeamStrength } from "../types/prediction";
import { normalizeTeamKey } from "./teamNameNormalizer";

const fallbackStrength: TeamStrength = {
  attack: 50,
  defense: 50,
  form: 50,
  availability: 50,
};

export function getTeamStrengthFromRegistry(team: string): TeamStrength {
  const key = normalizeTeamKey(team);
  const rating = nationalTeamRatings[key];

  if (!rating) {
    return fallbackStrength;
  }

  return {
    attack: rating.attack,
    defense: rating.defense,
    form: Math.round((rating.midfield + rating.depth) / 2),
    availability: rating.depth,
  };
}