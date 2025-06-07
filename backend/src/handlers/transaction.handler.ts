import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "../db";
import { ExportRecord, Transaction } from "../types";

export const getBalance = async (userId: number) => {
  // Get total expenses
  const expenseResult = await db
    .select({
      total: sql<string>`sum(${schema.expenseTable.amount})`,
    })
    .from(schema.expenseTable)
    .where(eq(schema.expenseTable.userId, userId));

  // Get total incomes
  const incomeResult = await db
    .select({
      total: sql<string>`sum(${schema.incomeTable.amount})`,
    })
    .from(schema.incomeTable)
    .where(eq(schema.incomeTable.userId, userId));

  // Parse string values to numbers with fallback to 0
  const totalExpense = parseFloat(expenseResult[0].total || '0');
  const totalIncome = parseFloat(incomeResult[0].total || '0');
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

  // Calculate totals by parsing string amounts to numbers
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount.toString()),
    0
  );
  const totalIncome = incomes.reduce(
    (sum, income) => sum + parseFloat(income.amount.toString()),
    0
  );
  const monthlyBalance = totalIncome - totalExpense;

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((expense) => {
    if (!expenseByCategory[expense.category]) {
      expenseByCategory[expense.category] = 0;
    }
    expenseByCategory[expense.category] += parseFloat(expense.amount.toString());
  });

  // Group incomes by category
  const incomeByCategory: Record<string, number> = {};
  incomes.forEach((income) => {
    if (!incomeByCategory[income.category]) {
      incomeByCategory[income.category] = 0;
    }
    incomeByCategory[income.category] += parseFloat(income.amount.toString());
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

  return transactions as Transaction[];
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
    (sum, expense) => sum + parseFloat(expense.amount.toString()),
    0
  );
  const totalIncome = incomes.reduce(
    (sum, income) => sum + parseFloat(income.amount.toString()),
    0
  );
  const balance = totalIncome - totalExpense;

  return {
    transactions: transactions as Transaction[],
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
    // Create a base object without the transaction properties
    const base = {
      id: transaction.id,
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      description: transaction.description,
      // Format dates as ISO strings
      date: transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : "",
      createdAt: transaction.createdAt
        ? new Date(transaction.createdAt).toISOString()
        : "",
    };
    
    // Only add updatedAt if it exists
    const formattedTransaction: ExportRecord = base;
    
    if (transaction.updatedAt) {
      formattedTransaction.updatedAt = new Date(
        transaction.updatedAt
      ).toISOString();
    }

    return formattedTransaction;
  });
};
