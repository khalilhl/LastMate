import prisma from "@/lib/prisma";
import { rotateDemoParties, cleanupExpiredPartyCodes } from "./demoService";

declare global {
  // Prevent multiple schedulers in development HMR
  var __lastmateSchedulerInitialized: boolean | undefined;
  var __lastmateSchedulerTimer: NodeJS.Timeout | undefined;
}

/**
 * Server-side background scheduler that periodically executes:
 * 1. Demo party rotation (every 15 minutes by default, configurable)
 * 2. Expired real party code cleanup (every 5 minutes by default, configurable)
 *
 * Runs automatically server-side without requiring frontend user traffic.
 */
export function startServerScheduler() {
  if (global.__lastmateSchedulerInitialized) {
    return;
  }
  global.__lastmateSchedulerInitialized = true;

  console.log("🚀 [LastMate Scheduler] Starting server-side background engine...");

  // Run an initial check 3 seconds after boot
  setTimeout(async () => {
    try {
      await runScheduledTasksTick();
    } catch (err) {
      console.error("[LastMate Scheduler] Initial boot tick error:", err);
    }
  }, 3000);

  // Poll every 60 seconds to inspect scheduled deadlines
  global.__lastmateSchedulerTimer = setInterval(async () => {
    try {
      await runScheduledTasksTick();
    } catch (err) {
      console.error("[LastMate Scheduler] Interval tick error:", err);
    }
  }, 60 * 1000);
}

/**
 * Atomic tick that checks deadlines against database settings
 */
async function runScheduledTasksTick() {
  const now = new Date();

  try {
    // 1. Check Demo Rotation
    const [demoEnabled, nextRotation, targetCount, demoCount] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "demo.enabled" } }),
      prisma.siteSetting.findUnique({ where: { key: "demo.nextRotationTime" } }),
      prisma.siteSetting.findUnique({ where: { key: "demo.targetCount" } }),
      prisma.party.count({ where: { partyType: "DEMO" } }),
    ]);

    const isDemoEnabled = demoEnabled?.value !== "false";
    const target = parseInt(targetCount?.value || "12", 10);
    const nextRotDate = nextRotation?.value ? new Date(nextRotation.value) : null;

    // Trigger if demo is enabled AND (nextRotation reached OR there are 0 demo parties currently)
    if (isDemoEnabled && (!nextRotDate || now >= nextRotDate || demoCount === 0)) {
      console.log(`[LastMate Scheduler] Rotating ${target} demo parties (now: ${now.toISOString()})...`);
      const result = await rotateDemoParties(target);
      console.log(`[LastMate Scheduler] Demo rotation complete. Created: ${result.createdCount}, Next: ${result.nextRotation}`);
    }

    // 2. Check Expired Real Party Codes Cleanup
    const [cleanupEnabled, nextCleanup] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "cleanup.autoCleanupEnabled" } }),
      prisma.siteSetting.findUnique({ where: { key: "cleanup.nextCleanupTime" } }),
    ]);

    const isCleanupEnabled = cleanupEnabled?.value !== "false";
    const nextCleanDate = nextCleanup?.value ? new Date(nextCleanup.value) : null;

    if (isCleanupEnabled && (!nextCleanDate || now >= nextCleanDate)) {
      const cleanResult = await cleanupExpiredPartyCodes();
      if (cleanResult.expiredCount > 0) {
        console.log(`[LastMate Scheduler] Expired ${cleanResult.expiredCount} real party codes. Next cleanup: ${cleanResult.nextCleanup}`);
      }
    }
  } catch (err) {
    console.error("[LastMate Scheduler] Error during scheduled task tick:", err);
  }
}

