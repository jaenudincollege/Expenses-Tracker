import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  decimal,
  index,
} from "drizzle-orm/pg-core";

// User Schema
export const userTable = pgTable("user", {
  id: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  fullName: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Expense Schema
export const expenseTable = pgTable("expense", {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Now supports values like 90.54
  category: varchar("category", { length: 100 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Income Schema
export const incomeTable = pgTable("income", {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Now supports values like 90.54
  category: varchar("category", { length: 100 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
