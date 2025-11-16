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
const app = express();
const server = http.createServer(app);
app.use(cors({
    origin: env.clientOrigin,
    credentials: false
}));
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (_req, res) => {
    res.json({ name: "RINKU BEAUTY CARE API", status: "online" });
});
app.use("/api/book", publicBookingRouter);
app.use("/api/orders", adminBookingRouter);
app.use("/api/admin", adminRoute);
const start = async () => {
    try {
        await connectDatabase();
        initRealtime(server);
        server.listen(env.port, () => {
            console.log(`🚀 Server running at http://localhost:${env.port}`);
        });
    }
    catch (error) {
        console.error("Server failed to start", error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map