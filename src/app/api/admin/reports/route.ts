import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const reason = searchParams.get("reason") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (reason && reason !== "all") {
      where.reason = { contains: reason };
    }

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          party: {
            include: {
              owner: {
                select: { id: true, username: true, email: true, rank: true, status: true },
              },
            },
          },
          reporter: {
            select: { id: true, username: true, email: true, rank: true },
          },
          resolver: {
            select: { id: true, username: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin reports GET error:", err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const { reportId, status, moderatorNotes, actionOnParty, actionOnHost, banReason } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        party: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Optional direct moderation actions
    if (actionOnParty === "delete" && report.partyId) {
      await prisma.party.delete({ where: { id: report.partyId } }).catch(() => {});
      await logAdminAction({
        adminId: admin.id,
        adminName: admin.username,
        action: "REPORT_PARTY_REMOVED",
        targetType: "Party",
        targetId: report.partyId,
        details: `Party removed via moderation report ${reportId}`,
      });
    } else if (actionOnParty === "close" && report.partyId) {
      await prisma.party.update({
        where: { id: report.partyId },
        data: { status: "Closed", closedAt: new Date() },
      }).catch(() => {});
    }

    if (actionOnHost === "ban" && report.party?.ownerId) {
      await prisma.user.update({
        where: { id: report.party.ownerId },
        data: {
          status: "BANNED",
          banReason: banReason || `Violated rules on party: ${report.reason}`,
        },
      }).catch(() => {});
      await logAdminAction({
        adminId: admin.id,
        adminName: admin.username,
        action: "REPORT_HOST_BANNED",
        targetType: "User",
        targetId: report.party.ownerId,
        details: `Host banned via report ${reportId}`,
      });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: status || "RESOLVED",
        moderatorNotes: moderatorNotes !== undefined ? moderatorNotes : report.moderatorNotes,
        resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? new Date() : null,
        resolverId: admin.id,
      },
      include: {
        party: {
          include: {
            owner: { select: { id: true, username: true, email: true } },
          },
        },
        reporter: { select: { id: true, username: true } },
        resolver: { select: { id: true, username: true } },
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "REPORT_STATUS_CHANGE",
      targetType: "Report",
      targetId: reportId,
      details: `Report status set to ${updated.status}. Notes: ${moderatorNotes || "None"}`,
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (err) {
    console.error("Admin report PATCH error:", err);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

