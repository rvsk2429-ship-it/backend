import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { adminBookingRouter, publicBookingRouter } from "./routes/bookings.js";
import adminRoute from "./routes/admin.js";
import { initRealtime } from "./lib/realtime.js";
import { ipAllowlistMiddleware } from "./middleware/ipAllowlist.js";
import { logger } from "./lib/logger.js";

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());

// CORS with strict configuration
app.use(
  cors({
    origin: env.clientOrigin, // your frontend URL from .env
    credentials: true,               // allow cookies or auth headers
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));

// Logging
app.use(morgan("combined"));

// IP Allowlist for sensitive routes (optional)
app.use("/owner-portal-19-secure-access", ipAllowlistMiddleware);
app.use("/api/orders", ipAllowlistMiddleware);

// Health check
app.get("/", (_req, res) => {
  res.json({ name: "RINKU BEAUTY CARE API", status: "online", version: "2.0.0" });
});

// Public routes
app.use("/api/book", publicBookingRouter);

// Admin routes (using secure path)
app.use(env.adminSecurePath, adminRoute);

// Legacy route redirect (for backward compatibility, redirects to secure path)
app.post("/api/admin/login", (req, res) => {
  res.status(301).json({
    message: "This endpoint has moved",
    redirectTo: env.adminSecurePath + "/login"
  });
});

// Protected admin API routes
app.use("/api/orders", adminBookingRouter);

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error", { error: String(err) });
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  try {
    await connectDatabase();
    initRealtime(server);
    server.listen(env.port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${env.port}`);
  console.log(`🔐 Admin portal: ${env.adminSecurePath}`);
  logger.info(`Server started in ${env.nodeEnv} mode`, { port: env.port });
});
  } catch (error) {
    logger.error("Server failed to start", { error: String(error) });
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

start();

