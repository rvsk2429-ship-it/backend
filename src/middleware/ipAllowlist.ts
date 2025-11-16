import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

/**
 * Middleware to restrict access based on IP allowlist
 * Can be globally disabled via ENABLE_IP_WHITELIST env variable
 */
export const ipAllowlistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip if IP whitelisting is disabled
  if (!env.enableIpWhitelist) {
    return next();
  }

  const clientIp = getClientIp(req);

  // Check if IP is in allowlist
  const isAllowed = env.allowedIps.some((allowedIp) => {
    // Exact match
    if (clientIp === allowedIp) return true;
    // Handle localhost variations
    if ((clientIp === "127.0.0.1" || clientIp === "::1") && (allowedIp === "localhost" || allowedIp === "127.0.0.1")) {
      return true;
    }
    return false;
  });

  if (!isAllowed) {
    logger.logSecurityEvent("ip_whitelist_violation", {
      clientIp,
      allowedIps: env.allowedIps,
      path: req.path,
      method: req.method
    });

    return res.status(403).json({
      message: "Access denied. Your IP address is not whitelisted."
    });
  }

  next();
};

/**
 * Extract client IP from request
 * Handles proxies, X-Forwarded-For headers, etc.
 */
export const getClientIp = (req: Request): string => {
  // Check X-Forwarded-For header (common in proxies)
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  // Check X-Real-IP header
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") {
    return realIp;
  }

  // Fall back to socket address
  return req.ip || req.socket.remoteAddress || "unknown";
};
