import type { WorldCupMatch } from "../data/worldCupMatches";
import type { TeamStrength } from "../types/prediction";
import { calculateMatchProbabilities } from "./predictionBrain";
import { getTeamStats } from "./teamStatsAgent";
import { convertStatsToRating } from "./teamStatsRating";
import { getTeamStrengthFromRegistry } from "./teamStrength";
import { getTeamNews } from "./newsAgent";
import { getCombinedNewsRisk } from "./newsImpact";

export type PredictionMarket = {
  name: string;
  pick: string;
  probability: number;
  confidence: "Low" | "Medium" | "High";
  reason: string;
};

export type MatchPrediction = {
  matchId: string;
  modelVersion: string;
  riskLevel: "Low" | "Medium" | "High";
  summary: string;
  markets: PredictionMarket[];
};

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

function getConfidence(probability: number): "Low" | "Medium" | "High" {
  if (probability >= 70) return "High";
  if (probability >= 55) return "Medium";
  return "Low";
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

export async function generatePrediction(
  match: WorldCupMatch
): Promise<MatchPrediction> {
  const hasUnknownTeam = match.homeTeam === "TBD" || match.awayTeam === "TBD";

  if (hasUnknownTeam) {
    return {
      matchId: match.id,
      modelVersion: "v0.6",
      riskLevel: "High",
      summary:
        "Prediction is limited because one or both teams are not confirmed yet.",
      markets: pendingMarkets.map((name) => ({
        name,
        pick: "Pending",
        probability: 0,
        confidence: "Low",
        reason: "This market needs confirmed teams, squad data, and recent form.",
      })),
    };
  }

  let homeStrength: TeamStrength = getTeamStrengthFromRegistry(match.homeTeam);
  let awayStrength: TeamStrength = getTeamStrengthFromRegistry(match.awayTeam);

  try {
    const homeStats = await getTeamStats(match.homeTeam);
    const awayStats = await getTeamStats(match.awayTeam);

    const homeStatsStrength = convertStatsToRating(homeStats);
    const awayStatsStrength = convertStatsToRating(awayStats);

    homeStrength = {
      attack: Math.round(
        homeStrength.attack * 0.7 + homeStatsStrength.attack * 0.3
      ),
      defense: Math.round(
        homeStrength.defense * 0.7 + homeStatsStrength.defense * 0.3
      ),
      form: Math.round(homeStrength.form * 0.5 + homeStatsStrength.form * 0.5),
      availability: homeStrength.availability,
    };

    awayStrength = {
      attack: Math.round(
        awayStrength.attack * 0.7 + awayStatsStrength.attack * 0.3
      ),
      defense: Math.round(
        awayStrength.defense * 0.7 + awayStatsStrength.defense * 0.3
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
    newsRisk
  );
  const adjustedDraw = adjustProbabilityForRisk(probabilities.draw, newsRisk);
  const adjustedAwayWin = adjustProbabilityForRisk(
    probabilities.awayWin,
    newsRisk
  );
  const adjustedBtts = adjustProbabilityForRisk(probabilities.btts, newsRisk);
  const adjustedOver25 = adjustProbabilityForRisk(
    probabilities.over25,
    newsRisk
  );

  const strongestOutcome =
    adjustedHomeWin >= adjustedAwayWin && adjustedHomeWin >= adjustedDraw
      ? `${match.homeTeam} Win`
      : adjustedAwayWin >= adjustedHomeWin && adjustedAwayWin >= adjustedDraw
        ? `${match.awayTeam} Win`
        : "Draw";

  const doubleChance =
    adjustedHomeWin >= adjustedAwayWin
      ? `${match.homeTeam} or Draw`
      : `${match.awayTeam} or Draw`;

  const drawNoBet =
    adjustedHomeWin >= adjustedAwayWin ? match.homeTeam : match.awayTeam;

  const doubleChanceProbability =
    adjustedHomeWin >= adjustedAwayWin
      ? adjustedHomeWin + adjustedDraw
      : adjustedAwayWin + adjustedDraw;

  return {
    matchId: match.id,
    modelVersion: "v0.6",
    riskLevel,
    summary:
      newsRisk > 0
        ? `This prediction uses national team registry strength, recent form fallback, and news impact analysis. Current news risk score is ${newsRisk}%.`
        : "This prediction uses national team registry strength, recent form fallback, attack, defense, and availability.",
    markets: [
      {
        name: "Full Time Result",
        pick: strongestOutcome,
        probability: Math.max(adjustedHomeWin, adjustedDraw, adjustedAwayWin),
        confidence: getConfidence(
          Math.max(adjustedHomeWin, adjustedDraw, adjustedAwayWin)
        ),
        reason:
          "Outcome probability is calculated from weighted team attack, defense, form, availability, home advantage, and news-risk adjustment.",
      },
      {
        name: "Double Chance",
        pick: doubleChance,
        probability: Math.min(100, doubleChanceProbability),
        confidence: getConfidence(Math.min(100, doubleChanceProbability)),
        reason:
          "Double chance combines the stronger side with draw protection, adjusted for current news risk.",
      },
      {
        name: "Draw No Bet",
        pick: drawNoBet,
        probability: Math.max(adjustedHomeWin, adjustedAwayWin),
        confidence: getConfidence(Math.max(adjustedHomeWin, adjustedAwayWin)),
        reason:
          "Draw no bet favors the team with the higher adjusted win probability while reducing draw exposure.",
      },
      {
        name: "BTTS",
        pick: adjustedBtts >= 55 ? "Yes" : "No",
        probability: adjustedBtts,
        confidence: getConfidence(adjustedBtts),
        reason:
          "BTTS is estimated from both teams' attacking strength, defensive weakness, and news-risk adjustment.",
      },
      {
        name: "Over/Under Goals",
        pick: adjustedOver25 >= 55 ? "Over 2.5" : "Under 2.5",
        probability: adjustedOver25,
        confidence: getConfidence(adjustedOver25),
        reason:
          "Goal trend is calculated from attacking average, defensive weakness, and news-risk adjustment.",
      },
      {
        name: "Handicap",
        pick:
          adjustedHomeWin >= adjustedAwayWin
            ? `${match.homeTeam} +0.5`
            : `${match.awayTeam} +0.5`,
        probability: Math.min(100, doubleChanceProbability),
        confidence: getConfidence(Math.min(100, doubleChanceProbability)),
        reason:
          "A conservative handicap protects the stronger adjusted side against a draw.",
      },
      {
        name: "Half-Time/Full-Time",
        pick: "Pending deeper model",
        probability: 0,
        confidence: "Low",
        reason:
          "This market needs half-time trend data and historical match tempo analysis.",
      },
      {
        name: "Corners Outlook",
        pick: "Pending statistics",
        probability: 0,
        confidence: "Low",
        reason:
          "Corner predictions need crossing volume, possession style, and shot pressure data.",
      },
      {
        name: "Cards Outlook",
        pick: "Pending referee profile",
        probability: 0,
        confidence: "Low",
        reason:
          "Card predictions need referee tendency, rivalry intensity, and team discipline data.",
      },
      {
        name: "Anytime Goalscorer",
        pick: "Pending lineup",
        probability: 0,
        confidence: "Low",
        reason:
          "Player predictions require expected starters, role, penalties, and minutes projection.",
      },
      {
        name: "Player Shots on Target",
        pick: "Pending lineup",
        probability: 0,
        confidence: "Low",
        reason:
          "Shot predictions require player role, minutes expectation, and tactical setup.",
      },
    ],
  };
}