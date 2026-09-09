import { loadEnvConfig } from "@next/env";
import { hash } from "bcryptjs";
import { eq, ne } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { DEFAULT_FIRST_SESSION_DATE } from "../lib/settings";
import { applyFirstSessionDate } from "../lib/sessions";

loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  throw new Error("ADMIN_PASSWORD is not set");
}

const db = drizzle(neon(url), { schema });
const { users } = schema;

async function upsertAdmin() {
  const email = "admin@oterihack.fr";
  const passwordHash = await hash(adminPassword, 12);
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        name: "Admin OteriHack",
        passwordHash,
        role: "ADMIN",
      })
      .where(eq(users.id, existing.id));
    return existing.id;
  }

  const [created] = await db
    .insert(users)
    .values({
      name: "Admin OteriHack",
      email,
      passwordHash,
      role: "ADMIN",
    })
    .returning();

  return created.id;
}

async function deleteMemberAccounts(adminId: string) {
  await db.delete(users).where(ne(users.id, adminId));
}

async function main() {
  const adminId = await upsertAdmin();
  await deleteMemberAccounts(adminId);
  await applyFirstSessionDate(DEFAULT_FIRST_SESSION_DATE);

  console.log("Seed complete. Only admin remains.");
  console.log("Admin : admin@oterihack.fr");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
