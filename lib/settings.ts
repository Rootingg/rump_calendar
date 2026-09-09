import { eq } from "drizzle-orm";
import { appSettings } from "@/db/schema";
import { db } from "@/lib/db";

export const FIRST_SESSION_KEY = "first_session_date";
export const LAST_SESSION_KEY = "last_session_date";
export const DEFAULT_FIRST_SESSION_DATE = "2026-10-01";
export const DEFAULT_LAST_SESSION_DATE = "2027-06-24";

async function getSetting(key: string, fallback: string) {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);

  return row?.value ?? fallback;
}

async function saveSetting(key: string, value: string) {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value },
    });
}

export async function getFirstSessionDate() {
  return getSetting(FIRST_SESSION_KEY, DEFAULT_FIRST_SESSION_DATE);
}

export async function getLastSessionDate() {
  return getSetting(LAST_SESSION_KEY, DEFAULT_LAST_SESSION_DATE);
}

export async function getSeasonBounds() {
  const [first, last] = await Promise.all([
    getFirstSessionDate(),
    getLastSessionDate(),
  ]);
  return { first, last };
}

export async function saveFirstSessionDate(date: string) {
  await saveSetting(FIRST_SESSION_KEY, date);
}

export async function saveLastSessionDate(date: string) {
  await saveSetting(LAST_SESSION_KEY, date);
}
