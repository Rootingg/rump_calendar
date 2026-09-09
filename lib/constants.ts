export const SLOT_DURATION_MINUTES = 6;

export const SLOT_KINDS = ["TECHNIQUE", "WTF"] as const;
export type SlotKind = (typeof SLOT_KINDS)[number];

export const BOOKABLE_SLOTS = [
  { position: 1, start: "18:00", end: "18:06", kind: "TECHNIQUE" },
  { position: 2, start: "18:06", end: "18:12", kind: "TECHNIQUE" },
  { position: 3, start: "18:12", end: "18:18", kind: "TECHNIQUE" },
  { position: 4, start: "18:18", end: "18:24", kind: "TECHNIQUE" },
  { position: 5, start: "18:24", end: "18:30", kind: "TECHNIQUE" },
  { position: 6, start: "18:30", end: "18:36", kind: "TECHNIQUE" },
  { position: 7, start: "18:36", end: "18:42", kind: "TECHNIQUE" },
  { position: 8, start: "18:42", end: "18:48", kind: "WTF" },
  { position: 9, start: "18:48", end: "18:54", kind: "WTF" },
  { position: 10, start: "18:54", end: "19:00", kind: "WTF" },
] as const satisfies {
  position: number;
  start: string;
  end: string;
  kind: SlotKind;
}[];

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

export function slotKindLabel(kind: string) {
  return kind === "WTF" ? "WTF libre" : "Technique";
}

export function durationLabel() {
  return `${SLOT_DURATION_MINUTES} minutes`;
}
