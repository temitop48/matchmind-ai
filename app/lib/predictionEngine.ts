import type { WorldCupMatch } from "../data/worldCupMatches";
import type { TeamStrength } from "../types/prediction";
import type { TeamStats } from "../types/teamStats";
import { calculateMatchProbabilities } from "./predictionBrain";
import { getTeamStats } from "./teamStatsAgent";
import { convertStatsToRating } from "./teamStatsRating";
import { getTeamStrengthFromRegistry } from "./teamStrength";
import { getTeamNews } from "./newsAgent";
import { getCombinedNewsRisk } from "./newsImpact";
import { calculateTeamRating } from "./teamRatingEngine";
import { calculateEloAdjustment } from "./eloEngine";
import { calculateFifaRankingAdjustment } from "./fifaRankingEngine";
import { calculateHeadToHeadAdjustment } from "./headToHeadEngine";

export type RecommendationTier = "Strong" | "Watchlist" | "Avoid";

export type PredictionMarket = {
  name: string;
  pick: string;
  probability: number;
  confidence: "Low" | "Medium" | "High";
  recommendationTier: RecommendationTier;
  reason: string;
};

export type MatchPrediction = {
  matchId: string;
  modelVersion: string;
  riskLevel: "Low" | "Medium" | "High";
  summary: string;
  teamRatings: {
    home: {
      team: string;
      overall: number;
      attack: number;
      defense: number;
      form: number;
    };
    away: {
      team: string;
      overall: number;
      attack: number;
      defense: number;
      form: number;
    };
    advantage: string;
  };
  markets: PredictionMarket[];
};

const MODEL_VERSION = "v1.2-phase93a";

const pendingMarkets = [
  "Full Time Result",
  "Double Chance",
  "Draw No Bet",
  "BTTS",
  "Over/Under Goals",
  "Handicap",
  "Half-Time/Full-Time",
  "Corners Outlook",
  "Cards Outlook",
  "Anytime Goalscorer",
  "Player Shots on Target",
];

const fallbackStats: TeamStats = {
  team: "Unknown",
  matchesPlayed: 5,
  wins: 2,
  draws: 2,
  losses: 1,
  goalsFor: 7,
  goalsAgainst: 5,
  points: 8,
};

function getConfidence(probability: number): "Low" | "Medium" | "High" {
  if (probability >= 70) return "High";
  if (probability >= 55) return "Medium";
  return "Low";
}

function getRecommendationTier(
  probability: number,
  confidence: "Low" | "Medium" | "High",
): RecommendationTier {
  if (probability >= 70 && confidence === "High") return "Strong";
  if (probability >= 55 && confidence !== "Low") return "Watchlist";
  return "Avoid";
}

function getRiskLevel(newsRisk: number): "Low" | "Medium" | "High" {
  if (newsRisk >= 50) return "High";
  if (newsRisk >= 20) return "Medium";
  return "Low";
}

function adjustProbabilityForRisk(probability: number, newsRisk: number) {
  const penalty = Math.round(newsRisk * 0.15);
  return Math.max(0, probability - penalty);
}

function adjustWinProbabilityForRating(
  probability: number,
  ratingDifference: number,
  side: "home" | "away",
) {
  const ratingImpact = Math.min(8, Math.abs(ratingDifference) * 0.25);

  if (side === "home" && ratingDifference > 0) {
    return Math.min(100, probability + ratingImpact);
  }

  if (side === "home" && ratingDifference < 0) {
    return Math.max(0, probability - ratingImpact);
  }

  if (side === "away" && ratingDifference < 0) {
    return Math.min(100, probability + ratingImpact);
  }

  if (side === "away" && ratingDifference > 0) {
    return Math.max(0, probability - ratingImpact);
  }

  return probability;
}

