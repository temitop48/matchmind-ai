import { supabase } from "./supabase";

export type MarketLearningWeight = {
  market_name: string;
  total_reviewed: number;
  correct_count: number;
  accuracy: number;
  trust_weight: number;
};

export async function getMarketLearningWeights() {
  const { data, error } = await supabase
    .from("market_learning_weights")
    .select("*");

  if (error) {
    console.error("Failed to load learning weights:", error);
    return {};
  }

  const weights: Record<string, MarketLearningWeight> = {};

  for (const row of data ?? []) {
    weights[row.market_name] = row as MarketLearningWeight;
  }

  return weights;
}