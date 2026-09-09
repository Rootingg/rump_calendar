import { asc, desc, eq, gt, inArray, lt } from "drizzle-orm";
import { BOOKABLE_SLOTS } from "@/lib/constants";
import { getThursdaysBetween, isThursdayIso, isThursdayOver } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  getSeasonBounds,
  saveFirstSessionDate,
  saveLastSessionDate,
} from "@/lib/settings";
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

export async function ensureUpcomingSessions() {
  await closePastSessions();

  const { first, last } = await getSeasonBounds();
  const dates = getThursdaysBetween(first, last);
  const existing = await db.select().from(rumpSessions);
  const existingDates = new Set(existing.map((session) => session.date));
  const missing = dates.filter((date) => !existingDates.has(date));

  if (missing.length > 0) {
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
  }

  await renumberSessions();
}

function assertThursdayIso(date: string, label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${label} : date invalide.`);
  }
  if (!isThursdayIso(date)) {
    throw new Error(`${label} doit tomber un jeudi.`);
  }
}

export async function applySeasonDates(firstDate: string, lastDate: string) {
  assertThursdayIso(firstDate, "La date de début");
  assertThursdayIso(lastDate, "La date de fin");

  if (lastDate < firstDate) {
    throw new Error("La date de fin doit être après la date de début.");
  }

  await saveFirstSessionDate(firstDate);
  await saveLastSessionDate(lastDate);
  await db.delete(rumpSessions).where(lt(rumpSessions.date, firstDate));
  await db.delete(rumpSessions).where(gt(rumpSessions.date, lastDate));
  await ensureUpcomingSessions();
}

export async function applyFirstSessionDate(date: string) {
  const { last } = await getSeasonBounds();
  await applySeasonDates(date, last);
}
