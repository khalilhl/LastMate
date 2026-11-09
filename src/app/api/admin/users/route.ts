import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const rank = searchParams.get("rank") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: any = {};

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { username: { contains: q } },
        { email: { contains: q } },
        { riotId: { contains: q } },
      ];
    }

    if (role && role !== "all") {
      where.role = role;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (rank && rank !== "all") {
      where.rank = { contains: rank };
    }

    const orderBy: any = {};
    if (["createdAt", "username", "rank", "role", "status", "lastLoginAt"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          riotId: true,
          rank: true,
          mainRole: true,
          preferredServer: true,
          languages: true,
          discordUsername: true,
          bio: true,
          role: true,
          status: true,
          banReason: true,
          suspendedUntil: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              parties: true,
              reports: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin users GET error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const {
      userId,
      username,
      email,
      riotId,
      rank,
      mainRole,
      preferredServer,
      role,
      status,
      banReason,
      suspendedUntil,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Role Change Permissions Check
    if (role && role !== targetUser.role) {
      if (admin.role !== "SUPER_ADMIN" && (role === "ADMIN" || role === "SUPER_ADMIN" || targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN")) {
        return NextResponse.json(
          { error: "Only a Super Admin can promote to or modify Admin/Super Admin roles." },
          { status: 403 }
        );
      }
      if (admin.role === "MODERATOR") {
        return NextResponse.json(
          { error: "Moderators do not have permission to alter user roles." },
          { status: 403 }
        );
      }
    }

    // Protection: Cannot ban or demote another Super Admin unless you are Super Admin
    if (targetUser.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You cannot modify a Super Administrator account." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (riotId !== undefined) updateData.riotId = riotId.trim() || null;
    if (rank !== undefined) updateData.rank = rank;
    if (mainRole !== undefined) updateData.mainRole = mainRole;
    if (preferredServer !== undefined) updateData.preferredServer = preferredServer;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (banReason !== undefined) updateData.banReason = banReason;
    if (suspendedUntil !== undefined) {
      updateData.suspendedUntil = suspendedUntil ? new Date(suspendedUntil) : null;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Write audit log
    let logAction = "USER_UPDATE";
    if (status === "BANNED" && targetUser.status !== "BANNED") logAction = "USER_BAN";
    else if (status === "ACTIVE" && targetUser.status === "BANNED") logAction = "USER_UNBAN";
    else if (status === "SUSPENDED" && targetUser.status !== "SUSPENDED") logAction = "USER_SUSPEND";
    else if (role && role !== targetUser.role) logAction = "USER_ROLE_CHANGE";

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: logAction,
      targetType: "User",
      targetId: updated.id,
      details: {
        targetUsername: updated.username,
        changes: updateData,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("Admin user PATCH error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "ADMIN");
  if (error || !admin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete a Super Admin account." },
        { status: 403 }
      );
    }

    if (targetUser.id === admin.id) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "USER_DELETE",
      targetType: "User",
      targetId: userId,
      details: `Deleted user ${targetUser.username} (${targetUser.email})`,
    });

    return NextResponse.json({ success: true, message: "User deleted permanently" });
  } catch (err) {
    console.error("Admin user DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

