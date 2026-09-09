import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { SLOTS_PER_SESSION } from "@/lib/constants";
import { isThursdayOver, parisNow } from "@/lib/dates";
import { db } from "@/lib/db";
import { closePastSessions, ensureUpcomingSessions } from "@/lib/sessions";
import {
  rumpSessions,
  slots,
  talkApplications,
  users,
} from "@/db/schema";

export async function prepareCalendar() {
  await ensureUpcomingSessions(12);
  await closePastSessions();
}

export async function getPlanningSessions() {
  await prepareCalendar();

  const sessions = await db
    .select()
    .from(rumpSessions)
    .orderBy(asc(rumpSessions.date));

  const sessionIds = sessions.map((session) => session.id);
  if (sessionIds.length === 0) return [];

  const approved = await db
    .select({
      rumpSessionId: talkApplications.rumpSessionId,
    })
    .from(talkApplications)
    .where(
      and(
        inArray(talkApplications.rumpSessionId, sessionIds),
        eq(talkApplications.status, "APPROVED"),
      ),
    );

  const counts = new Map<string, number>();
  for (const row of approved) {
    counts.set(row.rumpSessionId, (counts.get(row.rumpSessionId) ?? 0) + 1);
  }

  return sessions.map((session) => {
    const approvedCount = counts.get(session.id) ?? 0;
    return {
      ...session,
      approvedCount,
      availableCount: Math.max(SLOTS_PER_SESSION - approvedCount, 0),
    };
  });
}

export async function getNextPublicSession() {
  const sessions = await getPlanningSessions();
  return (
    sessions.find(
      (session) => session.status !== "DONE" && !isThursdayOver(session.date),
    ) ??
    sessions.find((session) => !isThursdayOver(session.date)) ??
    sessions.at(-1) ??
    null
  );
}

export async function getApprovedTalks(sessionId: string) {
  return db
    .select({
      id: talkApplications.id,
      title: talkApplications.title,
      description: talkApplications.description,
      discipline: talkApplications.discipline,
      level: talkApplications.level,
      startTime: slots.startTime,
      endTime: slots.endTime,
      position: slots.position,
      speakerName: users.name,
    })
    .from(talkApplications)
    .innerJoin(slots, eq(talkApplications.slotId, slots.id))
    .innerJoin(users, eq(talkApplications.userId, users.id))
    .where(
      and(
        eq(talkApplications.rumpSessionId, sessionId),
        eq(talkApplications.status, "APPROVED"),
      ),
    )
    .orderBy(asc(slots.position));
}

export async function getSessionDetail(sessionId: string) {
  await prepareCalendar();

  const [session] = await db
    .select()
    .from(rumpSessions)
    .where(eq(rumpSessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  const sessionSlots = await db
    .select()
    .from(slots)
    .where(eq(slots.rumpSessionId, sessionId))
    .orderBy(asc(slots.position));

  const approved = await getApprovedTalks(sessionId);

  return {
    session,
    slots: sessionSlots.map((slot) => ({
      ...slot,
      talk: approved.find((talk) => talk.position === slot.position) ?? null,
    })),
    approvedCount: approved.length,
    availableCount: Math.max(SLOTS_PER_SESSION - approved.length, 0),
  };
}

export async function getProposeOptions() {
  await prepareCalendar();
  const today = parisNow().date;

  const sessions = await db
    .select()
    .from(rumpSessions)
    .where(eq(rumpSessions.status, "OPEN"))
    .orderBy(asc(rumpSessions.date));

  const openSessions = sessions.filter((session) => session.date >= today);
  if (openSessions.length === 0) return [];

  const sessionIds = openSessions.map((session) => session.id);

  const sessionSlots = await db
    .select()
    .from(slots)
    .where(inArray(slots.rumpSessionId, sessionIds))
    .orderBy(asc(slots.position));

  const approved = await db
    .select({
      slotId: talkApplications.slotId,
    })
    .from(talkApplications)
    .where(
      and(
        inArray(talkApplications.rumpSessionId, sessionIds),
        eq(talkApplications.status, "APPROVED"),
      ),
    );

  const taken = new Set(approved.map((row) => row.slotId));

  return openSessions.map((session) => ({
    id: session.id,
    date: session.date,
    number: session.number,
    slots: sessionSlots
      .filter((slot) => slot.rumpSessionId === session.id)
      .map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        taken: taken.has(slot.id),
      })),
  }));
}

export async function getMyApplications(userId: string) {
  return db
    .select({
      id: talkApplications.id,
      title: talkApplications.title,
      status: talkApplications.status,
      adminComment: talkApplications.adminComment,
      date: rumpSessions.date,
      number: rumpSessions.number,
      startTime: slots.startTime,
      endTime: slots.endTime,
    })
    .from(talkApplications)
    .innerJoin(rumpSessions, eq(talkApplications.rumpSessionId, rumpSessions.id))
    .innerJoin(slots, eq(talkApplications.slotId, slots.id))
    .where(eq(talkApplications.userId, userId))
    .orderBy(desc(talkApplications.createdAt));
}

export async function getPendingApplications() {
  return db
    .select({
      id: talkApplications.id,
      title: talkApplications.title,
      description: talkApplications.description,
      discipline: talkApplications.discipline,
      level: talkApplications.level,
      status: talkApplications.status,
      createdAt: talkApplications.createdAt,
      speakerName: users.name,
      speakerEmail: users.email,
      date: rumpSessions.date,
      number: rumpSessions.number,
      startTime: slots.startTime,
      endTime: slots.endTime,
    })
    .from(talkApplications)
    .innerJoin(users, eq(talkApplications.userId, users.id))
    .innerJoin(rumpSessions, eq(talkApplications.rumpSessionId, rumpSessions.id))
    .innerJoin(slots, eq(talkApplications.slotId, slots.id))
    .where(eq(talkApplications.status, "PENDING"))
    .orderBy(asc(rumpSessions.date), asc(slots.position));
}

export async function getApplicationDetail(id: string) {
  const [application] = await db
    .select({
      id: talkApplications.id,
      title: talkApplications.title,
      description: talkApplications.description,
      discipline: talkApplications.discipline,
      level: talkApplications.level,
      status: talkApplications.status,
      adminComment: talkApplications.adminComment,
      createdAt: talkApplications.createdAt,
      slotId: talkApplications.slotId,
      speakerName: users.name,
      speakerEmail: users.email,
      date: rumpSessions.date,
      number: rumpSessions.number,
      sessionId: rumpSessions.id,
      startTime: slots.startTime,
      endTime: slots.endTime,
    })
    .from(talkApplications)
    .innerJoin(users, eq(talkApplications.userId, users.id))
    .innerJoin(rumpSessions, eq(talkApplications.rumpSessionId, rumpSessions.id))
    .innerJoin(slots, eq(talkApplications.slotId, slots.id))
    .where(eq(talkApplications.id, id))
    .limit(1);

  return application ?? null;
}

export async function getAdminOverview() {
  const sessions = await getPlanningSessions();
  const upcoming = sessions.filter((session) => session.status !== "DONE");
  const pending = await getPendingApplications();

  return { upcoming, pending };
}
