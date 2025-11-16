import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export interface AdminRequest extends Request {
  adminId?: string;
}

export const requireAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  if (!header?.startsWith("Bearer ")) {
    logger.warn("Admin access attempt without bearer token", { ip, path: req.path });
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { adminId: string };
    req.adminId = decoded.adminId;
    logger.debug("JWT verified successfully", { adminId: decoded.adminId, ip });
    next();
  } catch (error) {
    logger.warn("JWT verification failed", { ip, path: req.path, error: String(error) });
    return res.status(401).json({ message: "Invalid token" });
  }
};

