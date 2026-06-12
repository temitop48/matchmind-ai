import type { TeamStrength } from "../types/prediction";

export const teamRatings: Record<
  string,
  TeamStrength
> = {
  Argentina: {
    attack: 90,
    defense: 88,
    form: 90,
    availability: 95,
  },

  France: {
    attack: 92,
    defense: 87,
    form: 89,
    availability: 93,
  },

  Brazil: {
    attack: 91,
    defense: 85,
    form: 88,
    availability: 94,
  },

  England: {
    attack: 89,
    defense: 84,
    form: 86,
    availability: 92,
  },
};