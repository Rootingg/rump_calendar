import { asc, desc, eq, inArray, lt } from "drizzle-orm";
import { BOOKABLE_SLOTS } from "@/lib/constants";
import { getUpcomingThursdays, isThursdayIso, isThursdayOver } from "@/lib/dates";
import { db } from "@/lib/db";
import { getFirstSessionDate, saveFirstSessionDate } from "@/lib/settings";
import { rumpSessions, slots } from "@/db/schema";

export async function closePastSessions() {
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
}

async function createSession(date: string, number: number) {
  const [session] = await db
    .insert(rumpSessions)
    .values({
      date,
      startTime: "18:00",
      endTime: "19:00",
      number,
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

  return session;
}

async function renumberSessions() {
  const remaining = await db
    .select()
    .from(rumpSessions)
    .orderBy(asc(rumpSessions.date));

  let number = 1;
  for (const session of remaining) {
    if (session.number !== number) {
      await db
        .update(rumpSessions)
        .set({ number })
        .where(eq(rumpSessions.id, session.id));
    }
    number += 1;
  }
}

export async function ensureUpcomingSessions(weeks = 12) {
  await closePastSessions();

  const firstDate = await getFirstSessionDate();
  const dates = getUpcomingThursdays(weeks, firstDate);
  const existing = await db.select().from(rumpSessions);
  const existingDates = new Set(existing.map((session) => session.date));
  const missing = dates.filter((date) => !existingDates.has(date));

  if (missing.length === 0) {
    await renumberSessions();
    return;
  }

  const [latest] = await db
    .select({ number: rumpSessions.number })
    .from(rumpSessions)
    .orderBy(desc(rumpSessions.number))
    .limit(1);

  let nextNumber = (latest?.number ?? 0) + 1;

  for (const date of missing) {
    await createSession(date, nextNumber);
    nextNumber += 1;
  }

  await renumberSessions();
}

export async function applyFirstSessionDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date invalide.");
  }
  if (!isThursdayIso(date)) {
    throw new Error("La première RUMP doit tomber un jeudi.");
  }

  await saveFirstSessionDate(date);
  await db.delete(rumpSessions).where(lt(rumpSessions.date, date));
  await ensureUpcomingSessions(12);
}
