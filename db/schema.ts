import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["MEMBER", "ADMIN"]);
export const sessionStatusEnum = pgEnum("session_status", [
  "OPEN",
  "CLOSED",
  "DONE",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SLOT_UNAVAILABLE",
  "COMPLETED",
]);
export const slotKindEnum = pgEnum("slot_kind", ["TECHNIQUE", "WTF"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("MEMBER"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rumpSessions = pgTable("rump_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: text("date").notNull().unique(),
  startTime: text("start_time").notNull().default("18:00"),
  endTime: text("end_time").notNull().default("19:00"),
  number: integer("number").notNull(),
  status: sessionStatusEnum("status").notNull().default("OPEN"),
});

export const slots = pgTable(
  "slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    rumpSessionId: uuid("rump_session_id")
      .notNull()
      .references(() => rumpSessions.id, { onDelete: "cascade" }),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    position: integer("position").notNull(),
    kind: slotKindEnum("kind").notNull().default("TECHNIQUE"),
  },
  (table) => [
    uniqueIndex("slots_session_position").on(table.rumpSessionId, table.position),
  ],
);

export const talkApplications = pgTable(
  "talk_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rumpSessionId: uuid("rump_session_id")
      .notNull()
      .references(() => rumpSessions.id, { onDelete: "cascade" }),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => slots.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    discipline: text("discipline").notNull(),
    level: text("level").notNull(),
    status: applicationStatusEnum("status").notNull().default("PENDING"),
    adminComment: text("admin_comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("one_app_per_user_slot").on(table.userId, table.slotId),
    uniqueIndex("one_approved_per_slot")
      .on(table.slotId)
      .where(sql`${table.status} = 'APPROVED'`),
  ],
);

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type User = typeof users.$inferSelect;
export type RumpSession = typeof rumpSessions.$inferSelect;
export type Slot = typeof slots.$inferSelect;
export type TalkApplication = typeof talkApplications.$inferSelect;
