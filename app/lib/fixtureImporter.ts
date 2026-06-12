import { fixtureProvider } from "./providers";

export async function fetchWorldCupFixtures() {
  return fixtureProvider.getFixtures();
}