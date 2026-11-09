import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const party = await prisma.party.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        partyCode: true,
        partyType: true,
        currentPlayers: true,
        maxPlayers: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    const isFull = party.currentPlayers >= party.maxPlayers || party.status === "Full" || party.status === "FULL";
    const isDemo = party.partyType === "DEMO";
    const isExpired = party.status === "EXPIRED" || (party.expiresAt && new Date(party.expiresAt) <= new Date());

    if (isFull || isDemo || isExpired || !party.partyCode) {
      return NextResponse.json(
        { error: "Party code copying is disabled for full, demo, or expired squads." },
        { status: 403 }
      );
    }

    const updated = await prisma.party.update({
      where: { id: params.id },
      data: {
        copyCount: { increment: 1 },
      },
      select: { id: true, copyCount: true },
    });
    return NextResponse.json({ success: true, copyCount: updated.copyCount });
  } catch {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

