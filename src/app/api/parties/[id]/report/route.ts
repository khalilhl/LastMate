import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();
    const { reason, details } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Please provide a reason for reporting." }, { status: 400 });
    }

    const party = await prisma.party.findUnique({
      where: { id: params.id },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        partyId: params.id,
        reporterId: user ? user.id : null,
        reason: reason.trim(),
        details: details?.trim() || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Report submitted. Thank you for keeping LastMate clean." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

