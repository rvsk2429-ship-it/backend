import dotenv from "dotenv";

dotenv.config();

const exitWithEnvError = (variables: string[]) => {
  console.error("❌ Missing required environment variables:", variables.join(", "));
  console.error("Please set them in your .env file before starting the server.");
  process.exit(1);
};

const requiredMissing: string[] = [];

const mongoUri = process.env.MONGODB_URI ?? "";
if (!mongoUri) {
  requiredMissing.push("MONGODB_URI");
}

const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
if (!adminPasswordHash) {
  requiredMissing.push("ADMIN_PASSWORD_HASH");
}

const jwtSecret = process.env.JWT_SECRET ?? "";
if (!jwtSecret) {
  requiredMissing.push("JWT_SECRET");
}

const encryptionKey = process.env.ENCRYPTION_KEY ?? "";
if (!encryptionKey || encryptionKey.length !== 64) {
  // 64 hex chars = 32 bytes
  requiredMissing.push("ENCRYPTION_KEY (must be 32 bytes as hex string, 64 chars)");
}

const encryptionIV = process.env.ENCRYPTION_IV ?? "";
if (!encryptionIV || encryptionIV.length !== 32) {
  // 32 hex chars = 16 bytes
  requiredMissing.push("ENCRYPTION_IV (must be 16 bytes as hex string, 32 chars)");
}

if (requiredMissing.length) {
  exitWithEnvError(requiredMissing);
}

export const env = {
  // Server
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: (process.env.NODE_ENV ?? "development") as "development" | "production",
  logLevel: (process.env.LOG_LEVEL ?? "debug") as "debug" | "info" | "warn" | "error",

  // Database
  mongoUri,

  // Authentication
  adminEmail: process.env.ADMIN_EMAIL ?? "owner@rinku-beauty.com",
  adminPasswordHash,
  jwtSecret,
  jwtExpiry: process.env.JWT_EXPIRY ?? "2h",

  // Encryption
  encryptionKey,
  encryptionIV,
  encryptionAlgorithm: "aes-256-gcm",

  // Rate Limiting (Brute Force Protection)
  rateLimitMaxAttempts: Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS ?? 5),
  rateLimitWindowMs: Number(process.env.ADMIN_LOGIN_WINDOW_MS ?? 60 * 1000),

  // IP Allowlist
  enableIpWhitelist: process.env.ENABLE_IP_WHITELIST === "true",
  allowedIps: (process.env.ALLOWED_IPS ?? "127.0.0.1,localhost").split(",").map((ip) => ip.trim()),

  // Client
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",

  // Hidden Admin Route
  adminSecurePath: "/owner-portal-19-secure-access"
};

