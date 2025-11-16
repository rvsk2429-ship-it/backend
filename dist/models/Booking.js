import { model, Schema } from "mongoose";
const bookingSchema = new Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    }
}, { timestamps: true });
export const Booking = model("Booking", bookingSchema);
//# sourceMappingURL=Booking.js.map