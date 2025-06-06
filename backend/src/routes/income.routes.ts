import { Router } from "express";
import {
  addIncome,
  deleteIncomeById,
  downloadIncomesCsv,
  getIncomeById,
  getIncomes,
  getRecentIncomesByDays,
  updateIncomeById,
} from "../controllers/income.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Protected routes - all income routes require authentication
router.use(authenticate);

// Basic CRUD routes
router.get("/", getIncomes);
router.post("/", addIncome);
router.get("/:id", getIncomeById);
router.patch("/:id", updateIncomeById);
router.delete("/:id", deleteIncomeById);

// Additional feature routes
router.get("/history/:days", getRecentIncomesByDays);
router.get("/download/csv", downloadIncomesCsv);

export default router;
