import dotenv from "dotenv";
dotenv.config();
const exitWithEnvError = (variables) => {
    console.error("❌ Missing required environment variables:", variables.join(", "));
    console.error("Please set them in your .env file before starting the server.");
    process.exit(1);
};
const requiredMissing = [];
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
if (requiredMissing.length) {
    exitWithEnvError(requiredMissing);
}
export const env = {
    port: Number(process.env.PORT ?? 5000),
    mongoUri,
    adminPasswordHash,
    jwtSecret,
    clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    adminPath: process.env.ADMIN_PATH ?? "/admin",
    rateLimitMaxAttempts: Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS ?? 5),
    rateLimitWindowMs: Number(process.env.ADMIN_LOGIN_WINDOW_MS ?? 60 * 60 * 1000)
};
//# sourceMappingURL=env.js.map