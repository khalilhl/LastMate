import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import {
  rotateDemoParties,
  cleanupExpiredPartyCodes,
  deleteAllDemoParties,
  getDemoAndExpirationStats,
} from "@/lib/demoService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/demo
 * Returns stats, configuration, list of demo parties, and list of expired real parties
 */
export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "ADMIN");
  if (error || !admin) return error;

  try {
    const stats = await getDemoAndExpirationStats();

    // Fetch active demo parties
    const demoParties = await prisma.party.findMany({
      where: { partyType: "DEMO" },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    // Fetch recently expired real parties (last 25)
    const expiredRealParties = await prisma.party.findMany({
      where: {
        partyType: "REAL",
        OR: [
          { status: "EXPIRED" },
          { expiresAt: { lte: new Date() } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 25,
      include: {
        owner: {
          select: { id: true, username: true, email: true, rank: true },
        },
      },
    });

    return NextResponse.json({
      stats,
      demoParties,
      expiredRealParties,
    });
  } catch (err) {
    console.error("Admin Demo GET error:", err);
    return NextResponse.json(
      { error: "Failed to load demo & expiration data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/demo
 * Handles Super Admin actions: rotate, delete demo, cleanup expired, update settings
 */
export async function POST(req: NextRequest) {
  // Critical operation: Requires SUPER_ADMIN
  const { user: admin, error } = await requireAdmin(req, "SUPER_ADMIN");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const { action, settings } = body;

    switch (action) {
      case "rotate_now": {
        const targetSetting = await prisma.siteSetting.findUnique({
          where: { key: "demo.targetCount" },
        });
        const target = parseInt(targetSetting?.value || "12", 10);
        const result = await rotateDemoParties(target);

        await logAdminAction({
          adminId: admin.id,
          adminName: admin.username,
          action: "DEMO_ROTATE",
          targetType: "Party",
          targetId: "DEMO_BATCH",
          details: `Manually rotated demo parties. Created ${result.createdCount} new 5/5 squads.`,
        });

        return NextResponse.json({
          success: true,
          message: `Successfully rotated demo parties. Generated ${result.createdCount} active 5/5 squads.`,
          result,
        });
      }

      case "delete_all_demo": {
        const deletedCount = await deleteAllDemoParties();

        await logAdminAction({
          adminId: admin.id,
          adminName: admin.username,
          action: "DEMO_DELETE_ALL",
          targetType: "Party",
          targetId: "DEMO_BATCH",
          details: `Deleted all ${deletedCount} demo parties.`,
        });

        return NextResponse.json({
          success: true,
          message: `Deleted all ${deletedCount} demo parties from database.`,
          deletedCount,
        });
      }

      case "cleanup_expired_now": {
        const cleanResult = await cleanupExpiredPartyCodes();

        await logAdminAction({
          adminId: admin.id,
          adminName: admin.username,
          action: "PARTY_EXPIRE_CLEANUP",
          targetType: "Party",
          targetId: "REAL_EXPIRED_BATCH",
          details: `Manually executed cleanup: expired ${cleanResult.expiredCount} real party codes.`,
        });

        return NextResponse.json({
          success: true,
          message: `Cleanup finished. Masked/nullified ${cleanResult.expiredCount} expired real party codes.`,
          result: cleanResult,
        });
      }

      case "update_settings": {
        if (!settings || typeof settings !== "object") {
          return NextResponse.json(
            { error: "Invalid settings payload" },
            { status: 400 }
          );
        }

        const allowedKeys = [
          "demo.enabled",
          "demo.targetCount",
          "demo.rotationIntervalMinutes",
          "cleanup.autoCleanupEnabled",
          "cleanup.intervalMinutes",
        ];

        for (const key of allowedKeys) {
          if (settings[key] !== undefined) {
            await prisma.siteSetting.upsert({
              where: { key },
              update: { value: String(settings[key]) },
              create: {
                key,
                value: String(settings[key]),
              },
            });
          }
        }

        await logAdminAction({
          adminId: admin.id,
          adminName: admin.username,
          action: "SETTINGS_UPDATE",
          targetType: "SiteSetting",
          targetId: "DEMO_SETTINGS",
          details: `Updated demo & expiration configuration: ${JSON.stringify(settings)}`,
        });

        const updatedStats = await getDemoAndExpirationStats();

        return NextResponse.json({
          success: true,
          message: "Demo and expiration settings saved successfully.",
          stats: updatedStats,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: "${action}"` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Admin Demo POST error:", err);
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    );
  }
}
