import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import config from "../config";
import { JwtPayload, UserProfile } from "../types";

export const createUser = async (
  username: string,
  email: string,
  password: string,
  fullName?: string
) => {
  // Check if user already exists
  const existingUser = await db
    .select()
    .from(schema.userTable)
    .where(eq(schema.userTable.email, email));

  if (existingUser.length > 0) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await db
    .insert(schema.userTable)
    .values({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || null,
    })
    .returning();

  return newUser[0];
};

export const validateUser = async (email: string, password: string) => {
  // Find user by email
  const users = await db
    .select()
    .from(schema.userTable)
    .where(eq(schema.userTable.email, email));

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  return user;
};

export const generateToken = (user: {
  id: number;
  username: string;
  email: string;
}) => {
  // Define the payload
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  // Use a type assertion to resolve the typing issue
  // This is safe because jwt.sign does accept string as a secret
  const signJwt = (
    payload: object,
    secret: string,
    options: { expiresIn: string | number }
  ): string => jwt.sign(payload, secret, options as any);

  return signJwt(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const users = await db
    .select()
    .from(schema.userTable)
    .where(eq(schema.userTable.id, userId));

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
  };
};
