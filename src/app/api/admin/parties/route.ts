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
    const status = searchParams.get("status") || "";
    const server = searchParams.get("server") || "";
    const rank = searchParams.get("rank") || "";
    const partyType = searchParams.get("partyType") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: any = {};

    if (partyType && partyType !== "all") {
      where.partyType = partyType;
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { partyCode: { contains: q } },
        { description: { contains: q } },
        { owner: { username: { contains: q } } },
      ];
    }

    if (status && status !== "all") {
      if (status.toUpperCase() === "FULL") {
        where.status = { in: ["Full", "FULL"] };
      } else {
        where.status = status;
      }
    }

    if (server && server !== "all") {
      where.server = { contains: server.split(" ")[0] };
    }

    if (rank && rank !== "all") {
      where.OR = [
        { requiredRank: { contains: rank } },
        { averageRank: { contains: rank } },
      ];
    }

    const orderBy: any = {};
    if (["createdAt", "updatedAt", "name", "currentPlayers", "copyCount"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [total, parties] = await Promise.all([
      prisma.party.count({ where }),
      prisma.party.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
              rank: true,
              role: true,
              status: true,
            },
          },
          _count: {
            select: {
              reports: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      parties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin parties GET error:", err);
    return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const body = await req.json();
    const {
      partyId,
      partyIds,
      bulkAction,
      name,
      partyCode,
      currentPlayers,
      maxPlayers,
      requiredRank,
      averageRank,
      preferredRole,
      server,
      status,
      description,
      expiresAt,
    } = body;

    // Handle Bulk Actions
    if (partyIds && Array.isArray(partyIds) && bulkAction) {
      if (bulkAction === "close") {
        await prisma.party.updateMany({
          where: { id: { in: partyIds } },
          data: { status: "Closed", closedAt: new Date() },
        });
      } else if (bulkAction === "reopen") {
        await prisma.party.updateMany({
          where: { id: { in: partyIds } },
          data: { status: "Looking for players", closedAt: null },
        });
      } else if (bulkAction === "delete") {
        await prisma.party.deleteMany({
          where: { id: { in: partyIds } },
        });
      }

      await logAdminAction({
        adminId: admin.id,
        adminName: admin.username,
        action: `PARTY_BULK_${bulkAction.toUpperCase()}`,
        targetType: "Party",
        details: `Bulk ${bulkAction} on ${partyIds.length} parties.`,
      });

      return NextResponse.json({ success: true, message: `Bulk action '${bulkAction}' completed.` });
    }

    if (!partyId) {
      return NextResponse.json({ error: "Party ID is required" }, { status: 400 });
    }

    const targetParty = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!targetParty) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (partyCode !== undefined) updateData.partyCode = partyCode.trim();
    if (currentPlayers !== undefined) updateData.currentPlayers = parseInt(currentPlayers, 10);
    if (maxPlayers !== undefined) updateData.maxPlayers = parseInt(maxPlayers, 10);
    if (requiredRank !== undefined) updateData.requiredRank = requiredRank;
    if (averageRank !== undefined) updateData.averageRank = averageRank;
    if (preferredRole !== undefined) updateData.preferredRole = preferredRole;
    if (server !== undefined) updateData.server = server;
    if (description !== undefined) updateData.description = description;
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    if (status !== undefined) {
      updateData.status = status;
      if (status === "Closed" || status === "Expired") {
        updateData.closedAt = new Date();
      } else if (status === "Looking for players") {
        updateData.closedAt = null;
      }
    }

    const updated = await prisma.party.update({
      where: { id: partyId },
      data: updateData,
      include: {
        owner: {
          select: { id: true, username: true, rank: true },
        },
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "PARTY_UPDATE",
      targetType: "Party",
      targetId: updated.id,
      details: {
        partyCode: updated.partyCode,
        changes: updateData,
      },
    });

    return NextResponse.json({ success: true, party: updated });
  } catch (err) {
    console.error("Admin party PATCH error:", err);
    return NextResponse.json({ error: "Failed to update party" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const partyId = searchParams.get("partyId");

    if (!partyId) {
      return NextResponse.json({ error: "Party ID is required" }, { status: 400 });
    }

    const targetParty = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!targetParty) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    await prisma.party.delete({
      where: { id: partyId },
    });

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "PARTY_DELETE",
      targetType: "Party",
      targetId: partyId,
      details: `Deleted party '${targetParty.name}' (Code: ${targetParty.partyCode})`,
    });

    return NextResponse.json({ success: true, message: "Party deleted permanently" });
  } catch (err) {
    console.error("Admin party DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete party" }, { status: 500 });
  }
}

