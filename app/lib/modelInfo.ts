export type ModelInfo = {
  version: string;
  name: string;
  description: string;
  inputs: string[];
};

export const modelInfo: ModelInfo = {
  version: "v0.4",
  name: "Registry + Form Hybrid",
  description:
    "Uses national team registry strength, recent form fallback, attack, defense, availability, and home advantage.",
  inputs: [
    "National team starter ratings",
    "Recent form fallback",
    "Attack strength",
    "Defensive strength",
    "Availability score",
    "Home advantage",
  ],
};