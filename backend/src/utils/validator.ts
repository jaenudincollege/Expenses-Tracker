import { z } from "zod";

// User validation schemas
export const registerUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Transaction validation schemas
export const transactionSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string(),
  date: z.string().optional(),
});

// Validator function
export const validate = <T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      };
    }
    return { success: false, error: "Validation failed" };
  }
};

// Date formatter
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// CSV data formatter
export const formatForCSV = <T extends Record<string, any>>(
  data: T[],
  dateFields: string[] = ["date", "createdAt", "updatedAt"]
): Record<string, any>[] => {
  return data.map((item) => {
    // Create a new object to avoid mutating the original
    const formattedItem: Record<string, any> = { ...item };

    // Format date fields
    dateFields.forEach((field) => {
      if (formattedItem[field] && formattedItem[field] instanceof Date) {
        formattedItem[field] = formatDate(formattedItem[field]);
      }
    });

    return formattedItem;
  });
};
