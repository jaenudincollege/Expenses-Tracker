import { Request, Response, NextFunction } from "express";
import config from "../config";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    error:
      config.nodeEnv === "production" ? "Internal server error" : err.message,
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
  });
};
