import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user: admin, error } = await requireAdmin(req, "MODERATOR");
  if (error || !admin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "parties";

    let csvContent = "";
    const timestamp = new Date().toISOString().split("T")[0];
    let filename = `lastmate-${type}-${timestamp}.csv`;

    if (type === "users") {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          riotId: true,
          rank: true,
          mainRole: true,
          preferredServer: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      const headers = ["ID", "Username", "Email", "RiotID", "Rank", "MainRole", "Server", "Role", "Status", "RegisteredAt", "LastLogin"];
      const rows = users.map((u) => [
        u.id,
        `"${u.username.replace(/"/g, '""')}"`,
        `"${u.email}"`,
        `"${u.riotId || ""}"`,
        u.rank,
        u.mainRole,
        `"${u.preferredServer}"`,
        u.role,
        u.status,
        u.createdAt.toISOString(),
        u.lastLoginAt ? u.lastLoginAt.toISOString() : "",
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "reports") {
      const reports = await prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          party: { select: { partyCode: true, name: true } },
          reporter: { select: { username: true } },
          resolver: { select: { username: true } },
        },
      });

      const headers = ["ID", "PartyCode", "PartyName", "Reporter", "Reason", "Details", "Status", "Resolver", "CreatedAt", "ResolvedAt"];
      const rows = reports.map((r) => [
        r.id,
        r.party?.partyCode || "",
        `"${(r.party?.name || "").replace(/"/g, '""')}"`,
        r.reporter?.username || "Anonymous",
        `"${r.reason.replace(/"/g, '""')}"`,
        `"${(r.details || "").replace(/"/g, '""')}"`,
        r.status,
        r.resolver?.username || "",
        r.createdAt.toISOString(),
        r.resolvedAt ? r.resolvedAt.toISOString() : "",
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else {
      // Parties
      const parties = await prisma.party.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { username: true, email: true } },
        },
      });

      const headers = ["ID", "PartyName", "PartyCode", "HostUsername", "Players", "RequiredRank", "AvgRank", "Server", "Role", "Status", "CopyCount", "CreatedAt"];
      const rows = parties.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.partyCode,
        p.owner?.username || "",
        `${p.currentPlayers}/${p.maxPlayers}`,
        p.requiredRank,
        p.averageRank,
        `"${p.server}"`,
        p.preferredRole,
        p.status,
        p.copyCount || 0,
        p.createdAt.toISOString(),
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    await logAdminAction({
      adminId: admin.id,
      adminName: admin.username,
      action: "ANALYTICS_CSV_EXPORT",
      targetType: "Analytics",
      details: `Exported ${type} dataset as CSV.`,
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Export CSV error:", err);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}

