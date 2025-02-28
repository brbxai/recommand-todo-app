import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull().default("Default description"),
  completed: boolean().notNull().default(false),
});
