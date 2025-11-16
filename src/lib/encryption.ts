import crypto from "crypto";
import { env } from "../config/env.js";

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export interface DecryptedResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Encrypts sensitive data using AES-256-GCM
 */
export const encryptData = (plaintext: string): EncryptedData => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      env.encryptionAlgorithm as any,
      Buffer.from(env.encryptionKey, "hex"),
      iv
    );

    let encrypted = cipher.update(plaintext, "utf-8", "hex");
    encrypted += cipher.final("hex");
    const tag = (cipher as any).getAuthTag();

    console.debug(`Encrypted data of length ${plaintext.length}`);

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex")
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypts data encrypted with AES-256-GCM
 */
export const decryptData = (encryptedData: EncryptedData): DecryptedResult => {
  try {
    const decipher = crypto.createDecipheriv(
      env.encryptionAlgorithm as any,
      Buffer.from(env.encryptionKey, "hex"),
      Buffer.from(encryptedData.iv, "hex")
    );

    (decipher as any).setAuthTag(Buffer.from(encryptedData.tag, "hex"));

    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    console.debug("Data decrypted successfully");

    return {
      success: true,
      data: decrypted
    };
  } catch (error) {
    console.error("Decryption failed:", error);
    return {
      success: false,
      error: "Failed to decrypt data"
    };
  }
};

/**
 * Generates a random encryption key (32 bytes for AES-256)
 */
export const generateEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generates a random IV (16 bytes)
 */
export const generateEncryptionIV = (): string => {
  return crypto.randomBytes(16).toString("hex");
};
