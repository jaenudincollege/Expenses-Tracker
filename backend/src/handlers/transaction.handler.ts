import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { ExportRecord, Transaction } from "../types";

export const getBalance = async (userId: number) => {
  // Get total expenses
  const expenseResult = await db
    .select({
      total: sql<number>`sum(${schema.expenseTable.amount})`,
    })
    .from(schema.expenseTable)
    .where(eq(schema.expenseTable.userId, userId));

  // Get total incomes
  const incomeResult = await db
    .select({
      total: sql<number>`sum(${schema.incomeTable.amount})`,
    })
    .from(schema.incomeTable)
    .where(eq(schema.incomeTable.userId, userId));

  const totalExpense = expenseResult[0].total || 0;
  const totalIncome = incomeResult[0].total || 0;
  const balance = totalIncome - totalExpense;

  return {
    balance,
    totalIncome,
    totalExpense,
  };
};

export const getMonthlyStats = async (userId: number) => {
  // Get current month's data
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Get expenses for current month
  const expenses = await db
    .select()
    .from(schema.expenseTable)
    .where(
      and(
        eq(schema.expenseTable.userId, userId),
        gte(schema.expenseTable.date, firstDayOfMonth)
      )
    );

  // Get incomes for current month
  const incomes = await db
    .select()
    .from(schema.incomeTable)
    .where(
      and(
        eq(schema.incomeTable.userId, userId),
        gte(schema.incomeTable.date, firstDayOfMonth)
      )
    );

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const monthlyBalance = totalIncome - totalExpense;

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((expense) => {
    if (!expenseByCategory[expense.category]) {
      expenseByCategory[expense.category] = 0;
    }
    expenseByCategory[expense.category] += expense.amount;
  });

  // Group incomes by category
  const incomeByCategory: Record<string, number> = {};
  incomes.forEach((income) => {
    if (!incomeByCategory[income.category]) {
      incomeByCategory[income.category] = 0;
    }
    incomeByCategory[income.category] += income.amount;
  });

  return {
    month: currentDate.toLocaleString("default", { month: "long" }),
    year: currentDate.getFullYear(),
    monthlyBalance,
    totalIncome,
    totalExpense,
    expenseByCategory,
    incomeByCategory,
  };
};

export const getAllTransactions = async (
  userId: number
): Promise<Transaction[]> => {
  // Get all expenses for the user
  const expenses = await db
    .select()
    .from(schema.expenseTable)
    .where(eq(schema.expenseTable.userId, userId));

  // Get all incomes for the user
  const incomes = await db
    .select()
    .from(schema.incomeTable)
    .where(eq(schema.incomeTable.userId, userId));

  // Combine and format transactions
  const transactions = [
    ...expenses.map((expense) => ({ ...expense, type: "expense" as const })),
    ...incomes.map((income) => ({ ...income, type: "income" as const })),
  ].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return transactions;
};

export const getRecentTransactions = async (
  userId: number,
  days: number
): Promise<{
  transactions: Transaction[];
  summary: {
    totalExpense: number;
    totalIncome: number;
    balance: number;
    period: string;
  };
}> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get expenses within date range
  const expenses = await db
    .select()
    .from(schema.expenseTable)
    .where(
      and(
        eq(schema.expenseTable.userId, userId),
        gte(schema.expenseTable.date, cutoffDate)
      )
    );

  // Get incomes within date range
  const incomes = await db
    .select()
    .from(schema.incomeTable)
    .where(
      and(
        eq(schema.incomeTable.userId, userId),
        gte(schema.incomeTable.date, cutoffDate)
      )
    );

  // Combine and format transactions
  const transactions = [
    ...expenses.map((expense) => ({ ...expense, type: "expense" as const })),
    ...incomes.map((income) => ({ ...income, type: "income" as const })),
  ].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate summary statistics
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const balance = totalIncome - totalExpense;

  return {
    transactions,
    summary: {
      totalExpense,
      totalIncome,
      balance,
      period: `Last ${days} days`,
    },
  };
};

export const formatTransactionsForExport = (
  transactions: Transaction[]
): ExportRecord[] => {
  return transactions.map((transaction) => {
    // Create a new object with just the fields we need
    const formattedTransaction: ExportRecord = {
      id: transaction.id,
      type: transaction.type,
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : "",
      createdAt: transaction.createdAt
        ? new Date(transaction.createdAt).toISOString()
        : "",
    };

    // Add updatedAt if it exists
    if (transaction.updatedAt) {
      formattedTransaction.updatedAt = new Date(
        transaction.updatedAt
      ).toISOString();
    }

    return formattedTransaction;
  });
};
