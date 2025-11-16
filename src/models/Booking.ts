import { model, Schema } from "mongoose";

export type BookingStatus = "pending" | "completed";

export interface BookingDocument {
  _id: string;
  // Encrypted fields
  name_encrypted: string;
  name_iv: string;
  name_tag: string;
  phone_encrypted: string;
  phone_iv: string;
  phone_tag: string;
  service_encrypted: string;
  service_iv: string;
  service_tag: string;
  // Plain fields
  preferredDate: string;
  preferredTime: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    // Encrypted fields with IV and auth tag for GCM
    name_encrypted: { type: String, required: true },
    name_iv: { type: String, required: true },
    name_tag: { type: String, required: true },
    phone_encrypted: { type: String, required: true },
    phone_iv: { type: String, required: true },
    phone_tag: { type: String, required: true },
    service_encrypted: { type: String, required: true },
    service_iv: { type: String, required: true },
    service_tag: { type: String, required: true },
    // Plain fields
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Booking = model<BookingDocument>("Booking", bookingSchema);

