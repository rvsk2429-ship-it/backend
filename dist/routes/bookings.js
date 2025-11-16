import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { requireAdmin } from "../middleware/auth.js";
import { publish } from "../lib/realtime.js";
export const publicBookingRouter = Router();
export const adminBookingRouter = Router();
publicBookingRouter.post("/", async (req, res) => {
    try {
        const booking = await Booking.create({
            name: req.body.name,
            phone: req.body.phone,
            service: req.body.service,
            preferredDate: req.body.preferredDate,
            preferredTime: req.body.preferredTime
        });
        publish({ type: "booking:new", data: booking });
        res.status(201).json({
            id: booking._id,
            status: booking.status,
            createdAt: booking.createdAt
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to create booking" });
    }
});
adminBookingRouter.get("/", requireAdmin, async (_req, res) => {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
});
adminBookingRouter.patch("/:id", requireAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        publish({ type: "booking:update", data: booking });
        res.json(booking);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to update booking" });
    }
});

adminBookingRouter.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        publish({
            type: 'booking:delete',
            data: { id: booking._id }
        });

        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to delete booking' });
    }
});
//# sourceMappingURL=bookings.js.map