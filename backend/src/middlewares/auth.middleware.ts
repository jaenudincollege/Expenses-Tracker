import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { JwtPayload } from "../types";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    } // Use a helper function to verify token with proper typing
    const verifyJwt = (token: string, secret: string): JwtPayload => {
      return jwt.verify(token, secret as any) as JwtPayload;
    };

    // Verify token
    const decoded = verifyJwt(token, config.jwt.secret);

    // Add user data to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid authentication token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
