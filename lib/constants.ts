export const BOOKABLE_SLOTS = [
  { position: 1, start: "18:00", end: "18:08" },
  { position: 2, start: "18:08", end: "18:16" },
  { position: 3, start: "18:16", end: "18:24" },
  { position: 4, start: "18:24", end: "18:32" },
  { position: 5, start: "18:32", end: "18:40" },
  { position: 6, start: "18:40", end: "18:48" },
  { position: 7, start: "18:48", end: "18:56" },
] as const;

export const MARGIN_SLOT = { start: "18:56", end: "19:00" } as const;

export const DISCIPLINES = [
  "Web",
  "Reverse",
  "Pwn",
  "Crypto",
  "Forensics",
  "Cloud",
  "Dev",
  "Autre",
] as const;

export const LEVELS = ["Débutant", "Intermédiaire", "Avancé"] as const;

export const SLOTS_PER_SESSION = BOOKABLE_SLOTS.length;

export type Discipline = (typeof DISCIPLINES)[number];
export type Level = (typeof LEVELS)[number];
