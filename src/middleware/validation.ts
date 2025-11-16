import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

/**
 * Validates booking input
 */
export const validateBookingInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, phone, service, preferredDate, preferredTime } = req.body;

  // Check required fields
  if (!name || !phone || !service || !preferredDate || !preferredTime) {
    logger.warn("Booking validation failed: missing required fields", {
      ip: req.ip,
      provided: { name: !!name, phone: !!phone, service: !!service, preferredDate: !!preferredDate, preferredTime: !!preferredTime }
    });

    return res.status(400).json({
      message: "Missing required fields: name, phone, service, preferredDate, preferredTime"
    });
  }

  // Validate name (3-100 chars, no special chars except spaces)
  if (typeof name !== "string" || name.length < 3 || name.length > 100) {
    return res.status(400).json({ message: "Invalid name: must be 3-100 characters" });
  }

  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return res.status(400).json({ message: "Invalid name: only letters and spaces allowed" });
  }

  // Validate phone (10-15 digits, allow +, -, spaces)
  if (typeof phone !== "string" || phone.length < 10 || phone.length > 15) {
    return res.status(400).json({ message: "Invalid phone: must be 10-15 characters" });
  }

  if (!/^[\d+\-\s()]+$/.test(phone)) {
    return res.status(400).json({ message: "Invalid phone: only digits, +, -, spaces, and parentheses allowed" });
  }

  // Validate service (allowed services list - must match frontend dropdown)
  const allowedServices = ["facials", "wax", "haircut", "hairspa", "pedicure", "manicure", "haircolour", "bleach", "headmassage", "bodymassage"];
  if (typeof service !== "string" || !allowedServices.includes(service)) {
    return res.status(400).json({
      message: `Invalid service. Allowed: ${allowedServices.join(", ")}`
    });
  }

  // Validate date (YYYY-MM-DD format, must be future date)
  if (typeof preferredDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
  }

  const bookingDate = new Date(preferredDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    return res.status(400).json({ message: "Booking date must be in the future" });
  }

  // Validate time (HH:MM format)
  if (typeof preferredTime !== "string" || !/^\d{2}:\d{2}$/.test(preferredTime)) {
    return res.status(400).json({ message: "Invalid time format. Use HH:MM" });
  }

  const [hours, minutes] = preferredTime.split(":").map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return res.status(400).json({ message: "Invalid time: hours must be 0-23, minutes 0-59" });
  }

  // Sanitize inputs by trimming
  req.body.name = name.trim();
  req.body.phone = phone.trim();
  req.body.service = service.trim();
  req.body.preferredDate = preferredDate.trim();
  req.body.preferredTime = preferredTime.trim();

  next();
};

/**
 * Prevents NoSQL injection in MongoDB
 */
export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  // Check all string values for suspicious patterns
  const checkValue = (value: unknown): boolean => {
    if (typeof value === "string") {
      // Block common NoSQL injection patterns
      if (value.includes("$") && (value.includes("where") || value.includes("ne") || value.includes("gt"))) {
        return false;
      }
      // Block JavaScript code patterns
      if (value.includes("function") || value.includes("eval") || value.includes("constructor")) {
        return false;
      }
    } else if (typeof value === "object" && value !== null) {
      // Check nested objects
      for (const key in value) {
        if (!checkValue((value as Record<string, unknown>)[key])) {
          return false;
        }
      }
    }
    return true;
  };

  if (!checkValue(req.body)) {
    logger.logSecurityEvent("nosql_injection_attempt", {
      ip: req.ip,
      path: req.path,
      body: req.body
    });

    return res.status(400).json({
      message: "Invalid input detected"
    });
  }

  next();
};

/**
 * Validates admin login credentials format
 */
export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;

  if (!password || typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ message: "Password is required" });
  }

  next();
};
