import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  googleSub: varchar("google_sub", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("member"),
  marketingRole: varchar("marketing_role", { length: 50 }).default("content"),
  isAdmin: boolean("is_admin").notNull().default(false),
  active: boolean("active").notNull().default(true),
  imageUrl: text("image_url"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Email Allowlist (external users who can access MarketingOS) ───────────────
export const emailAllowlist = pgTable("email_allowlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  addedBy: uuid("added_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Key-Value Store (replaces Supabase kv_store) ─────────────────────────────
export const kvStore = pgTable("kv_store", {
  key: varchar("key", { length: 500 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
});
