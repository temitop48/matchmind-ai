import { calculateTeamRating } from "./teamRatingEngine";

export const sampleTeamRatings = {
  Argentina: calculateTeamRating({
    fifaRank: 1,
    eloRating: 2140,
    recentWins: 4,
    recentDraws: 1,
    recentLosses: 0,
    goalsFor: 11,
    goalsAgainst: 3,
    availabilityScore: 92,
  }),

  France: calculateTeamRating({
    fifaRank: 2,
    eloRating: 2100,
    recentWins: 4,
    recentDraws: 0,
    recentLosses: 1,
    goalsFor: 10,
    goalsAgainst: 4,
    availabilityScore: 90,
  }),

  Brazil: calculateTeamRating({
    fifaRank: 5,
    eloRating: 2050,
    recentWins: 3,
    recentDraws: 1,
    recentLosses: 1,
    goalsFor: 9,
    goalsAgainst: 5,
    availabilityScore: 88,
  }),
};