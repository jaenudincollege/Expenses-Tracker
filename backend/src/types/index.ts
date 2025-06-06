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
  amount: number;
  category: string;
  date: Date;
  description: string;
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
  amount: number;
  category: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  type?: "income" | "expense";
  [key: string]: any; // To allow for additional fields
};
