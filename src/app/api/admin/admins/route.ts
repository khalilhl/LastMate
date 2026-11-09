import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "SUPER_ADMIN");
  if (error || !admin) return error;

  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN", "MODERATOR"] },
      },
      orderBy: { role: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        rank: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            adminLogs: true,
            resolvedReports: true,
          },
        },
      },
    });

    return NextResponse.json({ staff });
  } catch (err) {
    console.error("Admins GET error:", err);
    return NextResponse.json({ error: "Failed to fetch administrators" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "SUPER_ADMIN");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and new role are required" }, { status: 400 });
    }

    if (!["SUPER_ADMIN", "ADMIN", "MODERATOR", "USER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.id === admin.id && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot demote your own Super Admin account." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "ADMIN_ROLE_CHANGE",
      targetType: "User",
      targetId: userId,
      details: `Role of ${targetUser.username} changed from ${targetUser.role} to ${role} by ${admin.username}`,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `User ${updated.username} updated to ${role}`,
    });
  } catch (err) {
    console.error("Admins POST error:", err);
    return NextResponse.json({ error: "Failed to update staff role" }, { status: 500 });
  }
}

