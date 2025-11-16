import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/auth.js";
import { bruteForceProtection, recordFailedAttempt, resetFailedAttempts } from "../middleware/bruteForce.js";
import { ipAllowlistMiddleware } from "../middleware/ipAllowlist.js";
import { validateLoginInput } from "../middleware/validation.js";
import { logger } from "../lib/logger.js";

const router = Router();

/**
 * POST /owner-portal-19-secure-access/login
 * Admin login endpoint with brute-force protection
 */
router.post(
  "/login",
  ipAllowlistMiddleware,
  bruteForceProtection,
  validateLoginInput,
  async (req, res) => {
    const { password } = req.body as { password?: string };
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    // Validate password
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    try {
      // Compare password with hash
      const isValid = await bcrypt.compare(password, env.adminPasswordHash);

      if (!isValid) {
        recordFailedAttempt(ip);
        logger.logFailedLogin(ip, env.adminEmail, "Invalid password");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Reset failed attempts on successful login
      resetFailedAttempts(ip);

      // Generate JWT token
      const token = jwt.sign(
        { adminId: "owner", email: env.adminEmail },
        env.jwtSecret,
        { expiresIn: env.jwtExpiry } as any
      );

      logger.logSuccessfulLogin(ip, env.adminEmail);

      res.json({
        token,
        expiresIn: "2h",
        adminId: "owner"
      });
    } catch (error) {
      logger.error("Login error", { ip, error: String(error) });
      return res.status(500).json({ message: "Authentication error" });
    }
  }
);

/**
 * GET /owner-portal-19-secure-access/me
 * Get current admin info (requires JWT)
 */
router.get("/me", requireAdmin, (req, res) => {
  res.json({
    id: "owner",
    email: env.adminEmail,
    role: "admin"
  });
});

export default router;

