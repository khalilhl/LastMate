import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAdmin(req, "MODERATOR");
  if (error || !user) return error;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel counts
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      suspendedUsers,
      newUsersToday,
      totalParties,
      activeParties,
      fullParties,
      inGameParties,
      closedParties,
      totalReports,
      pendingReports,
      partiesForCopies,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "BANNED" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.party.count(),
      prisma.party.count({ where: { status: "Looking for players" } }),
      prisma.party.count({ where: { status: "Full" } }),
      prisma.party.count({ where: { status: "In Game" } }),
      prisma.party.count({ where: { status: { in: ["Closed", "Expired"] } } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.party.findMany({ select: { copyCount: true } }),
    ]);

    const totalPartyCopies = partiesForCopies.reduce((sum, p) => sum + (p.copyCount || 0), 0);

    // Registrations in the last 14 days
    const past14Days = new Date();
    past14Days.setDate(past14Days.getDate() - 13);
    past14Days.setHours(0, 0, 0, 0);

    const usersLast14Days = await prisma.user.findMany({
      where: { createdAt: { gte: past14Days } },
      select: { createdAt: true },
    });

    const partiesLast14Days = await prisma.party.findMany({
      where: { createdAt: { gte: past14Days } },
      select: { createdAt: true },
    });

    // Bucket into daily dates (YYYY-MM-DD)
    const dateBuckets: Record<string, { registrations: number; parties: number }> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(past14Days);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dateBuckets[key] = { registrations: 0, parties: 0 };
    }

    usersLast14Days.forEach((u) => {
      const key = u.createdAt.toISOString().split("T")[0];
      if (dateBuckets[key]) dateBuckets[key].registrations++;
    });

    partiesLast14Days.forEach((p) => {
      const key = p.createdAt.toISOString().split("T")[0];
      if (dateBuckets[key]) dateBuckets[key].parties++;
    });

    const registrationsByDate = Object.entries(dateBuckets).map(([date, data]) => ({
      date,
      count: data.registrations,
    }));

    const partiesByDate = Object.entries(dateBuckets).map(([date, data]) => ({
      date,
      count: data.parties,
    }));

    // Status breakdown
    const partiesByStatus = [
      { status: "Looking for players", count: activeParties },
      { status: "Full", count: fullParties },
      { status: "In Game", count: inGameParties },
      { status: "Closed", count: closedParties },
    ];

    // Popular ranks
    const rankAggregation = await prisma.party.groupBy({
      by: ["averageRank"],
      _count: { averageRank: true },
      orderBy: { _count: { averageRank: "desc" } },
      take: 6,
    });
    const partiesByRank = rankAggregation.map((r) => ({
      rank: r.averageRank,
      count: r._count.averageRank,
    }));

    // Popular servers
    const serverAggregation = await prisma.party.groupBy({
      by: ["server"],
      _count: { server: true },
      orderBy: { _count: { server: "desc" } },
      take: 6,
    });
    const partiesByServer = serverAggregation.map((s) => ({
      server: s.server.split(" ")[0],
      count: s._count.server,
    }));

    // Recent lists
    const [recentUsers, recentParties, recentReports, recentLogs] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          username: true,
          email: true,
          rank: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.party.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          owner: {
            select: { id: true, username: true, rank: true },
          },
        },
      }),
      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          party: { select: { id: true, name: true, partyCode: true } },
          reporter: { select: { id: true, username: true } },
        },
      }),
      prisma.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
        suspendedUsers,
        newUsersToday,
        totalParties,
        activeParties,
        lookingForPlayersParties: activeParties,
        fullParties,
        expiredParties: closedParties,
        totalPartyCopies,
        totalReports,
        pendingReports,
        registrationsByDate,
        partiesByDate,
        partiesByStatus,
        partiesByRank,
        partiesByServer,
      },
      recentUsers,
      recentParties,
      recentReports,
      recentLogs,
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}

