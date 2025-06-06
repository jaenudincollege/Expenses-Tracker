import { Request, Response } from "express";
import {
  createUser,
  generateToken,
  getUserProfile,
  validateUser,
} from "../handlers/auth.handler";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    // Create the user
    const newUser = await createUser(username, email, password, fullName);

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Validate user
    const user = await validateUser(email, password);

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }

    if (error instanceof Error && error.message === "Invalid password") {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(500).json({
      message: "Error logging in",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await getUserProfile(req.user.id);

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