function adjustWinProbabilityForIntelligence(
  probability: number,
  intelligenceAdjustment: number,
  side: "home" | "away",
) {
  const impact = Math.round(intelligenceAdjustment * 100);

  if (side === "home") {
    return Math.max(0, Math.min(100, probability + impact));
  }

  return Math.max(0, Math.min(100, probability - impact));
}

function getRatingAdvantageLabel(
  ratingDifference: number,
  homeTeam: string,
  awayTeam: string,
) {
  if (ratingDifference >= 10) return `${homeTeam} clear rating edge`;
  if (ratingDifference >= 4) return `${homeTeam} slight rating edge`;
  if (ratingDifference <= -10) return `${awayTeam} clear rating edge`;
  if (ratingDifference <= -4) return `${awayTeam} slight rating edge`;

  return "Balanced rating profile";
}

async function fetchSupabaseRows<T>(table: string, query: string): Promise<T[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${table}:`, error);
    return [];
  }
}

async function getTeamElo(teamName: string): Promise<number | null> {
  const rows = await fetchSupabaseRows<{ elo_rating: number | string }>(
    "team_elo_ratings",
    `team_name=eq.${encodeURIComponent(teamName)}&select=elo_rating&limit=1`,
  );

  const rating = rows[0]?.elo_rating;
  return rating ? Number(rating) : null;
}

async function getFifaRank(teamName: string): Promise<number | null> {
  const rows = await fetchSupabaseRows<{ fifa_rank: number }>(
    "fifa_rankings",
    `team_name=eq.${encodeURIComponent(teamName)}&select=fifa_rank&limit=1`,
  );

  return rows[0]?.fifa_rank ?? null;
}

async function getHeadToHeadRecord(homeTeam: string, awayTeam: string) {
  const direct = await fetchSupabaseRows<{
    matches: number;
    team_a_wins: number;
    draws: number;
    team_b_wins: number;
    goals_a: number;
    goals_b: number;
  }>(
    "head_to_head_records",
    `team_a=eq.${encodeURIComponent(homeTeam)}&team_b=eq.${encodeURIComponent(
      awayTeam,
    )}&select=*&limit=1`,
  );

  if (direct[0]) {
    return {
      record: {
        matches: direct[0].matches,
        teamAWins: direct[0].team_a_wins,
        draws: direct[0].draws,
        teamBWins: direct[0].team_b_wins,
        goalsA: direct[0].goals_a,
        goalsB: direct[0].goals_b,
      },
      homeTeamIsTeamA: true,
    };
  }

  const reverse = await fetchSupabaseRows<{
    matches: number;
    team_a_wins: number;
    draws: number;
    team_b_wins: number;
    goals_a: number;
    goals_b: number;
  }>(
    "head_to_head_records",
    `team_a=eq.${encodeURIComponent(awayTeam)}&team_b=eq.${encodeURIComponent(
      homeTeam,
    )}&select=*&limit=1`,
  );

  if (reverse[0]) {
    return {
      record: {
        matches: reverse[0].matches,
        teamAWins: reverse[0].team_a_wins,
        draws: reverse[0].draws,
        teamBWins: reverse[0].team_b_wins,
        goalsA: reverse[0].goals_a,
        goalsB: reverse[0].goals_b,
      },
      homeTeamIsTeamA: false,
    };
  }

  return {
    record: null,
    homeTeamIsTeamA: true,
  };
}

function createMarket(
  name: string,
  pick: string,
  probability: number,
  reason: string,
): PredictionMarket {
  const roundedProbability = Math.round(probability);
  const confidence = getConfidence(roundedProbability);

  return {
    name,
    pick,
    probability: roundedProbability,
    confidence,
    recommendationTier: getRecommendationTier(roundedProbability, confidence),
    reason,
  };
}

function sortMarketsByRecommendationTier(
  markets: PredictionMarket[],
): PredictionMarket[] {
  const tierOrder: Record<RecommendationTier, number> = {
    Strong: 0,
    Watchlist: 1,
    Avoid: 2,
  };

  return [...markets].sort(
    (a, b) =>
      tierOrder[a.recommendationTier] - tierOrder[b.recommendationTier],
  );
}

export async function generatePrediction(
  match: WorldCupMatch,
): Promise<MatchPrediction> {
  const hasUnknownTeam = match.homeTeam === "TBD" || match.awayTeam === "TBD";

  if (hasUnknownTeam) {
    const pendingPredictionMarkets: PredictionMarket[] = pendingMarkets.map(
      (name) => ({
        name,
        pick: "Pending",
        probability: 0,
        confidence: "Low",
        recommendationTier: "Avoid",
        reason:
          "This market needs confirmed teams, squad data, and recent form.",
      }),
    );

    return {
      matchId: match.id,
      modelVersion: MODEL_VERSION,
      riskLevel: "High",
      summary:
        "Prediction is limited because one or both teams are not confirmed yet.",
      teamRatings: {
        home: {
          team: match.homeTeam,
          overall: 0,
          attack: 0,
          defense: 0,
          form: 0,
        },
        away: {
          team: match.awayTeam,
          overall: 0,
          attack: 0,
          defense: 0,
          form: 0,
        },
        advantage: "Unavailable until teams are confirmed",
      },
      markets: pendingPredictionMarkets,
    };
  }

  let homeStrength: TeamStrength = getTeamStrengthFromRegistry(match.homeTeam);
  let awayStrength: TeamStrength = getTeamStrengthFromRegistry(match.awayTeam);

  let homeStatsForRating: TeamStats = {
    ...fallbackStats,
    team: match.homeTeam,
  };

  let awayStatsForRating: TeamStats = {
    ...fallbackStats,
    team: match.awayTeam,
  };

  try {
    const homeStats = await getTeamStats(match.homeTeam);
    const awayStats = await getTeamStats(match.awayTeam);

    homeStatsForRating = homeStats;
    awayStatsForRating = awayStats;

    const homeStatsStrength = convertStatsToRating(homeStats);
    const awayStatsStrength = convertStatsToRating(awayStats);

    homeStrength = {
      attack: Math.round(
        homeStrength.attack * 0.7 + homeStatsStrength.attack * 0.3,
      ),
      defense: Math.round(
        homeStrength.defense * 0.7 + homeStatsStrength.defense * 0.3,
      ),
      form: Math.round(homeStrength.form * 0.5 + homeStatsStrength.form * 0.5),
      availability: homeStrength.availability,
    };

    awayStrength = {
      attack: Math.round(
        awayStrength.attack * 0.7 + awayStatsStrength.attack * 0.3,
      ),
      defense: Math.round(
        awayStrength.defense * 0.7 + awayStatsStrength.defense * 0.3,
      ),
      form: Math.round(awayStrength.form * 0.5 + awayStatsStrength.form * 0.5),
      availability: awayStrength.availability,
    };
  } catch (error) {
    console.error("Failed to load team stats:", error);
  }

  const probabilities = calculateMatchProbabilities(homeStrength, awayStrength);

  const homeNews = await getTeamNews(match.homeTeam);
  const awayNews = await getTeamNews(match.awayTeam);
  const newsRisk = getCombinedNewsRisk(homeNews, awayNews);
  const riskLevel = getRiskLevel(newsRisk);

  const adjustedHomeWin = adjustProbabilityForRisk(
    probabilities.homeWin,
    newsRisk,
  );
  const adjustedDraw = adjustProbabilityForRisk(probabilities.draw, newsRisk);
  const adjustedAwayWin = adjustProbabilityForRisk(
    probabilities.awayWin,
    newsRisk,
  );
  const adjustedBtts = adjustProbabilityForRisk(probabilities.btts, newsRisk);
  const adjustedOver25 = adjustProbabilityForRisk(
    probabilities.over25,
    newsRisk,
  );

  const homeRating = calculateTeamRating({
    recentWins: homeStatsForRating.wins,
    recentDraws: homeStatsForRating.draws,
    recentLosses: homeStatsForRating.losses,
    goalsFor: homeStatsForRating.goalsFor,
    goalsAgainst: homeStatsForRating.goalsAgainst,
    availabilityScore: homeStrength.availability,
  });

  const awayRating = calculateTeamRating({
    recentWins: awayStatsForRating.wins,
    recentDraws: awayStatsForRating.draws,
    recentLosses: awayStatsForRating.losses,
    goalsFor: awayStatsForRating.goalsFor,
    goalsAgainst: awayStatsForRating.goalsAgainst,
    availabilityScore: awayStrength.availability,
  });

  const ratingDifference = homeRating.overall - awayRating.overall;

  const ratingAdvantage = getRatingAdvantageLabel(
    ratingDifference,
    match.homeTeam,
    match.awayTeam,
  );

  const ratingAdjustedHomeWinBase = adjustWinProbabilityForRating(
    adjustedHomeWin,
    ratingDifference,
    "home",
  );

  const ratingAdjustedAwayWinBase = adjustWinProbabilityForRating(
    adjustedAwayWin,
    ratingDifference,
    "away",
  );

  const [homeElo, awayElo, homeFifaRank, awayFifaRank, h2hData] =
    await Promise.all([
      getTeamElo(match.homeTeam),
      getTeamElo(match.awayTeam),
      getFifaRank(match.homeTeam),
      getFifaRank(match.awayTeam),
      getHeadToHeadRecord(match.homeTeam, match.awayTeam),
    ]);

  const eloInsight = calculateEloAdjustment(homeElo, awayElo);

  const fifaInsight = calculateFifaRankingAdjustment(
    homeFifaRank,
    awayFifaRank,
  );

  const h2hInsight = calculateHeadToHeadAdjustment(
    h2hData.record,
    h2hData.homeTeamIsTeamA,
  );

  const intelligenceAdjustment = Math.max(
    -0.15,
    Math.min(
      0.15,
      eloInsight.adjustment + fifaInsight.adjustment + h2hInsight.adjustment,
    ),
  );

  const ratingAdjustedHomeWin = adjustWinProbabilityForIntelligence(
    ratingAdjustedHomeWinBase,
    intelligenceAdjustment,
    "home",
  );

  const ratingAdjustedAwayWin = adjustWinProbabilityForIntelligence(
    ratingAdjustedAwayWinBase,
    intelligenceAdjustment,
    "away",
  );

  const strongestOutcome =
    ratingAdjustedHomeWin >= ratingAdjustedAwayWin &&
    ratingAdjustedHomeWin >= adjustedDraw
      ? `${match.homeTeam} Win`
      : ratingAdjustedAwayWin >= ratingAdjustedHomeWin &&
          ratingAdjustedAwayWin >= adjustedDraw
        ? `${match.awayTeam} Win`
        : "Draw";

  const doubleChance =
    ratingAdjustedHomeWin >= ratingAdjustedAwayWin
      ? `${match.homeTeam} or Draw`
      : `${match.awayTeam} or Draw`;

  const drawNoBet =
    ratingAdjustedHomeWin >= ratingAdjustedAwayWin
      ? match.homeTeam
      : match.awayTeam;

  const doubleChanceProbability = Math.min(
    100,
    ratingAdjustedHomeWin >= ratingAdjustedAwayWin
      ? ratingAdjustedHomeWin + adjustedDraw
      : ratingAdjustedAwayWin + adjustedDraw,
  );

  const maxOutcomeProbability = Math.max(
    ratingAdjustedHomeWin,
    adjustedDraw,
    ratingAdjustedAwayWin,
  );

  const markets: PredictionMarket[] = [
    createMarket(
      "Full Time Result",
      strongestOutcome,
      maxOutcomeProbability,
      "Outcome probability is calculated from weighted team attack, defense, form, availability, home advantage, team rating difference, Elo rating, FIFA ranking, head-to-head record, and news-risk adjustment.",
    ),
    createMarket(
      "Double Chance",
      doubleChance,
      doubleChanceProbability,
      "Double chance combines the stronger side with draw protection, adjusted for current news risk, team rating gap, Elo rating, FIFA ranking, and head-to-head record.",
    ),
    createMarket(
      "Draw No Bet",
      drawNoBet,
      Math.max(ratingAdjustedHomeWin, ratingAdjustedAwayWin),
      "Draw no bet favors the team with the higher adjusted win probability while reducing draw exposure.",
    ),
    createMarket(
      "BTTS",
      adjustedBtts >= 55 ? "Yes" : "No",
      adjustedBtts,
      "BTTS is estimated from both teams' attacking strength, defensive weakness, and news-risk adjustment. Historical learning weight may reduce confidence if this market performs poorly.",
    ),
    createMarket(
      "Over/Under Goals",
      adjustedOver25 >= 55 ? "Over 2.5" : "Under 2.5",
      adjustedOver25,
      "Goal trend is calculated from attacking average, defensive weakness, and news-risk adjustment. This market is adjusted as historical accuracy improves.",
    ),
    createMarket(
      "Handicap",
      ratingAdjustedHomeWin >= ratingAdjustedAwayWin
        ? `${match.homeTeam} +0.5`
        : `${match.awayTeam} +0.5`,
      doubleChanceProbability,
      "A conservative handicap protects the stronger adjusted side against a draw.",
    ),
    {
      name: "Half-Time/Full-Time",
      pick: "Pending deeper model",
      probability: 0,
      confidence: "Low",
      recommendationTier: "Avoid",
      reason:
        "This market needs half-time trend data and historical match tempo analysis.",
    },
    {
      name: "Corners Outlook",
      pick: "Pending statistics",
      probability: 0,
      confidence: "Low",
      recommendationTier: "Avoid",
      reason:
        "Corner predictions need crossing volume, possession style, and shot pressure data.",
    },
    {
      name: "Cards Outlook",
      pick: "Pending referee profile",
      probability: 0,
      confidence: "Low",
      recommendationTier: "Avoid",
      reason:
        "Card predictions need referee tendency, rivalry intensity, and team discipline data.",
    },
    {
      name: "Anytime Goalscorer",
      pick: "Pending lineup",
      probability: 0,
      confidence: "Low",
      recommendationTier: "Avoid",
      reason:
        "Player predictions require expected starters, role, penalties, and minutes projection.",
    },
    {
      name: "Player Shots on Target",
      pick: "Pending lineup",
      probability: 0,
      confidence: "Low",
      recommendationTier: "Avoid",
      reason:
        "Shot predictions require player role, minutes expectation, and tactical setup.",
    },
  ];

  return {
    matchId: match.id,
    modelVersion: MODEL_VERSION,
    riskLevel,
    summary:
      newsRisk > 0
        ? `This prediction uses registry strength, synced stats, team rating advantage (${ratingAdvantage}), Elo insight (${eloInsight.label}), FIFA ranking insight (${fifaInsight.label}), head-to-head insight (${h2hInsight.label}), and news impact analysis. Current news risk score is ${newsRisk}%.`
        : `This prediction uses registry strength, synced stats, team rating advantage (${ratingAdvantage}), Elo insight (${eloInsight.label}), FIFA ranking insight (${fifaInsight.label}), head-to-head insight (${h2hInsight.label}), attack, defense, form, and availability.`,
    teamRatings: {
      home: {
        team: match.homeTeam,
        overall: homeRating.overall,
        attack: homeRating.attack,
        defense: homeRating.defense,
        form: homeRating.form,
      },
      away: {
        team: match.awayTeam,
        overall: awayRating.overall,
        attack: awayRating.attack,
        defense: awayRating.defense,
        form: awayRating.form,
      },
      advantage: ratingAdvantage,
    },
    markets: sortMarketsByRecommendationTier(markets as PredictionMarket[]),
  };
}