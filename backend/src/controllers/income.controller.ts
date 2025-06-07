import { Request, Response } from "express";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import fs from "fs";
import config from "../config";
import {
  createIncome,
  deleteIncome,
  formatIncomesForExport,
  getIncomeById as getIncomeByIdHandler,
  getRecentIncomes,
  getUserIncomes,
  updateIncome,
} from "../handlers/income.handler";

export const getIncomes = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const incomes = await getUserIncomes(req.user.id);
    res.status(200).json({ incomes });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching incomes",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const addIncome = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { title, amount, category, date, description } = req.body;

    if (!title || !amount || !category || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const income = await createIncome(
      req.user.id,
      title,
      amount,
      category,
      description,
      date
    );

    res.status(201).json({
      message: "Income added successfully",
      income,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding income",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getIncomeById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    try {
      const income = await getIncomeByIdHandler(parseInt(id), req.user.id);
      res.status(200).json({ income });
    } catch (error) {
      return res.status(404).json({ message: "Income not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching income",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateIncomeById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    const { title, amount, category, date, description } = req.body;

    try {
      const updatedIncome = await updateIncome(parseInt(id), req.user.id, {
        title,
        amount,
        category,
        date,
        description,
      });

      res.status(200).json({
        message: "Income updated successfully",
        income: updatedIncome,
      });
    } catch (error) {
      return res.status(404).json({ message: "Income not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating income",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteIncomeById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    try {
      await deleteIncome(parseInt(id), req.user.id);
      res.status(200).json({
        message: "Income deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({ message: "Income not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error deleting income",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRecentIncomesByDays = async (req: Request, res: Response) => {
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

    const incomes = await getRecentIncomes(req.user.id, daysCount);

    res.status(200).json({
      incomes,
      period: `Last ${daysCount} days`,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error fetching incomes for the last ${req.params.days} days`,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const downloadIncomesCsv = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get incomes for the user
    const incomes = await getUserIncomes(req.user.id);

    if (incomes.length === 0) {
      return res.status(404).json({ message: "No incomes found" });
    }

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(config.tempDir)) {
      fs.mkdirSync(config.tempDir);
    }

    // Set up CSV file path
    const timestamp = Date.now();
    const fileName = `incomes_export_${timestamp}.csv`;
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

    // Format incomes for CSV
    const formattedIncomes = formatIncomesForExport(incomes);

    // Write to CSV
    await csvWriter.writeRecords(formattedIncomes);

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
      message: "Error downloading incomes CSV",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
