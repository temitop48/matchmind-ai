import type { MatchPrediction } from "./predictionEngine";
import type { MarketLearningWeight } from "./learningWeights";

export type PredictionQuality = {
  score: number;
  label: "Weak" | "Developing" | "Strong";
  note: string;
};

export function calculatePredictionQuality(
  prediction: MatchPrediction,
  weights: Record<string, MarketLearningWeight> = {}
): PredictionQuality {
  const activeMarkets = prediction.markets.filter(
    (market) => market.probability > 0
  );

  const weightedScores = activeMarkets.map((market) => {
    const weight = weights[market.name]?.trust_weight ?? 1;
    return market.probability * weight;
  });

  const averageProbability =
    weightedScores.length === 0
      ? 0
      : Math.round(
          weightedScores.reduce((sum, value) => sum + value, 0) /
            weightedScores.length
        );

  const highConfidenceCount = activeMarkets.filter(
    (market) => market.confidence === "High"
  ).length;

  const score = Math.min(
    100,
    Math.round(averageProbability * 0.7 + highConfidenceCount * 8)
  );

  if (score >= 75) {
    return {
      score,
      label: "Strong",
      note:
        "This prediction has strong market confidence and useful learning-weight support.",
    };
  }

  if (score >= 50) {
    return {
      score,
      label: "Developing",
      note:
        "This prediction has useful signals, but historical market trust is still developing.",
    };
  }

  return {
    score,
    label: "Weak",
    note:
      "This prediction needs confirmed teams, stronger match data, or better historical market confidence.",
  };
}