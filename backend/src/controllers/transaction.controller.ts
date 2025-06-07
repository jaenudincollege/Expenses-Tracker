import { Request, Response } from "express";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import fs from "fs";
import config from "../config";
import {
  formatTransactionsForExport,
  getAllTransactions,
  getBalance,
  getMonthlyStats,
  getRecentTransactions,
} from "../handlers/transaction.handler";

export const getUserBalance = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const balanceData = await getBalance(req.user.id);

    res.status(200).json(balanceData);
  } catch (error) {
    res.status(500).json({
      message: "Error getting balance",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserMonthlyStats = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const statsData = await getMonthlyStats(req.user.id);

    res.status(200).json(statsData);
  } catch (error) {
    res.status(500).json({
      message: "Error getting monthly stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllUserTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const transactions = await getAllTransactions(req.user.id);

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching transactions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRecentTransactionsByDays = async (
  req: Request,
  res: Response
) => {
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

    const result = await getRecentTransactions(req.user.id, daysCount);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: `Error fetching transactions for the last ${req.params.days} days`,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const downloadTransactionsCsv = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get all transactions
    const transactions = await getAllTransactions(req.user.id);

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(config.tempDir)) {
      fs.mkdirSync(config.tempDir);
    }

    // Set up CSV file path
    const timestamp = Date.now();
    const fileName = `transactions_export_${timestamp}.csv`;
    const filePath = path.join(config.tempDir, fileName);

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "type", title: "Type" },
        { id: "id", title: "ID" },
        { id: "title", title: "Title" },
        { id: "amount", title: "Amount" },
        { id: "category", title: "Category" },
        { id: "date", title: "Date" },
        { id: "description", title: "Description" },
        { id: "createdAt", title: "Created At" },
      ],
    });

    // Format transactions for CSV
    const formattedTransactions = formatTransactionsForExport(transactions);

    // Write to CSV
    await csvWriter.writeRecords(formattedTransactions);

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
      message: "Error downloading transactions CSV",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
