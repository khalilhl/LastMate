import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        parties: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        reports: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        adminLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            parties: true,
            reports: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Also get reports filed AGAINST parties owned by this user
    const reportsAgainstUser = await prisma.report.findMany({
      where: {
        party: {
          ownerId: params.id,
        },
      },
      include: {
        party: { select: { name: true, partyCode: true } },
        reporter: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    return NextResponse.json({
      user,
      reportsAgainstUser,
    });
  } catch (err) {
    console.error("Admin user details GET error:", err);
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
  }
}

