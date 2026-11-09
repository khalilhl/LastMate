const { execSync, spawn } = require("child_process");
const path = require("path");

console.log("==========================================");
console.log("🎮 LASTMATE — PRODUCTION STARTUP SEQUENCE");
console.log("==========================================");

const prismaBin = path.join(__dirname, "..", "node_modules", "prisma", "build", "index.js");
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");

// 1. Sync database schema (PostgreSQL)
try {
  console.log("📦 [1/3] Syncing database schema with Prisma...");
  execSync(`node "${prismaBin}" db push --skip-generate`, { stdio: "inherit" });
  console.log("✅ Database schema in sync.");
} catch (err) {
  console.error("⚠️ [Warning] Database push encountered an issue, continuing...", err.message);
}

// 2. Seed Super Admin and default configuration if not already seeded
try {
  console.log("👑 [2/3] Seeding Super Admin and site configuration...");
  execSync("node prisma/seed-admin.js", { stdio: "inherit" });
  console.log("✅ Super Admin and site settings verified.");
} catch (err) {
  console.error("⚠️ [Warning] seed-admin encountered an issue, continuing...", err.message);
}

// 3. Launch Next.js production server
const port = process.env.PORT || 3000;
console.log(`🚀 [3/3] Launching Next.js on port ${port}...`);

const nextServer = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
  stdio: "inherit",
});

nextServer.on("error", (err) => {
  console.error("Failed to start Next.js server:", err);
  process.exit(1);
});

nextServer.on("exit", (code) => {
  console.log(`Next.js server exited with code ${code}`);
  process.exit(code || 0);
});

