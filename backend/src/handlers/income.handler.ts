import { and, desc, eq, gte } from "drizzle-orm";
import { db, schema } from "../db";
import { ExportRecord } from "../types";

export const getUserIncomes = async (userId: number) => {
  return await db
    .select()
    .from(schema.incomeTable)
    .where(eq(schema.incomeTable.userId, userId))
    .orderBy(desc(schema.incomeTable.date));
};

export const createIncome = async (
  userId: number,
  title: string,
  amount: number,
  category: string,
  description: string,
  date?: Date
) => {
  const income = await db
    .insert(schema.incomeTable)
    .values({
      userId,
      title,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      description,
    })
    .returning();

  return income[0];
};

export const getIncomeById = async (incomeId: number, userId: number) => {
  const incomes = await db
    .select()
    .from(schema.incomeTable)
    .where(
      and(
        eq(schema.incomeTable.id, incomeId),
        eq(schema.incomeTable.userId, userId)
      )
    );

  if (incomes.length === 0) {
    throw new Error("Income not found");
  }

  return incomes[0];
};

export const updateIncome = async (
  incomeId: number,
  userId: number,
  updateData: {
    title?: string;
    amount?: number;
    category?: string;
    date?: Date;
    description?: string;
  }
) => {
  // Check if income exists and belongs to user
  const income = await getIncomeById(incomeId, userId);

  // Update income
  const updatedIncome = await db
    .update(schema.incomeTable)
    .set({
      title: updateData.title || income.title,
      amount: updateData.amount || income.amount,
      category: updateData.category || income.category,
      date: updateData.date ? new Date(updateData.date) : income.date,
      description: updateData.description || income.description,
      updatedAt: new Date(),
    })
    .where(eq(schema.incomeTable.id, incomeId))
    .returning();

  return updatedIncome[0];
};

export const deleteIncome = async (incomeId: number, userId: number) => {
  // Check if income exists and belongs to user
  await getIncomeById(incomeId, userId);

  // Delete income
  await db
    .delete(schema.incomeTable)
    .where(eq(schema.incomeTable.id, incomeId));

  return { success: true };
};

export const getRecentIncomes = async (userId: number, days: number) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await db
    .select()
    .from(schema.incomeTable)
    .where(
      and(
        eq(schema.incomeTable.userId, userId),
        gte(schema.incomeTable.date, cutoffDate)
      )
    )
    .orderBy(desc(schema.incomeTable.date));
};

export const formatIncomesForExport = (incomes: any[]): ExportRecord[] => {
  return incomes.map((income) => {
    const formattedIncome: ExportRecord = {
      ...income,
      date: income.date
        ? new Date(income.date).toISOString().split("T")[0]
        : "",
      createdAt: income.createdAt
        ? new Date(income.createdAt).toISOString()
        : "",
    };

    if (income.updatedAt) {
      formattedIncome.updatedAt = new Date(income.updatedAt).toISOString();
    }

    return formattedIncome;
  });
};
