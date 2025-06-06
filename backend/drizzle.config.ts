import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import config from "./src/config";

// Load environment variables
dotenv.config();

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/db/schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
