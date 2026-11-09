import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const party = await prisma.party.findUnique({
      where: { id: params.id },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    const isStaff =
      user.role === "SUPER_ADMIN" ||
      user.role === "ADMIN" ||
      user.role === "MODERATOR";

    if (party.ownerId !== user.id && !isStaff) {
      return NextResponse.json(
        { error: "Only the party leader can refresh this party code." },
        { status: 403 }
      );
    }

    if (party.partyType === "DEMO") {
      return NextResponse.json(
        { error: "Demo parties cannot be refreshed." },
        { status: 400 }
      );
    }

    let newCode = party.partyCode;
    try {
      const body = await req.json();
      if (body.partyCode && typeof body.partyCode === "string" && body.partyCode.trim()) {
        newCode = body.partyCode.trim();
      }
    } catch {
      // Empty body is acceptable if keeping current code
    }

    if (!newCode) {
      return NextResponse.json(
        { error: "A valid in-game VALORANT party code is required to refresh this party." },
        { status: 400 }
      );
    }

    // Reset 60-minute expiration from now
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    let nextStatus = party.status;
    if (nextStatus === "EXPIRED" || nextStatus === "Closed") {
      nextStatus = party.currentPlayers >= party.maxPlayers ? "Full" : "Looking for players";
    }

    const updated = await prisma.party.update({
      where: { id: params.id },
      data: {
        partyCode: newCode,
        expiresAt,
        status: nextStatus,
        closedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            riotId: true,
            rank: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Party code refreshed! Valid for the next 60 minutes.",
      party: updated,
    });
  } catch (error) {
    console.error("Refresh party code error:", error);
    return NextResponse.json(
      { error: "Failed to refresh party code" },
      { status: 500 }
    );
  }
}

