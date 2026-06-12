export function normalizeTeamKey(team: string) {
  const cleanTeam = team.trim();

  const aliases: Record<string, string> = {
    "United States": "USA",
    "United States of America": "USA",
    USMNT: "USA",

    "Korea Republic": "SouthKorea",
    "South Korea": "SouthKorea",

    "Saudi Arabia": "SaudiArabia",
    "South Africa": "SouthAfrica",
    "New Zealand": "NewZealand",
    "Costa Rica": "CostaRica",
    "Cabo Verde": "CaboVerde",
    "Cape Verde": "CaboVerde",
    "Ivory Coast": "IvoryCoast",
    "Côte d'Ivoire": "IvoryCoast",
    "Cote d'Ivoire": "IvoryCoast",
  };

  if (aliases[cleanTeam]) {
    return aliases[cleanTeam];
  }

  return cleanTeam.replace(/\s+/g, "");
}