// Auth Types
export interface JwtPayload {
  id: number;
  username: string;
  email: string;
}

// Express request extension
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Transaction Types
export type Transaction = {
  id: number;
  userId: number;
  type: "income" | "expense";
  title: string;
  amount: string | number; // Support both string and number for decimal values
  category: string;
  date: Date;
  description: string | null; // Allow null for description since it's nullable in the schema
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  fullName?: string | null;
};

// Export format data structures
export type ExportRecord = {
  id: number;
  title: string;
  amount: string | number; // Support both string and number for decimal values
  category: string;
  date: string;
  description: string | null; // Allow null for description to match schema
  createdAt: string;
  updatedAt?: string;
  type?: "income" | "expense";
  [key: string]: any; // To allow for additional fields
};
