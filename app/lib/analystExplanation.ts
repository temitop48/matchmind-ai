import type { WorldCupMatch } from "../data/worldCupMatches";
import type { MatchPrediction } from "./predictionEngine";
import type { PredictionQuality } from "./predictionQuality";

export function generateAnalystExplanation(
  match: WorldCupMatch,
  prediction: MatchPrediction,
  quality: PredictionQuality
) {
  const activeMarkets = prediction.markets.filter(
    (market) => market.probability > 0
  );

  const topMarket = activeMarkets.sort(
    (a, b) => b.probability - a.probability
  )[0];

  if (!topMarket) {
    return `Analysis for ${match.homeTeam} vs ${match.awayTeam} is limited because the fixture still needs confirmed teams and stronger match data.`;
  }

  return `${match.homeTeam} vs ${match.awayTeam} currently has a ${quality.label.toLowerCase()} prediction profile. The strongest market is ${topMarket.name} with ${topMarket.pick} at ${topMarket.probability}%. ${quality.note}`;
}