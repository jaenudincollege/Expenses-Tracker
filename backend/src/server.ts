import express from "express";
import cors from "cors";
import fs from "fs";
import config from "./config";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

// Import routes
import authRoutes from "./routes/auth.routes";
import expenseRoutes from "./routes/expense.routes";
import incomeRoutes from "./routes/income.routes";
import transactionRoutes from "./routes/transaction.routes";

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create temp directory for CSV exports
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir);
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/transactions", transactionRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
