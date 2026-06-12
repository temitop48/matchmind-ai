import { supabase } from "./supabase";
import { mapDatabaseMatchToWorldCupMatch } from "./matchMapper";
import type { Match } from "../types/match";
import type { WorldCupMatch } from "../data/worldCupMatches";

export async function getUpcomingWorldCupMatches(): Promise<WorldCupMatch[]> {
  const { data, error } = await supabase
    .from("world_cup_matches")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data as Match[]).map(mapDatabaseMatchToWorldCupMatch);
}

export async function getMatchById(id: string): Promise<WorldCupMatch | null> {
  const { data, error } = await supabase
    .from("world_cup_matches")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return mapDatabaseMatchToWorldCupMatch(data as Match);
}