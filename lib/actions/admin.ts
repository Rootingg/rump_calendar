"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { applySeasonDates, ensureUpcomingSessions } from "@/lib/sessions";
import { talkApplications } from "@/db/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Accès admin requis.");
  }
  return session;
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/planning");
  revalidatePath("/rump", "layout");
  revalidatePath("/profil");
  revalidatePath("/proposer");
  revalidatePath("/admin");
  revalidatePath("/admin/candidatures");
}

export async function approveApplication(id: string) {
  await requireAdmin();

  const [application] = await db
    .select()
    .from(talkApplications)
    .where(eq(talkApplications.id, id))
    .limit(1);

  if (!application) {
    return { error: "Candidature introuvable." };
  }

  if (application.status !== "PENDING") {
    return { error: "Seule une candidature en attente peut être validée." };
  }

  try {
    await db
      .update(talkApplications)
      .set({
        status: "APPROVED",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(talkApplications.id, id),
          eq(talkApplications.status, "PENDING"),
        ),
      );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("one_approved_per_slot") || message.includes("23505")) {
      return { error: "Ce créneau a déjà un talk validé." };
    }
    throw error;
  }

  await db
    .update(talkApplications)
    .set({
      status: "SLOT_UNAVAILABLE",
      adminComment:
        "Le créneau a été attribué à une autre candidature.",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(talkApplications.slotId, application.slotId),
        eq(talkApplications.status, "PENDING"),
        ne(talkApplications.id, id),
      ),
    );

  revalidatePublic();
  return { success: "Talk validé et publié." };
}

export async function rejectApplication(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const comment = String(formData.get("adminComment") ?? "").trim();

  if (!id) {
    return { error: "Candidature introuvable." };
  }

  const [application] = await db
    .select()
    .from(talkApplications)
    .where(eq(talkApplications.id, id))
    .limit(1);

  if (!application || application.status !== "PENDING") {
    return { error: "Seule une candidature en attente peut être refusée." };
  }

  await db
    .update(talkApplications)
    .set({
      status: "REJECTED",
      adminComment:
        comment ||
        `Votre proposition « ${application.title} » n'a pas été retenue pour cette RUMP.`,
      updatedAt: new Date(),
    })
    .where(eq(talkApplications.id, id));

  revalidatePublic();
  return { success: "Candidature refusée." };
}

export async function generateSessionsAction() {
  await requireAdmin();
  await ensureUpcomingSessions();
  revalidatePublic();
}

export type FirstSessionState = {
  error?: string;
  success?: string;
};

export async function setSeasonDatesAction(
  _prev: FirstSessionState | undefined,
  formData: FormData,
): Promise<FirstSessionState> {
  await requireAdmin();

  const firstDate = String(formData.get("firstSessionDate") ?? "").trim();
  const lastDate = String(formData.get("lastSessionDate") ?? "").trim();

  try {
    await applySeasonDates(firstDate, lastDate);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer ces dates.",
    };
  }

  revalidatePublic();
  return {
    success: "Saison enregistrée. Le planning a été régénéré.",
  };
}
