import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Define config type for better typing
type Config = {
  port: string | number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string | number;
  };
  tempDir: string;
  nodeEnv: string;
};

const config: Config = {
  port: process.env.PORT || 3001,
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-default-secret-key",
    expiresIn: "7d",
  }, // Use /tmp directory for Vercel serverless functions when in production
  tempDir:
    process.env.NODE_ENV === "production"
      ? "/tmp"
      : path.join(process.cwd(), "temp"),
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
