import { Request, Response } from "express";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import fs from "fs";
import config from "../config";
import {
  createExpense,
  deleteExpense,
  formatExpensesForExport,
  getExpenseById as getExpenseByIdHandler,
  getRecentExpenses,
  getUserExpenses,
  updateExpense,
} from "../handlers/expense.handler";

export const getExpenses = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const expenses = await getUserExpenses(req.user.id);
    res.status(200).json({ expenses });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching expenses",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { title, amount, category, date, description } = req.body;

    if (!title || !amount || !category || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = await createExpense(
      req.user.id,
      title,
      amount,
      category,
      description,
      date
    );

    res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding expense",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    try {
      const expense = await getExpenseByIdHandler(parseInt(id), req.user.id);
      res.status(200).json({ expense });
    } catch (error) {
      return res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching expense",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateExpenseById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    const { title, amount, category, date, description } = req.body;

    try {
      const updatedExpense = await updateExpense(parseInt(id), req.user.id, {
        title,
        amount,
        category,
        date,
        description,
      });

      res.status(200).json({
        message: "Expense updated successfully",
        expense: updatedExpense,
      });
    } catch (error) {
      return res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating expense",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteExpenseById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    try {
      await deleteExpense(parseInt(id), req.user.id);
      res.status(200).json({
        message: "Expense deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error deleting expense",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRecentExpensesByDays = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { days } = req.params;
    const daysCount = parseInt(days);

    const validDays = [7, 30, 90, 180, 365];
    if (isNaN(daysCount) || !validDays.includes(daysCount)) {
      return res
        .status(400)
        .json({
          message: `Days parameter must be one of ${validDays.join(", ")}`,
        });
    }

    const expenses = await getRecentExpenses(req.user.id, daysCount);

    res.status(200).json({
      expenses,
      period: `Last ${daysCount} days`,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error fetching expenses for the last ${req.params.days} days`,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const downloadExpensesCsv = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get expenses for the user
    const expenses = await getUserExpenses(req.user.id);

    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(config.tempDir)) {
      fs.mkdirSync(config.tempDir);
    }

    // Set up CSV file path
    const timestamp = Date.now();
    const fileName = `expenses_export_${timestamp}.csv`;
    const filePath = path.join(config.tempDir, fileName);

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "id", title: "ID" },
        { id: "title", title: "Title" },
        { id: "amount", title: "Amount" },
        { id: "category", title: "Category" },
        { id: "date", title: "Date" },
        { id: "description", title: "Description" },
        { id: "createdAt", title: "Created At" },
      ],
    });

    // Format expenses for CSV
    const formattedExpenses = formatExpensesForExport(expenses);

    // Write to CSV
    await csvWriter.writeRecords(formattedExpenses);

    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file",
          error: err,
        });
      }

      // Delete file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({
      message: "Error downloading expenses CSV",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
