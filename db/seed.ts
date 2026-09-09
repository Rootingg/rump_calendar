import { loadEnvConfig } from "@next/env";
import { hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { BOOKABLE_SLOTS } from "../lib/constants";
import { getUpcomingThursdays } from "../lib/dates";

loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(neon(url), { schema });
const { users, rumpSessions, slots, talkApplications } = schema;

async function upsertUser(
  name: string,
  email: string,
  password: string,
  role: "MEMBER" | "ADMIN",
) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: await hash(password, 12),
      role,
    })
    .returning();

  return created;
}

async function ensureSessions() {
  const dates = getUpcomingThursdays(12);
  const existing = await db.select().from(rumpSessions);
  const existingDates = new Set(existing.map((session) => session.date));
  let nextNumber =
    existing.reduce((max, session) => Math.max(max, session.number), 0) + 1;

  for (const date of dates) {
    if (existingDates.has(date)) continue;

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

async function findSessionByDate(date: string) {
  const [session] = await db
    .select()
    .from(rumpSessions)
    .where(eq(rumpSessions.date, date))
    .limit(1);
  return session ?? null;
}

async function findSlot(sessionId: string, startTime: string) {
  const [slot] = await db
    .select()
    .from(slots)
    .where(and(eq(slots.rumpSessionId, sessionId), eq(slots.startTime, startTime)))
    .limit(1);
  return slot ?? null;
}

async function hasAnyTalk() {
  const [row] = await db.select({ id: talkApplications.id }).from(talkApplications).limit(1);
  return Boolean(row);
}

async function seedTalks(demoUsers: {
  louis: { id: string };
  lucas: { id: string };
  tymothe: { id: string };
  adam: { id: string };
}) {
  if (await hasAnyTalk()) {
    console.log("Talks already present, skipping demo applications.");
    return;
  }

  const showcase = (await findSessionByDate("2026-09-24")) ?? (await findSessionByDate(getUpcomingThursdays(3)[1] ?? getUpcomingThursdays(1)[0]));
  const conflict = (await findSessionByDate("2026-10-01")) ?? (await findSessionByDate(getUpcomingThursdays(4)[2] ?? getUpcomingThursdays(2)[1]));

  if (!showcase) {
    console.log("No showcase session found.");
    return;
  }

  const official = [
    { userId: demoUsers.tymothe.id, start: "18:00", title: "Gestion des erreurs en Go", description: "Comment la gestion d'erreurs de Go cause des erreurs, autour de CVE-2026-22592.", discipline: "Dev", level: "Intermédiaire" },
    { userId: demoUsers.lucas.id, start: "18:08", title: "Devenir admin en 1 requête", description: "Une requête trop permissive et c'est tout le panel qui tombe. Retour sur Flight PHP.", discipline: "Web", level: "Avancé" },
    { userId: demoUsers.louis.id, start: "18:16", title: "Deep Dive into the Shellcode World", description: "Un tour concret du monde du shellcode : contraintes, encodage, et exécution.", discipline: "Pwn", level: "Avancé" },
    { userId: demoUsers.adam.id, start: "18:24", title: "RTFM...", description: "Pourquoi lire la doc reste l'arme la plus sous-estimée en sécu.", discipline: "Autre", level: "Débutant" },
  ];

  for (const talk of official) {
    const slot = await findSlot(showcase.id, talk.start);
    if (!slot) continue;
    await db.insert(talkApplications).values({
      userId: talk.userId,
      rumpSessionId: showcase.id,
      slotId: slot.id,
      title: talk.title,
      description: talk.description,
      discipline: talk.discipline,
      level: talk.level,
      status: "APPROVED",
    });
  }

  if (conflict) {
    const slot = await findSlot(conflict.id, "18:16");
    if (slot) {
      await db.insert(talkApplications).values([
        {
          userId: demoUsers.lucas.id,
          rumpSessionId: conflict.id,
          slotId: slot.id,
          title: "SSRF dans les webhooks",
          description: "Deux headers et un callback plus tard, on parle au réseau interne.",
          discipline: "Web",
          level: "Intermédiaire",
          status: "PENDING",
        },
        {
          userId: demoUsers.louis.id,
          rumpSessionId: conflict.id,
          slotId: slot.id,
          title: "Heap Feng Shui 101",
          description: "Comment ranger la heap pour mieux la casser.",
          discipline: "Pwn",
          level: "Avancé",
          status: "PENDING",
        },
      ]);
    }

    const freeSlot = await findSlot(conflict.id, "18:00");
    if (freeSlot) {
      await db.insert(talkApplications).values({
        userId: demoUsers.adam.id,
        rumpSessionId: conflict.id,
        slotId: freeSlot.id,
        title: "Introduction à Burp",
        description: "Les bases pour intercepter et comprendre une requête HTTP.",
        discipline: "Web",
        level: "Débutant",
        status: "PENDING",
      });
    }
  }

  console.log("Demo talks inserted.");
}

async function main() {
  const admin = await upsertUser(
    "Admin OteriHack",
    "admin@oterihack.fr",
    "AdminRump2026",
    "ADMIN",
  );
  const louis = await upsertUser("Louis Clinckx", "louis@oterihack.fr", "DemoRump2026", "MEMBER");
  const lucas = await upsertUser("Lucas Torres", "lucas@oterihack.fr", "DemoRump2026", "MEMBER");
  const tymothe = await upsertUser("Tymothé Billerey", "tymothe@oterihack.fr", "DemoRump2026", "MEMBER");
  const adam = await upsertUser("Adam Chtourou", "adam@oterihack.fr", "DemoRump2026", "MEMBER");

  await ensureSessions();
  await seedTalks({ louis, lucas, tymothe, adam });

  console.log("Seed complete.");
  console.log("Admin : admin@oterihack.fr / AdminRump2026");
  console.log("Membre : lucas@oterihack.fr / DemoRump2026");
  void admin;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
