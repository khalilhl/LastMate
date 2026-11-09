import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const settingsList = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "ADMIN");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
    }

    // Critical settings: only SUPER_ADMIN can toggle maintenance mode or change allowed roles
    const isSuperAdmin = admin.role === "SUPER_ADMIN";
    const criticalKeys = ["general.maintenanceMode", "user.allowedRoles"];

    for (const key of criticalKeys) {
      if (settings[key] !== undefined && !isSuperAdmin) {
        return NextResponse.json(
          { error: `Modifying '${key}' requires Super Administrator rank.` },
          { status: 403 }
        );
      }
    }

    const updatedKeys: string[] = [];
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
        updatedKeys.push(key);
      }
    }

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "SETTINGS_UPDATE",
      targetType: "Setting",
      details: {
        updatedCount: updatedKeys.length,
        keys: updatedKeys,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${updatedKeys.length} settings updated successfully.`,
    });
  } catch (err) {
    console.error("Settings POST error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

