import { desc, eq, inArray } from "drizzle-orm";
import { BOOKABLE_SLOTS } from "@/lib/constants";
import { getUpcomingThursdays, isThursdayOver, parisNow } from "@/lib/dates";
import { db } from "@/lib/db";
import { rumpSessions, slots } from "@/db/schema";

export async function closePastSessions() {
  const now = parisNow();
  const openSessions = await db
    .select()
    .from(rumpSessions)
    .where(eq(rumpSessions.status, "OPEN"));

  const expiredIds = openSessions
    .filter((session) => isThursdayOver(session.date))
    .map((session) => session.id);

  if (expiredIds.length === 0) return;

  await db
    .update(rumpSessions)
    .set({ status: "DONE" })
    .where(inArray(rumpSessions.id, expiredIds));

  void now;
}

export async function ensureUpcomingSessions(weeks = 12) {
  await closePastSessions();

  const dates = getUpcomingThursdays(weeks);
  const existing = await db.select().from(rumpSessions);
  const existingDates = new Set(existing.map((session) => session.date));
  const missing = dates.filter((date) => !existingDates.has(date));

  if (missing.length === 0) return;

  const [latest] = await db
    .select({ number: rumpSessions.number })
    .from(rumpSessions)
    .orderBy(desc(rumpSessions.number))
    .limit(1);

  let nextNumber = (latest?.number ?? 0) + 1;

  for (const date of missing) {
    const [session] = await db
      .insert(rumpSessions)
      .values({
        date,
        startTime: "18:00",
        endTime: "19:00",
        number: nextNumber,
        status: "OPEN",
      })
      .returning();

    await db.insert(slots).values(
      BOOKABLE_SLOTS.map((slot) => ({
        rumpSessionId: session.id,
        startTime: slot.start,
        endTime: slot.end,
        position: slot.position,
      })),
    );

    nextNumber += 1;
  }
}
