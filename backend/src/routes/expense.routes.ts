import { Router } from "express";
import {
  addExpense,
  deleteExpenseById,
  downloadExpensesCsv,
  getExpenseById,
  getExpenses,
  getRecentExpensesByDays,
  updateExpenseById,
} from "../controllers/expense.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Protected routes - all expense routes require authentication
router.use(authenticate);

// Basic CRUD routes
router.get("/", getExpenses);
router.post("/", addExpense);
router.get("/:id", getExpenseById);
router.patch("/:id", updateExpenseById);
router.delete("/:id", deleteExpenseById);

// Additional feature routes
router.get("/history/:days", getRecentExpensesByDays);
router.get("/download/csv", downloadExpensesCsv);

export default router;
