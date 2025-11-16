import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

interface FailedAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const failedAttempts = new Map<string, FailedAttempt>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Middleware to protect against brute-force attacks on login endpoint
 * - Tracks failed attempts per IP
 * - Locks account for 15 minutes after 5 failed attempts in 1 minute
 */
export const bruteForceProtection = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  let attempt = failedAttempts.get(ip);

  // Check if account is locked
  if (attempt?.lockedUntil && now < attempt.lockedUntil) {
    const remainingMs = attempt.lockedUntil - now;
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    logger.logSecurityEvent("brute_force_lockout", {
      ip,
      remainingSeconds,
      reason: "Too many failed login attempts"
    });

    return res.status(429).json({
      message: `Too many login attempts. Try again in ${remainingSeconds} seconds.`,
      retryAfter: remainingSeconds
    });
  }

  // Clean up old attempts
  if (attempt && now - attempt.lastAttempt > WINDOW_MS) {
    failedAttempts.delete(ip);
    attempt = undefined;
  }

  // Store the failed attempt for later validation
  res.locals.ipAddress = ip;
  next();
};

/**
 * Record a failed login attempt
 */
export const recordFailedAttempt = (ip: string) => {
  const now = Date.now();
  let attempt = failedAttempts.get(ip);

  if (!attempt) {
    attempt = { count: 1, lastAttempt: now };
  } else if (now - attempt.lastAttempt > WINDOW_MS) {
    // Reset if outside window
    attempt = { count: 1, lastAttempt: now };
  } else {
    // Increment within window
    attempt.count++;
  }

  // Lock account if threshold reached
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
    logger.logSecurityEvent("brute_force_lockout_triggered", {
      ip,
      attempts: attempt.count,
      lockedUntilMs: LOCKOUT_DURATION_MS
    });
  }

  failedAttempts.set(ip, attempt);
};

/**
 * Reset failed attempts for an IP (call after successful login)
 */
export const resetFailedAttempts = (ip: string) => {
  failedAttempts.delete(ip);
};

/**
 * Get current attempt info for an IP (for testing/debugging)
 */
export const getAttemptInfo = (ip: string): FailedAttempt | undefined => {
  return failedAttempts.get(ip);
};
