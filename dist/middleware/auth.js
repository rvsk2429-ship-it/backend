import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const requireAdmin = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.adminId = decoded.adminId;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
//# sourceMappingURL=auth.js.map