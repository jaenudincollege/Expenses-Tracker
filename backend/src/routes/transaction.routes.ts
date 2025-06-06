import { Router } from "express";
import {
  downloadTransactionsCsv,
  getAllUserTransactions,
  getRecentTransactionsByDays,
  getUserBalance,
  getUserMonthlyStats,
} from "../controllers/transaction.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Protected routes - all transaction routes require authentication
router.use(authenticate);

// Transaction routes
router.get("/", getAllUserTransactions);
router.get("/balance", getUserBalance);
router.get("/monthly-stats", getUserMonthlyStats);
router.get("/history/:days", getRecentTransactionsByDays);
router.get("/download/csv", downloadTransactionsCsv);

export default router;
