import { and, desc, eq, gte } from "drizzle-orm";
import { db, schema } from "../db";
import { ExportRecord } from "../types";

export const getUserExpenses = async (userId: number) => {
  return await db
    .select()
    .from(schema.expenseTable)
    .where(eq(schema.expenseTable.userId, userId))
    .orderBy(desc(schema.expenseTable.date));
};

export const createExpense = async (
  userId: number,
  title: string,
  amount: number,
  category: string,
  description: string,
  date?: Date
) => {
  const expense = await db
    .insert(schema.expenseTable)
    .values({
      userId,
      title,
      // Convert to string for decimal column
      amount: amount.toString(),
      category,
      date: date ? new Date(date) : new Date(),
      description: description || "",
    })
    .returning();

  return expense[0];
};

export const getExpenseById = async (expenseId: number, userId: number) => {
  const expenses = await db
    .select()
    .from(schema.expenseTable)
    .where(
      and(
        eq(schema.expenseTable.id, expenseId),
        eq(schema.expenseTable.userId, userId)
      )
    );

  if (expenses.length === 0) {
    throw new Error("Expense not found");
  }

  return expenses[0];
};

export const updateExpense = async (
  expenseId: number,
  userId: number,
  updateData: {
    title?: string;
    amount?: number;
    category?: string;
    date?: Date;
    description?: string;
  }
) => {
  // Check if expense exists and belongs to user
  const expense = await getExpenseById(expenseId, userId);

  // Update expense
  const updatedExpense = await db
    .update(schema.expenseTable)
    .set({
      title: updateData.title || expense.title,
      // Convert to string for decimal column
      amount: updateData.amount
        ? updateData.amount.toString()
        : expense.amount.toString(),
      category: updateData.category || expense.category,
      date: updateData.date ? new Date(updateData.date) : expense.date,
      description: updateData.description ?? expense.description,
      updatedAt: new Date(),
    })
    .where(eq(schema.expenseTable.id, expenseId))
    .returning();

  return updatedExpense[0];
};

export const deleteExpense = async (expenseId: number, userId: number) => {
  // Check if expense exists and belongs to user
  await getExpenseById(expenseId, userId);

  // Delete expense
  await db
    .delete(schema.expenseTable)
    .where(eq(schema.expenseTable.id, expenseId));

  return { success: true };
};

export const getRecentExpenses = async (userId: number, days: number) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await db
    .select()
    .from(schema.expenseTable)
    .where(
      and(
        eq(schema.expenseTable.userId, userId),
        gte(schema.expenseTable.date, cutoffDate)
      )
    )
    .orderBy(desc(schema.expenseTable.date));
};

export const formatExpensesForExport = (expenses: any[]): ExportRecord[] => {
  return expenses.map((expense) => {
    const formattedExpense: ExportRecord = {
      ...expense,
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
      createdAt: expense.createdAt
        ? new Date(expense.createdAt).toISOString()
        : "",
    };

    if (expense.updatedAt) {
      formattedExpense.updatedAt = new Date(expense.updatedAt).toISOString();
    }

    return formattedExpense;
  });
};
