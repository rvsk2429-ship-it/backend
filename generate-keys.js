#!/usr/bin/env node

/**
 * Security Key Generator (SAFE VERSION)
 * Usage:
 *   node generate-keys.js "<ADMIN_PASSWORD>"
 */

import crypto from "crypto";
import bcryptjs from "bcryptjs";
import readline from "readline";

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

<<<<<<< HEAD
=======
// Generate Admin Password Hash
>>>>>>> 1895e87 (fix: backend updates implemented)
const saltRounds = 10;

async function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;

  return await new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Enter admin password (will not be stored): ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

(async () => {
  const adminPassword = await getAdminPassword();
  if (!adminPassword) {
    console.error("❌ No admin password provided. Set ADMIN_PASSWORD env var or provide it interactively.");
    process.exit(1);
  }

<<<<<<< HEAD
  console.log("\n4️⃣  ADMIN_PASSWORD_HASH:");
  console.log(`   ${hash}`);
  console.log("\n" + "=".repeat(60));
=======
  bcryptjs.hash(adminPassword, saltRounds, (err, hash) => {
    if (err) {
      console.error("❌ Error generating hash:", err);
      process.exit(1);
    }

    console.log("\n4️⃣  ADMIN_PASSWORD_HASH (admin password provided; hash shown below):");
    console.log(`   ${hash}`);
>>>>>>> 1895e87 (fix: backend updates implemented)

    console.log("\n" + "=".repeat(60));
    console.log("\n📋 Copy this to your .env file:\n");

    const envContent = `# ===== Security Keys (Generated) =====
JWT_SECRET=${jwtSecret}
ENCRYPTION_KEY=${encryptionKey}
ENCRYPTION_IV=${encryptionIV}
ADMIN_PASSWORD_HASH=${hash}

# ===== Other Required Variables =====
<<<<<<< HEAD
MONGODB_URI=
ADMIN_EMAIL=
=======
MONGODB_URI=your-mongodb-uri
ADMIN_EMAIL=owner@example.com
>>>>>>> 1895e87 (fix: backend updates implemented)
ALLOWED_IPS=127.0.0.1,localhost
ENABLE_IP_WHITELIST=false
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=debug
`;

<<<<<<< HEAD
  console.log("\n📋 Copy this to your .env file:\n");
  console.log(envContent);

  console.log("=".repeat(60));
  console.log("✅ Keys generated successfully!\n");
});
=======
    console.log(envContent);

    console.log("=".repeat(60));
    console.log("✅ Keys generated successfully!\n");
    console.log("Next steps:");
    console.log("1. Create or update .env file with the values above");
    console.log("2. Run: npm install");
    console.log("3. Run: npm run dev\n");
  });
})();
>>>>>>> 1895e87 (fix: backend updates implemented)
