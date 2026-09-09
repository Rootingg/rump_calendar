import { eq } from "drizzle-orm";
import { appSettings } from "@/db/schema";
import { db } from "@/lib/db";

export const FIRST_SESSION_KEY = "first_session_date";
export const DEFAULT_FIRST_SESSION_DATE = "2026-10-01";

export async function getFirstSessionDate() {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, FIRST_SESSION_KEY))
    .limit(1);

  return row?.value ?? DEFAULT_FIRST_SESSION_DATE;
}

export async function saveFirstSessionDate(date: string) {
  await db
    .insert(appSettings)
    .values({ key: FIRST_SESSION_KEY, value: date })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: date },
    });
}
