import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ announcements });
  } catch (err) {
    console.error("Announcements GET error:", err);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "ADMIN");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const { title, content, type = "INFO", isActive = true, startDate, endDate } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const created = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type,
        isActive: Boolean(isActive),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: admin.username,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "CONTENT_CREATE",
      targetType: "Announcement",
      targetId: created.id,
      details: `Created ${type} announcement: "${title}"`,
    });

    return NextResponse.json({ success: true, announcement: created }, { status: 201 });
  } catch (err) {
    console.error("Announcement POST error:", err);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "ADMIN");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const { id, title, content, type, isActive, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (type !== undefined) updateData.type = type;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    const updated = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "CONTENT_UPDATE",
      targetType: "Announcement",
      targetId: id,
      details: { updatedFields: updateData },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (err) {
    console.error("Announcement PATCH error:", err);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "ADMIN");
  if (error || !admin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    const target = await prisma.announcement.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "CONTENT_DELETE",
      targetType: "Announcement",
      targetId: id,
      details: `Deleted announcement: "${target.title}"`,
    });

    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    console.error("Announcement DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}

