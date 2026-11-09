import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const party = await prisma.party.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            riotId: true,
            rank: true,
            mainRole: true,
            discordUsername: true,
            createdAt: true,
          },
        },
        _count: {
          select: { reports: true },
        },
      },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    const requestingUser = await getUserFromRequest(req);
    const isOwner = requestingUser && requestingUser.id === party.ownerId;
    const isStaff =
      requestingUser &&
      (requestingUser.role === "SUPER_ADMIN" ||
        requestingUser.role === "ADMIN" ||
        requestingUser.role === "MODERATOR");

    const now = new Date();
    const isFull = party.currentPlayers >= party.maxPlayers || party.status === "Full" || party.status === "FULL";
    const isDemo = party.partyType === "DEMO";
    const isExpired = party.status === "EXPIRED" || (party.expiresAt && new Date(party.expiresAt) <= now);

    // Mask code from public if full, demo, or expired, unless owner/staff
    let exposedCode = party.partyCode;
    if ((isFull || isDemo || isExpired) && !isOwner && !isStaff) {
      exposedCode = null;
    }

    return NextResponse.json({
      party: {
        ...party,
        partyCode: exposedCode,
        isFull: Boolean(isFull),
        isExpired: Boolean(isExpired),
      },
    });
  } catch (error) {
    console.error("Fetch party details error:", error);
    return NextResponse.json({ error: "Failed to fetch party" }, { status: 500 });
  }
}

export async function PATCH(
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

    if (party.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to edit this party." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      partyCode,
      currentPlayers,
      requiredRank,
      averageRank,
      preferredRole,
      server,
      language,
      voiceChatRequired,
      description,
      status,
      discordContact,
    } = body;

    let updatedStatus = status;
    let playersCount = currentPlayers !== undefined ? parseInt(currentPlayers, 10) : party.currentPlayers;

    // Requirement: When a party reaches 5/5 players, its status should automatically become Full.
    if (playersCount === 5 && (!updatedStatus || updatedStatus === "Looking for players")) {
      updatedStatus = "Full";
    }

    const updated = await prisma.party.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : undefined,
        partyCode: partyCode !== undefined ? partyCode : undefined,
        currentPlayers: playersCount,
        requiredRank: requiredRank !== undefined ? requiredRank : undefined,
        averageRank: averageRank !== undefined ? averageRank : undefined,
        preferredRole: preferredRole !== undefined ? preferredRole : undefined,
        server: server !== undefined ? server : undefined,
        language: language !== undefined ? language : undefined,
        voiceChatRequired: voiceChatRequired !== undefined ? Boolean(voiceChatRequired) : undefined,
        description: description !== undefined ? description : undefined,
        status: updatedStatus !== undefined ? updatedStatus : undefined,
        discordContact: discordContact !== undefined ? discordContact : undefined,
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

    return NextResponse.json({ success: true, party: updated });
  } catch (error) {
    console.error("Update party error:", error);
    return NextResponse.json({ error: "Failed to update party" }, { status: 500 });
  }
}

export async function DELETE(
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

    if (party.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this party." },
        { status: 403 }
      );
    }

    await prisma.party.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Party deleted successfully" });
  } catch (error) {
    console.error("Delete party error:", error);
    return NextResponse.json({ error: "Failed to delete party" }, { status: 500 });
  }
}
