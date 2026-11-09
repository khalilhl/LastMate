import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { riotId, rank, mainRole, preferredServer, languages, discordUsername, bio } = body;

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        riotId: riotId !== undefined ? riotId : undefined,
        rank: rank || undefined,
        mainRole: mainRole || undefined,
        preferredServer: preferredServer || undefined,
        languages: languages || undefined,
        discordUsername: discordUsername !== undefined ? discordUsername : undefined,
        bio: bio !== undefined ? bio : undefined,
      },
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
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
