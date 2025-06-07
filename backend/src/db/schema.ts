import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// User Schema
export const userTable = pgTable("user", {
  id: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  fullName: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expense Schema
export const expenseTable = pgTable("expense", {
  id: serial().primaryKey(),
  userId: integer().notNull(), // Foreign key to user table
  title: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Income Schema
export const incomeTable = pgTable("income", {
  id: serial().primaryKey(),
  userId: integer().notNull(),
  title: varchar({ length: 255 }).notNull(),
  amount: integer().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
