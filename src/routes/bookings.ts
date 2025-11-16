import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { requireAdmin, AdminRequest } from "../middleware/auth.js";
import { validateBookingInput, preventNoSQLInjection } from "../middleware/validation.js";
import { encryptData, decryptData, EncryptedData } from "../lib/encryption.js";
import { logger } from "../lib/logger.js";
import { publish } from "../lib/realtime.js";

export const publicBookingRouter = Router();
export const adminBookingRouter = Router();

/**
 * POST /api/book
 * Public endpoint to create a new booking with encrypted sensitive data
 */
publicBookingRouter.post(
  "/",
  preventNoSQLInjection,
  validateBookingInput,
  async (req, res) => {
    try {
      const { name, phone, service, preferredDate, preferredTime } = req.body;
      const ip = req.ip || req.socket.remoteAddress || "unknown";

      // Encrypt sensitive fields
      const nameEncrypted = encryptData(name);
      const phoneEncrypted = encryptData(phone);
      const serviceEncrypted = encryptData(service);

      const booking = await Booking.create({
        name_encrypted: nameEncrypted.encrypted,
        name_iv: nameEncrypted.iv,
        name_tag: nameEncrypted.tag,
        phone_encrypted: phoneEncrypted.encrypted,
        phone_iv: phoneEncrypted.iv,
        phone_tag: phoneEncrypted.tag,
        service_encrypted: serviceEncrypted.encrypted,
        service_iv: serviceEncrypted.iv,
        service_tag: serviceEncrypted.tag,
        preferredDate,
        preferredTime
      });

      logger.logBookingCreated(String(booking._id), ip);

      // Publish real-time update
      publish({
        type: "booking:new",
        data: {
          id: booking._id,
          status: booking.status,
          createdAt: booking.createdAt
        }
      });

      res.status(201).json({
        id: booking._id,
        status: booking.status,
        createdAt: booking.createdAt,
        message: "Booking created successfully"
      });
    } catch (error) {
      logger.error("Booking creation error", { error: String(error) });
      res.status(500).json({ message: "Unable to create booking" });
    }
  }
);

/**
 * GET /api/orders
 * Admin endpoint to fetch all bookings with decrypted sensitive data
 * Requires JWT authentication
 */
adminBookingRouter.get("/", requireAdmin, async (req: AdminRequest, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    // Decrypt sensitive fields for admin view
    const decryptedBookings = bookings.map((booking) => {
      const nameResult = decryptData({
        encrypted: booking.name_encrypted,
        iv: booking.name_iv,
        tag: booking.name_tag
      });

      const phoneResult = decryptData({
        encrypted: booking.phone_encrypted,
        iv: booking.phone_iv,
        tag: booking.phone_tag
      });

      const serviceResult = decryptData({
        encrypted: booking.service_encrypted,
        iv: booking.service_iv,
        tag: booking.service_tag
      });

      return {
        _id: booking._id,
        name: nameResult.success ? nameResult.data : "[Decryption Failed]",
        phone: phoneResult.success ? phoneResult.data : "[Decryption Failed]",
        service: serviceResult.success ? serviceResult.data : "[Decryption Failed]",
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });

    logger.logBookingViewed("all", req.adminId || "unknown");

    res.json(decryptedBookings);
  } catch (error) {
    logger.error("Booking retrieval error", { error: String(error) });
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

/**
 * PATCH /api/orders/:id
 * Admin endpoint to update booking status
 * Requires JWT authentication
 */
adminBookingRouter.patch("/:id", requireAdmin, async (req: AdminRequest, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !["pending", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'pending' or 'completed'" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    logger.info("Booking status updated", {
      bookingId: req.params.id,
      newStatus: status,
      adminId: req.adminId
    });

    // Decrypt for the response
    const nameResult = decryptData({
      encrypted: booking.name_encrypted,
      iv: booking.name_iv,
      tag: booking.name_tag
    });

    const phoneResult = decryptData({
      encrypted: booking.phone_encrypted,
      iv: booking.phone_iv,
      tag: booking.phone_tag
    });

    const serviceResult = decryptData({
      encrypted: booking.service_encrypted,
      iv: booking.service_iv,
      tag: booking.service_tag
    });

    // Publish real-time update
    publish({
      type: "booking:update",
      data: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });

    res.json({
      _id: booking._id,
      name: nameResult.success ? nameResult.data : "[Decryption Failed]",
      phone: phoneResult.success ? phoneResult.data : "[Decryption Failed]",
      service: serviceResult.success ? serviceResult.data : "[Decryption Failed]",
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    });
  } catch (error) {
    logger.error("Booking update error", { error: String(error) });
    res.status(500).json({ message: "Unable to update booking" });
  }
});

/**
 * DELETE /api/orders/:id
 * Admin endpoint to delete a booking
 * Requires JWT authentication
 */
adminBookingRouter.delete("/:id", requireAdmin, async (req: AdminRequest, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    logger.info("Booking deleted", {
      bookingId: req.params.id,
      adminId: req.adminId
    });

    publish({
      type: "booking:delete",
      data: {
        id: booking._id
      }
    });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    logger.error("Booking deletion error", { error: String(error) });
    res.status(500).json({ message: "Unable to delete booking" });
  }
});

