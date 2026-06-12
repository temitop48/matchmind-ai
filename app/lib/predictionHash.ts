import crypto from "crypto";
import type { MatchPrediction } from "./predictionEngine";

export function createPredictionHash(prediction: MatchPrediction) {
  const payload = {
    matchId: prediction.matchId,
    modelVersion: prediction.modelVersion,
    riskLevel: prediction.riskLevel,
    markets: prediction.markets.map((market) => ({
      name: market.name,
      pick: market.pick,
      probability: market.probability,
      confidence: market.confidence,
    })),
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}