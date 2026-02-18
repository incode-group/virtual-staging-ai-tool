import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const stagingProjects = pgTable("staging_projects", {
  id: serial("id").primaryKey(),
  originalImage: text("original_image").notNull(),
  stagedImage: text("staged_image"),
  roomType: text("room_type").notNull(),
  style: text("style").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertStagingProjectSchema = createInsertSchema(stagingProjects).omit({
  id: true,
  stagedImage: true,
  status: true,
  createdAt: true,
});

export type InsertStagingProject = z.infer<typeof insertStagingProjectSchema>;
export type StagingProject = typeof stagingProjects.$inferSelect;

export const roomTypes = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Dining Room",
  "Bathroom",
  "Home Office",
] as const;

export const designStyles = [
  "Modern",
  "Minimalist",
  "Scandinavian",
  "Industrial",
  "Mid-Century Modern",
  "Contemporary",
  "Traditional",
  "Bohemian",
] as const;
