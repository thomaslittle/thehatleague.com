// Season 3 final standings — real data scraped from the six Challonge
// brackets. Source URLs kept on each cluster as `CHALLONGE_BRACKETS`.
//
// Format note: Challonge's "Set Wins" column is per-game wins (each match
// is a 5-game series, so max set wins per match = 5). Match record is
// W-L-T (full series wins). Pts is goals-for; Pts Diff is GF-GA.

export interface StandingRow {
  /** Seed number from the regular season order (Challonge rank). */
  seed: number;
  /** Team name including any number-prefix from Challonge. */
  name: string;
  /** Captain handle as listed on Challonge. */
  captain: string | null;
  /** Match-level games played for the regular-season slate. */
  gp: number;
  w: number;
  l: number;
  /** Goals for (Pts column on Challonge). */
  gf: number;
  /** Goals against — derived from GF - PtsDiff. */
  ga: number;
}

/** THL Season 3 Sombrero Conference — Regular Season (Challonge 9xmo6e8m). */
export const SOMBRERO_S3: StandingRow[] = [
  { seed: 1, name: "(17) Almost Legal",        captain: "DrSpaceman88",   gp: 9, w: 8, l: 1, gf: 135, ga: 78 },
  { seed: 2, name: "Team 14",                  captain: "RomeSC",         gp: 9, w: 6, l: 3, gf: 119, ga: 74 },
  { seed: 3, name: "(8) Ball Protectors",      captain: "CrazyDazzler",   gp: 9, w: 9, l: 0, gf: 109, ga: 66 },
  { seed: 4, name: "(1) Team Ricky Bobby",     captain: "BophadesNutz",   gp: 9, w: 5, l: 4, gf: 144, ga: 112 },
  { seed: 5, name: "Team 16",                  captain: "oOGPx",          gp: 9, w: 4, l: 5, gf: 109, ga: 113 },
  { seed: 6, name: "(5) Supersonic Smurfs",    captain: "TheSchizzz",     gp: 9, w: 4, l: 5, gf: 92, ga: 107 },
  { seed: 7, name: "18 And Over",              captain: "Snowflake_014",  gp: 9, w: 4, l: 5, gf: 105, ga: 125 },
  { seed: 8, name: "(12) The 6D9ers",          captain: "Citrus00",       gp: 9, w: 3, l: 6, gf: 72, ga: 117 },
  { seed: 9, name: "(2) Wise Ace's",           captain: "AverageMeat",    gp: 9, w: 2, l: 7, gf: 73, ga: 121 },
  { seed: 10, name: "(13) 3 Bromigos",         captain: "tomlit",         gp: 9, w: 0, l: 9, gf: 0, ga: 45 },
];

/** THL Season 3 Fedora Conference — Regular Season (Challonge lqef5imq). */
export const FEDORA_S3: StandingRow[] = [
  { seed: 1, name: "Team 6",                   captain: "Edgeplay",        gp: 9, w: 8, l: 1, gf: 140, ga: 96 },
  { seed: 2, name: "Team 20",                  captain: "mpbosco11",       gp: 9, w: 8, l: 1, gf: 136, ga: 86 },
  { seed: 3, name: "(7) Das Boost",            captain: "Dark0bra",        gp: 9, w: 7, l: 2, gf: 120, ga: 97 },
  { seed: 4, name: "Team 19",                  captain: "peltdiditagain",  gp: 9, w: 5, l: 4, gf: 124, ga: 99 },
  { seed: 5, name: "Team 9",                   captain: "Ulishthegank",    gp: 9, w: 4, l: 5, gf: 106, ga: 111 },
  { seed: 6, name: "Team 11",                  captain: "Hat_Dad_Gaming",  gp: 9, w: 3, l: 6, gf: 105, ga: 109 },
  { seed: 7, name: "(15) Late Bloomers",       captain: "SHOrdr",          gp: 9, w: 3, l: 6, gf: 82, ga: 92 },
  { seed: 8, name: "Team 10",                  captain: "DaScrappyDoo128", gp: 9, w: 3, l: 6, gf: 91, ga: 136 },
  { seed: 9, name: "(4) Bang Bros",            captain: "ProdigyMETA",     gp: 9, w: 2, l: 7, gf: 95, ga: 133 },
  { seed: 10, name: "Team 3",                  captain: "Neoman47",        gp: 9, w: 2, l: 7, gf: 77, ga: 117 },
];

/** Final playoff order — winner first (the hat). */
export interface PlayoffRow {
  rank: number;
  name: string;
  captain: string | null;
}

export const SOMBRERO_PLAYOFFS_S3: PlayoffRow[] = [
  { rank: 1, name: "(17) Almost Legal", captain: "DrSpaceman88" },
  { rank: 2, name: "(8) Ball Protectors", captain: "CrazyDazzler" },
  { rank: 3, name: "Team 16", captain: "oOGPx" },
  { rank: 4, name: "(1) Team Ricky Bobby", captain: "BophadesNutz" },
  { rank: 5, name: "(5) Supersonic Smurfs", captain: "TheSchizzz" },
  { rank: 5, name: "Team 14", captain: "RomeSC" },
  { rank: 7, name: "(2) Wise Ace's", captain: "AverageMeat" },
  { rank: 7, name: "18 And Over", captain: "Snowflake_014" },
];

export const FEDORA_PLAYOFFS_S3: PlayoffRow[] = [
  { rank: 1, name: "(7) Das Boost", captain: "Dark0bra" },
  { rank: 2, name: "(19) What a save!", captain: "peltdiditagain" },
  { rank: 3, name: "Team 20", captain: "mpbosco11" },
  { rank: 4, name: "(15) Late Bloomers", captain: "SHOrdr" },
  { rank: 5, name: "Team 6", captain: "Edgeplay" },
  { rank: 5, name: "Team 9", captain: "Ulishthegank" },
  { rank: 7, name: "(3) NeoSniperAngels", captain: "Neoman47" },
  { rank: 7, name: "Team 11", captain: "Hat_Dad_Gaming" },
];

export const CHALLONGE_BRACKETS = {
  sombreroRegular: "https://challonge.com/9xmo6e8m",
  fedoraRegular: "https://challonge.com/lqef5imq",
  playInFedora: "https://challonge.com/xgd9vft0",
  playInSombrero: "https://challonge.com/75pozbo0",
  fedoraPlayoffs: "https://challonge.com/ndtn6xnl",
  sombreroPlayoffs: "https://challonge.com/3mwd784l",
} as const;
