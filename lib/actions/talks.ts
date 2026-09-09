"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { DISCIPLINES, LEVELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { rumpSessions, slots, talkApplications } from "@/db/schema";

const proposeSchema = z.object({
  title: z.string().trim().min(3, "Le titre est trop court."),
  description: z.string().trim().min(10, "La description est trop courte."),
  discipline: z.enum(DISCIPLINES),
  level: z.enum(LEVELS),
  sessionId: z.string().uuid(),
  slotId: z.string().uuid(),
});

export type ProposeState = {
  error?: string;
  success?: string;
};

export async function proposeTalkAction(
  _prev: ProposeState | undefined,
  formData: FormData,
): Promise<ProposeState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Connecte-toi pour proposer un talk." };
  }

  const parsed = proposeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    discipline: formData.get("discipline"),
    level: formData.get("level"),
    sessionId: formData.get("sessionId"),
    slotId: formData.get("slotId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const [rump] = await db
    .select()
    .from(rumpSessions)
    .where(eq(rumpSessions.id, parsed.data.sessionId))
    .limit(1);

  if (!rump || rump.status !== "OPEN") {
    return { error: "Cette RUMP n'accepte plus de candidatures." };
  }

  const [slot] = await db
    .select()
    .from(slots)
    .where(
      and(
        eq(slots.id, parsed.data.slotId),
        eq(slots.rumpSessionId, parsed.data.sessionId),
      ),
    )
    .limit(1);

  if (!slot) {
    return { error: "Créneau introuvable pour cette session." };
  }

  const [approved] = await db
    .select({ id: talkApplications.id })
    .from(talkApplications)
    .where(
      and(
        eq(talkApplications.slotId, slot.id),
        eq(talkApplications.status, "APPROVED"),
      ),
    )
    .limit(1);

  if (approved) {
    return { error: "Ce créneau est déjà officiellement réservé." };
  }

  try {
    await db.insert(talkApplications).values({
      userId: session.user.id,
      rumpSessionId: rump.id,
      slotId: slot.id,
      title: parsed.data.title,
      description: parsed.data.description,
      discipline: parsed.data.discipline,
      level: parsed.data.level,
      status: "PENDING",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("one_app_per_user_slot") || message.includes("23505")) {
      return { error: "Tu as déjà une candidature sur ce créneau." };
    }
    throw error;
  }

  revalidatePath("/profil");
  revalidatePath("/proposer");
  revalidatePath("/admin");
  revalidatePath("/admin/candidatures");

  return { success: "Candidature envoyée. Elle est en attente de validation." };
}
