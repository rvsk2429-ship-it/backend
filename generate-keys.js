#!/usr/bin/env node

/**
 * Security Key Generator (SAFE VERSION)
 * Usage:
 *   node generate-keys.js "<ADMIN_PASSWORD>"
 */

import crypto from "crypto";
import bcryptjs from "bcryptjs";

// Validate password argument
const adminPassword = process.argv[2];
if (!adminPassword) {
  console.error("❌ ERROR: Provide admin password as argument");
  console.error('Usage: node generate-keys.js "MyStrongPassword123!@"');
  process.exit(1);
}

console.log("\n🔐 Security Key Generator (Safe Version)\n");
console.log("=".repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString("hex");
console.log("\n1️⃣  JWT_SECRET:");
console.log(`   ${jwtSecret}`);

// Generate Encryption Key (32 bytes for AES-256)
const encryptionKey = crypto.randomBytes(32).toString("hex");
console.log("\n2️⃣  ENCRYPTION_KEY (32 bytes):");
console.log(`   ${encryptionKey}`);

// Generate Encryption IV (16 bytes)
const encryptionIV = crypto.randomBytes(16).toString("hex");
console.log("\n3️⃣  ENCRYPTION_IV (16 bytes):");
console.log(`   ${encryptionIV}`);

const saltRounds = 10;

bcryptjs.hash(adminPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("❌ Error generating hash:", err);
    process.exit(1);
  }

  console.log("\n4️⃣  ADMIN_PASSWORD_HASH:");
  console.log(`   ${hash}`);
  console.log("\n" + "=".repeat(60));

  const envContent = `# ===== Security Keys (Generated) =====
JWT_SECRET=${jwtSecret}
ENCRYPTION_KEY=${encryptionKey}
ENCRYPTION_IV=${encryptionIV}
ADMIN_PASSWORD_HASH=${hash}

# ===== Other Required Variables =====
MONGODB_URI=
ADMIN_EMAIL=
ALLOWED_IPS=127.0.0.1,localhost
ENABLE_IP_WHITELIST=false
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=debug
`;

  console.log("\n📋 Copy this to your .env file:\n");
  console.log(envContent);

  console.log("=".repeat(60));
  console.log("✅ Keys generated successfully!\n");
});
