// Season 3 final regular-season player stats — seed data from PRD Appendix A.
// Categories rendered: goals, assists, saves, demos, deleted.

export type Conference = "Sombrero" | "Fedora";
export type StatCategory = "goals" | "assists" | "saves" | "demos" | "deleted";

export interface HistoricalPlayer {
  name: string;
  conference: Conference;
  goals: number;
  assists: number;
  saves: number;
  demos: number;
  deleted: number;
}

export const HISTORICAL_SEASON = 3 as const;

export const HISTORICAL_PLAYERS: HistoricalPlayer[] = [
  { name: "OZ", conference: "Sombrero", goals: 89, assists: 24, saves: 70, demos: 52, deleted: 44 },
  { name: "Jaridox", conference: "Sombrero", goals: 71, assists: 25, saves: 64, demos: 18, deleted: 43 },
  { name: "Honjo_Kaede", conference: "Sombrero", goals: 51, assists: 19, saves: 54, demos: 31, deleted: 27 },
  { name: "dbryantm", conference: "Sombrero", goals: 49, assists: 21, saves: 40, demos: 19, deleted: 34 },
  { name: "Inertiä", conference: "Sombrero", goals: 48, assists: 14, saves: 90, demos: 69, deleted: 41 },
  { name: "QS3V3N", conference: "Sombrero", goals: 48, assists: 19, saves: 89, demos: 78, deleted: 49 },
  { name: "Rome Legion X", conference: "Sombrero", goals: 47, assists: 21, saves: 58, demos: 39, deleted: 40 },
  { name: "Doc Spaceman", conference: "Sombrero", goals: 38, assists: 39, saves: 36, demos: 87, deleted: 24 },
  { name: "SchizzzRL", conference: "Sombrero", goals: 38, assists: 18, saves: 52, demos: 21, deleted: 31 },
  { name: "CrazyDazzler", conference: "Sombrero", goals: 37, assists: 27, saves: 46, demos: 32, deleted: 28 },
  { name: "Citrus", conference: "Sombrero", goals: 33, assists: 5, saves: 50, demos: 11, deleted: 35 },
  { name: "Spac3OG", conference: "Sombrero", goals: 32, assists: 14, saves: 53, demos: 14, deleted: 25 },
  { name: "Undying_Breath", conference: "Sombrero", goals: 32, assists: 47, saves: 66, demos: 26, deleted: 43 },
  { name: "BophadesNutz", conference: "Sombrero", goals: 30, assists: 25, saves: 34, demos: 12, deleted: 20 },
  { name: "Snowflake_014", conference: "Sombrero", goals: 30, assists: 28, saves: 45, demos: 19, deleted: 29 },
  { name: "TheGr8Ginger", conference: "Sombrero", goals: 24, assists: 18, saves: 23, demos: 18, deleted: 23 },
  { name: "iGotAverageMeat", conference: "Sombrero", goals: 23, assists: 18, saves: 50, demos: 18, deleted: 39 },
  { name: "Jimmy_Numerics", conference: "Sombrero", goals: 22, assists: 15, saves: 28, demos: 64, deleted: 38 },
  { name: "AlohaVikes", conference: "Sombrero", goals: 21, assists: 23, saves: 39, demos: 29, deleted: 25 },
  { name: "CrispySprite", conference: "Sombrero", goals: 21, assists: 22, saves: 34, demos: 33, deleted: 25 },
  { name: "FULLBL00DN8V", conference: "Sombrero", goals: 21, assists: 18, saves: 24, demos: 11, deleted: 26 },
  { name: "YubinYankinov", conference: "Sombrero", goals: 20, assists: 17, saves: 32, demos: 16, deleted: 23 },
  { name: "James16D9", conference: "Sombrero", goals: 18, assists: 14, saves: 36, demos: 33, deleted: 29 },
  { name: "VEAZY_11B", conference: "Sombrero", goals: 16, assists: 19, saves: 30, demos: 20, deleted: 22 },
  { name: "samoanthrax", conference: "Sombrero", goals: 13, assists: 13, saves: 30, demos: 41, deleted: 19 },
  { name: "FithAce", conference: "Sombrero", goals: 12, assists: 4, saves: 30, demos: 19, deleted: 31 },
  { name: "Snorlax_RL", conference: "Sombrero", goals: 12, assists: 7, saves: 12, demos: 22, deleted: 10 },
  { name: "tomlit", conference: "Sombrero", goals: 10, assists: 2, saves: 11, demos: 4, deleted: 7 },
  { name: "RogerDaleJunior", conference: "Sombrero", goals: 6, assists: 15, saves: 17, demos: 23, deleted: 32 },
  { name: "WONKA FLONKA", conference: "Sombrero", goals: 5, assists: 4, saves: 11, demos: 12, deleted: 17 },
  { name: "Cuppyyyy", conference: "Fedora", goals: 83, assists: 29, saves: 73, demos: 26, deleted: 38 },
  { name: "McItaly", conference: "Fedora", goals: 54, assists: 24, saves: 68, demos: 53, deleted: 36 },
  { name: "Boscosmodernlife", conference: "Fedora", goals: 53, assists: 22, saves: 42, demos: 37, deleted: 59 },
  { name: "Hat_Dad_Gaming", conference: "Fedora", goals: 53, assists: 25, saves: 86, demos: 50, deleted: 53 },
  { name: "Groovin Yeti", conference: "Fedora", goals: 48, assists: 25, saves: 62, demos: 66, deleted: 41 },
  { name: "TheProfFREAK", conference: "Fedora", goals: 48, assists: 34, saves: 68, demos: 52, deleted: 54 },
  { name: "TheSorrySniper", conference: "Fedora", goals: 47, assists: 16, saves: 109, demos: 30, deleted: 52 },
  { name: "XeroChance222", conference: "Fedora", goals: 44, assists: 13, saves: 76, demos: 38, deleted: 39 },
  { name: "Grandejuevos45", conference: "Fedora", goals: 43, assists: 24, saves: 72, demos: 40, deleted: 38 },
  { name: "syski11a", conference: "Fedora", goals: 42, assists: 18, saves: 55, demos: 33, deleted: 22 },
  { name: "Edgep1ay", conference: "Fedora", goals: 39, assists: 31, saves: 49, demos: 28, deleted: 48 },
  { name: "Dark0bra", conference: "Fedora", goals: 37, assists: 29, saves: 31, demos: 34, deleted: 46 },
  { name: "Schobzero", conference: "Fedora", goals: 37, assists: 22, saves: 38, demos: 18, deleted: 35 },
  { name: "Ulish6", conference: "Fedora", goals: 36, assists: 16, saves: 34, demos: 47, deleted: 34 },
  { name: "King_of_Failure", conference: "Fedora", goals: 35, assists: 21, saves: 52, demos: 25, deleted: 37 },
  { name: "MajorMalnut", conference: "Fedora", goals: 32, assists: 27, saves: 70, demos: 39, deleted: 39 },
  { name: "JackieThrobinson", conference: "Fedora", goals: 31, assists: 17, saves: 34, demos: 21, deleted: 30 },
  { name: "Phantomloaf", conference: "Fedora", goals: 30, assists: 22, saves: 82, demos: 31, deleted: 33 },
  { name: "SHOrdr", conference: "Fedora", goals: 28, assists: 21, saves: 45, demos: 24, deleted: 20 },
  { name: "PeltDidItAgain1", conference: "Fedora", goals: 27, assists: 26, saves: 46, demos: 17, deleted: 31 },
  { name: "LessthanDan6285", conference: "Fedora", goals: 22, assists: 19, saves: 33, demos: 39, deleted: 31 },
  { name: "Wa1rus91", conference: "Fedora", goals: 22, assists: 13, saves: 45, demos: 49, deleted: 33 },
  { name: "zbatdad", conference: "Fedora", goals: 22, assists: 21, saves: 23, demos: 76, deleted: 48 },
  { name: "Solid_Liquid83", conference: "Fedora", goals: 21, assists: 16, saves: 50, demos: 37, deleted: 35 },
  { name: "Chr1sTheScrub01", conference: "Fedora", goals: 18, assists: 26, saves: 30, demos: 32, deleted: 47 },
  { name: "ProdigyMETA", conference: "Fedora", goals: 18, assists: 17, saves: 54, demos: 34, deleted: 39 },
  { name: "savant_cyclops", conference: "Fedora", goals: 18, assists: 19, saves: 23, demos: 25, deleted: 42 },
  { name: "AngelImage00", conference: "Fedora", goals: 16, assists: 7, saves: 33, demos: 26, deleted: 39 },
  { name: "Neoman47", conference: "Fedora", goals: 15, assists: 13, saves: 45, demos: 115, deleted: 24 },
  { name: "DaScrappyDoo", conference: "Fedora", goals: 14, assists: 4, saves: 31, demos: 6, deleted: 19 },
];

export const STAT_CATEGORIES: {
  key: StatCategory;
  label: string;
  description: string;
  unit: string;
}[] = [
  { key: "goals", label: "Goals", description: "Most goals scored in Season 3 regular play.", unit: "goals" },
  { key: "assists", label: "Assists", description: "Setting up teammates all season long.", unit: "assists" },
  { key: "saves", label: "Saves", description: "The keepers. The wall. The last hope.", unit: "saves" },
  { key: "demos", label: "Demos", description: "Bodies on the wall. Demos delivered.", unit: "demos" },
  { key: "deleted", label: "Deleted", description: "The most demolished. We salute you.", unit: "times deleted" },
];

export function leaderboard(
  category: StatCategory,
  opts: { conference?: Conference | "all"; limit?: number } = {},
): HistoricalPlayer[] {
  const { conference = "all", limit = 10 } = opts;
  const filtered =
    conference === "all"
      ? HISTORICAL_PLAYERS
      : HISTORICAL_PLAYERS.filter((p) => p.conference === conference);
  return [...filtered].sort((a, b) => b[category] - a[category]).slice(0, limit);
}
