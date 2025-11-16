import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/auth.js";
const router = Router();
const loginLimiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMaxAttempts,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Try again later." }
});
router.post("/login", loginLimiter, async (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    const isValid = await bcrypt.compare(password, env.adminPasswordHash);
    if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ adminId: "owner" }, env.jwtSecret, { expiresIn: "2h" });
    res.json({ token, expiresIn: 2 * 60 * 60 });
});
router.get("/me", requireAdmin, (req, res) => {
    res.json({ id: "owner", role: "admin" });
});
export default router;
//# sourceMappingURL=admin.js.map