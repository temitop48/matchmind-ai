export type NationalTeamRating = {
  fifaRank: number;
  attack: number;
  defense: number;
  midfield: number;
  depth: number;
};

export const nationalTeamRatings: Record<string, NationalTeamRating> = {
  Argentina: { fifaRank: 1, attack: 92, defense: 90, midfield: 91, depth: 89 },
  France: { fifaRank: 2, attack: 93, defense: 88, midfield: 90, depth: 94 },
  Spain: { fifaRank: 3, attack: 89, defense: 90, midfield: 93, depth: 88 },
  England: { fifaRank: 4, attack: 90, defense: 87, midfield: 89, depth: 91 },
  Brazil: { fifaRank: 5, attack: 91, defense: 86, midfield: 88, depth: 90 },

  Canada: { fifaRank: 24, attack: 78, defense: 75, midfield: 77, depth: 76 },
  Mexico: { fifaRank: 14, attack: 80, defense: 79, midfield: 80, depth: 78 },
  USA: { fifaRank: 15, attack: 81, defense: 78, midfield: 81, depth: 80 },

  Australia: { fifaRank: 25, attack: 76, defense: 78, midfield: 76, depth: 75 },
  Iraq: { fifaRank: 45, attack: 68, defense: 69, midfield: 68, depth: 65 },
  Iran: { fifaRank: 28, attack: 76, defense: 77, midfield: 75, depth: 73 },
  Japan: { fifaRank: 18, attack: 81, defense: 79, midfield: 82, depth: 80 },
  Jordan: { fifaRank: 55, attack: 65, defense: 66, midfield: 65, depth: 62 },
  Qatar: { fifaRank: 42, attack: 70, defense: 70, midfield: 69, depth: 67 },
  SaudiArabia: { fifaRank: 48, attack: 68, defense: 69, midfield: 68, depth: 66 },
  SouthKorea: { fifaRank: 22, attack: 80, defense: 77, midfield: 79, depth: 77 },
  Uzbekistan: { fifaRank: 50, attack: 67, defense: 68, midfield: 68, depth: 64 },

  Algeria: { fifaRank: 30, attack: 77, defense: 75, midfield: 76, depth: 73 },
  CaboVerde: { fifaRank: 60, attack: 64, defense: 66, midfield: 64, depth: 61 },
  Egypt: { fifaRank: 23, attack: 79, defense: 78, midfield: 77, depth: 75 },
  IvoryCoast: { fifaRank: 35, attack: 75, defense: 74, midfield: 74, depth: 72 },
  Morocco: { fifaRank: 13, attack: 82, defense: 87, midfield: 84, depth: 81 },
  Senegal: { fifaRank: 19, attack: 80, defense: 81, midfield: 79, depth: 78 },
  SouthAfrica: { fifaRank: 52, attack: 67, defense: 69, midfield: 68, depth: 64 },
  Tunisia: { fifaRank: 38, attack: 72, defense: 75, midfield: 73, depth: 70 },

  Austria: { fifaRank: 20, attack: 78, defense: 80, midfield: 81, depth: 77 },
  Belgium: { fifaRank: 9, attack: 86, defense: 84, midfield: 85, depth: 84 },
  Croatia: { fifaRank: 10, attack: 84, defense: 86, midfield: 88, depth: 82 },
  Denmark: { fifaRank: 17, attack: 79, defense: 82, midfield: 82, depth: 78 },
  Germany: { fifaRank: 7, attack: 87, defense: 85, midfield: 88, depth: 88 },
  Netherlands: { fifaRank: 8, attack: 88, defense: 87, midfield: 86, depth: 85 },
  Norway: { fifaRank: 29, attack: 83, defense: 75, midfield: 78, depth: 74 },
  Portugal: { fifaRank: 6, attack: 89, defense: 87, midfield: 88, depth: 87 },
  Scotland: { fifaRank: 36, attack: 72, defense: 74, midfield: 75, depth: 70 },
  Switzerland: { fifaRank: 16, attack: 80, defense: 82, midfield: 81, depth: 79 },

  Colombia: { fifaRank: 12, attack: 85, defense: 84, midfield: 83, depth: 82 },
  Paraguay: { fifaRank: 39, attack: 72, defense: 74, midfield: 72, depth: 69 },
  Uruguay: { fifaRank: 11, attack: 86, defense: 85, midfield: 84, depth: 82 },

  CostaRica: { fifaRank: 44, attack: 69, defense: 72, midfield: 69, depth: 66 },
  Curacao: { fifaRank: 72, attack: 60, defense: 62, midfield: 61, depth: 58 },
  Haiti: { fifaRank: 75, attack: 60, defense: 61, midfield: 60, depth: 57 },
  Jamaica: { fifaRank: 46, attack: 70, defense: 69, midfield: 69, depth: 66 },
  Panama: { fifaRank: 47, attack: 69, defense: 70, midfield: 69, depth: 66 },

  NewZealand: { fifaRank: 65, attack: 63, defense: 65, midfield: 64, depth: 61 },
};