import app from "./server";
import config from "./config";

const PORT = config.port;

// Start the Express server for both development and production
app.listen(PORT, () => {
  console.log(
    `Server is running on ${
      process.env.NODE_ENV === "production" ? "" : "http://localhost:"
    }${PORT}`
  );
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Still export the app for testing purposes
export default app;
