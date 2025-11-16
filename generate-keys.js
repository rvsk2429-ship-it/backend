#!/usr/bin/env node

/**
 * Security Key Generator
 * Generates all required security keys for the environment
 * 
 * Usage: node generate-keys.js
 */

import crypto from "crypto";
import bcryptjs from "bcryptjs";

console.log("\n🔐 Security Key Generator\n");
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

// Generate Admin Password Hash
const adminPassword = "19@HarHarMahaDev@19@19@*";
const saltRounds = 10;

bcryptjs.hash(adminPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("❌ Error generating hash:", err);
    process.exit(1);
  }

  console.log("\n4️⃣  ADMIN_PASSWORD_HASH (password: 19@HarHarMahaDev@19@19@*):");
  console.log(`   ${hash}`);

  console.log("\n" + "=".repeat(60));
  console.log("\n📋 Copy this to your .env file:\n");

  const envContent = `# ===== Security Keys (Generated) =====
JWT_SECRET=${jwtSecret}
ENCRYPTION_KEY=${encryptionKey}
ENCRYPTION_IV=${encryptionIV}
ADMIN_PASSWORD_HASH=${hash}

# ===== Other Required Variables =====
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/rinku
ADMIN_EMAIL=owner@rinku-beauty.com
ALLOWED_IPS=127.0.0.1,localhost
ENABLE_IP_WHITELIST=false
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=debug
`;

  console.log(envContent);

  console.log("=".repeat(60));
  console.log("✅ Keys generated successfully!\n");
  console.log("Next steps:");
  console.log("1. Create or update .env file with the values above");
  console.log("2. Run: npm install");
  console.log("3. Run: npm run dev\n");
});
